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
  EmojiEvents as TrophyIcon,
  ShowChart as ChartIcon,
  Speed as SpeedIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import margenTheme from './margenTheme';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, ChartTooltip, Legend);

// Arizona COPA - Market Share & Brand Performance Data
const generateBrandData = () => [
  { id: 'BR-01', brand: 'Arizona Green Tea', category: 'RTD Tea', marketShare: 18.5, shareChange: 1.2, revenue: 85.2, revenueGrowth: 12.5, volume: 28500, volumeGrowth: 8.2, avgPrice: 2.99, priceChange: 3.8, distribution: 92, velocityIndex: 115 },
  { id: 'BR-02', brand: 'Arnold Palmer', category: 'RTD Tea', marketShare: 12.3, shareChange: 2.1, revenue: 52.4, revenueGrowth: 18.2, volume: 15200, volumeGrowth: 14.5, avgPrice: 3.45, priceChange: 2.5, distribution: 88, velocityIndex: 125 },
  { id: 'BR-03', brand: 'Arizona Fruit Juice', category: 'Juice', marketShare: 8.2, shareChange: -0.8, revenue: 34.8, revenueGrowth: -2.5, volume: 12800, volumeGrowth: -5.2, avgPrice: 2.72, priceChange: 2.8, distribution: 78, velocityIndex: 85 },
  { id: 'BR-04', brand: 'RX Energy', category: 'Energy', marketShare: 3.5, shareChange: 1.8, revenue: 22.1, revenueGrowth: 32.5, volume: 8200, volumeGrowth: 28.8, avgPrice: 2.69, priceChange: 2.2, distribution: 65, velocityIndex: 142 },
  { id: 'BR-05', brand: 'Arizona Lemonade', category: 'Juice', marketShare: 5.8, shareChange: 0.3, revenue: 18.5, revenueGrowth: 5.8, volume: 7500, volumeGrowth: 3.2, avgPrice: 2.47, priceChange: 2.5, distribution: 72, velocityIndex: 92 },
];

// Arizona COPA - Regional Performance Data
const generateRegionalData = () => [
  { id: 'REG-01', region: 'Northeast', states: 'NY, NJ, CT, MA, PA', revenue: 48.5, revenueShare: 28.5, growth: 8.5, grossMargin: 42.0, marketPenetration: 85, distributors: 12, topProduct: 'Green Tea 23oz' },
  { id: 'REG-02', region: 'Southeast', states: 'FL, GA, NC, SC, VA', revenue: 38.2, revenueShare: 22.4, growth: 15.2, grossMargin: 38.5, marketPenetration: 72, distributors: 8, topProduct: 'Arnold Palmer 20oz' },
  { id: 'REG-03', region: 'Midwest', states: 'IL, OH, MI, IN, WI', revenue: 32.5, revenueShare: 19.1, growth: 6.2, grossMargin: 40.0, marketPenetration: 68, distributors: 10, topProduct: 'Green Tea 23oz' },
  { id: 'REG-04', region: 'West', states: 'CA, AZ, NV, CO, WA', revenue: 28.8, revenueShare: 16.9, growth: 12.8, grossMargin: 36.5, marketPenetration: 78, distributors: 6, topProduct: 'RX Energy 16oz' },
  { id: 'REG-05', region: 'Southwest', states: 'TX, OK, NM, AR, LA', revenue: 22.1, revenueShare: 13.0, growth: 18.5, grossMargin: 39.2, marketPenetration: 62, distributors: 5, topProduct: 'Fruit Punch Gallon' },
];

