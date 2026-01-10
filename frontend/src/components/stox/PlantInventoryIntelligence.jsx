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
import DataSourceChip from './DataSourceChip';
import { getTileDataConfig } from './stoxDataConfig';
import { LAM_PLANTS, LAM_MATERIAL_PLANT_DATA, getMaterialById, getMaterialsByPlant, calculatePlantSummary, formatCurrency as lamFormatCurrency, formatCurrencyUSD, CURRENCY_RATES } from '../../data/arizonaBeveragesMasterData';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, ChartTooltip, Legend, Filler);

// Format currency - uses USD for consolidated dashboard views
const formatCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

// Format currency with local currency for plant-specific views
const formatLocalCurrency = (value, currency) => {
  return lamFormatCurrency(value, currency);
};

// Generate plant data using ACTUAL Lam Research data
const generatePlantData = () => {
  const plantDescriptions = {
    '1000': 'S/4HANA 2023 - Primary Manufacturing - Americas HQ',
    '2000': 'S/4HANA 2023 - Assembly Operations - Pacific Northwest',
    '3000': 'S/4HANA 2022 - Manufacturing Hub - South Korea',
    '4000': 'S/4HANA 2022 - Manufacturing Hub - Taiwan',
    '5000': 'S/4HANA 2021 - European Operations - Austria',
  };

  return LAM_PLANTS.map((plant) => {
    // Get ACTUAL plant materials from source data
    const plantMaterials = getMaterialsByPlant(plant.id);
    const summary = calculatePlantSummary(plant.id);

    // Calculate ACTUAL inventory value from materials
    let inventoryValue = 0;
    let excessStock = 0;
    let deadStock = 0;
    let slowStock = 0;
    let qiStock = 0;
    let blockedStock = 0;

    // ABC/XYZ matrix from actual data
    const abcMatrix = {
      AX: { count: 0, value: 0 }, AY: { count: 0, value: 0 }, AZ: { count: 0, value: 0 },
      BX: { count: 0, value: 0 }, BY: { count: 0, value: 0 }, BZ: { count: 0, value: 0 },
      CX: { count: 0, value: 0 }, CY: { count: 0, value: 0 }, CZ: { count: 0, value: 0 },
    };

    let totalFillRate = 0;
    let deadSkuCount = 0;
    let slowSkuCount = 0;
    let excessSkuCount = 0;

    let totalGrirValue = 0;
    let totalStockoutCost = 0;

    plantMaterials.forEach(matData => {
      const material = getMaterialById(matData.materialId);
      if (!material) return;

      const materialValue = matData.totalStock * material.basePrice;
      inventoryValue += materialValue;

      // Excess stock from actual data
      excessStock += matData.excessStock || 0;

      // Dead stock: DOS > 365 days (no movement in 12+ months)
      if (matData.dos > 365) {
        deadStock += materialValue;
        deadSkuCount++;
      }
      // Slow moving: DOS > 180 days (< 2 turns/year)
      else if (matData.dos > 180 || matData.turns < 2) {
        slowStock += materialValue;
        slowSkuCount++;
      }

      // Excess SKU count: excessStock > 0
      if (matData.excessStock > 0) {
        excessSkuCount++;
      }

      // QI stock - use actual qiStock from source data
      if (matData.qiStock > 0) {
        qiStock += matData.qiStock * material.basePrice;
      }

      // Blocked stock - use actual blockedStock from source data
      if (matData.blockedStock > 0) {
        blockedStock += matData.blockedStock * material.basePrice;
      }

      // GR/IR value from source data
      totalGrirValue += matData.grirValue || 0;

      // Stockout cost from source data
      totalStockoutCost += (matData.stockouts || 0) * (matData.stockoutCostPerEvent || 0);

      totalFillRate += matData.fillRate;

      // Populate ABC/XYZ matrix
      const key = `${matData.abc}${matData.xyz}`;
      if (abcMatrix[key]) {
        abcMatrix[key].count++;
        abcMatrix[key].value += materialValue;
      }
    });

    const skuCount = plantMaterials.length;
    const avgFillRate = skuCount > 0 ? totalFillRate / skuCount : 95;
    const turns = parseFloat(summary.avgTurns) || 3;
    const daysCoverage = summary.avgDOS || 90;

    // Determine status based on actual metrics
    const hasHighExcess = excessStock > inventoryValue * 0.15;
    const hasLowTurns = turns < 3;
    const hasLowFillRate = avgFillRate < 93;
    const status = (hasHighExcess && hasLowTurns) ? 'critical'
                 : (hasHighExcess || hasLowTurns || hasLowFillRate) ? 'attention'
                 : 'healthy';
    const isHealthy = status === 'healthy';
    const isCritical = status === 'critical';

    // Calculate GMROI using actual formula:
    // GMROI = Gross Margin $ Return / Average Inventory Cost
    // GMROI = (Annual Sales × Gross Margin %) / Average Inventory
    // Simplified: GMROI = Inventory Turns × Gross Margin %
    // For better accuracy: GMROI = (COGS × GM% / (1-GM%)) / Inventory = Turns × GM% / (1-GM%)
    const grossMargin = plant.grossMarginPct || 0.38;
    const gmroi = turns > 0 ? (turns * grossMargin / (1 - grossMargin)) : 0;

    // Use actual GR/IR value from source data
    const grirOpen = totalGrirValue;

    return {
      id: plant.id,
      name: `${plant.name} (${plant.country})`,
      desc: plantDescriptions[plant.id] || `${plant.city}, ${plant.country}`,
      region: plant.region,
      currency: plant.currency,
      status,
      statusText: isHealthy ? 'Healthy' : isCritical ? 'Critical' : 'Attention',
      inventoryValue,
      skuCount,
      gmroi,
      turns,
      daysCoverage,
      fillRate: avgFillRate,
      deadStock,
      slowStock,
      excessStock,
      blockedStock,
      qiStock,
      grirOpen,
      deadSkus: deadSkuCount,
      slowSkus: slowSkuCount,
      excessSkus: excessSkuCount,
      blockedSkus: Math.ceil(skuCount * 0.05),
      qiSkus: Math.ceil(skuCount * 0.08),
      grirPos: Math.floor(15 + skuCount * 2),
      healthyPct: Math.round((1 - (deadStock + slowStock + excessStock) / inventoryValue) * 100),
      slowPct: Math.round((slowStock / inventoryValue) * 100),
      deadPct: Math.round((deadStock / inventoryValue) * 100),
      excessPct: Math.round((excessStock / inventoryValue) * 100),
      // Detail data - using actual plant financial metrics
      carryingCost: inventoryValue * (plant.carryingCostPct || 0.20),
      // Working Capital tied up in inventory operations:
      // Daily Revenue = Annual Revenue / 365
      // Daily COGS = (Annual Revenue × (1 - Gross Margin %)) / 365
      // Receivables = Daily Revenue × DSO
      // Payables = Daily COGS × DPO
      // Net Working Capital = Inventory + Receivables - Payables
      dso: plant.dso || 45,
      dpo: plant.dpo || 55,
      dailyRevenue: (plant.annualRevenue || 0) / 365,
      dailyCogs: ((plant.annualRevenue || 0) * (1 - (plant.grossMarginPct || 0.38))) / 365,
      receivables: ((plant.annualRevenue || 0) / 365) * (plant.dso || 45),
      payables: (((plant.annualRevenue || 0) * (1 - (plant.grossMarginPct || 0.38))) / 365) * (plant.dpo || 55),
      workingCapital: inventoryValue +
        (((plant.annualRevenue || 0) / 365) * (plant.dso || 45)) -
        ((((plant.annualRevenue || 0) * (1 - (plant.grossMarginPct || 0.38))) / 365) * (plant.dpo || 55)),
      stockoutEvents: summary.criticalCount * 3 + summary.atRiskCount,
      stockoutCost: totalStockoutCost,  // Actual stockout cost from source data
      // Cash-to-Cash Cycle = Days of Supply + DSO - DPO (actual formula)
      cash2cashDays: Math.round(daysCoverage + (plant.dso || 45) - (plant.dpo || 55)),
      cogs: inventoryValue * turns, // COGS = Inventory × Turns
      grossMargin: inventoryValue * turns * (plant.grossMarginPct || 0.38), // Use plant-specific gross margin
      obsoleteCost: deadStock * 0.5, // 50% write-off for dead stock
      // ABC/XYZ matrix from actual data
      abcMatrix,
      // Trend data (based on actual inventory value)
      trend: [
        inventoryValue / 1000000 * 1.08,
        inventoryValue / 1000000 * 1.05,
        inventoryValue / 1000000 * 1.03,
        inventoryValue / 1000000 * 1.01,
        inventoryValue / 1000000 * 0.99,
        inventoryValue / 1000000
      ],
      // Dynamic alerts based on actual data
      alerts: [
        ...(excessStock > 10000000 ? [{ type: 'critical', text: `Excess Stock: ${formatCurrency(excessStock)}` }] : []),
        ...(deadSkuCount > 0 ? [{ type: 'critical', text: `${deadSkuCount} Dead SKUs (>12mo)` }] : []),
        ...(turns < 3 ? [{ type: 'warning', text: `Low Turns: ${turns.toFixed(1)}x` }] : []),
        ...(avgFillRate < 95 ? [{ type: 'warning', text: `Fill Rate: ${avgFillRate.toFixed(1)}%` }] : []),
        ...(summary.criticalCount > 0 ? [{ type: 'warning', text: `${summary.criticalCount} Critical SKUs` }] : []),
        ...(isHealthy ? [{ type: 'success', text: 'MRP Run Complete' }, { type: 'info', text: 'All KPIs On Target' }] : []),
      ].slice(0, 4), // Max 4 alerts
    };
  });
};

