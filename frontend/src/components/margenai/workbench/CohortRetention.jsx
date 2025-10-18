import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Download as DownloadIcon,
  TableChart as TableIcon,
  ShowChart as ChartIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { scaleLinear, scaleOrdinal } from '@visx/scale';
import { Group } from '@visx/group';
import { HeatmapRect } from '@visx/heatmap';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { LinePath } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';

const CohortRetention = ({ onRefresh }) => {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('heatmap');
  const [kpis, setKpis] = useState({
    totalCohorts: 0,
    avgFirstMonthRetention: 0,
    avgThreeMonthRetention: 0,
    avgSixMonthRetention: 0,
    bestPerformingCohort: '',
    worstPerformingCohort: '',
  });
  const [retentionMatrix, setRetentionMatrix] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/margen/analytics/cohort-retention');
      setData(response.data.cohorts || []);
      setKpis(response.data.kpis || {});
      setRetentionMatrix(response.data.retentionMatrix || []);
    } catch (err) {
      setError('Failed to load cohort retention data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Cohort Retention Heatmap
  const RetentionHeatmap = ({ matrix }) => {
    const width = 900;
    const height = 500;
    const margin = { top: 60, left: 120, right: 40, bottom: 60 };
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const cohorts = [...new Set(matrix.map(d => d.cohort))];
    const periods = [...new Set(matrix.map(d => d.period))];

    const xScale = scaleLinear({
      domain: [0, periods.length],
      range: [0, innerWidth],
    });

    const yScale = scaleLinear({
      domain: [0, cohorts.length],
      range: [0, innerHeight],
    });

    const colorScale = scaleLinear({
      domain: [0, 100],
      range: ['#ffebee', theme.palette.success.main],
    });

    const cellWidth = innerWidth / periods.length;
    const cellHeight = innerHeight / cohorts.length;

    return (
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          {matrix.map((cell, i) => {
            const cohortIndex = cohorts.indexOf(cell.cohort);
            const periodIndex = periods.indexOf(cell.period);
            
            return (
              <Group key={i}>
                <rect
                  x={xScale(periodIndex)}
                  y={yScale(cohortIndex)}
                  width={cellWidth - 2}
                  height={cellHeight - 2}
                  fill={colorScale(cell.retention)}
                  rx={2}
                />
                <text
                  x={xScale(periodIndex) + cellWidth / 2}
                  y={yScale(cohortIndex) + cellHeight / 2}
                  fill={cell.retention > 50 ? 'white' : 'black'}
                  fontSize={11}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontWeight={500}
                >
                  {cell.retention.toFixed(0)}%
                </text>
              </Group>
            );
          })}
          
          {/* Y-axis labels (cohorts) */}
          {cohorts.map((cohort, i) => (
            <text
              key={`cohort-${i}`}
              x={-10}
              y={yScale(i) + cellHeight / 2}
              fill={theme.palette.text.primary}
              fontSize={12}
              textAnchor="end"
              dominantBaseline="middle"
            >
              {cohort}
            </text>
          ))}
          
          {/* X-axis labels (periods) */}
          {periods.map((period, i) => (
            <text
              key={`period-${i}`}
              x={xScale(i) + cellWidth / 2}
              y={innerHeight + 20}
              fill={theme.palette.text.primary}
              fontSize={12}
              textAnchor="middle"
            >
              Month {period}
            </text>
          ))}
          
          {/* Title */}
          <text
            x={innerWidth / 2}
            y={-30}
            fill={theme.palette.text.primary}
            fontSize={16}
            fontWeight={600}
            textAnchor="middle"
          >
            Cohort Retention Analysis
          </text>
        </Group>
      </svg>
    );
  };

  // Retention Curves
  const RetentionCurves = ({ data }) => {
    const width = 800;
    const height = 400;
    const margin = { top: 20, left: 60, right: 20, bottom: 60 };
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const periods = [...new Set(data.map(d => d.period))].sort((a, b) => a - b);
    const cohorts = [...new Set(data.map(d => d.cohort))];

    const xScale = scaleLinear({
      domain: [0, Math.max(...periods)],
      range: [0, innerWidth],
    });

    const yScale = scaleLinear({
      domain: [0, 100],
      range: [innerHeight, 0],
    });

    const colorScale = scaleOrdinal({
      domain: cohorts,
      range: [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.error.main,
        theme.palette.info.main,
      ],
    });

    return (
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          {cohorts.map((cohort, i) => {
            const cohortData = data
              .filter(d => d.cohort === cohort)
              .sort((a, b) => a.period - b.period);
            
            return (
              <LinePath
                key={cohort}
                data={cohortData}
                x={d => xScale(d.period)}
                y={d => yScale(d.retention)}
                stroke={colorScale(cohort)}
                strokeWidth={2}
                curve={curveMonotoneX}
              />
            );
          })}
          
          <AxisBottom
            scale={xScale}
            top={innerHeight}
            label="Months Since First Purchase"
          />
          <AxisLeft
            scale={yScale}
            label="Retention Rate (%)"
          />
        </Group>
      </svg>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
        <Button onClick={fetchData} sx={{ ml: 2 }}>Retry</Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Total Cohorts
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {kpis.totalCohorts}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Month 1 Retention
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {kpis.avgFirstMonthRetention.toFixed(1)}%
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Month 3 Retention
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {kpis.avgThreeMonthRetention.toFixed(1)}%
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Month 6 Retention
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {kpis.avgSixMonthRetention.toFixed(1)}%
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Best Cohort
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {kpis.bestPerformingCohort}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Worst Cohort
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'error.main' }}>
                  {kpis.worstPerformingCohort}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* View Mode Toggle */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="heatmap">
              <TableIcon sx={{ mr: 1 }} fontSize="small" />
              Heatmap
            </ToggleButton>
            <ToggleButton value="curves">
              <ChartIcon sx={{ mr: 1 }} fontSize="small" />
              Curves
            </ToggleButton>
          </ToggleButtonGroup>
          
          <Button
            startIcon={<DownloadIcon />}
            variant="outlined"
            size="small"
          >
            Export
          </Button>
        </Stack>
      </Paper>

      {/* Visualization Area */}
      <Paper sx={{ p: 3, overflow: 'auto' }}>
        {viewMode === 'heatmap' ? (
          <RetentionHeatmap matrix={retentionMatrix} />
        ) : (
          <RetentionCurves data={retentionMatrix} />
        )}
      </Paper>
    </Box>
  );
};

export default CohortRetention;