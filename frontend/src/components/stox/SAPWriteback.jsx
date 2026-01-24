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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  CloudSync as CloudSyncIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  FilterList as FilterListIcon,
  CheckCircle,
  Error as ErrorIcon,
  Schedule,
  PlayArrow,
  Pause,
  Sync,
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
import stoxTheme from './stoxTheme';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, ChartTooltip, Legend);

const getColors = (darkMode) => ({
  primary: darkMode ? '#4da6ff' : '#0a6ed1',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

// Import Arizona Beverages data
import {
  LAM_PLANTS,
  LAM_MATERIALS,
  LAM_MATERIAL_PLANT_DATA,
  getPlantName,
  getMaterialById,
} from '../../data/arizonaBeveragesMasterData';

// Generate SAP writeback data using Arizona Beverages references
const generateWritebackData = () => {
  const jobs = [
    { id: 'WB-001', name: 'Safety Stock Update - Keasbey NJ', target: 'MM02', system: 'S4P', plant: '1000', materials: ['SFG0001', 'SFG0002', 'SFG0003'] },
    { id: 'WB-002', name: 'Reorder Point Sync - Santa Clarita', target: 'MM02', system: 'S4P', plant: '2000', materials: ['FG0001', 'FG0002', 'SFG0001'] },
    { id: 'WB-003', name: 'MRP Parameter Update - Douglas', target: 'MD02', system: 'S4P', plant: '3000', materials: ['FG0001', 'FG0002', 'FG0003'] },
    { id: 'WB-004', name: 'Lead Time Adjustment - Vendors', target: 'ME12', system: 'S4P', plant: 'ALL', materials: ['SFG0001', 'SFG0002'] },
    { id: 'WB-005', name: 'Lot Size Config - Taiwan', target: 'MM02', system: 'S4D', plant: '4000', materials: ['FG0001', 'SFG0001', 'SFG0004'] },
    { id: 'WB-006', name: 'Standard Cost Update - FY25', target: 'MR21', system: 'S4P', plant: 'ALL', materials: ['FG0001', 'FG0002', 'FG0003'] },
    { id: 'WB-007', name: 'Vendor Info Record - US Beverage Packers', target: 'XK02', system: 'S4P', plant: 'ALL', vendor: 'SUPP0001' },
    { id: 'WB-008', name: 'Info Record Update - MKS Instruments', target: 'ME12', system: 'S4D', plant: 'ALL', vendor: 'SUPP0005' },
    { id: 'WB-009', name: 'Scheduling Agreement - Swagelok', target: 'ME32L', system: 'S4P', plant: '1000', vendor: 'SUPP0010' },
    { id: 'WB-010', name: 'Inter-Plant Transfer - Douglas to Taiwan', target: 'MB1B', system: 'S4P', plant: '3000', materials: ['FG0001', 'FG0002'] },
    { id: 'WB-011', name: 'Purchase Req - RF Power Supply', target: 'ME51N', system: 'S4D', plant: '2000', materials: ['SFG0002'] },
    { id: 'WB-012', name: 'Forecast Update - Q2 FY25', target: 'MD61', system: 'S4P', plant: 'ALL', materials: ['FG0001', 'FG0002', 'FG0003'] },
  ];

  const statuses = ['Completed', 'In Progress', 'Pending', 'Failed', 'Scheduled'];

  return jobs.map((job, idx) => {
    const status = statuses[idx % 5];
    // Records based on actual Arizona data - materials * plants
    const recordsTotal = job.plant === 'ALL' ? (job.materials?.length || 3) * 5 : (job.materials?.length || 3);
    const recordsProcessed = status === 'Completed' ? recordsTotal : status === 'In Progress' ? Math.floor(recordsTotal * (0.3 + Math.random() * 0.6)) : 0;
    const recordsFailed = status === 'Failed' ? Math.floor(recordsTotal * 0.1) : status === 'Completed' ? Math.floor(Math.random() * 2) : 0;

    return {
      id: job.id,
      name: job.name,
      target: job.target,
      system: job.system,
      plant: job.plant,
      materials: job.materials,
      vendor: job.vendor,
      status,
      recordsTotal,
      recordsProcessed,
      recordsFailed,
      successRate: recordsProcessed > 0 ? ((recordsProcessed - recordsFailed) / recordsProcessed * 100).toFixed(1) : '-',
      startTime: status !== 'Pending' && status !== 'Scheduled' ? new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString().slice(11, 19) : '-',
      endTime: status === 'Completed' || status === 'Failed' ? new Date(Date.now() - Math.floor(Math.random() * 1800000)).toISOString().slice(11, 19) : '-',
      duration: status === 'Completed' || status === 'Failed' ? `${Math.floor(1 + Math.random() * 15)} min` : '-',
      lastRun: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString().split('T')[0],
      nextRun: status === 'Scheduled' ? new Date(Date.now() + Math.floor(Math.random() * 86400000)).toISOString().split('T')[0] : '-',
      createdBy: 'STOX.AI',
      errorMessage: status === 'Failed' ? 'RFC connection timeout to SAP ECC - Douglas plant' : null,
    };
  });
};

const SAPWriteback = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    system: 'all',
    target: 'all',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const writebackData = generateWritebackData();
      setData(writebackData);

      const totalJobs = writebackData.length;
      const completedCount = writebackData.filter(d => d.status === 'Completed').length;
      const inProgressCount = writebackData.filter(d => d.status === 'In Progress').length;
      const failedCount = writebackData.filter(d => d.status === 'Failed').length;
      const scheduledCount = writebackData.filter(d => d.status === 'Scheduled').length;
      const totalRecords = writebackData.reduce((sum, d) => sum + d.recordsTotal, 0);
      const processedRecords = writebackData.reduce((sum, d) => sum + d.recordsProcessed, 0);
      const avgSuccessRate = writebackData.filter(d => d.successRate !== '-').reduce((sum, d) => sum + parseFloat(d.successRate), 0) / (completedCount + failedCount) || 0;

      setMetrics({
        totalJobs,
        completedCount,
        inProgressCount,
        failedCount,
        scheduledCount,
        totalRecords,
        processedRecords,
        avgSuccessRate: avgSuccessRate.toFixed(1),
      });
      setLoading(false);
    }, 500);
  };

  const filteredData = data.filter(row => {
    if (filters.status !== 'all' && row.status !== filters.status) return false;
    if (filters.system !== 'all' && row.system !== filters.system) return false;
    if (filters.target !== 'all' && row.target !== filters.target) return false;
    return true;
  });

  const columns = [
    { field: 'id', headerName: 'Job ID', minWidth: 90, flex: 0.6 },
    { field: 'name', headerName: 'Job Name', minWidth: 180, flex: 1.4 },
    { field: 'target', headerName: 'SAP Target', minWidth: 100, flex: 0.7, align: 'center', headerAlign: 'center' },
    { field: 'system', headerName: 'System', minWidth: 80, flex: 0.5, align: 'center', headerAlign: 'center' },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 110,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Completed' ? 'success' : params.value === 'In Progress' ? 'info' : params.value === 'Failed' ? 'error' : params.value === 'Scheduled' ? 'warning' : 'default'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'recordsProcessed',
      headerName: 'Processed',
      minWidth: 100,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => `${params.value}/${params.row.recordsTotal}`,
    },
    {
      field: 'successRate',
      headerName: 'Success %',
      minWidth: 100,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        if (params.value === '-') return '-';
        const val = parseFloat(params.value);
        return (
          <Chip
            label={`${params.value}%`}
            size="small"
            color={val >= 98 ? 'success' : val >= 90 ? 'warning' : 'error'}
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
    {
      field: 'duration',
      headerName: 'Duration',
      minWidth: 90,
      flex: 0.6,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'lastRun',
      headerName: 'Last Run',
      minWidth: 100,
      flex: 0.7,
    },
    {
      field: 'nextRun',
      headerName: 'Next Run',
      minWidth: 100,
      flex: 0.7,
    },
  ];

  const handleRowClick = (params) => {
    setSelectedJob(params.row);
  };

  const renderDetailView = () => {
    if (!selectedJob) return null;

    const progressData = {
      labels: ['Processed', 'Pending', 'Failed'],
      datasets: [{
        data: [
          selectedJob.recordsProcessed - selectedJob.recordsFailed,
          selectedJob.recordsTotal - selectedJob.recordsProcessed,
          selectedJob.recordsFailed,
        ],
        backgroundColor: ['#10b981', '#64748b', '#ef4444'],
      }],
    };

    const historyData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Success Rate %',
          data: Array.from({ length: 7 }, () => 90 + Math.random() * 10),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          yAxisID: 'y',
        },
        {
          label: 'Records',
          data: Array.from({ length: 7 }, () => Math.floor(50 + Math.random() * 200)),
          borderColor: '#0891b2',
          backgroundColor: 'transparent',
          yAxisID: 'y1',
        },
      ],
    };

    return (
      <Box>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => setSelectedJob(null)}
            variant="outlined"
            size="small"
          >
            Back to List
          </Button>
          <Typography variant="h6" fontWeight={700}>
            {selectedJob.name}
          </Typography>
          <Chip
            label={selectedJob.status}
            size="small"
            color={selectedJob.status === 'Completed' ? 'success' : selectedJob.status === 'In Progress' ? 'info' : selectedJob.status === 'Failed' ? 'error' : 'default'}
          />
          <Box sx={{ flexGrow: 1 }} />
          {selectedJob.status === 'In Progress' && (
            <Button startIcon={<Pause />} variant="outlined" color="warning" size="small" sx={{ mr: 1 }}>
              Pause
            </Button>
          )}
          {(selectedJob.status === 'Failed' || selectedJob.status === 'Pending') && (
            <Button startIcon={<PlayArrow />} variant="contained" color="primary" size="small">
              {selectedJob.status === 'Failed' ? 'Retry' : 'Run Now'}
            </Button>
          )}
        </Box>

        {selectedJob.status === 'Failed' && selectedJob.errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>Error:</strong> {selectedJob.errorMessage}
          </Alert>
        )}

        <Grid container spacing={2}>
          {/* Progress Cards */}
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #0891b2' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Total Records</Typography>
                <Typography variant="h5" fontWeight={700}>{selectedJob.recordsTotal}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #10b981' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Processed</Typography>
                <Typography variant="h5" fontWeight={700} color="success.main">{selectedJob.recordsProcessed}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #ef4444' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Failed</Typography>
                <Typography variant="h5" fontWeight={700} color="error.main">{selectedJob.recordsFailed}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #0078d4' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Success Rate</Typography>
                <Typography variant="h5" fontWeight={700}>{selectedJob.successRate}%</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Progress Bar */}
          {selectedJob.status === 'In Progress' && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>Execution Progress</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(selectedJob.recordsProcessed / selectedJob.recordsTotal) * 100}
                      sx={{ flex: 1, height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="body2" fontWeight={600}>
                      {((selectedJob.recordsProcessed / selectedJob.recordsTotal) * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Job Details */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Job Configuration</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">SAP Target</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedJob.target}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Target System</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedJob.system}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Start Time</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedJob.startTime}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">End Time</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedJob.endTime}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Duration</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedJob.duration}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Created By</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedJob.createdBy}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Progress Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Record Status</Typography>
                <Box sx={{ height: 200 }}>
                  <Bar
                    data={progressData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom' } },
                      scales: { y: { beginAtZero: true } },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* History Chart */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>7-Day Execution History</Typography>
                <Box sx={{ height: 250 }}>
                  <Line
                    data={historyData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'top' } },
                      scales: {
                        y: { type: 'linear', display: true, position: 'left', min: 80, max: 100, title: { display: true, text: 'Success %' } },
                        y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Records' } },
                      },
                    }}
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
    <Box sx={{ p: 3, height: '100%', overflow: 'auto', bgcolor: colors.background }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>
              STOX.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              SAP Writeback
            </Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small" sx={{ borderColor: 'divider' }}>
            Back
          </Button>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <CloudSyncIcon sx={{ fontSize: 32, color: '#0891b2' }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="#0891b2">
              SAP Writeback
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor and manage parameter updates pushed to SAP systems
            </Typography>
          </Box>
        </Stack>
      </Box>

      {selectedJob ? (
        renderDetailView()
      ) : (
        <>
          {/* Summary Cards */}
          {metrics && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #0891b2' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Total Jobs</Typography>
                    <Typography variant="h5" fontWeight={700}>{metrics.totalJobs}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #10b981' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Completed</Typography>
                    <Typography variant="h5" fontWeight={700} color="success.main">{metrics.completedCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #2b88d8' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">In Progress</Typography>
                    <Typography variant="h5" fontWeight={700} color="info.main">{metrics.inProgressCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #ef4444' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Failed</Typography>
                    <Typography variant="h5" fontWeight={700} color="error.main">{metrics.failedCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #f59e0b' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Scheduled</Typography>
                    <Typography variant="h5" fontWeight={700} color="warning.main">{metrics.scheduledCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #0078d4' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Avg Success</Typography>
                    <Typography variant="h5" fontWeight={700}>{metrics.avgSuccessRate}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 2, bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <FilterListIcon color="action" />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select value={filters.status} label="Status" onChange={(e) => setFilters({ ...filters, status: e.target.value })} sx={{ bgcolor: colors.paper }}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Failed">Failed</MenuItem>
                  <MenuItem value="Scheduled">Scheduled</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>System</InputLabel>
                <Select value={filters.system} label="System" onChange={(e) => setFilters({ ...filters, system: e.target.value })} sx={{ bgcolor: colors.paper }}>
                  <MenuItem value="all">All Systems</MenuItem>
                  <MenuItem value="S4P">S4P (Production)</MenuItem>
                  <MenuItem value="S4D">S4D (Development)</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>SAP Target</InputLabel>
                <Select value={filters.target} label="SAP Target" onChange={(e) => setFilters({ ...filters, target: e.target.value })} sx={{ bgcolor: colors.paper }}>
                  <MenuItem value="all">All Targets</MenuItem>
                  <MenuItem value="MM02">MM02</MenuItem>
                  <MenuItem value="MD02">MD02</MenuItem>
                  <MenuItem value="ME12">ME12</MenuItem>
                  <MenuItem value="MR21">MR21</MenuItem>
                  <MenuItem value="XK02">XK02</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ flexGrow: 1 }} />
              <Button startIcon={<Sync />} variant="contained" size="small" color="primary">
                Sync All
              </Button>
              <Tooltip title="Refresh Data">
                <IconButton onClick={fetchData} size="small">
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export">
                <IconButton size="small">
                  <Download />
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>

          {/* Data Grid */}
          <Paper sx={{ height: 500, bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
            <DataGrid
              rows={filteredData}
              columns={columns}
              loading={loading}
              density="compact"
              checkboxSelection
              disableRowSelectionOnClick
              onRowClick={handleRowClick}
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
              sx={{
                ...stoxTheme.getDataGridSx({ clickable: true }),
                ...(darkMode && {
                  '& .MuiDataGrid-root': { color: colors.text },
                  '& .MuiDataGrid-cell': { borderColor: colors.border, color: colors.text },
                  '& .MuiDataGrid-columnHeaders': { bgcolor: colors.cardBg, borderColor: colors.border, color: colors.text },
                  '& .MuiDataGrid-columnHeaderTitle': { color: colors.text, fontWeight: 600 },
                  '& .MuiDataGrid-row': { borderColor: colors.border, '&:hover': { bgcolor: alpha(colors.primary, 0.1) } },
                  '& .MuiDataGrid-footerContainer': { bgcolor: colors.cardBg, borderColor: colors.border },
                  '& .MuiTablePagination-root': { color: colors.text },
                  '& .MuiIconButton-root': { color: colors.textSecondary },
                }),
              }}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </Paper>
        </>
      )}
    </Box>
  );
};

export default SAPWriteback;
