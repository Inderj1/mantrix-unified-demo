import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Stack,
  IconButton,
  Button,
  Breadcrumbs,
  Link,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  LocalShipping as FleetIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  DirectionsCar as VehicleIcon,
  Person as DriverIcon,
  CheckCircle as ActiveIcon,
  TrendingUp as EfficiencyIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useFleetManagement } from '../../hooks/useRouteData';
import stoxTheme from '../stox/stoxTheme';

const FleetManagement = ({ onBack }) => {
  const theme = useTheme();
  const { data: fleetData, loading, refetch } = useFleetManagement();

  // Calculate KPIs
  const totalVehicles = fleetData?.length || 0;
  const activeVehicles = fleetData?.filter(v => v.status === 'Active' || v.status === 'In Transit').length || 0;
  const avgEfficiency = fleetData?.reduce((sum, v) => sum + v.efficiency, 0) / (fleetData?.length || 1) || 0;
  const totalDeliveries = fleetData?.reduce((sum, v) => sum + v.deliveries, 0) || 0;

  const kpiCards = [
    {
      title: 'Total Vehicles',
      value: totalVehicles.toString(),
      color: '#FF9800',
      icon: VehicleIcon,
    },
    {
      title: 'Active Vehicles',
      value: activeVehicles.toString(),
      color: '#4CAF50',
      icon: ActiveIcon,
    },
    {
      title: 'Avg Efficiency',
      value: `${avgEfficiency.toFixed(1)}%`,
      color: '#2196F3',
      icon: EfficiencyIcon,
    },
    {
      title: 'Total Deliveries',
      value: totalDeliveries.toString(),
      color: '#9C27B0',
      icon: FleetIcon,
    },
  ];

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          {params.value}
        </Typography>
      ),
    },
    { field: 'vehicle', headerName: 'Vehicle', width: 120 },
    { field: 'driver', headerName: 'Driver', width: 150 },
    { field: 'route', headerName: 'Route', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const colorMap = {
          'Active': '#4CAF50',
          'In Transit': '#2196F3',
          'Completed': '#9C27B0',
          'Idle': '#FF9800',
          'Maintenance': '#F44336',
        };
        const color = colorMap[params.value] || '#6b7280';
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        );
      },
    },
    {
      field: 'efficiency',
      headerName: 'Efficiency %',
      width: 120,
      type: 'number',
      renderCell: (params) => {
        const value = params.value;
        if (value === null || value === undefined || isNaN(value)) {
          return <Typography variant="body2">-</Typography>;
        }
        const color = value > 90 ? '#4CAF50' : value > 80 ? '#FF9800' : '#F44336';
        return (
          <Chip
            label={`${value.toFixed(1)}%`}
            size="small"
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        );
      },
    },
    { field: 'distance', headerName: 'Distance (km)', width: 130, type: 'number' },
    { field: 'deliveries', headerName: 'Deliveries', width: 110, type: 'number' },
    {
      field: 'fuel_level',
      headerName: 'Fuel Level %',
      width: 120,
      type: 'number',
      renderCell: (params) => {
        const value = params.value;
        if (value === null || value === undefined || isNaN(value)) {
          return <Typography variant="body2">-</Typography>;
        }
        const color = value > 50 ? '#4CAF50' : value > 25 ? '#FF9800' : '#F44336';
        return (
          <Typography variant="body2" fontWeight={600} color={color}>
            {value.toFixed(1)}%
          </Typography>
        );
      },
    },
    { field: 'current_speed', headerName: 'Speed (km/h)', width: 120, type: 'number' },
    { field: 'last_updated', headerName: 'Last Updated', width: 130 },
  ];

  const handleExport = () => {
    console.log('Exporting fleet data...');
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
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
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              ROUTE.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              Fleet Management
            </Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
            Back
          </Button>
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FleetIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Fleet Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real-time vehicle tracking and fleet utilization
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton onClick={refetch} sx={{ bgcolor: alpha('#FF9800', 0.1) }}>
              <RefreshIcon sx={{ color: '#FF9800' }} />
            </IconButton>
            <IconButton onClick={handleExport} sx={{ bgcolor: alpha('#FF9800', 0.1) }}>
              <DownloadIcon sx={{ color: '#FF9800' }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpiCards.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${alpha(kpi.color, 0.1)} 0%, ${alpha(kpi.color, 0.05)} 100%)`,
                border: `1px solid ${alpha(kpi.color, 0.2)}`,
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {kpi.title}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color={kpi.color}>
                      {kpi.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: alpha(kpi.color, 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <kpi.icon sx={{ color: kpi.color, fontSize: 24 }} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* DataGrid */}
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DataGrid
          rows={fleetData || []}
          columns={columns}
          loading={loading}
          density="compact"
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={stoxTheme.getDataGridSx()}
        />
      </Paper>
    </Box>
  );
};

export default FleetManagement;