const PlantInventoryIntelligence = ({ onBack, onTileClick }) => {
  const tileConfig = getTileDataConfig('plant-inventory-intelligence');
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
    deadSkuCount: data.reduce((sum, d) => sum + d.deadSkus, 0),  // Actual dead SKU count
    grirOpen: data.reduce((sum, d) => sum + d.grirOpen, 0),
    avgFillRate: data.length > 0 ? data.reduce((sum, d) => sum + d.fillRate, 0) / data.length : 0,
  };

  // DataGrid columns - matching DemandIntelligence/ForecastingEngine pattern
  const columns = [
    { field: 'id', headerName: 'Plant ID', minWidth: 100, flex: 0.8 },
    { field: 'name', headerName: 'Plant Name', minWidth: 180, flex: 1.4 },
    {
      field: 'region',
      headerName: 'Region',
      minWidth: 100,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: params.value === 'Americas' ? alpha('#10b981', 0.12) :
                     params.value === 'Asia' ? alpha('#f59e0b', 0.12) :
                     alpha('#06b6d4', 0.12),
            color: params.value === 'Americas' ? '#059669' :
                   params.value === 'Asia' ? '#d97706' :
                   '#0891b2',
          }}
        />
      ),
    },
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
            { label: 'Carrying Cost / Yr', value: formatCurrency(selectedPlant.carryingCost), sub: `${((selectedPlant.carryingCost / selectedPlant.inventoryValue) * 100).toFixed(0)}% of inventory`, color: '#f59e0b', icon: <AttachMoneyIcon /> },
            { label: 'Working Capital', value: formatCurrency(selectedPlant.workingCapital), sub: `Inv + AR(${selectedPlant.dso}d) - AP(${selectedPlant.dpo}d)`, color: isHealthy ? '#10b981' : '#f59e0b', icon: <AssessmentIcon /> },
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

        {/* Working Capital Breakdown - Cash-to-Cash Cycle */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <AttachMoneyIcon sx={{ color: '#0891b2' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                Working Capital & Cash-to-Cash Cycle
              </Typography>
              <Chip label="FI/CO + BSID/BSIK" size="small" sx={{ ml: 'auto', fontSize: '0.6rem', height: 20, bgcolor: alpha('#06b6d4', 0.1), color: '#0891b2' }} />
            </Stack>
            <Grid container spacing={2}>
              {[
                { label: 'Inventory Value', value: formatCurrency(selectedPlant.inventoryValue), pct: `DOS: ${Math.round(selectedPlant.daysCoverage)} days`, color: '#06b6d4', sign: '+' },
                { label: 'Accounts Receivable', value: formatCurrency(selectedPlant.receivables), pct: `DSO: ${selectedPlant.dso} days`, color: '#10b981', sign: '+' },
                { label: 'Accounts Payable', value: formatCurrency(selectedPlant.payables), pct: `DPO: ${selectedPlant.dpo} days`, color: '#ef4444', sign: '-' },
                { label: 'Net Working Capital', value: formatCurrency(selectedPlant.workingCapital), pct: `C2C: ${selectedPlant.cash2cashDays} days`, color: '#a855f7', sign: '=' },
              ].map((item, idx) => (
                <Grid item xs={6} sm={3} key={idx}>
                  <Box sx={{ p: 1.5, bgcolor: alpha(item.color, 0.05), borderRadius: 1, borderLeft: `3px solid ${item.color}` }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>{item.label}</Typography>
                      <Chip label={item.sign} size="small" sx={{ minWidth: 24, height: 18, fontSize: '0.7rem', fontWeight: 700, bgcolor: alpha(item.color, 0.15), color: item.color }} />
                    </Stack>
                    <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>{item.value}</Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>{item.pct}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 2, p: 1.5, bgcolor: alpha('#64748b', 0.05), borderRadius: 1 }}>
              <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>
                <strong>Cash-to-Cash Cycle Formula:</strong> DOS ({Math.round(selectedPlant.daysCoverage)}d) + DSO ({selectedPlant.dso}d) - DPO ({selectedPlant.dpo}d) = <strong>{selectedPlant.cash2cashDays} days</strong>
              </Typography>
              <Typography sx={{ fontSize: '0.6rem', color: '#64748b', mt: 0.5 }}>
                This means cash is tied up for {selectedPlant.cash2cashDays} days from paying suppliers to collecting from customers.
              </Typography>
            </Box>
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
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>
              STOX.AI
            </Link>
            <Link component="button" variant="body1" onClick={() => selectedPlant ? setSelectedPlant(null) : onBack()} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>
              Layer 1: Foundation
            </Link>
            {selectedPlant ? (
              <>
                <Link component="button" variant="body1" onClick={() => setSelectedPlant(null)} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>
                  Plant Inventory Intelligence
                </Link>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography color="primary" variant="body1" fontWeight={600}>{selectedPlant.name}</Typography>
                  <DataSourceChip dataType={tileConfig.dataType} size="small" />
                </Stack>
              </>
            ) : (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography color="primary" variant="body1" fontWeight={600}>Plant Inventory Intelligence</Typography>
                <DataSourceChip dataType={tileConfig.dataType} size="small" />
              </Stack>
            )}
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
          <>
          <Chip
            label="GMROI from gross margin x turns | GR/IR, Blocked Stock, Stockout Costs from source data"
            size="small"
            sx={{ mb: 2, bgcolor: alpha('#10b981', 0.1), color: '#059669', fontSize: '0.65rem' }}
          />
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Total Inventory', value: formatCurrency(summaryStats.totalInventory), sub: `${summaryStats.totalSkus.toLocaleString()} SKUs - ${LAM_PLANTS.length} Plants`, color: '#06b6d4', icon: <InventoryIcon /> },
              { label: 'Avg GMROI', value: `${summaryStats.avgGmroi.toFixed(1)}x`, sub: 'GM% × Turns', color: '#10b981', icon: <TrendingUpIcon /> },
              { label: 'SLOB Inventory', value: formatCurrency(summaryStats.slobInventory), sub: `${((summaryStats.slobInventory / summaryStats.totalInventory) * 100).toFixed(0)}% of total`, color: '#f59e0b', icon: <WarningIcon /> },
              { label: 'Dead Stock', value: formatCurrency(summaryStats.deadStock), sub: `${summaryStats.deadSkuCount} SKUs`, color: '#ef4444', icon: <ErrorIcon /> },
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
          </>
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
