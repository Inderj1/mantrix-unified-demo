import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
} from '@mui/icons-material';
import { getColors } from '../../config/brandColors';
import { ALERT_TYPE_LABELS } from './kitAlertMockData';

const getMenuProps = (darkMode, colors) => ({
  PaperProps: {
    sx: {
      bgcolor: darkMode ? colors.cardBg : undefined,
      border: darkMode ? `1px solid ${colors.border}` : undefined,
      '& .MuiMenuItem-root': {
        color: colors.text,
        '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : undefined },
        '&.Mui-selected': { bgcolor: darkMode ? 'rgba(77,166,255,0.15)' : undefined },
      },
    },
  },
});

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical': return 'error';
    case 'high': return 'warning';
    case 'warning': return 'info';
    case 'opportunity': return 'success';
    case 'info': return 'default';
    default: return 'default';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'new': return 'error';
    case 'acknowledged': return 'warning';
    case 'in_progress': return 'info';
    case 'snoozed': return 'default';
    case 'resolved': return 'success';
    case 'simulated': return 'info';
    case 'executed': return 'success';
    case 'pending_approval': return 'warning';
    default: return 'default';
  }
};

const getSourceColor = (source, colors) => {
  switch (source) {
    case 'COPA': return colors.primary;
    case 'STOX': return colors.accent;
    case 'ML': return colors.warning;
    default: return colors.textSecondary;
  }
};

