import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  CircularProgress,
  alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowBack as ArrowBackIcon,
  AccountBalance as AccountBalanceIcon,
  Schedule as ScheduleIcon,
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import margenTheme from './margenTheme';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, ChartTooltip, Legend);

// Arizona COPA - Distributor Working Capital Data
const generateDistributorData = () => [
  { id: 'DIST-001', distributor: 'McLane Company', region: 'National', revenue: 28.5, arBalance: 4.2, dso: 54, dsoTarget: 45, apBalance: 2.1, dpo: 32, dpoTarget: 40, inventoryValue: 3.8, dio: 48, dioTarget: 45, ccc: 70, cashImpact: -1.2, paymentTerms: 'Net 60', creditLimit: 5.0, utilization: 84 },
  { id: 'DIST-002', distributor: 'Core-Mark', region: 'West', revenue: 22.3, arBalance: 2.8, dso: 42, dsoTarget: 45, apBalance: 1.8, dpo: 38, dpoTarget: 40, inventoryValue: 2.5, dio: 42, dioTarget: 45, ccc: 46, cashImpact: 0.8, paymentTerms: 'Net 45', creditLimit: 3.5, utilization: 80 },
  { id: 'DIST-003', distributor: 'UNFI', region: 'Northeast', revenue: 18.7, arBalance: 3.1, dso: 58, dsoTarget: 45, apBalance: 1.2, dpo: 28, dpoTarget: 40, inventoryValue: 2.8, dio: 52, dioTarget: 45, ccc: 82, cashImpact: -2.1, paymentTerms: 'Net 60', creditLimit: 4.0, utilization: 78 },
  { id: 'DIST-004', distributor: 'KeHE Distributors', region: 'Midwest', revenue: 15.2, arBalance: 1.9, dso: 45, dsoTarget: 45, apBalance: 1.5, dpo: 42, dpoTarget: 40, inventoryValue: 1.8, dio: 44, dioTarget: 45, ccc: 47, cashImpact: 0.5, paymentTerms: 'Net 45', creditLimit: 2.5, utilization: 76 },
  { id: 'DIST-005', distributor: 'Sysco', region: 'Southeast', revenue: 12.8, arBalance: 2.4, dso: 62, dsoTarget: 45, apBalance: 0.8, dpo: 25, dpoTarget: 40, inventoryValue: 2.2, dio: 58, dioTarget: 45, ccc: 95, cashImpact: -2.8, paymentTerms: 'Net 75', creditLimit: 3.0, utilization: 80 },
  { id: 'DIST-006', distributor: 'US Foods', region: 'Southwest', revenue: 9.5, arBalance: 1.2, dso: 38, dsoTarget: 45, apBalance: 0.9, dpo: 45, dpoTarget: 40, inventoryValue: 1.1, dio: 38, dioTarget: 45, ccc: 31, cashImpact: 1.2, paymentTerms: 'Net 30', creditLimit: 2.0, utilization: 60 },
  { id: 'DIST-007', distributor: 'Vistar', region: 'Central', revenue: 8.2, arBalance: 1.4, dso: 52, dsoTarget: 45, apBalance: 0.6, dpo: 30, dpoTarget: 40, inventoryValue: 1.3, dio: 55, dioTarget: 45, ccc: 77, cashImpact: -1.5, paymentTerms: 'Net 60', creditLimit: 1.8, utilization: 78 },
  { id: 'DIST-008', distributor: 'Associated Grocers', region: 'Pacific NW', revenue: 6.4, arBalance: 0.8, dso: 44, dsoTarget: 45, apBalance: 0.5, dpo: 35, dpoTarget: 40, inventoryValue: 0.9, dio: 48, dioTarget: 45, ccc: 57, cashImpact: 0.2, paymentTerms: 'Net 45', creditLimit: 1.2, utilization: 67 },
];

// Arizona COPA - Inventory by Plant/Warehouse
const generateInventoryData = () => [
  { id: 'INV-001', location: 'Woodbury, NY (HQ)', type: 'Plant', skuCount: 45, inventoryValue: 8.5, dio: 42, dioTarget: 40, turnover: 8.7, slowMoving: 12, obsoleteRisk: 2.1, capacityUtil: 78 },
  { id: 'INV-002', location: 'La Vergne, TN', type: 'Plant', skuCount: 38, inventoryValue: 6.2, dio: 38, dioTarget: 40, turnover: 9.6, slowMoving: 8, obsoleteRisk: 1.2, capacityUtil: 85 },
  { id: 'INV-003', location: 'Columbus, OH', type: 'Plant', skuCount: 32, inventoryValue: 4.8, dio: 45, dioTarget: 40, turnover: 8.1, slowMoving: 15, obsoleteRisk: 2.8, capacityUtil: 72 },
  { id: 'INV-004', location: 'Phoenix, AZ DC', type: 'Distribution', skuCount: 52, inventoryValue: 3.2, dio: 52, dioTarget: 45, turnover: 7.0, slowMoving: 18, obsoleteRisk: 1.8, capacityUtil: 68 },
  { id: 'INV-005', location: 'Atlanta, GA DC', type: 'Distribution', skuCount: 48, inventoryValue: 2.8, dio: 48, dioTarget: 45, turnover: 7.6, slowMoving: 14, obsoleteRisk: 1.5, capacityUtil: 75 },
  { id: 'INV-006', location: 'Dallas, TX DC', type: 'Distribution', skuCount: 42, inventoryValue: 2.4, dio: 55, dioTarget: 45, turnover: 6.6, slowMoving: 22, obsoleteRisk: 2.5, capacityUtil: 62 },
];

