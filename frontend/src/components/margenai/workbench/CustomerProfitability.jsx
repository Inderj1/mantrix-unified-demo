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
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  ShoppingCart as CartIcon,
  CalendarToday as CalendarIcon,
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

const columnHelper = createColumnHelper();

const CustomerProfitability = ({ onRefresh }) => {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [kpis, setKpis] = useState({
    totalCustomers: 0,
    totalRevenue: 0,
    totalProfit: 0,
    avgCustomerValue: 0,
    topSegment: '',
    profitMargin: 0,
  });

  // Fetch data from backend
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/margen/analytics/customer-profitability');
      setData(response.data.customers || []);
      setKpis(response.data.kpis || {});
    } catch (err) {
      setError('Failed to load customer profitability data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Define columns for TanStack Table
  const columns = useMemo(
    () => [
      columnHelper.accessor('customer_id', {
        header: 'Customer ID',
        cell: info => (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {info.getValue()}
          </Typography>
        ),
      }),
      columnHelper.accessor('customer_name', {
        header: 'Customer Name',
        cell: info => (
          <Stack direction="row" alignItems="center" spacing={1}>
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="body2">{info.getValue()}</Typography>
          </Stack>
        ),
      }),
      columnHelper.accessor('segment', {
        header: 'Segment',
        cell: info => {
          const segment = info.getValue();
          const color = {
            'Champions': 'success',
            'Loyal Customers': 'primary',
            'At Risk': 'warning',
            'Lost': 'error',
          }[segment] || 'default';
          return <Chip label={segment} size="small" color={color} />;
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
      columnHelper.accessor('total_profit', {
        header: 'Total Profit',
        cell: info => {
          const value = info.getValue() || 0;
          const isPositive = value >= 0;
          return (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              {isPositive ? (
                <TrendingUpIcon fontSize="small" color="success" />
              ) : (
                <TrendingDownIcon fontSize="small" color="error" />
              )}
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  color: isPositive ? 'success.main' : 'error.main'
                }}
              >
                ${Math.abs(value).toLocaleString()}
              </Typography>
            </Stack>
          );
        },
      }),
      columnHelper.accessor('profit_margin', {
        header: 'Profit Margin %',
        cell: info => {
          const value = info.getValue() || 0;
          const isPositive = value >= 0;
          return (
            <Chip
              label={`${value.toFixed(1)}%`}
              size="small"
              color={isPositive ? 'success' : 'error'}
              variant="outlined"
            />
          );
        },
      }),
      columnHelper.accessor('order_count', {
        header: 'Orders',
        cell: info => (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <CartIcon fontSize="small" color="action" />
            <Typography variant="body2">{info.getValue() || 0}</Typography>
          </Stack>
        ),
      }),
      columnHelper.accessor('avg_order_value', {
        header: 'Avg Order Value',
        cell: info => (
          <Typography variant="body2">
            ${info.getValue()?.toFixed(2) || 0}
          </Typography>
        ),
      }),
      columnHelper.accessor('last_order_date', {
        header: 'Last Order',
        cell: info => {
          const date = info.getValue();
          if (!date) return '-';
          const daysAgo = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
          return (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <CalendarIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {daysAgo === 0 ? 'Today' : `${daysAgo} days ago`}
              </Typography>
            </Stack>
          );
        },
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
    // Implement customer detail view
    console.log('View details for:', customer);
  };

  const handleExport = () => {
    // Implement export functionality
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer_profitability.csv';
    a.click();
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
                  Total Customers
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {kpis.totalCustomers.toLocaleString()}
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
                  Total Revenue
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  ${(kpis.totalRevenue / 1000000).toFixed(1)}M
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
                  Total Profit
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                  ${(kpis.totalProfit / 1000000).toFixed(1)}M
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
                  Avg Customer Value
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  ${kpis.avgCustomerValue.toLocaleString()}
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
                  Profit Margin
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {kpis.profitMargin.toFixed(1)}%
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
                  Top Segment
                </Typography>
                <Chip label={kpis.topSegment} color="primary" size="small" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table Controls */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
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

      {/* Data Table */}
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
    </Box>
  );
};

export default CustomerProfitability;