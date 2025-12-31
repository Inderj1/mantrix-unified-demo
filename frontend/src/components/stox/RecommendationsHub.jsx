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
  AccountBalance,
  Savings,
  Warning,
  CalendarMonth,
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
import DataSourceChip from './DataSourceChip';
import { getTileDataConfig } from './stoxDataConfig';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, ChartTooltip, Legend);

const formatCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

// Generate mock recommendations data with Working Capital metrics
const generateRecommendationsData = () => {
  const recommendations = [
    { id: 'REC-001', title: 'Reduce Safety Stock for MAT-001', category: 'Inventory', priority: 'High', changeType: 'Safety Stock', currentValue: 500, recommendedValue: 420 },
    { id: 'REC-002', title: 'Increase Reorder Point for MAT-005', category: 'Inventory', priority: 'Medium', changeType: 'Reorder Point', currentValue: 720, recommendedValue: 800 },
    { id: 'REC-003', title: 'Switch to Moving Average Costing', category: 'Cost', priority: 'Low', changeType: 'Cost Method', currentValue: 0, recommendedValue: 0 },
    { id: 'REC-004', title: 'Consolidate Suppliers for Bearings', category: 'Supply', priority: 'High', changeType: 'Supplier', currentValue: 0, recommendedValue: 0 },
    { id: 'REC-005', title: 'Implement VMI for Electronics', category: 'Supply', priority: 'Medium', changeType: 'VMI', currentValue: 0, recommendedValue: 0 },
    { id: 'REC-006', title: 'Adjust Lot Size for MAT-008', category: 'MRP', priority: 'Medium', changeType: 'Lot Size', currentValue: 500, recommendedValue: 340 },
    { id: 'REC-007', title: 'Update Lead Time Parameters', category: 'MRP', priority: 'High', changeType: 'Lead Time', currentValue: 14, recommendedValue: 10 },
    { id: 'REC-008', title: 'Review ABC Classification', category: 'Analytics', priority: 'Low', changeType: 'Classification', currentValue: 0, recommendedValue: 0 },
    { id: 'REC-009', title: 'Optimize Service Level Targets', category: 'Service', priority: 'High', changeType: 'Service Level', currentValue: 99, recommendedValue: 97 },
    { id: 'REC-010', title: 'Reduce Excess Stock in P2000', category: 'Inventory', priority: 'High', changeType: 'Excess Stock', currentValue: 1200, recommendedValue: 0 },
    { id: 'REC-011', title: 'Improve Demand Forecast Accuracy', category: 'Analytics', priority: 'Medium', changeType: 'Forecast', currentValue: 0, recommendedValue: 0 },
    { id: 'REC-012', title: 'Negotiate Better Terms with VND-003', category: 'Supply', priority: 'Medium', changeType: 'Payment Terms', currentValue: 30, recommendedValue: 60 },
  ];

  const statuses = ['Pending', 'Approved', 'Rejected', 'Implemented'];
  const cashReleaseMonths = ['Month 1', 'Month 2', 'Month 3', 'Month 4+'];
  const carryingRate = 0.22; // 22% annual carrying cost

  return recommendations.map((rec, idx) => {
    const confidence = Math.floor(70 + Math.random() * 29);
    const impactScore = Math.floor(60 + Math.random() * 40);
    const status = statuses[idx % 4];
    const unitCost = 150 + Math.floor(Math.random() * 100); // $150-250 per unit

    // Calculate Working Capital metrics
    let deltaUnits = 0;
    let deltaWC = 0;
    let serviceRisk = 0;

    if (rec.changeType === 'Safety Stock' || rec.changeType === 'Excess Stock') {
      deltaUnits = rec.currentValue - rec.recommendedValue;
      deltaWC = deltaUnits * unitCost;
      serviceRisk = rec.changeType === 'Safety Stock' ? (0.2 + Math.random() * 0.8) : 0; // 0.2-1.0% for SS reduction
    } else if (rec.changeType === 'Lot Size') {
      deltaUnits = (rec.currentValue - rec.recommendedValue) / 2; // Cycle stock = lot/2
      deltaWC = deltaUnits * unitCost;
      serviceRisk = 0; // Lot size doesn't affect service
    } else if (rec.changeType === 'Reorder Point') {
      deltaUnits = rec.recommendedValue - rec.currentValue; // Increase = more WC
      deltaWC = -deltaUnits * unitCost; // Negative WC freed (increase)
      serviceRisk = -0.5; // Negative = service improvement
    } else if (rec.changeType === 'Service Level') {
      deltaWC = (rec.currentValue - rec.recommendedValue) * 5000; // $5K per service % reduction
      serviceRisk = (rec.currentValue - rec.recommendedValue) * 0.3; // 0.3% per % reduction
    } else if (rec.changeType === 'Payment Terms') {
      // Payment terms improvement frees WC without inventory change
      deltaWC = Math.floor(50000 + Math.random() * 100000);
      serviceRisk = 0;
    } else {
      // Other categories - estimate WC impact
      deltaWC = Math.floor(10000 + Math.random() * 40000);
      serviceRisk = Math.random() * 0.5;
    }

    // Calculate annual carrying cost savings
    const deltaAnnualCost = deltaWC > 0 ? Math.round(deltaWC * carryingRate) : 0;

    // Calculate risk-adjusted savings
    const riskMultiplier = Math.max(0, 1 - Math.abs(serviceRisk) / 10);
    const riskAdjustedSavings = Math.round(deltaWC * (confidence / 100) * riskMultiplier);

    // Determine cash release month based on change type
    let cashReleaseMonth;
    if (rec.changeType === 'Safety Stock' || rec.changeType === 'Excess Stock') {
      cashReleaseMonth = 'Month 1';
    } else if (rec.changeType === 'Lot Size') {
      cashReleaseMonth = 'Month 2';
    } else if (rec.changeType === 'Lead Time') {
      cashReleaseMonth = 'Month 3';
    } else {
      cashReleaseMonth = cashReleaseMonths[idx % 4];
    }

    return {
      id: rec.id,
      title: rec.title,
      category: rec.category,
      priority: rec.priority,
      status,
      confidence,
      impactScore,
      affectedItems: Math.floor(1 + Math.random() * 20),
      generatedDate: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reviewedBy: status !== 'Pending' ? 'Manager' : '-',
      implementationEffort: ['Low', 'Medium', 'High'][idx % 3],
      aiModel: 'STOX-AI v2.1',
      rationale: 'Based on historical demand patterns and current inventory levels.',
      // Working Capital metrics
      changeType: rec.changeType,
      currentValue: rec.currentValue,
      recommendedValue: rec.recommendedValue,
      deltaUnits,
      unitCost,
      deltaWC: Math.round(deltaWC),
      deltaAnnualCost,
      serviceRisk: parseFloat(serviceRisk.toFixed(2)),
      riskAdjustedSavings,
      cashReleaseMonth,
      // Legacy field for compatibility
      estimatedSavings: Math.abs(deltaWC) || Math.floor(5000 + Math.random() * 95000),
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

  // Get tile data config for data source indicator
  const tileConfig = getTileDataConfig('recommendations-hub');

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

      // Working Capital metrics
      const totalWCFreed = recData.filter(d => d.deltaWC > 0).reduce((sum, d) => sum + d.deltaWC, 0);
      const totalAnnualCarrySavings = recData.filter(d => d.deltaAnnualCost > 0).reduce((sum, d) => sum + d.deltaAnnualCost, 0);
      const totalRiskAdjustedSavings = recData.filter(d => d.riskAdjustedSavings > 0).reduce((sum, d) => sum + d.riskAdjustedSavings, 0);

      setMetrics({
        totalRecs,
        pendingCount,
        approvedCount,
        implementedCount,
        highPriorityCount,
        totalSavings,
        avgConfidence: avgConfidence.toFixed(0),
        // WC metrics
        totalWCFreed,
        totalAnnualCarrySavings,
        totalRiskAdjustedSavings,
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
    { field: 'title', headerName: 'Recommendation', minWidth: 200, flex: 1.5 },
    {
      field: 'category',
      headerName: 'Category',
      minWidth: 90,
      flex: 0.6,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Inventory' ? 'info' : params.value === 'Supply' ? 'warning' : params.value === 'Cost' ? 'success' : 'secondary'}
          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
        />
      ),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      minWidth: 80,
      flex: 0.5,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'High' ? 'error' : params.value === 'Medium' ? 'warning' : 'default'}
          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 100,
      flex: 0.6,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Implemented' ? 'success' : params.value === 'Approved' ? 'info' : params.value === 'Rejected' ? 'error' : 'default'}
          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
        />
      ),
    },
    // Working Capital Columns
    {
      field: 'deltaWC',
      headerName: 'Δ WC ($)',
      minWidth: 110,
      flex: 0.7,
      align: 'right',
      headerAlign: 'right',
      description: 'Working Capital freed (Inventory reduction × unit cost)',
      renderCell: (params) => (
        <Chip
          icon={params.value > 0 ? <Savings sx={{ fontSize: 14 }} /> : undefined}
          label={params.value >= 0 ? `+${formatCurrency(params.value)}` : formatCurrency(params.value)}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.7rem',
            bgcolor: params.value > 0 ? alpha('#10b981', 0.12) : params.value < 0 ? alpha('#ef4444', 0.12) : alpha('#64748b', 0.12),
            color: params.value > 0 ? '#059669' : params.value < 0 ? '#dc2626' : '#64748b',
            '& .MuiChip-icon': { color: params.value > 0 ? '#059669' : '#64748b' },
          }}
        />
      ),
    },
    {
      field: 'deltaAnnualCost',
      headerName: 'Δ Annual Cost',
      minWidth: 120,
      flex: 0.7,
      align: 'right',
      headerAlign: 'right',
      description: 'Annual carrying cost savings (WC freed × 22% carrying rate)',
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} sx={{ color: params.value > 0 ? '#059669' : '#64748b' }}>
          {params.value > 0 ? `-${formatCurrency(params.value)}/yr` : '-'}
        </Typography>
      ),
    },
    {
      field: 'serviceRisk',
      headerName: 'Service Risk',
      minWidth: 100,
      flex: 0.6,
      align: 'center',
      headerAlign: 'center',
      description: 'Increase in stockout probability (%)',
      renderCell: (params) => {
        const risk = params.value;
        let label, color;
        if (risk <= 0) {
          label = risk < 0 ? 'Improved' : 'None';
          color = '#10b981';
        } else if (risk < 0.5) {
          label = `Low (+${risk}%)`;
          color = '#2b88d8';
        } else if (risk < 1) {
          label = `Med (+${risk}%)`;
          color = '#f59e0b';
        } else {
          label = `High (+${risk}%)`;
          color = '#ef4444';
        }
        return (
          <Chip
            icon={risk > 0.5 ? <Warning sx={{ fontSize: 12 }} /> : undefined}
            label={label}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '0.65rem',
              bgcolor: alpha(color, 0.12),
              color: color,
              '& .MuiChip-icon': { color: color },
            }}
          />
        );
      },
    },
    {
      field: 'riskAdjustedSavings',
      headerName: 'Risk-Adj Savings',
      minWidth: 130,
      flex: 0.8,
      align: 'right',
      headerAlign: 'right',
      description: 'WC × Confidence × (1 - Risk Factor)',
      renderCell: (params) => (
        <Chip
          label={formatCurrency(params.value)}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.7rem',
            bgcolor: params.value > 50000 ? alpha('#10b981', 0.12) : params.value > 20000 ? alpha('#2b88d8', 0.12) : alpha('#64748b', 0.12),
            color: params.value > 50000 ? '#059669' : params.value > 20000 ? '#0078d4' : '#64748b',
          }}
        />
      ),
    },
    {
      field: 'cashReleaseMonth',
      headerName: 'Cash Release',
      minWidth: 100,
      flex: 0.6,
      align: 'center',
      headerAlign: 'center',
      description: 'When CFO sees balance sheet impact',
      renderCell: (params) => (
        <Chip
          icon={<CalendarMonth sx={{ fontSize: 12 }} />}
          label={params.value}
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: '0.65rem',
            bgcolor: params.value === 'Month 1' ? alpha('#10b981', 0.12) : params.value === 'Month 2' ? alpha('#2b88d8', 0.12) : alpha('#f59e0b', 0.12),
            color: params.value === 'Month 1' ? '#059669' : params.value === 'Month 2' ? '#0078d4' : '#d97706',
            '& .MuiChip-icon': { color: params.value === 'Month 1' ? '#059669' : params.value === 'Month 2' ? '#0078d4' : '#d97706' },
          }}
        />
      ),
    },
    {
      field: 'confidence',
      headerName: 'Confidence',
      minWidth: 100,
      flex: 0.6,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LinearProgress
            variant="determinate"
            value={params.value}
            sx={{ flex: 1, height: 5, borderRadius: 3 }}
            color={params.value >= 90 ? 'success' : params.value >= 75 ? 'info' : 'warning'}
          />
          <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem' }}>{params.value}%</Typography>
        </Box>
      ),
    },
    {
      field: 'affectedItems',
      headerName: 'Items',
      minWidth: 60,
      flex: 0.4,
      align: 'center',
      headerAlign: 'center',
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
        backgroundColor: ['#0891b2', '#f59e0b', '#10b981', '#0078d4', '#06b6d4', '#ec4899'],
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
        backgroundColor: ['#10b981', '#0891b2', '#0078d4', '#f59e0b'],
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
          {/* Working Capital Impact Cards */}
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #106ebe' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                  <AccountBalance sx={{ fontSize: 16, color: '#106ebe' }} />
                  <Typography variant="caption" color="text.secondary">Δ Working Capital</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color={selectedRec.deltaWC > 0 ? '#10b981' : selectedRec.deltaWC < 0 ? '#ef4444' : '#64748b'}>
                  {selectedRec.deltaWC >= 0 ? '+' : ''}{formatCurrency(selectedRec.deltaWC)}
                </Typography>
                <Typography variant="caption" color="text.secondary">Cash freed from inventory</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #10b981' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                  <Savings sx={{ fontSize: 16, color: '#10b981' }} />
                  <Typography variant="caption" color="text.secondary">Δ Annual Cost</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  {selectedRec.deltaAnnualCost > 0 ? `-${formatCurrency(selectedRec.deltaAnnualCost)}/yr` : '-'}
                </Typography>
                <Typography variant="caption" color="text.secondary">Recurring P&L benefit</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #0078d4' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                  <TrendingUp sx={{ fontSize: 16, color: '#0078d4' }} />
                  <Typography variant="caption" color="text.secondary">Risk-Adjusted Savings</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color="#0078d4">{formatCurrency(selectedRec.riskAdjustedSavings)}</Typography>
                <Typography variant="caption" color="text.secondary">Confidence {selectedRec.confidence}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: selectedRec.serviceRisk > 0.5 ? '4px solid #f59e0b' : '4px solid #10b981' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                  {selectedRec.serviceRisk > 0.5 ? <Warning sx={{ fontSize: 16, color: '#f59e0b' }} /> : <CheckCircle sx={{ fontSize: 16, color: '#10b981' }} />}
                  <Typography variant="caption" color="text.secondary">Service Risk</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color={selectedRec.serviceRisk > 0.5 ? '#f59e0b' : '#10b981'}>
                  {selectedRec.serviceRisk <= 0 ? (selectedRec.serviceRisk < 0 ? 'Improved' : 'None') : `+${selectedRec.serviceRisk}%`}
                </Typography>
                <Typography variant="caption" color="text.secondary">Cash release: {selectedRec.cashReleaseMonth}</Typography>
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
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="h5" fontWeight={700} color="#ec4899">
                Recommendations Hub
              </Typography>
              <DataSourceChip dataType={tileConfig.dataType} />
            </Stack>
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
          {/* Summary Cards - Working Capital Focused */}
          {metrics && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderLeft: '4px solid #106ebe' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AccountBalance sx={{ fontSize: 18, color: '#106ebe' }} />
                      <Typography variant="caption" color="text.secondary">Total WC Freed</Typography>
                    </Stack>
                    <Typography variant="h5" fontWeight={700} color="#106ebe">{formatCurrency(metrics.totalWCFreed)}</Typography>
                    <Typography variant="caption" color="text.secondary">{metrics.totalRecs} recommendations</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderLeft: '4px solid #10b981' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Savings sx={{ fontSize: 18, color: '#10b981' }} />
                      <Typography variant="caption" color="text.secondary">Annual Carry Savings</Typography>
                    </Stack>
                    <Typography variant="h5" fontWeight={700} color="#10b981">{formatCurrency(metrics.totalAnnualCarrySavings)}/yr</Typography>
                    <Typography variant="caption" color="text.secondary">22% carrying rate applied</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderLeft: '4px solid #0078d4' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TrendingUp sx={{ fontSize: 18, color: '#0078d4' }} />
                      <Typography variant="caption" color="text.secondary">Risk-Adjusted Savings</Typography>
                    </Stack>
                    <Typography variant="h5" fontWeight={700} color="#0078d4">{formatCurrency(metrics.totalRiskAdjustedSavings)}</Typography>
                    <Typography variant="caption" color="text.secondary">WC × Confidence × (1-Risk)</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderLeft: '4px solid #f59e0b' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Schedule sx={{ fontSize: 18, color: '#f59e0b' }} />
                      <Typography variant="caption" color="text.secondary">Pending / High Priority</Typography>
                    </Stack>
                    <Typography variant="h5" fontWeight={700} color="#f59e0b">{metrics.pendingCount} / {metrics.highPriorityCount}</Typography>
                    <Typography variant="caption" color="text.secondary">{metrics.implementedCount} implemented</Typography>
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
