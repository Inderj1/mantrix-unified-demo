import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton,
  useTheme,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  ShowChart as ChartIcon,
  TableChart as TableIcon,
  DonutLarge as DonutIcon,
  WaterfallChart as WaterfallIcon,
} from '@mui/icons-material';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import axios from 'axios';
import { scaleLinear, scaleOrdinal, scaleBand } from '@visx/scale';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { LinePath, Line, Area } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Grid as VisxGrid } from '@visx/grid';
import { Pie } from '@visx/shape';
import { Text } from '@visx/text';
import { ParentSize } from '@visx/responsive';
import { LegendOrdinal } from '@visx/legend';
import { Sankey } from '@visx/sankey';

const columnHelper = createColumnHelper();

const ABCAnalysis = ({ onRefresh }) => {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([{ id: 'cumulative_revenue_percentage', desc: false }]);
  const [expanded, setExpanded] = useState({});
  const [viewMode, setViewMode] = useState('table');
  const [kpis, setKpis] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    aClassCount: 0,
    bClassCount: 0,
    cClassCount: 0,
    aClassRevenue: 0,
    bClassRevenue: 0,
    cClassRevenue: 0,
  });
  const [sankeyData, setSankeyData] = useState(null);

  // Fetch ABC data from backend
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/margen/analytics/abc-analysis');
      setData(response.data.customers || []);
      setKpis(response.data.kpis || {});
      setSankeyData(response.data.sankeyData || null);
    } catch (err) {
      setError('Failed to load ABC analysis data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get ABC class info
  const getClassInfo = (className) => {
    const classes = {
      'A': { color: 'success', description: 'Top 20% of customers generating 80% of revenue', icon: '⭐' },
      'B': { color: 'warning', description: 'Next 30% of customers generating 15% of revenue', icon: '📊' },
      'C': { color: 'info', description: 'Bottom 50% of customers generating 5% of revenue', icon: '📈' },
    };
    return classes[className] || { color: 'default', description: className, icon: '•' };
  };

  // Define columns for TanStack Table
  const columns = useMemo(
    () => [
      columnHelper.accessor('rank', {
        header: 'Rank',
        cell: info => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            #{info.getValue()}
          </Typography>
        ),
      }),
      columnHelper.accessor('customer_id', {
        header: 'Customer ID',
        cell: info => (
          <Stack direction="row" alignItems="center" spacing={1}>
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {info.getValue()}
            </Typography>
          </Stack>
        ),
      }),
      columnHelper.accessor('customer_name', {
        header: 'Customer Name',
        cell: info => (
          <Typography variant="body2">{info.getValue()}</Typography>
        ),
      }),
      columnHelper.accessor('abc_class', {
        header: 'ABC Class',
        cell: info => {
          const className = info.getValue();
          const classInfo = getClassInfo(className);
          return (
            <Tooltip title={classInfo.description}>
              <Chip 
                label={`Class ${className}`} 
                size="small" 
                color={classInfo.color}
                icon={<Typography sx={{ ml: 0.5 }}>{classInfo.icon}</Typography>}
              />
            </Tooltip>
          );
        },
      }),
      columnHelper.accessor('total_revenue', {
        header: 'Total Revenue',
        cell: info => (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            ${info.getValue()?.toLocaleString() || 0}
          </Typography>
        ),
      }),
      columnHelper.accessor('revenue_percentage', {
        header: '% of Total',
        cell: info => {
          const percentage = info.getValue();
          return (
            <Stack spacing={0.5}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {percentage?.toFixed(2)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(percentage * 10, 100)} 
                sx={{ height: 4, borderRadius: 2 }}
                color={percentage > 10 ? 'success' : percentage > 5 ? 'warning' : 'info'}
              />
            </Stack>
          );
        },
      }),
      columnHelper.accessor('cumulative_revenue_percentage', {
        header: 'Cumulative %',
        cell: info => {
          const percentage = info.getValue();
          return (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {percentage?.toFixed(1)}%
              </Typography>
              {percentage <= 80 && (
                <TrendingUpIcon fontSize="small" color="success" />
              )}
            </Stack>
          );
        },
      }),
      columnHelper.accessor('total_profit', {
        header: 'Total Profit',
        cell: info => {
          const profit = info.getValue() || 0;
          const isPositive = profit >= 0;
          return (
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500,
                color: isPositive ? 'success.main' : 'error.main'
              }}
            >
              ${Math.abs(profit).toLocaleString()}
            </Typography>
          );
        },
      }),
      columnHelper.accessor('order_count', {
        header: 'Orders',
        cell: info => (
          <Typography variant="body2">{info.getValue()}</Typography>
        ),
      }),
      columnHelper.accessor('avg_order_value', {
        header: 'AOV',
        cell: info => (
          <Typography variant="body2">
            ${info.getValue()?.toFixed(0) || 0}
          </Typography>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="View Details">
              <IconButton size="small" onClick={() => handleViewDetails(row.original)}>
                <SearchIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
      expanded,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const handleViewDetails = (customer) => {
    console.log('View details for:', customer);
  };

  const handleExport = () => {
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'abc_analysis.csv';
    a.click();
  };

  // Pareto Chart Component
  const ParetoChart = ({ data }) => {
    const width = 800;
    const height = 400;
    const margin = { top: 20, left: 60, right: 80, bottom: 60 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Prepare data for chart
    const chartData = useMemo(() => {
      return data.slice(0, 50).map((d, i) => ({
        ...d,
        index: i,
      }));
    }, [data]);

    const xScale = scaleBand({
      domain: chartData.map(d => d.index),
      range: [0, innerWidth],
      padding: 0.1,
    });

    const yScaleBar = scaleLinear({
      domain: [0, Math.max(...chartData.map(d => d.revenue_percentage))],
      range: [innerHeight, 0],
    });

    const yScaleLine = scaleLinear({
      domain: [0, 100],
      range: [innerHeight, 0],
    });

    const colorScale = scaleOrdinal({
      domain: ['A', 'B', 'C'],
      range: [theme.palette.success.main, theme.palette.warning.main, theme.palette.info.main],
    });

    return (
      <svg width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          <VisxGrid
            xScale={xScale}
            yScale={yScaleBar}
            width={innerWidth}
            height={innerHeight}
            strokeDasharray="3,3"
            stroke={alpha(theme.palette.divider, 0.3)}
          />
          
          {/* Bars */}
          {chartData.map((d, i) => (
            <Bar
              key={`bar-${i}`}
              x={xScale(d.index)}
              y={yScaleBar(d.revenue_percentage)}
              width={xScale.bandwidth()}
              height={innerHeight - yScaleBar(d.revenue_percentage)}
              fill={colorScale(d.abc_class)}
              opacity={0.8}
            />
          ))}
          
          {/* Cumulative line */}
          <LinePath
            data={chartData}
            x={d => xScale(d.index) + xScale.bandwidth() / 2}
            y={d => yScaleLine(d.cumulative_revenue_percentage)}
            stroke={theme.palette.error.main}
            strokeWidth={2}
            curve={curveMonotoneX}
          />
          
          {/* Points on line */}
          {chartData.map((d, i) => (
            <circle
              key={`point-${i}`}
              cx={xScale(d.index) + xScale.bandwidth() / 2}
              cy={yScaleLine(d.cumulative_revenue_percentage)}
              r={3}
              fill={theme.palette.error.main}
            />
          ))}
          
          {/* 80% line */}
          <Line
            from={{ x: 0, y: yScaleLine(80) }}
            to={{ x: innerWidth, y: yScaleLine(80) }}
            stroke={theme.palette.error.light}
            strokeDasharray="5,5"
            strokeWidth={1}
          />
          
          <AxisBottom
            scale={xScale}
            top={innerHeight}
            label="Customer Rank"
            tickFormat={(i) => i % 5 === 0 ? `#${chartData[i]?.rank}` : ''}
          />
          
          <AxisLeft
            scale={yScaleBar}
            label="Revenue %"
            labelOffset={40}
          />
          
          <AxisLeft
            scale={yScaleLine}
            left={innerWidth}
            label="Cumulative %"
            labelOffset={40}
            orientation="right"
            stroke={theme.palette.error.main}
            tickStroke={theme.palette.error.main}
            tickLabelProps={() => ({
              fill: theme.palette.error.main,
              fontSize: 10,
              textAnchor: 'start',
            })}
          />
        </Group>
      </svg>
    );
  };

  // Revenue Distribution Pie Chart
  const RevenuePieChart = ({ kpis }) => {
    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;
    const centerX = width / 2;
    const centerY = height / 2;

    const data = [
      { label: 'Class A', value: kpis.aClassRevenue, color: theme.palette.success.main },
      { label: 'Class B', value: kpis.bClassRevenue, color: theme.palette.warning.main },
      { label: 'Class C', value: kpis.cClassRevenue, color: theme.palette.info.main },
    ];

    return (
      <svg width={width} height={height}>
        <Group top={centerY} left={centerX}>
          <Pie
            data={data}
            pieValue={d => d.value}
            outerRadius={radius - 20}
            innerRadius={radius - 80}
          >
            {pie => pie.arcs.map((arc, i) => {
              const [centroidX, centroidY] = pie.path.centroid(arc);
              const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;
              const arcPath = pie.path(arc);
              const arcFill = data[i].color;
              
              return (
                <g key={`arc-${i}`}>
                  <path d={arcPath} fill={arcFill} opacity={0.9} />
                  {hasSpaceForLabel && (
                    <>
                      <text
                        x={centroidX}
                        y={centroidY - 10}
                        fill="white"
                        fontSize={14}
                        fontWeight={600}
                        textAnchor="middle"
                      >
                        {data[i].label}
                      </text>
                      <text
                        x={centroidX}
                        y={centroidY + 10}
                        fill="white"
                        fontSize={12}
                        textAnchor="middle"
                      >
                        {((data[i].value / kpis.totalRevenue) * 100).toFixed(1)}%
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </Pie>
        </Group>
        {/* Center text */}
        <text
          x={centerX}
          y={centerY - 10}
          fill={theme.palette.text.primary}
          fontSize={16}
          fontWeight={600}
          textAnchor="middle"
        >
          Total Revenue
        </text>
        <text
          x={centerX}
          y={centerY + 10}
          fill={theme.palette.text.secondary}
          fontSize={14}
          textAnchor="middle"
        >
          ${(kpis.totalRevenue / 1000000).toFixed(1)}M
        </text>
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
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Class A Customers
                </Typography>
                <Stack direction="row" alignItems="baseline" spacing={1}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {kpis.aClassCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ({((kpis.aClassCount / (kpis.aClassCount + kpis.bClassCount + kpis.cClassCount)) * 100).toFixed(0)}%)
                  </Typography>
                </Stack>
                <Typography variant="caption" color="success.main">
                  ${(kpis.aClassRevenue / 1000000).toFixed(1)}M revenue
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Class B Customers
                </Typography>
                <Stack direction="row" alignItems="baseline" spacing={1}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'warning.main' }}>
                    {kpis.bClassCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ({((kpis.bClassCount / (kpis.aClassCount + kpis.bClassCount + kpis.cClassCount)) * 100).toFixed(0)}%)
                  </Typography>
                </Stack>
                <Typography variant="caption" color="warning.main">
                  ${(kpis.bClassRevenue / 1000000).toFixed(1)}M revenue
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Class C Customers
                </Typography>
                <Stack direction="row" alignItems="baseline" spacing={1}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'info.main' }}>
                    {kpis.cClassCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ({((kpis.cClassCount / (kpis.aClassCount + kpis.bClassCount + kpis.cClassCount)) * 100).toFixed(0)}%)
                  </Typography>
                </Stack>
                <Typography variant="caption" color="info.main">
                  ${(kpis.cClassRevenue / 1000000).toFixed(1)}M revenue
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Pareto Principle
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  80/20
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Top 20% generate 80% revenue
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* View Mode Toggle and Controls */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="table">
                <TableIcon sx={{ mr: 1 }} fontSize="small" />
                Table
              </ToggleButton>
              <ToggleButton value="pareto">
                <ChartIcon sx={{ mr: 1 }} fontSize="small" />
                Pareto
              </ToggleButton>
              <ToggleButton value="distribution">
                <DonutIcon sx={{ mr: 1 }} fontSize="small" />
                Distribution
              </ToggleButton>
            </ToggleButtonGroup>
            
            {viewMode === 'table' && (
              <TextField
                placeholder="Search customers..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                size="small"
                sx={{ width: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<FilterIcon />}
              variant="outlined"
              size="small"
            >
              Filters
            </Button>
            <Button
              startIcon={<DownloadIcon />}
              variant="outlined"
              size="small"
              onClick={handleExport}
            >
              Export
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Content Area */}
      {viewMode === 'table' ? (
        <Paper sx={{ overflow: 'hidden' }}>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        style={{
                          padding: '12px',
                          textAlign: 'left',
                          background: alpha(theme.palette.primary.main, 0.05),
                          borderBottom: `2px solid ${theme.palette.divider}`,
                          cursor: header.column.getCanSort() ? 'pointer' : 'default',
                          userSelect: 'none',
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() && (
                          <span>{header.column.getIsSorted() === 'asc' ? ' ↑' : ' ↓'}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr 
                    key={row.id}
                    style={{
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      background: row.original.abc_class === 'A' 
                        ? alpha(theme.palette.success.main, 0.05)
                        : row.original.abc_class === 'B'
                        ? alpha(theme.palette.warning.main, 0.05)
                        : 'transparent',
                    }}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td
                        key={cell.id}
                        style={{
                          padding: '12px',
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          {/* Pagination */}
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                data.length
              )}{' '}
              of {data.length} customers
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                size="small"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </Stack>
          </Box>
        </Paper>
      ) : viewMode === 'pareto' ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Pareto Chart - Revenue Contribution
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Individual and cumulative revenue contribution by customer rank
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
            <ParetoChart data={data} />
          </Box>
          <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Key Insight:</strong> The top {Math.round(kpis.aClassCount)} customers 
              ({((kpis.aClassCount / (kpis.aClassCount + kpis.bClassCount + kpis.cClassCount)) * 100).toFixed(0)}% of total) 
              generate ${(kpis.aClassRevenue / 1000000).toFixed(1)}M 
              ({((kpis.aClassRevenue / kpis.totalRevenue) * 100).toFixed(0)}% of total revenue)
            </Typography>
          </Box>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Revenue Distribution by Class
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <RevenuePieChart kpis={kpis} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                ABC Classification Rules
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="success.dark" gutterBottom>
                    Class A - Critical Customers
                  </Typography>
                  <Typography variant="body2">
                    Top 20% of customers by revenue. Focus on retention, personalized service, and loyalty programs.
                  </Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                    Class B - Important Customers
                  </Typography>
                  <Typography variant="body2">
                    Next 30% of customers. Potential to move to Class A with targeted campaigns and incentives.
                  </Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="info.dark" gutterBottom>
                    Class C - Transactional Customers
                  </Typography>
                  <Typography variant="body2">
                    Bottom 50% of customers. Automate service, reduce costs, evaluate profitability.
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ABCAnalysis;