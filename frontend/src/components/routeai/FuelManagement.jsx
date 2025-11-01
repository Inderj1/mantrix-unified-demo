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
} from '@mui/material';
import {
  LocalGasStation as FuelIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  AttachMoney as CostIcon,
  Speed as EfficiencyIcon,
  TrendingUp as TrendIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useFuelManagement } from '../../hooks/useRouteData';
import stoxTheme from '../stox/stoxTheme';

const FuelManagement = ({ onBack }) => {
  const { data: fuelData, loading, refetch } = useFuelManagement();

  const totalConsumption = fuelData?.reduce((sum, f) => sum + f.consumption_liters, 0) || 0;
  const totalCost = fuelData?.reduce((sum, f) => sum + f.cost_usd, 0) || 0;
  const avgEfficiency = fuelData?.reduce((sum, f) => sum + f.efficiency_kmpl, 0) / (fuelData?.length || 1) || 0;
  const totalDistance = fuelData?.reduce((sum, f) => sum + f.distance_km, 0) || 0;

  const kpiCards = [
    { title: 'Total Consumption', value: `${totalConsumption.toFixed(0)} L`, color: '#F44336', icon: FuelIcon },
    { title: 'Total Cost', value: `$${totalCost.toFixed(0)}`, color: '#FF9800', icon: CostIcon },
    { title: 'Avg Efficiency', value: `${avgEfficiency.toFixed(2)} km/L`, color: '#4CAF50', icon: EfficiencyIcon },
    { title: 'Total Distance', value: `${(totalDistance / 1000).toFixed(1)}K km`, color: '#2196F3', icon: TrendIcon },
  ];

  const columns = [
    { field: 'id', headerName: 'ID', width: 100, renderCell: (params) => <Typography variant="body2" fontWeight={600} color="primary">{params.value}</Typography> },
    { field: 'vehicle', headerName: 'Vehicle', width: 120 },
    { field: 'driver', headerName: 'Driver', width: 120 },
    { field: 'date', headerName: 'Date', width: 120 },
    {
      field: 'fuel_type',
      headerName: 'Fuel Type',
      width: 110,
      renderCell: (params) => {
        const colorMap = { 'Diesel': '#FF9800', 'Gasoline': '#F44336', 'Electric': '#4CAF50' };
        const color = colorMap[params.value] || '#6b7280';
        return <Chip label={params.value} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontWeight: 600, fontSize: '0.75rem' }} />;
      },
    },
    { field: 'consumption_liters', headerName: 'Consumption (L)', width: 140, type: 'number' },
    { field: 'cost_usd', headerName: 'Cost ($)', width: 100, type: 'number', renderCell: (params) => <Typography variant="body2" fontWeight={600}>${params.value?.toFixed(2)}</Typography> },
    { field: 'efficiency_kmpl', headerName: 'Efficiency (km/L)', width: 140, type: 'number' },
    { field: 'distance_km', headerName: 'Distance (km)', width: 130, type: 'number' },
    { field: 'fuel_station', headerName: 'Station', width: 120 },
    {
      field: 'vs_target',
      headerName: 'vs Target %',
      width: 120,
      type: 'number',
      renderCell: (params) => {
        const value = params.value;
        if (value === null || value === undefined || isNaN(value)) {
          return <Typography variant="body2">-</Typography>;
        }
        const color = value > 0 ? '#4CAF50' : '#F44336';
        return <Chip label={`${value > 0 ? '+' : ''}${value.toFixed(1)}%`} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontWeight: 600, fontSize: '0.75rem' }} />;
      },
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>ROUTE.AI</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Fuel Management</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FuelIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>Fuel Management</Typography>
              <Typography variant="body2" color="text.secondary">Fuel consumption tracking and cost analysis</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={refetch} sx={{ bgcolor: alpha('#F44336', 0.1) }}><RefreshIcon sx={{ color: '#F44336' }} /></IconButton>
            <IconButton sx={{ bgcolor: alpha('#F44336', 0.1) }}><DownloadIcon sx={{ color: '#F44336' }} /></IconButton>
          </Stack>
        </Stack>
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpiCards.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha(kpi.color, 0.1)} 0%, ${alpha(kpi.color, 0.05)} 100%)`, border: `1px solid ${alpha(kpi.color, 0.2)}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{kpi.title}</Typography>
                    <Typography variant="h5" fontWeight={700} color={kpi.color}>{kpi.value}</Typography>
                  </Box>
                  <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: alpha(kpi.color, 0.2), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <kpi.icon sx={{ color: kpi.color, fontSize: 24 }} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DataGrid rows={fuelData || []} columns={columns} loading={loading} density="compact" slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          pageSizeOptions={[10, 25, 50, 100]} checkboxSelection disableRowSelectionOnClick sx={stoxTheme.getDataGridSx()} />
      </Paper>
    </Box>
  );
};

export default FuelManagement;