const UnifiedAlertsGrid = ({
  alerts = [],
  darkMode = false,
  onAlertClick,
  alertCategories = {},
}) => {
  const colors = getColors(darkMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  // Assign source to each alert based on type
  const alertsWithSource = useMemo(() =>
    alerts.map((a) => ({
      ...a,
      source: a.source || (
        alertCategories.copa_profitability?.includes(a.type) ? 'COPA'
        : alertCategories.stox_inventory?.includes(a.type) ? 'STOX'
        : 'ML'
      ),
    })),
    [alerts, alertCategories]
  );

  // Filter
  const filteredAlerts = useMemo(() => {
    let filtered = [...alertsWithSource];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((a) =>
        a.title.toLowerCase().includes(query) ||
        a.message.toLowerCase().includes(query) ||
        (a.customer?.name || '').toLowerCase().includes(query) ||
        (a.quote_id || '').toLowerCase().includes(query) ||
        (a.material || '').toLowerCase().includes(query)
      );
    }
    if (severityFilter !== 'all') {
      filtered = filtered.filter((a) => a.severity === severityFilter);
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter((a) => a.type === typeFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((a) => alertCategories[categoryFilter]?.includes(a.type));
    }
    if (sourceFilter !== 'all') {
      filtered = filtered.filter((a) => a.source === sourceFilter);
    }
    return filtered;
  }, [alertsWithSource, searchQuery, severityFilter, typeFilter, statusFilter, categoryFilter, sourceFilter, alertCategories]);

  // Columns
  const columns = useMemo(() => [
    {
      field: 'source',
      headerName: 'Source',
      width: 90,
      renderCell: (params) => {
        const color = getSourceColor(params.value, colors);
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.65rem',
              fontWeight: 700,
              bgcolor: alpha(color, 0.12),
              color: color,
            }}
          />
        );
      },
    },
    {
      field: 'severity',
      headerName: 'Priority',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={params.value === 'opportunity' ? 'Opportunity' : params.value}
          size="small"
          color={getSeverityColor(params.value)}
          sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 160,
      renderCell: (params) => (
        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
          {ALERT_TYPE_LABELS[params.value] || params.value}
        </Typography>
      ),
    },
    {
      field: 'title',
      headerName: 'Insight',
      flex: 3,
      minWidth: 300,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.message}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'customer',
      headerName: 'Customer',
      width: 140,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>{params.value?.name || '-'}</Typography>
          <Typography variant="caption" color="text.secondary">{params.value?.segment}</Typography>
        </Box>
      ),
    },
    {
      field: 'revenue_impact',
      headerName: 'Impact',
      width: 110,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} color={params.row.severity === 'opportunity' ? 'success.main' : 'error.main'}>
          ${(params.value || 0).toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value.replace(/_/g, ' ')}
          size="small"
          color={getStatusColor(params.value)}
          variant="outlined"
          sx={{ height: 20, fontSize: '0.65rem', textTransform: 'capitalize' }}
        />
      ),
    },
    {
      field: 'triggered_at',
      headerName: 'Triggered',
      width: 140,
      renderCell: (params) => (
        <Typography variant="caption" color="text.secondary">
          {new Date(params.value).toLocaleString()}
        </Typography>
      ),
    },
  ], [colors]);

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: darkMode ? colors.paper : undefined,
      color: colors.text,
      '& fieldset': { borderColor: colors.border },
      '&:hover fieldset': { borderColor: colors.primary },
    },
    '& .MuiInputBase-input': { color: colors.text },
  };

  const selectSx = {
    '& .MuiInputLabel-root': { color: colors.textSecondary },
    '& .MuiOutlinedInput-root': {
      bgcolor: darkMode ? colors.paper : undefined,
      color: colors.text,
      '& fieldset': { borderColor: colors.border },
    },
    '& .MuiSelect-icon': { color: colors.textSecondary },
  };

  return (
    <Card variant="outlined" sx={{ mx: 2, bgcolor: colors.cardBg, borderColor: colors.border }}>
      <CardContent>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: colors.text, mb: 2 }}>
          ALERTS & INSIGHTS
        </Typography>

        {/* Filters */}
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} md={2.5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search insights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: colors.textSecondary }} />
                  </InputAdornment>
                ),
              }}
              sx={inputSx}
            />
          </Grid>
          <Grid item xs={6} md={1.5}>
            <FormControl fullWidth size="small" sx={selectSx}>
              <InputLabel>Source</InputLabel>
              <Select value={sourceFilter} label="Source" onChange={(e) => setSourceFilter(e.target.value)} MenuProps={getMenuProps(darkMode, colors)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="COPA">COPA</MenuItem>
                <MenuItem value="STOX">STOX</MenuItem>
                <MenuItem value="ML">ML</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={1.5}>
            <FormControl fullWidth size="small" sx={selectSx}>
              <InputLabel>Priority</InputLabel>
              <Select value={severityFilter} label="Priority" onChange={(e) => setSeverityFilter(e.target.value)} MenuProps={getMenuProps(darkMode, colors)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="opportunity">Opportunity</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small" sx={selectSx}>
              <InputLabel>Category</InputLabel>
              <Select value={categoryFilter} label="Category" onChange={(e) => setCategoryFilter(e.target.value)} MenuProps={getMenuProps(darkMode, colors)}>
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem disabled sx={{ opacity: 0.7, fontWeight: 600, fontSize: '0.7rem' }}>— COPA Patterns —</MenuItem>
                <MenuItem value="copa_profitability">COPA Profitability</MenuItem>
                <MenuItem disabled sx={{ opacity: 0.7, fontWeight: 600, fontSize: '0.7rem' }}>— STOX Patterns —</MenuItem>
                <MenuItem value="stox_inventory">STOX Inventory</MenuItem>
                <MenuItem disabled sx={{ opacity: 0.7, fontWeight: 600, fontSize: '0.7rem' }}>— ML Intelligence —</MenuItem>
                <MenuItem value="pricing_intelligence">Pricing Intelligence</MenuItem>
                <MenuItem value="customer_intelligence">Customer Intelligence</MenuItem>
                <MenuItem value="operations_intelligence">Operations</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small" sx={selectSx}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)} MenuProps={getMenuProps(darkMode, colors)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="acknowledged">Acknowledged</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="snoozed">Snoozed</MenuItem>
                <MenuItem value="simulated">Simulated</MenuItem>
                <MenuItem value="executed">Executed</MenuItem>
                <MenuItem value="pending_approval">Pending Approval</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* DataGrid */}
        <Paper sx={{ width: '100%', bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
          <DataGrid
            rows={filteredAlerts}
            columns={columns}
            density="standard"
            checkboxSelection
            disableRowSelectionOnClick
            autoHeight
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
            initialState={{ pagination: { paginationModel: { pageSize: 12 } } }}
            pageSizeOptions={[12, 25, 50]}
            onRowClick={(params) => onAlertClick?.(params.row)}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: darkMode ? '#21262d' : '#f8fafc',
                color: colors.text,
                borderBottom: `1px solid ${colors.border}`,
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 600,
                color: colors.text,
              },
              '& .MuiDataGrid-cell': {
                borderBottom: `1px solid ${colors.border}`,
                color: colors.text,
              },
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                },
              },
              '& .MuiDataGrid-footerContainer': {
                bgcolor: darkMode ? '#21262d' : '#f8fafc',
                borderTop: `1px solid ${colors.border}`,
                color: colors.text,
              },
              '& .MuiTablePagination-root': { color: colors.text },
              '& .MuiDataGrid-toolbarContainer': {
                bgcolor: darkMode ? '#161b22' : undefined,
                '& .MuiButton-root': { color: colors.text },
                '& .MuiInputBase-root': { color: colors.text },
              },
              '& .MuiCheckbox-root': { color: colors.textSecondary },
              '& .MuiDataGrid-selectedRowCount': { color: colors.textSecondary },
            }}
            localeText={{ noRowsLabel: 'No insights matching current filters' }}
          />
        </Paper>
      </CardContent>
    </Card>
  );
};

export default UnifiedAlertsGrid;
