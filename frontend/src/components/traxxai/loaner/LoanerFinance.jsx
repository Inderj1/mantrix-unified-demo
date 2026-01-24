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
  AccountBalance as FinanceIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  CheckCircle,
  Schedule,
  Receipt,
  Payment,
  TrendingUp,
  MonetizationOn,
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
  generateFinanceData,
  generateFinanceDetail,
  calculateFinanceMetrics,
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

const LoanerFinance = ({ onBack }) => {
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
      const financeData = generateFinanceData('loaner', 30);
      setData(financeData);
      setMetrics(calculateFinanceMetrics(financeData));
      setLoading(false);
    }, 600);
  };

  const handleRowClick = (params) => {
    const detailData = generateFinanceDetail(params.row);
    setSelectedRow(detailData);
  };

  const handleBackToList = () => setSelectedRow(null);

  const getStatusColor = (status) => {
    const colors = {
      'Draft': { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' },
      'Sent': { bg: '#dbeafe', color: '#2563eb', border: '#93c5fd' },
      'Pending Payment': { bg: '#fef3c7', color: '#d97706', border: '#fcd34d' },
      'Partially Paid': { bg: '#e0e7ff', color: '#4f46e5', border: '#a5b4fc' },
      'Paid': { bg: '#dcfce7', color: '#16a34a', border: '#86efac' },
      'Overdue': { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' },
    };
    return colors[status] || { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' };
  };

  const columns = [
    {
      field: 'invoice_id',
      headerName: 'Invoice ID',
      width: 130,
      renderCell: (params) => (
        <Chip label={params.value} size="small" sx={{ fontWeight: 700, bgcolor: alpha('#00357a', 0.1), color: '#00357a' }} />
      ),
    },
    { field: 'kit_id', headerName: 'Kit ID', width: 110 },
    { field: 'hospital', headerName: 'Hospital', width: 180 },
    { field: 'distributor', headerName: 'Distributor', width: 150 },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: '#10b981' }}>${params.value?.toLocaleString()}</Typography>
      ),
    },
    { field: 'invoice_date', headerName: 'Invoice Date', width: 120 },
    { field: 'due_date', headerName: 'Due Date', width: 110 },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => {
        const style = getStatusColor(params.value);
        return <Chip label={params.value} size="small" sx={{ fontWeight: 600, bgcolor: style.bg, color: style.color, border: `1px solid ${style.border}` }} />;
      },
    },
    {
      field: 'commission_rate',
      headerName: 'Commission',
      width: 110,
      renderCell: (params) => (
        <Chip label={`${params.value}%`} size="small" sx={{ fontWeight: 600, bgcolor: alpha('#8b5cf6', 0.1), color: '#8b5cf6' }} />
      ),
    },
  ];

  const renderDetailView = () => {
    if (!selectedRow) return null;

    const statusColor = getStatusColor(selectedRow.status);
    const dsoColor = selectedRow.dso <= 30 ? '#10b981' : selectedRow.dso <= 45 ? '#f59e0b' : '#ef4444';

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList} variant="outlined" size="small">
            Back to List
          </Button>
          <Stack direction="row" spacing={1}>
            <Chip label={selectedRow.invoice_id} size="small" sx={{ fontWeight: 700, bgcolor: alpha('#00357a', 0.1), color: '#00357a' }} />
            <Chip label={selectedRow.status} size="small" sx={{ fontWeight: 600, bgcolor: statusColor.bg, color: statusColor.color }} />
          </Stack>
        </Stack>

        {/* Title */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{selectedRow.kit_name}</Typography>
        <Typography sx={{ color: '#64748b', mb: 3 }}>{selectedRow.hospital} • {selectedRow.distributor}</Typography>

        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Invoice Amount', value: `$${selectedRow.amount?.toLocaleString()}`, color: '#10b981', icon: <Receipt /> },
            { label: 'Commission', value: `$${selectedRow.commission_amount?.toLocaleString()}`, color: '#8b5cf6', icon: <MonetizationOn /> },
            { label: 'DSO', value: `${selectedRow.dso} days`, color: dsoColor, icon: <Schedule /> },
            { label: 'Status', value: selectedRow.revenue_recognized ? 'Recognized' : 'Pending', color: selectedRow.revenue_recognized ? '#10b981' : '#f59e0b', icon: <CheckCircle /> },
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
          {/* Card 1: Invoice Line Items */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Invoice Details
                </Typography>
                <Stack spacing={1} sx={{ maxHeight: 220, overflow: 'auto' }}>
                  {selectedRow.lineItems?.map((item, idx) => (
                    <Box key={idx} sx={{ p: 1.5, bgcolor: alpha('#64748b', 0.04), borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.item_code}</Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>{item.description}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>${item.total?.toLocaleString()}</Typography>
                          <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>{item.quantity} x ${item.unit_price}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Stack>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={0.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>Subtotal</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>${selectedRow.subtotal?.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>Tax</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>${selectedRow.tax?.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid', borderColor: alpha('#64748b', 0.1) }}>
                    <Typography sx={{ fontWeight: 700 }}>Total</Typography>
                    <Typography sx={{ fontWeight: 700, color: '#10b981' }}>${selectedRow.amount?.toLocaleString()}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 2: Payment & Commission */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Payment History
                </Typography>
                {selectedRow.paymentHistory?.length > 0 ? (
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {selectedRow.paymentHistory.map((payment, idx) => (
                      <Box key={idx} sx={{ p: 1.5, bgcolor: alpha('#10b981', 0.05), borderRadius: 1, border: '1px solid', borderColor: alpha('#10b981', 0.2) }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>${payment.amount?.toLocaleString()}</Typography>
                          <Chip label={payment.method} size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: alpha('#10b981', 0.1), color: '#10b981' }} />
                        </Box>
                        <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>{payment.date} • {payment.reference}</Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ p: 2, bgcolor: alpha('#f59e0b', 0.05), borderRadius: 1, textAlign: 'center', mb: 2 }}>
                    <Typography sx={{ color: '#d97706', fontWeight: 600, fontSize: '0.85rem' }}>No payments received</Typography>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Commission Breakdown
                </Typography>
                <Stack spacing={1}>
                  {[
                    { label: 'Commission Rate', value: `${selectedRow.commission_rate}%` },
                    { label: 'Commission Amount', value: `$${selectedRow.commission_amount?.toLocaleString()}` },
                    { label: 'Revenue Status', value: selectedRow.revenue_recognized ? 'Recognized' : 'Pending' },
                  ].map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', p: 1, bgcolor: alpha('#8b5cf6', 0.04), borderRadius: 1 }}>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>{item.label}</Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#8b5cf6' }}>{item.value}</Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 3: Analytics */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Revenue Analytics
                </Typography>

                {/* DSO Gauge */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress variant="determinate" value={100} size={80} thickness={5} sx={{ color: alpha('#64748b', 0.1) }} />
                    <CircularProgress variant="determinate" value={Math.min(100, (selectedRow.dso / 60) * 100)} size={80} thickness={5} sx={{ color: dsoColor, position: 'absolute', left: 0 }} />
                    <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: dsoColor }}>{selectedRow.dso}</Typography>
                      <Typography sx={{ fontSize: '0.5rem', color: '#64748b' }}>DSO</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Monthly Revenue Chart */}
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', mb: 1 }}>Monthly Revenue</Typography>
                <Box sx={{ height: 120 }}>
                  <Bar
                    data={{
                      labels: selectedRow.monthlyRevenue?.map(m => m.month) || ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                      datasets: [{
                        data: selectedRow.monthlyRevenue?.map(m => m.revenue / 1000) || [85, 110, 95, 120, 105, 130],
                        backgroundColor: alpha('#10b981', 0.6),
                        borderColor: '#10b981',
                        borderWidth: 1,
                        borderRadius: 4,
                      }],
                    }}
                    options={{ ...chartOptions, scales: { ...chartOptions.scales, y: { ...chartOptions.scales.y, ticks: { callback: (v) => `$${v}K` } } } }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b', mb: 0.5 }}>Billing Address</Typography>
                <Typography sx={{ fontSize: '0.8rem' }}>{selectedRow.billing_address}</Typography>
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
              {selectedRow ? `Invoice ${selectedRow.invoice_id}` : 'Finance'}
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
              <FinanceIcon sx={{ fontSize: 32, color: '#64748b' }} />
              <Typography variant="h4" fontWeight={700}>Finance</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Invoicing, revenue recognition, commissions, and payment tracking
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
                { label: 'Total Revenue', value: `$${(metrics.totalRevenue / 1000).toFixed(0)}K`, color: '#10b981', icon: <TrendingUp /> },
                { label: 'Outstanding', value: `$${(metrics.outstanding / 1000).toFixed(0)}K`, color: '#f59e0b', icon: <Receipt /> },
                { label: 'Commissions Due', value: `$${(metrics.commissionsDue / 1000).toFixed(0)}K`, color: '#8b5cf6', icon: <MonetizationOn /> },
                { label: 'Avg DSO', value: `${metrics.avgDSO} days`, color: '#00357a', icon: <Schedule /> },
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

export default LoanerFinance;
