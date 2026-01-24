/**
 * PDF Templates Manager Component
 *
 * Displays and manages PDF parser templates in a DataGrid.
 * Connects to backend API for CRUD operations.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tooltip,
  Paper,
  Divider,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Alert,
  alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import stoxTheme from './stox/stoxTheme';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  Code as CodeIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import EditTemplateModal from './EditTemplateModal';

const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  secondary: darkMode ? '#2d8ce6' : '#002352',
  success: darkMode ? '#36d068' : '#10b981',
  warning: darkMode ? '#f59e0b' : '#f59e0b',
  error: darkMode ? '#ff6b6b' : '#ef4444',
  text: darkMode ? '#e6edf3' : '#1e293b',
  grey: darkMode ? '#8b949e' : '#64748b',
});

const PDFTemplatesManager = ({ onBack, darkMode = false, embedded = false, onCreateTemplate, onTemplateCreated }) => {
  const colors = getColors(darkMode);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Edit form state
  const [editForm, setEditForm] = useState({
    customer_name: '',
    description: '',
    category: 'purchase_order',
    po_number_pattern: '',
    is_active: true,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/v1/pdf-templates');
      if (!response.ok) {
        throw new Error('Failed to load templates');
      }
      const result = await response.json();
      if (result.success) {
        setTemplates(result.data || []);
      } else {
        throw new Error(result.detail || 'Failed to load templates');
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, template) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    if (selectedTemplate) {
      setEditForm({
        customer_name: selectedTemplate.customer_name || '',
        description: selectedTemplate.description || '',
        category: selectedTemplate.category || 'purchase_order',
        po_number_pattern: selectedTemplate.po_number_pattern || '',
        is_active: selectedTemplate.is_active !== false,
      });
      setEditDialog(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialog(true);
    handleMenuClose();
  };

  const handleToggleActive = async () => {
    if (!selectedTemplate) return;
    try {
      const response = await fetch(`/api/v1/pdf-templates/${selectedTemplate.id}/toggle`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Failed to toggle template status');
      }
      loadTemplates();
    } catch (err) {
      console.error('Failed to toggle template:', err);
      setError(err.message);
    }
    handleMenuClose();
  };

  const handleSaveEdit = async () => {
    if (!selectedTemplate) return;
    try {
      const response = await fetch(`/api/v1/pdf-templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!response.ok) {
        throw new Error('Failed to update template');
      }
      setEditDialog(false);
      loadTemplates();
    } catch (err) {
      console.error('Failed to update template:', err);
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplate) return;
    try {
      const response = await fetch(`/api/v1/pdf-templates/${selectedTemplate.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete template');
      }
      setDeleteDialog(false);
      setSelectedTemplate(null);
      loadTemplates();
    } catch (err) {
      console.error('Failed to delete template:', err);
      setError(err.message);
    }
  };

  const filteredTemplates = useMemo(() => {
    let filtered = [...templates];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.customer_name?.toLowerCase().includes(query) ||
        t.template_key?.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t =>
        statusFilter === 'active' ? t.is_active : !t.is_active
      );
    }

    return filtered;
  }, [templates, searchQuery, categoryFilter, statusFilter]);

  const columns = useMemo(() => [
    {
      field: 'customer_name',
      headerName: 'Customer Name',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon sx={{ fontSize: 18, color: colors.primary }} />
          <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'template_key',
      headerName: 'Template Key',
      flex: 1.5,
      minWidth: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: alpha(colors.primary, 0.1),
            color: colors.primary,
            fontWeight: 600,
            fontSize: '0.7rem',
            fontFamily: 'monospace',
          }}
        />
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <Tooltip title={params.value || ''}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {params.value || '-'}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value || 'purchase_order'}
          size="small"
          icon={<CategoryIcon sx={{ fontSize: 14 }} />}
          sx={{
            bgcolor: alpha('#8b5cf6', 0.1),
            color: '#8b5cf6',
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        />
      ),
    },
    {
      field: 'po_count',
      headerName: 'PO Count',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value || 0}
          size="small"
          sx={{
            bgcolor: params.value > 0 ? alpha(colors.success, 0.1) : alpha(colors.grey, 0.1),
            color: params.value > 0 ? colors.success : colors.grey,
            fontWeight: 700,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
          color={params.value ? 'success' : 'default'}
          sx={{ height: 22, fontSize: '0.7rem' }}
        />
      ),
    },
    {
      field: 'identification_keywords',
      headerName: 'Keywords',
      width: 120,
      renderCell: (params) => {
        const keywords = params.value || [];
        return (
          <Tooltip title={keywords.join(', ')}>
            <Chip
              label={`${keywords.length} keywords`}
              size="small"
              variant="outlined"
              sx={{ height: 22, fontSize: '0.7rem' }}
            />
          </Tooltip>
        );
      },
    },
    {
      field: 'updated_at',
      headerName: 'Last Updated',
      width: 150,
      renderCell: (params) => params.value ? (
        <Typography variant="caption" color="text.secondary">
          {new Date(params.value).toLocaleString()}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.disabled">-</Typography>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 50,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuOpen(e, params.row)}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ], [colors]);

  const stats = useMemo(() => ({
    totalTemplates: templates.length,
    activeTemplates: templates.filter(t => t.is_active).length,
    totalPOs: templates.reduce((sum, t) => sum + (t.po_count || 0), 0),
    templatesWithPOs: templates.filter(t => (t.po_count || 0) > 0).length,
  }), [templates]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header - only show when not embedded */}
      {!embedded && (
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <IconButton onClick={onBack} sx={{ bgcolor: alpha(colors.primary, 0.1) }}>
            <ArrowBackIcon />
          </IconButton>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: alpha(colors.primary, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PdfIcon sx={{ fontSize: 24, color: colors.primary }} />
          </Box>
          <Box flex={1}>
            <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
              PDF Parser Templates
            </Typography>
            <Typography variant="body2" sx={{ color: colors.grey }}>
              Manage customer-specific PDF parsing templates
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={loadTemplates}
            sx={{ borderColor: alpha(colors.primary, 0.3), color: colors.primary, mr: 1 }}
          >
            Refresh
          </Button>
          {onCreateTemplate && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={onCreateTemplate}
              sx={{
                background: 'linear-gradient(135deg, #002352 0%, #00357a 100%)',
              }}
            >
              Create Template
            </Button>
          )}
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Create Button - when embedded, show create button here */}
      {embedded && onCreateTemplate && (
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateTemplate}
            sx={{
              background: 'linear-gradient(135deg, #002352 0%, #00357a 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #00357a 0%, #1d4ed8 100%)',
              },
            }}
          >
            Create New Template
          </Button>
        </Box>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha(colors.primary, 0.2),
              bgcolor: alpha(colors.primary, 0.03),
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary">Total Templates</Typography>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {stats.totalTemplates}
                </Typography>
              </Box>
              <DescriptionIcon sx={{ color: colors.primary, fontSize: 28 }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha(colors.success, 0.2),
              bgcolor: alpha(colors.success, 0.03),
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary">Active</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: colors.success }}>
                  {stats.activeTemplates}
                </Typography>
              </Box>
              <CheckCircleIcon sx={{ color: colors.success, fontSize: 28 }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha('#8b5cf6', 0.2),
              bgcolor: alpha('#8b5cf6', 0.03),
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary">Total POs Parsed</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: '#8b5cf6' }}>
                  {stats.totalPOs}
                </Typography>
              </Box>
              <PdfIcon sx={{ color: '#8b5cf6', fontSize: 28 }} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: alpha('#f59e0b', 0.2),
              bgcolor: alpha('#f59e0b', 0.03),
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary">With POs</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: '#f59e0b' }}>
                  {stats.templatesWithPOs}
                </Typography>
              </Box>
              <CodeIcon sx={{ color: '#f59e0b', fontSize: 28 }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Templates DataGrid */}
      <Card variant="outlined" sx={{ bgcolor: darkMode ? '#161b22' : undefined }}>
        <CardContent>
          {/* Search and Filters */}
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search templates by customer name, key, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="purchase_order">Purchase Order</MenuItem>
                  <MenuItem value="invoice">Invoice</MenuItem>
                  <MenuItem value="shipping">Shipping</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                {filteredTemplates.length} of {templates.length} templates
              </Typography>
            </Grid>
          </Grid>

          <Paper sx={{ width: '100%', bgcolor: darkMode ? '#161b22' : undefined }}>
            <DataGrid
              rows={filteredTemplates}
              columns={columns}
              density="compact"
              disableRowSelectionOnClick
              autoHeight
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
              initialState={{
                pagination: { paginationModel: { pageSize: 15 } },
                sorting: { sortModel: [{ field: 'customer_name', sort: 'asc' }] },
              }}
              pageSizeOptions={[15, 25, 50, 100]}
              sx={stoxTheme.getDataGridSx({ clickable: false, darkMode })}
              localeText={{
                noRowsLabel: 'No templates found. Templates will appear here after loading PDFs.',
              }}
            />
          </Paper>
        </CardContent>
      </Card>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEditClick}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit Template
        </MenuItem>
        <MenuItem onClick={handleToggleActive}>
          {selectedTemplate?.is_active ? 'Deactivate' : 'Activate'}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Edit Template Modal - Full Featured */}
      <EditTemplateModal
        open={editDialog}
        onClose={() => setEditDialog(false)}
        onSuccess={() => {
          loadTemplates();
          setEditDialog(false);
        }}
        templateId={selectedTemplate?.id}
        darkMode={darkMode}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Template</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the template for{' '}
            <strong>{selectedTemplate?.customer_name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PDFTemplatesManager;
