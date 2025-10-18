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
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  BarChart as ChartIcon,
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

const ProductProfitability = ({ onRefresh }) => {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([{ id: 'total_revenue', desc: true }]);
  const [expanded, setExpanded] = useState({});
  const [kpis, setKpis] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    totalProfit: 0,
    avgMargin: 0,
    topProduct: '',
    highMarginProducts: 0,
  });

  // Fetch data from backend
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/margen/analytics/product-profitability');
      setData(response.data.products || []);
      setKpis(response.data.kpis || {});
    } catch (err) {
      setError('Failed to load product profitability data');
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
      columnHelper.accessor('product_id', {
        header: 'Product ID',
        cell: info => (
          <Stack direction="row" alignItems="center" spacing={1}>
            <InventoryIcon fontSize="small" color="action" />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {info.getValue()}
            </Typography>
          </Stack>
        ),
      }),
      columnHelper.accessor('product_name', {
        header: 'Product Name',
        cell: info => (
          <Typography variant="body2">{info.getValue() || 'N/A'}</Typography>
        ),
      }),
      columnHelper.accessor('category', {
        header: 'Category',
        cell: info => (
          <Chip label={info.getValue() || 'Uncategorized'} size="small" variant="outlined" />
        ),
      }),
      columnHelper.accessor('total_revenue', {
        header: 'Revenue',
        cell: info => (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            ${info.getValue()?.toLocaleString() || 0}
          </Typography>
        ),
      }),
      columnHelper.accessor('total_profit', {
        header: 'Profit',
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
        header: 'Margin %',
        cell: info => {
          const value = info.getValue() || 0;
          const getColor = (margin) => {
            if (margin >= 30) return 'success';
            if (margin >= 15) return 'primary';
            if (margin >= 5) return 'warning';
            return 'error';
          };
          return (
            <Box sx={{ width: '100%' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(Math.max(value, 0), 100)}
                  sx={{ 
                    width: 60, 
                    height: 6,
                    backgroundColor: alpha(theme.palette.grey[500], 0.2),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: theme.palette[getColor(value)].main,
                    }
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {value.toFixed(1)}%
                </Typography>
              </Stack>
            </Box>
          );
        },
      }),
      columnHelper.accessor('units_sold', {
        header: 'Units Sold',
        cell: info => (
          <Typography variant="body2">
            {info.getValue()?.toLocaleString() || 0}
          </Typography>
        ),
      }),
      columnHelper.accessor('avg_price', {
        header: 'Avg Price',
        cell: info => (
          <Typography variant="body2">
            ${info.getValue()?.toFixed(2) || 0}
          </Typography>
        ),
      }),
      columnHelper.accessor('customer_count', {
        header: 'Customers',
        cell: info => (
          <Typography variant="body2">
            {info.getValue()?.toLocaleString() || 0}
          </Typography>
        ),
      }),
      columnHelper.accessor('profitability_status', {
        header: 'Status',
        cell: info => {
          const status = info.getValue() || 'Unknown';
          const color = {
            'High Profit': 'success',
            'Good Profit': 'primary',
            'Low Profit': 'warning',
            'Loss Making': 'error',
          }[status] || 'default';
          return <Chip label={status} size="small" color={color} />;
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
            <Tooltip title="View Analytics">
              <IconButton size="small" onClick={() => handleViewAnalytics(row.original)}>
                <ChartIcon fontSize="small" />
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
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const handleViewDetails = (product) => {
    console.log('View details for:', product);
  };

  const handleViewAnalytics = (product) => {
    console.log('View analytics for:', product);
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
    a.download = 'product_profitability.csv';
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
                  Total Products
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {kpis.totalProducts.toLocaleString()}
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
                  Avg Margin
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {kpis.avgMargin.toFixed(1)}%
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
                  High Margin Products
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {kpis.highMarginProducts}
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
                  Top Product
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {kpis.topProduct}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table Controls */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <TextField
            placeholder="Search products..."
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
            of {data.length} products
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

export default ProductProfitability;