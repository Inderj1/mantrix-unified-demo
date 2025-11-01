import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Stack, IconButton, Button, Breadcrumbs, Link, Chip, alpha } from '@mui/material';
import { LocationOn as DeliveryIcon, Refresh as RefreshIcon, FileDownload as DownloadIcon, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useDeliveryTracking } from '../../hooks/useRouteData';
import stoxTheme from '../stox/stoxTheme';

const DeliveryTracking = ({ onBack }) => {
  const { data: deliveryData, loading, refetch } = useDeliveryTracking();
  const totalDeliveries = deliveryData?.length || 0;
  const delivered = deliveryData?.filter(d => d.status === 'Delivered').length || 0;
  const inTransit = deliveryData?.filter(d => d.status === 'In Transit' || d.status === 'Out for Delivery').length || 0;
  const delayed = deliveryData?.filter(d => d.status === 'Delayed').length || 0;

  const kpiCards = [
    { title: 'Total Deliveries', value: totalDeliveries.toString(), color: '#2196F3', icon: DeliveryIcon },
    { title: 'Delivered', value: delivered.toString(), color: '#4CAF50', icon: DeliveryIcon },
    { title: 'In Transit', value: inTransit.toString(), color: '#FF9800', icon: DeliveryIcon },
    { title: 'Delayed', value: delayed.toString(), color: '#F44336', icon: DeliveryIcon },
  ];

  const columns = [
    { field: 'id', headerName: 'ID', width: 110, renderCell: (params) => <Typography variant="body2" fontWeight={600} color="primary">{params.value}</Typography> },
    { field: 'tracking_number', headerName: 'Tracking #', width: 130 },
    { field: 'customer', headerName: 'Customer', width: 140 },
    { field: 'address', headerName: 'Address', width: 220 },
    { field: 'status', headerName: 'Status', width: 150, renderCell: (params) => {
      const colorMap = { 'Delivered': '#4CAF50', 'In Transit': '#2196F3', 'Out for Delivery': '#FF9800', 'Pending Pickup': '#9C27B0', 'Delayed': '#F44336' };
      const color = colorMap[params.value] || '#6b7280';
      return <Chip label={params.value} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontWeight: 600, fontSize: '0.75rem' }} />;
    }},
    { field: 'priority', headerName: 'Priority', width: 100, renderCell: (params) => {
      const colorMap = { 'High': '#F44336', 'Medium': '#FF9800', 'Low': '#4CAF50' };
      const color = colorMap[params.value] || '#6b7280';
      return <Chip label={params.value} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontWeight: 600, fontSize: '0.75rem' }} />;
    }},
    { field: 'scheduled_time', headerName: 'Scheduled', width: 110 },
    { field: 'eta', headerName: 'ETA', width: 100 },
    { field: 'driver', headerName: 'Driver', width: 120 },
    { field: 'vehicle', headerName: 'Vehicle', width: 110 },
    { field: 'items', headerName: 'Items', width: 80, type: 'number' },
  ];

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>ROUTE.AI</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Delivery Tracking</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DeliveryIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box><Typography variant="h5" fontWeight={700}>Delivery Tracking</Typography><Typography variant="body2" color="text.secondary">Real-time delivery status and monitoring</Typography></Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={refetch} sx={{ bgcolor: alpha('#2196F3', 0.1) }}><RefreshIcon sx={{ color: '#2196F3' }} /></IconButton>
            <IconButton sx={{ bgcolor: alpha('#2196F3', 0.1) }}><DownloadIcon sx={{ color: '#2196F3' }} /></IconButton>
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
        <DataGrid rows={deliveryData || []} columns={columns} loading={loading} density="compact" slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          pageSizeOptions={[10, 25, 50, 100]} checkboxSelection disableRowSelectionOnClick sx={stoxTheme.getDataGridSx()} />
      </Paper>
    </Box>
  );
};

export default DeliveryTracking;
