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
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  ShoppingCart as CartIcon,
  BarChart as ChartIcon,
  TableChart as TableIcon,
  ScatterPlot as ScatterIcon,
  BubbleChart as BubbleIcon,
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
import { scaleOrdinal, scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { HeatmapRect, HeatmapCircle } from '@visx/heatmap';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { withTooltip, Tooltip as VisxTooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { ParentSize } from '@visx/responsive';
import { Treemap } from '@visx/hierarchy';
import { hierarchy } from 'd3-hierarchy';
import { treemapSquarify } from 'd3-hierarchy';

const columnHelper = createColumnHelper();

const RFMSegmentation = ({ onRefresh }) => {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([{ id: 'rfm_score', desc: true }]);
  const [expanded, setExpanded] = useState({});
  const [viewMode, setViewMode] = useState('table');
  const [kpis, setKpis] = useState({
    totalCustomers: 0,
    champions: 0,
    atRisk: 0,
    newCustomers: 0,
    avgRecency: 0,
    avgFrequency: 0,
    avgMonetary: 0,
  });
  const [segmentDistribution, setSegmentDistribution] = useState([]);

  // Fetch RFM data from backend
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/margen/analytics/rfm-segmentation');
      setData(response.data.customers || []);
      setKpis(response.data.kpis || {});
      setSegmentDistribution(response.data.segmentDistribution || []);
    } catch (err) {
      setError('Failed to load RFM segmentation data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // RFM Segment Labels and Colors
  const getSegmentInfo = (segment) => {
    const segments = {
      'Champions': { color: 'success', description: 'Bought recently, buy often and spend the most' },
      'Loyal Customers': { color: 'primary', description: 'Spend good money and responsive to promotions' },
      'Potential Loyalists': { color: 'info', description: 'Recent customers with average frequency' },
      'New Customers': { color: 'secondary', description: 'Bought recently for the first time' },
      'Promising': { color: 'info', description: 'Recent shoppers but spent little' },
      'Need Attention': { color: 'warning', description: 'Above average recency, frequency and monetary' },
      'About to Sleep': { color: 'warning', description: 'Below average recency, frequency and monetary' },
      'At Risk': { color: 'error', description: 'Spent big but long time ago' },
      'Cannot Lose Them': { color: 'error', description: 'Made big purchases but long time ago' },
      'Hibernating': { color: 'default', description: 'Low spenders, low frequency, purchased long time ago' },
      'Lost': { color: 'default', description: 'Lowest recency, frequency and monetary' },
    };
    return segments[segment] || { color: 'default', description: segment };
  };

  // Define columns for TanStack Table
  const columns = useMemo(
    () => [
      columnHelper.accessor('customer_id', {
        header: 'Customer ID',
        cell: info => (
          <Stack direction="row" alignItems="center" spacing={1}>
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
      columnHelper.accessor('segment', {
        header: 'RFM Segment',
        cell: info => {
          const segment = info.getValue();
          const segmentInfo = getSegmentInfo(segment);
          return (
            <Tooltip title={segmentInfo.description}>
              <Chip 
                label={segment} 
                size="small" 
                color={segmentInfo.color}
                variant="filled"
              />
            </Tooltip>
          );
        },
      }),
      columnHelper.accessor('recency_score', {
        header: 'Recency',
        cell: info => {
          const score = info.getValue();
          return (
            <Stack direction="row" alignItems="center" spacing={1}>
              <CalendarIcon fontSize="small" color="action" />
              <Chip 
                label={score} 
                size="small" 
                color={score >= 4 ? 'success' : score >= 2 ? 'warning' : 'error'}
                variant="outlined"
              />
            </Stack>
          );
        },
      }),
      columnHelper.accessor('frequency_score', {
        header: 'Frequency',
        cell: info => {
          const score = info.getValue();
          return (
            <Stack direction="row" alignItems="center" spacing={1}>
              <CartIcon fontSize="small" color="action" />
              <Chip 
                label={score} 
                size="small" 
                color={score >= 4 ? 'success' : score >= 2 ? 'warning' : 'error'}
                variant="outlined"
              />
            </Stack>
          );
        },
      }),
      columnHelper.accessor('monetary_score', {
        header: 'Monetary',
        cell: info => {
          const score = info.getValue();
          return (
            <Stack direction="row" alignItems="center" spacing={1}>
              <MoneyIcon fontSize="small" color="action" />
              <Chip 
                label={score} 
                size="small" 
                color={score >= 4 ? 'success' : score >= 2 ? 'warning' : 'error'}
                variant="outlined"
              />
            </Stack>
          );
        },
      }),
      columnHelper.accessor('rfm_score', {
        header: 'RFM Score',
        cell: info => {
          const score = info.getValue();
          const maxScore = 15; // Max possible RFM score (5+5+5)
          const percentage = (score / maxScore) * 100;
          return (
            <Stack spacing={0.5}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {score}
              </Typography>
              <Box sx={{ width: 60, height: 4, bgcolor: alpha(theme.palette.grey[300], 0.3), borderRadius: 2 }}>
                <Box 
                  sx={{ 
                    width: `${percentage}%`, 
                    height: '100%', 
                    bgcolor: percentage >= 80 ? 'success.main' : percentage >= 60 ? 'warning.main' : 'error.main',
                    borderRadius: 2 
                  }} 
                />
              </Box>
            </Stack>
          );
        },
      }),
      columnHelper.accessor('last_purchase_days', {
        header: 'Last Purchase',
        cell: info => {
          const days = info.getValue();
          return (
            <Typography variant="body2" color={days <= 30 ? 'success.main' : days <= 90 ? 'text.secondary' : 'error.main'}>
              {days === 0 ? 'Today' : `${days} days ago`}
            </Typography>
          );
        },
      }),
      columnHelper.accessor('total_orders', {
        header: 'Total Orders',
        cell: info => (
          <Typography variant="body2">{info.getValue()}</Typography>
        ),
      }),
      columnHelper.accessor('total_revenue', {
        header: 'Total Revenue',
        cell: info => (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            ${info.getValue()?.toLocaleString() || 0}
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
    [theme]
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
    a.download = 'rfm_segmentation.csv';
    a.click();
  };

  // RFM Heatmap Component
  const RFMHeatmap = ({ data }) => {
    const width = 600;
    const height = 400;
    const margin = { top: 20, left: 80, right: 20, bottom: 60 };
    
    // Process data for heatmap
    const rfMatrix = useMemo(() => {
      const matrix = [];
      for (let r = 1; r <= 5; r++) {
        for (let f = 1; f <= 5; f++) {
          const customers = data.filter(d => 
            d.recency_score === r && d.frequency_score === f
          );
          matrix.push({
            recency: r,
            frequency: f,
            count: customers.length,
            avgMonetary: customers.reduce((sum, c) => sum + (c.monetary_score || 0), 0) / (customers.length || 1),
          });
        }
      }
      return matrix;
    }, [data]);

    const xScale = scaleLinear({
      domain: [0.5, 5.5],
      range: [margin.left, width - margin.right],
    });

    const yScale = scaleLinear({
      domain: [0.5, 5.5],
      range: [height - margin.bottom, margin.top],
    });

    const colorScale = scaleLinear({
      domain: [0, Math.max(...rfMatrix.map(d => d.count))],
      range: ['#f5f5f5', theme.palette.primary.main],
    });

    return (
      <svg width={width} height={height}>
        <Group>
          {rfMatrix.map((cell, i) => (
            <rect
              key={i}
              x={xScale(cell.recency - 0.4)}
              y={yScale(cell.frequency + 0.4)}
              width={xScale(1) - xScale(0) - 2}
              height={yScale(0) - yScale(1) - 2}
              fill={colorScale(cell.count)}
              rx={4}
              opacity={0.9}
            />
          ))}
          {rfMatrix.map((cell, i) => (
            <text
              key={`text-${i}`}
              x={xScale(cell.recency)}
              y={yScale(cell.frequency)}
              fill={cell.count > 0 ? 'white' : 'black'}
              fontSize={12}
              textAnchor="middle"
              dominantBaseline="middle"
              fontWeight={600}
            >
              {cell.count}
            </text>
          ))}
        </Group>
        <AxisBottom
          scale={xScale}
          top={height - margin.bottom}
          label="Recency Score"
          tickValues={[1, 2, 3, 4, 5]}
        />
        <AxisLeft
          scale={yScale}
          left={margin.left}
          label="Frequency Score"
          tickValues={[1, 2, 3, 4, 5]}
        />
      </svg>
    );
  };

  // Segment Treemap Component
  const SegmentTreemap = ({ data }) => {
    const width = 600;
    const height = 400;

    const treeData = useMemo(() => {
      const segmentGroups = data.reduce((acc, customer) => {
        const segment = customer.segment;
        if (!acc[segment]) {
          acc[segment] = {
            name: segment,
            value: 0,
            customers: [],
          };
        }
        acc[segment].value += customer.total_revenue || 0;
        acc[segment].customers.push(customer);
        return acc;
      }, {});

      return {
        name: 'RFM Segments',
        children: Object.values(segmentGroups),
      };
    }, [data]);

    const root = hierarchy(treeData)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    const treemapLayout = treemapSquarify();
    treemapLayout.size([width, height]);
    treemapLayout(root);

    const colorScale = scaleOrdinal({
      domain: Object.keys(getSegmentInfo('')),
      range: [
        theme.palette.success.main,
        theme.palette.primary.main,
        theme.palette.info.main,
        theme.palette.warning.main,
        theme.palette.error.main,
        theme.palette.grey[600],
      ],
    });

    return (
      <svg width={width} height={height}>
        <Group>
          {root.leaves().map((node, i) => {
            const segmentInfo = getSegmentInfo(node.data.name);
            return (
              <Group key={`node-${i}`}>
                <rect
                  x={node.x0}
                  y={node.y0}
                  width={node.x1 - node.x0}
                  height={node.y1 - node.y0}
                  fill={theme.palette[segmentInfo.color]?.main || theme.palette.grey[500]}
                  stroke="white"
                  strokeWidth={2}
                  rx={4}
                  opacity={0.8}
                />
                {(node.x1 - node.x0 > 60 && node.y1 - node.y0 > 40) && (
                  <>
                    <text
                      x={node.x0 + (node.x1 - node.x0) / 2}
                      y={node.y0 + (node.y1 - node.y0) / 2 - 10}
                      fill="white"
                      fontSize={12}
                      fontWeight={600}
                      textAnchor="middle"
                    >
                      {node.data.name}
                    </text>
                    <text
                      x={node.x0 + (node.x1 - node.x0) / 2}
                      y={node.y0 + (node.y1 - node.y0) / 2 + 10}
                      fill="white"
                      fontSize={10}
                      textAnchor="middle"
                    >
                      ${(node.value / 1000000).toFixed(1)}M
                    </text>
                  </>
                )}
              </Group>
            );
          })}
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
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Total Customers
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {kpis.totalCustomers.toLocaleString()}
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
                  Champions
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {kpis.champions.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {((kpis.champions / kpis.totalCustomers) * 100).toFixed(1)}% of total
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
                  At Risk
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'error.main' }}>
                  {kpis.atRisk.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {((kpis.atRisk / kpis.totalCustomers) * 100).toFixed(1)}% of total
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
                  New Customers
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'info.main' }}>
                  {kpis.newCustomers.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last 30 days
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
              <ToggleButton value="heatmap">
                <ChartIcon sx={{ mr: 1 }} fontSize="small" />
                Heatmap
              </ToggleButton>
              <ToggleButton value="treemap">
                <BubbleIcon sx={{ mr: 1 }} fontSize="small" />
                Treemap
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
      ) : viewMode === 'heatmap' ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            RFM Score Distribution Heatmap
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Customer count by Recency and Frequency scores
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <RFMHeatmap data={data} />
          </Box>
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Revenue by RFM Segment
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Size represents total revenue contribution
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <SegmentTreemap data={data} />
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default RFMSegmentation;