// Detail generator
const generateDistributorDetail = (dist) => ({
  ...dist,
  arAgingBuckets: [
    { bucket: 'Current', amount: dist.arBalance * 0.45, pct: 45 },
    { bucket: '1-30 Days', amount: dist.arBalance * 0.25, pct: 25 },
    { bucket: '31-60 Days', amount: dist.arBalance * 0.18, pct: 18 },
    { bucket: '61-90 Days', amount: dist.arBalance * 0.08, pct: 8 },
    { bucket: '90+ Days', amount: dist.arBalance * 0.04, pct: 4 },
  ],
  cashFlowTrend: [
    { month: 'Jan', inflow: dist.revenue * 0.22, outflow: dist.revenue * 0.18 },
    { month: 'Feb', inflow: dist.revenue * 0.24, outflow: dist.revenue * 0.19 },
    { month: 'Mar', inflow: dist.revenue * 0.26, outflow: dist.revenue * 0.21 },
    { month: 'Apr', inflow: dist.revenue * 0.28, outflow: dist.revenue * 0.22 },
  ],
  recommendations: dist.dso > dist.dsoTarget ? [
    'Review payment terms with distributor',
    'Implement early payment discounts',
    'Escalate overdue accounts',
  ] : [
    'Maintain current payment terms',
    'Consider volume incentives',
    'Explore credit limit increase',
  ],
});

