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
  Tune as TuneIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  FilterList as FilterListIcon,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  AutoFixHigh,
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
import stoxTheme from './stoxTheme';
import DataSourceChip from './DataSourceChip';
import { getTileDataConfig } from './stoxDataConfig';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, ChartTooltip, Legend);

const formatCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

// Generate EOQ Cost Curve data
const generateEOQCurveData = (annualDemand, orderingCost, unitCost, holdingRate) => {
  const holdingCostPerUnit = unitCost * holdingRate;
  const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCostPerUnit);

  // Generate points from 0.2x EOQ to 3x EOQ
  const minQ = Math.max(10, Math.floor(eoq * 0.2));
  const maxQ = Math.ceil(eoq * 3);
  const step = Math.max(1, Math.floor((maxQ - minQ) / 20));

  const quantities = [];
  const orderingCosts = [];
  const holdingCosts = [];
  const totalCosts = [];

  for (let q = minQ; q <= maxQ; q += step) {
    quantities.push(q);
    const ordCost = (annualDemand / q) * orderingCost;
    const holdCost = (q / 2) * holdingCostPerUnit;
    orderingCosts.push(ordCost);
    holdingCosts.push(holdCost);
    totalCosts.push(ordCost + holdCost);
  }

  // Add the EOQ point if not already included
  if (!quantities.includes(Math.round(eoq))) {
    const eoqOrdCost = (annualDemand / eoq) * orderingCost;
    const eoqHoldCost = (eoq / 2) * holdingCostPerUnit;
    quantities.push(Math.round(eoq));
    orderingCosts.push(eoqOrdCost);
    holdingCosts.push(eoqHoldCost);
    totalCosts.push(eoqOrdCost + eoqHoldCost);
  }

  // Sort by quantity
  const sortedIndices = quantities.map((_, i) => i).sort((a, b) => quantities[a] - quantities[b]);

  return {
    eoq: Math.round(eoq),
    minTotalCost: Math.round((annualDemand / eoq) * orderingCost + (eoq / 2) * holdingCostPerUnit),
    quantities: sortedIndices.map(i => quantities[i]),
    orderingCosts: sortedIndices.map(i => Math.round(orderingCosts[i])),
    holdingCosts: sortedIndices.map(i => Math.round(holdingCosts[i])),
    totalCosts: sortedIndices.map(i => Math.round(totalCosts[i])),
  };
};

// Generate mock MRP parameter data
const generateMRPData = () => {
  const materials = [
    { id: 'MAT-001', name: 'Hydraulic Pump', mrpType: 'PD' },
    { id: 'MAT-002', name: 'Bearing Assembly', mrpType: 'VB' },
    { id: 'MAT-003', name: 'Control Module', mrpType: 'PD' },
    { id: 'MAT-004', name: 'Valve Kit', mrpType: 'V1' },
    { id: 'MAT-005', name: 'Gasket Set', mrpType: 'VB' },
    { id: 'MAT-006', name: 'Sensor Array', mrpType: 'PD' },
    { id: 'MAT-007', name: 'Motor Drive', mrpType: 'PD' },
    { id: 'MAT-008', name: 'Filter Element', mrpType: 'V1' },
    { id: 'MAT-009', name: 'Seal Kit', mrpType: 'VB' },
    { id: 'MAT-010', name: 'Coupling Assembly', mrpType: 'PD' },
    { id: 'MAT-011', name: 'Shaft Bearing', mrpType: 'VB' },
    { id: 'MAT-012', name: 'Pressure Gauge', mrpType: 'V1' },
  ];

  const lotSizes = ['EX', 'FX', 'WB', 'MB', 'TB', 'HB'];
  const abcOptions = ['A', 'B', 'C'];

  return materials.map((mat, idx) => {
    const currentSS = Math.floor(100 + Math.random() * 400);
    const optimalSS = Math.floor(currentSS * (0.7 + Math.random() * 0.6));
    const ssDiff = currentSS - optimalSS;
    const ssOptimization = ssDiff > 0 ? 'Reduce' : ssDiff < -50 ? 'Increase' : 'Optimal';

    const currentROP = Math.floor(200 + Math.random() * 500);
    const optimalROP = Math.floor(currentROP * (0.8 + Math.random() * 0.4));
    const ropDiff = currentROP - optimalROP;

    const currentLotSize = lotSizes[idx % 6];
    const optimalLotSize = lotSizes[(idx + 2) % 6];

    const serviceLevel = (92 + Math.random() * 7).toFixed(1);
    const fillRate = (90 + Math.random() * 9).toFixed(1);
    const stockoutRisk = ssOptimization === 'Reduce' ? 'Low' : ssOptimization === 'Increase' ? 'High' : 'Medium';

    const savingsPotential = Math.abs(ssDiff) * (5 + Math.random() * 15);

    // EOQ-related fields for cost curve analysis
    const annualDemand = Math.floor(5000 + Math.random() * 45000); // 5K-50K units/year
    const unitCost = Math.floor(20 + Math.random() * 180); // $20-$200 per unit
    const orderingCostPerPO = Math.floor(75 + Math.random() * 75); // $75-$150 per PO
    const holdingRate = 0.18 + Math.random() * 0.08; // 18-26% carrying rate
    const currentOrderQty = Math.floor(300 + Math.random() * 700); // Current order quantity

    return {
      id: mat.id,
      material: mat.name,
      mrpType: mat.mrpType,
      abc: abcOptions[idx % 3],
      currentSS,
      optimalSS,
      ssDiff,
      ssOptimization,
      currentROP,
      optimalROP,
      ropDiff,
      currentLotSize,
      optimalLotSize,
      lotSizeChange: currentLotSize !== optimalLotSize,
      serviceLevel: parseFloat(serviceLevel),
      fillRate: parseFloat(fillRate),
      stockoutRisk,
      savingsPotential: Math.floor(savingsPotential),
      leadTime: Math.floor(5 + Math.random() * 25),
      demandVariability: (10 + Math.random() * 40).toFixed(1),
      supplyVariability: (5 + Math.random() * 25).toFixed(1),
      reviewCycle: Math.floor(7 + Math.random() * 21),
      lastOptimized: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      // EOQ fields
      annualDemand,
      unitCost,
      orderingCostPerPO,
      holdingRate,
      currentOrderQty,
    };
  });
};

