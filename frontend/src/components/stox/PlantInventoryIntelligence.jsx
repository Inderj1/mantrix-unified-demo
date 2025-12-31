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
  Divider,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Factory as FactoryIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  CheckCircle,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as AttachMoneyIcon,
  Assessment as AssessmentIcon,
  LocalShipping as LocalShippingIcon,
  Speed as SpeedIcon,
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

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, ChartTooltip, Legend, Filler);

// Format currency
const formatCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

// Generate mock plant data
const generatePlantData = () => {
  const plants = [
    { id: 'P1000', name: 'Chicago Manufacturing Hub', desc: 'S/4HANA 2023 - Primary Manufacturing - North America Region' },
    { id: 'P2000', name: 'Detroit Assembly Center', desc: 'S/4HANA 2023 - Assembly Operations - Great Lakes Region' },
    { id: 'P3000', name: 'Phoenix Distribution', desc: 'ECC 6.0 - Distribution Center - Southwest Region' },
    { id: 'P4000', name: 'Atlanta Regional DC', desc: 'S/4HANA 2022 - Regional Distribution - Southeast Region' },
  ];

  const statuses = ['healthy', 'attention', 'critical', 'healthy'];

  return plants.map((plant, idx) => {
    const status = statuses[idx];
    const isHealthy = status === 'healthy';
    const isCritical = status === 'critical';

    const inventoryValue = isHealthy ? 6000000 + Math.random() * 8000000 : isCritical ? 8000000 + Math.random() * 2000000 : 15000000 + Math.random() * 5000000;
    const skuCount = Math.floor(1000 + Math.random() * 2500);
    const gmroi = isHealthy ? 3 + Math.random() * 2 : isCritical ? 1 + Math.random() * 0.5 : 1.8 + Math.random() * 0.5;
    const turns = isHealthy ? 6 + Math.random() * 4 : isCritical ? 1.5 + Math.random() * 1 : 3 + Math.random() * 2;
    const daysCoverage = isHealthy ? 35 + Math.random() * 25 : isCritical ? 150 + Math.random() * 50 : 70 + Math.random() * 30;
    const fillRate = isHealthy ? 95 + Math.random() * 4 : isCritical ? 80 + Math.random() * 8 : 88 + Math.random() * 5;

    const deadStock = inventoryValue * (isHealthy ? 0.02 : isCritical ? 0.24 : 0.08);
    const slowStock = inventoryValue * (isHealthy ? 0.07 : isCritical ? 0.20 : 0.15);
    const excessStock = inventoryValue * (isHealthy ? 0.08 : isCritical ? 0.22 : 0.17);
    const blockedStock = inventoryValue * (isHealthy ? 0.01 : isCritical ? 0.05 : 0.03);
    const qiStock = inventoryValue * (isHealthy ? 0.02 : isCritical ? 0.04 : 0.05);
    const grirOpen = inventoryValue * (isHealthy ? 0.03 : isCritical ? 0.08 : 0.06);

    return {
      id: plant.id,
      name: plant.name,
      desc: plant.desc,
      status,
      statusText: isHealthy ? 'Healthy' : isCritical ? 'Critical' : 'Attention',
      inventoryValue,
      skuCount,
      gmroi,
      turns,
      daysCoverage,
      fillRate,
      deadStock,
      slowStock,
      excessStock,
      blockedStock,
      qiStock,
      grirOpen,
      deadSkus: Math.floor(skuCount * (isHealthy ? 0.05 : isCritical ? 0.22 : 0.08)),
      slowSkus: Math.floor(skuCount * (isHealthy ? 0.11 : isCritical ? 0.21 : 0.15)),
      excessSkus: Math.floor(skuCount * (isHealthy ? 0.03 : isCritical ? 0.11 : 0.05)),
      blockedSkus: Math.floor(skuCount * 0.02),
      qiSkus: Math.floor(skuCount * 0.02),
      grirPos: Math.floor(20 + Math.random() * 130),
      healthyPct: isHealthy ? 78 : isCritical ? 25 : 52,
      slowPct: isHealthy ? 9 : isCritical ? 20 : 15,
      deadPct: isHealthy ? 3 : isCritical ? 24 : 8,
      excessPct: isHealthy ? 10 : isCritical ? 31 : 25,
      // Detail data
      carryingCost: inventoryValue * 0.15,
      workingCapital: inventoryValue * 0.7,
      stockoutEvents: isHealthy ? Math.floor(5 + Math.random() * 10) : isCritical ? Math.floor(50 + Math.random() * 30) : Math.floor(20 + Math.random() * 20),
      stockoutCost: isHealthy ? 50000 + Math.random() * 80000 : isCritical ? 600000 + Math.random() * 400000 : 200000 + Math.random() * 300000,
      cash2cashDays: isHealthy ? 30 + Math.random() * 20 : isCritical ? 90 + Math.random() * 40 : 55 + Math.random() * 20,
      cogs: inventoryValue * (4 + Math.random() * 3),
      grossMargin: inventoryValue * (1.5 + Math.random() * 1.5),
      obsoleteCost: deadStock * 0.3,
      // ABC/XYZ matrix
      abcMatrix: {
        AX: { count: Math.floor(50 + Math.random() * 100), value: inventoryValue * 0.35 },
        AY: { count: Math.floor(40 + Math.random() * 60), value: inventoryValue * 0.22 },
        AZ: { count: Math.floor(20 + Math.random() * 30), value: inventoryValue * 0.13 },
        BX: { count: Math.floor(80 + Math.random() * 100), value: inventoryValue * 0.11 },
        BY: { count: Math.floor(100 + Math.random() * 120), value: inventoryValue * 0.09 },
        BZ: { count: Math.floor(50 + Math.random() * 50), value: inventoryValue * 0.05 },
        CX: { count: Math.floor(200 + Math.random() * 300), value: inventoryValue * 0.03 },
        CY: { count: Math.floor(400 + Math.random() * 500), value: inventoryValue * 0.02 },
        CZ: { count: Math.floor(500 + Math.random() * 500), value: inventoryValue * 0.01 },
      },
      // Trend data (6 months)
      trend: isHealthy
        ? [14.2, 13.8, 13.2, 12.9, 12.6, inventoryValue / 1000000]
        : isCritical
        ? [6.8, 7.2, 7.9, 8.4, 8.7, inventoryValue / 1000000]
        : [15.2, 16.1, 17.2, 17.8, 18.4, inventoryValue / 1000000],
      alerts: isHealthy
        ? [
            { type: 'success', text: 'MRP Run Complete' },
            { type: 'info', text: 'Stock Count Due: Dec 5' },
            { type: 'warning', text: '3 Vendors Late' },
          ]
        : isCritical
        ? [
            { type: 'critical', text: 'Dead Stock > 24%' },
            { type: 'critical', text: 'GMROI < 1.5x' },
            { type: 'critical', text: '67 Active Stockouts' },
            { type: 'warning', text: 'Turns Below Target' },
          ]
        : [
            { type: 'critical', text: 'GR/IR > $1M Uncleared' },
            { type: 'critical', text: 'Dead Stock > 7%' },
            { type: 'warning', text: '45 SKUs Below ROP' },
          ],
    };
  });
};

