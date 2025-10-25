import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Breadcrumbs,
  Link,
  Stack,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  AttachMoney,
  Group,
  Warning,
  CheckCircle,
  Info,
  Speed,
  AccountBalance,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  Upload,
  Save,
  Send,
  Visibility,
  Lock,
  CompareArrows,
  Edit,
  Delete,
  Settings,
  Add,
} from '@mui/icons-material';

const BOMExplorer = ({ onBack }) => {
  const [sopData, setSOPData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [selectedView, setSelectedView] = useState('daily');
  const [selectedRows, setSelectedRows] = useState([]);
  const [consensusDialogOpen, setConsensusDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchSOPData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSOPData = async () => {
    setLoading(true);
    try {
      // BOM Drill-Down data
      const mockData = [
        {
          id: 'BOM001',
          finished_good_id: 'SKU-7891',
          finished_good_name: 'Madison Reed Premium Color Kit',
          component_id: 'COMP-C401',
          component_name: 'Color Developer 60ml',
          qty_per_unit: 1,
          total_requirement: 8370,
          available_stock: 12500,
          shortage_qty: 0,
          lead_time_days: 14,
          supplier: 'ChemSupply Inc.',
          bom_level: 1,
          alternative_bom: 'COMP-C402',
          scrap_pct: 2.0,
          component_type: 'ROH',
          safety_stock: 5000,
          status: 'ok',
        },
        {
          id: 'BOM002',
          finished_good_id: 'SKU-7891',
          finished_good_name: 'Madison Reed Premium Color Kit',
          component_id: 'COMP-P205',
          component_name: 'Color Pigment Base',
          qty_per_unit: 2,
          total_requirement: 16740,
          available_stock: 8200,
          shortage_qty: 8540,
          lead_time_days: 21,
          supplier: 'PigmentCo Ltd',
          bom_level: 1,
          alternative_bom: 'COMP-P206',
          scrap_pct: 3.5,
          component_type: 'ROH',
          safety_stock: 8000,
          status: 'critical',
        },
        {
          id: 'BOM003',
          finished_good_id: 'SKU-7891',
          finished_good_name: 'Madison Reed Premium Color Kit',
          component_id: 'PKG-B120',
          component_name: 'Premium Box Packaging',
          qty_per_unit: 1,
          total_requirement: 8370,
          available_stock: 6500,
          shortage_qty: 1870,
          lead_time_days: 10,
          supplier: 'PackPro Solutions',
          bom_level: 1,
          alternative_bom: 'PKG-B121',
          scrap_pct: 1.0,
          component_type: 'VERP',
          safety_stock: 3000,
          status: 'warning',
        },
        {
          id: 'BOM004',
          finished_good_id: 'SKU-4523',
          finished_good_name: 'Color Reviving Gloss',
          component_id: 'COMP-G301',
          component_name: 'Gloss Base Formula',
          qty_per_unit: 1,
          total_requirement: 6430,
          available_stock: 15200,
          shortage_qty: 0,
          lead_time_days: 12,
          supplier: 'BeautyIngredients Corp',
          bom_level: 1,
          alternative_bom: 'COMP-G302',
          scrap_pct: 1.5,
          component_type: 'ROH',
          safety_stock: 7000,
          status: 'ok',
        },
        {
          id: 'BOM005',
          finished_good_id: 'SKU-4523',
          finished_good_name: 'Color Reviving Gloss',
          component_id: 'PKG-T085',
          component_name: 'Tube 150ml',
          qty_per_unit: 1,
          total_requirement: 6430,
          available_stock: 4200,
          shortage_qty: 2230,
          lead_time_days: 8,
          supplier: 'PackPro Solutions',
          bom_level: 1,
          alternative_bom: 'PKG-T086',
          scrap_pct: 0.5,
          component_type: 'VERP',
          safety_stock: 2500,
          status: 'warning',
        },
      ];

      setSOPData(mockData);

      // Calculate metrics
      const totalRequirement = mockData.reduce((sum, item) => sum + item.total_requirement, 0);
      const totalAvailable = mockData.reduce((sum, item) => sum + item.available_stock, 0);
      const totalShortage = mockData.reduce((sum, item) => sum + item.shortage_qty, 0);
      const criticalComponents = mockData.filter(item => item.status === 'critical').length;
      const warningComponents = mockData.filter(item => item.status === 'warning').length;
      const avgLeadTime = mockData.reduce((sum, item) => sum + item.lead_time_days, 0) / mockData.length;

      setMetrics({
        total_requirement: totalRequirement,
        total_available: totalAvailable,
        total_shortage: totalShortage,
        critical_components: criticalComponents,
        warning_components: warningComponents,
        avg_lead_time: avgLeadTime,
      });
    } catch (error) {
      console.error('Error fetching S&OP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (row) => {
    setSelectedProduct(row);
  };

  const handleBuildConsensus = (row) => {
    setSelectedProduct(row);
    setConsensusDialogOpen(true);
  };

  const columns = [
    {
      field: 'finished_good_name',
      headerName: 'Finished Good',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {params.row.finished_good_id}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'component_name',
      headerName: 'Component',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {params.row.component_id}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'component_type',
      headerName: 'Type',
      width: 80,
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'ROH' ? 'primary' : 'secondary'}
        />
      ),
    },
    {
      field: 'qty_per_unit',
      headerName: 'Qty/Unit',
      width: 90,
      align: 'right',
    },
    {
      field: 'total_requirement',
      headerName: 'Total Req',
      width: 110,
      align: 'right',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'available_stock',
      headerName: 'Available',
      width: 110,
      align: 'right',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'shortage_qty',
      headerName: 'Shortage',
      width: 110,
      align: 'right',
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            color: params.value > 0 ? 'error.main' : 'success.main',
            fontWeight: params.value > 0 ? 600 : 400,
          }}
        >
          {params.value?.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'safety_stock',
      headerName: 'Safety Stock',
      width: 110,
      align: 'right',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'lead_time_days',
      headerName: 'Lead Time',
      width: 100,
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value}d`}
          size="small"
          color={params.value <= 10 ? 'success' : params.value <= 20 ? 'warning' : 'error'}
        />
      ),
    },
    {
      field: 'supplier',
      headerName: 'Supplier',
      flex: 0.8,
      minWidth: 150,
    },
    {
      field: 'bom_level',
      headerName: 'Level',
      width: 70,
      align: 'center',
    },
    {
      field: 'alternative_bom',
      headerName: 'Alternative',
      width: 120,
      align: 'center',
      renderCell: (params) => (
        params.value ? (
          <Chip label={params.value} size="small" variant="outlined" />
        ) : (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>-</Typography>
        )
      ),
    },
    {
      field: 'scrap_pct',
      headerName: 'Scrap %',
      width: 90,
      align: 'right',
      valueFormatter: (params) => `${params.value}%`,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      align: 'center',
      renderCell: (params) => {
        const statusColors = {
          ok: 'success',
          warning: 'warning',
          critical: 'error',
        };
        const statusIcons = {
          ok: <CheckCircle sx={{ fontSize: 16 }} />,
          warning: <Warning sx={{ fontSize: 16 }} />,
          critical: <Warning sx={{ fontSize: 16 }} />,
        };
        return (
          <Chip
            icon={statusIcons[params.value]}
            label={params.value.toUpperCase()}
            size="small"
            color={statusColors[params.value]}
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => handleViewDetails(params.row)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" color="primary">
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error">
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{
      p: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    }}>
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
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              STOX.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              BOM Drill-Down Explorer
            </Typography>
          </Breadcrumbs>

          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            variant="outlined"
            size="small"
          >
            Back
          </Button>
        </Stack>

        <Box>
          <Typography variant="h4" fontWeight={700}>
            BOM Drill-Down Explorer
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Component Requirements
          </Typography>
        </Box>
      </Box>

      {/* Action Bar */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5 }}>
        <ToggleButtonGroup
          value={selectedView}
          exclusive
          onChange={(e, newView) => newView && setSelectedView(newView)}
          size="small"
        >
          <ToggleButton value="monthly">Monthly</ToggleButton>
          <ToggleButton value="quarterly">Quarterly</ToggleButton>
          <ToggleButton value="weekly">Weekly</ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<Upload />} variant="outlined" size="small">
            Import
          </Button>
          <Button startIcon={<Download />} variant="outlined" size="small">
            Export
          </Button>
          <Button startIcon={<Save />} variant="outlined" size="small">
            Save Draft
          </Button>
          <Button startIcon={<Send />} variant="contained" size="small" color="success">
            Submit for Approval
          </Button>
          <Button startIcon={<Settings />} variant="outlined" size="small">
            Configure
          </Button>
          <Button startIcon={<Refresh />} variant="contained" size="small" onClick={fetchSOPData}>
            Refresh
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      {metrics && (
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Info sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Chip size="small" label="Req" color="primary" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Total Requirement
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.total_requirement.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                  <Chip size="small" label="Stock" color="success" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Available Stock
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.total_available.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Warning sx={{ fontSize: 18, color: 'error.main' }} />
                  <Chip size="small" label="Short" color="error" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Total Shortage
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.total_shortage.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Warning sx={{ fontSize: 18, color: 'error.main' }} />
                  <Chip size="small" label="Critical" color="error" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Critical Components
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.critical_components}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Info sx={{ fontSize: 18, color: 'warning.main' }} />
                  <Chip size="small" label="Warn" color="warning" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Warning Components
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.warning_components}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: '1px solid #E1E4E8' }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Speed sx={{ fontSize: 18, color: 'info.main' }} />
                  <Chip size="small" label="Days" color="info" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Avg Lead Time
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#0F3460', fontSize: '1.25rem' }}>
                  {metrics.avg_lead_time.toFixed(1)}d
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Content */}
      <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Table Toolbar */}
        <Box sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #E1E4E8',
          backgroundColor: '#fafafa'
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              sx={{ textTransform: 'none' }}
            >
              New Component
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Delete />}
              disabled={selectedRows.length === 0}
              sx={{ textTransform: 'none' }}
            >
              Delete Selected ({selectedRows.length})
            </Button>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {sopData.length} components total
          </Typography>
        </Box>

        {/* Planning Table */}
        <DataGrid
            rows={sopData}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50, 100]}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={setSelectedRows}
            rowSelectionModel={selectedRows}
            slots={{
              toolbar: GridToolbar,
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            sx={{
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid rgba(224, 224, 224, 1)',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f5f5f5',
                borderBottom: '2px solid rgba(224, 224, 224, 1)',
              },
            }}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 25,
                },
              },
            }}
          />
      </Paper>

      {/* Component Details Dialog */}
      <Dialog
        open={consensusDialogOpen}
        onClose={() => setConsensusDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Component Details - {selectedProduct?.component_name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Component ID"
                value={selectedProduct?.component_id || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Finished Good"
                value={selectedProduct?.finished_good_name || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Total Requirement"
                value={selectedProduct?.total_requirement || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Available Stock"
                value={selectedProduct?.available_stock || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Shortage Qty"
                value={selectedProduct?.shortage_qty || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Supplier"
                value={selectedProduct?.supplier || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Lead Time (days)"
                value={selectedProduct?.lead_time_days || 0}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes / Comments"
                placeholder="Add notes about this component..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConsensusDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary">Save Notes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BOMExplorer;
