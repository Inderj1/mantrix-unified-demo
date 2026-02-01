import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Stack,
  Button,
  Paper,
  Breadcrumbs,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  LocalShipping as LocalShippingIcon,
  Inventory as InventoryIcon,
  SmartToy as SmartToyIcon,
  FilterList as FilterListIcon,
  BarChart as BarChartIcon,
  Factory as FactoryIcon,
  Settings as SettingsIcon,
  Inventory2 as PackageIcon,
  SwapHoriz as SwapIcon,
  NotificationsActive as AlertIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Assessment as AssessmentIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Import centralized brand colors and stoxTheme
import { MODULE_COLOR, getColors } from '../../../config/brandColors';
import stoxTheme from '../stoxTheme';

// AI Quick Insights for list view
const aiQuickInsights = {
  confidence: 91,
  dataQuality: 91,
  summary: '3 vendors declining • 18 POs at risk • +4.2d avg LT gap',
};

// Status colors
const statusColors = {
  excellent: '#10b981',
  good: '#06b6d4',
  fair: '#f59e0b',
  poor: '#ef4444',
};

// Helper functions for chips
const getReliabilityChipSx = (reliability) => {
  const color = statusColors[reliability] || statusColors.fair;
  return {
    bgcolor: alpha(color, 0.12),
    color: color,
    fontWeight: 600,
    fontSize: '0.7rem',
    height: 24,
    border: `1px solid ${alpha(color, 0.3)}`,
  };
};

const getMetricColor = (value, thresholds) => {
  if (value >= thresholds.good) return '#10b981';
  if (value >= thresholds.warning) return '#f59e0b';
  return '#ef4444';
};

const getGapChipSx = (gap) => {
  if (gap > 0) {
    return {
      bgcolor: alpha('#ef4444', 0.12),
      color: '#ef4444',
      fontWeight: 600,
      fontSize: '0.7rem',
    };
  } else if (gap < 0) {
    return {
      bgcolor: alpha('#10b981', 0.12),
      color: '#10b981',
      fontWeight: 600,
      fontSize: '0.7rem',
    };
  }
  return {
    bgcolor: alpha('#64748b', 0.12),
    color: '#64748b',
    fontWeight: 600,
    fontSize: '0.7rem',
  };
};

// DataGrid column definitions
const getColumns = (colors) => [
  {
    field: 'id',
    headerName: 'Material',
    minWidth: 120,
    flex: 0.9,
    renderCell: (params) => (
      <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: colors.text }}>{params.value}</Typography>
    ),
  },
  {
    field: 'plant',
    headerName: 'Plant',
    minWidth: 80,
    flex: 0.5,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'vendor',
    headerName: 'Vendor',
    minWidth: 100,
    flex: 0.7,
  },
  {
    field: 'reliability',
    headerName: 'Reliability',
    minWidth: 110,
    flex: 0.7,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Chip
        icon={<Box sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: statusColors[params.value],
        }} />}
        label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
        size="small"
        sx={getReliabilityChipSx(params.value)}
      />
    ),
  },
  {
    field: 'plannedLT',
    headerName: 'Planned LT',
    minWidth: 90,
    flex: 0.6,
    type: 'number',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Typography sx={{ fontSize: '0.8rem', color: colors.text }}>{params.value} days</Typography>
    ),
  },
  {
    field: 'actualLT',
    headerName: 'Actual LT',
    minWidth: 90,
    flex: 0.6,
    type: 'number',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: getMetricColor(100 - params.row.gap * 5, { good: 80, warning: 60 }) }}>
        {params.value} days
      </Typography>
    ),
  },
  {
    field: 'gap',
    headerName: 'Gap',
    minWidth: 80,
    flex: 0.5,
    type: 'number',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Chip
        label={`${params.value > 0 ? '+' : ''}${params.value}d`}
        size="small"
        sx={getGapChipSx(params.value)}
      />
    ),
  },
  {
    field: 'ltVariability',
    headerName: 'LT Var.',
    minWidth: 80,
    flex: 0.5,
    type: 'number',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: getMetricColor(100 - params.value * 10, { good: 70, warning: 50 }) }}>
        ±{params.value}d
      </Typography>
    ),
  },
  {
    field: 'otd',
    headerName: 'OTD %',
    minWidth: 80,
    flex: 0.5,
    type: 'number',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: getMetricColor(params.value, { good: 90, warning: 75 }) }}>
        {params.value}%
      </Typography>
    ),
  },
  {
    field: 'qtyAccuracy',
    headerName: 'Qty Acc.',
    minWidth: 80,
    flex: 0.5,
    type: 'number',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: getMetricColor(params.value, { good: 95, warning: 85 }) }}>
        {params.value}%
      </Typography>
    ),
  },
];

