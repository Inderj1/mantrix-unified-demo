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
  Route as RouteIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  LocalGasStation as FuelIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useRouteOptimization } from '../../hooks/useRouteData';
import stoxTheme from '../stox/stoxTheme';

const RouteOptimization = ({ onBack }) => {
  const { data: routeData, loading, refetch } = useRouteOptimization();

  const totalRoutes = routeData?.length || 0;
  const totalSavings = routeData?.reduce((sum, r) => sum + r.savings_km, 0) || 0;
  const avgSavingsPercent = routeData?.reduce((sum, r) => sum + r.savings_percent, 0) / (routeData?.length || 1) || 0;
  const totalTimeSaved = routeData?.reduce((sum, r) => sum + r.time_saved_min, 0) || 0;

  const kpiCards = [
    { title: 'Total Routes', value: totalRoutes.toString(), color: '#4CAF50', icon: RouteIcon },
    { title: 'Distance Saved', value: `${totalSavings.toFixed(0)} km`, color: '#2196F3', icon: RouteIcon },
    { title: 'Avg Savings', value: `${avgSavingsPercent.toFixed(1)}%`, color: '#FF9800', icon: RouteIcon },
    { title: 'Time Saved', value: `${Math.round(totalTimeSaved / 60)}h`, color: '#9C27B0', icon: RouteIcon },
  ];

  const columns = [
    { field: 'id', headerName: 'ID', width: 100, renderCell: (params) => <Typography variant="body2" fontWeight={600} color="primary">{params.value}</Typography> },
    { field: 'route', headerName: 'Route', width: 140 },
    { field: 'zone', headerName: 'Zone', width: 100 },
    { field: 'original_distance', headerName: 'Original (km)', width: 130, type: 'number' },
    { field: 'optimized_distance', headerName: 'Optimized (km)', width: 140, type: 'number' },
    { field: 'savings_km', headerName: 'Saved (km)', width: 110, type: 'number' },
    {
      field: 'savings_percent',
      headerName: 'Savings %',
      width: 120,
      renderCell: (params) => {
        const value = params.value;
        const color = value > 12 ? '#4CAF50' : value > 8 ? '#FF9800' : '#2196F3';
        return <Chip label={`${value?.toFixed(1)}%`} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontWeight: 600, fontSize: '0.75rem' }} />;
      },
    },
    { field: 'time_saved_min', headerName: 'Time Saved (min)', width: 150, type: 'number' },
    { field: 'fuel_saved_liters', headerName: 'Fuel Saved (L)', width: 140, type: 'number' },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const colorMap = { 'Applied': '#4CAF50', 'Pending': '#FF9800', 'In Review': '#2196F3', 'Scheduled': '#9C27B0' };
        const color = colorMap[params.value] || '#6b7280';
        return <Chip label={params.value} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontWeight: 600, fontSize: '0.75rem' }} />;
      },
    },
    { field: 'stops', headerName: 'Stops', width: 80, type: 'number' },
  ];

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>ROUTE.AI</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Route Optimization</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RouteIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>Route Optimization</Typography>
              <Typography variant="body2" color="text.secondary">AI-powered route planning and optimization</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={refetch} sx={{ bgcolor: alpha('#4CAF50', 0.1) }}><RefreshIcon sx={{ color: '#4CAF50' }} /></IconButton>
            <IconButton sx={{ bgcolor: alpha('#4CAF50', 0.1) }}><DownloadIcon sx={{ color: '#4CAF50' }} /></IconButton>
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
        <DataGrid rows={routeData || []} columns={columns} loading={loading} density="compact" slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          pageSizeOptions={[10, 25, 50, 100]} checkboxSelection disableRowSelectionOnClick sx={stoxTheme.getDataGridSx()} />
      </Paper>
    </Box>
  );
};

export default RouteOptimization;
