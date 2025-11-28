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
  Science,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  CheckCircle,
  QueryStats,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  LocalShipping as LocalShippingIcon,
  Assessment as AssessmentIcon,
  Lightbulb as LightbulbIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import stoxTheme from './stoxTheme';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend, Filler);

// Format currency
const formatCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value}`;
};

// SKU Icons mapping (beverages)
const skuIcons = ['🍵', '🍋', '🧃', '🥭', '⚡'];

// Generate mock inventory health data
const generateInventoryHealthData = () => {
  const skus = [
    { id: 'AZ-GT-23OZ', material: 'Arizona Green Tea 23oz', plant: 'Woodbury, NY', abcXyz: 'A/X', description: 'Green Tea with Ginseng & Honey - 23oz Can' },
    { id: 'AZ-AP-20OZ', material: 'Arnold Palmer 20oz', plant: 'Woodbury, NY', abcXyz: 'A/Y', description: 'Half & Half Iced Tea Lemonade - 20oz Bottle' },
    { id: 'AZ-FP-128OZ', material: 'Fruit Punch Gallon', plant: 'La Vergne, TN', abcXyz: 'B/X', description: 'Arizona Fruit Punch - 128oz Gallon' },
    { id: 'AZ-MG-15.5OZ', material: 'Mucho Mango 15.5oz', plant: 'La Vergne, TN', abcXyz: 'B/Y', description: 'Arizona Mucho Mango - 15.5oz Can' },
    { id: 'AZ-RX-16OZ', material: 'RX Energy 16oz', plant: 'Columbus, OH', abcXyz: 'A/Z', description: 'Arizona RX Energy Herbal Tonic - 16oz Can' },
  ];

  const healthData = [
    { status: 'High Risk', lostSales: 1200000, excessInventory: 100000, inventoryQuality: 95, forecastAccuracy: 60, demandVolatility: 'High', demandAtRisk: 500000, gmroi: 0.8 },
    { status: 'High Risk', lostSales: 50000, excessInventory: 2000000, inventoryQuality: 60, forecastAccuracy: 75, demandVolatility: 'Low', demandAtRisk: 0, gmroi: 0.9 },
    { status: 'Healthy', lostSales: 0, excessInventory: 300000, inventoryQuality: 98, forecastAccuracy: 90, demandVolatility: 'Low', demandAtRisk: 0, gmroi: 3.0 },
    { status: 'Moderate', lostSales: 200000, excessInventory: 500000, inventoryQuality: 80, forecastAccuracy: 70, demandVolatility: 'Medium', demandAtRisk: 100000, gmroi: 1.5 },
    { status: 'Moderate', lostSales: 0, excessInventory: 100000, inventoryQuality: 95, forecastAccuracy: 80, demandVolatility: 'High', demandAtRisk: 200000, gmroi: 2.5 },
  ];

  return skus.map((sku, index) => ({
    ...sku,
    ...healthData[index],
    icon: skuIcons[index],
  }));
};

// Generate detail data for a specific SKU
const generateDetailData = (skuId, mainData) => {
  const sku = mainData.find(s => s.id === skuId);
  if (!sku) return null;

  // Extract XYZ class from abcXyz (e.g., "A/Y" -> "Y")
  const xyzClass = sku.abcXyz.split('/')[1];

  // Status-based inventory position data
  const inventoryByStatus = {
    'High Risk': {
      unrestricted: 185,
      qualityInspection: 12,
      blocked: 3,
      inTransit: 50,
      totalAvailable: 250,
      currentStockPosition: 250,
      safetyStock: 400,
      reorderPoint: 800,
      maxStock: 1500,
      inventoryValue: 125000,
    },
    'Moderate': {
      unrestricted: 485,
      qualityInspection: 32,
      blocked: 8,
      inTransit: 120,
      totalAvailable: 645,
      currentStockPosition: 645,
      safetyStock: 500,
      reorderPoint: 1000,
      maxStock: 1800,
      inventoryValue: 322500,
    },
    'Healthy': {
      unrestricted: 920,
      qualityInspection: 45,
      blocked: 5,
      inTransit: 180,
      totalAvailable: 1150,
      currentStockPosition: 1150,
      safetyStock: 600,
      reorderPoint: 1200,
      maxStock: 2000,
      inventoryValue: 575000,
    },
  };

  const invData = inventoryByStatus[sku.status];

  // Status-based risk alerts
  const riskAlertsByStatus = {
    'High Risk': [
      { id: 1, severity: 'high', title: 'Stockout imminent in 5 days', probability: 87, impact: '$280k demand at risk', action: 'Emergency order from Polar Beverages' },
      { id: 2, severity: 'high', title: 'Service level below target', probability: 92, impact: '85% vs 95% target', action: 'Review safety stock parameters' },
      { id: 3, severity: 'medium', title: 'Forecast accuracy declining', probability: 68, impact: '60% vs 85% target', action: 'Adjust demand sensing model' },
    ],
    'Moderate': [
      { id: 1, severity: 'medium', title: 'Stockout risk in 14 days', probability: 58, impact: '$95k demand at risk', action: 'Expedite PO 4500128734' },
      { id: 2, severity: 'medium', title: 'Potential excess after peak season', probability: 42, impact: '$65k excess value', action: 'Review promotional calendar' },
    ],
    'Healthy': [],
  };

  // Status-based AI recommendations with corrected totals
  const recommendationsByStatus = {
    'High Risk': [
      { id: 1, category: 'Safety Stock', priority: 'critical', current: '400 CS', recommended: '550 CS', impact: '+$45k (prevent stockouts)', confidence: 96, rationale: 'Current safety stock of 400 CS insufficient for demand volatility. Increasing to 550 CS will achieve 95% service level target.' },
      { id: 2, category: 'Reorder Point', priority: 'critical', current: '800 CS', recommended: '1,100 CS', impact: '+$28k (prevent stockouts)', confidence: 94, rationale: 'Lead time variability from Refresco (18d actual vs 14d planned) requires higher ROP buffer.' },
      { id: 3, category: 'Switch Co-packer', priority: 'high', current: 'Refresco', recommended: 'Polar Beverages', impact: '-$85k/year', confidence: 91, rationale: 'Polar Beverages has 94% reliability vs 72% for Refresco, reducing safety stock needs.' },
    ],
    'Moderate': [
      { id: 1, category: 'Safety Stock', priority: 'high', current: '500 CS', recommended: '420 CS', impact: '-$48k', confidence: 89, rationale: 'Demand CV of 0.65 allows for reduced safety stock while maintaining 95% service level.' },
      { id: 2, category: 'Reorder Point', priority: 'medium', current: '1,000 CS', recommended: '880 CS', impact: '-$72k', confidence: 85, rationale: 'Based on actual lead time of 15 days from Polar Beverages and stable demand pattern.' },
    ],
    'Healthy': [
      { id: 1, category: 'Safety Stock', priority: 'low', current: '600 CS', recommended: '520 CS', impact: '-$52k', confidence: 92, rationale: 'Stable demand (CV 0.35) and reliable supply allows for optimized safety stock reduction.' },
      { id: 2, category: 'Lot Size', priority: 'low', current: 'Fixed 500 CS', recommended: 'EOQ 650 CS', impact: '-$18k', confidence: 88, rationale: 'EOQ calculation shows optimal lot size of 650 CS reduces ordering and holding costs.' },
    ],
  };

  // Calculate total savings for header display
  const recommendations = recommendationsByStatus[sku.status];
  const totalSavings = recommendations.reduce((sum, rec) => {
    const match = rec.impact.match(/[-+]?\$?([\d,]+)k/);
    if (match) {
      const value = parseInt(match[1].replace(',', '')) * 1000;
      return sum + (rec.impact.includes('+') ? -value : value); // + means cost, - means savings
    }
    return sum;
  }, 0);

  // Status-based MRP parameters
  const mrpParamsByStatus = {
    'High Risk': [
      { field: 'DISMM', label: 'MRP Type', current: 'VB', optimal: 'VB', changed: false },
      { field: 'DISLS', label: 'Lot Size', current: 'FX', optimal: 'FX', changed: false },
      { field: 'EISBE', label: 'Safety Stock', current: '400', optimal: '550', changed: true },
      { field: 'MINBE', label: 'Reorder Point', current: '800', optimal: '1,100', changed: true },
      { field: 'PLIFZ', label: 'Planned LT', current: '14', optimal: '18', changed: true },
      { field: 'BSTMI', label: 'Min Lot', current: '100', optimal: '100', changed: false },
      { field: 'BSTMA', label: 'Max Lot', current: '800', optimal: '1,000', changed: true },
    ],
    'Moderate': [
      { field: 'DISMM', label: 'MRP Type', current: 'VB', optimal: 'VB', changed: false },
      { field: 'DISLS', label: 'Lot Size', current: 'FX', optimal: 'EQ', changed: true },
      { field: 'EISBE', label: 'Safety Stock', current: '500', optimal: '420', changed: true },
      { field: 'MINBE', label: 'Reorder Point', current: '1,000', optimal: '880', changed: true },
      { field: 'PLIFZ', label: 'Planned LT', current: '14', optimal: '15', changed: true },
      { field: 'BSTMI', label: 'Min Lot', current: '100', optimal: '100', changed: false },
      { field: 'BSTMA', label: 'Max Lot', current: '1,000', optimal: '900', changed: true },
    ],
    'Healthy': [
      { field: 'DISMM', label: 'MRP Type', current: 'VB', optimal: 'VB', changed: false },
      { field: 'DISLS', label: 'Lot Size', current: 'FX', optimal: 'EQ', changed: true },
      { field: 'EISBE', label: 'Safety Stock', current: '600', optimal: '520', changed: true },
      { field: 'MINBE', label: 'Reorder Point', current: '1,200', optimal: '1,050', changed: true },
      { field: 'PLIFZ', label: 'Planned LT', current: '14', optimal: '15', changed: true },
      { field: 'BSTMI', label: 'Min Lot', current: '100', optimal: '100', changed: false },
      { field: 'BSTMA', label: 'Max Lot', current: '1,200', optimal: '1,000', changed: true },
    ],
  };

  // Status-based demand CV
  const demandCVByStatus = {
    'High Risk': 1.15,
    'Moderate': 0.65,
    'Healthy': 0.35,
  };

  return {
    ...sku,
    // Health Score Components
    healthScore: sku.status === 'Healthy' ? 92 : sku.status === 'Moderate' ? 76 : 58,
    serviceLevel: sku.status === 'Healthy' ? 98 : sku.status === 'Moderate' ? 88 : 72,
    inventoryEfficiency: sku.status === 'Healthy' ? 95 : sku.status === 'Moderate' ? 72 : 55,
    forecastAccuracyScore: sku.forecastAccuracy,
    supplierReliability: sku.status === 'Healthy' ? 94 : sku.status === 'Moderate' ? 77 : 65,
    parameterOptimality: sku.status === 'Healthy' ? 88 : sku.status === 'Moderate' ? 45 : 32,
    dataQuality: 92,

    // Inventory Position (status-based)
    ...invData,

    // Key Metrics
    daysCoverage: sku.status === 'Healthy' ? 28.5 : sku.status === 'Moderate' ? 18.2 : 5.8,
    daysCoverageTrend: sku.status === 'Healthy' ? 2.1 : sku.status === 'Moderate' ? -1.5 : -4.2,
    serviceLevelPct: sku.status === 'Healthy' ? 98.5 : sku.status === 'Moderate' ? 94.2 : 85.3,
    serviceLevelTrend: sku.status === 'Healthy' ? 1.2 : sku.status === 'Moderate' ? 0.8 : -3.2,
    turnoverRate: sku.status === 'Healthy' ? 9.2 : sku.status === 'Moderate' ? 6.2 : 3.8,

    // Risk Alerts (status-based)
    riskAlerts: riskAlertsByStatus[sku.status],

    // AI Recommendations (status-based with corrected values)
    recommendations: recommendations,
    totalSavings: totalSavings,

    // Vendors (Co-packers)
    vendors: [
      { id: 'V1001', name: 'Refresco Beverages', plannedLT: 14, actualLT: 18, reliability: 72 },
      { id: 'V2001', name: 'Great Lakes Bottling', plannedLT: 14, actualLT: 21, reliability: 65 },
      { id: 'V3001', name: 'Polar Beverages', plannedLT: 14, actualLT: 15, reliability: 94 },
    ],

    // MRP Parameters (status-based)
    mrpParams: mrpParamsByStatus[sku.status],

    // Chart Data - Demand & Forecast (varies by volatility)
    demandChartData: {
      labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
      datasets: [
        {
          label: 'Actual',
          data: sku.status === 'High Risk'
            ? [320, 580, 290, 620, 350, 540, null, null, null]
            : sku.status === 'Moderate'
            ? [420, 385, 460, 445, 478, 502, null, null, null]
            : [410, 425, 418, 432, 445, 438, null, null, null],
          borderColor: '#0ea5e9',
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointBackgroundColor: '#0ea5e9',
          pointRadius: 4,
          tension: 0.3,
        },
        {
          label: 'Forecast',
          data: sku.status === 'High Risk'
            ? [400, 410, 430, 450, 460, 480, 500, 485, 510]
            : sku.status === 'Moderate'
            ? [400, 410, 430, 450, 460, 480, 490, 485, 495]
            : [405, 415, 420, 430, 440, 435, 445, 450, 455],
          borderColor: '#10b981',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          tension: 0.3,
        },
        {
          label: 'Upper Bound',
          data: sku.status === 'High Risk'
            ? [520, 530, 560, 585, 600, 625, 650, 630, 665]
            : sku.status === 'Moderate'
            ? [460, 470, 490, 510, 520, 540, 550, 545, 555]
            : [430, 440, 445, 455, 465, 460, 470, 475, 480],
          borderColor: 'transparent',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: '+1',
          pointRadius: 0,
          tension: 0.3,
        },
        {
          label: 'Lower Bound',
          data: sku.status === 'High Risk'
            ? [280, 290, 300, 315, 320, 335, 350, 340, 355]
            : sku.status === 'Moderate'
            ? [340, 350, 370, 390, 400, 420, 430, 425, 435]
            : [380, 390, 395, 405, 415, 410, 420, 425, 430],
          borderColor: 'transparent',
          backgroundColor: 'transparent',
          pointRadius: 0,
          tension: 0.3,
        },
      ],
    },

    // Chart Data - Stock Trend (status-based)
    stockChartData: {
      labels: ['W44', 'W45', 'W46', 'W47', 'W48', 'W49'],
      datasets: [
        {
          label: 'Stock Level',
          data: sku.status === 'High Risk'
            ? [480, 320, 180, 550, 380, 250]
            : sku.status === 'Moderate'
            ? [780, 650, 520, 850, 720, 645]
            : [1250, 1180, 1050, 1320, 1200, 1150],
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
        },
      ],
    },

    // Forecast stats (using actual XYZ class from SKU)
    forecastStats: {
      accuracy: sku.forecastAccuracy,
      demandCV: demandCVByStatus[sku.status],
      xyzClass: xyzClass,
    },
  };
};

const Tile0ForecastSimulation = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [selectedSku, setSelectedSku] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const inventoryData = generateInventoryHealthData();
      setData(inventoryData);

      // Calculate summary metrics
      const highRisk = inventoryData.filter(d => d.status === 'High Risk').length;
      const moderate = inventoryData.filter(d => d.status === 'Moderate').length;
      const healthy = inventoryData.filter(d => d.status === 'Healthy').length;
      const totalLostSales = inventoryData.reduce((sum, d) => sum + d.lostSales, 0);
      const totalExcess = inventoryData.reduce((sum, d) => sum + d.excessInventory, 0);

      setMetrics({
        highRisk,
        moderate,
        healthy,
        totalLostSales,
        totalExcess,
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

  // DataGrid columns for inventory health (styled to match Tile 4)
  const columns = [
    { field: 'id', headerName: 'Material ID', minWidth: 130, flex: 1 },
    { field: 'material', headerName: 'Material', minWidth: 180, flex: 1.4 },
    { field: 'plant', headerName: 'Plant', minWidth: 140, flex: 1.1, align: 'center', headerAlign: 'center' },
    { field: 'abcXyz', headerName: 'ABC/XYZ', minWidth: 100, flex: 0.8, align: 'center', headerAlign: 'center' },
    {
      field: 'status',
      headerName: 'Overall Status',
      minWidth: 140,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Healthy' ? 'success' : params.value === 'Moderate' ? 'warning' : 'error'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'lostSales',
      headerName: 'Lost Sales ($)',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value >= 1000000 ? `$${(params.value / 1000000).toFixed(1)}M` : params.value >= 1000 ? `$${(params.value / 1000).toFixed(0)}k` : `$${params.value}`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value > 500000 ? alpha('#ef4444', 0.12) : params.value > 50000 ? alpha('#f59e0b', 0.12) : alpha('#10b981', 0.12),
            color: params.value > 500000 ? '#dc2626' : params.value > 50000 ? '#d97706' : '#059669',
          }}
        />
      ),
    },
    {
      field: 'excessInventory',
      headerName: 'Excess Inv ($)',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value >= 1000000 ? `$${(params.value / 1000000).toFixed(1)}M` : `$${(params.value / 1000).toFixed(0)}k`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value > 1000000 ? alpha('#ef4444', 0.12) : params.value > 200000 ? alpha('#f59e0b', 0.12) : alpha('#10b981', 0.12),
            color: params.value > 1000000 ? '#dc2626' : params.value > 200000 ? '#d97706' : '#059669',
          }}
        />
      ),
    },
    {
      field: 'inventoryQuality',
      headerName: 'Inv Quality (%)',
      minWidth: 130,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value >= 90 ? alpha('#10b981', 0.12) : params.value >= 70 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value >= 90 ? '#059669' : params.value >= 70 ? '#d97706' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'forecastAccuracy',
      headerName: 'Forecast Acc (%)',
      minWidth: 140,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value >= 85 ? alpha('#10b981', 0.12) : params.value >= 70 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value >= 85 ? '#059669' : params.value >= 70 ? '#d97706' : '#dc2626',
          }}
        />
      ),
    },
    {
      field: 'demandVolatility',
      headerName: 'Demand Volatility',
      minWidth: 140,
      flex: 1,
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
      field: 'demandAtRisk',
      headerName: 'Demand at Risk ($)',
      minWidth: 150,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value === 0 ? '$0' : params.value >= 1000 ? `$${(params.value / 1000).toFixed(0)}k` : `$${params.value}`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value > 100000 ? alpha('#ef4444', 0.12) : params.value > 0 ? alpha('#f59e0b', 0.12) : alpha('#10b981', 0.12),
            color: params.value > 100000 ? '#dc2626' : params.value > 0 ? '#d97706' : '#059669',
          }}
        />
      ),
    },
    {
      field: 'gmroi',
      headerName: 'GMROI',
      minWidth: 100,
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={`${params.value.toFixed(1)}×`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: params.value >= 2.0 ? alpha('#10b981', 0.12) : params.value >= 1.0 ? alpha('#f59e0b', 0.12) : alpha('#ef4444', 0.12),
            color: params.value >= 2.0 ? '#059669' : params.value >= 1.0 ? '#d97706' : '#dc2626',
          }}
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
        ticks: { color: '#64748b', font: { size: 10 } },
      },
    },
  };

  // Render Detail View
  const renderDetailView = () => {
    if (!selectedSku) return null;

    const healthColor = selectedSku.healthScore >= 85 ? '#10b981' : selectedSku.healthScore >= 60 ? '#f59e0b' : '#ef4444';

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToList}
          sx={{ mb: 3, color: '#64748b', '&:hover': { bgcolor: alpha('#0ea5e9', 0.1), color: '#0ea5e9' } }}
        >
          Back to Overview
        </Button>

        {/* Detail Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: 2,
            background: 'linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem'
          }}>
            {selectedSku.icon}
          </Box>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#0ea5e9' }}>{selectedSku.material}</Typography>
              <Typography sx={{ color: '#64748b' }}>|</Typography>
              <Typography variant="h6" sx={{ color: '#64748b' }}>{selectedSku.plant}</Typography>
              <Chip
                label={selectedSku.abcXyz}
                size="small"
                sx={{ bgcolor: alpha('#0ea5e9', 0.12), color: '#0284c7', fontWeight: 600 }}
              />
            </Stack>
            <Typography sx={{ color: '#64748b', fontSize: '0.9rem', mt: 0.5 }}>{selectedSku.description}</Typography>
          </Box>
        </Box>

        {/* Main Grid */}
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={3.5}>
            {/* Health Score Gauge */}
            <Card sx={{ mb: 3, border: '1px solid', borderColor: alpha('#64748b', 0.15) }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <AssessmentIcon sx={{ color: '#0ea5e9', fontSize: 20 }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Inventory Health Score
                  </Typography>
                  <Chip label="AI-COMPUTED" size="small" sx={{ ml: 'auto', height: 18, fontSize: '0.6rem', bgcolor: alpha('#0ea5e9', 0.1), color: '#0284c7' }} />
                </Stack>

                {/* Circular Gauge */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress
                      variant="determinate"
                      value={100}
                      size={120}
                      thickness={4}
                      sx={{ color: alpha('#64748b', 0.1) }}
                    />
                    <CircularProgress
                      variant="determinate"
                      value={selectedSku.healthScore}
                      size={120}
                      thickness={4}
                      sx={{ color: healthColor, position: 'absolute', left: 0 }}
                    />
                    <Box sx={{
                      top: 0, left: 0, bottom: 0, right: 0,
                      position: 'absolute',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>{selectedSku.healthScore}</Typography>
                      <Typography sx={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 2 }}>HEALTH</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Health Components Grid */}
                <Grid container spacing={1} sx={{ mt: 2 }}>
                  {[
                    { name: 'Service Level', value: selectedSku.serviceLevel },
                    { name: 'Inv. Efficiency', value: selectedSku.inventoryEfficiency },
                    { name: 'Forecast Acc.', value: selectedSku.forecastAccuracyScore },
                    { name: 'Supplier Rel.', value: selectedSku.supplierReliability },
                    { name: 'Param Optimal.', value: selectedSku.parameterOptimality },
                    { name: 'Data Quality', value: selectedSku.dataQuality },
                  ].map((item, idx) => (
                    <Grid item xs={6} key={idx}>
                      <Box sx={{ p: 1, bgcolor: alpha('#64748b', 0.05), borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>{item.name}</Typography>
                        <Typography sx={{
                          fontSize: '0.75rem', fontWeight: 600,
                          color: item.value >= 80 ? '#059669' : item.value >= 60 ? '#d97706' : '#dc2626'
                        }}>{item.value}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Inventory Position */}
            <Card sx={{ border: '1px solid', borderColor: alpha('#64748b', 0.15) }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <InventoryIcon sx={{ color: '#0ea5e9', fontSize: 20 }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Inventory Position
                  </Typography>
                  <Chip label="MARD • MARC" size="small" sx={{ ml: 'auto', height: 18, fontSize: '0.55rem', bgcolor: alpha('#0ea5e9', 0.1), color: '#0284c7' }} />
                </Stack>

                <Stack spacing={1.5}>
                  {[
                    { label: 'Unrestricted', value: `${selectedSku.unrestricted} CS`, color: null },
                    { label: 'Quality Inspection', value: `${selectedSku.qualityInspection} CS`, color: '#d97706' },
                    { label: 'Blocked', value: `${selectedSku.blocked} CS`, color: '#dc2626' },
                    { label: 'In Transit', value: `${selectedSku.inTransit} CS`, color: '#0284c7' },
                  ].map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>{item.label}</Typography>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: item.color || 'inherit' }}>{item.value}</Typography>
                    </Box>
                  ))}
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Total Available</Typography>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedSku.totalAvailable} CS</Typography>
                  </Box>
                </Stack>

                {/* Stock Level Bar */}
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ height: 28, bgcolor: alpha('#64748b', 0.1), borderRadius: 1, position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '25%', background: 'linear-gradient(90deg, rgba(239,68,68,0.5), rgba(239,68,68,0.2))' }} />
                    <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: '25%', width: '35%', background: 'linear-gradient(90deg, rgba(251,191,36,0.5), rgba(251,191,36,0.2))' }} />
                    <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: '60%', width: '40%', background: 'linear-gradient(90deg, rgba(16,185,129,0.5), rgba(16,185,129,0.2))' }} />
                    <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: `${(selectedSku.currentStockPosition / selectedSku.maxStock) * 100}%`, width: 3, bgcolor: 'white', boxShadow: '0 0 8px white' }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>0</Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>SS: {selectedSku.safetyStock}</Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>ROP: {selectedSku.reorderPoint.toLocaleString()}</Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>Max: {selectedSku.maxStock.toLocaleString()}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Center Column */}
          <Grid item xs={12} md={5}>
            {/* Demand & Forecast Chart */}
            <Card sx={{ mb: 3, border: '1px solid', borderColor: alpha('#64748b', 0.15) }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <TrendingUpIcon sx={{ color: '#0ea5e9', fontSize: 20 }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Demand & AI Forecast
                  </Typography>
                  <Chip label="MVER • VBAP" size="small" sx={{ ml: 'auto', height: 18, fontSize: '0.55rem', bgcolor: alpha('#0ea5e9', 0.1), color: '#0284c7' }} />
                </Stack>
                <Box sx={{ height: 180 }}>
                  <Line data={selectedSku.demandChartData} options={chartOptions} />
                </Box>
                <Grid container spacing={2} sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: alpha('#64748b', 0.15) }}>
                  <Grid item xs={4} sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedSku.forecastStats.accuracy}%</Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase' }}>Forecast Acc.</Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#d97706' }}>{selectedSku.forecastStats.demandCV}</Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase' }}>Demand CV</Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#0284c7' }}>{selectedSku.forecastStats.xyzClass}</Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase' }}>XYZ Class</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Stock Trend Chart */}
            <Card sx={{ mb: 3, border: '1px solid', borderColor: alpha('#64748b', 0.15) }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <TrendingDownIcon sx={{ color: '#0ea5e9', fontSize: 20 }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Stock Position Trend
                  </Typography>
                  <Chip label="MSEG/MKPF" size="small" sx={{ ml: 'auto', height: 18, fontSize: '0.55rem', bgcolor: alpha('#0ea5e9', 0.1), color: '#0284c7' }} />
                </Stack>
                <Box sx={{ height: 150 }}>
                  <Line data={selectedSku.stockChartData} options={chartOptions} />
                </Box>
              </CardContent>
            </Card>

            {/* Key Metrics Grid */}
            <Grid container spacing={2}>
              {[
                { label: 'Days Coverage', value: selectedSku.daysCoverage, unit: 'days', trend: selectedSku.daysCoverageTrend, status: selectedSku.daysCoverage > 20 ? 'good' : 'warning', sap: 'MARD/MVER' },
                { label: 'Service Level', value: `${selectedSku.serviceLevelPct}%`, trend: selectedSku.serviceLevelTrend, status: selectedSku.serviceLevelPct > 95 ? 'good' : 'warning', sap: 'VBAP/LIPS' },
                { label: 'Inventory Value', value: formatCurrency(selectedSku.inventoryValue), trend: -45000, status: 'neutral', sap: 'MBEW' },
                { label: 'Turnover Rate', value: `${selectedSku.turnoverRate}×`, unit: '/year', trend: null, target: '8×', status: selectedSku.turnoverRate > 8 ? 'good' : 'warning' },
              ].map((metric, idx) => (
                <Grid item xs={6} key={idx}>
                  <Card sx={{
                    border: '1px solid',
                    borderColor: metric.status === 'good' ? alpha('#10b981', 0.3) : metric.status === 'warning' ? alpha('#f59e0b', 0.3) : alpha('#64748b', 0.15),
                    bgcolor: metric.status === 'good' ? alpha('#10b981', 0.03) : metric.status === 'warning' ? alpha('#f59e0b', 0.03) : 'transparent',
                  }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>{metric.label}</Typography>
                        {metric.sap && <Chip label={metric.sap} size="small" sx={{ height: 14, fontSize: '0.5rem', bgcolor: alpha('#0ea5e9', 0.1), color: '#0284c7' }} />}
                      </Box>
                      <Typography sx={{ fontSize: '1.3rem', fontWeight: 700 }}>
                        {metric.value}{metric.unit && <Typography component="span" sx={{ fontSize: '0.8rem', fontWeight: 400, color: '#64748b', ml: 0.5 }}>{metric.unit}</Typography>}
                      </Typography>
                      {metric.trend !== null && (
                        <Typography sx={{ fontSize: '0.7rem', color: metric.trend > 0 ? '#059669' : '#dc2626', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {metric.trend > 0 ? '↑' : '↓'} {metric.trend > 0 ? '+' : ''}{typeof metric.trend === 'number' && metric.trend < 1000 ? metric.trend : formatCurrency(Math.abs(metric.trend))} {metric.trendLabel || 'vs last week'}
                        </Typography>
                      )}
                      {metric.target && (
                        <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>Target: {metric.target}</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={3.5}>
            {/* Risk Alerts */}
            {selectedSku.riskAlerts.length > 0 && (
              <Card sx={{ mb: 3, border: '1px solid', borderColor: alpha('#ef4444', 0.2), bgcolor: alpha('#ef4444', 0.02) }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <WarningIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Active Risk Alerts
                    </Typography>
                  </Stack>
                  <Stack spacing={1.5}>
                    {selectedSku.riskAlerts.map((alert) => (
                      <Box
                        key={alert.id}
                        sx={{
                          p: 2, borderRadius: 1,
                          bgcolor: alert.severity === 'high' ? alpha('#ef4444', 0.08) : alpha('#f59e0b', 0.08),
                          border: '1px solid',
                          borderColor: alert.severity === 'high' ? alpha('#ef4444', 0.2) : alpha('#f59e0b', 0.2),
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: alert.severity === 'high' ? '#dc2626' : '#d97706' }}>
                            {alert.title}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{alert.probability}%</Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mb: 1 }}>{alert.impact}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#0ea5e9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          ⚡ {alert.action}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* AI Recommendations */}
            <Card sx={{ mb: 3, border: '1px solid', borderColor: alpha('#64748b', 0.15) }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <LightbulbIcon sx={{ color: '#0ea5e9', fontSize: 20 }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    AI Recommendations
                  </Typography>
                  <Typography sx={{ ml: 'auto', fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>${selectedSku.totalSavings}k savings</Typography>
                </Stack>
                <Stack spacing={1.5}>
                  {selectedSku.recommendations.map((rec) => {
                    const priorityColor = rec.priority === 'critical' ? '#ef4444' : rec.priority === 'high' ? '#f59e0b' : '#0ea5e9';
                    return (
                      <Box
                        key={rec.id}
                        sx={{
                          p: 2, borderRadius: 1, cursor: 'pointer',
                          bgcolor: alpha(priorityColor, 0.03),
                          borderLeft: `4px solid ${priorityColor}`,
                          '&:hover': { bgcolor: alpha(priorityColor, 0.06) },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{rec.category}</Typography>
                              <Chip
                                label={rec.priority.toUpperCase()}
                                size="small"
                                sx={{
                                  height: 18, fontSize: '0.55rem',
                                  bgcolor: alpha(priorityColor, 0.15),
                                  color: priorityColor,
                                  textTransform: 'uppercase'
                                }}
                              />
                            </Stack>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>{rec.impact}</Typography>
                            <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>{rec.confidence}% confidence</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <Typography sx={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'line-through' }}>{rec.current}</Typography>
                          <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>→</Typography>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>{rec.recommended}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.5 }}>{rec.rationale}</Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>

            {/* Vendor Lead Times */}
            <Card sx={{ border: '1px solid', borderColor: alpha('#64748b', 0.15) }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <LocalShippingIcon sx={{ color: '#0ea5e9', fontSize: 20 }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Vendor Lead Times
                  </Typography>
                  <Chip label="EKBE • EINE" size="small" sx={{ ml: 'auto', height: 18, fontSize: '0.55rem', bgcolor: alpha('#0ea5e9', 0.1), color: '#0284c7' }} />
                </Stack>
                <Stack spacing={1.5}>
                  {selectedSku.vendors.map((vendor) => (
                    <Box key={vendor.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.85rem' }}>{vendor.name}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>Plan: {vendor.plannedLT}d → Actual: {vendor.actualLT}d</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{
                          fontSize: '0.9rem', fontWeight: 600,
                          color: vendor.reliability >= 90 ? '#059669' : vendor.reliability >= 70 ? '#d97706' : '#dc2626'
                        }}>{vendor.reliability}%</Typography>
                        <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>reliability</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
                <Box sx={{
                  mt: 2, p: 1.5, borderRadius: 1,
                  bgcolor: alpha('#10b981', 0.08),
                  border: '1px solid',
                  borderColor: alpha('#10b981', 0.2),
                  display: 'flex', alignItems: 'center', gap: 1
                }}>
                  <CheckCircle sx={{ color: '#10b981', fontSize: 16 }} />
                  <Typography sx={{ fontSize: '0.75rem', color: '#059669' }}>Recommend switching to Polar Beverages as primary co-packer</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* MRP Parameters Section */}
        <Card sx={{ mt: 3, border: '1px solid', borderColor: alpha('#64748b', 0.15) }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <SettingsIcon sx={{ color: '#0ea5e9', fontSize: 20 }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                MRP Parameters: Current vs AI-Optimized
              </Typography>
              <Chip label="MARC Fields" size="small" sx={{ height: 18, fontSize: '0.55rem', bgcolor: alpha('#0ea5e9', 0.1), color: '#0284c7' }} />
              <Button
                size="small"
                variant="contained"
                sx={{ ml: 'auto', bgcolor: alpha('#0ea5e9', 0.15), color: '#0284c7', '&:hover': { bgcolor: alpha('#0ea5e9', 0.25) } }}
              >
                ⚡ Apply to SAP
              </Button>
            </Stack>
            <Grid container spacing={2}>
              {selectedSku.mrpParams.map((param, idx) => (
                <Grid item xs={6} sm={4} md={12/7} key={idx}>
                  <Box sx={{
                    p: 2, borderRadius: 1,
                    border: '1px solid',
                    borderColor: param.changed ? alpha('#0ea5e9', 0.3) : alpha('#64748b', 0.15),
                    bgcolor: param.changed ? alpha('#0ea5e9', 0.03) : 'transparent'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#0ea5e9' }}>{param.field}</Typography>
                      {param.changed && <Typography sx={{ fontSize: '0.7rem', color: '#0ea5e9' }}>⚡</Typography>}
                    </Box>
                    <Typography sx={{ fontSize: '0.65rem', color: '#64748b', mb: 0.5 }}>{param.label}</Typography>
                    {param.changed ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'line-through' }}>{param.current}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>→</Typography>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>{param.optimal}</Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{param.current}</Typography>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
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
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              {selectedSku ? `${selectedSku.material} Detail` : 'Inventory Health Dashboard'}
            </Typography>
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
              <InventoryIcon sx={{ fontSize: 40, color: '#0ea5e9' }} />
              <Typography variant="h5" fontWeight={600}>Inventory Health Dashboard</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Monitor SKU health metrics, identify risks, and review AI-powered optimization recommendations
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
                <Card variant="outlined" sx={{ borderLeft: `3px solid #ef4444` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>High Risk SKUs</Typography>
                    <Typography variant="h4" fontWeight={700} color="#dc2626">{metrics.highRisk}</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', mt: 0.5 }}>Immediate attention required</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #f59e0b` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Moderate Risk</Typography>
                    <Typography variant="h4" fontWeight={700} color="#d97706">{metrics.moderate}</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', mt: 0.5 }}>Monitor closely</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #10b981` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Healthy SKUs</Typography>
                    <Typography variant="h4" fontWeight={700} color="#059669">{metrics.healthy}</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', mt: 0.5 }}>On track</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #0ea5e9` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Total Lost Sales</Typography>
                    <Typography variant="h4" fontWeight={700} color="#0284c7">{formatCurrency(metrics.totalLostSales)}</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', mt: 0.5 }}>Rolling 12 months</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid #0ea5e9` }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>Excess Inventory</Typography>
                    <Typography variant="h4" fontWeight={700} color="#0284c7">{formatCurrency(metrics.totalExcess)}</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', mt: 0.5 }}>Capital at risk</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* DataGrid */}
          <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, width: '100%' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: alpha('#64748b', 0.15), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                  📊 Sample Inventory Health Dashboard Metrics
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Chip label="S" size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: alpha('#06b6d4', 0.2), color: '#0891b2' }} />
                  <span>Snapshot</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Chip label="R" size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: alpha('#f59e0b', 0.2), color: '#d97706' }} />
                  <span>Rolling</span>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Chip label="F" size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: alpha('#10b981', 0.2), color: '#059669' }} />
                  <span>Forward</span>
                </Box>
              </Stack>
            </Box>
            <DataGrid
              rows={data}
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
              sx={stoxTheme.getDataGridSx()}
            />
          </Paper>

          {/* Legend */}
          <Box sx={{ mt: 2, p: 2, bgcolor: alpha('#64748b', 0.05), borderRadius: 1, border: '1px solid', borderColor: alpha('#64748b', 0.15) }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.8 }}>
              <strong style={{ color: '#475569' }}>Legend:</strong> (S) = Snapshot (point-in-time) • (R) = Rolling (trailing period) • (F) = Forward-Looking (forecast/at-risk)
              <br />
              <strong style={{ color: '#475569' }}>Thresholds:</strong>{' '}
              <span style={{ color: '#10b981' }}>●</span> Green = Good |{' '}
              <span style={{ color: '#f59e0b' }}>●</span> Yellow = Caution |{' '}
              <span style={{ color: '#ef4444' }}>●</span> Red = Urgent
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Tile0ForecastSimulation;
