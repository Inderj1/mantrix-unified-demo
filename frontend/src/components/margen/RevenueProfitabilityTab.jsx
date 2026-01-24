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
  Divider,
  CircularProgress,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowBack as ArrowBackIcon,
  LocalCafe as ProductIcon,
  People as PeopleIcon,
  Store as ChannelIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { Bar, Doughnut } from 'react-chartjs-2';
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
import margenTheme from './margenTheme';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, ChartTooltip, Legend);

// Arizona COPA - Product Profitability Data
const generateProductData = () => [
  { id: 'GT-23', sku: 'GT-23OZ-CS24', product: 'Green Tea 23oz', category: 'Tea', packSize: 'Case/24', revenue: 45.2, cogs: 27.1, grossProfit: 18.1, grossMargin: 40.0, volume: 12500, avgSellingPrice: 3.62, cogsPerUnit: 2.17, tradeSpend: 4.5, contributionMargin: 30.0, yoyGrowth: 8.5 },
  { id: 'AP-20', sku: 'AP-20OZ-CS24', product: 'Arnold Palmer 20oz', category: 'Tea', packSize: 'Case/24', revenue: 38.7, cogs: 21.3, grossProfit: 17.4, grossMargin: 45.0, volume: 9800, avgSellingPrice: 3.95, cogsPerUnit: 2.17, tradeSpend: 3.8, contributionMargin: 35.2, yoyGrowth: 12.3 },
  { id: 'FP-128', sku: 'FP-128OZ-CS4', product: 'Fruit Punch Gallon', category: 'Juice', packSize: 'Case/4', revenue: 22.4, cogs: 15.7, grossProfit: 6.7, grossMargin: 30.0, volume: 4200, avgSellingPrice: 5.33, cogsPerUnit: 3.74, tradeSpend: 2.2, contributionMargin: 20.2, yoyGrowth: -3.2 },
  { id: 'RX-16', sku: 'RX-16OZ-CS24', product: 'RX Energy 16oz', category: 'Energy', packSize: 'Case/24', revenue: 18.9, cogs: 9.5, grossProfit: 9.4, grossMargin: 50.0, volume: 6300, avgSellingPrice: 3.00, cogsPerUnit: 1.50, tradeSpend: 2.8, contributionMargin: 35.2, yoyGrowth: 25.8 },
  { id: 'LM-23', sku: 'LM-23OZ-CS24', product: 'Lemon Tea 23oz', category: 'Tea', packSize: 'Case/24', revenue: 15.6, cogs: 9.4, grossProfit: 6.2, grossMargin: 40.0, volume: 4800, avgSellingPrice: 3.25, cogsPerUnit: 1.95, tradeSpend: 1.5, contributionMargin: 30.4, yoyGrowth: 5.2 },
  { id: 'MM-15', sku: 'MM-15OZ-CS24', product: 'Mucho Mango 15.5oz', category: 'Juice', packSize: 'Case/24', revenue: 12.3, cogs: 7.4, grossProfit: 4.9, grossMargin: 40.0, volume: 5100, avgSellingPrice: 2.41, cogsPerUnit: 1.45, tradeSpend: 1.2, contributionMargin: 30.2, yoyGrowth: 2.1 },
  { id: 'WM-20', sku: 'WM-20OZ-CS24', product: 'Watermelon 20oz', category: 'Juice', packSize: 'Case/24', revenue: 9.8, cogs: 5.9, grossProfit: 3.9, grossMargin: 40.0, volume: 3200, avgSellingPrice: 3.06, cogsPerUnit: 1.84, tradeSpend: 0.9, contributionMargin: 30.8, yoyGrowth: 18.5 },
  { id: 'GR-15', sku: 'GR-15OZ-CS24', product: 'Grapeade 15.5oz', category: 'Juice', packSize: 'Case/24', revenue: 7.2, cogs: 4.7, grossProfit: 2.5, grossMargin: 35.0, volume: 2900, avgSellingPrice: 2.48, cogsPerUnit: 1.62, tradeSpend: 0.7, contributionMargin: 25.3, yoyGrowth: -8.2 },
];

