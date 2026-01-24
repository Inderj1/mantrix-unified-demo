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
  CircularProgress,
  Avatar,
  Divider,
  LinearProgress,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Build as OperationsIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  CheckCircle,
  Schedule,
  Warning,
  Assignment,
  LocalHospital,
  Verified,
  Inventory,
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
import {
  generateOperationsData,
  generateOperationsDetail,
  calculateOperationsMetrics,
} from '../shared/traxxMockData';

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

const LoanerOperations = ({ onBack }) => {
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
      const opsData = generateOperationsData('loaner', 25);
      setData(opsData);
      setMetrics(calculateOperationsMetrics(opsData));
      setLoading(false);
    }, 600);
  };

  const handleRowClick = (params) => {
    const detailData = generateOperationsDetail(params.row);
    setSelectedRow(detailData);
  };

  const handleBackToList = () => setSelectedRow(null);

  const getStatusColor = (status) => {
    const colors = {
      'Pending': { bg: '#fef3c7', color: '#d97706', border: '#fcd34d' },
      'In Transit': { bg: '#dbeafe', color: '#2563eb', border: '#93c5fd' },
      'Received': { bg: '#dcfce7', color: '#16a34a', border: '#86efac' },
      'In Progress': { bg: '#e0e7ff', color: '#4f46e5', border: '#a5b4fc' },
      'Passed': { bg: '#dcfce7', color: '#16a34a', border: '#86efac' },
      'Failed': { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' },
      'Completed': { bg: '#dcfce7', color: '#16a34a', border: '#86efac' },
    };
    return colors[status] || { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' };
  };

  const columns = [
    {
      field: 'kit_id',
      headerName: 'Kit ID',
      width: 110,
      renderCell: (params) => (
        <Chip label={params.value} size="small" sx={{ fontWeight: 700, bgcolor: alpha('#0a6ed1', 0.1), color: '#0a6ed1' }} />
      ),
    },
    { field: 'kit_name', headerName: 'Kit Name', width: 150 },
    { field: 'hospital', headerName: 'Hospital', width: 180 },
    { field: 'procedure_date', headerName: 'Procedure Date', width: 120 },
    { field: 'items_used', headerName: 'Items Used', width: 100, align: 'center' },
    { field: 'po_number', headerName: 'PO Number', width: 120 },
    {
      field: 'return_status',
      headerName: 'Return Status',
      width: 120,
      renderCell: (params) => {
        const style = getStatusColor(params.value);
        return <Chip label={params.value} size="small" sx={{ fontWeight: 600, bgcolor: style.bg, color: style.color }} />;
      },
    },
    {
      field: 'qc_status',
      headerName: 'QC Status',
      width: 120,
      renderCell: (params) => {
        const style = getStatusColor(params.value);
        return <Chip label={params.value} size="small" sx={{ fontWeight: 600, bgcolor: style.bg, color: style.color }} />;
      },
    },
    {
      field: 'restock_status',
      headerName: 'Restock',
      width: 120,
      renderCell: (params) => {
        const style = getStatusColor(params.value);
        return <Chip label={params.value} size="small" sx={{ fontWeight: 600, bgcolor: style.bg, color: style.color }} />;
      },
    },
  ];

  const renderDetailView = () => {
    if (!selectedRow) return null;

    const healthColor = selectedRow.kit_health_score >= 90 ? '#10b981' : selectedRow.kit_health_score >= 75 ? '#f59e0b' : '#ef4444';

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList} variant="outlined" size="small">
            Back to List
          </Button>
          <Stack direction="row" spacing={1}>
            <Chip label={selectedRow.kit_id} size="small" sx={{ fontWeight: 700, bgcolor: alpha('#0a6ed1', 0.1), color: '#0a6ed1' }} />
            <Chip label={selectedRow.qc_status} size="small" sx={{ fontWeight: 600, bgcolor: getStatusColor(selectedRow.qc_status).bg, color: getStatusColor(selectedRow.qc_status).color }} />
          </Stack>
        </Stack>

        {/* Title */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{selectedRow.kit_name}</Typography>
        <Typography sx={{ color: '#64748b', mb: 3 }}>{selectedRow.hospital} • {selectedRow.procedure_type}</Typography>

        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Items Used', value: selectedRow.items_used, color: '#0a6ed1', icon: <Assignment /> },
            { label: 'Surgeon', value: selectedRow.surgeon, color: '#8b5cf6', icon: <LocalHospital /> },
            { label: 'Duration', value: selectedRow.procedure_duration, color: '#f59e0b', icon: <Schedule /> },
            { label: 'Kit Health', value: `${selectedRow.kit_health_score}%`, color: healthColor, icon: <Verified /> },
          ].map((metric, idx) => (
            <Grid item xs={6} sm={3} key={idx}>
              <Card sx={{ background: `linear-gradient(135deg, ${alpha(metric.color, 0.1)} 0%, ${alpha(metric.color, 0.05)} 100%)` }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <Box sx={{ color: metric.color }}>{metric.icon}</Box>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>{metric.label}</Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: metric.color, fontSize: '1rem' }}>{metric.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 3 Cards Layout */}
        <Grid container spacing={2}>
          {/* Card 1: Items Consumed */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Items Consumed ({selectedRow.items_used})
                </Typography>
                <Stack spacing={1} sx={{ maxHeight: 280, overflow: 'auto' }}>
                  {selectedRow.itemsConsumed?.map((item, idx) => (
                    <Box key={idx} sx={{ p: 1.5, bgcolor: alpha('#64748b', 0.04), borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.item_code}</Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>{item.description}</Typography>
                        </Box>
                        <Chip label={`Qty: ${item.quantity_used}`} size="small" sx={{ fontWeight: 600, bgcolor: alpha('#0a6ed1', 0.1), color: '#0a6ed1' }} />
                      </Box>
                      <Typography sx={{ fontSize: '0.65rem', color: '#64748b', mt: 0.5 }}>Lot: {item.lot_number}</Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 2: QC & Lifecycle */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  QC Checklist
                </Typography>
                <Stack spacing={1} sx={{ mb: 2 }}>
                  {selectedRow.qcChecklist?.map((item, idx) => {
                    const statusColors = {
                      'Pass': '#10b981',
                      'Fail': '#ef4444',
                      'Pending': '#f59e0b',
                      'Discrepancy': '#f59e0b',
                      'Incomplete': '#f59e0b',
                      'Minor Issue': '#f59e0b',
                    };
                    const color = statusColors[item.status] || '#64748b';
                    return (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: alpha('#64748b', 0.04), borderRadius: 1 }}>
                        <Typography sx={{ fontSize: '0.8rem' }}>{item.item}</Typography>
                        <Chip
                          icon={item.status === 'Pass' ? <CheckCircle sx={{ fontSize: 14 }} /> : <Warning sx={{ fontSize: 14 }} />}
                          label={item.status}
                          size="small"
                          sx={{ fontWeight: 600, bgcolor: alpha(color, 0.12), color }}
                        />
                      </Box>
                    );
                  })}
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Kit Health Gauge */}
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2, textAlign: 'center' }}>
                  Kit Health Score
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress variant="determinate" value={100} size={80} thickness={5} sx={{ color: alpha('#64748b', 0.1) }} />
                    <CircularProgress variant="determinate" value={selectedRow.kit_health_score} size={80} thickness={5} sx={{ color: healthColor, position: 'absolute', left: 0 }} />
                    <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: healthColor }}>{selectedRow.kit_health_score}</Typography>
                      <Typography sx={{ fontSize: '0.5rem', color: '#64748b' }}>HEALTH</Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 3: History & Trends */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Usage History
                </Typography>

                {/* Bar Chart - Usage over time */}
                <Box sx={{ height: 120, mb: 2 }}>
                  <Bar
                    data={{
                      labels: selectedRow.usageHistory?.map(h => h.month) || ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                      datasets: [{
                        data: selectedRow.usageHistory?.map(h => h.procedures) || [8, 12, 10, 15, 11, 14],
                        backgroundColor: alpha('#0a6ed1', 0.6),
                        borderColor: '#0a6ed1',
                        borderWidth: 1,
                        borderRadius: 4,
                      }],
                    }}
                    options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Procedures/Month', font: { size: 10 } } } }}
                  />
                </Box>

                {/* Line Chart - Utilization trend */}
                <Box sx={{ height: 120 }}>
                  <Line
                    data={{
                      labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
                      datasets: [{
                        data: selectedRow.utilizationTrend || Array.from({ length: 12 }, () => Math.floor(Math.random() * 30) + 65),
                        borderColor: '#10b981',
                        backgroundColor: alpha('#10b981', 0.1),
                        fill: true,
                        tension: 0.4,
                      }],
                    }}
                    options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { display: true, text: 'Utilization %', font: { size: 10 } } } }}
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
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>TRAXX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>Loaner Process</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              {selectedRow ? `Kit ${selectedRow.kit_id}` : 'Operations'}
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
              <OperationsIcon sx={{ fontSize: 32, color: '#0a6ed1' }} />
              <Typography variant="h4" fontWeight={700}>Operations</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Hospital usage reporting, quality checks, and kit restocking management
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
                { label: 'Kits in Use', value: metrics.kitsInUse, color: '#0a6ed1', icon: <OperationsIcon /> },
                { label: 'Pending Returns', value: metrics.pendingReturns, color: '#f59e0b', icon: <Schedule /> },
                { label: 'In QC', value: metrics.inQC, color: '#8b5cf6', icon: <Verified /> },
                { label: 'Ready for Restock', value: metrics.readyForRestock, color: '#10b981', icon: <Inventory /> },
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
                '& .MuiDataGrid-row:hover': { bgcolor: alpha('#0a6ed1', 0.04) },
              }}
            />
          </Paper>
        </>
      )}
    </Box>
  );
};

export default LoanerOperations;
