import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Stack, IconButton, Button, Breadcrumbs, Link, Chip, alpha } from '@mui/material';
import { Assessment as AnalyticsIcon, Refresh as RefreshIcon, FileDownload as DownloadIcon, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { usePerformanceAnalytics } from '../../hooks/useRouteData';
import stoxTheme from '../stox/stoxTheme';

const PerformanceAnalytics = ({ onBack }) => {
  const { data: perfData, loading, refetch } = usePerformanceAnalytics();
  const avgOnTime = perfData?.reduce((sum, p) => sum + p.on_time_rate, 0) / (perfData?.length || 1) || 0;
  const avgRating = perfData?.reduce((sum, p) => sum + p.customer_rating, 0) / (perfData?.length || 1) || 0;
  const totalDeliveries = perfData?.reduce((sum, p) => sum + p.total_deliveries, 0) || 0;
  const avgSafety = perfData?.reduce((sum, p) => sum + p.safety_score, 0) / (perfData?.length || 1) || 0;

  const kpiCards = [
    { title: 'Avg On-Time', value: `${avgOnTime.toFixed(1)}%`, color: '#9C27B0', icon: AnalyticsIcon },
    { title: 'Avg Rating', value: avgRating.toFixed(2), color: '#FF9800', icon: AnalyticsIcon },
    { title: 'Total Deliveries', value: totalDeliveries.toString(), color: '#4CAF50', icon: AnalyticsIcon },
    { title: 'Avg Safety', value: `${avgSafety.toFixed(1)}`, color: '#2196F3', icon: AnalyticsIcon },
  ];

  const columns = [
    { field: 'id', headerName: 'ID', width: 100, renderCell: (params) => <Typography variant="body2" fontWeight={600} color="primary">{params.value}</Typography> },
    { field: 'driver', headerName: 'Driver', width: 150 },
    { field: 'metric', headerName: 'Metric', width: 160 },
    { field: 'total_deliveries', headerName: 'Deliveries', width: 110, type: 'number' },
    { field: 'on_time_rate', headerName: 'On-Time %', width: 110, type: 'number', renderCell: (params) => <Typography variant="body2" fontWeight={600}>{params.value?.toFixed(1)}%</Typography> },
    { field: 'fuel_efficiency_kmpl', headerName: 'Fuel Eff. (km/l)', width: 140, type: 'number' },
    { field: 'safety_score', headerName: 'Safety Score', width: 120, type: 'number' },
    { field: 'customer_rating', headerName: 'Rating', width: 100, type: 'number', renderCell: (params) => <Chip label={params.value?.toFixed(2)} size="small" sx={{ bgcolor: alpha('#FF9800', 0.1), color: '#FF9800', fontWeight: 600 }} /> },
    { field: 'total_distance_km', headerName: 'Distance (km)', width: 130, type: 'number' },
    { field: 'avg_delivery_time_min', headerName: 'Avg Time (min)', width: 140, type: 'number' },
    { field: 'incidents', headerName: 'Incidents', width: 100, type: 'number' },
  ];

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>ROUTE.AI</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Performance Analytics</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AnalyticsIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box><Typography variant="h5" fontWeight={700}>Performance Analytics</Typography><Typography variant="body2" color="text.secondary">Fleet efficiency and driver performance metrics</Typography></Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={refetch} sx={{ bgcolor: alpha('#9C27B0', 0.1) }}><RefreshIcon sx={{ color: '#9C27B0' }} /></IconButton>
            <IconButton sx={{ bgcolor: alpha('#9C27B0', 0.1) }}><DownloadIcon sx={{ color: '#9C27B0' }} /></IconButton>
          </Stack>
        </Stack>
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpiCards.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha(kpi.color, 0.1)} 0%, ${alpha(kpi.color, 0.05)} 100%)`, border: `1px solid ${alpha(kpi.color, 0.2)}` }}>
              <CardContent><Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box><Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{kpi.title}</Typography><Typography variant="h5" fontWeight={700} color={kpi.color}>{kpi.value}</Typography></Box>
                <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: alpha(kpi.color, 0.2), display: 'flex', alignItems: 'center', justifyContent: 'center' }}><kpi.icon sx={{ color: kpi.color, fontSize: 24 }} /></Box>
              </Stack></CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DataGrid rows={perfData || []} columns={columns} loading={loading} density="compact" slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          pageSizeOptions={[10, 25, 50, 100]} checkboxSelection disableRowSelectionOnClick sx={stoxTheme.getDataGridSx()} />
      </Paper>
    </Box>
  );
};

export default PerformanceAnalytics;