// Arizona COPA - Customer Segment Data
const generateCustomerData = () => [
  { id: 'SEG-01', segment: 'National Retailers', customers: 12, revenue: 68.5, grossProfit: 23.3, grossMargin: 34.0, tradeSpend: 10.2, netMargin: 19.1, avgOrderValue: 125000, orderFrequency: 52, dso: 45, yoyGrowth: 8.2, status: 'champion' },
  { id: 'SEG-02', segment: 'Regional Chains', customers: 45, revenue: 42.3, grossProfit: 16.9, grossMargin: 40.0, tradeSpend: 5.1, netMargin: 28.0, avgOrderValue: 45000, orderFrequency: 26, dso: 38, yoyGrowth: 12.5, status: 'loyal' },
  { id: 'SEG-03', segment: 'Convenience Stores', customers: 234, revenue: 28.7, grossProfit: 12.6, grossMargin: 44.0, tradeSpend: 2.8, netMargin: 34.2, avgOrderValue: 8500, orderFrequency: 24, dso: 30, yoyGrowth: 15.8, status: 'potential' },
  { id: 'SEG-04', segment: 'Food Service', customers: 89, revenue: 18.2, grossProfit: 5.5, grossMargin: 30.0, tradeSpend: 2.2, netMargin: 18.0, avgOrderValue: 12000, orderFrequency: 12, dso: 52, yoyGrowth: -2.3, status: 'atRisk' },
  { id: 'SEG-05', segment: 'Dollar Stores', customers: 156, revenue: 12.4, grossProfit: 3.1, grossMargin: 25.0, tradeSpend: 1.8, netMargin: 10.5, avgOrderValue: 6200, orderFrequency: 18, dso: 35, yoyGrowth: 5.2, status: 'loyal' },
];

// Arizona COPA - Channel Performance Data
const generateChannelData = () => [
  { id: 'CH-01', channel: 'Retail', subChannel: 'Mass Merchandisers', revenue: 52.3, grossMargin: 35.0, tradeSpend: 8.2, netMargin: 19.3, volumeShare: 32.5, priceIndex: 100, yoyGrowth: 6.8 },
  { id: 'CH-02', channel: 'Retail', subChannel: 'Grocery', revenue: 38.5, grossMargin: 38.0, tradeSpend: 5.5, netMargin: 23.7, volumeShare: 24.2, priceIndex: 102, yoyGrowth: 4.2 },
  { id: 'CH-03', channel: 'Convenience', subChannel: 'C-Store Chains', revenue: 28.7, grossMargin: 44.0, tradeSpend: 2.8, netMargin: 34.2, volumeShare: 18.5, priceIndex: 115, yoyGrowth: 15.8 },
  { id: 'CH-04', channel: 'Wholesale', subChannel: 'Distributors', revenue: 22.1, grossMargin: 28.0, tradeSpend: 3.2, netMargin: 13.5, volumeShare: 14.2, priceIndex: 92, yoyGrowth: 2.1 },
  { id: 'CH-05', channel: 'E-Commerce', subChannel: 'Amazon', revenue: 12.8, grossMargin: 32.0, tradeSpend: 3.8, netMargin: 2.3, volumeShare: 7.8, priceIndex: 98, yoyGrowth: 28.5 },
  { id: 'CH-06', channel: 'E-Commerce', subChannel: 'D2C Website', revenue: 5.7, grossMargin: 55.0, tradeSpend: 0.8, netMargin: 40.8, volumeShare: 2.8, priceIndex: 110, yoyGrowth: 45.2 },
];

