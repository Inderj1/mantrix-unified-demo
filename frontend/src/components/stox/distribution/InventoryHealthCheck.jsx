import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  Breadcrumbs,
  Link,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  LinearProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  Category as CategoryIcon,
  ShowChart as ShowChartIcon,
  FilterList as FilterListIcon,
  SmartToy as SmartToyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  NotificationsActive as AlertIcon,
  Inventory2 as ExcessIcon,
  SwapHoriz as RebalanceIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';

// Import centralized brand colors and stoxTheme
import { MODULE_COLOR, getColors } from '../../../config/brandColors';
import stoxTheme from '../stoxTheme';
import Collapse from '@mui/material/Collapse';

// Mock data for inventory items
const inventoryData = [
  {
    id: 'MAT-1001',
    description: 'Hydraulic Pump Assembly',
    plant: 'P1000 Detroit',
    status: 'critical',
    statusLabel: 'Stockout Risk',
    inventoryValue: 28400,
    quantity: 142,
    unitPrice: 200,
    coverage: 3,
    gmroi: 3.2,
    gmroiBenchmark: 'Above avg',
    turns: 8.4,
    turnsBenchmark: 'Fast mover',
    carryingCost: 6248,
    opportunity: 156000,
    opportunityType: 'Revenue at risk',
    abcClass: 'A',
    xyzClass: 'Z',
    avgMonthlyDemand: 1440,
    demandCV: 0.82,
    forecastAccuracy: 68,
    safetyStock: 482,
    reorderPoint: 720,
    primaryVendor: 'VENDOR-A',
    plannedLeadTime: 14,
    actualLeadTime: 21,
    vendorOTD: 72,
    inTransit: 250,
    openPO: 500,
  },
  {
    id: 'MAT-3089',
    description: 'Gasket Kit Standard',
    plant: 'P1000 Detroit',
    status: 'excess',
    statusLabel: 'Excess',
    inventoryValue: 84600,
    quantity: 4230,
    unitPrice: 20,
    coverage: 156,
    gmroi: 1.8,
    gmroiBenchmark: 'Below avg',
    turns: 2.3,
    turnsBenchmark: 'Slow',
    carryingCost: 18612,
    opportunity: 56000,
    opportunityType: 'Excess reducible',
    abcClass: 'B',
    xyzClass: 'X',
    avgMonthlyDemand: 820,
    demandCV: 0.35,
    forecastAccuracy: 85,
    safetyStock: 400,
    reorderPoint: 600,
    primaryVendor: 'VENDOR-B',
    plannedLeadTime: 7,
    actualLeadTime: 8,
    vendorOTD: 94,
    inTransit: 0,
    openPO: 0,
  },
  {
    id: 'MAT-7721',
    description: 'Legacy Connector Type-B',
    plant: 'P2000 Phoenix',
    status: 'dead',
    statusLabel: 'Dead Stock',
    inventoryValue: 42300,
    quantity: 1410,
    unitPrice: 30,
    coverage: Infinity,
    gmroi: 0,
    gmroiBenchmark: 'No sales',
    turns: 0,
    turnsBenchmark: 'No movement',
    carryingCost: 9306,
    opportunity: 42300,
    opportunityType: 'Write-off/liquidate',
    abcClass: 'C',
    xyzClass: 'Z',
    avgMonthlyDemand: 0,
    demandCV: 0,
    forecastAccuracy: 0,
    safetyStock: 0,
    reorderPoint: 0,
    primaryVendor: 'VENDOR-C',
    plannedLeadTime: 21,
    actualLeadTime: 0,
    vendorOTD: 0,
    inTransit: 0,
    openPO: 0,
  },
  {
    id: 'MAT-2045',
    description: 'Bearing Assembly 2x4',
    plant: 'P2000 Phoenix',
    status: 'at-risk',
    statusLabel: 'At Risk',
    inventoryValue: 51360,
    quantity: 856,
    unitPrice: 60,
    coverage: 12,
    gmroi: 2.6,
    gmroiBenchmark: 'Good',
    turns: 5.2,
    turnsBenchmark: 'Average',
    carryingCost: 11299,
    opportunity: 38000,
    opportunityType: 'Revenue at risk',
    abcClass: 'A',
    xyzClass: 'Y',
    avgMonthlyDemand: 2140,
    demandCV: 0.52,
    forecastAccuracy: 76,
    safetyStock: 600,
    reorderPoint: 900,
    primaryVendor: 'VENDOR-D',
    plannedLeadTime: 10,
    actualLeadTime: 12,
    vendorOTD: 85,
    inTransit: 100,
    openPO: 400,
  },
  {
    id: 'MAT-4012',
    description: 'Control Valve Assembly',
    plant: 'P3000 Seattle',
    status: 'healthy',
    statusLabel: 'Healthy',
    inventoryValue: 192000,
    quantity: 1280,
    unitPrice: 150,
    coverage: 28,
    gmroi: 2.9,
    gmroiBenchmark: 'Good',
    turns: 6.8,
    turnsBenchmark: 'Good',
    carryingCost: 42240,
    opportunity: 0,
    opportunityType: 'Optimized',
    abcClass: 'A',
    xyzClass: 'X',
    avgMonthlyDemand: 1380,
    demandCV: 0.28,
    forecastAccuracy: 91,
    safetyStock: 350,
    reorderPoint: 520,
    primaryVendor: 'VENDOR-E',
    plannedLeadTime: 7,
    actualLeadTime: 7,
    vendorOTD: 96,
    inTransit: 200,
    openPO: 300,
  },
];

