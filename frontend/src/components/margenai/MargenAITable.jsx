import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Checkbox,
  Button,
  Stack,
  Tooltip,
  InputAdornment,
  Menu,
  ListItemIcon,
  ListItemText,
  alpha,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  MoreVert as MoreIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Analytics as AnalyticsIcon,
  AttachMoney as MoneyIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useProductOverview } from '../../hooks/useMargenData';

// API service for MargenAI data
const margenAPI = {
  async getProducts(limit = 100, offset = 0) {
    const response = await fetch(`/api/v1/margen/products/overview?limit=${limit}&offset=${offset}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async getProductSegments(productId) {
    const response = await fetch(`/api/v1/margen/products/${productId}/segments`);
    if (!response.ok) throw new Error('Failed to fetch product segments');
    return response.json();
  },

  async getProductTransactions(productId, segment = null, limit = 50) {
    const url = `/api/v1/margen/products/${productId}/transactions?limit=${limit}${segment ? `&segment=${segment}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  async searchProducts(params) {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.set('q', params.q);
    if (params.min_margin) searchParams.set('min_margin', params.min_margin);
    if (params.max_margin) searchParams.set('max_margin', params.max_margin);
    if (params.profitability) searchParams.set('profitability', params.profitability);
    if (params.limit) searchParams.set('limit', params.limit);
    
    const response = await fetch(`/api/v1/margen/products/search?${searchParams}`);
    if (!response.ok) throw new Error('Failed to search products');
    return response.json();
  },

  async getSummary() {
    const response = await fetch('/api/v1/margen/summary');
    if (!response.ok) throw new Error('Failed to fetch summary');
    return response.json();
  }
};

const MargenAITable = ({ onRowClick, onBack, darkMode = false }) => {
  const getColors = (darkMode) => ({
    primary: darkMode ? '#4d9eff' : '#00357a',
    text: darkMode ? '#e6edf3' : '#1e293b',
    textSecondary: darkMode ? '#8b949e' : '#64748b',
    background: darkMode ? '#0d1117' : '#f8fbfd',
    paper: darkMode ? '#161b22' : '#ffffff',
    cardBg: darkMode ? '#21262d' : '#ffffff',
    border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  });

  const colors = getColors(darkMode);

  // State management
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  // Drill-down state
  const [drillDownLevel, setDrillDownLevel] = useState(0); // 0: products, 1: segments, 2: transactions
  const [drillDownData, setDrillDownData] = useState({
    product: null,
    segment: null
  });
  const [drillDownLoading, setDrillDownLoading] = useState(false);

  // Filters
  const [profitabilityFilter, setProfitabilityFilter] = useState('all');
  const [marginRangeFilter, setMarginRangeFilter] = useState('all');

  // Use mock data hook
  const { data: productData, loading, error, refetch } = useProductOverview(100, 0);
  const data = productData?.products || [];
  const pagination = productData?.pagination || {
    total: 0,
    limit: 100,
    offset: 0,
    hasNext: false,
    hasPrev: false
  };

  const handleDrillDown = async (row, level) => {
    if (level === 1) {
      // Drill down to segments
      try {
        setDrillDownLoading(true);
        const result = await margenAPI.getProductSegments(row.product_id);
        setData(result.segments);
        setDrillDownLevel(1);
        setDrillDownData({ product: row, segment: null });
      } catch (err) {
        setError(err.message);
      } finally {
        setDrillDownLoading(false);
      }
    } else if (level === 2) {
      // Drill down to transactions
      try {
        setDrillDownLoading(true);
        const result = await margenAPI.getProductTransactions(
          drillDownData.product.product_id,
          row.segment_name
        );
        setData(result.transactions);
        setDrillDownLevel(2);
        setDrillDownData({ ...drillDownData, segment: row });
      } catch (err) {
        setError(err.message);
      } finally {
        setDrillDownLoading(false);
      }
    }
  };

  const handleDrillUp = async (targetLevel) => {
    if (targetLevel === 0) {
      // Back to products
      setDrillDownLevel(0);
      setDrillDownData({ product: null, segment: null });
      await loadProductsData();
    } else if (targetLevel === 1) {
      // Back to segments
      const result = await margenAPI.getProductSegments(drillDownData.product.product_id);
      setData(result.segments);
      setDrillDownLevel(1);
      setDrillDownData({ ...drillDownData, segment: null });
    }
  };

  // Column definitions based on drill-down level
  const getColumns = useMemo(() => {
    if (drillDownLevel === 0) {
      // Products level columns
      return [
        {
          id: 'select',
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllRowsSelected()}
              indeterminate={table.getIsSomeRowsSelected()}
              onChange={table.getToggleAllRowsSelectedHandler()}
              size="small"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
              size="small"
            />
          ),
          size: 50,
        },
        {
          accessorKey: 'product_id',
          header: 'Product ID',
          cell: (info) => (
            <Typography variant="body2" fontWeight={500} color="primary">
              {info.getValue()}
            </Typography>
          ),
          size: 120,
        },
        {
          accessorKey: 'total_revenue',
          header: 'Total Revenue',
          cell: (info) => (
            <Typography variant="body2" fontWeight={600}>
              ${info.getValue()?.toLocaleString() || '0'}
            </Typography>
          ),
          size: 140,
        },
        {
          accessorKey: 'total_margin',
          header: 'Total Margin',
          cell: (info) => (
            <Typography variant="body2" fontWeight={500} color="success.main">
              ${info.getValue()?.toLocaleString() || '0'}
            </Typography>
          ),
          size: 120,
        },
        {
          accessorKey: 'margin_percentage',
          header: 'Margin %',
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
          size: 120,
        },
        {
          accessorKey: 'profitability_status',
          header: 'Profitability',
          cell: (info) => {
            const status = info.getValue();
            const colorMap = {
              'High Profit': 'success',
              'Good Profit': 'info',
              'Low Profit': 'warning',
              'Minimal Profit': 'warning',
              'Loss Making': 'error'
            };
            return (
              <Chip
                label={status}
                size="small"
                color={colorMap[status] || 'default'}
                variant="outlined"
              />
            );
          },
          size: 140,
        },
        {
          accessorKey: 'unique_customers',
          header: 'Customers',
          cell: (info) => (
            <Typography variant="body2">
              {info.getValue()?.toLocaleString() || '0'}
            </Typography>
          ),
          size: 100,
        },
        {
          accessorKey: 'total_orders',
          header: 'Orders',
          cell: (info) => (
            <Typography variant="body2">
              {info.getValue()?.toLocaleString() || '0'}
            </Typography>
          ),
          size: 100,
        },
        {
          accessorKey: 'premium_customer_pct',
          header: 'Premium %',
          cell: (info) => (
            <Typography variant="body2" color="primary">
              {info.getValue()?.toFixed(1) || '0.0'}%
            </Typography>
          ),
          size: 100,
        },
        {
          accessorKey: 'last_sale_date',
          header: 'Last Sale',
          cell: (info) => (
            <Typography variant="body2" color="text.secondary">
              {info.getValue() ? new Date(info.getValue()).toLocaleDateString() : 'N/A'}
            </Typography>
          ),
          size: 120,
        },
        {
          id: 'actions',
          header: '',
          cell: ({ row }) => (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRow(row.original);
                setAnchorEl(e.currentTarget);
              }}
            >
              <MoreIcon />
            </IconButton>
          ),
          size: 50,
        },
      ];
    } else if (drillDownLevel === 1) {
      // Segments level columns
      return [
        {
          accessorKey: 'segment_name',
          header: 'Customer Segment',
          cell: (info) => (
            <Typography variant="body2" fontWeight={500} color="primary">
              {info.getValue()}
            </Typography>
          ),
          size: 180,
        },
        {
          accessorKey: 'customer_count',
          header: 'Customers',
          cell: (info) => (
            <Typography variant="body2" fontWeight={600}>
              {info.getValue()?.toLocaleString() || '0'}
            </Typography>
          ),
          size: 120,
        },
        {
          accessorKey: 'segment_revenue',
          header: 'Revenue',
          cell: (info) => (
            <Typography variant="body2" fontWeight={500}>
              ${info.getValue()?.toLocaleString() || '0'}
            </Typography>
          ),
          size: 140,
        },
        {
          accessorKey: 'segment_margin',
          header: 'Margin',
          cell: (info) => (
            <Typography variant="body2" fontWeight={500} color="success.main">
              ${info.getValue()?.toLocaleString() || '0'}
            </Typography>
          ),
          size: 120,
        },
        {
          accessorKey: 'margin_percentage',
          header: 'Margin %',
          cell: (info) => {
            const value = info.getValue();
            return (
              <Chip
                label={`${value?.toFixed(1) || '0.0'}%`}
                size="small"
                color={value > 15 ? 'success' : value > 5 ? 'warning' : 'error'}
                variant="outlined"
              />
            );
          },
          size: 120,
        },
        {
          accessorKey: 'avg_order_value',
          header: 'Avg Order',
          cell: (info) => (
            <Typography variant="body2">
              ${info.getValue()?.toFixed(2) || '0.00'}
            </Typography>
          ),
          size: 120,
        },
        {
          accessorKey: 'total_orders',
          header: 'Orders',
          cell: (info) => (
            <Typography variant="body2">
              {info.getValue()?.toLocaleString() || '0'}
            </Typography>
          ),
          size: 100,
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
          id: 'actions',
          header: '',
          cell: ({ row }) => (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRow(row.original);
                setAnchorEl(e.currentTarget);
              }}
            >
              <MoreIcon />
            </IconButton>
          ),
          size: 50,
        },
      ];
    } else {
      // Transactions level columns
      return [
        {
          accessorKey: 'order_number',
          header: 'Order #',
          cell: (info) => (
            <Typography variant="body2" fontWeight={500} color="primary">
              {info.getValue()}
            </Typography>
          ),
          size: 120,
        },
        {
          accessorKey: 'customer',
          header: 'Customer',
          cell: (info) => (
            <Typography variant="body2">
              {info.getValue()}
            </Typography>
          ),
          size: 140,
        },
        {
          accessorKey: 'posting_date',
          header: 'Date',
          cell: (info) => (
            <Typography variant="body2">
              {new Date(info.getValue()).toLocaleDateString()}
            </Typography>
          ),
          size: 100,
        },
        {
          accessorKey: 'customer_segment',
          header: 'Segment',
          cell: (info) => (
            <Chip
              label={info.getValue()}
              size="small"
              variant="outlined"
            />
          ),
          size: 140,
        },
        {
          accessorKey: 'revenue',
          header: 'Revenue',
          cell: (info) => (
            <Typography variant="body2" fontWeight={500}>
              ${info.getValue()?.toFixed(2) || '0.00'}
            </Typography>
          ),
          size: 120,
        },
        {
          accessorKey: 'margin',
          header: 'Margin',
          cell: (info) => (
            <Typography variant="body2" fontWeight={500} color="success.main">
              ${info.getValue()?.toFixed(2) || '0.00'}
            </Typography>
          ),
          size: 120,
        },
        {
          accessorKey: 'margin_percentage',
          header: 'Margin %',
          cell: (info) => {
            const value = info.getValue();
            return (
              <Typography 
                variant="body2" 
                fontWeight={500}
                color={value > 15 ? 'success.main' : value > 5 ? 'warning.main' : 'error.main'}
              >
                {value?.toFixed(1) || '0.0'}%
              </Typography>
            );
          },
          size: 100,
        },
        {
          accessorKey: 'quantity',
          header: 'Quantity',
          cell: (info) => (
            <Typography variant="body2">
              {info.getValue()?.toFixed(1) || '0.0'}
            </Typography>
          ),
          size: 100,
        },
        {
          accessorKey: 'customer_lifetime_value',
          header: 'Customer LTV',
          cell: (info) => (
            <Typography variant="body2" color="primary">
              ${info.getValue()?.toLocaleString() || '0'}
            </Typography>
          ),
          size: 140,
        },
      ];
    }
  }, [drillDownLevel]);

  const table = useReactTable({
    data,
    columns: getColumns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  });

  const getBreadcrumbs = () => {
    const breadcrumbs = [
      {
        label: 'Products',
        level: 0,
        icon: <HomeIcon fontSize="small" />
      }
    ];

    if (drillDownLevel >= 1 && drillDownData.product) {
      breadcrumbs.push({
        label: `${drillDownData.product.product_id} - Segments`,
        level: 1,
        icon: <AnalyticsIcon fontSize="small" />
      });
    }

    if (drillDownLevel >= 2 && drillDownData.segment) {
      breadcrumbs.push({
        label: `${drillDownData.segment.segment_name} - Transactions`,
        level: 2,
        icon: <MoneyIcon fontSize="small" />
      });
    }

    return breadcrumbs;
  };

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
        Error loading data: {error}
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
                color: colors.text,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              MARGEN.AI
            </Link>
            <Typography sx={{ color: colors.primary }} variant="body1" fontWeight={600}>
              Product Overview
            </Typography>
          </Breadcrumbs>
          {onBack && (
            <Button startIcon={<BackIcon />} onClick={onBack} variant="outlined" size="small">
              Back to MargenAI
            </Button>
          )}
        </Stack>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: colors.border }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ color: colors.text }}>
              MargenAI Analytics
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              {data.length} {drillDownLevel === 0 ? 'products' : drillDownLevel === 1 ? 'segments' : 'transactions'} • Real PostgreSQL Data
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            {drillDownLevel > 0 && (
              <Button
                variant="outlined"
                startIcon={<BackIcon />}
                size="small"
                onClick={() => handleDrillUp(drillDownLevel - 1)}
                sx={{ borderColor: 'divider' }}
              >
                Back
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              size="small"
              onClick={loadProductsData}
              sx={{ borderColor: 'divider' }}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              size="small"
              sx={{ borderColor: 'divider' }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              size="small"
              sx={{ bgcolor: '#0070f2' }}
            >
              Analyze
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Breadcrumbs */}
      {drillDownLevel > 0 && (
        <Box sx={{ p: 2, bgcolor: darkMode ? '#161b22' : '#f5f5f5', borderBottom: 1, borderColor: colors.border }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            {getBreadcrumbs().map((crumb, index) => (
              <Link
                key={crumb.level}
                component="button"
                variant="body2"
                onClick={() => handleDrillUp(crumb.level)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  textDecoration: 'none',
                  cursor: index < getBreadcrumbs().length - 1 ? 'pointer' : 'default',
                  color: index < getBreadcrumbs().length - 1 ? colors.primary : colors.text,
                  fontWeight: index === getBreadcrumbs().length - 1 ? 600 : 400,
                }}
              >
                {crumb.icon}
                {crumb.label}
              </Link>
            ))}
          </Breadcrumbs>
        </Box>
      )}

      {/* Filters - Only show on products level */}
      {drillDownLevel === 0 && (
        <Box sx={{ p: 2, bgcolor: darkMode ? '#161b22' : '#f5f5f5', borderBottom: 1, borderColor: colors.border }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="Search products..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Profitability</InputLabel>
              <Select
                value={profitabilityFilter}
                label="Profitability"
                onChange={(e) => setProfitabilityFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="High Profit">High Profit</MenuItem>
                <MenuItem value="Good Profit">Good Profit</MenuItem>
                <MenuItem value="Low Profit">Low Profit</MenuItem>
                <MenuItem value="Minimal Profit">Minimal Profit</MenuItem>
                <MenuItem value="Loss Making">Loss Making</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Margin Range</InputLabel>
              <Select
                value={marginRangeFilter}
                label="Margin Range"
                onChange={(e) => setMarginRangeFilter(e.target.value)}
              >
                <MenuItem value="all">All Ranges</MenuItem>
                <MenuItem value="25+">25% and above</MenuItem>
                <MenuItem value="15-25">15% - 25%</MenuItem>
                <MenuItem value="5-15">5% - 15%</MenuItem>
                <MenuItem value="0-5">0% - 5%</MenuItem>
                <MenuItem value="negative">Below 0%</MenuItem>
              </Select>
            </FormControl>
            <IconButton size="small">
              <FilterIcon />
            </IconButton>
          </Stack>
        </Box>
      )}

      {/* Table */}
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} style={{ backgroundColor: darkMode ? '#161b22' : '#fafafa' }}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: `2px solid ${colors.border}`,
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: colors.text,
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
                  borderBottom: `1px solid ${colors.border}`,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255,255,255,0.05)' : '#f5f5f5')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                onClick={() => {
                  if (drillDownLevel < 2) {
                    handleDrillDown(row.original, drillDownLevel + 1);
                  }
                  if (onRowClick) onRowClick(row.original);
                }}
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

      {/* Pagination */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: darkMode ? '#161b22' : 'transparent' }}>
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          {Object.keys(rowSelection).length} of {data.length} row(s) selected
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            size="small"
            onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
            disabled={!pagination.hasPrev}
          >
            Previous
          </Button>
          <Typography variant="body2">
            Page {Math.floor(pagination.offset / pagination.limit) + 1}
          </Typography>
          <Button
            size="small"
            onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
            disabled={!pagination.hasNext}
          >
            Next
          </Button>
        </Stack>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          if (selectedRow && drillDownLevel < 2) {
            handleDrillDown(selectedRow, drillDownLevel + 1);
          }
          setAnchorEl(null);
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {drillDownLevel === 0 ? 'View Segments' : 'View Transactions'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon>
            <AnalyticsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Analyze</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export</ListItemText>
        </MenuItem>
      </Menu>
      </Paper>
    </Box>
  );
};

export default MargenAITable;