// Arizona COPA - Competitive Landscape
const generateCompetitorData = () => [
  { id: 'COMP-01', competitor: 'Snapple', segment: 'RTD Tea', marketShare: 22.5, shareChange: -1.2, priceIndex: 115, strengthWeakness: 'Premium positioning but declining' },
  { id: 'COMP-02', competitor: 'Lipton', segment: 'RTD Tea', marketShare: 15.8, shareChange: -0.5, priceIndex: 95, strengthWeakness: 'Strong distribution, lower margins' },
  { id: 'COMP-03', competitor: 'Pure Leaf', segment: 'RTD Tea', marketShare: 12.2, shareChange: 2.5, priceIndex: 125, strengthWeakness: 'Premium growth segment' },
  { id: 'COMP-04', competitor: 'Brisk', segment: 'RTD Tea', marketShare: 8.5, shareChange: -0.8, priceIndex: 85, strengthWeakness: 'Value segment pressure' },
  { id: 'COMP-05', competitor: 'Gold Peak', segment: 'RTD Tea', marketShare: 6.8, shareChange: 1.5, priceIndex: 105, strengthWeakness: 'Coca-Cola distribution advantage' },
];

// Detail generator
const generateBrandDetail = (brand) => ({
  ...brand,
  monthlyTrend: [
    { month: 'Jan', revenue: brand.revenue * 0.21, share: brand.marketShare - 0.3 },
    { month: 'Feb', revenue: brand.revenue * 0.23, share: brand.marketShare - 0.1 },
    { month: 'Mar', revenue: brand.revenue * 0.26, share: brand.marketShare + 0.2 },
    { month: 'Apr', revenue: brand.revenue * 0.30, share: brand.marketShare + 0.5 },
  ],
  channelBreakdown: [
    { channel: 'Grocery', share: 35, growth: 5.2 },
    { channel: 'Convenience', share: 28, growth: 12.5 },
    { channel: 'Mass', share: 22, growth: 3.8 },
    { channel: 'Club', share: 10, growth: -2.1 },
    { channel: 'E-Commerce', share: 5, growth: 45.2 },
  ],
  keyMetrics: [
    { metric: 'Avg Weekly Sales/Store', value: '$285', benchmark: '$250' },
    { metric: 'Promotional Lift', value: '2.4x', benchmark: '2.0x' },
    { metric: 'New Distribution Points', value: '+1,250', benchmark: '+800' },
    { metric: 'Consumer Trial Rate', value: '68%', benchmark: '55%' },
  ],
});

