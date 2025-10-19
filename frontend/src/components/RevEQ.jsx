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
  Engineering as EquipmentIcon,
  Build as MaintenanceIcon,
  TrendingUp as PerformanceIcon,
  Schedule as ScheduleIcon,
  Warning as AlertIcon,
  Timeline as TimelineIcon,
  AttachMoney as CostIcon,
  Assessment as AnalyticsIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Construction as ConstructionIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';

const RevEQ = ({ onBack }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  // Sample equipment data
  const equipmentData = [
    { id: 1, equipment: 'CNC-001', type: 'CNC Machine', status: 'Operational', health: 95, uptime: 98.5, nextMaintenance: '3 days', utilizationRate: 87 },
    { id: 2, equipment: 'PRESS-002', type: 'Hydraulic Press', status: 'Operational', health: 88, uptime: 96.2, nextMaintenance: '7 days', utilizationRate: 92 },
    { id: 3, equipment: 'WELD-003', type: 'Welding Robot', status: 'Maintenance', health: 72, uptime: 89.3, nextMaintenance: 'In Progress', utilizationRate: 0 },
    { id: 4, equipment: 'CONV-004', type: 'Conveyor Belt', status: 'Operational', health: 91, uptime: 99.1, nextMaintenance: '5 days', utilizationRate: 95 },
    { id: 5, equipment: 'PACK-005', type: 'Packaging Unit', status: 'Operational', health: 85, uptime: 94.7, nextMaintenance: '2 days', utilizationRate: 89 },
    { id: 6, equipment: 'LIFT-006', type: 'Forklift', status: 'Alert', health: 68, uptime: 82.4, nextMaintenance: 'Overdue', utilizationRate: 73 },
  ];

  // Sample maintenance schedule data
  const maintenanceSchedule = [
    { id: 1, equipment: 'CNC-001', type: 'Preventive', scheduled: '2024-01-15', priority: 'Medium', estimated_duration: '4 hours', status: 'Scheduled' },
    { id: 2, equipment: 'PRESS-002', type: 'Preventive', scheduled: '2024-01-20', priority: 'Low', estimated_duration: '3 hours', status: 'Scheduled' },
    { id: 3, equipment: 'WELD-003', type: 'Corrective', scheduled: '2024-01-12', priority: 'High', estimated_duration: '8 hours', status: 'In Progress' },
    { id: 4, equipment: 'CONV-004', type: 'Preventive', scheduled: '2024-01-17', priority: 'Medium', estimated_duration: '2 hours', status: 'Scheduled' },
    { id: 5, equipment: 'LIFT-006', type: 'Corrective', scheduled: '2024-01-13', priority: 'High', estimated_duration: '6 hours', status: 'Pending' },
  ];

  // KPI Cards Data
  const kpiData = [
    {
      title: 'Overall Equipment Effectiveness',
      value: '89.2%',
      change: '+5.3%',
      trend: 'up',
      icon: PerformanceIcon,
      color: '#4CAF50',
    },
    {
      title: 'Maintenance Cost Savings',
      value: '$24,300',
      change: '+18%',
      trend: 'up',
      icon: CostIcon,
      color: '#2196F3',
    },
    {
      title: 'Average Uptime',
      value: '94.8%',
      change: '+3.2%',
      trend: 'up',
      icon: TimelineIcon,
      color: '#FF9800',
    },
    {
      title: 'Active Alerts',
      value: '7',
      change: '-12',
      trend: 'down',
      icon: AlertIcon,
      color: '#F44336',
    },
  ];

  const equipmentColumns = [
    { field: 'equipment', headerName: 'Equipment ID', width: 130 },
    { field: 'type', headerName: 'Type', width: 150 },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === 'Operational' ? 'success' :
            params.value === 'Maintenance' ? 'warning' :
            'error'
          }
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'health',
      headerName: 'Health Score',
      width: 140,
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
                bgcolor: params.value > 85 ? '#4CAF50' : params.value > 70 ? '#FF9800' : '#f44336',
              },
            }}
          />
        </Box>
      ),
    },
    { field: 'uptime', headerName: 'Uptime (%)', width: 110 },
    { field: 'nextMaintenance', headerName: 'Next Maintenance', width: 150 },
    {
      field: 'utilizationRate',
      headerName: 'Utilization',
      width: 110,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            color: params.value > 80 ? '#4CAF50' : params.value > 60 ? '#FF9800' : '#f44336',
            fontWeight: 500,
          }}
        >
          {params.value}%
        </Typography>
      ),
    },
  ];

  const maintenanceColumns = [
    { field: 'equipment', headerName: 'Equipment', width: 130 },
    { field: 'type', headerName: 'Type', width: 120 },
    { field: 'scheduled', headerName: 'Scheduled Date', width: 130 },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: alpha(
              params.value === 'High' ? '#f44336' :
              params.value === 'Medium' ? '#FF9800' : '#4CAF50',
              0.1
            ),
            color: params.value === 'High' ? '#f44336' :
                   params.value === 'Medium' ? '#FF9800' : '#4CAF50',
            fontWeight: 600,
          }}
        />
      ),
    },
    { field: 'estimated_duration', headerName: 'Duration', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === 'Scheduled' ? 'default' :
            params.value === 'In Progress' ? 'primary' :
            'warning'
          }
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
                RevEQ
              </Typography>
              <Typography variant="body1" color="text.secondary">
                AI-Powered Equipment Optimization & Predictive Maintenance
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
                          bgcolor: alpha(kpi.trend === 'up' ? '#4CAF50' : '#f44336', 0.1),
                          color: kpi.trend === 'up' ? '#4CAF50' : '#f44336',
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
          <Tab icon={<EquipmentIcon />} label="Equipment Status" iconPosition="start" />
          <Tab icon={<MaintenanceIcon />} label="Maintenance Schedule" iconPosition="start" />
          <Tab icon={<AnalyticsIcon />} label="Analytics" iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Paper sx={{ p: 0 }}>
        {activeTab === 0 && (
          <Box>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={600}>
                Real-Time Equipment Status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monitor all equipment health, performance, and maintenance schedules
              </Typography>
            </Box>
            <DataGrid
              rows={equipmentData}
              columns={equipmentColumns}
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
                Maintenance Schedule
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI-optimized maintenance scheduling for maximum uptime and cost efficiency
              </Typography>
            </Box>
            <DataGrid
              rows={maintenanceSchedule}
              columns={maintenanceColumns}
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
              Equipment Analytics & Insights
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Advanced analytics and predictive insights coming soon...
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
                      Track equipment efficiency, downtime patterns, and utilization rates over time
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <ConstructionIcon sx={{ color: '#4CAF50', fontSize: 32 }} />
                      <Typography variant="h6" fontWeight={600}>
                        Predictive Maintenance
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      AI-powered failure prediction and optimized maintenance recommendations
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

export default RevEQ;
