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

const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const TicketingSystem = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
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
            color: '#1a5a9e',
            fontSize: '0.8rem',
            cursor: 'pointer',
            '&:hover': {
              color: '#002352',
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
        <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text }}>
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
        <Typography variant="body2" sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>
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
        <Typography variant="body2" sx={{ fontSize: '0.75rem', color: colors.text }}>
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
          'Normal': '#1a5a9e',
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
        <Typography variant="body2" sx={{ fontSize: '0.75rem', fontFamily: 'monospace', color: colors.text }}>
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
              sx={{ color: '#1a5a9e' }}
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

  // Helper for dark mode dropdown menus
  const getMenuProps = () => ({
    PaperProps: {
      sx: {
        bgcolor: darkMode ? colors.cardBg : undefined,
        border: darkMode ? `1px solid ${colors.border}` : undefined,
        '& .MuiMenuItem-root': {
          color: colors.text,
          '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : undefined },
          '&.Mui-selected': { bgcolor: darkMode ? 'rgba(255,255,255,0.12)' : undefined },
        },
      },
    },
  });

  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: colors.background }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 0, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TicketIcon sx={{ fontSize: 40, color: '#00357a' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={600} sx={{ color: colors.text }}>
              COMMAND TOWER
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Action tracking & audit trail for all execution operations
            </Typography>
          </Box>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small" sx={{ color: colors.primary, borderColor: colors.primary }}>
            Back
          </Button>
        </Box>
      </Paper>

      {/* Metrics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: darkMode ? alpha('#1a5a9e', 0.15) : alpha('#1a5a9e', 0.05), borderLeft: `4px solid #1a5a9e`, border: `1px solid ${colors.border}` }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Total Tickets</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#1a5a9e' }}>{metrics.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: darkMode ? alpha('#1a5a9e', 0.15) : alpha('#1a5a9e', 0.05), borderLeft: `4px solid #1a5a9e`, border: `1px solid ${colors.border}` }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Open</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#1a5a9e' }}>{metrics.open}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: darkMode ? alpha('#06b6d4', 0.15) : alpha('#06b6d4', 0.05), borderLeft: `4px solid #06b6d4`, border: `1px solid ${colors.border}` }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>In Progress</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#06b6d4' }}>{metrics.inProgress}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: darkMode ? alpha('#10b981', 0.15) : alpha('#10b981', 0.05), borderLeft: `4px solid #10b981`, border: `1px solid ${colors.border}` }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Completed</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#10b981' }}>{metrics.completed}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: darkMode ? alpha('#ef4444', 0.15) : alpha('#ef4444', 0.05), borderLeft: `4px solid #ef4444`, border: `1px solid ${colors.border}` }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Failed</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#ef4444' }}>{metrics.failed}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: darkMode ? alpha('#64748b', 0.15) : alpha('#64748b', 0.05), borderLeft: `4px solid #64748b`, border: `1px solid ${colors.border}` }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Cancelled</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#64748b' }}>{metrics.cancelled}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FilterListIcon sx={{ color: colors.textSecondary }} />
          <TextField
            size="small"
            placeholder="Search operations, users, descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              minWidth: 320,
              '& .MuiOutlinedInput-root': {
                bgcolor: darkMode ? colors.cardBg : undefined,
                color: colors.text,
                '& fieldset': { borderColor: colors.border },
                '&:hover fieldset': { borderColor: colors.primary },
              },
              '& .MuiInputBase-input::placeholder': { color: colors.textSecondary, opacity: 1 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: colors.textSecondary }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150, '& .MuiInputLabel-root': { color: colors.textSecondary }, '& .MuiOutlinedInput-root': { bgcolor: darkMode ? colors.cardBg : undefined, color: colors.text, '& fieldset': { borderColor: colors.border } } }}>
            <InputLabel>Module</InputLabel>
            <Select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} label="Module" MenuProps={getMenuProps()}>
              <MenuItem value="All">All Modules</MenuItem>
              <MenuItem value="STOX.AI">STOX.AI</MenuItem>
              <MenuItem value="ORDLY.AI">ORDLY.AI</MenuItem>
              <MenuItem value="MARGEN.AI">MARGEN.AI</MenuItem>
              <MenuItem value="AXIS.AI">AXIS.AI</MenuItem>
              <MenuItem value="Enterprise Pulse">Enterprise Pulse</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150, '& .MuiInputLabel-root': { color: colors.textSecondary }, '& .MuiOutlinedInput-root': { bgcolor: darkMode ? colors.cardBg : undefined, color: colors.text, '& fieldset': { borderColor: colors.border } } }}>
            <InputLabel>Type</InputLabel>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} label="Type" MenuProps={getMenuProps()}>
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
          <FormControl size="small" sx={{ minWidth: 130, '& .MuiInputLabel-root': { color: colors.textSecondary }, '& .MuiOutlinedInput-root': { bgcolor: darkMode ? colors.cardBg : undefined, color: colors.text, '& fieldset': { borderColor: colors.border } } }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status" MenuProps={getMenuProps()}>
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Failed">Failed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120, '& .MuiInputLabel-root': { color: colors.textSecondary }, '& .MuiOutlinedInput-root': { bgcolor: darkMode ? colors.cardBg : undefined, color: colors.text, '& fieldset': { borderColor: colors.border } } }}>
            <InputLabel>Priority</InputLabel>
            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} label="Priority" MenuProps={getMenuProps()}>
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ flex: 1 }} />
          <Button startIcon={<Refresh />} onClick={refresh} variant="outlined" size="small" sx={{ color: colors.primary, borderColor: colors.primary }}>
            Refresh
          </Button>
          <Button startIcon={<Download />} variant="outlined" size="small" sx={{ color: colors.primary, borderColor: colors.primary }}>
            Export
          </Button>
        </Stack>
      </Paper>

      {/* Data Grid */}
      <Paper elevation={0} sx={{ height: 600, bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
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
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: darkMode ? '#21262d' : '#f8fafc',
              color: colors.text,
              borderBottom: `1px solid ${colors.border}`,
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 600,
              fontSize: '0.75rem',
              color: colors.text,
            },
            '& .MuiDataGrid-cell': {
              color: colors.text,
              borderBottom: `1px solid ${colors.border}`,
            },
            '& .MuiDataGrid-row': {
              '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' },
            },
            '& .MuiDataGrid-footerContainer': {
              bgcolor: darkMode ? '#21262d' : '#f8fafc',
              color: colors.text,
              borderTop: `1px solid ${colors.border}`,
            },
            '& .MuiTablePagination-root': { color: colors.text },
            '& .MuiTablePagination-selectLabel': { color: colors.textSecondary },
            '& .MuiTablePagination-displayedRows': { color: colors.text },
            '& .MuiIconButton-root': { color: colors.textSecondary },
            '& .MuiDataGrid-toolbarContainer': {
              bgcolor: darkMode ? '#21262d' : '#f8fafc',
              borderBottom: `1px solid ${colors.border}`,
              '& .MuiButton-root': { color: colors.text },
              '& .MuiInputBase-root': { color: colors.text, bgcolor: darkMode ? colors.cardBg : undefined },
            },
            '& .MuiCheckbox-root': { color: colors.textSecondary },
          }}
        />
      </Paper>

      {/* Ticket Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: colors.paper, color: colors.text } }}>
        <DialogTitle sx={{ bgcolor: colors.cardBg, borderBottom: `1px solid ${colors.border}` }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <TicketIcon sx={{ color: '#1a5a9e' }} />
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: colors.text }}>
                Operation Details
              </Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.textSecondary }}>
                {selectedTicket && formatTicketId(selectedTicket)}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: colors.paper }}>
          {selectedTicket && (
            <Box sx={{ pt: 2 }}>
              {/* Status and Priority */}
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={selectedTicket.status} color={selectedTicket.status === 'Completed' ? 'success' : selectedTicket.status === 'Failed' ? 'error' : 'primary'} size="small" />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>Priority</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={selectedTicket.priority} size="small" sx={{ bgcolor: alpha(selectedTicket.priority === 'High' ? '#ef4444' : '#1a5a9e', 0.1), color: selectedTicket.priority === 'High' ? '#ef4444' : '#1a5a9e' }} />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>Type</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={selectedTicket.ticket_type} size="small" sx={{ bgcolor: darkMode ? colors.cardBg : undefined }} />
                  </Box>
                </Box>
              </Stack>

              <Divider sx={{ my: 2, borderColor: colors.border }} />

              {/* Basic Info */}
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, width: '30%', color: colors.text, borderBottom: `1px solid ${colors.border}` }}>Module</TableCell>
                    <TableCell sx={{ color: colors.text, borderBottom: `1px solid ${colors.border}` }}>{selectedTicket.source_module}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: colors.text, borderBottom: `1px solid ${colors.border}` }}>Source Tile</TableCell>
                    <TableCell sx={{ color: colors.text, borderBottom: `1px solid ${colors.border}` }}>{selectedTicket.source_tile || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: colors.text, borderBottom: `1px solid ${colors.border}` }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: colors.text, borderBottom: `1px solid ${colors.border}` }}>{selectedTicket.title}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: colors.text, borderBottom: `1px solid ${colors.border}` }}>Description</TableCell>
                    <TableCell sx={{ color: colors.text, borderBottom: `1px solid ${colors.border}` }}>{selectedTicket.description}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: colors.text, borderBottom: `1px solid ${colors.border}` }}>User/Agent</TableCell>
                    <TableCell sx={{ color: colors.text, borderBottom: `1px solid ${colors.border}` }}>{selectedTicket.user_name || 'System'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: colors.text, borderBottom: `1px solid ${colors.border}` }}>Created</TableCell>
                    <TableCell sx={{ color: colors.text, borderBottom: `1px solid ${colors.border}` }}>{new Date(selectedTicket.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: colors.text, borderBottom: `1px solid ${colors.border}` }}>Last Updated</TableCell>
                    <TableCell sx={{ color: colors.text, borderBottom: `1px solid ${colors.border}` }}>{new Date(selectedTicket.updated_at).toLocaleString()}</TableCell>
                  </TableRow>
                  {selectedTicket.completed_at && (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: colors.text, borderBottom: `1px solid ${colors.border}` }}>Completed</TableCell>
                      <TableCell sx={{ color: colors.text, borderBottom: `1px solid ${colors.border}` }}>{new Date(selectedTicket.completed_at).toLocaleString()}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <Divider sx={{ my: 2, borderColor: colors.border }} />

              {/* Operational Metadata */}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: colors.text }}>
                Operational Details
              </Typography>
              <Box sx={{ bgcolor: darkMode ? alpha('#1a5a9e', 0.15) : alpha('#1a5a9e', 0.05), p: 2, borderRadius: 1, border: `1px solid ${darkMode ? alpha('#1a5a9e', 0.3) : alpha('#1a5a9e', 0.2)}` }}>
                {selectedTicket.metadata && Object.keys(selectedTicket.metadata).length > 0 ? (
                  <Table size="small">
                    <TableBody>
                      {Object.entries(selectedTicket.metadata).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell sx={{ fontWeight: 600, width: '40%', border: `1px solid ${colors.border}`, py: 0.5, color: colors.text }}>
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </TableCell>
                          <TableCell sx={{ border: `1px solid ${colors.border}`, py: 0.5, fontFamily: typeof value === 'number' ? 'monospace' : 'inherit', color: colors.text }}>
                            {typeof value === 'number' ? value.toLocaleString() : String(value)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: colors.textSecondary }}>
                    No additional operational details available
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: colors.cardBg, borderTop: `1px solid ${colors.border}` }}>
          <Button onClick={() => setDetailsOpen(false)} sx={{ color: colors.primary }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Ticket Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: colors.paper, color: colors.text } }}>
        <DialogTitle sx={{ bgcolor: colors.cardBg, borderBottom: `1px solid ${colors.border}`, color: colors.text }}>Cancel Ticket</DialogTitle>
        <DialogContent sx={{ bgcolor: colors.paper, pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, color: colors.textSecondary, pt: 1 }}>
            Are you sure you want to cancel operation <strong style={{ color: colors.text }}>{selectedTicket && formatTicketId(selectedTicket)}</strong>?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Cancellation Reason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Please provide a reason for cancelling this ticket..."
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: darkMode ? colors.cardBg : undefined,
                color: colors.text,
                '& fieldset': { borderColor: colors.border },
                '&:hover fieldset': { borderColor: colors.primary },
              },
              '& .MuiInputLabel-root': { color: colors.textSecondary },
              '& .MuiInputBase-input::placeholder': { color: colors.textSecondary, opacity: 1 },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: colors.cardBg, borderTop: `1px solid ${colors.border}` }}>
          <Button onClick={() => { setCancelDialogOpen(false); setCancelReason(''); }} sx={{ color: colors.primary }}>
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
