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
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Assignment as AssignmentIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  CheckCircle,
  Schedule,
  LocalShipping,
  Pending,
  TrendingUp,
  SwapHoriz,
} from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import {
  generateKitOrderData,
  generateOrderDetail,
  calculateKitOrderMetrics,
} from '../shared/traxxMockData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true },
  },
};

const ConsignmentKitOrders = ({ onBack }) => {
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
      const orderData = generateKitOrderData('consignment', 25);
      setData(orderData);
      setMetrics(calculateKitOrderMetrics(orderData));
      setLoading(false);
    }, 600);
  };

  const handleRowClick = (params) => {
    const detailData = generateOrderDetail(params.row);
    setSelectedRow(detailData);
  };

  const handleBackToList = () => setSelectedRow(null);

  const getStatusColor = (status) => {
    const colors = {
      'Requested': { bg: '#fef3c7', color: '#d97706', border: '#fcd34d' },
      'Approved': { bg: '#dbeafe', color: '#2563eb', border: '#93c5fd' },
      'Processing': { bg: '#e0e7ff', color: '#4f46e5', border: '#a5b4fc' },
      'Ready': { bg: '#d1fae5', color: '#059669', border: '#6ee7b7' },
      'Shipped': { bg: '#cffafe', color: '#0891b2', border: '#67e8f9' },
      'Completed': { bg: '#dcfce7', color: '#16a34a', border: '#86efac' },
    };
    return colors[status] || { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' };
  };

  const columns = [
    {
      field: 'order_id',
      headerName: 'Order ID',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} size="small" sx={{ fontWeight: 700, bgcolor: alpha('#64748b', 0.1), color: '#64748b' }} />
      ),
    },
    { field: 'kit_id', headerName: 'Kit ID', width: 110 },
    { field: 'kit_name', headerName: 'Kit Name', width: 160, flex: 1 },
    { field: 'distributor', headerName: 'Distributor', width: 150 },
    { field: 'hospital', headerName: 'Hospital', width: 180 },
    { field: 'request_date', headerName: 'Request Date', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const style = getStatusColor(params.value);
        return <Chip label={params.value} size="small" sx={{ fontWeight: 600, bgcolor: style.bg, color: style.color, border: `1px solid ${style.border}` }} />;
      },
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      renderCell: (params) => {
        const colors = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
        return <Chip label={params.value} size="small" sx={{ fontWeight: 600, bgcolor: alpha(colors[params.value], 0.1), color: colors[params.value] }} />;
      },
    },
  ];

  const renderDetailView = () => {
    if (!selectedRow) return null;

    const statusColor = getStatusColor(selectedRow.status);
    const setupProgress = selectedRow.status === 'Completed' ? 100 : selectedRow.status === 'Ready' ? 80 : selectedRow.status === 'Processing' ? 60 : selectedRow.status === 'Approved' ? 40 : 20;

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList} variant="outlined" size="small">
            Back to List
          </Button>
          <Stack direction="row" spacing={1}>
            <Chip label={selectedRow.order_id} size="small" sx={{ fontWeight: 700, bgcolor: alpha('#64748b', 0.1), color: '#64748b' }} />
            <Chip icon={<SwapHoriz sx={{ fontSize: 14 }} />} label="Consignment" size="small" sx={{ fontWeight: 600, bgcolor: alpha('#8b5cf6', 0.1), color: '#8b5cf6' }} />
            <Chip label={selectedRow.status} size="small" sx={{ fontWeight: 600, bgcolor: statusColor.bg, color: statusColor.color }} />
          </Stack>
        </Stack>

        {/* Title */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{selectedRow.kit_name}</Typography>
        <Typography sx={{ color: '#64748b', mb: 3 }}>{selectedRow.distributor} → {selectedRow.hospital}</Typography>

        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Consigned Value', value: `$${selectedRow.total_value?.toLocaleString()}`, color: '#10b981', icon: <TrendingUp /> },
            { label: 'Items', value: selectedRow.items?.length || 0, color: '#64748b', icon: <AssignmentIcon /> },
            { label: 'Setup Progress', value: `${setupProgress}%`, color: '#8b5cf6', icon: <Schedule /> },
            { label: 'Priority', value: selectedRow.priority, color: selectedRow.priority === 'High' ? '#ef4444' : '#64748b', icon: <Pending /> },
          ].map((metric, idx) => (
            <Grid item xs={6} sm={3} key={idx}>
              <Card sx={{ background: `linear-gradient(135deg, ${alpha(metric.color, 0.1)} 0%, ${alpha(metric.color, 0.05)} 100%)` }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <Box sx={{ color: metric.color }}>{metric.icon}</Box>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>{metric.label}</Typography>
                  </Stack>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: metric.color }}>{metric.value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 3 Cards Layout */}
        <Grid container spacing={2}>
          {/* Card 1: Kit Contents */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Consignment Items
                </Typography>
                <Stack spacing={1} sx={{ maxHeight: 250, overflow: 'auto' }}>
                  {selectedRow.items?.map((item, idx) => (
                    <Box key={idx} sx={{ p: 1.5, bgcolor: alpha('#64748b', 0.04), borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.item_code}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>{item.description}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Qty: {item.quantity}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#10b981' }}>${item.unit_price}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 600 }}>Total Consigned Value</Typography>
                  <Typography sx={{ fontWeight: 700, color: '#10b981' }}>${selectedRow.total_value?.toLocaleString()}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 2: Consignment Details */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Consignment Setup
                </Typography>
                <Stack spacing={0}>
                  {selectedRow.timeline?.map((step, idx) => (
                    <Box key={idx} sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: step.status === 'completed' ? '#10b981' : alpha('#64748b', 0.2),
                            color: step.status === 'completed' ? 'white' : '#64748b',
                          }}
                        >
                          {step.status === 'completed' ? <CheckCircle sx={{ fontSize: 16 }} /> : <Schedule sx={{ fontSize: 16 }} />}
                        </Avatar>
                        {idx < selectedRow.timeline.length - 1 && (
                          <Box sx={{ width: 2, height: 30, bgcolor: step.status === 'completed' ? '#10b981' : alpha('#64748b', 0.2), my: 0.5 }} />
                        )}
                      </Box>
                      <Box sx={{ pb: 2 }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{step.step}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>{step.date} • {step.user}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#8b5cf6', mb: 1 }}>Distributor Warehouse</Typography>
                <Typography sx={{ fontSize: '0.85rem' }}>{selectedRow.distributor}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 3: Metrics & Chart */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Setup Progress
                </Typography>

                {/* Circular Gauge */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress variant="determinate" value={100} size={80} thickness={5} sx={{ color: alpha('#64748b', 0.1) }} />
                    <CircularProgress variant="determinate" value={setupProgress} size={80} thickness={5} sx={{ color: '#8b5cf6', position: 'absolute', left: 0 }} />
                    <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#8b5cf6' }}>{setupProgress}%</Typography>
                      <Typography sx={{ fontSize: '0.5rem', color: '#64748b' }}>SETUP</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Bar Chart */}
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', mb: 1 }}>Similar Consignments (6 months)</Typography>
                <Box sx={{ height: 120 }}>
                  <Bar
                    data={{
                      labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                      datasets: [{
                        data: selectedRow.orderTrend || [12, 18, 15, 22, 17, 24],
                        backgroundColor: alpha('#8b5cf6', 0.6),
                        borderColor: '#8b5cf6',
                        borderWidth: 1,
                        borderRadius: 4,
                      }],
                    }}
                    options={chartOptions}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b', mb: 0.5 }}>Contact</Typography>
                <Typography sx={{ fontSize: '0.8rem' }}>{selectedRow.contact_email}</Typography>
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
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>Consignment Process</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              {selectedRow ? `Order ${selectedRow.order_id}` : 'Kit Orders'}
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
              <AssignmentIcon sx={{ fontSize: 32, color: '#64748b' }} />
              <Typography variant="h4" fontWeight={700}>Kit Orders</Typography>
              <Chip icon={<SwapHoriz sx={{ fontSize: 14 }} />} label="Consignment" size="small" sx={{ fontWeight: 600, bgcolor: alpha('#8b5cf6', 0.1), color: '#8b5cf6' }} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Manage kit requests and transfer to distributor warehouse for consignment
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
                { label: 'Active Consignments', value: metrics.totalOrders, color: '#64748b', icon: <AssignmentIcon /> },
                { label: 'New Requests', value: metrics.pendingApprovals, color: '#f59e0b', icon: <Pending /> },
                { label: 'In Setup', value: metrics.inProcess, color: '#8b5cf6', icon: <Schedule /> },
                { label: 'Avg Setup Time', value: `${metrics.avgProcessingDays} days`, color: '#10b981', icon: <LocalShipping /> },
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
              }}
            />
          </Paper>
        </>
      )}
    </Box>
  );
};

export default ConsignmentKitOrders;