// Summary KPIs
const summaryKPIs = {
  totalValue: { value: '$47.2M', trend: '+8.2%', trendUp: true, label: 'Total Inventory Value', skus: '2,847 SKUs' },
  deadStock: { value: '$3.4M', trend: '+12%', trendUp: true, label: 'Dead Stock Value', sub: 'No movement >12mo', skus: '186', percent: '7.2%' },
  excessStock: { value: '$6.8M', trend: 'Flat', trendUp: null, label: 'Excess Stock Value', sub: 'Above optimal level', skus: '412', percent: '14.4%' },
  gmroi: { value: '2.4x', trend: '+0.3', trendUp: false, label: 'GMROI', sub: 'Benchmark: 2.0-3.0', grossMargin: '$113M', avgInv: '$47M' },
  turns: { value: '5.8x', trend: '+0.4', trendUp: false, label: 'Inventory Turns', sub: 'Industry avg: 4-6', dio: '63', rating: 'Good' },
  carryingCost: { value: '$10.4M', trend: '+$1.2M', trendUp: true, label: 'Annual Carrying Cost', sub: '@ 22% holding rate', saveable: '$2.2M', opportunity: '21%' },
};

const operationalKPIs = {
  stockoutRisk: { value: 47, label: 'Stockout Risk', sub: 'SKUs below safety stock', color: '#ef4444' },
  atRisk: { value: 186, label: 'At Risk', sub: 'Coverage < 14 days', color: '#f59e0b' },
  healthy: { value: 1842, label: 'Healthy', sub: 'Within optimal range', color: '#10b981' },
  excess: { value: 412, label: 'Excess', sub: 'Coverage > 60 days', color: '#8b5cf6' },
  serviceLevel: { value: '94.2%', label: 'Avg Service Level', sub: 'Target: 95%', color: '#06b6d4' },
  wcOpportunity: { value: '$10.2M', label: 'WC Opportunity', sub: 'Dead + Excess reduction', color: '#10b981' },
};

// AI Recommendations mock data
const aiRecommendations = {
  confidence: 92,
  dataQuality: 94,
  summary: '12 stockout risks • 47 excess items • 8 rebalance opportunities',
  insights: [
    {
      type: 'stockout',
      priority: 'HIGH',
      count: 12,
      title: 'Stockout Prevention Required',
      description: '12 SKUs projected to hit zero stock within 7 days',
      impact: '$340K revenue at risk',
      action: 'Review & Expedite',
      IconComponent: AlertIcon,
      color: '#ef4444',
    },
    {
      type: 'excess',
      priority: 'MEDIUM',
      count: 47,
      title: 'Excess Inventory Detected',
      description: '47 SKUs with >180 days coverage',
      impact: '$890K capital tied up',
      action: 'Review for Liquidation',
      IconComponent: ExcessIcon,
      color: '#f59e0b',
    },
    {
      type: 'rebalance',
      priority: 'LOW',
      count: 8,
      title: 'Cross-Plant Rebalancing',
      description: '8 SKUs can be transferred to reduce stockouts',
      impact: 'Avoid $45K expedite costs',
      action: 'View Transfer Plan',
      IconComponent: RebalanceIcon,
      color: '#10b981',
    },
  ],
};