const MRPParameterOptimizer = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({
    ssOptimization: 'all',
    stockoutRisk: 'all',
    mrpType: 'all',
  });

  // Get tile data config for data source indicator
  const tileConfig = getTileDataConfig('mrp-parameter-optimizer');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const mrpData = generateMRPData();
      setData(mrpData);

      const totalItems = mrpData.length;
      const reduceCount = mrpData.filter(d => d.ssOptimization === 'Reduce').length;
      const increaseCount = mrpData.filter(d => d.ssOptimization === 'Increase').length;
      const optimalCount = mrpData.filter(d => d.ssOptimization === 'Optimal').length;
      const highRiskCount = mrpData.filter(d => d.stockoutRisk === 'High').length;
      const totalSavings = mrpData.reduce((sum, d) => sum + d.savingsPotential, 0);
      const avgServiceLevel = mrpData.reduce((sum, d) => sum + d.serviceLevel, 0) / totalItems;

      setMetrics({
        totalItems,
        reduceCount,
        increaseCount,
        optimalCount,
        highRiskCount,
        totalSavings,
        avgServiceLevel: avgServiceLevel.toFixed(1),
      });
      setLoading(false);
    }, 500);
  };

  const filteredData = data.filter(row => {
    if (filters.ssOptimization !== 'all' && row.ssOptimization !== filters.ssOptimization) return false;
    if (filters.stockoutRisk !== 'all' && row.stockoutRisk !== filters.stockoutRisk) return false;
    if (filters.mrpType !== 'all' && row.mrpType !== filters.mrpType) return false;
    return true;
  });

  const columns = [
    { field: 'id', headerName: 'Material ID', minWidth: 110, flex: 0.8 },
    { field: 'material', headerName: 'Material', minWidth: 150, flex: 1.2 },
    { field: 'mrpType', headerName: 'MRP Type', minWidth: 90, flex: 0.6, align: 'center', headerAlign: 'center' },
    { field: 'abc', headerName: 'ABC', minWidth: 70, flex: 0.5, align: 'center', headerAlign: 'center' },
    {
      field: 'currentSS',
      headerName: 'Current SS',
      minWidth: 100,
      flex: 0.7,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'optimalSS',
      headerName: 'Optimal SS',
      minWidth: 100,
      flex: 0.7,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'ssOptimization',
      headerName: 'SS Action',
      minWidth: 110,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Optimal' ? 'success' : params.value === 'Reduce' ? 'info' : 'warning'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'currentROP',
      headerName: 'Current ROP',
      minWidth: 100,
      flex: 0.7,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'optimalROP',
      headerName: 'Optimal ROP',
      minWidth: 100,
      flex: 0.7,
      align: 'right',
      headerAlign: 'right',
    },
    {
      field: 'stockoutRisk',
      headerName: 'Risk',
      minWidth: 90,
      flex: 0.6,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Low' ? 'success' : params.value === 'Medium' ? 'warning' : 'error'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'serviceLevel',
      headerName: 'SL %',
      minWidth: 80,
      flex: 0.6,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => `${params.value}%`,
    },
    {
      field: 'savingsPotential',
      headerName: 'Savings',
      minWidth: 100,
      flex: 0.7,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => formatCurrency(params.value),
    },
  ];

  const handleRowClick = (params) => {
    setSelectedItem(params.row);
  };

  const renderDetailView = () => {
    if (!selectedItem) return null;

    // Generate EOQ curve data
    const eoquCurveData = generateEOQCurveData(
      selectedItem.annualDemand,
      selectedItem.orderingCostPerPO,
      selectedItem.unitCost,
      selectedItem.holdingRate
    );

    // EOQ Chart data for visualization
    const eoqChartData = {
      labels: eoquCurveData.quantities,
      datasets: [
        {
          label: 'Total Cost',
          data: eoquCurveData.totalCosts,
          borderColor: '#106ebe',
          backgroundColor: 'rgba(8, 84, 160, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Ordering Cost',
          data: eoquCurveData.orderingCosts,
          borderColor: '#ef4444',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.4,
        },
        {
          label: 'Holding Cost',
          data: eoquCurveData.holdingCosts,
          borderColor: '#10b981',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.4,
        },
      ],
    };

    const comparisonData = {
      labels: ['Safety Stock', 'Reorder Point'],
      datasets: [
        {
          label: 'Current',
          data: [selectedItem.currentSS, selectedItem.currentROP],
          backgroundColor: '#64748b',
        },
        {
          label: 'Optimal',
          data: [selectedItem.optimalSS, selectedItem.optimalROP],
          backgroundColor: '#10b981',
        },
      ],
    };

    const variabilityData = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
      datasets: [
        {
          label: 'Demand Variability',
          data: Array.from({ length: 6 }, () => parseFloat(selectedItem.demandVariability) * (0.7 + Math.random() * 0.6)),
          borderColor: '#0891b2',
          backgroundColor: 'rgba(8, 145, 178, 0.1)',
          fill: true,
        },
        {
          label: 'Supply Variability',
          data: Array.from({ length: 6 }, () => parseFloat(selectedItem.supplyVariability) * (0.7 + Math.random() * 0.6)),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
        },
      ],
    };

    return (
      <Box>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => setSelectedItem(null)}
            variant="outlined"
            size="small"
          >
            Back to List
          </Button>
          <Typography variant="h6" fontWeight={700}>
            {selectedItem.material} - MRP Optimization
          </Typography>
          <Chip
            label={selectedItem.ssOptimization}
            size="small"
            color={selectedItem.ssOptimization === 'Optimal' ? 'success' : selectedItem.ssOptimization === 'Reduce' ? 'info' : 'warning'}
          />
        </Box>

        <Grid container spacing={2}>
          {/* Summary Cards */}
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #64748b' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Current Safety Stock</Typography>
                <Typography variant="h5" fontWeight={700}>{selectedItem.currentSS}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #10b981' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Optimal Safety Stock</Typography>
                <Typography variant="h5" fontWeight={700} color="success.main">{selectedItem.optimalSS}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #0891b2' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Service Level</Typography>
                <Typography variant="h5" fontWeight={700}>{selectedItem.serviceLevel}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ borderLeft: '4px solid #16a34a' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">Potential Savings</Typography>
                <Typography variant="h5" fontWeight={700} color="success.main">{formatCurrency(selectedItem.savingsPotential)}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Current vs Optimal Comparison */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Current vs Optimal Parameters</Typography>
                <Box sx={{ height: 250 }}>
                  <Bar
                    data={comparisonData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'top' } },
                      scales: { y: { beginAtZero: true } },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Variability Trend */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Demand & Supply Variability</Typography>
                <Box sx={{ height: 250 }}>
                  <Line
                    data={variabilityData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'top' } },
                      scales: { y: { beginAtZero: true, title: { display: true, text: 'CV %' } } },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* EOQ Cost Curve - Full Width */}
          <Grid item xs={12}>
            <Card sx={{ borderTop: '3px solid #106ebe' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>EOQ Cost Curve Analysis</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Cost = Ordering Cost + Holding Cost | EOQ = √(2DK/H)
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={2}>
                    <Chip
                      label={`EOQ: ${eoquCurveData.eoq} units`}
                      size="small"
                      sx={{ bgcolor: alpha('#106ebe', 0.1), color: '#106ebe', fontWeight: 700 }}
                    />
                    <Chip
                      label={`Current: ${selectedItem.currentOrderQty} units`}
                      size="small"
                      sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', fontWeight: 700 }}
                    />
                    <Chip
                      label={`Min Cost: ${formatCurrency(eoquCurveData.minTotalCost)}/yr`}
                      size="small"
                      sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 700 }}
                    />
                  </Stack>
                </Stack>
                <Box sx={{ height: 300 }}>
                  <Line
                    data={eoqChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        mode: 'index',
                        intersect: false,
                      },
                      plugins: {
                        legend: { position: 'top' },
                        tooltip: {
                          callbacks: {
                            label: (context) => `${context.dataset.label}: ${formatCurrency(context.raw)}`,
                          },
                        },
                      },
                      scales: {
                        x: {
                          title: { display: true, text: 'Order Quantity (units)' },
                        },
                        y: {
                          beginAtZero: true,
                          title: { display: true, text: 'Annual Cost ($)' },
                          ticks: {
                            callback: (value) => formatCurrency(value),
                          },
                        },
                      },
                    }}
                  />
                </Box>
                {/* EOQ Parameters Summary */}
                <Grid container spacing={2} sx={{ mt: 1, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Annual Demand (D)</Typography>
                    <Typography variant="body2" fontWeight={600}>{selectedItem.annualDemand.toLocaleString()} units</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Ordering Cost (K)</Typography>
                    <Typography variant="body2" fontWeight={600}>${selectedItem.orderingCostPerPO}/order</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Unit Cost</Typography>
                    <Typography variant="body2" fontWeight={600}>${selectedItem.unitCost}/unit</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Holding Rate (H)</Typography>
                    <Typography variant="body2" fontWeight={600}>{(selectedItem.holdingRate * 100).toFixed(1)}%</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* MRP Parameters Detail */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>MRP Parameters</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">MRP Type</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.mrpType}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">ABC Class</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.abc}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Current Lot Size</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.currentLotSize}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Optimal Lot Size</Typography>
                    <Typography variant="body1" fontWeight={600} color={selectedItem.lotSizeChange ? 'warning.main' : 'inherit'}>
                      {selectedItem.optimalLotSize}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Lead Time</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.leadTime} days</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Review Cycle</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.reviewCycle} days</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Risk & Performance */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>Risk & Performance</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Stockout Risk</Typography>
                    <Chip
                      label={selectedItem.stockoutRisk}
                      size="small"
                      color={selectedItem.stockoutRisk === 'Low' ? 'success' : selectedItem.stockoutRisk === 'Medium' ? 'warning' : 'error'}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Fill Rate</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.fillRate}%</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Demand CV</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.demandVariability}%</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Supply CV</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.supplyVariability}%</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Last Optimized</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedItem.lastOptimized}</Typography>
                  </Grid>
                </Grid>
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
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>CORE.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>Layer 4: Optimization</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>MRP Parameter Optimizer</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small" sx={{ borderColor: 'divider' }}>
            Back
          </Button>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <TuneIcon sx={{ fontSize: 32, color: '#005a9e' }} />
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="h5" fontWeight={700} color="#005a9e">
                MRP Parameter Optimizer
              </Typography>
              <DataSourceChip dataType={tileConfig.dataType} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Optimize safety stock, reorder points, and lot sizes using AI recommendations
            </Typography>
          </Box>
        </Stack>
      </Box>

      {selectedItem ? (
        renderDetailView()
      ) : (
        <>
          {/* Summary Cards */}
          {metrics && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #005a9e' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Total Items</Typography>
                    <Typography variant="h5" fontWeight={700}>{metrics.totalItems}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #0891b2' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Reduce SS</Typography>
                    <Typography variant="h5" fontWeight={700} color="info.main">{metrics.reduceCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #f59e0b' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Increase SS</Typography>
                    <Typography variant="h5" fontWeight={700} color="warning.main">{metrics.increaseCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #10b981' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Optimal</Typography>
                    <Typography variant="h5" fontWeight={700} color="success.main">{metrics.optimalCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ borderLeft: '4px solid #ef4444' }}>
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">High Risk</Typography>
                    <Typography variant="h5" fontWeight={700} color="error.main">{metrics.highRiskCount}</Typography>
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
                <InputLabel>SS Action</InputLabel>
                <Select value={filters.ssOptimization} label="SS Action" onChange={(e) => setFilters({ ...filters, ssOptimization: e.target.value })}>
                  <MenuItem value="all">All Actions</MenuItem>
                  <MenuItem value="Reduce">Reduce</MenuItem>
                  <MenuItem value="Increase">Increase</MenuItem>
                  <MenuItem value="Optimal">Optimal</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Risk Level</InputLabel>
                <Select value={filters.stockoutRisk} label="Risk Level" onChange={(e) => setFilters({ ...filters, stockoutRisk: e.target.value })}>
                  <MenuItem value="all">All Levels</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>MRP Type</InputLabel>
                <Select value={filters.mrpType} label="MRP Type" onChange={(e) => setFilters({ ...filters, mrpType: e.target.value })}>
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="PD">PD</MenuItem>
                  <MenuItem value="VB">VB</MenuItem>
                  <MenuItem value="V1">V1</MenuItem>
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

export default MRPParameterOptimizer;
