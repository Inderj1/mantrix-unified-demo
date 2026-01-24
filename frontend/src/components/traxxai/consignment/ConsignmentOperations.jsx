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
  Inventory as InventoryIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  CheckCircle,
  Schedule,
  Warning,
  LocalShipping,
  SwapHoriz,
  Autorenew,
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

const ConsignmentOperations = ({ onBack }) => {
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
      const opsData = generateOperationsData('consignment', 25);
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
      'Pending': { bg: '#fef3c7', color: '#d97706' },
      'In Progress': { bg: '#e0e7ff', color: '#4f46e5' },
      'Completed': { bg: '#dcfce7', color: '#16a34a' },
      'Low': { bg: '#fee2e2', color: '#dc2626' },
      'Normal': { bg: '#dcfce7', color: '#16a34a' },
    };
    return colors[status] || { bg: '#f1f5f9', color: '#64748b' };
  };

  const getStockLevelColor = (level) => {
    if (level <= 10) return '#ef4444';
    if (level <= 25) return '#f59e0b';
    return '#10b981';
  };

  const columns = [
    {
      field: 'kit_id',
      headerName: 'Kit ID',
      width: 110,
      renderCell: (params) => (
        <Chip label={params.value} size="small" sx={{ fontWeight: 700, bgcolor: alpha('#64748b', 0.1), color: '#64748b' }} />
      ),
    },
    { field: 'kit_name', headerName: 'Kit Name', width: 150 },
    { field: 'distributor', headerName: 'Distributor', width: 150 },
    { field: 'hospital', headerName: 'Hospital', width: 160 },
    { field: 'procedure_date', headerName: 'Last Usage', width: 110 },
    {
      field: 'stock_level',
      headerName: 'Stock Level',
      width: 120,
      renderCell: (params) => {
        const color = getStockLevelColor(params.value);
        return (
          <Box sx={{ width: '100%' }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color }}>{params.value} units</Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (params.value / 50) * 100)}
              sx={{ height: 4, borderRadius: 2, bgcolor: alpha(color, 0.2), '& .MuiLinearProgress-bar': { bgcolor: color } }}
            />
          </Box>
        );
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
    {
      field: 'pending_replacements',
      headerName: 'Pending Repl.',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value > 0 ? alpha('#f59e0b', 0.1) : alpha('#10b981', 0.1),
            color: params.value > 0 ? '#f59e0b' : '#10b981',
          }}
        />
      ),
    },
  ];

  const renderDetailView = () => {
    if (!selectedRow) return null;

    const stockHealthColor = selectedRow.stock_level >= 30 ? '#10b981' : selectedRow.stock_level >= 15 ? '#f59e0b' : '#ef4444';
    const stockHealthPercent = Math.min(100, (selectedRow.stock_level / 50) * 100);

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Header Chips */}
        <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1}>
            <Chip label={selectedRow.kit_id} size="small" sx={{ fontWeight: 700, bgcolor: alpha('#64748b', 0.1), color: '#64748b' }} />
            <Chip icon={<SwapHoriz sx={{ fontSize: 14 }} />} label="Consignment" size="small" sx={{ fontWeight: 600, bgcolor: alpha('#8b5cf6', 0.1), color: '#8b5cf6' }} />
          </Stack>
        </Stack>

        {/* Title */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{selectedRow.kit_name}</Typography>
        <Typography sx={{ color: '#64748b', mb: 3 }}>{selectedRow.distributor} • {selectedRow.hospital}</Typography>

        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Stock Level', value: `${selectedRow.stock_level} units`, color: stockHealthColor, icon: <InventoryIcon /> },
            { label: 'Pending Replacements', value: selectedRow.pending_replacements || 0, color: '#f59e0b', icon: <Autorenew /> },
            { label: 'Last Usage', value: selectedRow.procedure_date, color: '#64748b', icon: <Schedule /> },
            { label: 'Restock Status', value: selectedRow.restock_status, color: getStatusColor(selectedRow.restock_status).color, icon: <LocalShipping /> },
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
          {/* Card 1: Inventory Status */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Inventory Status
                </Typography>
                <Stack spacing={1} sx={{ maxHeight: 180, overflow: 'auto', mb: 2 }}>
                  {selectedRow.itemsConsumed?.slice(0, 5).map((item, idx) => (
                    <Box key={idx} sx={{ p: 1.5, bgcolor: alpha('#64748b', 0.04), borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.item_code}</Typography>
                        <Chip label={`${Math.floor(Math.random() * 20) + 5} units`} size="small" sx={{ fontWeight: 600, bgcolor: alpha('#10b981', 0.1), color: '#10b981' }} />
                      </Box>
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>{item.description}</Typography>
                    </Box>
                  ))}
                </Stack>

                {selectedRow.stock_level <= 15 && (
                  <Box sx={{ p: 1.5, bgcolor: alpha('#ef4444', 0.08), borderRadius: 1, border: '1px solid', borderColor: alpha('#ef4444', 0.2) }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Warning sx={{ color: '#ef4444', fontSize: 18 }} />
                      <Typography sx={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>Low Stock Alert</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', mt: 0.5 }}>Stock below threshold. Reorder recommended.</Typography>
                  </Box>
                )}

                {selectedRow.pending_replacements > 0 && (
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: alpha('#f59e0b', 0.08), borderRadius: 1 }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#d97706' }}>Pending Replacements: {selectedRow.pending_replacements}</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>Shipment in transit from DC</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Card 2: Usage & Restock */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Usage History
                </Typography>
                <Stack spacing={0} sx={{ maxHeight: 180, overflow: 'auto' }}>
                  {selectedRow.usageHistory?.map((usage, idx) => (
                    <Box key={idx} sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: '#10b981', color: 'white', fontSize: '0.6rem' }}>
                          {usage.procedures}
                        </Avatar>
                        {idx < selectedRow.usageHistory.length - 1 && (
                          <Box sx={{ width: 2, height: 20, bgcolor: alpha('#10b981', 0.3), my: 0.3 }} />
                        )}
                      </Box>
                      <Box sx={{ pb: 1.5 }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{usage.month}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>{usage.items_used} items used</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#8b5cf6', textTransform: 'uppercase', mb: 1 }}>Restock Audit</Typography>
                <Stack spacing={0.5}>
                  {['Last Restock: 2025-01-05', 'Next Scheduled: 2025-01-20', 'Auto-Reorder: Enabled'].map((item, idx) => (
                    <Typography key={idx} sx={{ fontSize: '0.75rem', color: '#64748b' }}>{item}</Typography>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 3: Trends */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Trends
                </Typography>

                {/* Stock Health Gauge */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress variant="determinate" value={100} size={70} thickness={5} sx={{ color: alpha('#64748b', 0.1) }} />
                    <CircularProgress variant="determinate" value={stockHealthPercent} size={70} thickness={5} sx={{ color: stockHealthColor, position: 'absolute', left: 0 }} />
                    <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ fontWeight: 700, color: stockHealthColor, fontSize: '0.9rem' }}>{selectedRow.stock_level}</Typography>
                      <Typography sx={{ fontSize: '0.45rem', color: '#64748b' }}>STOCK</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Usage Line Chart */}
                <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textAlign: 'center', mb: 1 }}>Usage Trend (12 months)</Typography>
                <Box sx={{ height: 90, mb: 2 }}>
                  <Line
                    data={{
                      labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
                      datasets: [{
                        data: selectedRow.utilizationTrend || Array.from({ length: 12 }, () => Math.floor(Math.random() * 30) + 60),
                        borderColor: '#10b981',
                        backgroundColor: alpha('#10b981', 0.1),
                        fill: true,
                        tension: 0.4,
                      }],
                    }}
                    options={chartOptions}
                  />
                </Box>

                {/* Replacement Bar Chart */}
                <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textAlign: 'center', mb: 1 }}>Replacements/Month</Typography>
                <Box sx={{ height: 90 }}>
                  <Bar
                    data={{
                      labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                      datasets: [{
                        data: [3, 5, 2, 6, 4, 3],
                        backgroundColor: alpha('#f59e0b', 0.6),
                        borderColor: '#f59e0b',
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
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>TRAXX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>Consignment Process</Link>
            {selectedRow ? (
              <>
                <Link component="button" variant="body1" onClick={handleBackToList} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>
                  Operations
                </Link>
                <Typography color="primary" variant="body1" fontWeight={600}>
                  Kit {selectedRow.kit_id}
                </Typography>
              </>
            ) : (
              <Typography color="primary" variant="body1" fontWeight={600}>
                Operations
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
              <InventoryIcon sx={{ fontSize: 32, color: '#64748b' }} />
              <Typography variant="h4" fontWeight={700}>Operations</Typography>
              <Chip icon={<SwapHoriz sx={{ fontSize: 14 }} />} label="Consignment" size="small" sx={{ fontWeight: 600, bgcolor: alpha('#8b5cf6', 0.1), color: '#8b5cf6' }} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Usage tracking, distributor restocking, and replacement management
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
                { label: 'Kits Deployed', value: data.length, color: '#64748b', icon: <InventoryIcon /> },
                { label: 'Low Stock Alerts', value: data.filter(d => d.stock_level <= 15).length, color: '#ef4444', icon: <Warning /> },
                { label: 'Replacements Pending', value: data.reduce((sum, d) => sum + (d.pending_replacements || 0), 0), color: '#f59e0b', icon: <Autorenew /> },
                { label: 'Avg Stock Level', value: `${Math.round(data.reduce((sum, d) => sum + (d.stock_level || 0), 0) / data.length)} units`, color: '#10b981', icon: <CheckCircle /> },
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

export default ConsignmentOperations;