// Generate detail for drilldown
const generateProductDetail = (product) => ({
  ...product,
  monthlyTrend: [
    { month: 'Jan', revenue: product.revenue * 0.22, margin: product.grossMargin - 2 },
    { month: 'Feb', revenue: product.revenue * 0.24, margin: product.grossMargin - 1 },
    { month: 'Mar', revenue: product.revenue * 0.26, margin: product.grossMargin },
    { month: 'Apr', revenue: product.revenue * 0.28, margin: product.grossMargin + 1 },
  ],
  channelMix: [
    { channel: 'Retail', share: 45, margin: 36 },
    { channel: 'Convenience', share: 25, margin: 44 },
    { channel: 'Wholesale', share: 20, margin: 28 },
    { channel: 'E-Commerce', share: 10, margin: 38 },
  ],
  cogsBreakdown: [
    { component: 'Raw Materials', amount: product.cogs * 0.45, pct: 45 },
    { component: 'Packaging', amount: product.cogs * 0.25, pct: 25 },
    { component: 'Manufacturing', amount: product.cogs * 0.20, pct: 20 },
    { component: 'Logistics', amount: product.cogs * 0.10, pct: 10 },
  ],
});

export default function RevenueProfitabilityTab() {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('products');
  const [productData, setProductData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [channelData, setChannelData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setProductData(generateProductData());
      setCustomerData(generateCustomerData());
      setChannelData(generateChannelData());
      setLoading(false);
    }, 500);
  }, []);

  const handleRowClick = (params) => {
    if (viewMode === 'products') {
      setSelectedRow(generateProductDetail(params.row));
    } else {
      setSelectedRow(params.row);
    }
  };

  // Product columns
  const productColumns = [
    { field: 'sku', headerName: 'SKU', width: 130 },
    { field: 'product', headerName: 'Product', minWidth: 180, flex: 1 },
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
            bgcolor: params.value === 'Tea' ? alpha('#10b981', 0.12) : params.value === 'Energy' ? alpha('#f97316', 0.12) : alpha('#1a5a9e', 0.12),
            color: params.value === 'Tea' ? '#059669' : params.value === 'Energy' ? '#ea580c' : '#1a5a9e',
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
            bgcolor: params.value >= 40 ? alpha('#10b981', 0.12) : params.value >= 30 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value >= 40 ? '#059669' : params.value >= 30 ? '#d97706' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'contributionMargin',
      headerName: 'Contrib. Margin %',
      width: 140,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={`${params.value.toFixed(0)}%`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value >= 30 ? alpha('#10b981', 0.12) : params.value >= 20 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value >= 30 ? '#059669' : params.value >= 20 ? '#d97706' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'volume',
      headerName: 'Volume (Cases)',
      width: 130,
      type: 'number',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'avgSellingPrice',
      headerName: 'Avg Price ($)',
      width: 110,
      type: 'number',
      valueFormatter: (params) => `$${params.value?.toFixed(2)}`,
    },
    {
      field: 'tradeSpend',
      headerName: 'Trade Spend ($M)',
      width: 140,
      type: 'number',
      valueFormatter: (params) => `$${params.value?.toFixed(1)}`,
    },
    {
      field: 'yoyGrowth',
      headerName: 'YoY Growth',
      width: 110,
      type: 'number',
      renderCell: (params) => (
        <Chip
          icon={params.value >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
          label={`${params.value >= 0 ? '+' : ''}${params.value.toFixed(1)}%`}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value >= 0 ? alpha('#10b981', 0.12) : alpha('#ef4444', 0.12),
            color: params.value >= 0 ? '#059669' : '#dc2626',
          }}
        />
      ),
    },
  ];

  // Customer columns
  const customerColumns = [
    { field: 'segment', headerName: 'Customer Segment', minWidth: 180, flex: 1 },
    { field: 'customers', headerName: '# Customers', width: 110, type: 'number' },
    {
      field: 'revenue',
      headerName: 'Revenue ($M)',
      width: 120,
      type: 'number',
      renderCell: (params) => <Typography sx={{ fontWeight: 600 }}>${params.value.toFixed(1)}</Typography>,
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
            bgcolor: params.value >= 35 ? alpha('#10b981', 0.12) : params.value >= 28 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value >= 35 ? '#059669' : params.value >= 28 ? '#d97706' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'netMargin',
      headerName: 'Net Margin %',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={`${params.value.toFixed(0)}%`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value >= 25 ? alpha('#10b981', 0.12) : params.value >= 15 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value >= 25 ? '#059669' : params.value >= 15 ? '#d97706' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'avgOrderValue',
      headerName: 'Avg Order ($)',
      width: 120,
      type: 'number',
      valueFormatter: (params) => `$${(params.value / 1000).toFixed(0)}K`,
    },
    { field: 'dso', headerName: 'DSO (Days)', width: 100, type: 'number' },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => {
        const labels = { champion: 'Champion', loyal: 'Loyal', potential: 'Potential', atRisk: 'At Risk' };
        const colors = {
          champion: { bg: alpha('#10b981', 0.12), color: '#059669' },
          loyal: { bg: alpha('#1a5a9e', 0.12), color: '#1a5a9e' },
          potential: { bg: alpha('#06b6d4', 0.12), color: '#0891b2' },
          atRisk: { bg: alpha('#f97316', 0.12), color: '#ea580c' },
        };
        return (
          <Chip
            label={labels[params.value]}
            size="small"
            sx={{ fontWeight: 600, bgcolor: colors[params.value]?.bg, color: colors[params.value]?.color }}
          />
        );
      },
    },
    {
      field: 'yoyGrowth',
      headerName: 'YoY Growth',
      width: 110,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={`${params.value >= 0 ? '+' : ''}${params.value.toFixed(1)}%`}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value >= 0 ? alpha('#10b981', 0.12) : alpha('#ef4444', 0.12),
            color: params.value >= 0 ? '#059669' : '#dc2626',
          }}
        />
      ),
    },
  ];

  // Channel columns
  const channelColumns = [
    { field: 'channel', headerName: 'Channel', width: 120 },
    { field: 'subChannel', headerName: 'Sub-Channel', minWidth: 160, flex: 1 },
    {
      field: 'revenue',
      headerName: 'Revenue ($M)',
      width: 120,
      type: 'number',
      renderCell: (params) => <Typography sx={{ fontWeight: 600 }}>${params.value.toFixed(1)}</Typography>,
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
            bgcolor: params.value >= 40 ? alpha('#10b981', 0.12) : params.value >= 30 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value >= 40 ? '#059669' : params.value >= 30 ? '#d97706' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'netMargin',
      headerName: 'Net Margin %',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={`${params.value.toFixed(0)}%`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value >= 25 ? alpha('#10b981', 0.12) : params.value >= 15 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value >= 25 ? '#059669' : params.value >= 15 ? '#d97706' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'volumeShare',
      headerName: 'Volume Share %',
      width: 130,
      type: 'number',
      valueFormatter: (params) => `${params.value?.toFixed(1)}%`,
    },
    {
      field: 'priceIndex',
      headerName: 'Price Index',
      width: 110,
      type: 'number',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value >= 105 ? alpha('#10b981', 0.12) : params.value >= 95 ? alpha('#64748b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value >= 105 ? '#059669' : params.value >= 95 ? '#64748b' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'yoyGrowth',
      headerName: 'YoY Growth',
      width: 110,
      type: 'number',
      renderCell: (params) => (
        <Chip
          icon={params.value >= 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
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
  ];

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
            <Chip label={selectedRow.sku || selectedRow.segment || selectedRow.channel} size="small" sx={{ bgcolor: alpha('#64748b', 0.1) }} />
            {selectedRow.category && (
              <Chip label={selectedRow.category} size="small" color="info" />
            )}
          </Stack>
        </Stack>

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{selectedRow.product || selectedRow.segment || `${selectedRow.channel} - ${selectedRow.subChannel}`}</Typography>
        <Typography sx={{ color: '#64748b', mb: 3 }}>{selectedRow.packSize || `${selectedRow.customers} Customers` || ''}</Typography>

        {/* Key Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Revenue', value: `$${selectedRow.revenue?.toFixed(1)}M`, color: '#1a5a9e', icon: <MoneyIcon /> },
            { label: 'Gross Margin', value: `${selectedRow.grossMargin?.toFixed(0)}%`, color: selectedRow.grossMargin >= 35 ? '#10b981' : '#f59e0b', icon: <ProductIcon /> },
            { label: viewMode === 'products' ? 'Contrib. Margin' : 'Net Margin', value: `${(selectedRow.contributionMargin || selectedRow.netMargin)?.toFixed(0)}%`, color: '#8b5cf6', icon: <ChannelIcon /> },
            { label: 'YoY Growth', value: `${selectedRow.yoyGrowth >= 0 ? '+' : ''}${selectedRow.yoyGrowth?.toFixed(1)}%`, color: selectedRow.yoyGrowth >= 0 ? '#10b981' : '#ef4444', icon: <TrendingUpIcon /> },
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

        {/* 3-Column Detail (for products) */}
        {viewMode === 'products' && selectedRow.monthlyTrend && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
              <Card variant="outlined" sx={{ flex: 1 }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                    Monthly Revenue Trend
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    <Bar
                      data={{
                        labels: selectedRow.monthlyTrend.map(t => t.month),
                        datasets: [{
                          label: 'Revenue ($M)',
                          data: selectedRow.monthlyTrend.map(t => t.revenue),
                          backgroundColor: alpha('#1a5a9e', 0.7),
                          borderRadius: 4,
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } },
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
                    Channel Mix
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    <Doughnut
                      data={{
                        labels: selectedRow.channelMix.map(c => c.channel),
                        datasets: [{
                          data: selectedRow.channelMix.map(c => c.share),
                          backgroundColor: [alpha('#1a5a9e', 0.8), alpha('#10b981', 0.8), alpha('#f59e0b', 0.8), alpha('#8b5cf6', 0.8)],
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
                    COGS Breakdown
                  </Typography>
                  <Stack spacing={1.5}>
                    {selectedRow.cogsBreakdown.map((item, idx) => (
                      <Box key={idx}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography sx={{ fontSize: '0.8rem' }}>{item.component}</Typography>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>${item.amount.toFixed(1)}M ({item.pct}%)</Typography>
                        </Stack>
                        <Box sx={{ height: 6, bgcolor: alpha('#64748b', 0.1), borderRadius: 3 }}>
                          <Box sx={{ height: '100%', width: `${item.pct}%`, bgcolor: '#1a5a9e', borderRadius: 3 }} />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
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

  const currentData = viewMode === 'products' ? productData : viewMode === 'customers' ? customerData : channelData;
  const currentColumns = viewMode === 'products' ? productColumns : viewMode === 'customers' ? customerColumns : channelColumns;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {selectedRow ? (
        renderDetailView()
      ) : (
        <>
          {/* View Toggle */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, val) => val && setViewMode(val)}
              size="small"
            >
              <ToggleButton value="products" sx={{ px: 2 }}>
                <ProductIcon sx={{ mr: 1, fontSize: 18 }} /> Products
              </ToggleButton>
              <ToggleButton value="customers" sx={{ px: 2 }}>
                <PeopleIcon sx={{ mr: 1, fontSize: 18 }} /> Customers
              </ToggleButton>
              <ToggleButton value="channels" sx={{ px: 2 }}>
                <ChannelIcon sx={{ mr: 1, fontSize: 18 }} /> Channels
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {/* DataGrid */}
          <Box sx={{ flex: 1, minHeight: 400 }}>
            <DataGrid
              rows={currentData}
              columns={currentColumns}
              density="compact"
              checkboxSelection
              disableRowSelectionOnClick
              onRowClick={handleRowClick}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true } }}
              sx={margenTheme.getDataGridSx({ clickable: true })}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
              pageSizeOptions={[10, 25, 50]}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
