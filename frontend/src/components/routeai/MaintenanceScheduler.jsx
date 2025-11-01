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
  Build as MaintenanceIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Schedule as ScheduleIcon,
  Warning as OverdueIcon,
  AttachMoney as CostIcon,
  CheckCircle as CompleteIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useMaintenanceScheduler } from '../../hooks/useRouteData';
import stoxTheme from '../stox/stoxTheme';

const MaintenanceScheduler = ({ onBack }) => {
  const { data: maintenanceData, loading, refetch } = useMaintenanceScheduler();

  const totalScheduled = maintenanceData?.filter(m => m.status === 'Scheduled').length || 0;
  const totalOverdue = maintenanceData?.filter(m => m.status === 'Overdue').length || 0;
  const totalCompleted = maintenanceData?.filter(m => m.status === 'Completed').length || 0;
  const totalCost = maintenanceData?.reduce((sum, m) => sum + m.estimated_cost_usd, 0) || 0;

  const kpiCards = [
    { title: 'Scheduled', value: totalScheduled.toString(), color: '#2196F3', icon: ScheduleIcon },
    { title: 'Overdue', value: totalOverdue.toString(), color: '#F44336', icon: OverdueIcon },
    { title: 'Completed', value: totalCompleted.toString(), color: '#4CAF50', icon: CompleteIcon },
    { title: 'Estimated Cost', value: `$${(totalCost / 1000).toFixed(1)}K`, color: '#FF9800', icon: CostIcon },
  ];

  const columns = [
    { field: 'id', headerName: 'ID', width: 110, renderCell: (params) => <Typography variant="body2" fontWeight={600} color="primary">{params.value}</Typography> },
    { field: 'vehicle', headerName: 'Vehicle', width: 120 },
    { field: 'service_type', headerName: 'Service Type', width: 150 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const colorMap = { 'Scheduled': '#2196F3', 'Completed': '#4CAF50', 'Overdue': '#F44336', 'In Progress': '#FF9800' };
        const color = colorMap[params.value] || '#6b7280';
        return <Chip label={params.value} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontWeight: 600, fontSize: '0.75rem' }} />;
      },
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => {
        const colorMap = { 'High': '#F44336', 'Medium': '#FF9800', 'Low': '#4CAF50' };
        const color = colorMap[params.value] || '#6b7280';
        return <Chip label={params.value} size="small" sx={{ bgcolor: alpha(color, 0.1), color, fontWeight: 600, fontSize: '0.75rem' }} />;
      },
    },
    { field: 'scheduled_date', headerName: 'Scheduled Date', width: 130 },
    { field: 'last_service_date', headerName: 'Last Service', width: 120 },
    { field: 'current_mileage_km', headerName: 'Current Mileage', width: 140, type: 'number', renderCell: (params) => <Typography variant="body2">{params.value?.toLocaleString()} km</Typography> },
    { field: 'next_service_km', headerName: 'Next Service', width: 130, type: 'number', renderCell: (params) => <Typography variant="body2">{params.value?.toLocaleString()} km</Typography> },
    { field: 'estimated_cost_usd', headerName: 'Est. Cost ($)', width: 120, type: 'number', renderCell: (params) => <Typography variant="body2" fontWeight={600}>${params.value?.toFixed(2)}</Typography> },
    { field: 'service_provider', headerName: 'Provider', width: 120 },
    { field: 'downtime_hours', headerName: 'Downtime (hrs)', width: 130, type: 'number' },
  ];

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>ROUTE.AI</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Maintenance Scheduler</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MaintenanceIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>Maintenance Scheduler</Typography>
              <Typography variant="body2" color="text.secondary">Vehicle maintenance planning and tracking</Typography>
            </Box>
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
        <DataGrid rows={maintenanceData || []} columns={columns} loading={loading} density="compact" slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          pageSizeOptions={[10, 25, 50, 100]} checkboxSelection disableRowSelectionOnClick sx={stoxTheme.getDataGridSx()} />
      </Paper>
    </Box>
  );
};

export default MaintenanceScheduler;
