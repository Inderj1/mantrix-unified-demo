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
  const { tickets: allTickets, loading, refresh } = useTickets({
    status: statusFilter,
    type: typeFilter,
    priority: priorityFilter,
    searchTerm: searchTerm,
  });

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
            fontFamily: 'monospace',
            fontWeight: 700,
            color: '#3b82f6',
            fontSize: '0.85rem',
            cursor: 'pointer',
            textDecoration: 'underline',
            '&:hover': {
              color: '#1e40af',
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
          'MARGEN.AI': '#1976d2',
          'REVEQ.AI': '#9c27b0',
          'Enterprise Pulse': '#ef4444',
          'STOX.AI': '#10b981',
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
          'STO_CREATION': '#3b82f6',
          'FORECAST_OVERRIDE': '#8b5cf6',
          'FINANCIAL_APPROVAL': '#f59e0b',
          'SUPPLIER_ORDER': '#10b981',
          'MARGEN_ANALYSIS': '#1976d2',
          'MARGEN_REPORT': '#0d47a1',
          'REVEQ_MAINTENANCE': '#9c27b0',
          'REVEQ_UTILIZATION': '#7b1fa2',
          'PULSE_AGENT_EXEC': '#ef4444',
          'PULSE_ALERT': '#f97316',
          'PULSE_CONFIG': '#64748b',
        };
        const typeLabels = {
          'STO_CREATION': 'STO/PR Creation',
          'FORECAST_OVERRIDE': 'Forecast Override',
          'FINANCIAL_APPROVAL': 'Financial Approval',
          'SUPPLIER_ORDER': 'Supplier Order',
          'MARGEN_ANALYSIS': 'MARGEN Analysis',
          'MARGEN_REPORT': 'MARGEN Report',
          'REVEQ_MAINTENANCE': 'REVEQ Maintenance',
          'REVEQ_UTILIZATION': 'REVEQ Utilization',
          'PULSE_AGENT_EXEC': 'Pulse Agent Execution',
          'PULSE_ALERT': 'Pulse Alert',
          'PULSE_CONFIG': 'Pulse Configuration',
        };
        return (
          <Chip
            label={typeLabels[params.value] || params.value}
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
          'Normal': '#3b82f6',
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
              sx={{ color: '#3b82f6' }}
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
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TicketIcon sx={{ fontSize: 40, color: '#10b981' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={700}>
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
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: alpha('#3b82f6', 0.05), borderLeft: `4px solid #3b82f6` }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Total Tickets</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#3b82f6' }}>{metrics.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ bgcolor: alpha('#3b82f6', 0.05), borderLeft: `4px solid #3b82f6` }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Open</Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#3b82f6' }}>{metrics.open}</Typography>
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
              <MenuItem value="MARGEN.AI">MARGEN.AI</MenuItem>
              <MenuItem value="REVEQ.AI">REVEQ.AI</MenuItem>
              <MenuItem value="Enterprise Pulse">Enterprise Pulse</MenuItem>
              <MenuItem value="STOX.AI">STOX.AI</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} label="Type">
              <MenuItem value="All">All Types</MenuItem>
              <MenuItem value="MARGEN_ANALYSIS">MARGEN Analysis</MenuItem>
              <MenuItem value="MARGEN_REPORT">MARGEN Report</MenuItem>
              <MenuItem value="REVEQ_MAINTENANCE">REVEQ Maintenance</MenuItem>
              <MenuItem value="REVEQ_UTILIZATION">REVEQ Utilization</MenuItem>
              <MenuItem value="PULSE_AGENT_EXEC">Pulse Agent Exec</MenuItem>
              <MenuItem value="PULSE_ALERT">Pulse Alert</MenuItem>
              <MenuItem value="PULSE_CONFIG">Pulse Config</MenuItem>
              <MenuItem value="STO_CREATION">STO Creation</MenuItem>
              <MenuItem value="FORECAST_OVERRIDE">Forecast Override</MenuItem>
              <MenuItem value="FINANCIAL_APPROVAL">Financial Approval</MenuItem>
              <MenuItem value="SUPPLIER_ORDER">Supplier Order</MenuItem>
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
          pageSize={25}
          rowsPerPageOptions={[10, 25, 50, 100]}
          disableSelectionOnClick
          components={{ Toolbar: GridToolbar }}
          componentsProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              fontSize: '0.8rem',
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: alpha('#3b82f6', 0.05),
              fontSize: '0.75rem',
              fontWeight: 700,
            },
          }}
        />
      </Paper>

      {/* Ticket Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <TicketIcon sx={{ color: '#3b82f6' }} />
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
                    <Chip label={selectedTicket.priority} size="small" sx={{ bgcolor: alpha(selectedTicket.priority === 'High' ? '#ef4444' : '#3b82f6', 0.1), color: selectedTicket.priority === 'High' ? '#ef4444' : '#3b82f6' }} />
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
              <Box sx={{ bgcolor: alpha('#3b82f6', 0.05), p: 2, borderRadius: 1, border: '1px solid', borderColor: alpha('#3b82f6', 0.2) }}>
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
