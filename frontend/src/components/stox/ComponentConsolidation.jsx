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
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  AttachMoney,
  Warning,
  CheckCircle,
  Info,
  Speed,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  Upload,
  Save,
  Send,
  Delete,
  Settings,
  Add,
} from '@mui/icons-material';

// Dark Mode Color Helper
const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const ComponentConsolidation = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const [sopData, setSOPData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [selectedView, setSelectedView] = useState('daily');
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    fetchSOPData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSOPData = async () => {
    setLoading(true);
    try {
      // Component Consolidation data - Arizona Beverages
      const mockData = [
        {
          id: 'CC001',
          component_id: 'COMP-TEA-001',
          component_name: 'Green Tea Concentrate Base',
          total_requirement: 83700,
          available_stock: 125000,
          on_order: 50000,
          shortage: 0,
          pr_number: 'PR-AZ-78943',
          po_number: 'PO-AZ-45123',
          vendor: 'Arizona Tea Extracts',
          lead_time_days: 14,
          status: 'OK',
          unit_of_measure: 'GAL',
          unit_cost: 12.50,
          extended_value: 1046250.00,
          expected_arrival_date: '2024-02-20',
          buyer: 'John Smith',
        },
        {
          id: 'CC002',
          component_id: 'COMP-SWT-001',
          component_name: 'High Fructose Corn Syrup 55',
          total_requirement: 167400,
          available_stock: 82000,
          on_order: 150000,
          shortage: 0,
          pr_number: 'PR-AZ-78945',
          po_number: 'PO-AZ-45189',
          vendor: 'ADM Sweeteners',
          lead_time_days: 7,
          status: 'OK',
          unit_of_measure: 'LB',
          unit_cost: 0.32,
          extended_value: 53568.00,
          expected_arrival_date: '2024-02-12',
          buyer: 'Sarah Johnson',
        },
        {
          id: 'CC003',
          component_id: 'PKG-PET-20',
          component_name: '20oz PET Tallboy Bottle',
          total_requirement: 2008800,
          available_stock: 1650000,
          on_order: 500000,
          shortage: 0,
          pr_number: 'PR-AZ-78944',
          po_number: 'PO-AZ-45156',
          vendor: 'Plastipak',
          lead_time_days: 10,
          status: 'OK',
          unit_of_measure: 'EA',
          unit_cost: 0.08,
          extended_value: 160704.00,
          expected_arrival_date: '2024-02-15',
          buyer: 'Mike Chen',
        },
        {
          id: 'CC004',
          component_id: 'PKG-CAN-22',
          component_name: '22oz Aluminum Can',
          total_requirement: 1680000,
          available_stock: 2100000,
          on_order: 0,
          shortage: 0,
          pr_number: '',
          po_number: '',
          vendor: 'Ball Corporation',
          lead_time_days: 14,
          status: 'OK',
          unit_of_measure: 'EA',
          unit_cost: 0.12,
          extended_value: 201600.00,
          expected_arrival_date: '',
          buyer: 'John Smith',
        },
        {
          id: 'CC005',
          component_id: 'COMP-ADD-001',
          component_name: 'Citric Acid',
          total_requirement: 7000,
          available_stock: 3500,
          on_order: 5000,
          shortage: 0,
          pr_number: 'PR-AZ-78942',
          po_number: 'PO-AZ-45178',
          vendor: 'Jungbunzlauer',
          lead_time_days: 21,
          status: 'OK',
          unit_of_measure: 'LB',
          unit_cost: 1.20,
          extended_value: 8400.00,
          expected_arrival_date: '2024-02-25',
          buyer: 'Mike Chen',
        },
        {
          id: 'CC006',
          component_id: 'PKG-SHRINK-24',
          component_name: '24-Pack Shrink Wrap',
          total_requirement: 125500,
          available_stock: 72000,
          on_order: 80000,
          shortage: 0,
          pr_number: 'PR-AZ-78946',
          po_number: 'PO-AZ-45189',
          vendor: 'Berry Global',
          lead_time_days: 7,
          status: 'OK',
          unit_of_measure: 'EA',
          unit_cost: 0.15,
          extended_value: 18825.00,
          expected_arrival_date: '2024-02-18',
          buyer: 'Mike Chen',
        },
        {
          id: 'CC007',
          component_id: 'COMP-MNG-001',
          component_name: 'Mango Puree Concentrate',
          total_requirement: 48000,
          available_stock: 35000,
          on_order: 0,
          shortage: 13000,
          pr_number: 'PR-AZ-78947',
          po_number: '',
          vendor: 'Tropical Flavors LLC',
          lead_time_days: 28,
          status: 'Critical',
          unit_of_measure: 'GAL',
          unit_cost: 15.00,
          extended_value: 720000.00,
          expected_arrival_date: '2024-03-10',
          buyer: 'Sarah Johnson',
        },
        {
          id: 'CC008',
          component_id: 'PKG-PET-GAL',
          component_name: 'Gallon PET Jug',
          total_requirement: 257200,
          available_stock: 180000,
          on_order: 50000,
          shortage: 27200,
          pr_number: 'PR-AZ-78948',
          po_number: 'PO-AZ-45200',
          vendor: 'Graham Packaging',
          lead_time_days: 12,
          status: 'Critical',
          unit_of_measure: 'EA',
          unit_cost: 0.22,
          extended_value: 56584.00,
          expected_arrival_date: '2024-02-28',
          buyer: 'Mike Chen',
        },
      ];

      setSOPData(mockData);

      // Calculate metrics
      const totalRequirement = mockData.reduce((sum, item) => sum + item.total_requirement, 0);
      const totalAvailable = mockData.reduce((sum, item) => sum + item.available_stock, 0);
      const totalOnOrder = mockData.reduce((sum, item) => sum + item.on_order, 0);
      const totalShortage = mockData.reduce((sum, item) => sum + item.shortage, 0);
      const totalValue = mockData.reduce((sum, item) => sum + item.extended_value, 0);
      const criticalCount = mockData.filter(item => item.status === 'Critical').length;

      setMetrics({
        total_requirement: totalRequirement,
        total_available: totalAvailable,
        total_on_order: totalOnOrder,
        total_shortage: totalShortage,
        total_value: totalValue,
        critical_count: criticalCount,
      });
    } catch (error) {
      console.error('Error fetching S&OP data:', error);
    } finally {
      setLoading(false);
    }
  };


  const columns = [
    {
      field: 'component_id',
      headerName: 'Component ID',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'component_name',
      headerName: 'Component Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'total_requirement',
      headerName: 'Total Requirement',
      width: 140,
      align: 'right',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'available_stock',
      headerName: 'Available Stock',
      width: 130,
      align: 'right',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'on_order',
      headerName: 'On Order',
      width: 110,
      align: 'right',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'shortage',
      headerName: 'Shortage',
      width: 110,
      align: 'center',
      renderCell: (params) => {
        const hasShortage = params.value > 0;
        return (
          <Chip
            label={hasShortage ? params.value.toLocaleString() : '-'}
            size="small"
            icon={hasShortage ? <Warning /> : <CheckCircle />}
            color={hasShortage ? 'error' : 'success'}
            variant={hasShortage ? 'filled' : 'outlined'}
          />
        );
      },
    },
    {
      field: 'pr_number',
      headerName: 'PR Number',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: params.value ? 'text.primary' : 'text.secondary' }}>
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'po_number',
      headerName: 'PO Number',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: params.value ? 'text.primary' : 'text.secondary' }}>
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'vendor',
      headerName: 'Vendor',
      flex: 0.8,
      minWidth: 150,
    },
    {
      field: 'lead_time_days',
      headerName: 'Lead Time',
      width: 100,
      align: 'center',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value} days
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      align: 'center',
      renderCell: (params) => {
        const statusColors = {
          OK: 'success',
          Warning: 'warning',
          Critical: 'error',
        };
        const statusIcons = {
          OK: <CheckCircle sx={{ fontSize: 16 }} />,
          Warning: <Warning sx={{ fontSize: 16 }} />,
          Critical: <Warning sx={{ fontSize: 16 }} />,
        };
        return (
          <Chip
            icon={statusIcons[params.value]}
            label={params.value}
            size="small"
            color={statusColors[params.value]}
          />
        );
      },
    },
    {
      field: 'unit_of_measure',
      headerName: 'UOM',
      width: 80,
      align: 'center',
    },
    {
      field: 'unit_cost',
      headerName: 'Unit Cost',
      width: 110,
      align: 'right',
      valueFormatter: (params) => `$${params.value?.toFixed(2)}`,
    },
    {
      field: 'extended_value',
      headerName: 'Extended Value',
      width: 130,
      align: 'right',
      valueFormatter: (params) => `$${params.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      field: 'expected_arrival_date',
      headerName: 'Expected Arrival',
      width: 140,
      align: 'center',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: params.value ? 'text.primary' : 'text.secondary' }}>
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'buyer',
      headerName: 'Buyer',
      width: 130,
    },
  ];

  return (
    <Box sx={{
      p: 3,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      bgcolor: colors.background
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
              Component Consolidation Dashboard
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
            Component Consolidation Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Procurement KPIs
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
            <Card sx={{ boxShadow: 'none', border: `1px solid ${colors.border}`, bgcolor: colors.cardBg }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Info sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Chip size="small" label="Req" color="primary" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Total Requirement
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text, fontSize: '1.25rem' }}>
                  {metrics.total_requirement.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: `1px solid ${colors.border}`, bgcolor: colors.cardBg }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                  <Chip size="small" label="Stock" color="success" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Available Stock
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text, fontSize: '1.25rem' }}>
                  {metrics.total_available.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: `1px solid ${colors.border}`, bgcolor: colors.cardBg }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Speed sx={{ fontSize: 18, color: 'info.main' }} />
                  <Chip size="small" label="Order" color="info" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  On Order
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text, fontSize: '1.25rem' }}>
                  {metrics.total_on_order.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: `1px solid ${colors.border}`, bgcolor: colors.cardBg }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Warning sx={{ fontSize: 18, color: metrics.total_shortage > 0 ? 'error.main' : 'success.main' }} />
                  <Chip
                    size="small"
                    label="Short"
                    color={metrics.total_shortage > 0 ? 'error' : 'success'}
                    sx={{ fontSize: '0.65rem', height: 18 }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Total Shortage
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: metrics.total_shortage > 0 ? '#D32F2F' : '#2E7D32', fontSize: '1.25rem' }}>
                  {metrics.total_shortage.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: `1px solid ${colors.border}`, bgcolor: colors.cardBg }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <AttachMoney sx={{ fontSize: 18, color: 'success.main' }} />
                  <Chip size="small" label="Value" color="success" sx={{ fontSize: '0.65rem', height: 18 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Total Value
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text, fontSize: '1.25rem' }}>
                  ${(metrics.total_value / 1000).toFixed(1)}K
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Card sx={{ boxShadow: 'none', border: `1px solid ${colors.border}`, bgcolor: colors.cardBg }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Warning sx={{ fontSize: 18, color: metrics.critical_count > 0 ? 'error.main' : 'success.main' }} />
                  <Chip
                    size="small"
                    label="Critical"
                    color={metrics.critical_count > 0 ? 'error' : 'success'}
                    sx={{ fontSize: '0.65rem', height: 18 }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  Critical Items
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: metrics.critical_count > 0 ? '#D32F2F' : '#2E7D32', fontSize: '1.25rem' }}>
                  {metrics.critical_count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Content */}
      <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
        {/* Table Toolbar */}
        <Box sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${colors.border}`,
          backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#fafafa'
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              sx={{ textTransform: 'none' }}
            >
              Add Component
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
                backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0, 0, 0, 0.04)',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: `1px solid ${colors.border}`,
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: darkMode ? 'rgba(255,255,255,0.02)' : '#f5f5f5',
                borderBottom: `2px solid ${colors.border}`,
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

    </Box>
  );
};

export default ComponentConsolidation;
