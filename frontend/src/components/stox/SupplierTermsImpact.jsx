import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha,
  Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, Tabs, Tab,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Handshake as HandshakeIcon,
  Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download,
  AttachMoney, TrendingUp, TrendingDown, AccountBalance, LocalShipping, Schedule, Info as InfoIcon,
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
import stoxTheme from './stoxTheme';
import DataSourceChip from './DataSourceChip';
import { getTileDataConfig } from './stoxDataConfig';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, ChartTooltip, Legend);

const formatCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

// Generate supplier terms data
const generateSupplierTermsData = () => {
  const suppliers = [
    { name: 'Acme Components', spend: 2800000, terms: 'Net 45', consignment: false, earlyDiscount: '2/10', category: 'Electronics' },
    { name: 'Global Metals Inc', spend: 2100000, terms: 'Net 30', consignment: true, earlyDiscount: null, category: 'Raw Materials' },
    { name: 'Pacific Plastics', spend: 1800000, terms: 'Net 60', consignment: false, earlyDiscount: '1.5/15', category: 'Components' },
    { name: 'Atlas Bearings', spend: 1500000, terms: 'Net 30', consignment: false, earlyDiscount: '2/10', category: 'MRO' },
    { name: 'Premier Fasteners', spend: 1200000, terms: 'Net 45', consignment: true, earlyDiscount: null, category: 'Components' },
    { name: 'Delta Electronics', spend: 950000, terms: 'Net 30', consignment: false, earlyDiscount: '2.5/10', category: 'Electronics' },
    { name: 'Allied Chemicals', spend: 850000, terms: 'Net 60', consignment: false, earlyDiscount: null, category: 'Raw Materials' },
    { name: 'Midwest Motors', spend: 720000, terms: 'Net 45', consignment: false, earlyDiscount: '1/10', category: 'Components' },
    { name: 'Eastern Logistics', spend: 580000, terms: 'Net 30', consignment: false, earlyDiscount: null, category: 'Services' },
    { name: 'Summit Packaging', spend: 420000, terms: 'Net 30', consignment: true, earlyDiscount: null, category: 'Packaging' },
  ];

  // Calculate WC impact for each supplier
  const supplierData = suppliers.map((sup, idx) => {
    const termsDays = parseInt(sup.terms.replace('Net ', ''));
    const avgInventoryDays = 25 + Math.random() * 15;
    const wcTied = (sup.spend / 365) * (avgInventoryDays - (sup.consignment ? termsDays : 0));

    // Calculate potential improvement scenarios
    const consignmentPotential = sup.consignment ? 0 : (sup.spend / 365) * termsDays * 0.4;
    const termsExtension = sup.terms !== 'Net 60' ? (sup.spend / 365) * 15 : 0;

    // Early payment discount analysis
    let discountValue = 0;
    let annualizedRate = 0;
    if (sup.earlyDiscount) {
      const [discount, days] = sup.earlyDiscount.split('/').map(Number);
      discountValue = sup.spend * (discount / 100);
      annualizedRate = (discount / (termsDays - days)) * 365;
    }

    return {
      id: idx + 1,
      supplier: sup.name,
      category: sup.category,
      annualSpend: sup.spend,
      terms: sup.terms,
      termsDays,
      isConsignment: sup.consignment,
      earlyDiscount: sup.earlyDiscount || 'None',
      avgInventoryDays: Math.round(avgInventoryDays),
      wcTied: Math.round(wcTied),
      consignmentPotential: Math.round(consignmentPotential),
      termsExtension: Math.round(termsExtension),
      discountValue: Math.round(discountValue),
      annualizedRate: Math.round(annualizedRate * 10) / 10,
      dpo: termsDays + Math.floor(Math.random() * 5),
      leadTime: 7 + Math.floor(Math.random() * 21),
      onTimeDelivery: (92 + Math.random() * 7).toFixed(1),
    };
  });

  // Summary metrics
  const totalSpend = supplierData.reduce((s, d) => s + d.annualSpend, 0);
  const totalWCTied = supplierData.reduce((s, d) => s + d.wcTied, 0);
  const consignmentCount = supplierData.filter(d => d.isConsignment).length;
  const consignmentSpend = supplierData.filter(d => d.isConsignment).reduce((s, d) => s + d.annualSpend, 0);
  const totalConsignmentPotential = supplierData.reduce((s, d) => s + d.consignmentPotential, 0);
  const totalTermsExtension = supplierData.reduce((s, d) => s + d.termsExtension, 0);
  const totalDiscountAvailable = supplierData.reduce((s, d) => s + d.discountValue, 0);

  // Terms breakdown
  const termsCounts = { 'Net 30': 0, 'Net 45': 0, 'Net 60': 0 };
  const termsSpend = { 'Net 30': 0, 'Net 45': 0, 'Net 60': 0 };
  supplierData.forEach(d => {
    termsCounts[d.terms]++;
    termsSpend[d.terms] += d.annualSpend;
  });

  // Category breakdown
  const categories = [...new Set(supplierData.map(d => d.category))];
  const categoryData = categories.map(cat => {
    const catSuppliers = supplierData.filter(d => d.category === cat);
    return {
      category: cat,
      spend: catSuppliers.reduce((s, d) => s + d.annualSpend, 0),
      wcTied: catSuppliers.reduce((s, d) => s + d.wcTied, 0),
      count: catSuppliers.length,
    };
  });

  return {
    suppliers: supplierData,
    summary: {
      totalSpend,
      totalWCTied,
      consignmentCount,
      consignmentSpend,
      consignmentRatio: Math.round((consignmentSpend / totalSpend) * 100),
      totalConsignmentPotential,
      totalTermsExtension,
      totalDiscountAvailable,
      avgDPO: Math.round(supplierData.reduce((s, d) => s + d.dpo, 0) / supplierData.length),
      supplierCount: supplierData.length,
    },
    termsCounts,
    termsSpend,
    categoryData,
  };
};

