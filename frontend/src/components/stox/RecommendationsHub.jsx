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
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Recommend as RecommendIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  FilterList as FilterListIcon,
  CheckCircle,
  Schedule,
  ThumbUp,
  ThumbDown,
  TrendingUp,
  Lightbulb,
  AutoAwesome,
} from '@mui/icons-material';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import stoxTheme from './stoxTheme';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, ChartTooltip, Legend);

const formatCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

// Generate mock recommendations data
const generateRecommendationsData = () => {
  const recommendations = [
    { id: 'REC-001', title: 'Reduce Safety Stock for MAT-001', category: 'Inventory', priority: 'High' },
    { id: 'REC-002', title: 'Increase Reorder Point for MAT-005', category: 'Inventory', priority: 'Medium' },
    { id: 'REC-003', title: 'Switch to Moving Average Costing', category: 'Cost', priority: 'Low' },
    { id: 'REC-004', title: 'Consolidate Suppliers for Bearings', category: 'Supply', priority: 'High' },
    { id: 'REC-005', title: 'Implement VMI for Electronics', category: 'Supply', priority: 'Medium' },
    { id: 'REC-006', title: 'Adjust Lot Size for MAT-008', category: 'MRP', priority: 'Medium' },
    { id: 'REC-007', title: 'Update Lead Time Parameters', category: 'MRP', priority: 'High' },
    { id: 'REC-008', title: 'Review ABC Classification', category: 'Analytics', priority: 'Low' },
    { id: 'REC-009', title: 'Optimize Service Level Targets', category: 'Service', priority: 'High' },
    { id: 'REC-010', title: 'Reduce Excess Stock in P2000', category: 'Inventory', priority: 'High' },
    { id: 'REC-011', title: 'Improve Demand Forecast Accuracy', category: 'Analytics', priority: 'Medium' },
    { id: 'REC-012', title: 'Negotiate Better Terms with VND-003', category: 'Supply', priority: 'Medium' },
  ];

  const statuses = ['Pending', 'Approved', 'Rejected', 'Implemented'];

  return recommendations.map((rec, idx) => {
    const confidence = Math.floor(70 + Math.random() * 29);
    const estimatedSavings = Math.floor(5000 + Math.random() * 95000);
    const impactScore = Math.floor(60 + Math.random() * 40);
    const status = statuses[idx % 4];

    return {
      id: rec.id,
      title: rec.title,
      category: rec.category,
      priority: rec.priority,
      status,
      confidence,
      estimatedSavings,
      impactScore,
      affectedItems: Math.floor(1 + Math.random() * 20),
      generatedDate: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reviewedBy: status !== 'Pending' ? 'Manager' : '-',
      implementationEffort: ['Low', 'Medium', 'High'][idx % 3],
      aiModel: 'STOX-AI v2.1',
      rationale: 'Based on historical demand patterns and current inventory levels.',
    };
  });
};

