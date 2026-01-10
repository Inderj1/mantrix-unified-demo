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
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Schedule as ScheduleIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  FilterList as FilterListIcon,
  LocalShipping as LocalShippingIcon,
} from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import stoxTheme from './stoxTheme';
import DataSourceChip from './DataSourceChip';
import { getTileDataConfig } from './stoxDataConfig';
import { LAM_PLANTS, LAM_VENDORS, LAM_MATERIALS, LAM_MATERIAL_PLANT_DATA, getMaterialById, getPlantName } from '../../data/arizonaBeveragesMasterData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, ChartTooltip, Legend, Filler);

// Generate lead time data using Lam Research data
const generateLeadTimeData = () => {
  // Build materials from LAM_MATERIAL_PLANT_DATA with vendor assignments
  const materials = LAM_MATERIAL_PLANT_DATA.slice(0, 12).map((plantData, idx) => {
    const baseMaterial = getMaterialById(plantData.materialId);
    const vendor = LAM_VENDORS[idx % LAM_VENDORS.length];
    return {
      id: plantData.materialId,
      name: baseMaterial ? baseMaterial.name : plantData.materialId,
      plant: plantData.plant,
      vendor: vendor.id,
      vendorName: vendor.name,
      baseLeadTime: plantData.leadTime,
    };
  });

  const reliabilityOptions = ['Excellent', 'Good', 'Fair', 'Poor'];

  return materials.map((mat, idx) => {
    // Use real lead time as PLT base
    const pltDays = mat.baseLeadTime || Math.floor(10 + Math.random() * 25);
    const gapDays = Math.floor(-5 + Math.random() * 15); // Variance from planned
    const rltDays = pltDays + gapDays;
    const otd = Math.floor(70 + Math.random() * 28); // OTD % 70-98
    const qtyVar = Math.floor(1 + Math.random() * 15);
    const reliability = reliabilityOptions[idx % 4];

    const ssAdj = gapDays > 5 ? `+${Math.floor(gapDays * 3)}%` : gapDays < -2 ? `${Math.floor(gapDays * 2)}%` : '0%';

    return {
      id: mat.id,
      material: mat.name,
      plant: mat.plant,
      plantName: getPlantName(mat.plant),
      vendor: mat.vendor,
      vendorName: mat.vendorName,
      rlt: rltDays,
      plt: pltDays,
      gap: gapDays,
      reliability,
      otd,
      qtyVar,
      ssAdj,
      // Detail data
      avgRlt: rltDays,
      minRlt: rltDays - Math.floor(3 + Math.random() * 5),
      maxRlt: rltDays + Math.floor(5 + Math.random() * 10),
      stdDev: (2 + Math.random() * 4).toFixed(1),
      p50: rltDays - 1,
      p90: rltDays + Math.floor(5 + Math.random() * 8),
      ordersAnalyzed: Math.floor(50 + Math.random() * 150),
      earlyDeliveries: Math.floor(5 + Math.random() * 20),
      onTimeDeliveries: Math.floor(30 + Math.random() * 80),
      lateDeliveries: Math.floor(5 + Math.random() * 30),
      partialDeliveries: Math.floor(2 + Math.random() * 10),
      currentSS: Math.floor(100 + Math.random() * 300),
      recommendedSS: Math.floor(120 + Math.random() * 350),
      // Distribution data
      distribution: Array.from({ length: 7 }, () => Math.floor(5 + Math.random() * 25)),
      trendData: Array.from({ length: 6 }, () => pltDays + Math.floor(-8 + Math.random() * 16)),
    };
  });
};

const generateDetailData = (id, data) => {
  const sku = data.find(d => d.id === id);
  if (!sku) return null;
  return sku;
};

