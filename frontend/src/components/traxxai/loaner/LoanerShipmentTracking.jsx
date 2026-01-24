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
  LocalShipping as ShippingIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  CheckCircle,
  Schedule,
  FlightTakeoff,
  FlightLand,
  LocalShipping,
  Place,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import {
  generateShipmentData,
  generateShipmentDetail,
  calculateShipmentMetrics,
} from '../shared/traxxMockData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true },
  },
};

const LoanerShipmentTracking = ({ onBack }) => {
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
      const shipmentData = generateShipmentData('loaner', 20);
      setData(shipmentData);
      setMetrics(calculateShipmentMetrics(shipmentData));
      setLoading(false);
    }, 600);
  };

  const handleRowClick = (params) => {
    const detailData = generateShipmentDetail(params.row);
    setSelectedRow(detailData);
  };

  const handleBackToList = () => setSelectedRow(null);

  const getStatusColor = (status) => {
    const colors = {
      'Pending Pickup': { bg: '#fef3c7', color: '#d97706', border: '#fcd34d' },
      'In Transit': { bg: '#dbeafe', color: '#2563eb', border: '#93c5fd' },
      'Out for Delivery': { bg: '#e0e7ff', color: '#4f46e5', border: '#a5b4fc' },
      'Delivered': { bg: '#dcfce7', color: '#16a34a', border: '#86efac' },
      'Returned': { bg: '#f3e8ff', color: '#9333ea', border: '#d8b4fe' },
    };
    return colors[status] || { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' };
  };

  const getDirectionColor = (direction) => {
    return direction === 'Outbound'
      ? { bg: '#dbeafe', color: '#2563eb' }
      : { bg: '#fce7f3', color: '#db2777' };
  };

  const columns = [
    {
      field: 'shipment_id',
      headerName: 'Shipment ID',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} size="small" sx={{ fontWeight: 700, bgcolor: alpha('#00357a', 0.1), color: '#00357a' }} />
      ),
    },
    { field: 'kit_id', headerName: 'Kit ID', width: 110 },
    { field: 'kit_name', headerName: 'Kit Name', width: 150 },
    {
      field: 'direction',
      headerName: 'Direction',
      width: 110,
      renderCell: (params) => {
        const style = getDirectionColor(params.value);
        return (
          <Chip
            icon={params.value === 'Outbound' ? <FlightTakeoff sx={{ fontSize: 14 }} /> : <FlightLand sx={{ fontSize: 14 }} />}
            label={params.value}
            size="small"
            sx={{ fontWeight: 600, bgcolor: style.bg, color: style.color }}
          />
        );
      },
    },
    { field: 'carrier', headerName: 'Carrier', width: 100 },
    { field: 'tracking_number', headerName: 'Tracking #', width: 130 },
    { field: 'origin', headerName: 'Origin', width: 120 },
    { field: 'destination', headerName: 'Destination', width: 160 },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => {
        const style = getStatusColor(params.value);
        return <Chip label={params.value} size="small" sx={{ fontWeight: 600, bgcolor: style.bg, color: style.color, border: `1px solid ${style.border}` }} />;
      },
    },
    { field: 'eta', headerName: 'ETA', width: 110 },
  ];

  const renderDetailView = () => {
    if (!selectedRow) return null;

    const statusColor = getStatusColor(selectedRow.status);
    const onTimeColor = selectedRow.onTimeRate >= 95 ? '#10b981' : selectedRow.onTimeRate >= 85 ? '#f59e0b' : '#ef4444';

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Header Chips */}
        <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1}>
            <Chip label={selectedRow.shipment_id} size="small" sx={{ fontWeight: 700, bgcolor: alpha('#00357a', 0.1), color: '#00357a' }} />
            <Chip label={selectedRow.direction} size="small" sx={{ fontWeight: 600, bgcolor: getDirectionColor(selectedRow.direction).bg, color: getDirectionColor(selectedRow.direction).color }} />
            <Chip label={selectedRow.status} size="small" sx={{ fontWeight: 600, bgcolor: statusColor.bg, color: statusColor.color }} />
          </Stack>
        </Stack>

        {/* Title */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{selectedRow.kit_name}</Typography>
        <Typography sx={{ color: '#64748b', mb: 3 }}>{selectedRow.origin} → {selectedRow.destination}</Typography>

        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Carrier', value: selectedRow.carrier, color: '#00357a', icon: <LocalShipping /> },
            { label: 'Tracking #', value: selectedRow.tracking_number, color: '#64748b', icon: <ShippingIcon /> },
            { label: 'ETA', value: selectedRow.eta, color: '#f59e0b', icon: <Schedule /> },
            { label: 'On-Time Rate', value: `${selectedRow.onTimeRate}%`, color: onTimeColor, icon: <CheckCircle /> },
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
          {/* Card 1: Tracking Timeline */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Tracking Timeline
                </Typography>
                <Stack spacing={0}>
                  {selectedRow.trackingEvents?.map((event, idx) => (
                    <Box key={idx} sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: idx === selectedRow.trackingEvents.length - 1 ? '#00357a' : '#10b981',
                            color: 'white',
                          }}
                        >
                          <Place sx={{ fontSize: 14 }} />
                        </Avatar>
                        {idx < selectedRow.trackingEvents.length - 1 && (
                          <Box sx={{ width: 2, height: 30, bgcolor: '#10b981', my: 0.5 }} />
                        )}
                      </Box>
                      <Box sx={{ pb: 2 }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{event.event}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>{event.timestamp}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#00357a' }}>{event.location}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 2: Shipment Details */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Shipment Details
                </Typography>
                <Stack spacing={2}>
                  {[
                    { label: 'Package Weight', value: selectedRow.package_weight },
                    { label: 'Dimensions', value: selectedRow.package_dimensions },
                    { label: 'Insurance Value', value: `$${selectedRow.insurance_value?.toLocaleString()}` },
                    { label: 'Signature Required', value: selectedRow.signature_required ? 'Yes' : 'No' },
                  ].map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: alpha('#64748b', 0.04), borderRadius: 1 }}>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>{item.label}</Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.value}</Typography>
                    </Box>
                  ))}
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b', mb: 1 }}>Special Instructions</Typography>
                <Typography sx={{ fontSize: '0.8rem', fontStyle: 'italic' }}>{selectedRow.special_instructions}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 3: Performance */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Performance
                </Typography>

                {/* Circular Gauge */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress variant="determinate" value={100} size={80} thickness={5} sx={{ color: alpha('#64748b', 0.1) }} />
                    <CircularProgress variant="determinate" value={selectedRow.onTimeRate} size={80} thickness={5} sx={{ color: onTimeColor, position: 'absolute', left: 0 }} />
                    <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: onTimeColor }}>{selectedRow.onTimeRate}%</Typography>
                      <Typography sx={{ fontSize: '0.5rem', color: '#64748b' }}>ON-TIME</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Line Chart */}
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', mb: 1 }}>Transit History (12 months)</Typography>
                <Box sx={{ height: 120 }}>
                  <Line
                    data={{
                      labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
                      datasets: [{
                        data: selectedRow.transitHistory || Array.from({ length: 12 }, () => Math.floor(Math.random() * 4) + 1),
                        borderColor: '#00357a',
                        backgroundColor: alpha('#00357a', 0.1),
                        fill: true,
                        tension: 0.4,
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
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>TRAXX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>Loaner Process</Link>
            {selectedRow ? (
              <>
                <Link component="button" variant="body1" onClick={handleBackToList} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>
                  Shipment Tracking
                </Link>
                <Typography color="primary" variant="body1" fontWeight={600}>
                  Shipment {selectedRow.shipment_id}
                </Typography>
              </>
            ) : (
              <Typography color="primary" variant="body1" fontWeight={600}>
                Shipment Tracking
              </Typography>
            )}
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
              <ShippingIcon sx={{ fontSize: 32, color: '#64748b' }} />
              <Typography variant="h4" fontWeight={700}>Shipment Tracking</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Track kit shipments to hospitals and returns to DC with real-time visibility
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
                { label: 'Active Shipments', value: metrics.activeShipments, color: '#00357a', icon: <ShippingIcon /> },
                { label: 'In Transit', value: metrics.inTransit, color: '#2563eb', icon: <LocalShipping /> },
                { label: 'Awaiting Pickup', value: metrics.awaitingPickup, color: '#f59e0b', icon: <Schedule /> },
                { label: 'Avg Transit', value: `${metrics.avgTransitDays} days`, color: '#10b981', icon: <CheckCircle /> },
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
                '& .MuiDataGrid-row:hover': { bgcolor: alpha('#00357a', 0.04) },
              }}
            />
          </Paper>
        </>
      )}
    </Box>
  );
};

export default LoanerShipmentTracking;
