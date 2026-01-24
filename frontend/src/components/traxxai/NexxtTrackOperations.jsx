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
  CircularProgress,
  Avatar,
  Divider,
  LinearProgress,
  Badge,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Sensors as SensorsIcon,
  Inventory as InventoryIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  BatteryAlert,
  Warning,
  CheckCircle,
  Schedule,
  Autorenew,
  LocationOn,
  Timeline,
  DeviceThermostat,
} from '@mui/icons-material';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { generateMockData } from './smadeTrackerMap/mockData';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, ChartTooltip, Legend);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true },
  },
};

const NexxtTrackOperations = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const mockData = generateMockData();
      // Transform trackers for DataGrid (add unique id field)
      const transformedData = mockData.trackers.map((tracker, idx) => ({
        id: tracker.tracker?.tracker_id || tracker.id || `tracker-${idx}`,
        ...tracker,
        // Flatten nested fields for easier column access
        tracker_id: tracker.tracker?.tracker_id || tracker.id,
        tracker_type: tracker.tracker?.tracker_type || 'GPS',
        asset_name: tracker.asset?.asset_name || tracker.kit_type,
        facility_name: tracker.location?.current_location?.facility_name || tracker.facility_name,
        department: tracker.location?.current_location?.department || 'Central Sterile',
        status: tracker.trajectory?.status || tracker.status,
        days_at_location: tracker.trajectory?.days_at_current_location || 0,
        battery_level: tracker.tracker?.battery_level || tracker.battery_level || 80,
        autoclave_cycles: tracker.lifecycle_events?.total_autoclave_cycles || 0,
        logistics_status: tracker.asset?.logistics_status || tracker.process_type || 'loaner',
        alert_count: tracker.alerts?.length || 0,
        expected_return: tracker.trajectory?.expected_return_date || null,
        is_overdue: tracker.trajectory?.is_overdue || false,
        utilization_rate: tracker.history_summary?.utilization_rate_percent || 75,
      }));

      setData(transformedData);

      // Calculate metrics
      const totalTrackers = transformedData.length;
      const criticalAlerts = transformedData.filter(t => t.battery_level < 20 || t.is_overdue).length;
      const lowBattery = transformedData.filter(t => t.battery_level < 30).length;
      const avgUtilization = transformedData.reduce((sum, t) => sum + t.utilization_rate, 0) / totalTrackers;

      setMetrics({
        totalTrackers,
        criticalAlerts,
        lowBattery,
        avgUtilization: avgUtilization.toFixed(1),
      });

      setLoading(false);
    }, 600);
  };

  const handleRowClick = (params) => {
    setSelectedRow(params.row);
  };

  const handleBackToList = () => setSelectedRow(null);

  const getStatusColor = (status) => {
    const colors = {
      'in_transit': { bg: '#dbeafe', color: '#2563eb' },
      'in-transit': { bg: '#dbeafe', color: '#2563eb' },
      'in_hospital': { bg: '#dcfce7', color: '#16a34a' },
      'at-facility': { bg: '#dcfce7', color: '#16a34a' },
      'in_surgery': { bg: '#f3e8ff', color: '#9333ea' },
      'in-surgery': { bg: '#f3e8ff', color: '#9333ea' },
      'at_dc': { bg: '#f1f5f9', color: '#64748b' },
      'at-dc': { bg: '#f1f5f9', color: '#64748b' },
      'processing': { bg: '#fef3c7', color: '#d97706' },
      'awaiting-return': { bg: '#fee2e2', color: '#dc2626' },
    };
    return colors[status] || { bg: '#f1f5f9', color: '#64748b' };
  };

  const getTrackerTypeColor = (type) => {
    const colors = {
      'HOT': '#ef4444',
      'COT': '#f97316',
      'BLE': '#3b82f6',
      'GPS': '#10b981',
    };
    return colors[type] || '#64748b';
  };

  const getBatteryColor = (level) => {
    if (level <= 20) return '#ef4444';
    if (level <= 40) return '#f59e0b';
    return '#10b981';
  };

  const columns = [
    {
      field: 'tracker_id',
      headerName: 'Tracker ID',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 600,
            fontFamily: 'monospace',
            fontSize: '0.7rem',
            bgcolor: alpha('#64748b', 0.1),
            color: '#475569'
          }}
        />
      ),
    },
    {
      field: 'asset_name',
      headerName: 'Asset Name',
      width: 180,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography sx={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {params.value?.slice(0, 25)}{params.value?.length > 25 ? '...' : ''}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'tracker_type',
      headerName: 'Type',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.65rem',
            height: 22,
            bgcolor: alpha(getTrackerTypeColor(params.value), 0.15),
            color: getTrackerTypeColor(params.value),
          }}
        />
      ),
    },
    {
      field: 'facility_name',
      headerName: 'Facility',
      width: 160,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography sx={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {params.value?.slice(0, 20)}{params.value?.length > 20 ? '...' : ''}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 140,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
          {params.value?.slice(0, 18)}{params.value?.length > 18 ? '...' : ''}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const style = getStatusColor(params.value);
        return (
          <Chip
            label={params.value?.replace(/[-_]/g, ' ')}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '0.65rem',
              height: 22,
              bgcolor: style.bg,
              color: style.color,
              textTransform: 'capitalize',
            }}
          />
        );
      },
    },
    {
      field: 'days_at_location',
      headerName: 'Days',
      width: 70,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography sx={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: params.value > 7 ? '#f59e0b' : '#64748b',
        }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'battery_level',
      headerName: 'Battery',
      width: 100,
      renderCell: (params) => {
        const color = getBatteryColor(params.value);
        return (
          <Box sx={{ width: '100%' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color, mb: 0.25 }}>
              {params.value}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={params.value}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: alpha(color, 0.2),
                '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 2 }
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'autoclave_cycles',
      headerName: 'Cycles',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const isWarning = params.value > 130;
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 22,
              bgcolor: isWarning ? alpha('#f59e0b', 0.15) : alpha('#64748b', 0.1),
              color: isWarning ? '#d97706' : '#64748b',
            }}
          />
        );
      },
    },
    {
      field: 'logistics_status',
      headerName: 'Logistics',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: '0.65rem',
            height: 22,
            bgcolor: params.value === 'loaner' ? alpha('#3b82f6', 0.15) : alpha('#8b5cf6', 0.15),
            color: params.value === 'loaner' ? '#2563eb' : '#7c3aed',
            textTransform: 'capitalize',
          }}
        />
      ),
    },
    {
      field: 'alert_count',
      headerName: 'Alerts',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Badge
          badgeContent={params.value}
          color={params.value > 0 ? 'error' : 'default'}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.65rem',
              fontWeight: 700,
              minWidth: 18,
              height: 18,
            }
          }}
        >
          <Warning sx={{ fontSize: 20, color: params.value > 0 ? '#f59e0b' : '#cbd5e1' }} />
        </Badge>
      ),
    },
    {
      field: 'expected_return',
      headerName: 'Return Date',
      width: 110,
      renderCell: (params) => {
        const isOverdue = params.row.is_overdue;
        const date = params.value ? new Date(params.value).toLocaleDateString() : '-';
        return (
          <Typography sx={{
            fontSize: '0.75rem',
            fontWeight: isOverdue ? 700 : 400,
            color: isOverdue ? '#ef4444' : '#64748b',
          }}>
            {date}
          </Typography>
        );
      },
    },
  ];

  const renderDetailView = () => {
    if (!selectedRow) return null;

    const batteryColor = getBatteryColor(selectedRow.battery_level);
    const statusStyle = getStatusColor(selectedRow.status);

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList} variant="outlined" size="small">
            Back to List
          </Button>
          <Stack direction="row" spacing={1}>
            <Chip
              label={selectedRow.tracker_id}
              size="small"
              sx={{ fontWeight: 700, fontFamily: 'monospace', bgcolor: alpha('#64748b', 0.1), color: '#475569' }}
            />
            <Chip
              label={selectedRow.tracker_type}
              size="small"
              sx={{
                fontWeight: 700,
                bgcolor: alpha(getTrackerTypeColor(selectedRow.tracker_type), 0.15),
                color: getTrackerTypeColor(selectedRow.tracker_type)
              }}
            />
          </Stack>
        </Stack>

        {/* Title */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{selectedRow.asset_name}</Typography>
        <Typography sx={{ color: '#64748b', mb: 3 }}>
          {selectedRow.facility_name} - {selectedRow.department}
        </Typography>

        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Battery Level', value: `${selectedRow.battery_level}%`, color: batteryColor, icon: <BatteryAlert /> },
            { label: 'Autoclave Cycles', value: selectedRow.autoclave_cycles, color: selectedRow.autoclave_cycles > 130 ? '#f59e0b' : '#64748b', icon: <Autorenew /> },
            { label: 'Days at Location', value: selectedRow.days_at_location, color: '#64748b', icon: <Schedule /> },
            { label: 'Status', value: selectedRow.status?.replace(/[-_]/g, ' '), color: statusStyle.color, icon: <LocationOn /> },
          ].map((metric, idx) => (
            <Grid item xs={6} sm={3} key={idx}>
              <Card sx={{ background: `linear-gradient(135deg, ${alpha(metric.color, 0.1)} 0%, ${alpha(metric.color, 0.05)} 100%)` }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <Box sx={{ color: metric.color }}>{metric.icon}</Box>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>{metric.label}</Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: metric.color, fontSize: '1rem', textTransform: 'capitalize' }}>
                    {metric.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 3 Cards Layout */}
        <Grid container spacing={2}>
          {/* Card 1: Tracker Info */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Tracker Information
                </Typography>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>Tracker Type</Typography>
                    <Chip label={selectedRow.tracker_type} size="small" sx={{ fontWeight: 600, bgcolor: alpha(getTrackerTypeColor(selectedRow.tracker_type), 0.15), color: getTrackerTypeColor(selectedRow.tracker_type) }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>Logistics Status</Typography>
                    <Chip label={selectedRow.logistics_status} size="small" sx={{ fontWeight: 600, bgcolor: alpha('#3b82f6', 0.1), color: '#2563eb', textTransform: 'capitalize' }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>Utilization Rate</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>{selectedRow.utilization_rate}%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>Expected Return</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: selectedRow.is_overdue ? '#ef4444' : '#64748b' }}>
                      {selectedRow.expected_return ? new Date(selectedRow.expected_return).toLocaleDateString() : '-'}
                    </Typography>
                  </Box>
                </Stack>

                {selectedRow.alert_count > 0 && (
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: alpha('#ef4444', 0.08), borderRadius: 1, border: '1px solid', borderColor: alpha('#ef4444', 0.2) }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Warning sx={{ color: '#ef4444', fontSize: 18 }} />
                      <Typography sx={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>{selectedRow.alert_count} Active Alert(s)</Typography>
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Card 2: Lifecycle Events */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Lifecycle Events
                </Typography>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>Autoclave Cycles</Typography>
                    <Chip
                      label={selectedRow.autoclave_cycles}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: selectedRow.autoclave_cycles > 130 ? alpha('#f59e0b', 0.15) : alpha('#10b981', 0.15),
                        color: selectedRow.autoclave_cycles > 130 ? '#d97706' : '#059669',
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>Total Usage Count</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{selectedRow.lifecycle_events?.total_usage_count || '-'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>Washing Cycles</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{selectedRow.lifecycle_events?.total_washing_cycles || '-'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>Drop Events</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: (selectedRow.lifecycle_events?.total_drop_count || 0) > 2 ? '#f59e0b' : '#64748b' }}>
                      {selectedRow.lifecycle_events?.total_drop_count || 0}
                    </Typography>
                  </Box>
                </Stack>

                {selectedRow.autoclave_cycles > 130 && (
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: alpha('#f59e0b', 0.08), borderRadius: 1 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#d97706' }}>
                      Approaching cycle limit (150). Schedule maintenance.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Card 3: Trends */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Performance Trends
                </Typography>

                {/* Battery Gauge */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress variant="determinate" value={100} size={70} thickness={5} sx={{ color: alpha('#64748b', 0.1) }} />
                    <CircularProgress variant="determinate" value={selectedRow.battery_level} size={70} thickness={5} sx={{ color: batteryColor, position: 'absolute', left: 0 }} />
                    <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ fontWeight: 700, color: batteryColor, fontSize: '0.9rem' }}>{selectedRow.battery_level}%</Typography>
                      <Typography sx={{ fontSize: '0.45rem', color: '#64748b' }}>BATTERY</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Utilization Line Chart */}
                <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textAlign: 'center', mb: 1 }}>Utilization Trend (12 months)</Typography>
                <Box sx={{ height: 90, mb: 2 }}>
                  <Line
                    data={{
                      labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
                      datasets: [{
                        data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 30) + 60),
                        borderColor: '#10b981',
                        backgroundColor: alpha('#10b981', 0.1),
                        fill: true,
                        tension: 0.4,
                      }],
                    }}
                    options={chartOptions}
                  />
                </Box>

                {/* Location History Bar Chart */}
                <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textAlign: 'center', mb: 1 }}>Days per Location (Last 6)</Typography>
                <Box sx={{ height: 90 }}>
                  <Bar
                    data={{
                      labels: ['Loc 1', 'Loc 2', 'Loc 3', 'Loc 4', 'Loc 5', 'Loc 6'],
                      datasets: [{
                        data: [5, 8, 3, 12, 7, selectedRow.days_at_location],
                        backgroundColor: alpha('#3b82f6', 0.6),
                        borderColor: '#3b82f6',
                        borderWidth: 1,
                        borderRadius: 4,
                      }],
                    }}
                    options={chartOptions}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, height: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>TRACK AI</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              {selectedRow ? `Tracker ${selectedRow.tracker_id}` : 'Operations'}
            </Typography>
          </Breadcrumbs>
          {!selectedRow && (
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh"><IconButton onClick={fetchData} color="primary"><Refresh /></IconButton></Tooltip>
              <Tooltip title="Export"><IconButton color="primary"><Download /></IconButton></Tooltip>
            </Stack>
          )}
        </Stack>

        {!selectedRow && (
          <>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <InventoryIcon sx={{ fontSize: 32, color: '#3b82f6' }} />
              <Typography variant="h4" fontWeight={700}>Operations</Typography>
              <Chip icon={<SensorsIcon sx={{ fontSize: 14 }} />} label="SMADE Trackers" size="small" sx={{ fontWeight: 600, bgcolor: alpha('#10b981', 0.1), color: '#059669' }} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Manage and monitor all SMADE IoT trackers, lifecycle events, and alerts
            </Typography>
          </>
        )}
      </Box>

      {selectedRow ? (
        renderDetailView()
      ) : (
        <>
          {/* KPI Cards */}
          {metrics && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                { label: 'Total Trackers', value: metrics.totalTrackers, color: '#64748b', icon: <SensorsIcon /> },
                { label: 'Critical Alerts', value: metrics.criticalAlerts, color: '#ef4444', icon: <Warning /> },
                { label: 'Low Battery', value: metrics.lowBattery, color: '#f59e0b', icon: <BatteryAlert /> },
                { label: 'Avg Utilization', value: `${metrics.avgUtilization}%`, color: '#10b981', icon: <CheckCircle /> },
              ].map((kpi, idx) => (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                  <Card sx={{ background: `linear-gradient(135deg, ${alpha(kpi.color, 0.1)} 0%, ${alpha(kpi.color, 0.05)} 100%)` }}>
                    <CardContent sx={{ py: 2 }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Box sx={{ color: kpi.color }}>{kpi.icon}</Box>
                        <Typography variant="body2" color="text.secondary">{kpi.label}</Typography>
                      </Stack>
                      <Typography variant="h4" fontWeight={700} sx={{ color: kpi.color }}>{kpi.value}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Data Grid */}
          <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <DataGrid
              rows={data}
              columns={columns}
              loading={loading}
              density="compact"
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              onRowClick={handleRowClick}
              sx={{
                flex: 1,
                '& .MuiDataGrid-row': { cursor: 'pointer' },
                '& .MuiDataGrid-row:hover': { bgcolor: alpha('#64748b', 0.04) },
                '& .MuiDataGrid-columnHeaders': { bgcolor: alpha('#64748b', 0.03) },
              }}
            />
          </Paper>
        </>
      )}
    </Box>
  );
};

export default NexxtTrackOperations;
