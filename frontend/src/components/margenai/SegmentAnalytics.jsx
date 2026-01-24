import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Divider,
  Tooltip,
  IconButton,
  Breadcrumbs,
  Link,
  Button,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Insights as InsightsIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useSegmentAnalytics } from '../../hooks/useMargenData';

const getColors = (darkMode) => ({
  background: darkMode ? '#0a0e27' : '#ffffff',
  paper: darkMode ? '#111936' : '#ffffff',
  paperBorder: darkMode ? '#1e293b' : '#e0e0e0',
  text: {
    primary: darkMode ? '#e2e8f0' : '#1a202c',
    secondary: darkMode ? '#94a3b8' : '#64748b',
  },
  tableHeader: darkMode ? '#1e293b' : '#fafafa',
  tableRow: darkMode ? '#151f3d' : '#f5f5f5',
  tableBorder: darkMode ? '#1e293b' : '#e0e0e0',
});

const SegmentAnalytics = ({ onBack, darkMode = false }) => {
  const theme = useTheme();
  const colors = getColors(darkMode);
  const { data: segmentData, loading, error, refetch } = useSegmentAnalytics();
  const [refreshing, setRefreshing] = useState(false);
  const [sorting, setSorting] = useState([]);

  const data = segmentData?.segments || [];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (!data.length) return {};
    
    const totalCustomers = data.reduce((sum, seg) => sum + seg.total_customers, 0);
    const totalRevenue = data.reduce((sum, seg) => sum + seg.total_revenue, 0);
    const totalMargin = data.reduce((sum, seg) => sum + seg.total_margin, 0);
    const avgMarginPct = totalRevenue > 0 ? (totalMargin / totalRevenue * 100) : 0;
    
    const healthySegments = data.filter(s => s.margin_category === 'High Margin').length;
    const highValueSegments = data.filter(s => s.value_category === 'High Value').length;
    
    return {
      totalCustomers,
      totalRevenue,
      totalMargin,
      avgMarginPct,
      healthySegments,
      highValueSegments,
      totalSegments: data.length
    };
  }, [data]);

  const columns = useMemo(() => [
    {
      accessorKey: 'segment_name',
      header: 'Customer Segment',
      cell: (info) => (
        <Box>
          <Typography variant="body2" fontWeight={600} color="primary">
            {info.getValue()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {info.row.original.value_category} • {info.row.original.margin_category}
          </Typography>
        </Box>
      ),
      size: 180,
    },
    {
      accessorKey: 'total_customers',
      header: 'Customers',
      cell: (info) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <PeopleIcon sx={{ fontSize: 16, color: 'primary.main' }} />
          <Typography variant="body2" fontWeight={500}>
            {info.getValue()?.toLocaleString() || '0'}
          </Typography>
        </Stack>
      ),
      size: 120,
    },
    {
      accessorKey: 'total_revenue',
      header: 'Total Revenue',
      cell: (info) => (
        <Typography variant="body2" fontWeight={600} color="success.main">
          ${info.getValue()?.toLocaleString() || '0'}
        </Typography>
      ),
      size: 140,
    },
    {
      accessorKey: 'total_margin',
      header: 'Total Margin',
      cell: (info) => {
        const value = info.getValue();
        const isPositive = value > 0;
        return (
          <Typography 
            variant="body2" 
            fontWeight={500}
            color={isPositive ? 'success.main' : 'error.main'}
          >
            ${value?.toLocaleString() || '0'}
          </Typography>
        );
      },
      size: 130,
    },
    {
      accessorKey: 'avg_margin_percentage',
      header: 'Avg Margin %',
      cell: (info) => {
        const value = info.getValue();
        const isPositive = value > 0;
        return (
          <Chip
            label={`${value?.toFixed(1) || '0.0'}%`}
            size="small"
            icon={isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
            sx={{
              bgcolor: isPositive ? alpha('#4caf50', 0.1) : alpha('#f44336', 0.1),
              color: isPositive ? 'success.main' : 'error.main',
              fontWeight: 600,
            }}
          />
        );
      },
      size: 140,
    },
    {
      accessorKey: 'avg_customer_lifetime_value',
      header: 'Avg LTV',
      cell: (info) => (
        <Typography variant="body2" color="primary">
          ${info.getValue()?.toLocaleString() || '0'}
        </Typography>
      ),
      size: 120,
    },
    {
      accessorKey: 'avg_purchase_frequency',
      header: 'Avg Frequency',
      cell: (info) => (
        <Typography variant="body2">
          {info.getValue()?.toFixed(1) || '0.0'}
        </Typography>
      ),
      size: 120,
    },
    {
      accessorKey: 'avg_days_since_last_purchase',
      header: 'Days Since Last',
      cell: (info) => {
        const days = info.getValue();
        const color = days <= 30 ? 'success.main' : days <= 90 ? 'warning.main' : 'error.main';
        return (
          <Typography variant="body2" color={color} fontWeight={500}>
            {Math.round(days || 0)} days
          </Typography>
        );
      },
      size: 130,
    },
    {
      accessorKey: 'revenue_per_customer',
      header: 'Revenue/Customer',
      cell: (info) => (
        <Typography variant="body2" fontWeight={500}>
          ${info.getValue()?.toFixed(2) || '0.00'}
        </Typography>
      ),
      size: 140,
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading segment analytics: {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: colors.background, minHeight: '100vh' }}>
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link
              component="button"
              variant="body1"
              onClick={onBack}
              sx={{
                textDecoration: 'none',
                color: 'text.primary',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              MARGEN.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              Segment Analytics
            </Typography>
          </Breadcrumbs>
          {onBack && (
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
              Back to MargenAI
            </Button>
          )}
        </Stack>
      </Box>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Customer Segment Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive analysis of customer segments by profitability and behavior patterns
          </Typography>
        </Box>
        <Tooltip title="Refresh Data">
          <IconButton 
            onClick={handleRefresh} 
            disabled={refreshing}
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
            }}
          >
            <RefreshIcon sx={{ color: 'primary.main' }} />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={2}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={600} color="primary">
                    {summaryMetrics.totalSegments}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                    Total Segments
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 32, color: 'primary.light' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2}>
          <Card sx={{ height: '100%', bgcolor: colors.paper, border: `1px solid ${colors.paperBorder}` }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={600} sx={{ color: colors.text.primary }}>
                    {summaryMetrics.totalCustomers?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                    Total Customers
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 32, color: 'info.light' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2}>
          <Card sx={{ height: '100%', bgcolor: colors.paper, border: `1px solid ${colors.paperBorder}` }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={600} color="success.main">
                    ${summaryMetrics.totalRevenue?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                    Total Revenue
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 32, color: 'success.light' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2}>
          <Card sx={{ height: '100%', bgcolor: colors.paper, border: `1px solid ${colors.paperBorder}` }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography
                    variant="h4"
                    fontWeight={600}
                    color={summaryMetrics.avgMarginPct > 0 ? 'success.main' : 'error.main'}
                  >
                    {summaryMetrics.avgMarginPct?.toFixed(1) || '0.0'}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                    Avg Margin
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 32, color: 'success.light' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2}>
          <Card sx={{ height: '100%', bgcolor: colors.paper, border: `1px solid ${colors.paperBorder}` }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={600} color="success.main">
                    {summaryMetrics.healthySegments}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                    High Margin
                  </Typography>
                </Box>
                <InsightsIcon sx={{ fontSize: 32, color: 'success.light' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2}>
          <Card sx={{ height: '100%', bgcolor: colors.paper, border: `1px solid ${colors.paperBorder}` }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={600} color="primary">
                    {summaryMetrics.highValueSegments}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                    High Value
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 32, color: 'primary.light' }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Segments Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden', bgcolor: colors.paper, border: `1px solid ${colors.paperBorder}` }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: colors.paperBorder }}>
          <Typography variant="h6" fontWeight={600} sx={{ color: colors.text.primary }}>
            Segment Performance Analysis
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text.secondary }}>
            {data.length} customer segments • Sorted by revenue performance
          </Typography>
        </Box>

        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} style={{ backgroundColor: colors.tableHeader }}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{
                        padding: '12px',
                        textAlign: 'left',
                        borderBottom: `2px solid ${colors.tableBorder}`,
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: colors.text.primary,
                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        userSelect: 'none',
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: ' ↑',
                        desc: ' ↓',
                      }[header.column.getIsSorted()] ?? null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: `1px solid ${colors.tableBorder}`,
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.tableRow)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        padding: '12px',
                        fontSize: '0.875rem',
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
      </Paper>
    </Box>
  );
};

export default SegmentAnalytics;