const SupplyLeadTime = ({ onBack, onTileClick }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [selectedSku, setSelectedSku] = useState(null);
  const [filters, setFilters] = useState({
    reliability: 'all',
    plant: 'all',
    vendor: 'all',
  });

  // Get tile data config for data source indicator
  const tileConfig = getTileDataConfig('supply-lead-time');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const ltData = generateLeadTimeData();
      setData(ltData);

      const avgGap = ltData.reduce((sum, d) => sum + d.gap, 0) / ltData.length;
      const avgOtd = ltData.reduce((sum, d) => sum + d.otd, 0) / ltData.length;
      const avgQtyVar = ltData.reduce((sum, d) => sum + d.qtyVar, 0) / ltData.length;
      const partialCount = ltData.filter(d => d.qtyVar > 10).length;
      const vendorCount = [...new Set(ltData.map(d => d.vendor))].length;

      setMetrics({
        avgGap: avgGap.toFixed(1),
        avgOtd: avgOtd.toFixed(1),
        avgQtyVar: avgQtyVar.toFixed(1),
        partialCount,
        vendorCount,
      });

      setLoading(false);
    }, 800);
  };

  const handleRowClick = (params) => {
    const detailData = generateDetailData(params.row.id, data);
    setSelectedSku(detailData);
  };

  const handleBackToList = () => {
    setSelectedSku(null);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const filteredData = data.filter(row => {
    if (filters.reliability !== 'all' && row.reliability !== filters.reliability) return false;
    if (filters.plant !== 'all' && row.plant !== filters.plant) return false;
    if (filters.vendor !== 'all' && row.vendor !== filters.vendor) return false;
    return true;
  });

  const uniquePlants = [...new Set(data.map(d => d.plant))];
  const uniqueVendors = [...new Set(data.map(d => d.vendor))];

  // DataGrid columns - matching DemandIntelligence/ForecastingEngine pattern
  const columns = [
    { field: 'id', headerName: 'Material ID', minWidth: 120, flex: 1 },
    { field: 'material', headerName: 'Material', minWidth: 150, flex: 1.2 },
    { field: 'plant', headerName: 'Plant', minWidth: 100, flex: 0.8, align: 'center', headerAlign: 'center' },
    { field: 'vendor', headerName: 'Vendor', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    {
      field: 'rlt',
      headerName: 'RLT (Actual)',
      minWidth: 110,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip label={`${params.value} days`} size="small" sx={{ fontWeight: 600 }} />
      ),
    },
    {
      field: 'plt',
      headerName: 'PLT (Planned)',
      minWidth: 110,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip label={`${params.value} days`} size="small" sx={{ fontWeight: 600, bgcolor: alpha('#64748b', 0.1) }} />
      ),
    },
    {
      field: 'gap',
      headerName: 'Gap',
      minWidth: 90,
      flex: 0.7,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value > 0 ? `+${params.value}d` : params.value < 0 ? `${params.value}d` : '0d'}
          size="small"
          color={params.value <= 0 ? 'success' : params.value <= 5 ? 'warning' : 'error'}
          sx={{ fontWeight: 700 }}
        />
      ),
    },
    {
      field: 'reliability',
      headerName: 'Reliability',
      minWidth: 110,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Excellent' ? 'success' : params.value === 'Good' ? 'info' : params.value === 'Fair' ? 'warning' : 'error'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'otd',
      headerName: 'OTD %',
      minWidth: 100,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          color={params.value >= 95 ? 'success' : params.value >= 85 ? 'warning' : 'error'}
          sx={{ fontWeight: 700 }}
        />
      ),
    },
    {
      field: 'qtyVar',
      headerName: 'Qty Var %',
      minWidth: 100,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          color={params.value <= 5 ? 'success' : params.value <= 10 ? 'warning' : 'error'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'ssAdj',
      headerName: 'SS Adj',
      minWidth: 90,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const val = params.value;
        const isPositive = val.startsWith('+') && val !== '+0%';
        const isNegative = val.startsWith('-');
        return (
          <Chip
            label={val}
            size="small"
            color={isNegative ? 'success' : isPositive ? 'error' : 'default'}
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
  ];

  // Render Detail View
  const renderDetailView = () => {
    if (!selectedSku) return null;

    const isGood = selectedSku.reliability === 'Excellent' || selectedSku.reliability === 'Good';

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList} variant="outlined" size="small" sx={{ mb: 2 }}>
          Back to List
        </Button>

        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <LocalShippingIcon sx={{ fontSize: 40, color: '#06b6d4' }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>{selectedSku.id} | {selectedSku.plant}</Typography>
            <Typography color="text.secondary">{selectedSku.material} - {selectedSku.vendor}</Typography>
          </Box>
          <Chip
            label={selectedSku.reliability}
            color={selectedSku.reliability === 'Excellent' ? 'success' : selectedSku.reliability === 'Good' ? 'info' : selectedSku.reliability === 'Fair' ? 'warning' : 'error'}
            sx={{ ml: 'auto', fontWeight: 600 }}
          />
        </Stack>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Lead Time Stats */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Lead Time Analysis
                  </Typography>
                  <Chip label="EKBE" size="small" sx={{ fontSize: '0.6rem', height: 20, bgcolor: alpha('#06b6d4', 0.1), color: '#0891b2' }} />
                </Stack>
                {[
                  { label: 'Average RLT', value: `${selectedSku.avgRlt} days` },
                  { label: 'Min RLT', value: `${selectedSku.minRlt} days` },
                  { label: 'Max RLT', value: `${selectedSku.maxRlt} days` },
                  { label: 'Std Deviation', value: `${selectedSku.stdDev} days` },
                  { label: 'P50 (Median)', value: `${selectedSku.p50} days` },
                  { label: 'P90 (90th %ile)', value: `${selectedSku.p90} days`, highlight: true },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 5 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.1) }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: item.highlight ? '#06b6d4' : '#1e293b' }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Delivery Performance */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Delivery Performance
                  </Typography>
                  <Chip label="ME2M" size="small" sx={{ fontSize: '0.6rem', height: 20, bgcolor: alpha('#06b6d4', 0.1), color: '#0891b2' }} />
                </Stack>
                {[
                  { label: 'Orders Analyzed', value: selectedSku.ordersAnalyzed },
                  { label: 'Early Deliveries', value: selectedSku.earlyDeliveries, color: '#10b981' },
                  { label: 'On-Time Deliveries', value: selectedSku.onTimeDeliveries, color: '#10b981' },
                  { label: 'Late Deliveries', value: selectedSku.lateDeliveries, color: '#ef4444' },
                  { label: 'Partial Deliveries', value: selectedSku.partialDeliveries, color: '#f59e0b' },
                  { label: 'OTD Rate', value: `${selectedSku.otd}%`, bold: true, color: selectedSku.otd >= 90 ? '#10b981' : '#ef4444' },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 5 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.1) }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: item.bold ? 600 : 400 }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: item.bold ? 700 : 600, color: item.color || '#1e293b' }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Safety Stock Impact */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Safety Stock Impact
                  </Typography>
                  <Chip label="MARC" size="small" sx={{ fontSize: '0.6rem', height: 20, bgcolor: alpha('#06b6d4', 0.1), color: '#0891b2' }} />
                </Stack>
                {[
                  { label: 'Current Safety Stock', value: `${selectedSku.currentSS} EA` },
                  { label: 'Recommended SS', value: `${selectedSku.recommendedSS} EA`, highlight: true },
                  { label: 'Delta', value: `${selectedSku.recommendedSS - selectedSku.currentSS > 0 ? '+' : ''}${selectedSku.recommendedSS - selectedSku.currentSS} EA`, color: selectedSku.recommendedSS > selectedSku.currentSS ? '#ef4444' : '#10b981' },
                  { label: 'RLT Gap', value: `${selectedSku.gap > 0 ? '+' : ''}${selectedSku.gap} days`, color: selectedSku.gap > 0 ? '#ef4444' : '#10b981' },
                  { label: 'SS Adjustment', value: selectedSku.ssAdj, color: selectedSku.ssAdj.startsWith('+') ? '#ef4444' : '#10b981' },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 4 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.1) }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: item.highlight ? 700 : 600, color: item.color || (item.highlight ? '#06b6d4' : '#1e293b') }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Lead Time Distribution
                </Typography>
                <Box sx={{ height: 200 }}>
                  <Bar
                    data={{
                      labels: ['<10d', '10-15d', '15-20d', '20-25d', '25-30d', '30-35d', '>35d'],
                      datasets: [{
                        data: selectedSku.distribution,
                        backgroundColor: alpha('#06b6d4', 0.6),
                        borderColor: '#06b6d4',
                        borderWidth: 1,
                        borderRadius: 4,
                      }],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
                        y: { grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { color: '#64748b', font: { size: 10 } } },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  RLT Trend (6 Months)
                </Typography>
                <Box sx={{ height: 200 }}>
                  <Line
                    data={{
                      labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
                      datasets: [
                        {
                          label: 'Actual RLT',
                          data: selectedSku.trendData,
                          borderColor: '#06b6d4',
                          backgroundColor: alpha('#06b6d4', 0.1),
                          fill: true,
                          tension: 0.4,
                        },
                        {
                          label: 'Planned LT',
                          data: Array(6).fill(selectedSku.plt),
                          borderColor: '#64748b',
                          borderDash: [5, 5],
                          fill: false,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } },
                      scales: {
                        x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
                        y: { grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { color: '#64748b', font: { size: 10 } } },
                      },
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
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={() => selectedSku ? setSelectedSku(null) : onBack()} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>Layer 1: Foundation</Link>
            {selectedSku ? (
              <>
                <Link component="button" variant="body1" onClick={() => setSelectedSku(null)} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>Supply & Lead Time</Link>
                <Typography color="primary" variant="body1" fontWeight={600}>{selectedSku.id} Detail</Typography>
              </>
            ) : (
              <Typography color="primary" variant="body1" fontWeight={600}>Supply & Lead Time</Typography>
            )}
          </Breadcrumbs>
          {!selectedSku && (
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh"><IconButton onClick={fetchData} color="primary"><Refresh /></IconButton></Tooltip>
              <Tooltip title="Export"><IconButton color="primary"><Download /></IconButton></Tooltip>
            </Stack>
          )}
        </Stack>

        {!selectedSku && (
          <>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <ScheduleIcon sx={{ fontSize: 40, color: '#06b6d4' }} />
              <Typography variant="h5" fontWeight={600}>Supply & Lead Time Analytics</Typography>
              <DataSourceChip dataType={tileConfig.dataType} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Analyze vendor lead times, delivery reliability, and safety stock recommendations
            </Typography>
          </>
        )}
      </Box>

      {selectedSku ? (
        renderDetailView()
      ) : (
        <>
          {/* Summary Cards */}
          {metrics && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #f59e0b` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Avg RLT Gap</Typography>
                    <Typography variant="h4" fontWeight={700} color="#d97706">+{metrics.avgGap}d</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #10b981` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>On-Time Delivery</Typography>
                    <Typography variant="h4" fontWeight={700} color="#059669">{metrics.avgOtd}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #f59e0b` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Qty Variance</Typography>
                    <Typography variant="h4" fontWeight={700} color="#d97706">{metrics.avgQtyVar}%</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #ef4444` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Partial Deliveries</Typography>
                    <Typography variant="h4" fontWeight={700} color="#dc2626">{metrics.partialCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #06b6d4` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Active Vendors</Typography>
                    <Typography variant="h4" fontWeight={700} color="#0891b2">{metrics.vendorCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <FilterListIcon sx={{ color: '#64748b' }} />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Reliability</InputLabel>
              <Select value={filters.reliability} label="Reliability" onChange={(e) => handleFilterChange('reliability', e.target.value)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="Excellent">Excellent</MenuItem>
                <MenuItem value="Good">Good</MenuItem>
                <MenuItem value="Fair">Fair</MenuItem>
                <MenuItem value="Poor">Poor</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Plant</InputLabel>
              <Select value={filters.plant} label="Plant" onChange={(e) => handleFilterChange('plant', e.target.value)}>
                <MenuItem value="all">All Plants</MenuItem>
                {uniquePlants.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Vendor</InputLabel>
              <Select value={filters.vendor} label="Vendor" onChange={(e) => handleFilterChange('vendor', e.target.value)}>
                <MenuItem value="all">All Vendors</MenuItem>
                {uniqueVendors.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </Select>
            </FormControl>
            <Typography sx={{ ml: 'auto', fontSize: '0.8rem', color: '#64748b' }}>
              Showing {filteredData.length} of {data.length} items
            </Typography>
          </Paper>

          {/* DataGrid */}
          <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, width: '100%' }}>
            <DataGrid
              rows={filteredData}
              columns={columns}
              loading={loading}
              density="compact"
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              checkboxSelection
              disableRowSelectionOnClick
              onRowClick={handleRowClick}
              sx={stoxTheme.getDataGridSx({ clickable: true })}
            />
          </Paper>
        </>
      )}
    </Box>
  );
};

export default SupplyLeadTime;