const PlantInventoryIntelligence = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState(null);

  // Fetch data
  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(generatePlantData());
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRowClick = (params) => {
    setSelectedPlant(params.row);
  };

  const handleBackToList = () => {
    setSelectedPlant(null);
  };

  // Summary stats
  const summaryStats = {
    totalInventory: data.reduce((sum, d) => sum + d.inventoryValue, 0),
    totalSkus: data.reduce((sum, d) => sum + d.skuCount, 0),
    avgGmroi: data.length > 0 ? data.reduce((sum, d) => sum + d.gmroi, 0) / data.length : 0,
    slobInventory: data.reduce((sum, d) => sum + d.deadStock + d.slowStock, 0),
    deadStock: data.reduce((sum, d) => sum + d.deadStock, 0),
    grirOpen: data.reduce((sum, d) => sum + d.grirOpen, 0),
    avgFillRate: data.length > 0 ? data.reduce((sum, d) => sum + d.fillRate, 0) / data.length : 0,
  };

  // DataGrid columns - matching DemandIntelligence/ForecastingEngine pattern
  const columns = [
    { field: 'id', headerName: 'Plant ID', minWidth: 100, flex: 0.8 },
    { field: 'name', headerName: 'Plant Name', minWidth: 180, flex: 1.4 },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.row.statusText}
          size="small"
          color={params.value === 'healthy' ? 'success' : params.value === 'attention' ? 'warning' : 'error'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'inventoryValue',
      headerName: 'Inventory $',
      minWidth: 120,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={formatCurrency(params.value)}
          size="small"
          sx={{ fontWeight: 700, bgcolor: alpha('#2b88d8', 0.12), color: '#106ebe' }}
        />
      ),
    },
    {
      field: 'skuCount',
      headerName: 'SKUs',
      minWidth: 90,
      flex: 0.7,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'gmroi',
      headerName: 'GMROI',
      minWidth: 100,
      flex: 0.7,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value.toFixed(1)}x`}
          size="small"
          color={params.value >= 3 ? 'success' : params.value >= 2 ? 'warning' : 'error'}
          sx={{ fontWeight: 700 }}
        />
      ),
    },
    {
      field: 'turns',
      headerName: 'Turns',
      minWidth: 90,
      flex: 0.7,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value.toFixed(1)}
          size="small"
          color={params.value >= 6 ? 'success' : params.value >= 4 ? 'warning' : 'error'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'daysCoverage',
      headerName: 'Days Cov',
      minWidth: 100,
      flex: 0.7,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={Math.round(params.value)}
          size="small"
          color={params.value <= 60 ? 'success' : params.value <= 90 ? 'warning' : 'error'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'deadStock',
      headerName: 'Dead $',
      minWidth: 110,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const pct = (params.value / params.row.inventoryValue) * 100;
        return (
          <Chip
            label={formatCurrency(params.value)}
            size="small"
            color={pct <= 3 ? 'success' : pct <= 8 ? 'warning' : 'error'}
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
    {
      field: 'slowStock',
      headerName: 'Slow $',
      minWidth: 110,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const pct = (params.value / params.row.inventoryValue) * 100;
        return (
          <Chip
            label={formatCurrency(params.value)}
            size="small"
            color={pct <= 10 ? 'success' : pct <= 15 ? 'warning' : 'error'}
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
    {
      field: 'excessStock',
      headerName: 'Excess $',
      minWidth: 110,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const pct = (params.value / params.row.inventoryValue) * 100;
        return (
          <Chip
            label={formatCurrency(params.value)}
            size="small"
            color={pct <= 10 ? 'success' : pct <= 18 ? 'warning' : 'error'}
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
    {
      field: 'fillRate',
      headerName: 'Fill Rate',
      minWidth: 110,
      flex: 0.8,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value.toFixed(1)}%`}
          size="small"
          color={params.value >= 95 ? 'success' : params.value >= 90 ? 'warning' : 'error'}
          sx={{ fontWeight: 700 }}
        />
      ),
    },
  ];

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: { color: '#64748b', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: {
          color: '#64748b',
          font: { size: 10 },
          callback: (v) => `$${v}M`,
        },
      },
    },
  };

  // Render Detail View
  const renderDetailView = () => {
    if (!selectedPlant) return null;

    const isHealthy = selectedPlant.status === 'healthy';
    const isCritical = selectedPlant.status === 'critical';
    const statusColor = isHealthy ? '#10b981' : isCritical ? '#ef4444' : '#f59e0b';

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Header with Back Button */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList} variant="outlined" size="small">
            Back to Dashboard
          </Button>
          <Stack direction="row" spacing={1}>
            <Chip label={selectedPlant.id} size="small" sx={{ bgcolor: alpha('#64748b', 0.1), fontWeight: 700 }} />
            <Chip
              icon={isHealthy ? <CheckCircle sx={{ fontSize: 14 }} /> : isCritical ? <ErrorIcon sx={{ fontSize: 14 }} /> : <WarningIcon sx={{ fontSize: 14 }} />}
              label={selectedPlant.statusText}
              size="small"
              sx={{
                fontWeight: 600,
                bgcolor: alpha(statusColor, 0.12),
                color: statusColor,
              }}
            />
          </Stack>
        </Stack>

        {/* Plant Title */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{selectedPlant.name}</Typography>
        <Typography sx={{ color: '#64748b', mb: 3 }}>{selectedPlant.desc}</Typography>

        {/* Financial Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Total Inventory', value: formatCurrency(selectedPlant.inventoryValue), sub: `${selectedPlant.skuCount.toLocaleString()} SKUs`, color: '#06b6d4', icon: <InventoryIcon /> },
            { label: 'GMROI', value: `${selectedPlant.gmroi.toFixed(1)}x`, sub: isHealthy ? '0.4 vs LY' : isCritical ? '-0.8 vs LY' : '-0.3 vs LY', color: isHealthy ? '#10b981' : isCritical ? '#ef4444' : '#f59e0b', icon: <TrendingUpIcon /> },
            { label: 'Carrying Cost / Yr', value: formatCurrency(selectedPlant.carryingCost), sub: '15% of inventory', color: '#f59e0b', icon: <AttachMoneyIcon /> },
            { label: 'Working Capital', value: formatCurrency(selectedPlant.workingCapital), sub: isHealthy ? '$1.1M freed' : '$2.4M tied', color: isHealthy ? '#10b981' : '#f59e0b', icon: <AssessmentIcon /> },
          ].map((stat, idx) => (
            <Grid item xs={6} sm={3} key={idx}>
              <Card variant="outlined">
                <CardContent sx={{ py: 2, px: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                  <Box sx={{ color: stat.color, mb: 1 }}>{stat.icon}</Box>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color }}>{stat.value}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: '#64748b', mt: 0.5 }}>{stat.sub}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Inventory Health Breakdown */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <AssessmentIcon sx={{ color: '#0891b2' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                Inventory Health Breakdown
              </Typography>
              <Chip label="MARD / MSEG / MC50" size="small" sx={{ ml: 'auto', fontSize: '0.6rem', height: 20, bgcolor: alpha('#06b6d4', 0.1), color: '#0891b2' }} />
            </Stack>
            <Grid container spacing={2}>
              {[
                { label: 'Dead Stock', value: formatCurrency(selectedPlant.deadStock), skus: `${selectedPlant.deadSkus} SKUs`, pct: `${((selectedPlant.deadStock / selectedPlant.inventoryValue) * 100).toFixed(1)}% - No mvmt 12mo+`, color: '#ef4444' },
                { label: 'Slow Moving', value: formatCurrency(selectedPlant.slowStock), skus: `${selectedPlant.slowSkus} SKUs`, pct: `${((selectedPlant.slowStock / selectedPlant.inventoryValue) * 100).toFixed(1)}% - < 2 turns/yr`, color: '#f59e0b' },
                { label: 'Excess Stock', value: formatCurrency(selectedPlant.excessStock), skus: `${selectedPlant.excessSkus} SKUs`, pct: `${((selectedPlant.excessStock / selectedPlant.inventoryValue) * 100).toFixed(1)}% - > 180 days cover`, color: '#a855f7' },
                { label: 'Blocked Stock', value: formatCurrency(selectedPlant.blockedStock), skus: `${selectedPlant.blockedSkus} SKUs`, pct: `${((selectedPlant.blockedStock / selectedPlant.inventoryValue) * 100).toFixed(1)}% - On hold`, color: '#64748b' },
                { label: 'Quality Inspection', value: formatCurrency(selectedPlant.qiStock), skus: `${selectedPlant.qiSkus} SKUs`, pct: `${((selectedPlant.qiStock / selectedPlant.inventoryValue) * 100).toFixed(1)}% - Pending QC`, color: '#06b6d4' },
                { label: 'GR/IR Open', value: formatCurrency(selectedPlant.grirOpen), skus: `${selectedPlant.grirPos} POs`, pct: 'Uncleared balance', color: '#f59e0b' },
              ].map((item, idx) => (
                <Grid item xs={6} sm={4} md={2} key={idx}>
                  <Box sx={{ p: 1.5, bgcolor: alpha(item.color, 0.05), borderRadius: 1, borderLeft: `3px solid ${item.color}` }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>{item.label}</Typography>
                      <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>{item.skus}</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{item.value}</Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>{item.pct}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Charts + ABC Matrix */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Trend Chart */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Inventory Value Trend (6 Mo)
                </Typography>
                <Box sx={{ height: 180 }}>
                  <Line
                    data={{
                      labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
                      datasets: [{
                        data: selectedPlant.trend,
                        borderColor: statusColor,
                        backgroundColor: alpha(statusColor, 0.1),
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: statusColor,
                      }],
                    }}
                    options={chartOptions}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* ABC/XYZ Matrix */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  ABC/XYZ Segmentation Matrix
                </Typography>
                <Grid container spacing={1}>
                  {/* Header Row */}
                  <Grid item xs={3}><Box sx={{ textAlign: 'center', py: 1 }} /></Grid>
                  {['X', 'Y', 'Z'].map((col) => (
                    <Grid item xs={3} key={col}>
                      <Typography sx={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{col}</Typography>
                    </Grid>
                  ))}
                  {/* Matrix Rows */}
                  {['A', 'B', 'C'].map((row) => (
                    <React.Fragment key={row}>
                      <Grid item xs={3}>
                        <Typography sx={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', py: 2 }}>{row}</Typography>
                      </Grid>
                      {['X', 'Y', 'Z'].map((col) => {
                        const key = `${row}${col}`;
                        const cell = selectedPlant.abcMatrix[key];
                        const cellColors = {
                          AX: '#10b981', AY: '#06b6d4', AZ: '#f59e0b',
                          BX: '#06b6d4', BY: '#f59e0b', BZ: '#f59e0b',
                          CX: '#f59e0b', CY: '#ef4444', CZ: '#ef4444',
                        };
                        return (
                          <Grid item xs={3} key={key}>
                            <Box sx={{ textAlign: 'center', py: 1.5, px: 1, bgcolor: alpha(cellColors[key], 0.1), borderRadius: 1 }}>
                              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: cellColors[key] }}>{cell.count}</Typography>
                              <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>{formatCurrency(cell.value)}</Typography>
                            </Box>
                          </Grid>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Performance KPIs */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <SpeedIcon sx={{ color: '#0891b2' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Performance KPIs
                  </Typography>
                  <Chip label="MVER / VBAP / LIPS" size="small" sx={{ ml: 'auto', fontSize: '0.6rem', height: 20, bgcolor: alpha('#06b6d4', 0.1), color: '#0891b2' }} />
                </Stack>
                <Grid container spacing={2}>
                  {[
                    { label: 'Inventory Turns', value: selectedPlant.turns.toFixed(1), delta: isHealthy ? '+0.5 vs LY' : isCritical ? '-1.4 vs LY' : '-0.8 vs LY', color: selectedPlant.turns >= 6 ? '#10b981' : selectedPlant.turns >= 4 ? '#f59e0b' : '#ef4444' },
                    { label: 'Days of Coverage', value: Math.round(selectedPlant.daysCoverage), delta: isHealthy ? '-8 days' : isCritical ? '+56 days' : '+15 days', color: selectedPlant.daysCoverage <= 60 ? '#10b981' : selectedPlant.daysCoverage <= 90 ? '#f59e0b' : '#ef4444' },
                    { label: 'Fill Rate', value: `${selectedPlant.fillRate.toFixed(1)}%`, delta: isHealthy ? '+1.8%' : isCritical ? '-8.5%' : '-3.2%', color: selectedPlant.fillRate >= 95 ? '#10b981' : selectedPlant.fillRate >= 90 ? '#f59e0b' : '#ef4444' },
                    { label: 'Stockout Events', value: selectedPlant.stockoutEvents, delta: isHealthy ? '-5 vs LM' : isCritical ? '+34 vs LM' : '+12 vs LM', color: selectedPlant.stockoutEvents <= 15 ? '#10b981' : selectedPlant.stockoutEvents <= 30 ? '#f59e0b' : '#ef4444' },
                    { label: 'Stockout Cost YTD', value: formatCurrency(selectedPlant.stockoutCost), delta: isHealthy ? '-$48K' : isCritical ? '+$445K' : '+$156K', color: selectedPlant.stockoutCost <= 100000 ? '#10b981' : selectedPlant.stockoutCost <= 300000 ? '#f59e0b' : '#ef4444' },
                    { label: 'Cash-to-Cash Days', value: Math.round(selectedPlant.cash2cashDays), delta: isHealthy ? '-6 days' : isCritical ? '+38 days' : '+12 days', color: selectedPlant.cash2cashDays <= 45 ? '#10b981' : selectedPlant.cash2cashDays <= 70 ? '#f59e0b' : '#ef4444' },
                  ].map((kpi, idx) => (
                    <Grid item xs={6} sm={4} md={2} key={idx}>
                      <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: alpha('#64748b', 0.03), borderRadius: 1 }}>
                        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: kpi.color }}>{kpi.value}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>{kpi.label}</Typography>
                        <Typography sx={{ fontSize: '0.6rem', color: kpi.delta.startsWith('+') ? '#ef4444' : '#10b981', mt: 0.5 }}>{kpi.delta}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* P&L Impact */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Inventory P&L Impact
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: alpha('#10b981', 0.08), borderRadius: 1 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>COGS (Inventory Sold)</Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>{formatCurrency(selectedPlant.cogs)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: alpha('#ef4444', 0.08), borderRadius: 1 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Carrying Cost</Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444' }}>-{formatCurrency(selectedPlant.carryingCost)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: alpha('#ef4444', 0.08), borderRadius: 1 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Stockout Cost</Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444' }}>-{formatCurrency(selectedPlant.stockoutCost)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: alpha('#ef4444', 0.08), borderRadius: 1 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Obsolescence Write-off</Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444' }}>-{formatCurrency(selectedPlant.obsoleteCost)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: alpha('#06b6d4', 0.1), borderRadius: 1, border: '1px solid', borderColor: alpha('#06b6d4', 0.3) }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Gross Margin</Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#06b6d4' }}>{formatCurrency(selectedPlant.grossMargin)}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Alerts */}
        <Card variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
              Active Alerts & Actions
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {selectedPlant.alerts.map((alert, idx) => (
                <Chip
                  key={idx}
                  label={alert.text}
                  size="small"
                  sx={{
                    fontWeight: 500,
                    bgcolor: alert.type === 'success' ? alpha('#10b981', 0.12) :
                             alert.type === 'info' ? alpha('#06b6d4', 0.12) :
                             alert.type === 'warning' ? alpha('#f59e0b', 0.12) :
                             alpha('#ef4444', 0.12),
                    color: alert.type === 'success' ? '#059669' :
                           alert.type === 'info' ? '#0891b2' :
                           alert.type === 'warning' ? '#d97706' :
                           '#dc2626',
                    border: '1px solid',
                    borderColor: alert.type === 'success' ? alpha('#10b981', 0.3) :
                                 alert.type === 'info' ? alpha('#06b6d4', 0.3) :
                                 alert.type === 'warning' ? alpha('#f59e0b', 0.3) :
                                 alpha('#ef4444', 0.3),
                  }}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  };

  // Main render
  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>
              CORE.AI
            </Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>
              STOX.AI
            </Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>
              Layer 1: Foundation
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              {selectedPlant ? `${selectedPlant.name}` : 'Plant Inventory Intelligence'}
            </Typography>
          </Breadcrumbs>
          {!selectedPlant && (
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh">
                <IconButton onClick={fetchData} color="primary"><Refresh /></IconButton>
              </Tooltip>
              <Tooltip title="Export">
                <IconButton color="primary"><Download /></IconButton>
              </Tooltip>
            </Stack>
          )}
        </Stack>

        {/* Summary Cards - Only show in list view */}
        {!selectedPlant && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Total Inventory', value: formatCurrency(summaryStats.totalInventory), sub: `${summaryStats.totalSkus.toLocaleString()} SKUs - 4 Plants`, color: '#06b6d4', icon: <InventoryIcon /> },
              { label: 'Avg GMROI', value: `${summaryStats.avgGmroi.toFixed(1)}x`, sub: '+0.3 vs prior year', color: '#10b981', icon: <TrendingUpIcon /> },
              { label: 'SLOB Inventory', value: formatCurrency(summaryStats.slobInventory), sub: `${((summaryStats.slobInventory / summaryStats.totalInventory) * 100).toFixed(0)}% of total`, color: '#f59e0b', icon: <WarningIcon /> },
              { label: 'Dead Stock', value: formatCurrency(summaryStats.deadStock), sub: `${Math.floor(summaryStats.deadStock / 4500)} SKUs`, color: '#ef4444', icon: <ErrorIcon /> },
              { label: 'GR/IR Open', value: formatCurrency(summaryStats.grirOpen), sub: 'Uncleared', color: '#f59e0b', icon: <LocalShippingIcon /> },
              { label: 'Fill Rate', value: `${summaryStats.avgFillRate.toFixed(1)}%`, sub: '+1.2% vs target', color: '#10b981', icon: <CheckCircle /> },
            ].map((stat, idx) => (
              <Grid item xs={6} sm={4} md={2} key={idx}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid ${stat.color}` }}>
                  <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <Box sx={{ color: stat.color, display: 'flex' }}>{stat.icon}</Box>
                      <Typography sx={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e293b' }}>{stat.value}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>{stat.sub}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Content */}
      {selectedPlant ? (
        renderDetailView()
      ) : (
        <Paper elevation={0} variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: alpha('#64748b', 0.2), background: `linear-gradient(90deg, ${alpha('#0284c7', 0.05)}, ${alpha('#64748b', 0.02)})` }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#0078d4' }}>
                Plant Inventory Summary — <Typography component="span" sx={{ color: '#0891b2' }}>Click to Drill Down</Typography>
              </Typography>
              <Chip label="MARC / MARD / MBEW / MSEG / EKBE / MVER" size="small" sx={{ fontSize: '0.6rem', bgcolor: alpha('#06b6d4', 0.1), color: '#0891b2' }} />
            </Stack>
          </Box>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <DataGrid
              rows={data}
              columns={columns}
              loading={loading}
              density="compact"
              onRowClick={handleRowClick}
              disableRowSelectionOnClick
              checkboxSelection
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              sx={stoxTheme.getDataGridSx({ clickable: true })}
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default PlantInventoryIntelligence;
