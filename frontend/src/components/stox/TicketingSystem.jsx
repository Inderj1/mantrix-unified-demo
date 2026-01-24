import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Button, Stack,
  IconButton, Tooltip, alpha, Select, MenuItem, FormControl, InputLabel, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, Table, TableBody, TableCell, TableRow
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ConfirmationNumber as TicketIcon,
  Refresh,
  ArrowBack as ArrowBackIcon,
  Download,
  CheckCircle,
  Schedule,
  Error as ErrorIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useTickets, cancelTicket } from '../../hooks/useTickets';
import stoxTheme from './stoxTheme';

const TicketingSystem = ({ onBack }) => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Filter tickets by module on frontend
  const { tickets: apiTickets, loading, refresh } = useTickets({
    status: statusFilter,
    type: typeFilter,
    priority: priorityFilter,
    searchTerm: searchTerm,
  });

  // Generate demo data when API returns empty - Arizona Beverages Supply Chain
  const generateDemoTickets = () => {
    const demoData = [
      // Critical inventory alerts
      { ticket_id: 1001, source_module: "STOX.AI", ticket_type: "SHORTAGE_ALERT", title: "Low Stock: Hwaseong Douglas (65%)", description: "Samsung order at risk. Transfer from Taiwan initiated.", priority: "Critical", status: "In Progress", user_name: "Stox.AI", created_at: new Date(Date.now() - 1*60*60*1000).toISOString(), updated_at: new Date().toISOString() },
      { ticket_id: 1002, source_module: "STOX.AI", ticket_type: "DEMAND_SURGE", title: "TSMC N3 Expansion: +40% Demand", description: "Etch system demand surge. Taiwan plant capacity review needed.", priority: "Critical", status: "Open", user_name: "Forecast.AI", created_at: new Date(Date.now() - 2*60*60*1000).toISOString(), updated_at: new Date().toISOString() },
      { ticket_id: 1003, source_module: "STOX.AI", ticket_type: "SHIPMENT_DELAYED", title: "SHP-002 Oregon Delayed +6hrs", description: "MKS RF Power Supply delayed due to weather. Santa Clarita notified.", priority: "High", status: "In Progress", user_name: "Logistics.AI", created_at: new Date(Date.now() - 3*60*60*1000).toISOString(), updated_at: new Date().toISOString() },
      { ticket_id: 1004, source_module: "STOX.AI", ticket_type: "REALLOCATION_EXECUTED", title: "Transfer: Taiwan → Douglas (3 units)", description: "Green Tea 24PKs transfer to prevent Samsung stockout. Savings: $850K.", priority: "High", status: "Completed", user_name: "System", created_at: new Date(Date.now() - 5*60*60*1000).toISOString(), updated_at: new Date().toISOString() },
      { ticket_id: 1005, source_module: "STOX.AI", ticket_type: "SAFETY_STOCK_ADJUSTED", title: "Keasbey Safety Stock -15 units", description: "Released $675K working capital. MRP parameters updated.", priority: "Medium", status: "Completed", user_name: "WorkingCap.AI", created_at: new Date(Date.now() - 8*60*60*1000).toISOString(), updated_at: new Date().toISOString() },
      { ticket_id: 1006, source_module: "Enterprise Pulse", ticket_type: "PULSE_ALERT", title: "2 Plants Below 70% Threshold", description: "Douglas (65%) and Austria (58%) require immediate attention.", priority: "Critical", status: "Open", user_name: "Stox.AI", created_at: new Date(Date.now() - 30*60*1000).toISOString(), updated_at: new Date().toISOString() },
    ];
    return demoData;
  };

  // Use API data if available, otherwise use demo data
  const allTickets = apiTickets.length > 0 ? apiTickets : generateDemoTickets();

  const tickets = moduleFilter === 'All'
    ? allTickets
    : allTickets.filter(t => t.source_module === moduleFilter);

  // Helper function to format ticket ID
  const formatTicketId = (ticket) => {
    const modulePrefix = {
      'MARGEN.AI': 'MARGEN',
      'REVEQ.AI': 'REVEQ',
      'Enterprise Pulse': 'PULSE',
      'STOX.AI': 'STOX',
    };
    const prefix = modulePrefix[ticket.source_module] || 'TKT';
    return `TKT-${prefix}-${String(ticket.ticket_id).padStart(4, '0')}`;
  };

  // Debug logging
  useEffect(() => {
    console.log('📋 COMMAND TOWER - Tickets loaded:', tickets.length, tickets);
  }, [tickets]);

  // Calculate metrics
  const metrics = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    completed: tickets.filter(t => t.status === 'Completed').length,
    failed: tickets.filter(t => t.status === 'Failed').length,
    cancelled: tickets.filter(t => t.status === 'Cancelled').length,
  };

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setDetailsOpen(true);
  };

  const handleCancelTicket = (ticket) => {
    setSelectedTicket(ticket);
    setCancelDialogOpen(true);
  };

  const confirmCancelTicket = () => {
    if (selectedTicket && cancelReason.trim()) {
      cancelTicket(selectedTicket.ticket_id, cancelReason);
      setCancelDialogOpen(false);
      setCancelReason('');
      setSelectedTicket(null);
      refresh();
    }
  };

  const columns = [
    {
      field: 'ticket_id',
      headerName: 'Ticket ID',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: '#2b88d8',
            fontSize: '0.8rem',
            cursor: 'pointer',
            '&:hover': {
              color: '#005a9e',
              textDecoration: 'underline',
            }
          }}
          onClick={() => handleViewDetails(params.row)}
        >
          {formatTicketId(params.row)}
        </Typography>
      ),
    },
    {
      field: 'source_module',
      headerName: 'Module',
      minWidth: 140,
      flex: 0.8,
      renderCell: (params) => {
        const moduleColors = {
          'STOX.AI': '#10b981',
          'ORDLY.AI': '#0ea5e9',
          'MARGEN.AI': '#8b5cf6',
          'AXIS.AI': '#f59e0b',
          'Enterprise Pulse': '#ef4444',
        };
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              bgcolor: alpha(moduleColors[params.value] || '#64748b', 0.1),
              color: moduleColors[params.value] || '#64748b',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        );
      },
    },
    {
      field: 'ticket_type',
      headerName: 'Type',
      minWidth: 160,
      flex: 1.2,
      renderCell: (params) => {
        const typeColors = {
          // STOX.AI - Inventory
          'REORDER_TRIGGERED': '#10b981',
          'SAFETY_STOCK_ADJUSTED': '#059669',
          'REALLOCATION_EXECUTED': '#10b981',
          'SHORTAGE_ALERT': '#ef4444',
          'WORKING_CAPITAL_OPT': '#10b981',
          'MRP_PARAMETER_CHANGE': '#059669',
          'STORE_REPLENISHMENT': '#10b981',
          // STOX.AI - Logistics
          'SHIPMENT_DELAYED': '#f97316',
          'SHIPMENT_EXPEDITED': '#0ea5e9',
          // STOX.AI - Demand
          'DEMAND_SURGE': '#ef4444',
          'FORECAST_UPDATED': '#06b6d4',
          // STOX.AI - Vendor
          'VENDOR_LEAD_TIME': '#f59e0b',
          'VENDOR_QUALITY': '#f59e0b',
          // STOX.AI - SAP
          'SAP_WRITEBACK': '#8b5cf6',
          // ORDLY.AI
          'ORDER_COMMITTED': '#0ea5e9',
          'DEMAND_SIGNAL': '#0ea5e9',
          'NETWORK_OPTIMIZED': '#0ea5e9',
          'ARBITRATION': '#0891b2',
          'PROMISE_UPDATE': '#0ea5e9',
          // MARGEN.AI
          'MARGIN_ALERT': '#ef4444',
          'CLV_UPDATED': '#8b5cf6',
          'SEGMENT_CHANGE': '#8b5cf6',
          'CHURN_RISK': '#ef4444',
          'REVENUE_FORECAST': '#8b5cf6',
          // AXIS.AI
          'SCENARIO_CREATED': '#f59e0b',
          'BUDGET_ALERT': '#ef4444',
          // Enterprise Pulse
          'PULSE_AGENT_EXEC': '#ef4444',
          'PULSE_ALERT': '#f97316',
          'PULSE_CONFIG': '#64748b',
        };
        const typeLabels = {
          // STOX.AI - Inventory
          'REORDER_TRIGGERED': 'Reorder Triggered',
          'SAFETY_STOCK_ADJUSTED': 'Safety Stock Adjusted',
          'REALLOCATION_EXECUTED': 'Reallocation',
          'SHORTAGE_ALERT': 'Shortage Alert',
          'WORKING_CAPITAL_OPT': 'WC Optimized',
          'MRP_PARAMETER_CHANGE': 'MRP Changed',
          'STORE_REPLENISHMENT': 'Store Replenishment',
          // STOX.AI - Logistics
          'SHIPMENT_DELAYED': 'Shipment Delayed',
          'SHIPMENT_EXPEDITED': 'Shipment Expedited',
          // STOX.AI - Demand
          'DEMAND_SURGE': 'Demand Surge',
          'FORECAST_UPDATED': 'Forecast Updated',
          // STOX.AI - Vendor
          'VENDOR_LEAD_TIME': 'Vendor Lead Time',
          'VENDOR_QUALITY': 'Vendor Quality',
          // STOX.AI - SAP
          'SAP_WRITEBACK': 'SAP Writeback',
          // ORDLY.AI
          'ORDER_COMMITTED': 'Order Committed',
          'DEMAND_SIGNAL': 'Demand Signal',
          'NETWORK_OPTIMIZED': 'Network Optimized',
          'ARBITRATION': 'Arbitration',
          'PROMISE_UPDATE': 'Promise Update',
          // MARGEN.AI
          'MARGIN_ALERT': 'Margin Alert',
          'CLV_UPDATED': 'CLV Updated',
          'SEGMENT_CHANGE': 'Segment Change',
          'CHURN_RISK': 'Churn Risk',
          'REVENUE_FORECAST': 'Revenue Forecast',
          // AXIS.AI
          'SCENARIO_CREATED': 'Scenario Created',
          'BUDGET_ALERT': 'Budget Alert',
          // Enterprise Pulse
          'PULSE_AGENT_EXEC': 'Pulse Agent Exec',
          'PULSE_ALERT': 'Pulse Alert',
          'PULSE_CONFIG': 'Pulse Config',
        };
        return (
          <Chip
            label={typeLabels[params.value] || params.value?.replace(/_/g, ' ')}
            size="small"
            sx={{
              bgcolor: alpha(typeColors[params.value] || '#64748b', 0.1),
              color: typeColors[params.value] || '#64748b',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        );
      },
    },
    {
      field: 'title',
      headerName: 'Operation Title',
      minWidth: 250,
      flex: 2,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      minWidth: 280,
      flex: 2.5,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'user_name',
      headerName: 'User/Agent',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
          {params.value || 'System'}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 130,
      flex: 1,
      renderCell: (params) => {
        const statusColors = {
          'Open': 'primary',
          'In Progress': 'info',
          'Completed': 'success',
          'Failed': 'error',
          'Cancelled': 'default',
        };
        const statusIcons = {
          'Open': <Schedule fontSize="small" />,
          'In Progress': <Schedule fontSize="small" />,
          'Completed': <CheckCircle fontSize="small" />,
          'Failed': <ErrorIcon fontSize="small" />,
          'Cancelled': <CancelIcon fontSize="small" />,
        };
        return (
          <Chip
            label={params.value}
            color={statusColors[params.value] || 'default'}
            size="small"
            icon={statusIcons[params.value]}
            sx={{ fontWeight: 600, fontSize: '0.7rem' }}
          />
        );
      },
    },
    {
      field: 'priority',
      headerName: 'Priority',
      minWidth: 100,
      flex: 0.8,
      renderCell: (params) => {
        const priorityColors = {
          'High': '#ef4444',
          'Normal': '#2b88d8',
          'Low': '#64748b',
        };
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              bgcolor: alpha(priorityColors[params.value] || '#64748b', 0.1),
              color: priorityColors[params.value] || '#64748b',
              fontWeight: 600,
              fontSize: '0.65rem',
            }}
          />
        );
      },
    },
    {
      field: 'created_at',
      headerName: 'Timestamp',
      minWidth: 160,
      flex: 1.2,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
          {new Date(params.value).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 120,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => handleViewDetails(params.row)}
              sx={{ color: '#2b88d8' }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {(params.row.status === 'Open' || params.row.status === 'In Progress') && (
            <Tooltip title="Cancel Ticket">
              <IconButton
                size="small"
                onClick={() => handleCancelTicket(params.row)}
                sx={{ color: '#ef4444' }}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 0, mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TicketIcon sx={{ fontSize: 40, color: '#10b981' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={600}>
              COMMAND TOWER
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Action tracking & audit trail for all execution operations
            </Typography>
          </Box>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
            Back
          </Button>
        </Box>
      </Paper>

      {/* Metrics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: alpha('#2b88d8', 0.05), borderLeft: `4px solid #2b88d8` }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Total Tickets</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#2b88d8' }}>{metrics.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: alpha('#2b88d8', 0.05), borderLeft: `4px solid #2b88d8` }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Open</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#2b88d8' }}>{metrics.open}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: alpha('#06b6d4', 0.05), borderLeft: `4px solid #06b6d4` }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>In Progress</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#06b6d4' }}>{metrics.inProgress}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: alpha('#10b981', 0.05), borderLeft: `4px solid #10b981` }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Completed</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#10b981' }}>{metrics.completed}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: alpha('#ef4444', 0.05), borderLeft: `4px solid #ef4444` }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Failed</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#ef4444' }}>{metrics.failed}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: alpha('#64748b', 0.05), borderLeft: `4px solid #64748b` }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Cancelled</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#64748b' }}>{metrics.cancelled}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FilterListIcon sx={{ color: 'text.secondary' }} />
          <TextField
            size="small"
            placeholder="Search operations, users, descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 320 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Module</InputLabel>
            <Select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} label="Module">
              <MenuItem value="All">All Modules</MenuItem>
              <MenuItem value="STOX.AI">STOX.AI</MenuItem>
              <MenuItem value="ORDLY.AI">ORDLY.AI</MenuItem>
              <MenuItem value="MARGEN.AI">MARGEN.AI</MenuItem>
              <MenuItem value="AXIS.AI">AXIS.AI</MenuItem>
              <MenuItem value="Enterprise Pulse">Enterprise Pulse</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} label="Type">
              <MenuItem value="All">All Types</MenuItem>
              {/* STOX.AI */}
              <MenuItem value="REORDER_TRIGGERED">Reorder Triggered</MenuItem>
              <MenuItem value="SAFETY_STOCK_ADJUSTED">Safety Stock Adjusted</MenuItem>
              <MenuItem value="REALLOCATION_EXECUTED">Reallocation</MenuItem>
              <MenuItem value="SHORTAGE_ALERT">Shortage Alert</MenuItem>
              <MenuItem value="STORE_REPLENISHMENT">Store Replenishment</MenuItem>
              {/* ORDLY.AI */}
              <MenuItem value="ORDER_COMMITTED">Order Committed</MenuItem>
              <MenuItem value="DEMAND_SIGNAL">Demand Signal</MenuItem>
              <MenuItem value="NETWORK_OPTIMIZED">Network Optimized</MenuItem>
              <MenuItem value="ARBITRATION">Arbitration</MenuItem>
              {/* MARGEN.AI */}
              <MenuItem value="MARGIN_ALERT">Margin Alert</MenuItem>
              <MenuItem value="CLV_UPDATED">CLV Updated</MenuItem>
              <MenuItem value="SEGMENT_CHANGE">Segment Change</MenuItem>
              <MenuItem value="CHURN_RISK">Churn Risk</MenuItem>
              {/* AXIS.AI */}
              <MenuItem value="FORECAST_UPDATED">Forecast Updated</MenuItem>
              <MenuItem value="BUDGET_ALERT">Budget Alert</MenuItem>
              {/* Enterprise Pulse */}
              <MenuItem value="PULSE_AGENT_EXEC">Pulse Agent Exec</MenuItem>
              <MenuItem value="PULSE_ALERT">Pulse Alert</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Failed">Failed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} label="Priority">
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ flex: 1 }} />
          <Button startIcon={<Refresh />} onClick={refresh} variant="outlined" size="small">
            Refresh
          </Button>
          <Button startIcon={<Download />} variant="outlined" size="small">
            Export
          </Button>
        </Stack>
      </Paper>

      {/* Data Grid */}
      <Paper elevation={0} sx={{ height: 600, border: '1px solid', borderColor: 'divider' }}>
        <DataGrid
          rows={tickets}
          columns={columns}
          getRowId={(row) => row.ticket_id}
          loading={loading}
          density="compact"
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          checkboxSelection
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          sx={stoxTheme.getDataGridSx({ clickable: true })}
        />
      </Paper>

      {/* Ticket Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <TicketIcon sx={{ color: '#2b88d8' }} />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Operation Details
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                {selectedTicket && formatTicketId(selectedTicket)}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Box>
              {/* Status and Priority */}
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={selectedTicket.status} color={selectedTicket.status === 'Completed' ? 'success' : selectedTicket.status === 'Failed' ? 'error' : 'primary'} size="small" />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Priority</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={selectedTicket.priority} size="small" sx={{ bgcolor: alpha(selectedTicket.priority === 'High' ? '#ef4444' : '#2b88d8', 0.1), color: selectedTicket.priority === 'High' ? '#ef4444' : '#2b88d8' }} />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Type</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={selectedTicket.ticket_type} size="small" />
                  </Box>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              {/* Basic Info */}
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, width: '30%' }}>Module</TableCell>
                    <TableCell>{selectedTicket.source_module}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Source Tile</TableCell>
                    <TableCell>{selectedTicket.source_tile || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{selectedTicket.title}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell>{selectedTicket.description}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>User/Agent</TableCell>
                    <TableCell>{selectedTicket.user_name || 'System'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                    <TableCell>{new Date(selectedTicket.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Last Updated</TableCell>
                    <TableCell>{new Date(selectedTicket.updated_at).toLocaleString()}</TableCell>
                  </TableRow>
                  {selectedTicket.completed_at && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Completed</TableCell>
                      <TableCell>{new Date(selectedTicket.completed_at).toLocaleString()}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <Divider sx={{ my: 2 }} />

              {/* Operational Metadata */}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Operational Details
              </Typography>
              <Box sx={{ bgcolor: alpha('#2b88d8', 0.05), p: 2, borderRadius: 1, border: '1px solid', borderColor: alpha('#2b88d8', 0.2) }}>
                {selectedTicket.metadata && Object.keys(selectedTicket.metadata).length > 0 ? (
                  <Table size="small">
                    <TableBody>
                      {Object.entries(selectedTicket.metadata).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell sx={{ fontWeight: 600, width: '40%', border: 'none', py: 0.5 }}>
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </TableCell>
                          <TableCell sx={{ border: 'none', py: 0.5, fontFamily: typeof value === 'number' ? 'monospace' : 'inherit' }}>
                            {typeof value === 'number' ? value.toLocaleString() : String(value)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No additional operational details available
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Ticket Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Ticket</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to cancel operation <strong>{selectedTicket && formatTicketId(selectedTicket)}</strong>?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Cancellation Reason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Please provide a reason for cancelling this ticket..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCancelDialogOpen(false); setCancelReason(''); }}>
            Back
          </Button>
          <Button onClick={confirmCancelTicket} variant="contained" color="error" disabled={!cancelReason.trim()}>
            Cancel Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketingSystem;