// Mock data for supply lanes
const supplyLanesData = [
  {
    id: 'MAT-1001',
    plant: 'P1000',
    plantName: 'Detroit',
    vendor: 'VENDOR-A',
    vendorId: '10045678',
    description: 'Hydraulic Pump Assembly',
    reliability: 'fair',
    plannedLT: 14,
    actualLT: 21,
    gap: 7,
    ltVariability: 5,
    otd: 72,
    qtyAccuracy: 94,
    deliveriesAnalyzed: 25,
    vendorScore: 'C',
  },
  {
    id: 'MAT-2045',
    plant: 'P2000',
    plantName: 'Phoenix',
    vendor: 'VENDOR-B',
    vendorId: '10045679',
    description: 'Bearing Assembly 2x4',
    reliability: 'good',
    plannedLT: 10,
    actualLT: 12,
    gap: 2,
    ltVariability: 2,
    otd: 89,
    qtyAccuracy: 97,
    deliveriesAnalyzed: 30,
    vendorScore: 'B',
  },
  {
    id: 'MAT-3089',
    plant: 'P1000',
    plantName: 'Detroit',
    vendor: 'VENDOR-A',
    vendorId: '10045678',
    description: 'Gasket Kit Standard',
    reliability: 'excellent',
    plannedLT: 7,
    actualLT: 6,
    gap: -1,
    ltVariability: 1,
    otd: 96,
    qtyAccuracy: 99,
    deliveriesAnalyzed: 42,
    vendorScore: 'A',
  },
  {
    id: 'MAT-4012',
    plant: 'P3000',
    plantName: 'Seattle',
    vendor: 'VENDOR-C',
    vendorId: '10045680',
    description: 'Control Valve Assembly',
    reliability: 'poor',
    plannedLT: 21,
    actualLT: 34,
    gap: 13,
    ltVariability: 8,
    otd: 58,
    qtyAccuracy: 82,
    deliveriesAnalyzed: 18,
    vendorScore: 'D',
  },
  {
    id: 'MAT-5067',
    plant: 'P2000',
    plantName: 'Phoenix',
    vendor: 'VENDOR-D',
    vendorId: '10045681',
    description: 'Electronic Sensor Module',
    reliability: 'fair',
    plannedLT: 18,
    actualLT: 24,
    gap: 6,
    ltVariability: 4,
    otd: 74,
    qtyAccuracy: 91,
    deliveriesAnalyzed: 22,
    vendorScore: 'C',
  },
];

// Mock LT distribution data for chart
const ltDistributionData = [
  { range: '14-16d', count: 2, color: '#10b981' },
  { range: '16-18d', count: 4, color: '#10b981' },
  { range: '18-20d', count: 6, color: '#10b981' },
  { range: '20-22d', count: 5, color: '#f59e0b' },
  { range: '22-24d', count: 3, color: '#f59e0b' },
  { range: '24-26d', count: 2, color: '#ef4444' },
  { range: '26-28d', count: 1, color: '#ef4444' },
  { range: '28-30d', count: 1, color: '#ef4444' },
  { range: '30+d', count: 1, color: '#ef4444' },
];

// Mock delivery history
const deliveryHistory = [
  { po: 'PO 4500012345', date: 'Nov 15', lt: 18, status: 'onTime' },
  { po: 'PO 4500012298', date: 'Oct 28', lt: 16, status: 'onTime' },
  { po: 'PO 4500012156', date: 'Oct 10', lt: 28, status: 'veryLate' },
  { po: 'PO 4500012089', date: 'Sep 22', lt: 22, status: 'late' },
  { po: 'PO 4500011945', date: 'Sep 05', lt: 19, status: 'onTime' },
];