const SupplierTermsImpact = ({ onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Get tile data config for data source indicator
  const tileConfig = getTileDataConfig('supplier-terms-impact');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(generateSupplierTermsData());
      setLoading(false);
    }, 500);
  };

  if (loading || !data) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography>Loading Supplier Terms Analysis...</Typography>
      </Box>
    );
  }

  const filteredSuppliers = categoryFilter === 'all'
    ? data.suppliers
    : data.suppliers.filter(s => s.category === categoryFilter);

  // Terms distribution chart
  const termsChart = {
    labels: Object.keys(data.termsCounts),
    datasets: [{
      data: Object.values(data.termsSpend),
      backgroundColor: ['#2b88d8', '#10b981', '#f59e0b'],
      borderWidth: 0,
    }],
  };

  // Category WC chart
  const categoryChart = {
    labels: data.categoryData.map(c => c.category),
    datasets: [
      {
        label: 'WC Tied',
        data: data.categoryData.map(c => c.wcTied),
        backgroundColor: '#106ebe',
      },
    ],
  };

  // Improvement opportunities chart
  const opportunityChart = {
    labels: ['Consignment Conversion', 'Terms Extension', 'Early Pay Discount'],
    datasets: [{
      label: 'Potential Value',
      data: [data.summary.totalConsignmentPotential, data.summary.totalTermsExtension, data.summary.totalDiscountAvailable],
      backgroundColor: ['#10b981', '#2b88d8', '#f59e0b'],
    }],
  };

  const columns = [
    { field: 'supplier', headerName: 'Supplier', minWidth: 150, flex: 1.2 },
    { field: 'category', headerName: 'Category', minWidth: 100, flex: 0.8 },
    {
      field: 'annualSpend',
      headerName: 'Annual Spend',
      minWidth: 110,
      flex: 0.8,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => formatCurrency(params.value),
    },
    { field: 'terms', headerName: 'Terms', minWidth: 80, flex: 0.6, align: 'center', headerAlign: 'center' },
    {
      field: 'isConsignment',
      headerName: 'Consignment',
      minWidth: 100,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          size="small"
          sx={{
            bgcolor: params.value ? alpha('#10b981', 0.1) : alpha('#64748b', 0.1),
            color: params.value ? '#10b981' : '#64748b',
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      field: 'wcTied',
      headerName: 'WC Tied',
      minWidth: 100,
      flex: 0.7,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => formatCurrency(params.value),
    },
    {
      field: 'consignmentPotential',
      headerName: 'Consign. Opp.',
      minWidth: 110,
      flex: 0.8,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{ color: params.value > 0 ? '#10b981' : '#64748b', fontWeight: params.value > 0 ? 600 : 400 }}
        >
          {params.value > 0 ? formatCurrency(params.value) : '-'}
        </Typography>
      ),
    },
    { field: 'dpo', headerName: 'DPO', minWidth: 60, flex: 0.5, align: 'right', headerAlign: 'right' },
    {
      field: 'earlyDiscount',
      headerName: 'Early Pay',
      minWidth: 80,
      flex: 0.6,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.65rem',
            bgcolor: params.value !== 'None' ? alpha('#f59e0b', 0.1) : alpha('#64748b', 0.1),
            color: params.value !== 'None' ? '#f59e0b' : '#64748b',
          }}
        />
      ),
    },
    {
      field: 'onTimeDelivery',
      headerName: 'OTD %',
      minWidth: 70,
      flex: 0.5,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => `${params.value}%`,
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>CORE.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>Layer 4: Optimization</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Supplier Terms Impact</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <HandshakeIcon sx={{ fontSize: 32, color: '#106ebe' }} />
              <Typography variant="h4" fontWeight={700}>Supplier Terms Impact</Typography>
              <Chip label="Tile 4.4" size="small" sx={{ bgcolor: alpha('#106ebe', 0.1), color: '#106ebe', fontWeight: 600 }} />
              <DataSourceChip dataType={tileConfig.dataType} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Analyze payment terms impact on Working Capital
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh"><IconButton onClick={loadData} color="primary"><Refresh /></IconButton></Tooltip>
            <Tooltip title="Export"><IconButton color="primary"><Download /></IconButton></Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ borderLeft: '4px solid #106ebe' }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="caption" color="text.secondary">Total Spend</Typography>
                <Typography variant="h5" fontWeight={700}>{formatCurrency(data.summary.totalSpend)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ borderLeft: '4px solid #ef4444' }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="caption" color="text.secondary">WC Tied in AP</Typography>
                <Typography variant="h5" fontWeight={700} color="#ef4444">{formatCurrency(data.summary.totalWCTied)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ borderLeft: '4px solid #10b981' }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="caption" color="text.secondary">Consignment Opp.</Typography>
                <Typography variant="h5" fontWeight={700} color="#10b981">{formatCurrency(data.summary.totalConsignmentPotential)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ borderLeft: '4px solid #2b88d8' }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="caption" color="text.secondary">Terms Extension</Typography>
                <Typography variant="h5" fontWeight={700} color="#2b88d8">{formatCurrency(data.summary.totalTermsExtension)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ borderLeft: '4px solid #f59e0b' }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="caption" color="text.secondary">Early Pay Discounts</Typography>
                <Typography variant="h5" fontWeight={700} color="#f59e0b">{formatCurrency(data.summary.totalDiscountAvailable)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ borderLeft: '4px solid #0078d4' }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="caption" color="text.secondary">Avg DPO</Typography>
                <Typography variant="h5" fontWeight={700}>{data.summary.avgDPO} days</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Row */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: 260 }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Spend by Payment Terms</Typography>
                <Box sx={{ height: 190 }}>
                  <Doughnut
                    data={termsChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } },
                        tooltip: {
                          callbacks: { label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.raw)}` },
                        },
                      },
                      cutout: '55%',
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: 260 }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>WC Tied by Category</Typography>
                <Box sx={{ height: 190 }}>
                  <Bar
                    data={categoryChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      indexAxis: 'y',
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: { label: (ctx) => formatCurrency(ctx.raw) },
                        },
                      },
                      scales: {
                        x: { ticks: { callback: (v) => formatCurrency(v) } },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: 260 }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Improvement Opportunities</Typography>
                <Box sx={{ height: 190 }}>
                  <Bar
                    data={opportunityChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: { label: (ctx) => formatCurrency(ctx.raw) },
                        },
                      },
                      scales: {
                        y: { ticks: { callback: (v) => formatCurrency(v) } },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs and Data Grid */}
        <Paper sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, pb: 1 }}>
            <Tabs value={selectedTab} onChange={(e, v) => setSelectedTab(v)}>
              <Tab label="All Suppliers" sx={{ fontSize: '0.8rem' }} />
              <Tab label="Consignment Candidates" sx={{ fontSize: '0.8rem' }} />
              <Tab label="Early Pay Analysis" sx={{ fontSize: '0.8rem' }} />
            </Tabs>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Category</InputLabel>
              <Select value={categoryFilter} label="Category" onChange={(e) => setCategoryFilter(e.target.value)}>
                <MenuItem value="all">All Categories</MenuItem>
                {data.categoryData.map(c => (
                  <MenuItem key={c.category} value={c.category}>{c.category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Box sx={{ height: 350 }}>
            <DataGrid
              rows={
                selectedTab === 0 ? filteredSuppliers :
                selectedTab === 1 ? filteredSuppliers.filter(s => !s.isConsignment && s.consignmentPotential > 50000) :
                filteredSuppliers.filter(s => s.earlyDiscount !== 'None')
              }
              columns={columns}
              density="compact"
              disableRowSelectionOnClick
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } },
              }}
              sx={stoxTheme.getDataGridSx()}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
              }}
              pageSizeOptions={[10, 25, 50]}
            />
          </Box>
        </Paper>

        {/* Insights Card */}
        <Card sx={{ bgcolor: alpha('#106ebe', 0.03) }}>
          <CardContent sx={{ py: 1.5 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <InfoIcon sx={{ color: '#106ebe', fontSize: 18 }} />
              <Typography variant="subtitle2" fontWeight={700}>Key Insights</Typography>
            </Stack>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  <strong>{data.summary.consignmentRatio}%</strong> of spend is already on consignment terms, freeing ${formatCurrency(data.summary.consignmentSpend * 0.12)} in annual carrying costs.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  Converting top 3 non-consignment suppliers could release <strong>{formatCurrency(data.summary.totalConsignmentPotential)}</strong> in Working Capital.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                  Early payment discounts offer <strong>{formatCurrency(data.summary.totalDiscountAvailable)}</strong> in savings, but verify against your cost of capital.
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default SupplierTermsImpact;