// AI Root Cause Analysis for detail view - generates contextual analysis based on item status
const getAIRootCause = (item) => {
  const statusAnalysis = {
    critical: {
      confidence: 94,
      summary: `This SKU is at Critical status due to multiple converging risk factors that require immediate attention.`,
      factors: [
        { factor: 'Demand Spike', impact: `+${Math.round((item.demandCV || 0.5) * 100)}% variance vs forecast`, IconComponent: TrendingUpIcon, color: '#ef4444' },
        { factor: 'Supplier Delay', impact: `${item.primaryVendor} +${item.actualLeadTime - item.plannedLeadTime} days late`, IconComponent: LocalShippingIcon, color: '#f59e0b' },
        { factor: 'Low Safety Stock', impact: `${item.coverage} days vs 21 day target`, IconComponent: InventoryIcon, color: '#00357a' },
      ],
      actions: [
        { action: `Expedite open PO (${item.openPO} EA)`, impact: `-${Math.max(3, item.actualLeadTime - item.plannedLeadTime)} days lead time`, priority: 'HIGH' },
        { action: 'Increase safety stock to 21 days', impact: `+$${Math.round(item.unitPrice * item.avgMonthlyDemand * 0.7 / 1000)}K inventory`, priority: 'MEDIUM' },
        { action: 'Review forecast model accuracy', impact: `+${Math.round(100 - item.forecastAccuracy)}% accuracy potential`, priority: 'LOW' },
      ],
    },
    'at-risk': {
      confidence: 89,
      summary: `This SKU shows early warning signs of potential stockout. Proactive intervention recommended.`,
      factors: [
        { factor: 'Coverage Declining', impact: `${item.coverage} days (below 14-day threshold)`, IconComponent: TrendingDownIcon, color: '#f59e0b' },
        { factor: 'Vendor Performance', impact: `${item.vendorOTD}% OTD (target: 95%)`, IconComponent: LocalShippingIcon, color: '#f59e0b' },
        { factor: 'Demand Variability', impact: `CV: ${item.demandCV} (${item.demandCV > 0.5 ? 'High' : 'Moderate'})`, IconComponent: ShowChartIcon, color: '#00357a' },
      ],
      actions: [
        { action: 'Place expedited order', impact: 'Restore 21-day coverage', priority: 'HIGH' },
        { action: 'Contact vendor for OTD improvement', impact: `Target ${item.vendorOTD + 10}% OTD`, priority: 'MEDIUM' },
        { action: 'Adjust safety stock buffer', impact: 'Account for demand variability', priority: 'LOW' },
      ],
    },
    excess: {
      confidence: 91,
      summary: `This SKU has excess inventory tying up working capital. Consider liquidation or demand stimulation.`,
      factors: [
        { factor: 'Over-stocked', impact: `${item.coverage} days coverage (target: 30)`, IconComponent: ExcessIcon, color: '#8b5cf6' },
        { factor: 'Slow Turns', impact: `${item.turns}x annual (benchmark: 5x)`, IconComponent: TrendingDownIcon, color: '#f59e0b' },
        { factor: 'Capital Tied Up', impact: `$${item.inventoryValue.toLocaleString()} at risk`, IconComponent: MoneyIcon, color: '#ef4444' },
      ],
      actions: [
        { action: 'Reduce reorder point', impact: `Free $${Math.round(item.inventoryValue * 0.3 / 1000)}K working capital`, priority: 'HIGH' },
        { action: 'Explore liquidation channels', impact: 'Recover 60-80% of value', priority: 'MEDIUM' },
        { action: 'Review demand forecast', impact: 'Prevent future over-ordering', priority: 'LOW' },
      ],
    },
    dead: {
      confidence: 96,
      summary: `This SKU has zero movement and should be evaluated for write-off or disposal.`,
      factors: [
        { factor: 'No Demand', impact: '0 units sold in 12+ months', IconComponent: ErrorIcon, color: '#64748b' },
        { factor: 'Obsolescence Risk', impact: 'Product may be obsolete', IconComponent: WarningIcon, color: '#ef4444' },
        { factor: 'Carrying Cost', impact: `$${item.carryingCost.toLocaleString()}/year wasted`, IconComponent: MoneyIcon, color: '#ef4444' },
      ],
      actions: [
        { action: 'Initiate write-off process', impact: `Recover $${Math.round(item.inventoryValue * 0.1 / 1000)}K salvage`, priority: 'HIGH' },
        { action: 'Check for alternative use cases', impact: 'Cross-plant transfer potential', priority: 'MEDIUM' },
        { action: 'Update MRP to prevent reorder', impact: 'Avoid future dead stock', priority: 'LOW' },
      ],
    },
    healthy: {
      confidence: 95,
      summary: `This SKU is performing optimally. Current parameters are well-calibrated.`,
      factors: [
        { factor: 'Optimal Coverage', impact: `${item.coverage} days (within target range)`, IconComponent: CheckCircleIcon, color: '#10b981' },
        { factor: 'Strong Vendor', impact: `${item.vendorOTD}% OTD performance`, IconComponent: LocalShippingIcon, color: '#10b981' },
        { factor: 'Good Forecast', impact: `${item.forecastAccuracy}% accuracy`, IconComponent: ShowChartIcon, color: '#10b981' },
      ],
      actions: [
        { action: 'Maintain current parameters', impact: 'Continue optimal performance', priority: 'LOW' },
        { action: 'Monitor for seasonal shifts', impact: 'Proactive adjustment ready', priority: 'LOW' },
        { action: 'Consider slight SS reduction', impact: `Free $${Math.round(item.inventoryValue * 0.05 / 1000)}K WC`, priority: 'LOW' },
      ],
    },
  };

  return statusAnalysis[item.status] || statusAnalysis.healthy;
};

// Status color mapping
const getStatusColor = (status) => {
  switch (status) {
    case 'critical': return '#ef4444';
    case 'at-risk': return '#f59e0b';
    case 'healthy': return '#10b981';
    case 'excess': return '#8b5cf6';
    case 'dead': return '#64748b';
    default: return '#64748b';
  }
};

const getStatusChipSx = (status) => {
  const color = getStatusColor(status);
  return {
    bgcolor: alpha(color, 0.12),
    color: color,
    fontWeight: 600,
    fontSize: '0.7rem',
    height: 24,
    '& .MuiChip-icon': { color: color },
  };
};

