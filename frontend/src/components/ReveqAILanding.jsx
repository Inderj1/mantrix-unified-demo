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
  alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Engineering,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  CheckCircle,
  QueryStats,
  PlayArrow,
  TrendingUp,
  LocalShipping,
} from '@mui/icons-material';

const ReveqAILanding = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);

    setTimeout(() => {
      // Equipment fleet data
      const equipmentData = [];
      let idCounter = 1;

      const equipment = [
        { id: 'EQ-001', name: 'Trailer T-4501', type: 'Refrigerated Trailer', region: 'Northeast' },
        { id: 'EQ-002', name: 'Truck TR-2340', type: 'Box Truck', region: 'Midwest' },
        { id: 'EQ-003', name: 'Trailer T-4502', type: 'Flatbed Trailer', region: 'South' },
        { id: 'EQ-004', name: 'Truck TR-2341', type: 'Refrigerated Truck', region: 'West' },
        { id: 'EQ-005', name: 'Trailer T-4503', type: 'Dry Van', region: 'Northeast' },
        { id: 'EQ-006', name: 'Forklift FL-890', type: 'Electric Forklift', region: 'Midwest' },
        { id: 'EQ-007', name: 'Truck TR-2342', type: 'Tanker Truck', region: 'South' },
        { id: 'EQ-008', name: 'Trailer T-4504', type: 'Refrigerated Trailer', region: 'West' },
        { id: 'EQ-009', name: 'Loader LD-550', type: 'Front Loader', region: 'Northeast' },
        { id: 'EQ-010', name: 'Truck TR-2343', type: 'Box Truck', region: 'Midwest' },
        { id: 'EQ-011', name: 'Trailer T-4505', type: 'Flatbed Trailer', region: 'South' },
        { id: 'EQ-012', name: 'Generator GN-220', type: 'Mobile Generator', region: 'West' },
      ];

      equipment.forEach((eq) => {
        // Generate utilization metrics
        const utilization = Math.round(65 + Math.random() * 30); // 65-95%
        const hoursOperated = Math.round(160 + Math.random() * 80); // 160-240 hours/month
        const revenue = Math.round(12000 + Math.random() * 18000); // $12K-$30K/month
        const maintenanceCost = Math.round(800 + Math.random() * 1200); // $800-$2000/month
        const fuelCost = Math.round(1500 + Math.random() * 2500); // $1500-$4000/month
        const netProfit = revenue - maintenanceCost - fuelCost;

        const status = utilization > 85 ? 'Optimal' : utilization > 70 ? 'Good' : 'Below Target';
        const healthScore = Math.round(75 + Math.random() * 20); // 75-95%

        const assignedTo = ['Fleet Ops Team', 'Regional Manager', 'District Supervisor', 'Operations Lead'][idCounter % 4];
        const lastMaintenance = new Date(2025, 9, 1 + (idCounter % 28)).toISOString().split('T')[0];

        equipmentData.push({
          id: `REV${String(idCounter++).padStart(4, '0')}`,
          equipment_id: eq.id,
          equipment_name: eq.name,
          equipment_type: eq.type,
          region: eq.region,
          utilization_pct: utilization,
          hours_operated: hoursOperated,
          monthly_revenue: revenue,
          maintenance_cost: maintenanceCost,
          fuel_cost: fuelCost,
          net_profit: netProfit,
          health_score: healthScore,
          status: status,
          assigned_to: assignedTo,
          last_maintenance: lastMaintenance,
        });
      });

      setData(equipmentData);

      // Calculate metrics
      const optimalCount = equipmentData.filter(d => d.status === 'Optimal').length;
      const totalRevenue = equipmentData.reduce((sum, row) => sum + row.monthly_revenue, 0);
      const totalProfit = equipmentData.reduce((sum, row) => sum + row.net_profit, 0);
      const avgUtilization = Math.round(equipmentData.reduce((sum, row) => sum + row.utilization_pct, 0) / equipmentData.length);

      setMetrics({
        totalAssets: equipmentData.length,
        optimalAssets: optimalCount,
        totalRevenue,
        totalProfit,
        avgUtilization,
      });

      setLoading(false);
    }, 800);
  };

  const columns = [
    { field: 'id', headerName: 'ID', minWidth: 100, flex: 0.8 },
    { field: 'equipment_id', headerName: 'Equipment ID', minWidth: 120, flex: 1, align: 'center', headerAlign: 'center' },
    { field: 'equipment_name', headerName: 'Name', minWidth: 160, flex: 1.2 },
    { field: 'equipment_type', headerName: 'Type', minWidth: 160, flex: 1.2 },
    { field: 'region', headerName: 'Region', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    {
      field: 'utilization_pct',
      headerName: 'Utilization %',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value > 85 ? alpha('#10b981', 0.12) : params.value > 70 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value > 85 ? '#059669' : params.value > 70 ? '#d97706' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'hours_operated',
      headerName: 'Hours/Month',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'monthly_revenue',
      headerName: 'Revenue',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `$${params.value?.toLocaleString()}`,
    },
    {
      field: 'maintenance_cost',
      headerName: 'Maintenance',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `$${params.value?.toLocaleString()}`,
    },
    {
      field: 'fuel_cost',
      headerName: 'Fuel Cost',
      minWidth: 120,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `$${params.value?.toLocaleString()}`,
    },
    {
      field: 'net_profit',
      headerName: 'Net Profit',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`$${params.value?.toLocaleString()}`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#2563eb', 0.12),
            color: '#2563eb',
          }}
        />
      ),
    },
    {
      field: 'health_score',
      headerName: 'Health Score',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          color={params.value > 85 ? 'success' : 'warning'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 130,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Optimal' ? 'success' : params.value === 'Good' ? 'primary' : 'warning'}
          icon={<CheckCircle />}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'assigned_to',
      headerName: 'Assigned To',
      minWidth: 150,
      flex: 1.2,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'last_maintenance',
      headerName: 'Last Maintenance',
      minWidth: 140,
      flex: 1.1,
      align: 'center',
      headerAlign: 'center',
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>
              CORE.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              REVEQ.AI
            </Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
            Back to CORE.AI
          </Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <Engineering sx={{ fontSize: 32, color: '#9c27b0' }} />
              <Typography variant="h4" fontWeight={700}>
                Revenue Equipment Intelligence
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Real-time fleet performance monitoring, utilization analytics, and revenue optimization
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Run Analysis">
              <IconButton color="primary">
                <PlayArrow />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchData} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export">
              <IconButton color="primary">
                <Download />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {metrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#9c27b0', 0.1)} 0%, ${alpha('#9c27b0', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <LocalShipping sx={{ color: '#9c27b0' }} />
                  <Typography variant="body2" color="text.secondary">
                    Total Assets
                  </Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#9c27b0">
                  {metrics.totalAssets}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <CheckCircle sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="text.secondary">
                    Optimal Performance
                  </Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">
                  {metrics.optimalAssets}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#2563eb', 0.1)} 0%, ${alpha('#2563eb', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TrendingUp sx={{ color: '#2563eb' }} />
                  <Typography variant="body2" color="text.secondary">
                    Monthly Revenue
                  </Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#2563eb">
                  ${(metrics.totalRevenue / 1000).toFixed(0)}K
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <QueryStats sx={{ color: '#f59e0b' }} />
                  <Typography variant="body2" color="text.secondary">
                    Avg Utilization
                  </Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#f59e0b">
                  {metrics.avgUtilization}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, width: '100%' }}>
        <DataGrid
          rows={data}
          columns={columns}
          loading={loading}
          density="compact"
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: alpha('#9c27b0', 0.05),
              fontWeight: 700,
              fontSize: '0.875rem',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${alpha('#000', 0.05)}`,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: alpha('#9c27b0', 0.02),
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default ReveqAILanding;