export default function CashWorkingCapitalTab() {
  const [loading, setLoading] = useState(true);
  const [distributorData, setDistributorData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [viewMode, setViewMode] = useState('distributors');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setDistributorData(generateDistributorData());
      setInventoryData(generateInventoryData());
      setLoading(false);
    }, 500);
  }, []);

  // Summary KPIs
  const kpis = distributorData.length ? {
    totalAR: distributorData.reduce((sum, d) => sum + d.arBalance, 0),
    avgDSO: Math.round(distributorData.reduce((sum, d) => sum + d.dso, 0) / distributorData.length),
    avgDIO: Math.round(inventoryData.reduce((sum, d) => sum + d.dio, 0) / inventoryData.length),
    totalCashImpact: distributorData.reduce((sum, d) => sum + d.cashImpact, 0),
    overdueDistributors: distributorData.filter(d => d.dso > d.dsoTarget).length,
  } : null;

  // Distributor columns
  const distributorColumns = [
    { field: 'distributor', headerName: 'Distributor', minWidth: 180, flex: 1 },
    { field: 'region', headerName: 'Region', width: 110 },
    {
      field: 'revenue',
      headerName: 'Revenue ($M)',
      width: 120,
      type: 'number',
      renderCell: (params) => <Typography sx={{ fontWeight: 600 }}>${params.value.toFixed(1)}</Typography>,
    },
    {
      field: 'arBalance',
      headerName: 'A/R Balance ($M)',
      width: 130,
      type: 'number',
      renderCell: (params) => <Typography sx={{ fontWeight: 600 }}>${params.value.toFixed(1)}</Typography>,
    },
    {
      field: 'dso',
      headerName: 'DSO (Days)',
      width: 110,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value <= params.row.dsoTarget ? alpha('#10b981', 0.12) : params.value <= params.row.dsoTarget + 10 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value <= params.row.dsoTarget ? '#059669' : params.value <= params.row.dsoTarget + 10 ? '#d97706' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'dpo',
      headerName: 'DPO (Days)',
      width: 110,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value >= params.row.dpoTarget ? alpha('#10b981', 0.12) : alpha('#f59e0b', 0.12),
            color: params.value >= params.row.dpoTarget ? '#059669' : '#d97706',
          }}
        />
      ),
    },
    {
      field: 'dio',
      headerName: 'DIO (Days)',
      width: 110,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value <= params.row.dioTarget ? alpha('#10b981', 0.12) : alpha('#f59e0b', 0.12),
            color: params.value <= params.row.dioTarget ? '#059669' : '#d97706',
          }}
        />
      ),
    },
    {
      field: 'ccc',
      headerName: 'CCC (Days)',
      width: 110,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value <= 50 ? alpha('#10b981', 0.12) : params.value <= 70 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value <= 50 ? '#059669' : params.value <= 70 ? '#d97706' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'cashImpact',
      headerName: 'Cash Impact ($M)',
      width: 130,
      type: 'number',
      renderCell: (params) => (
        <Chip
          icon={params.value >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
          label={`${params.value >= 0 ? '+' : ''}${params.value.toFixed(1)}`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value >= 0 ? alpha('#10b981', 0.12) : alpha('#ef4444', 0.12),
            color: params.value >= 0 ? '#059669' : '#dc2626',
          }}
        />
      ),
    },
    { field: 'paymentTerms', headerName: 'Terms', width: 90 },
    {
      field: 'utilization',
      headerName: 'Credit Util %',
      width: 110,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value <= 70 ? alpha('#10b981', 0.12) : params.value <= 85 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value <= 70 ? '#059669' : params.value <= 85 ? '#d97706' : '#dc2626',
          }}
        />
      ),
    },
  ];

  // Inventory columns
  const inventoryColumns = [
    { field: 'location', headerName: 'Location', minWidth: 180, flex: 1 },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value === 'Plant' ? alpha('#3b82f6', 0.12) : alpha('#8b5cf6', 0.12),
            color: params.value === 'Plant' ? '#2563eb' : '#7c3aed',
          }}
        />
      ),
    },
    { field: 'skuCount', headerName: 'SKUs', width: 80, type: 'number' },
    {
      field: 'inventoryValue',
      headerName: 'Value ($M)',
      width: 110,
      type: 'number',
      renderCell: (params) => <Typography sx={{ fontWeight: 600 }}>${params.value.toFixed(1)}</Typography>,
    },
    {
      field: 'dio',
      headerName: 'DIO (Days)',
      width: 110,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value <= params.row.dioTarget ? alpha('#10b981', 0.12) : alpha('#f59e0b', 0.12),
            color: params.value <= params.row.dioTarget ? '#059669' : '#d97706',
          }}
        />
      ),
    },
    {
      field: 'turnover',
      headerName: 'Turnover',
      width: 100,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={params.value.toFixed(1)}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value >= 8 ? alpha('#10b981', 0.12) : params.value >= 6 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value >= 8 ? '#059669' : params.value >= 6 ? '#d97706' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'slowMoving',
      headerName: 'Slow Moving %',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value <= 10 ? alpha('#10b981', 0.12) : params.value <= 20 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value <= 10 ? '#059669' : params.value <= 20 ? '#d97706' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'obsoleteRisk',
      headerName: 'Obsolete Risk ($M)',
      width: 140,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={`$${params.value.toFixed(1)}`}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value <= 1.5 ? alpha('#10b981', 0.12) : params.value <= 2.5 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value <= 1.5 ? '#059669' : params.value <= 2.5 ? '#d97706' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'capacityUtil',
      headerName: 'Capacity %',
      width: 110,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value >= 70 && params.value <= 85 ? alpha('#10b981', 0.12) : alpha('#f59e0b', 0.12),
            color: params.value >= 70 && params.value <= 85 ? '#059669' : '#d97706',
          }}
        />
      ),
    },
  ];

  const handleRowClick = (params) => {
    if (viewMode === 'distributors') {
      setSelectedRow(generateDistributorDetail(params.row));
    }
  };

  // Render Detail View
  const renderDetailView = () => {
    if (!selectedRow) return null;

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => setSelectedRow(null)} variant="outlined" size="small">
            Back to List
          </Button>
          <Stack direction="row" spacing={1}>
            <Chip label={selectedRow.id} size="small" sx={{ bgcolor: alpha('#64748b', 0.1) }} />
            <Chip label={selectedRow.region} size="small" color="info" />
          </Stack>
        </Stack>

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{selectedRow.distributor}</Typography>
        <Typography sx={{ color: '#64748b', mb: 3 }}>Payment Terms: {selectedRow.paymentTerms}</Typography>

        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'DSO', value: `${selectedRow.dso} days`, target: selectedRow.dsoTarget, color: selectedRow.dso <= selectedRow.dsoTarget ? '#10b981' : '#ef4444', icon: <ScheduleIcon /> },
            { label: 'A/R Balance', value: `$${selectedRow.arBalance.toFixed(1)}M`, color: '#3b82f6', icon: <AccountBalanceIcon /> },
            { label: 'Cash Conversion', value: `${selectedRow.ccc} days`, color: selectedRow.ccc <= 50 ? '#10b981' : '#f59e0b', icon: <ShippingIcon /> },
            { label: 'Cash Impact', value: `${selectedRow.cashImpact >= 0 ? '+' : ''}$${selectedRow.cashImpact.toFixed(1)}M`, color: selectedRow.cashImpact >= 0 ? '#10b981' : '#ef4444', icon: <InventoryIcon /> },
          ].map((metric, idx) => (
            <Grid item xs={6} sm={3} key={idx}>
              <Card sx={{ background: `linear-gradient(135deg, ${alpha(metric.color, 0.1)} 0%, ${alpha(metric.color, 0.05)} 100%)` }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <Box sx={{ color: metric.color }}>{metric.icon}</Box>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>{metric.label}</Typography>
                  </Stack>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: metric.color }}>{metric.value}</Typography>
                  {metric.target && (
                    <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>Target: {metric.target} days</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* 3-Column Detail */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  A/R Aging Buckets
                </Typography>
                <Stack spacing={1.5}>
                  {selectedRow.arAgingBuckets.map((bucket, idx) => (
                    <Box key={idx}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography sx={{ fontSize: '0.8rem' }}>{bucket.bucket}</Typography>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>${bucket.amount.toFixed(2)}M ({bucket.pct}%)</Typography>
                      </Stack>
                      <Box sx={{ height: 6, bgcolor: alpha('#64748b', 0.1), borderRadius: 3 }}>
                        <Box sx={{ height: '100%', width: `${bucket.pct}%`, bgcolor: idx <= 1 ? '#10b981' : idx === 2 ? '#f59e0b' : '#ef4444', borderRadius: 3 }} />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Cash Flow Trend
                </Typography>
                <Box sx={{ height: 200 }}>
                  <Line
                    data={{
                      labels: selectedRow.cashFlowTrend.map(t => t.month),
                      datasets: [
                        { label: 'Inflow', data: selectedRow.cashFlowTrend.map(t => t.inflow), borderColor: '#10b981', backgroundColor: alpha('#10b981', 0.1), fill: true },
                        { label: 'Outflow', data: selectedRow.cashFlowTrend.map(t => t.outflow), borderColor: '#ef4444', backgroundColor: alpha('#ef4444', 0.1), fill: true },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
                      scales: { y: { beginAtZero: true } },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Card variant="outlined" sx={{ flex: 1, border: '2px solid', borderColor: selectedRow.dso > selectedRow.dsoTarget ? alpha('#ef4444', 0.3) : alpha('#10b981', 0.3) }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Recommendations
                </Typography>
                <Stack spacing={1.5}>
                  {selectedRow.recommendations.map((rec, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1, bgcolor: alpha('#64748b', 0.05), borderRadius: 1 }}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#3b82f6', minWidth: 20 }}>{idx + 1}.</Typography>
                      <Typography sx={{ fontSize: '0.8rem' }}>{rec}</Typography>
                    </Box>
                  ))}
                </Stack>
                <Button fullWidth variant="contained" sx={{ mt: 2, bgcolor: '#3b82f6' }}>
                  Generate Action Plan
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {selectedRow ? (
        renderDetailView()
      ) : (
        <>
          {/* KPI Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={2.4}>
              <Card sx={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Total A/R</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2563eb' }}>${kpis?.totalAR.toFixed(1)}M</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={2.4}>
              <Card sx={{ background: kpis?.avgDSO <= 45 ? 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Avg DSO</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: kpis?.avgDSO <= 45 ? '#059669' : '#dc2626' }}>{kpis?.avgDSO} days</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={2.4}>
              <Card sx={{ background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Avg DIO</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#7c3aed' }}>{kpis?.avgDIO} days</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={2.4}>
              <Card sx={{ background: kpis?.totalCashImpact >= 0 ? 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Net Cash Impact</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: kpis?.totalCashImpact >= 0 ? '#059669' : '#dc2626' }}>{kpis?.totalCashImpact >= 0 ? '+' : ''}${kpis?.totalCashImpact.toFixed(1)}M</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={2.4}>
              <Card sx={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Overdue Dist.</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#ea580c' }}>{kpis?.overdueDistributors}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Distributor DataGrid */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>Distributor Working Capital</Typography>
          <Box sx={{ height: 320, mb: 3 }}>
            <DataGrid
              rows={distributorData}
              columns={distributorColumns}
              density="compact"
              checkboxSelection
              disableRowSelectionOnClick
              onRowClick={handleRowClick}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true } }}
              sx={margenTheme.getDataGridSx({ clickable: true })}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              pageSizeOptions={[10, 25]}
            />
          </Box>

          {/* Inventory DataGrid */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>Inventory by Location</Typography>
          <Box sx={{ height: 280 }}>
            <DataGrid
              rows={inventoryData}
              columns={inventoryColumns}
              density="compact"
              checkboxSelection
              disableRowSelectionOnClick
              slots={{ toolbar: GridToolbar }}
              sx={margenTheme.getDataGridSx()}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              pageSizeOptions={[10, 25]}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