const RecommendationsHub = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [selectedRec, setSelectedRec] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    priority: 'all',
    status: 'all',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const recData = generateRecommendationsData();
      setData(recData);

      const totalRecs = recData.length;
      const pendingCount = recData.filter(d => d.status === 'Pending').length;
      const approvedCount = recData.filter(d => d.status === 'Approved').length;
      const implementedCount = recData.filter(d => d.status === 'Implemented').length;
      const highPriorityCount = recData.filter(d => d.priority === 'High').length;
      const totalSavings = recData.filter(d => d.status === 'Approved' || d.status === 'Implemented').reduce((sum, d) => sum + d.estimatedSavings, 0);
      const avgConfidence = recData.reduce((sum, d) => sum + d.confidence, 0) / totalRecs;

      setMetrics({
        totalRecs,
        pendingCount,
        approvedCount,
        implementedCount,
        highPriorityCount,
        totalSavings,
        avgConfidence: avgConfidence.toFixed(0),
      });
      setLoading(false);
    }, 500);
  };

  const filteredData = data.filter(row => {
    if (filters.category !== 'all' && row.category !== filters.category) return false;
    if (filters.priority !== 'all' && row.priority !== filters.priority) return false;
    if (filters.status !== 'all' && row.status !== filters.status) return false;
    return true;
  });

  const columns = [
    { field: 'id', headerName: 'Rec ID', minWidth: 90, flex: 0.6 },
    { field: 'title', headerName: 'Recommendation', minWidth: 250, flex: 2 },
    {
      field: 'category',
      headerName: 'Category',
      minWidth: 100,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Inventory' ? 'info' : params.value === 'Supply' ? 'warning' : params.value === 'Cost' ? 'success' : 'secondary'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      minWidth: 90,
      flex: 0.6,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'High' ? 'error' : params.value === 'Medium' ? 'warning' : 'default'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 110,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Implemented' ? 'success' : params.value === 'Approved' ? 'info' : params.value === 'Rejected' ? 'error' : 'default'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'confidence',
      headerName: 'Confidence',
      minWidth: 110,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={params.value}
            sx={{ flex: 1, height: 6, borderRadius: 3 }}
            color={params.value >= 90 ? 'success' : params.value >= 75 ? 'info' : 'warning'}
          />
          <Typography variant="caption" fontWeight={600}>{params.value}%</Typography>
        </Box>
      ),
    },
    {
      field: 'estimatedSavings',
      headerName: 'Est. Savings',
      minWidth: 110,
      flex: 0.7,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => formatCurrency(params.value),
    },
    {
      field: 'affectedItems',
      headerName: 'Items',
      minWidth: 70,
      flex: 0.5,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'generatedDate',
      headerName: 'Generated',
      minWidth: 100,
      flex: 0.7,
    },
  ];

  const handleRowClick = (params) => {
    setSelectedRec(params.row);
  };

  const renderDetailView = () => {
    if (!selectedRec) return null;

    const categoryData = {
      labels: ['Inventory', 'Supply', 'Cost', 'MRP', 'Analytics', 'Service'],
      datasets: [{
        data: [30, 25, 15, 15, 10, 5],
        backgroundColor: ['#0891b2', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#ec4899'],
      }],
    };

    const impactData = {
      labels: ['Cost Reduction', 'Service Improvement', 'Efficiency Gain', 'Risk Reduction'],
      datasets: [{
        label: 'Impact Score',
        data: [
          selectedRec.impactScore * 0.4,
          selectedRec.impactScore * 0.25,
          selectedRec.impactScore * 0.2,
          selectedRec.impactScore * 0.15,
        ],
        backgroundColor: ['#10b981', '#0891b2', '#8b5cf6', '#f59e0b'],
      }],
    };

    return (
      <Box>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => setSelectedRec(null)}
            variant="outlined"
            size="small"
          >
            Back to List
          </Button>
          <Typography variant="h6" fontWeight={700}>
            {selectedRec.title}
          </Typography>
          <Chip
            label={selectedRec.priority}
            size="small"
            color={selectedRec.priority === 'High' ? 'error' : selectedRec.priority === 'Medium' ? 'warning' : 'default'}
          />
          <Chip
            label={selectedRec.status}
            size="small"
            color={selectedRec.status === 'Implemented' ? 'success' : selectedRec.status === 'Approved' ? 'info' : selectedRec.status === 'Rejected' ? 'error' : 'default'}
          />
          <Box sx={{ flexGrow: 1 }} />
          {selectedRec.status === 'Pending' && (
            <>
              <Button startIcon={<ThumbDown />} variant="outlined" color="error" size="small" sx={{ mr: 1 }}>
                Reject
              </Button>
              <Button startIcon={<ThumbUp />} variant="contained" color="success" size="small">
                Approve
              </Button>
            </>
          )}
        </Box>

        <Grid container spacing={2}>
          {/* Summary Cards */}
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #10b981' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Estimated Savings</Typography>
                <Typography variant="h5" fontWeight={700} color="success.main">{formatCurrency(selectedRec.estimatedSavings)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #0891b2' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Confidence Score</Typography>
                <Typography variant="h5" fontWeight={700}>{selectedRec.confidence}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #8b5cf6' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Impact Score</Typography>
                <Typography variant="h5" fontWeight={700}>{selectedRec.impactScore}/100</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #f59e0b' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Affected Items</Typography>
                <Typography variant="h5" fontWeight={700}>{selectedRec.affectedItems}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Recommendation Details */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  <Lightbulb sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle', color: '#f59e0b' }} />
                  Recommendation Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Category</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedRec.category}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Implementation Effort</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedRec.implementationEffort}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Generated Date</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedRec.generatedDate}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">AI Model</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedRec.aiModel}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Rationale</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, p: 1.5, bgcolor: alpha('#0891b2', 0.05), borderRadius: 1 }}>
                      {selectedRec.rationale}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Impact Breakdown */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Impact Breakdown</Typography>
                <Box sx={{ height: 220 }}>
                  <Bar
                    data={impactData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      indexAxis: 'y',
                      plugins: { legend: { display: false } },
                      scales: { x: { beginAtZero: true, max: 50 } },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Review History */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Review Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Chip
                      label={selectedRec.status}
                      size="small"
                      color={selectedRec.status === 'Implemented' ? 'success' : selectedRec.status === 'Approved' ? 'info' : selectedRec.status === 'Rejected' ? 'error' : 'default'}
                      sx={{ display: 'block', mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Reviewed By</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedRec.reviewedBy}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Recommendations by Category</Typography>
                <Box sx={{ height: 180, display: 'flex', justifyContent: 'center' }}>
                  <Doughnut
                    data={categoryData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'right' } },
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
    <Box sx={{ p: 3, height: '100%', overflow: 'auto', bgcolor: '#f8fafc' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline' } }}>
              STOX.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              Recommendations Hub
            </Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small" sx={{ borderColor: 'divider' }}>
            Back
          </Button>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <RecommendIcon sx={{ fontSize: 32, color: '#ec4899' }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="#ec4899">
              Recommendations Hub
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI-powered recommendations for inventory optimization and cost savings
            </Typography>
          </Box>
        </Stack>
      </Box>

      {selectedRec ? (
        renderDetailView()
      ) : (
        <>
          {/* Summary Cards */}
          {metrics && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #ec4899' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Total Recommendations</Typography>
                    <Typography variant="h5" fontWeight={700}>{metrics.totalRecs}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #64748b' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Pending Review</Typography>
                    <Typography variant="h5" fontWeight={700}>{metrics.pendingCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #0891b2' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Approved</Typography>
                    <Typography variant="h5" fontWeight={700} color="info.main">{metrics.approvedCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #10b981' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Implemented</Typography>
                    <Typography variant="h5" fontWeight={700} color="success.main">{metrics.implementedCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #ef4444' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">High Priority</Typography>
                    <Typography variant="h5" fontWeight={700} color="error.main">{metrics.highPriorityCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #16a34a' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Total Savings</Typography>
                    <Typography variant="h5" fontWeight={700} color="success.main">{formatCurrency(metrics.totalSavings)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <FilterListIcon color="action" />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Category</InputLabel>
                <Select value={filters.category} label="Category" onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="Inventory">Inventory</MenuItem>
                  <MenuItem value="Supply">Supply</MenuItem>
                  <MenuItem value="Cost">Cost</MenuItem>
                  <MenuItem value="MRP">MRP</MenuItem>
                  <MenuItem value="Analytics">Analytics</MenuItem>
                  <MenuItem value="Service">Service</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Priority</InputLabel>
                <Select value={filters.priority} label="Priority" onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
                  <MenuItem value="all">All Priorities</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select value={filters.status} label="Status" onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Implemented">Implemented</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ flexGrow: 1 }} />
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
          <Paper sx={{ height: 500 }}>
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
              sx={stoxTheme.getDataGridSx({ clickable: true })}
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

export default RecommendationsHub;
