import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Paper,
  Chip,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  LocalShipping as TruckIcon,
  Route as RouteIcon,
  TrendingUp as OptimizationIcon,
  Speed as PerformanceIcon,
  LocationOn as LocationIcon,
  Timeline as TimelineIcon,
  Park as EcoIcon,
  AttachMoney as CostIcon,
  Assessment as AnalyticsIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

const RouteAI = ({ onBack }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  // Sample fleet data
  const fleetData = [
    { id: 1, vehicle: 'TRK-001', driver: 'John Smith', route: 'Route A', status: 'Active', efficiency: 92, distance: 245, deliveries: 18, fuel: 85 },
    { id: 2, vehicle: 'TRK-002', driver: 'Sarah Johnson', route: 'Route B', status: 'Active', efficiency: 88, distance: 198, deliveries: 15, fuel: 72 },
    { id: 3, vehicle: 'TRK-003', driver: 'Mike Davis', route: 'Route C', status: 'Completed', efficiency: 95, distance: 312, deliveries: 22, fuel: 94 },
    { id: 4, vehicle: 'TRK-004', driver: 'Emily Wilson', route: 'Route D', status: 'Active', efficiency: 90, distance: 267, deliveries: 19, fuel: 81 },
    { id: 5, vehicle: 'TRK-005', driver: 'David Brown', route: 'Route E', status: 'In Transit', efficiency: 87, distance: 189, deliveries: 14, fuel: 68 },
    { id: 6, vehicle: 'TRK-006', driver: 'Lisa Martinez', route: 'Route F', status: 'Active', efficiency: 93, distance: 298, deliveries: 21, fuel: 89 },
  ];

  // Sample route optimization data
  const routeOptimizations = [
    { id: 1, route: 'Route A', original_distance: 285, optimized_distance: 245, savings: '14%', time_saved: '32 min', status: 'Applied' },
    { id: 2, route: 'Route B', original_distance: 225, optimized_distance: 198, savings: '12%', time_saved: '28 min', status: 'Applied' },
    { id: 3, route: 'Route C', original_distance: 342, optimized_distance: 312, savings: '9%', time_saved: '25 min', status: 'Applied' },
    { id: 4, route: 'Route D', original_distance: 295, optimized_distance: 267, savings: '9.5%', time_saved: '22 min', status: 'Pending' },
    { id: 5, route: 'Route E', original_distance: 210, optimized_distance: 189, savings: '10%', time_saved: '19 min', status: 'Applied' },
  ];

  // KPI Cards Data
  const kpiData = [
    {
      title: 'Total Distance Saved',
      value: '1,245 km',
      change: '+15%',
      trend: 'up',
      icon: RouteIcon,
      color: '#4CAF50',
    },
    {
      title: 'Fuel Cost Reduction',
      value: '$12,450',
      change: '+22%',
      trend: 'up',
      icon: CostIcon,
      color: '#2196F3',
    },
    {
      title: 'Fleet Efficiency',
      value: '91%',
      change: '+8%',
      trend: 'up',
      icon: PerformanceIcon,
      color: '#FF9800',
    },
    {
      title: 'CO2 Emissions Reduced',
      value: '3.2 tons',
      change: '+18%',
      trend: 'up',
      icon: EcoIcon,
      color: '#8BC34A',
    },
  ];

  const fleetColumns = [
    { field: 'vehicle', headerName: 'Vehicle', width: 120 },
    { field: 'driver', headerName: 'Driver', width: 150 },
    { field: 'route', headerName: 'Route', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === 'Active' ? 'success' :
            params.value === 'Completed' ? 'default' :
            'primary'
          }
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'efficiency',
      headerName: 'Efficiency',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ width: '100%' }}>
          <Typography variant="body2">{params.value}%</Typography>
          <LinearProgress
            variant="determinate"
            value={params.value}
            sx={{
              height: 6,
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                bgcolor: params.value > 90 ? '#4CAF50' : params.value > 85 ? '#FF9800' : '#f44336',
              },
            }}
          />
        </Box>
      ),
    },
    { field: 'distance', headerName: 'Distance (km)', width: 120 },
    { field: 'deliveries', headerName: 'Deliveries', width: 100 },
    {
      field: 'fuel',
      headerName: 'Fuel (%)',
      width: 100,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            color: params.value > 70 ? '#4CAF50' : params.value > 40 ? '#FF9800' : '#f44336',
            fontWeight: 500,
          }}
        >
          {params.value}%
        </Typography>
      ),
    },
  ];

  const optimizationColumns = [
    { field: 'route', headerName: 'Route', width: 120 },
    { field: 'original_distance', headerName: 'Original (km)', width: 130 },
    { field: 'optimized_distance', headerName: 'Optimized (km)', width: 140 },
    {
      field: 'savings',
      headerName: 'Savings',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: alpha('#4CAF50', 0.1),
            color: '#4CAF50',
            fontWeight: 600,
          }}
        />
      ),
    },
    { field: 'time_saved', headerName: 'Time Saved', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Applied' ? 'success' : 'warning'}
          variant="outlined"
        />
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {onBack && (
              <IconButton onClick={onBack} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                <ArrowBackIcon />
              </IconButton>
            )}
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                ROUTE.AI
              </Typography>
              <Typography variant="body1" color="text.secondary">
                AI-Powered Fleet & Route Optimization
              </Typography>
            </Box>
          </Box>
          <IconButton color="primary" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  background: `linear-gradient(135deg, ${alpha(kpi.color, 0.1)} 0%, ${alpha(kpi.color, 0.05)} 100%)`,
                  borderLeft: `4px solid ${kpi.color}`,
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {kpi.title}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                        {kpi.value}
                      </Typography>
                      <Chip
                        label={kpi.change}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          bgcolor: alpha('#4CAF50', 0.1),
                          color: '#4CAF50',
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: alpha(kpi.color, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon sx={{ fontSize: 28, color: kpi.color }} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: 60,
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 600,
            },
          }}
        >
          <Tab icon={<TruckIcon />} label="Fleet Status" iconPosition="start" />
          <Tab icon={<OptimizationIcon />} label="Route Optimization" iconPosition="start" />
          <Tab icon={<AnalyticsIcon />} label="Analytics" iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Paper sx={{ p: 0 }}>
        {activeTab === 0 && (
          <Box>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={600}>
                Real-Time Fleet Status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monitor all vehicles and their current performance metrics
              </Typography>
            </Box>
            <DataGrid
              rows={fleetData}
              columns={fleetColumns}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
                density: 'compact',
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              autoHeight
              sx={{
                border: 0,
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${theme.palette.divider}`,
                },
              }}
            />
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={600}>
                AI-Optimized Routes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Machine learning-powered route optimization for maximum efficiency
              </Typography>
            </Box>
            <DataGrid
              rows={routeOptimizations}
              columns={optimizationColumns}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
                density: 'compact',
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              autoHeight
              sx={{
                border: 0,
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${theme.palette.divider}`,
                },
              }}
            />
          </Box>
        )}

        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Fleet Analytics & Insights
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Detailed analytics and performance trends coming soon...
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <TimelineIcon sx={{ color: '#2196F3', fontSize: 32 }} />
                      <Typography variant="h6" fontWeight={600}>
                        Performance Trends
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Track fleet efficiency, fuel consumption, and delivery performance over time
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <LocationIcon sx={{ color: '#4CAF50', fontSize: 32 }} />
                      <Typography variant="h6" fontWeight={600}>
                        Geographic Heatmaps
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Visualize delivery density, traffic patterns, and optimization opportunities
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default RouteAI;