export default function GrowthMarketTab() {
  const [loading, setLoading] = useState(true);
  const [brandData, setBrandData] = useState([]);
  const [regionalData, setRegionalData] = useState([]);
  const [competitorData, setCompetitorData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setBrandData(generateBrandData());
      setRegionalData(generateRegionalData());
      setCompetitorData(generateCompetitorData());
      setLoading(false);
    }, 500);
  }, []);

  // Summary KPIs
  const kpis = brandData.length ? {
    totalMarketShare: brandData.reduce((sum, b) => sum + b.marketShare, 0),
    shareGrowth: brandData.reduce((sum, b) => sum + b.shareChange, 0) / brandData.length,
    totalRevenue: brandData.reduce((sum, b) => sum + b.revenue, 0),
    avgGrowth: brandData.reduce((sum, b) => sum + b.revenueGrowth, 0) / brandData.length,
    topBrand: [...brandData].sort((a, b) => b.marketShare - a.marketShare)[0].brand,
  } : null;

  // Brand columns
  const brandColumns = [
    { field: 'brand', headerName: 'Brand', minWidth: 180, flex: 1 },
    {
      field: 'category',
      headerName: 'Category',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value === 'RTD Tea' ? alpha('#10b981', 0.12) : params.value === 'Energy' ? alpha('#f97316', 0.12) : alpha('#1a5a9e', 0.12),
            color: params.value === 'RTD Tea' ? '#059669' : params.value === 'Energy' ? '#ea580c' : '#1a5a9e',
          }}
        />
      ),
    },
    {
      field: 'marketShare',
      headerName: 'Market Share %',
      width: 130,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={`${params.value.toFixed(1)}%`}
          size="small"
          sx={{ fontWeight: 700, bgcolor: alpha('#1a5a9e', 0.12), color: '#1a5a9e' }}
        />
      ),
    },
    {
      field: 'shareChange',
      headerName: 'Share Change',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Chip
          icon={params.value >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
          label={`${params.value >= 0 ? '+' : ''}${params.value.toFixed(1)}pp`}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value >= 0 ? alpha('#10b981', 0.12) : alpha('#ef4444', 0.12),
            color: params.value >= 0 ? '#059669' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'revenue',
      headerName: 'Revenue ($M)',
      width: 120,
      type: 'number',
      renderCell: (params) => <Typography sx={{ fontWeight: 600 }}>${params.value.toFixed(1)}</Typography>,
    },
    {
      field: 'revenueGrowth',
      headerName: 'Revenue Growth',
      width: 130,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={`${params.value >= 0 ? '+' : ''}${params.value.toFixed(1)}%`}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value >= 10 ? alpha('#10b981', 0.12) : params.value >= 0 ? alpha('#64748b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value >= 10 ? '#059669' : params.value >= 0 ? '#64748b' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'distribution',
      headerName: 'Distribution %',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value >= 80 ? alpha('#10b981', 0.12) : params.value >= 60 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value >= 80 ? '#059669' : params.value >= 60 ? '#d97706' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'velocityIndex',
      headerName: 'Velocity Index',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value >= 100 ? alpha('#10b981', 0.12) : alpha('#f59e0b', 0.12),
            color: params.value >= 100 ? '#059669' : '#d97706',
          }}
        />
      ),
    },
  ];

  // Regional columns
  const regionalColumns = [
    { field: 'region', headerName: 'Region', width: 120 },
    { field: 'states', headerName: 'States', minWidth: 180, flex: 1 },
    {
      field: 'revenue',
      headerName: 'Revenue ($M)',
      width: 120,
      type: 'number',
      renderCell: (params) => <Typography sx={{ fontWeight: 600 }}>${params.value.toFixed(1)}</Typography>,
    },
    {
      field: 'revenueShare',
      headerName: 'Revenue Share %',
      width: 130,
      type: 'number',
      valueFormatter: (params) => `${params.value?.toFixed(1)}%`,
    },
    {
      field: 'growth',
      headerName: 'Growth %',
      width: 110,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={`${params.value >= 0 ? '+' : ''}${params.value.toFixed(1)}%`}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value >= 10 ? alpha('#10b981', 0.12) : params.value >= 0 ? alpha('#64748b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value >= 10 ? '#059669' : params.value >= 0 ? '#64748b' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'grossMargin',
      headerName: 'Gross Margin %',
      width: 130,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={`${params.value.toFixed(0)}%`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value >= 40 ? alpha('#10b981', 0.12) : alpha('#f59e0b', 0.12),
            color: params.value >= 40 ? '#059669' : '#d97706',
          }}
        />
      ),
    },
    {
      field: 'marketPenetration',
      headerName: 'Penetration %',
      width: 120,
      type: 'number',
      valueFormatter: (params) => `${params.value}%`,
    },
    { field: 'topProduct', headerName: 'Top Product', width: 150 },
  ];

  // Competitor columns
  const competitorColumns = [
    { field: 'competitor', headerName: 'Competitor', minWidth: 150, flex: 1 },
    { field: 'segment', headerName: 'Segment', width: 100 },
    {
      field: 'marketShare',
      headerName: 'Market Share %',
      width: 130,
      type: 'number',
      renderCell: (params) => (
        <Chip label={`${params.value.toFixed(1)}%`} size="small" sx={{ fontWeight: 700, bgcolor: alpha('#64748b', 0.12), color: '#475569' }} />
      ),
    },
    {
      field: 'shareChange',
      headerName: 'Share Change',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={`${params.value >= 0 ? '+' : ''}${params.value.toFixed(1)}pp`}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value <= 0 ? alpha('#10b981', 0.12) : alpha('#ef4444', 0.12),
            color: params.value <= 0 ? '#059669' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'priceIndex',
      headerName: 'Price Index',
      width: 110,
      type: 'number',
      renderCell: (params) => <Chip label={params.value} size="small" sx={{ fontWeight: 600 }} />,
    },
    { field: 'strengthWeakness', headerName: 'Assessment', minWidth: 200, flex: 1 },
  ];

  const handleRowClick = (params) => {
    setSelectedRow(generateBrandDetail(params.row));
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
            <Chip label={selectedRow.category} size="small" color="info" />
          </Stack>
        </Stack>

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>{selectedRow.brand}</Typography>

        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Market Share', value: `${selectedRow.marketShare.toFixed(1)}%`, color: '#1a5a9e', icon: <TrophyIcon /> },
            { label: 'Revenue', value: `$${selectedRow.revenue.toFixed(1)}M`, color: '#10b981', icon: <ChartIcon /> },
            { label: 'Velocity Index', value: selectedRow.velocityIndex, color: selectedRow.velocityIndex >= 100 ? '#10b981' : '#f59e0b', icon: <SpeedIcon /> },
            { label: 'Distribution', value: `${selectedRow.distribution}%`, color: '#8b5cf6', icon: <GroupsIcon /> },
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

        {/* 3-Column Detail */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Revenue & Share Trend
                </Typography>
                <Box sx={{ height: 200 }}>
                  <Line
                    data={{
                      labels: selectedRow.monthlyTrend.map(t => t.month),
                      datasets: [
                        { label: 'Revenue ($M)', data: selectedRow.monthlyTrend.map(t => t.revenue), borderColor: '#1a5a9e', yAxisID: 'y' },
                        { label: 'Share (%)', data: selectedRow.monthlyTrend.map(t => t.share), borderColor: '#10b981', yAxisID: 'y1' },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
                      scales: {
                        y: { type: 'linear', position: 'left' },
                        y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false } },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Channel Breakdown
                </Typography>
                <Box sx={{ height: 200 }}>
                  <Doughnut
                    data={{
                      labels: selectedRow.channelBreakdown.map(c => c.channel),
                      datasets: [{
                        data: selectedRow.channelBreakdown.map(c => c.share),
                        backgroundColor: [alpha('#1a5a9e', 0.8), alpha('#10b981', 0.8), alpha('#f59e0b', 0.8), alpha('#8b5cf6', 0.8), alpha('#ef4444', 0.8)],
                      }],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 8 } } },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Key Performance Metrics
                </Typography>
                <Stack spacing={1.5}>
                  {selectedRow.keyMetrics.map((item, idx) => (
                    <Box key={idx} sx={{ p: 1.5, bgcolor: alpha('#64748b', 0.05), borderRadius: 1 }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{item.metric}</Typography>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{item.value}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>Benchmark: {item.benchmark}</Typography>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
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
            <Grid item xs={6} sm={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Total Market Share</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a5a9e' }}>{kpis?.totalMarketShare.toFixed(1)}%</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ background: kpis?.shareGrowth >= 0 ? 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Share Change (Avg)</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: kpis?.shareGrowth >= 0 ? '#059669' : '#dc2626' }}>{kpis?.shareGrowth >= 0 ? '+' : ''}{kpis?.shareGrowth.toFixed(1)}pp</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Total Revenue</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#059669' }}>${kpis?.totalRevenue.toFixed(0)}M</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Top Brand</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#7c3aed' }}>{kpis?.topBrand}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Brand DataGrid */}
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>Brand Performance</Typography>
          <Box sx={{ height: 280, mb: 3 }}>
            <DataGrid
              rows={brandData}
              columns={brandColumns}
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

          {/* Regional & Competitor DataGrids */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>Regional Performance</Typography>
              <Box sx={{ height: 250 }}>
                <DataGrid
                  rows={regionalData}
                  columns={regionalColumns}
                  density="compact"
                  disableRowSelectionOnClick
                  sx={margenTheme.getDataGridSx()}
                  initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                  pageSizeOptions={[5, 10]}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>Competitive Landscape</Typography>
              <Box sx={{ height: 250 }}>
                <DataGrid
                  rows={competitorData}
                  columns={competitorColumns}
                  density="compact"
                  disableRowSelectionOnClick
                  sx={margenTheme.getDataGridSx()}
                  initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                  pageSizeOptions={[5, 10]}
                />
              </Box>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
