import React, { useState, useMemo } from 'react';
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
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalShipping as ShippingIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

// Sample data for Madison Reed inventory
const sampleInventoryData = [
  {
    id: 'SKU001',
    productName: 'Siena Brown - 24pk 4oz',
    sku: 'MB-SB-24-4',
    category: 'Hair Color',
    shade: 'Siena Brown',
    currentStock: 2450,
    mlPredictedDemand: 3200,
    rawDemand: 2800,
    variance: 14.3,
    stockStatus: 'optimal',
    location: 'Phoenix DC',
    coordinates: { lat: 33.4484, lng: -112.0740 },
    lastUpdated: 'Jun 15, 2024',
    reorderPoint: 1500,
    leadTime: '14 days',
    supplier: 'Italian Color Labs',
    unitCost: 12.50,
    totalValue: 30625,
  },
  {
    id: 'SKU002',
    productName: 'Ravenna Red - 12pk 6oz',
    sku: 'MB-RR-12-6',
    category: 'Hair Color',
    shade: 'Ravenna Red',
    currentStock: 890,
    mlPredictedDemand: 1850,
    rawDemand: 1200,
    variance: 54.2,
    stockStatus: 'low',
    location: 'Los Angeles DC',
    coordinates: { lat: 34.0522, lng: -118.2437 },
    lastUpdated: 'Jun 15, 2024',
    reorderPoint: 1000,
    leadTime: '21 days',
    supplier: 'Italian Color Labs',
    unitCost: 15.75,
    totalValue: 14017.50,
  },
  {
    id: 'SKU003',
    productName: 'Palermo Black - 48pk 3oz',
    sku: 'MB-PB-48-3',
    category: 'Hair Color',
    shade: 'Palermo Black',
    currentStock: 5200,
    mlPredictedDemand: 4800,
    rawDemand: 5100,
    variance: -5.9,
    stockStatus: 'excess',
    location: 'Dallas DC',
    coordinates: { lat: 32.7767, lng: -96.7970 },
    lastUpdated: 'Jun 14, 2024',
    reorderPoint: 3000,
    leadTime: '10 days',
    supplier: 'Italian Color Labs',
    unitCost: 11.25,
    totalValue: 58500,
  },
  {
    id: 'SKU004',
    productName: 'Valencia Blonde - 24pk 4oz',
    sku: 'MB-VB-24-4',
    category: 'Hair Color',
    shade: 'Valencia Blonde',
    currentStock: 450,
    mlPredictedDemand: 2100,
    rawDemand: 1500,
    variance: 40.0,
    stockStatus: 'critical',
    location: 'Miami DC',
    coordinates: { lat: 25.7617, lng: -80.1918 },
    lastUpdated: 'Jun 15, 2024',
    reorderPoint: 1200,
    leadTime: '7 days',
    supplier: 'Italian Color Labs',
    unitCost: 13.50,
    totalValue: 6075,
  },
  {
    id: 'SKU005',
    productName: 'Root Touch-Up Kit - Brown',
    sku: 'MB-RTU-BR',
    category: 'Touch-Up',
    shade: 'Universal Brown',
    currentStock: 3800,
    mlPredictedDemand: 3500,
    rawDemand: 3600,
    variance: -2.8,
    stockStatus: 'optimal',
    location: 'Phoenix DC',
    coordinates: { lat: 33.4484, lng: -112.0740 },
    lastUpdated: 'Jun 15, 2024',
    reorderPoint: 2000,
    leadTime: '5 days',
    supplier: 'Madison Reed Labs',
    unitCost: 8.95,
    totalValue: 34010,
  },
];

const InventoryTable = ({ onRowClick }) => {
  const [data] = useState(sampleInventoryData);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);

  const columns = useMemo(
    () => [
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
        accessorKey: 'sku',
        header: 'SKU',
        cell: (info) => (
          <Typography variant="body2" fontWeight={500} color="primary">
            {info.getValue()}
          </Typography>
        ),
        size: 120,
      },
      {
        accessorKey: 'productName',
        header: 'Product Name',
        cell: (info) => (
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {info.getValue()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {info.row.original.shade}
            </Typography>
          </Box>
        ),
        size: 250,
      },
      {
        accessorKey: 'currentStock',
        header: 'Current Stock',
        cell: (info) => {
          const status = info.row.original.stockStatus;
          const value = info.getValue();
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                {value.toLocaleString()}
              </Typography>
              {status === 'critical' && <WarningIcon color="error" fontSize="small" />}
              {status === 'low' && <WarningIcon color="warning" fontSize="small" />}
              {status === 'optimal' && <CheckIcon color="success" fontSize="small" />}
            </Box>
          );
        },
        size: 140,
      },
      {
        accessorKey: 'mlPredictedDemand',
        header: 'ML Predicted',
        cell: (info) => (
          <Box>
            <Typography variant="body2" fontWeight={500} color="primary">
              {info.getValue().toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              units/month
            </Typography>
          </Box>
        ),
        size: 120,
      },
      {
        accessorKey: 'rawDemand',
        header: 'Raw Demand',
        cell: (info) => (
          <Typography variant="body2">
            {info.getValue().toLocaleString()}
          </Typography>
        ),
        size: 110,
      },
      {
        accessorKey: 'variance',
        header: 'Variance %',
        cell: (info) => {
          const value = info.getValue();
          const isPositive = value > 0;
          return (
            <Chip
              label={`${isPositive ? '+' : ''}${value}%`}
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
        accessorKey: 'location',
        header: 'Location',
        cell: (info) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ShippingIcon fontSize="small" color="action" />
            <Typography variant="body2">{info.getValue()}</Typography>
          </Box>
        ),
        size: 140,
      },
      {
        accessorKey: 'totalValue',
        header: 'Total Value',
        cell: (info) => (
          <Typography variant="body2" fontWeight={500}>
            ${info.getValue().toLocaleString()}
          </Typography>
        ),
        size: 120,
      },
      {
        accessorKey: 'lastUpdated',
        header: 'Last Updated',
        cell: (info) => (
          <Typography variant="body2" color="text.secondary">
            {info.getValue()}
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
              setAnchorEl(e.currentTarget);
            }}
          >
            <MoreIcon />
          </IconButton>
        ),
        size: 50,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return '#f44336';
      case 'low': return '#ff9800';
      case 'optimal': return '#4caf50';
      case 'excess': return '#2196f3';
      default: return '#757575';
    }
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Inventory Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data.length} items • ML-Enhanced Predictions
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              size="small"
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
              Add Product
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Filters */}
      <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Search inventory..."
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
            <InputLabel>Stock Status</InputLabel>
            <Select value="all" label="Stock Status">
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="optimal">Optimal</MenuItem>
              <MenuItem value="excess">Excess</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Location</InputLabel>
            <Select value="all" label="Location">
              <MenuItem value="all">All Locations</MenuItem>
              <MenuItem value="phoenix">Phoenix DC</MenuItem>
              <MenuItem value="la">Los Angeles DC</MenuItem>
              <MenuItem value="dallas">Dallas DC</MenuItem>
              <MenuItem value="miami">Miami DC</MenuItem>
            </Select>
          </FormControl>
          <IconButton size="small">
            <FilterIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Table */}
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} style={{ backgroundColor: '#fafafa' }}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #e0e0e0',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: '#424242',
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
                  borderBottom: '1px solid #e0e0e0',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                onClick={() => onRowClick && onRowClick(row.original)}
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
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {Object.keys(rowSelection).length} of {data.length} row(s) selected
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            size="small"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Typography variant="body2">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </Typography>
          <Button
            size="small"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
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
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default InventoryTable;