// DataGrid column definitions
const getColumns = (colors) => [
  {
    field: 'id',
    headerName: 'Material ID',
    minWidth: 120,
    flex: 0.8,
    renderCell: (params) => (
      <Box>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: MODULE_COLOR }}>{params.value}</Typography>
        <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary }}>{params.row.plant}</Typography>
      </Box>
    ),
  },
  {
    field: 'description',
    headerName: 'Description',
    minWidth: 180,
    flex: 1.2,
  },
  {
    field: 'status',
    headerName: 'Status',
    minWidth: 120,
    flex: 0.8,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Chip size="small" label={params.row.statusLabel} sx={getStatusChipSx(params.value)} />
    ),
  },
  {
    field: 'inventoryValue',
    headerName: 'Inventory Value',
    minWidth: 130,
    flex: 0.9,
    type: 'number',
    align: 'right',
    headerAlign: 'right',
    renderCell: (params) => (
      <Box sx={{ textAlign: 'right' }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>${params.value.toLocaleString()}</Typography>
        <Typography sx={{ fontSize: '0.6rem', color: colors.textSecondary }}>{params.row.quantity} EA @ ${params.row.unitPrice}</Typography>
      </Box>
    ),
  },
  {
    field: 'coverage',
    headerName: 'Coverage',
    minWidth: 100,
    flex: 0.7,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Box sx={{ width: '100%' }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: getStatusColor(params.row.status), textAlign: 'center' }}>
          {params.value === Infinity ? '∞' : `${params.value} days`}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={Math.min((params.value / 60) * 100, 100)}
          sx={{
            height: 5,
            borderRadius: 3,
            mt: 0.5,
            bgcolor: alpha(colors.textSecondary, 0.2),
            '& .MuiLinearProgress-bar': { bgcolor: getStatusColor(params.row.status), borderRadius: 3 },
          }}
        />
      </Box>
    ),
  },
  {
    field: 'gmroi',
    headerName: 'GMROI',
    minWidth: 90,
    flex: 0.6,
    type: 'number',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: params.value >= 2.5 ? '#10b981' : params.value >= 1.5 ? '#f59e0b' : '#ef4444' }}>
          {params.value}x
        </Typography>
        <Typography sx={{ fontSize: '0.55rem', color: colors.textSecondary }}>{params.row.gmroiBenchmark}</Typography>
      </Box>
    ),
  },
  {
    field: 'turns',
    headerName: 'Turns',
    minWidth: 90,
    flex: 0.6,
    type: 'number',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: params.value >= 5 ? '#10b981' : params.value >= 3 ? '#f59e0b' : '#ef4444' }}>
          {params.value}x
        </Typography>
        <Typography sx={{ fontSize: '0.55rem', color: colors.textSecondary }}>{params.row.turnsBenchmark}</Typography>
      </Box>
    ),
  },
  {
    field: 'carryingCost',
    headerName: 'Carrying Cost',
    minWidth: 110,
    flex: 0.7,
    type: 'number',
    align: 'right',
    headerAlign: 'right',
    renderCell: (params) => (
      <Box sx={{ textAlign: 'right' }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.textSecondary }}>${params.value.toLocaleString()}</Typography>
        <Typography sx={{ fontSize: '0.55rem', color: colors.textSecondary }}>per year</Typography>
      </Box>
    ),
  },
  {
    field: 'opportunity',
    headerName: 'Opportunity',
    minWidth: 120,
    flex: 0.8,
    type: 'number',
    align: 'right',
    headerAlign: 'right',
    renderCell: (params) => (
      <Box sx={{ textAlign: 'right' }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: params.value > 0 ? (params.row.status === 'critical' || params.row.status === 'at-risk' ? '#ef4444' : '#10b981') : colors.textSecondary }}>
          {params.value > 0 ? `$${(params.value / 1000).toFixed(0)}K` : '—'}
        </Typography>
        <Typography sx={{ fontSize: '0.55rem', color: colors.textSecondary }}>{params.row.opportunityType}</Typography>
      </Box>
    ),
  },
];

// Coverage chart data generator
const generateCoverageData = (item) => {
  const data = [];
  let inventory = item.quantity;
  const dailyDemand = item.avgMonthlyDemand / 30;

  for (let i = 0; i <= 30; i++) {
    // Add replenishment on certain days
    if (i === 5 || i === 12 || i === 19 || i === 26) {
      inventory += item.openPO / 4;
    }
    data.push({
      day: `D${i}`,
      inventory: Math.round(inventory),
      safetyStock: item.safetyStock,
      reorderPoint: item.reorderPoint,
    });
    inventory -= dailyDemand;
  }
  return data;
};