const SupplySignalAnalyzer = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const [selectedItem, setSelectedItem] = useState(null);
  const [plantFilter, setPlantFilter] = useState('all');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [sortBy, setSortBy] = useState('gap');

  // AI theme color for Tile 3 (Orange-Amber)
  const aiThemeColor = '#f97316';

  // Get columns with colors
  const columns = getColumns(colors);

  const filteredData = supplyLanesData.filter(item => {
    if (plantFilter !== 'all' && item.plant !== plantFilter) return false;
    if (vendorFilter !== 'all' && item.vendor !== vendorFilter) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'gap') return b.gap - a.gap;
    if (sortBy === 'otd') return a.otd - b.otd;
    return b.gap - a.gap;
  });

  const handleRowClick = (params) => {
    setSelectedItem(params.row);
  };

  const handleFilterChange = (filterName, value) => {
    if (filterName === 'plant') setPlantFilter(value);
    if (filterName === 'vendor') setVendorFilter(value);
    if (filterName === 'sort') setSortBy(value);
  };

  // KPI Card Component
  const KPICard = ({ label, value, color, sub, borderColor }) => (
    <Card
      variant="outlined"
      sx={{
        borderLeft: `4px solid ${borderColor || color}`,
        bgcolor: colors.cardBg,
        borderColor: colors.border,
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography
          sx={{
            fontSize: '0.65rem',
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 1,
            mb: 1,
          }}
        >
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={700} sx={{ color }}>
          {value}
        </Typography>
        {sub && (
          <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, mt: 0.5 }}>
            {sub}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  // Detail View
  if (selectedItem) {
    return (
      <Box
        sx={{
          p: 3,
          minHeight: '100vh',
          bgcolor: colors.background,
          overflow: 'auto',
        }}
      >
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => setSelectedItem(null)}
          sx={{
            mb: 3,
            color: colors.textSecondary,
            '&:hover': { color: '#f97316', bgcolor: alpha('#f97316', 0.08) },
          }}
        >
          Back to Supply Matrix
        </Button>

        {/* Detail Header */}
        <Card
          variant="outlined"
          sx={{
            mb: 3,
            bgcolor: colors.cardBg,
            borderColor: colors.border,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={3}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: '#00357a',
                }}
              >
                <InventoryIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="h5" fontWeight={700} sx={{ color: '#00357a' }}>
                    {selectedItem.id}
                  </Typography>
                  <Typography variant="h6" sx={{ color: colors.textSecondary }}>
                    @ {selectedItem.plant} - {selectedItem.plantName}
                  </Typography>
                </Stack>
                <Typography sx={{ color: colors.textSecondary, mt: 0.5 }}>
                  {selectedItem.description} | {selectedItem.vendor} | External Procurement
                </Typography>
              </Box>
              <Chip
                icon={<Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: statusColors[selectedItem.reliability],
                  mr: 1,
                }} />}
                label={`${selectedItem.reliability.charAt(0).toUpperCase() + selectedItem.reliability.slice(1)} Reliability`}
                sx={getReliabilityChipSx(selectedItem.reliability)}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Detail KPIs */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, textAlign: 'center', p: 2 }}>
              <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                Planned Lead Time
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ color: colors.text, mt: 1 }}>
                {selectedItem.plannedLT} days
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>MARC-PLIFZ</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, textAlign: 'center', p: 2 }}>
              <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                Actual Avg Lead Time
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ color: '#ef4444', mt: 1 }}>
                {selectedItem.actualLT} days
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: '#ef4444' }}>+{Math.round((selectedItem.actualLT / selectedItem.plannedLT - 1) * 100)}% vs planned</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, textAlign: 'center', p: 2 }}>
              <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                On-Time Delivery
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ color: getMetricColor(selectedItem.otd, { good: 90, warning: 75 }), mt: 1 }}>
                {selectedItem.otd}%
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Target: 95%</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, textAlign: 'center', p: 2 }}>
              <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                LT Variability
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ color: getMetricColor(100 - selectedItem.ltVariability * 10, { good: 70, warning: 50 }), mt: 1 }}>
                ±{selectedItem.ltVariability} days
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Std deviation</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Detail Grid */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* LT Distribution Chart */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <BarChartIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Lead Time Distribution (Last 25 Deliveries)
                  </Typography>
                </Stack>
                <Box sx={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ltDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                      <XAxis dataKey="range" tick={{ fontSize: 9, fill: colors.textSecondary }} />
                      <YAxis tick={{ fontSize: 10, fill: colors.textSecondary }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: colors.cardBg,
                          border: `1px solid ${colors.border}`,
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {ltDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
                <Divider sx={{ my: 2, borderColor: colors.border }} />
                <Stack direction="row" justifyContent="space-around">
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, textTransform: 'uppercase' }}>P10</Typography>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>16d</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, textTransform: 'uppercase' }}>P50 (Median)</Typography>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#06b6d4' }}>20d</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, textTransform: 'uppercase' }}>P90</Typography>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444' }}>28d</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, textTransform: 'uppercase' }}>Max</Typography>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444' }}>32d</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Vendor Performance */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <FactoryIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Vendor Performance
                    </Typography>
                  </Stack>
                  <Chip label="EKPO/EKES" size="small" sx={{ bgcolor: alpha('#f97316', 0.12), color: '#f97316', fontSize: '0.6rem' }} />
                </Stack>
                {[
                  { label: 'Vendor', value: `${selectedItem.vendor} (${selectedItem.vendorId})` },
                  { label: 'Vendor Reliability Score', value: `${selectedItem.vendorScore} (${selectedItem.otd}%)`, color: getMetricColor(selectedItem.otd, { good: 90, warning: 75 }) },
                  { label: 'Deliveries Analyzed', value: selectedItem.deliveriesAnalyzed },
                  { label: 'On-Time', value: `${Math.round(selectedItem.deliveriesAnalyzed * selectedItem.otd / 100)} (${selectedItem.otd}%)`, color: '#10b981' },
                  { label: 'Late (1-5 days)', value: `${Math.round(selectedItem.deliveriesAnalyzed * 0.16)} (16%)`, color: '#f59e0b' },
                  { label: 'Very Late (>5 days)', value: `${Math.round(selectedItem.deliveriesAnalyzed * 0.12)} (12%)`, color: '#ef4444' },
                  { label: 'Qty Accuracy', value: `${selectedItem.qtyAccuracy}%`, color: '#10b981' },
                ].map((row, idx) => (
                  <Stack
                    key={idx}
                    direction="row"
                    justifyContent="space-between"
                    sx={{ py: 1.25, borderBottom: idx < 6 ? `1px solid ${alpha(colors.border, 0.5)}` : 'none' }}
                  >
                    <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>{row.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: row.color || colors.text }}>{row.value}</Typography>
                  </Stack>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Second Row Detail Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* SAP Settings */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <SettingsIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                      SAP Lead Time Settings
                    </Typography>
                  </Stack>
                  <Chip label="MARC/EINA" size="small" sx={{ bgcolor: alpha('#f97316', 0.12), color: '#f97316', fontSize: '0.6rem' }} />
                </Stack>
                {[
                  { label: 'Planned Del. Time (PLIFZ)', value: `${selectedItem.plannedLT} days` },
                  { label: 'GR Processing Time (WEBAZ)', value: '2 days' },
                  { label: 'Total Planned LT', value: `${selectedItem.plannedLT + 2} days` },
                  { label: 'PIR Delivery Time', value: `${selectedItem.plannedLT - 2} days` },
                  { label: 'Last PIR Update', value: '8 months ago', color: '#f59e0b' },
                  { label: 'Source List', value: `${selectedItem.vendor} (Primary)` },
                ].map((row, idx) => (
                  <Stack
                    key={idx}
                    direction="row"
                    justifyContent="space-between"
                    sx={{ py: 1.25, borderBottom: idx < 5 ? `1px solid ${alpha(colors.border, 0.5)}` : 'none' }}
                  >
                    <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>{row.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: row.color || colors.text }}>{row.value}</Typography>
                  </Stack>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Deliveries */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <PackageIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Recent Deliveries
                  </Typography>
                </Stack>
                {deliveryHistory.map((delivery, idx) => (
                  <Stack
                    key={idx}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ py: 1.25, borderBottom: idx < deliveryHistory.length - 1 ? `1px solid ${alpha(colors.border, 0.5)}` : 'none' }}
                  >
                    <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>
                      {delivery.po} ({delivery.date})
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography sx={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: delivery.status === 'onTime' ? '#10b981' : delivery.status === 'late' ? '#f59e0b' : '#ef4444',
                      }}>
                        {delivery.lt}d
                      </Typography>
                      {delivery.status === 'onTime'
                        ? <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981' }} />
                        : <WarningIcon sx={{ fontSize: 14, color: delivery.status === 'late' ? '#f59e0b' : '#ef4444' }} />
                      }
                    </Stack>
                  </Stack>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Open Supply Pipeline */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <SwapIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Open Supply Pipeline
                  </Typography>
                </Stack>
                {[
                  { label: 'Open PO Qty', value: '500 EA', color: '#06b6d4' },
                  { label: 'Scheduled Delivery', value: 'Dec 15, 2025' },
                  { label: 'Predicted Delivery', value: 'Dec 22, 2025', color: '#f59e0b' },
                  { label: 'Risk Assessment', value: 'Medium (65%)', color: '#f59e0b' },
                  { label: 'In Transit', value: '250 EA (Ship Nov 28)' },
                  { label: 'PR (Pending)', value: '0 EA' },
                ].map((row, idx) => (
                  <Stack
                    key={idx}
                    direction="row"
                    justifyContent="space-between"
                    sx={{ py: 1.25, borderBottom: idx < 5 ? `1px solid ${alpha(colors.border, 0.5)}` : 'none' }}
                  >
                    <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>{row.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: row.color || colors.text }}>{row.value}</Typography>
                  </Stack>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* AI Recommendation Panel */}
        <Card
          sx={{
            bgcolor: alpha('#f97316', 0.04),
            border: `1px solid ${alpha('#f97316', 0.25)}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Animated top border */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              bgcolor: '#00357a',
            }}
          />
          <CardContent sx={{ p: 3, pt: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#00357a', width: 40, height: 40 }}>
                  <SmartToyIcon />
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#00357a' }}>
                    STOX.AI Supply Intelligence
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>
                    Analysis based on {selectedItem.deliveriesAnalyzed} deliveries over 12 months
                  </Typography>
                </Box>
              </Stack>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h5" fontWeight={700} sx={{ color: '#10b981' }}>91%</Typography>
                <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, textTransform: 'uppercase' }}>Data Quality</Typography>
              </Box>
            </Stack>

            {/* Vendor Capability Assessment - NEW */}
            <Card sx={{ bgcolor: alpha('#00357a', 0.04), mb: 2, p: 2, border: `1px solid ${alpha('#00357a', 0.12)}` }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <FactoryIcon sx={{ fontSize: 18, color: '#00357a' }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#00357a' }}>
                  Vendor Capability Assessment
                </Typography>
              </Stack>

              {/* Systematic vs Random Analysis */}
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.text, mb: 0.5 }}>
                  Delay Pattern Analysis
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary, lineHeight: 1.7 }}>
                  {selectedItem.gap > 5 && selectedItem.ltVariability < 4
                    ? `${selectedItem.vendor} shows a systematic delay pattern (+${selectedItem.gap} days consistently). The low variability (±${selectedItem.ltVariability}d) indicates this is a capability issue, not random variance. The vendor appears to have structural constraints (production capacity, logistics) causing predictable delays.`
                    : selectedItem.gap > 3 && selectedItem.ltVariability >= 4
                    ? `${selectedItem.vendor} exhibits high variability (±${selectedItem.ltVariability}d) with an average delay of +${selectedItem.gap} days. This suggests operational inconsistency rather than structural limitations. Root causes may include: quality issues requiring rework, logistics coordination problems, or resource allocation challenges.`
                    : selectedItem.gap <= 0
                    ? `${selectedItem.vendor} is performing at or better than planned lead times. Current variability of ±${selectedItem.ltVariability}d is within acceptable range. This vendor demonstrates strong supply chain discipline.`
                    : `${selectedItem.vendor} shows moderate delay pattern (+${selectedItem.gap} days) with ${selectedItem.ltVariability < 3 ? 'low' : 'moderate'} variability. This is likely due to conservative SAP planning parameters rather than vendor performance issues.`
                  }
                </Typography>
              </Box>

              {/* Alternative Sourcing Recommendation */}
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.text, mb: 0.5 }}>
                  Alternative Sourcing Analysis
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: alpha(colors.cardBg, 0.5), border: `1px solid ${colors.border}` }}>
                      <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, mb: 0.5 }}>Current: {selectedItem.vendor}</Typography>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: '0.75rem', color: colors.text }}>OTD: <strong style={{ color: getMetricColor(selectedItem.otd, { good: 90, warning: 75 }) }}>{selectedItem.otd}%</strong></Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: colors.text }}>LT: <strong>{selectedItem.actualLT}d</strong></Typography>
                      </Stack>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: alpha('#10b981', 0.08), border: `1px solid ${alpha('#10b981', 0.2)}` }}>
                      <Typography sx={{ fontSize: '0.7rem', color: '#10b981', mb: 0.5 }}>Alternative: VENDOR-B</Typography>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: '0.75rem', color: colors.text }}>OTD: <strong style={{ color: '#10b981' }}>89%</strong></Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: colors.text }}>LT: <strong>12d</strong></Typography>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
                <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, mt: 1 }}>
                  {selectedItem.otd < 80
                    ? `Recommendation: Consider dual-sourcing with VENDOR-B for critical orders. A 70/30 split could improve overall OTD from ${selectedItem.otd}% to ~85% while maintaining supply continuity.`
                    : `Current vendor performance is acceptable. Monitor for degradation before activating backup source.`
                  }
                </Typography>
              </Box>

              {/* Supply Chain Risk Indicator */}
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.text, mb: 1 }}>
                  Supply Chain Risk Score
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Single Source Risk</Typography>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#ef4444' }}>HIGH</Typography>
                    </Stack>
                    <Box sx={{ height: 6, bgcolor: alpha('#ef4444', 0.2), borderRadius: 1 }}>
                      <Box sx={{ width: '75%', height: '100%', bgcolor: '#ef4444', borderRadius: 1 }} />
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Geographic Risk</Typography>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#f59e0b' }}>MEDIUM</Typography>
                    </Stack>
                    <Box sx={{ height: 6, bgcolor: alpha('#f59e0b', 0.2), borderRadius: 1 }}>
                      <Box sx={{ width: '50%', height: '100%', bgcolor: '#f59e0b', borderRadius: 1 }} />
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Financial Risk</Typography>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#10b981' }}>LOW</Typography>
                    </Stack>
                    <Box sx={{ height: 6, bgcolor: alpha('#10b981', 0.2), borderRadius: 1 }}>
                      <Box sx={{ width: '25%', height: '100%', bgcolor: '#10b981', borderRadius: 1 }} />
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Card>

            {/* Recommendations */}
            <Card sx={{ bgcolor: alpha(colors.background, 0.5), mb: 2, p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <AlertIcon sx={{ fontSize: 18, color: '#ef4444' }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: colors.text }}>
                  Lead Time Correction Required
                </Typography>
                <Chip label="HIGH PRIORITY" size="small" sx={{ bgcolor: alpha('#ef4444', 0.15), color: '#ef4444', fontSize: '0.6rem', fontWeight: 600 }} />
              </Stack>
              <Typography sx={{ fontSize: '0.8rem', color: colors.textSecondary, lineHeight: 1.7 }}>
                <strong>Root Cause Analysis:</strong> {selectedItem.vendor} is consistently delivering {selectedItem.gap} days late ({Math.round((selectedItem.actualLT / selectedItem.plannedLT - 1) * 100)}% gap vs planned). The PIR lead time was last updated 8 months ago and no longer reflects actual supplier performance.<br /><br />
                <strong>Recommended Actions:</strong><br />
                • <strong>PLIFZ Update:</strong> Increase planned delivery time from {selectedItem.plannedLT} → {selectedItem.actualLT} days to match actual P50 performance<br />
                • <strong>Safety Time Buffer:</strong> Add SHZET (Safety Time) of 3 days to account for LT variability (±{selectedItem.ltVariability}d)<br />
                • <strong>PIR Update:</strong> Update Info Record delivery time from {selectedItem.plannedLT - 2} → {selectedItem.actualLT - 2} days<br />
                • <strong>Vendor Escalation:</strong> Flag {selectedItem.vendor} for performance review — OTD dropped from 85% → {selectedItem.otd}% over 6 months
              </Typography>
              <Divider sx={{ my: 2, borderColor: colors.border }} />
              <Stack direction="row" spacing={4}>
                <Box>
                  <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Stockout Risk Reduction:</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#10b981' }}>-45%</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>SS Increase Needed:</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#f59e0b' }}>+198 EA</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Working Capital Impact:</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#f59e0b' }}>+$39,600</Typography>
                </Box>
              </Stack>
            </Card>

            <Card sx={{ bgcolor: alpha(colors.background, 0.5), mb: 3, p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <SwapIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: colors.text }}>
                  Supply Variability Buffer
                </Typography>
                <Chip label="MEDIUM PRIORITY" size="small" sx={{ bgcolor: alpha('#f59e0b', 0.15), color: '#f59e0b', fontSize: '0.6rem', fontWeight: 600 }} />
              </Stack>
              <Typography sx={{ fontSize: '0.8rem', color: colors.textSecondary, lineHeight: 1.7 }}>
                <strong>Finding:</strong> Current safety stock calculation assumes stable lead times, but {selectedItem.vendor} shows ±{selectedItem.ltVariability} day variability. The SS formula should incorporate supply variability factor.<br /><br />
                <strong>Recommendations:</strong><br />
                • Apply Supply Variability Factor (SVF) of 1.35 to safety stock calculation<br />
                • Consider dual-sourcing from VENDOR-B (89% OTD) as backup for critical orders<br />
                • Implement vendor scorecard automation to track and alert on reliability degradation
              </Typography>
              <Divider sx={{ my: 2, borderColor: colors.border }} />
              <Stack direction="row" spacing={4}>
                <Box>
                  <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Service Level:</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#10b981' }}>92% → 97%</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Expedite Reduction:</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#10b981' }}>-60%</Typography>
                </Box>
              </Stack>
            </Card>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: '#00357a',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#002352',
                  },
                }}
              >
                Accept & Update PLIFZ
              </Button>
              <Button
                variant="outlined"
                startIcon={<AssessmentIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderColor: colors.border,
                  color: colors.textSecondary,
                  '&:hover': {
                    bgcolor: alpha('#00357a', 0.08),
                    borderColor: '#00357a',
                    color: '#00357a',
                  },
                }}
              >
                Compare Alt Vendors
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExportIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderColor: colors.border,
                  color: colors.textSecondary,
                  '&:hover': {
                    bgcolor: alpha('#f97316', 0.08),
                    borderColor: '#f97316',
                    color: '#f97316',
                  },
                }}
              >
                Export Analysis
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // List View
  return (
    <Box
      sx={{
        p: 3,
        minHeight: '100vh',
        bgcolor: colors.background,
        overflow: 'auto',
      }}
    >
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link
              component="button"
              variant="body1"
              onClick={() => onBack('core')}
              sx={{
                textDecoration: 'none',
                color: colors.text,
                '&:hover': { textDecoration: 'underline', color: colors.primary },
                cursor: 'pointer',
              }}
            >
              CORE.AI
            </Link>
            <Link
              component="button"
              variant="body1"
              onClick={() => onBack('stox')}
              sx={{
                textDecoration: 'none',
                color: colors.text,
                '&:hover': { textDecoration: 'underline', color: colors.primary },
                cursor: 'pointer',
              }}
            >
              STOX.AI
            </Link>
            <Link
              component="button"
              variant="body1"
              onClick={() => onBack('distribution')}
              sx={{
                textDecoration: 'none',
                color: colors.text,
                '&:hover': { textDecoration: 'underline', color: colors.primary },
                cursor: 'pointer',
              }}
            >
              Distribution
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              Supply Signal Analyzer
            </Typography>
          </Breadcrumbs>

          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => onBack('distribution')}
            variant="outlined"
            size="small"
            sx={{ borderColor: colors.border }}
          >
            Back to Distribution
          </Button>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: alpha('#f97316', 0.12),
              color: '#f97316',
            }}
          >
            <LocalShippingIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
              Supply Signal Analyzer
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Lead Time & Vendor Reliability Analytics
            </Typography>
          </Box>
          <Chip
            label="TILE 3"
            size="small"
            sx={{
              ml: 'auto',
              bgcolor: alpha('#f97316', 0.12),
              color: '#f97316',
              fontWeight: 700,
            }}
          />
        </Stack>
      </Box>

      {/* Summary KPIs - Row 1 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <KPICard
            label="Avg Lead Time Gap"
            value="+4.2d"
            color="#f59e0b"
            sub="Actual vs Planned"
            borderColor="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KPICard
            label="On-Time Delivery"
            value="87.3%"
            color="#10b981"
            sub="Last 90 days"
            borderColor="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KPICard
            label="LT Variability"
            value="±3.8d"
            color="#f59e0b"
            sub="Avg deviation"
            borderColor="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KPICard
            label="Poor Reliability"
            value="42"
            color="#ef4444"
            sub="Vendor lanes < 75% OTD"
            borderColor="#ef4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KPICard
            label="Open POs at Risk"
            value="18"
            color="#f97316"
            sub="Likely delayed"
            borderColor="#f97316"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KPICard
            label="LT Corrections"
            value="156"
            color="#06b6d4"
            sub="PLIFZ updates needed"
            borderColor="#06b6d4"
          />
        </Grid>
      </Grid>

      {/* AI Quick Insight Card */}
      <Paper
        sx={{
          p: 1.5,
          mb: 2,
          bgcolor: alpha(aiThemeColor, 0.04),
          border: `1px solid ${alpha(aiThemeColor, 0.15)}`,
          borderLeft: `3px solid ${aiThemeColor}`,
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(aiThemeColor, 0.15) }}>
            <SmartToyIcon sx={{ fontSize: 18, color: aiThemeColor }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '0.8rem', color: colors.text }}>
              <strong>AI Insights:</strong> {aiQuickInsights.summary}
            </Typography>
          </Box>
          <Chip
            label={`${aiQuickInsights.dataQuality}% Data Quality`}
            size="small"
            sx={{ bgcolor: alpha(aiThemeColor, 0.12), color: aiThemeColor, fontWeight: 600, fontSize: '0.7rem' }}
          />
        </Stack>
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
          <InputLabel sx={{ color: colors.textSecondary }}>Vendor</InputLabel>
          <Select
            value={vendorFilter}
            label="Vendor"
            onChange={(e) => handleFilterChange('vendor', e.target.value)}
            sx={{
              color: colors.text,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
              '& .MuiSvgIcon-root': { color: colors.text },
            }}
            MenuProps={{ PaperProps: { sx: { bgcolor: colors.paper, border: `1px solid ${colors.border}`, '& .MuiMenuItem-root': { color: colors.text, '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' } } } } }}
          >
            <MenuItem value="all">All Vendors</MenuItem>
            <MenuItem value="VENDOR-A">VENDOR-A</MenuItem>
            <MenuItem value="VENDOR-B">VENDOR-B</MenuItem>
            <MenuItem value="VENDOR-C">VENDOR-C</MenuItem>
            <MenuItem value="VENDOR-D">VENDOR-D</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel sx={{ color: colors.textSecondary }}>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            sx={{
              color: colors.text,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
              '& .MuiSvgIcon-root': { color: colors.text },
            }}
            MenuProps={{ PaperProps: { sx: { bgcolor: colors.paper, border: `1px solid ${colors.border}`, '& .MuiMenuItem-root': { color: colors.text, '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' } } } } }}
          >
            <MenuItem value="gap">LT Gap ↓</MenuItem>
            <MenuItem value="otd">OTD ↑</MenuItem>
          </Select>
        </FormControl>
        <Typography sx={{ ml: 'auto', fontSize: '0.8rem', color: colors.textSecondary }}>
          Showing {filteredData.length} of {supplyLanesData.length} items
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
                bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : alpha('#f97316', 0.05),
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
    </Box>
  );
};

export default SupplySignalAnalyzer;