const InventoryHealthCheck = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const [selectedItem, setSelectedItem] = useState(null);
  const [plantFilter, setPlantFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [aiExpanded, setAiExpanded] = useState(false);

  // AI theme color for Tile 1 (Green-Cyan)
  const aiThemeColor = '#10b981';

  // Get columns with colors
  const columns = getColumns(colors);

  const filteredData = inventoryData.filter(item => {
    if (plantFilter !== 'all' && !item.plant.includes(plantFilter)) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    return true;
  });

  const handleRowClick = (params) => {
    setSelectedItem(params.row);
  };

  const handleFilterChange = (filterName, value) => {
    if (filterName === 'plant') setPlantFilter(value);
    if (filterName === 'status') setStatusFilter(value);
  };

  const renderSummaryCard = (kpi, color, borderColor) => (
    <Card
      variant="outlined"
      sx={{
        borderLeft: `4px solid ${borderColor}`,
        bgcolor: colors.cardBg,
        borderColor: colors.border,
        transition: 'all 0.2s',
        '&:hover': { transform: 'translateY(-2px)', borderColor: borderColor },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
          {kpi.label}
        </Typography>
        <Typography variant="h4" fontWeight={700} sx={{ color: color, mb: 0.5 }}>
          {kpi.value}
        </Typography>
        {kpi.trend && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              size="small"
              label={kpi.trend}
              icon={kpi.trendUp === null ? null : kpi.trendUp ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
              sx={{
                height: 20,
                fontSize: '0.6rem',
                bgcolor: kpi.trendUp === null ? alpha('#64748b', 0.12) : kpi.trendUp ? alpha('#ef4444', 0.12) : alpha('#10b981', 0.12),
                color: kpi.trendUp === null ? '#64748b' : kpi.trendUp ? '#ef4444' : '#10b981',
                '& .MuiChip-icon': { color: 'inherit' },
              }}
            />
            {kpi.skus && <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>{kpi.skus}</Typography>}
          </Stack>
        )}
        {kpi.sub && !kpi.trend && (
          <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>{kpi.sub}</Typography>
        )}
      </CardContent>
    </Card>
  );

  const renderDetailView = () => {
    const item = selectedItem;
    const chartData = generateCoverageData(item);

    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => setSelectedItem(null)}
          sx={{ mb: 2, color: colors.textSecondary }}
        >
          Back to Inventory Health
        </Button>

        {/* Detail Header */}
        <Card variant="outlined" sx={{ mb: 3, bgcolor: colors.cardBg, borderColor: colors.border }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={3}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: alpha(MODULE_COLOR, 0.12), color: MODULE_COLOR }}>
                <InventoryIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="h5" fontWeight={700} sx={{ color: MODULE_COLOR }}>
                    {item.id}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    @ {item.plant}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {item.description} | MRP Type: PD | Procurement: External
                </Typography>
              </Box>
              <Chip
                icon={item.status === 'critical' ? <ErrorIcon /> : item.status === 'healthy' ? <CheckCircleIcon /> : <WarningIcon />}
                label={item.statusLabel}
                sx={getStatusChipSx(item.status)}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Financial KPIs */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Inventory Value', value: `$${item.inventoryValue.toLocaleString()}`, sub: `${item.quantity} EA @ $${item.unitPrice}/unit`, color: MODULE_COLOR },
            { label: 'GMROI', value: `${item.gmroi}x`, sub: item.gmroiBenchmark, color: item.gmroi >= 2.5 ? '#10b981' : item.gmroi >= 1.5 ? '#f59e0b' : '#ef4444' },
            { label: 'Inventory Turns', value: `${item.turns}x`, sub: item.turnsBenchmark, color: item.turns >= 5 ? '#10b981' : item.turns >= 3 ? '#f59e0b' : '#ef4444' },
            { label: 'Annual Carrying Cost', value: `$${item.carryingCost.toLocaleString()}`, sub: '@ 22% holding rate', color: colors.textSecondary },
          ].map((kpi, idx) => (
            <Grid item xs={6} md={3} key={idx}>
              <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, textAlign: 'center', p: 2 }}>
                <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>{kpi.label}</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: kpi.color }}>{kpi.value}</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, mt: 0.5 }}>{kpi.sub}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Coverage KPIs */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Days Coverage', value: item.coverage === Infinity ? '∞' : `${item.coverage} days`, sub: 'Target: 21 days', color: item.coverage < 14 ? '#ef4444' : item.coverage > 60 ? '#8b5cf6' : '#10b981' },
            { label: 'Safety Stock Gap', value: `${item.quantity - item.safetyStock} EA`, sub: item.quantity < item.safetyStock ? `${Math.round((1 - item.quantity / item.safetyStock) * 100)}% below target` : 'On target', color: item.quantity < item.safetyStock ? '#ef4444' : '#10b981' },
            { label: 'DIO (Days Inv Outstanding)', value: item.turns > 0 ? `${Math.round(365 / item.turns)} days` : 'N/A', sub: item.turns > 5 ? 'Below avg (63 days)' : 'Above avg', color: item.turns > 5 ? '#10b981' : '#f59e0b' },
            { label: 'Stock-to-Sales Ratio', value: item.avgMonthlyDemand > 0 ? (item.quantity / item.avgMonthlyDemand).toFixed(2) : 'N/A', sub: item.quantity / item.avgMonthlyDemand < 0.5 ? 'Low buffer' : 'Good buffer', color: item.quantity / item.avgMonthlyDemand < 0.5 ? '#f59e0b' : '#10b981' },
          ].map((kpi, idx) => (
            <Grid item xs={6} md={3} key={idx}>
              <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, textAlign: 'center', p: 2 }}>
                <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>{kpi.label}</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: kpi.color }}>{kpi.value}</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, mt: 0.5 }}>{kpi.sub}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Charts and Details */}
        <Grid container spacing={2}>
          {/* Coverage Chart */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, p: 2, height: '100%' }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShowChartIcon sx={{ fontSize: 18 }} /> 30-Day Inventory Projection
              </Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(colors.textSecondary, 0.2)} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: colors.textSecondary }} />
                    <YAxis tick={{ fontSize: 10, fill: colors.textSecondary }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: '0.75rem' }}
                      labelStyle={{ color: colors.text }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
                    <Area type="monotone" dataKey="inventory" fill={alpha('#06b6d4', 0.2)} stroke="#06b6d4" strokeWidth={2} name="Inventory" />
                    <Line type="monotone" dataKey="safetyStock" stroke="#fbbf24" strokeWidth={2} strokeDasharray="6 4" dot={false} name="Safety Stock" />
                    <Line type="monotone" dataKey="reorderPoint" stroke="#10b981" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Reorder Point" />
                    <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Stockout', fill: '#ef4444', fontSize: 10 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          {/* Inventory Position */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, p: 2, height: '100%' }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryIcon sx={{ fontSize: 18 }} /> Current Inventory Position
              </Typography>
              {[
                { label: 'Unrestricted Stock', value: `${item.quantity} EA` },
                { label: 'Quality Inspection', value: '0 EA' },
                { label: 'Blocked Stock', value: '0 EA' },
                { label: 'In Transit', value: `${item.inTransit} EA`, color: '#06b6d4' },
                { label: 'Open PO Qty', value: `${item.openPO} EA`, color: '#06b6d4' },
                { label: 'Safety Stock Target', value: `${item.safetyStock} EA` },
                { label: 'Reorder Point', value: `${item.reorderPoint} EA` },
              ].map((row, idx) => (
                <Stack key={idx} direction="row" justifyContent="space-between" sx={{ py: 1, borderBottom: idx < 6 ? `1px solid ${colors.border}` : 'none' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>{row.label}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: row.color || colors.text }}>{row.value}</Typography>
                </Stack>
              ))}

              {/* Risk/Opportunity Box */}
              <Box sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: item.status === 'critical' || item.status === 'at-risk'
                  ? alpha('#ef4444', 0.08)
                  : alpha('#10b981', 0.08),
                border: `1px solid ${item.status === 'critical' || item.status === 'at-risk' ? alpha('#ef4444', 0.2) : alpha('#10b981', 0.2)}`,
              }}>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1.5 }}>
                  {item.status === 'critical' || item.status === 'at-risk'
                    ? <WarningIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                    : <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} />
                  }
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: item.status === 'critical' ? '#ef4444' : '#10b981' }}>
                    {item.status === 'critical' || item.status === 'at-risk' ? 'Revenue at Risk' : 'Working Capital Opportunity'}
                  </Typography>
                </Stack>
                <Grid container spacing={2}>
                  <Grid item xs={4} sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: item.status === 'critical' ? '#ef4444' : '#10b981' }}>
                      ${(item.opportunity / 1000).toFixed(0)}K
                    </Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: colors.textSecondary, textTransform: 'uppercase' }}>
                      {item.opportunityType}
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#f59e0b' }}>
                      ~{Math.round(item.avgMonthlyDemand > 0 ? (12 / (item.coverage / 30)) : 0)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: colors.textSecondary, textTransform: 'uppercase' }}>
                      Events/Year
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: getStatusColor(item.status) }}>
                      {item.status === 'critical' ? 'High' : item.status === 'at-risk' ? 'Medium' : 'Low'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: colors.textSecondary, textTransform: 'uppercase' }}>
                      Risk Score
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* AI Root Cause Analysis Panel */}
        {(() => {
          const aiAnalysis = getAIRootCause(item);
          return (
            <Paper
              sx={{
                mt: 3,
                p: 2.5,
                bgcolor: alpha('#00357a', 0.04),
                border: `1px solid ${alpha('#00357a', 0.15)}`,
                borderLeft: `4px solid #00357a`,
                borderRadius: 2,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: alpha('#00357a', 0.12) }}>
                  <SmartToyIcon sx={{ fontSize: 20, color: '#00357a' }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700, color: colors.text, fontSize: '0.95rem' }}>
                    AI Root Cause Analysis
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>
                    Why is this SKU at {item.statusLabel} status?
                  </Typography>
                </Box>
                <Chip
                  label={`${aiAnalysis.confidence}% Confidence`}
                  size="small"
                  sx={{ bgcolor: alpha('#10b981', 0.12), color: '#10b981', fontWeight: 600, fontSize: '0.7rem' }}
                />
              </Stack>

              {/* Summary */}
              <Typography sx={{ fontSize: '0.85rem', color: colors.text, mb: 2.5, lineHeight: 1.6 }}>
                {aiAnalysis.summary}
              </Typography>

              {/* Contributing Factors */}
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>
                Contributing Factors
              </Typography>
              <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                {aiAnalysis.factors.map((factor, idx) => (
                  <Grid item xs={12} md={4} key={idx}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: alpha(factor.color, 0.08),
                        border: `1px solid ${alpha(factor.color, 0.2)}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}
                    >
                      <factor.IconComponent sx={{ fontSize: 20, color: factor.color }} />
                      <Box>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: factor.color }}>
                          {factor.factor}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>
                          {factor.impact}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Recommended Actions */}
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>
                Recommended Actions
              </Typography>
              <Stack spacing={1}>
                {aiAnalysis.actions.map((action, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: colors.cardBg,
                      border: `1px solid ${colors.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Chip
                        label={action.priority}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          bgcolor: action.priority === 'HIGH' ? alpha('#ef4444', 0.12) : action.priority === 'MEDIUM' ? alpha('#f59e0b', 0.12) : alpha('#10b981', 0.12),
                          color: action.priority === 'HIGH' ? '#ef4444' : action.priority === 'MEDIUM' ? '#f59e0b' : '#10b981',
                        }}
                      />
                      <Typography sx={{ fontSize: '0.8rem', color: colors.text }}>
                        {action.action}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 500 }}>
                      {action.impact}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              {/* Cross-reference note */}
              <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${colors.border}` }}>
                <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, fontStyle: 'italic' }}>
                  Analysis based on data from: Tile 2 (Demand Variability), Tile 3 (Supply Signal), Tile 4 (MRP Parameters)
                </Typography>
              </Box>
            </Paper>
          );
        })()}

        {/* Classification, Demand, Supply */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, p: 2 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon sx={{ fontSize: 18 }} /> Classification
              </Typography>
              {[
                { label: 'ABC Class (Value)', value: item.abcClass, color: item.abcClass === 'A' ? '#10b981' : item.abcClass === 'B' ? '#f59e0b' : '#64748b' },
                { label: 'XYZ Class (Variability)', value: item.xyzClass, color: item.xyzClass === 'X' ? '#10b981' : item.xyzClass === 'Y' ? '#f59e0b' : '#ef4444' },
                { label: 'Combined', value: `${item.abcClass}/${item.xyzClass}`, color: '#06b6d4' },
                { label: 'Planning Strategy', value: item.abcClass === 'A' && item.xyzClass === 'Z' ? 'High SS + Frequent Review' : 'Standard', color: colors.text, fontSize: '0.65rem' },
              ].map((row, idx) => (
                <Stack key={idx} direction="row" justifyContent="space-between" sx={{ py: 1, borderBottom: idx < 3 ? `1px solid ${colors.border}` : 'none' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>{row.label}</Typography>
                  <Typography sx={{ fontSize: row.fontSize || '0.75rem', fontWeight: 600, color: row.color }}>{row.value}</Typography>
                </Stack>
              ))}
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, p: 2 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShowChartIcon sx={{ fontSize: 18 }} /> Demand Profile
              </Typography>
              {[
                { label: 'Avg Monthly Demand', value: `${item.avgMonthlyDemand.toLocaleString()} EA` },
                { label: 'Demand CV', value: item.demandCV.toFixed(2), color: item.demandCV > 0.7 ? '#ef4444' : item.demandCV > 0.4 ? '#f59e0b' : '#10b981' },
                { label: 'Forecast Accuracy', value: `${item.forecastAccuracy}%`, color: item.forecastAccuracy >= 80 ? '#10b981' : item.forecastAccuracy >= 60 ? '#f59e0b' : '#ef4444' },
                { label: 'Seasonality', value: 'Q4 Peak (1.3x)' },
              ].map((row, idx) => (
                <Stack key={idx} direction="row" justifyContent="space-between" sx={{ py: 1, borderBottom: idx < 3 ? `1px solid ${colors.border}` : 'none' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>{row.label}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: row.color || colors.text }}>{row.value}</Typography>
                </Stack>
              ))}
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, p: 2 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalShippingIcon sx={{ fontSize: 18 }} /> Supply Profile
              </Typography>
              {[
                { label: 'Primary Vendor', value: item.primaryVendor },
                { label: 'Planned Lead Time', value: `${item.plannedLeadTime} days` },
                { label: 'Actual Lead Time', value: `${item.actualLeadTime} days`, color: item.actualLeadTime > item.plannedLeadTime ? '#ef4444' : '#10b981' },
                { label: 'Vendor OTD', value: `${item.vendorOTD}%`, color: item.vendorOTD >= 90 ? '#10b981' : item.vendorOTD >= 75 ? '#f59e0b' : '#ef4444' },
              ].map((row, idx) => (
                <Stack key={idx} direction="row" justifyContent="space-between" sx={{ py: 1, borderBottom: idx < 3 ? `1px solid ${colors.border}` : 'none' }}>
                  <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>{row.label}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: row.color || colors.text }}>{row.value}</Typography>
                </Stack>
              ))}
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: colors.background, overflow: 'auto' }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={() => onBack('core')} sx={{ textDecoration: 'none', color: colors.text, '&:hover': { textDecoration: 'underline', color: colors.primary }, cursor: 'pointer' }}>
              CORE.AI
            </Link>
            <Link component="button" variant="body1" onClick={() => onBack('stox')} sx={{ textDecoration: 'none', color: colors.text, '&:hover': { textDecoration: 'underline', color: colors.primary }, cursor: 'pointer' }}>
              STOX.AI
            </Link>
            <Link component="button" variant="body1" onClick={() => onBack('distribution')} sx={{ textDecoration: 'none', color: colors.text, '&:hover': { textDecoration: 'underline', color: colors.primary }, cursor: 'pointer' }}>
              Distribution
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              Inventory Health Check
            </Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={() => onBack('distribution')} variant="outlined" size="small" sx={{ borderColor: colors.border }}>
            Back to Distribution
          </Button>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: alpha('#10b981', 0.12), color: '#10b981' }}>
            <HealthAndSafetyIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
              Inventory Health Check
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Tile 1 - The Diagnosis
            </Typography>
          </Box>
          <Chip label="TILE 1" size="small" sx={{ ml: 'auto', bgcolor: alpha('#10b981', 0.12), color: '#10b981', fontWeight: 700 }} />
        </Stack>
      </Box>

      {selectedItem ? renderDetailView() : (
        <>
          {/* Summary KPIs - Row 1 */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} md={2}>{renderSummaryCard(summaryKPIs.totalValue, '#06b6d4', '#06b6d4')}</Grid>
            <Grid item xs={6} md={2}>{renderSummaryCard(summaryKPIs.deadStock, '#ef4444', '#ef4444')}</Grid>
            <Grid item xs={6} md={2}>{renderSummaryCard(summaryKPIs.excessStock, '#f59e0b', '#f59e0b')}</Grid>
            <Grid item xs={6} md={2}>{renderSummaryCard(summaryKPIs.gmroi, '#10b981', '#10b981')}</Grid>
            <Grid item xs={6} md={2}>{renderSummaryCard(summaryKPIs.turns, '#10b981', '#10b981')}</Grid>
            <Grid item xs={6} md={2}>{renderSummaryCard(summaryKPIs.carryingCost, '#f59e0b', '#f59e0b')}</Grid>
          </Grid>

          {/* Summary KPIs - Row 2 */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {Object.values(operationalKPIs).map((kpi, idx) => (
              <Grid item xs={6} md={2} key={idx}>
                <Card variant="outlined" sx={{ borderLeft: `4px solid ${kpi.color}`, bgcolor: colors.cardBg, borderColor: colors.border }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                      {kpi.label}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ color: kpi.color }}>
                      {kpi.value}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>{kpi.sub}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* AI Insight Card */}
          <Paper
            sx={{
              p: 1.5,
              mb: 2,
              bgcolor: alpha(aiThemeColor, 0.04),
              border: `1px solid ${alpha(aiThemeColor, 0.15)}`,
              borderLeft: `3px solid ${aiThemeColor}`,
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: alpha(aiThemeColor, 0.08),
                borderColor: alpha(aiThemeColor, 0.25),
              },
            }}
            onClick={() => setAiExpanded(!aiExpanded)}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(aiThemeColor, 0.15) }}>
                <SmartToyIcon sx={{ fontSize: 18, color: aiThemeColor }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.8rem', color: colors.text }}>
                  <strong>AI Insights:</strong> {aiRecommendations.summary}
                </Typography>
              </Box>
              <Chip
                label={`${aiRecommendations.confidence}% Confidence`}
                size="small"
                sx={{ bgcolor: alpha(aiThemeColor, 0.12), color: aiThemeColor, fontWeight: 600, fontSize: '0.7rem' }}
              />
              {aiExpanded ? (
                <ExpandLessIcon sx={{ color: colors.textSecondary, fontSize: 20 }} />
              ) : (
                <ExpandMoreIcon sx={{ color: colors.textSecondary, fontSize: 20 }} />
              )}
            </Stack>

            {/* Expandable AI Insight Details */}
            <Collapse in={aiExpanded}>
              <Grid container spacing={2} sx={{ mt: 1.5 }}>
                {aiRecommendations.insights.map((insight, idx) => (
                  <Grid item xs={12} md={4} key={idx}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: alpha(insight.color, 0.08),
                        border: `1px solid ${alpha(insight.color, 0.2)}`,
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <insight.IconComponent sx={{ fontSize: 18, color: insight.color }} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: insight.color }}>
                          {insight.title}
                        </Typography>
                        <Chip
                          label={insight.priority}
                          size="small"
                          sx={{
                            ml: 'auto',
                            height: 18,
                            fontSize: '0.6rem',
                            bgcolor: alpha(insight.color, 0.15),
                            color: insight.color,
                            fontWeight: 700,
                          }}
                        />
                      </Stack>
                      <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, mb: 0.5 }}>
                        {insight.description}
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: insight.color }}>
                          {insight.impact}
                        </Typography>
                        <Button
                          size="small"
                          sx={{
                            fontSize: '0.65rem',
                            color: insight.color,
                            textTransform: 'none',
                            p: 0,
                            minWidth: 'auto',
                            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                          }}
                        >
                          {insight.action} →
                        </Button>
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Collapse>
          </Paper>

          {/* Filter Bar */}
          <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
            <FilterListIcon sx={{ color: colors.textSecondary }} />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel sx={{ color: colors.textSecondary }}>Plant</InputLabel>
              <Select
                value={plantFilter}
                label="Plant"
                onChange={(e) => handleFilterChange('plant', e.target.value)}
                sx={{
                  color: colors.text,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                  '& .MuiSvgIcon-root': { color: colors.text },
                }}
                MenuProps={{ PaperProps: { sx: { bgcolor: colors.paper, border: `1px solid ${colors.border}`, '& .MuiMenuItem-root': { color: colors.text, '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' } } } } }}
              >
                <MenuItem value="all">All Plants</MenuItem>
                <MenuItem value="P1000">P1000 - Detroit</MenuItem>
                <MenuItem value="P2000">P2000 - Phoenix</MenuItem>
                <MenuItem value="P3000">P3000 - Seattle</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel sx={{ color: colors.textSecondary }}>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
                sx={{
                  color: colors.text,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                  '& .MuiSvgIcon-root': { color: colors.text },
                }}
                MenuProps={{ PaperProps: { sx: { bgcolor: colors.paper, border: `1px solid ${colors.border}`, '& .MuiMenuItem-root': { color: colors.text, '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' } } } } }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="at-risk">At Risk</MenuItem>
                <MenuItem value="healthy">Healthy</MenuItem>
                <MenuItem value="excess">Excess</MenuItem>
                <MenuItem value="dead">Dead Stock</MenuItem>
              </Select>
            </FormControl>
            <Typography sx={{ ml: 'auto', fontSize: '0.8rem', color: colors.textSecondary }}>
              Showing {filteredData.length} of {inventoryData.length} items
            </Typography>
          </Paper>

          {/* DataGrid */}
          <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 400, width: '100%', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
            <DataGrid
              rows={filteredData}
              columns={columns}
              density="compact"
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              onRowClick={handleRowClick}
              sx={{
                ...stoxTheme.getDataGridSx({ clickable: true }),
                bgcolor: colors.paper,
                color: colors.text,
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  color: colors.text,
                  borderBottom: `1px solid ${colors.border}`,
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  color: colors.text,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                },
                '& .MuiDataGrid-cell': {
                  color: colors.text,
                  borderBottom: `1px solid ${colors.border}`,
                },
                '& .MuiDataGrid-row': {
                  '&:hover': {
                    bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : alpha(MODULE_COLOR, 0.05),
                  },
                },
                '& .MuiDataGrid-footerContainer': {
                  bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  borderTop: `1px solid ${colors.border}`,
                  color: colors.text,
                },
                '& .MuiTablePagination-root': {
                  color: colors.text,
                },
                '& .MuiDataGrid-toolbarContainer': {
                  color: colors.text,
                  padding: '8px 16px',
                  '& .MuiButton-root': {
                    color: colors.text,
                  },
                },
              }}
            />
          </Paper>
        </>
      )}

      {/* Footer */}
      <Box sx={{ mt: 4, pt: 2, borderTop: `1px solid ${colors.border}` }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>
            STOX.AI Inventory Health Check • Tile 1 of 5 • Layer: The Diagnosis • Last Refresh: {new Date().toLocaleString()}
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>
            © 2025 Cloud Mantra LLC | Mantrix.AI
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default InventoryHealthCheck;
