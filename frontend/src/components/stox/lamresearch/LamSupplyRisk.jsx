import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Breadcrumbs,
  Link,
  Stack,
  IconButton,
  LinearProgress,
  Button,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  LocalShipping as LocalShippingIcon,
  AttachMoney as AttachMoneyIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getColors, MODULE_COLOR } from '../../../config/brandColors';
import { stoxTheme } from '../stoxTheme';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ============================================
// MOCK DATA - 12 Vendor Rows
// ============================================
const VENDOR_DATA = [
  {
    id: 1,
    vendor: 'VENDOR-KYOCERA',
    risk: 'Critical',
    skuCount: 87,
    orderedEA: 12400,
    onTimeEA: 7192,
    lateEA: 5208,
    otdPct: 58,
    ssBurden: 2400000,
    riskPremium: 800000,
    ltGapDays: 22,
    avgLT: 42,
    stdDev: 11.3,
    minLT: 24,
    maxLT: 68,
    cvPct: 26.9,
    expediteCosts: 340000,
    monthlyOnTime: [320, 290, 310, 340, 280, 260, 300, 330, 310, 350, 290, 270],
    monthlyLate:  [220, 260, 240, 210, 270, 290, 250, 220, 240, 200, 260, 280],
  },
  {
    id: 2,
    vendor: 'VENDOR-EDWARDS',
    risk: 'Critical',
    skuCount: 64,
    orderedEA: 8900,
    onTimeEA: 5696,
    lateEA: 3204,
    otdPct: 64,
    ssBurden: 1850000,
    riskPremium: 620000,
    ltGapDays: 18,
    avgLT: 38,
    stdDev: 9.7,
    minLT: 22,
    maxLT: 61,
    cvPct: 25.5,
    expediteCosts: 275000,
    monthlyOnTime: [380, 400, 370, 350, 390, 420, 410, 380, 360, 400, 430, 405],
    monthlyLate:  [180, 160, 190, 210, 170, 140, 150, 180, 200, 160, 130, 155],
  },
  {
    id: 3,
    vendor: 'VENDOR-MKS',
    risk: 'High',
    skuCount: 72,
    orderedEA: 10200,
    onTimeEA: 7344,
    lateEA: 2856,
    otdPct: 72,
    ssBurden: 1200000,
    riskPremium: 480000,
    ltGapDays: 14,
    avgLT: 30,
    stdDev: 7.2,
    minLT: 18,
    maxLT: 48,
    cvPct: 24.0,
    expediteCosts: 195000,
    monthlyOnTime: [520, 540, 510, 530, 560, 580, 550, 520, 540, 570, 590, 534],
    monthlyLate:  [200, 180, 210, 190, 160, 140, 170, 200, 180, 150, 130, 186],
  },
  {
    id: 4,
    vendor: 'VENDOR-VAT',
    risk: 'High',
    skuCount: 45,
    orderedEA: 6300,
    onTimeEA: 4788,
    lateEA: 1512,
    otdPct: 76,
    ssBurden: 980000,
    riskPremium: 380000,
    ltGapDays: 12,
    avgLT: 28,
    stdDev: 6.1,
    minLT: 16,
    maxLT: 42,
    cvPct: 21.8,
    expediteCosts: 155000,
    monthlyOnTime: [340, 360, 350, 370, 380, 390, 360, 340, 370, 390, 400, 367],
    monthlyLate:  [110, 90, 100, 80, 70, 60, 90, 110, 80, 60, 50, 83],
  },
  {
    id: 5,
    vendor: 'VENDOR-ENTEGRIS',
    risk: 'High',
    skuCount: 58,
    orderedEA: 7800,
    onTimeEA: 6084,
    lateEA: 1716,
    otdPct: 78,
    ssBurden: 860000,
    riskPremium: 340000,
    ltGapDays: 11,
    avgLT: 26,
    stdDev: 5.4,
    minLT: 15,
    maxLT: 39,
    cvPct: 20.8,
    expediteCosts: 140000,
    monthlyOnTime: [460, 480, 470, 490, 500, 510, 480, 460, 490, 510, 520, 488],
    monthlyLate:  [130, 110, 120, 100, 90, 80, 110, 130, 100, 80, 70, 103],
  },
  {
    id: 6,
    vendor: 'VENDOR-BROOKS',
    risk: 'Medium',
    skuCount: 39,
    orderedEA: 5400,
    onTimeEA: 4374,
    lateEA: 1026,
    otdPct: 81,
    ssBurden: 620000,
    riskPremium: 240000,
    ltGapDays: 8,
    avgLT: 22,
    stdDev: 4.2,
    minLT: 14,
    maxLT: 34,
    cvPct: 19.1,
    expediteCosts: 95000,
    monthlyOnTime: [350, 370, 360, 380, 390, 400, 370, 350, 380, 400, 410, 378],
    monthlyLate:  [80, 60, 70, 50, 40, 30, 60, 80, 50, 30, 20, 50],
  },
  {
    id: 7,
    vendor: 'VENDOR-INFICON',
    risk: 'Medium',
    skuCount: 33,
    orderedEA: 4600,
    onTimeEA: 3864,
    lateEA: 736,
    otdPct: 84,
    ssBurden: 480000,
    riskPremium: 190000,
    ltGapDays: 6,
    avgLT: 20,
    stdDev: 3.8,
    minLT: 12,
    maxLT: 30,
    cvPct: 19.0,
    expediteCosts: 78000,
    monthlyOnTime: [300, 320, 310, 330, 340, 350, 320, 300, 330, 350, 360, 328],
    monthlyLate:  [55, 35, 45, 25, 15, 5, 35, 55, 25, 5, 0, 28],
  },
  {
    id: 8,
    vendor: 'VENDOR-HORIBA',
    risk: 'Medium',
    skuCount: 28,
    orderedEA: 3900,
    onTimeEA: 3354,
    lateEA: 546,
    otdPct: 86,
    ssBurden: 380000,
    riskPremium: 150000,
    ltGapDays: 5,
    avgLT: 18,
    stdDev: 3.2,
    minLT: 11,
    maxLT: 28,
    cvPct: 17.8,
    expediteCosts: 62000,
    monthlyOnTime: [270, 290, 280, 300, 310, 320, 290, 270, 300, 320, 330, 298],
    monthlyLate:  [40, 20, 30, 10, 0, 0, 20, 40, 10, 0, 0, 15],
  },
  {
    id: 9,
    vendor: 'VENDOR-SWAGELOK',
    risk: 'Medium',
    skuCount: 51,
    orderedEA: 7100,
    onTimeEA: 6248,
    lateEA: 852,
    otdPct: 88,
    ssBurden: 420000,
    riskPremium: 160000,
    ltGapDays: 4,
    avgLT: 16,
    stdDev: 2.9,
    minLT: 10,
    maxLT: 24,
    cvPct: 18.1,
    expediteCosts: 55000,
    monthlyOnTime: [500, 520, 510, 530, 540, 560, 520, 500, 530, 560, 570, 530],
    monthlyLate:  [60, 40, 50, 30, 20, 0, 40, 60, 30, 0, 0, 30],
  },
  {
    id: 10,
    vendor: 'VENDOR-PARKER',
    risk: 'Low',
    skuCount: 42,
    orderedEA: 5800,
    onTimeEA: 5336,
    lateEA: 464,
    otdPct: 92,
    ssBurden: 280000,
    riskPremium: 110000,
    ltGapDays: 2,
    avgLT: 14,
    stdDev: 2.1,
    minLT: 9,
    maxLT: 20,
    cvPct: 15.0,
    expediteCosts: 32000,
    monthlyOnTime: [440, 460, 450, 470, 480, 490, 460, 440, 470, 490, 500, 468],
    monthlyLate:  [30, 10, 20, 0, 0, 0, 10, 30, 0, 0, 0, 9],
  },
  {
    id: 11,
    vendor: 'VENDOR-SMC',
    risk: 'Low',
    skuCount: 36,
    orderedEA: 5000,
    onTimeEA: 4700,
    lateEA: 300,
    otdPct: 94,
    ssBurden: 240000,
    riskPremium: 95000,
    ltGapDays: 1,
    avgLT: 12,
    stdDev: 1.8,
    minLT: 8,
    maxLT: 18,
    cvPct: 15.0,
    expediteCosts: 22000,
    monthlyOnTime: [390, 400, 395, 410, 420, 430, 400, 390, 410, 430, 440, 410],
    monthlyLate:  [18, 8, 13, 0, 0, 0, 8, 18, 0, 0, 0, 6],
  },
  {
    id: 12,
    vendor: 'VENDOR-CKD',
    risk: 'Low',
    skuCount: 29,
    orderedEA: 4200,
    onTimeEA: 4032,
    lateEA: 168,
    otdPct: 96,
    ssBurden: 200000,
    riskPremium: 80000,
    ltGapDays: 0,
    avgLT: 10,
    stdDev: 1.4,
    minLT: 7,
    maxLT: 15,
    cvPct: 14.0,
    expediteCosts: 12000,
    monthlyOnTime: [340, 350, 345, 360, 370, 380, 350, 340, 360, 380, 390, 360],
    monthlyLate:  [10, 2, 5, 0, 0, 0, 2, 10, 0, 0, 0, 3],
  },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ============================================
// UTILITY FUNCTIONS
// ============================================
const formatCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
};

const formatNumber = (value) => value.toLocaleString();

const getRiskChipColor = (risk) => {
  switch (risk) {
    case 'Critical': return { bgcolor: alpha('#ef4444', 0.12), color: '#dc2626', borderColor: alpha('#dc2626', 0.2) };
    case 'High': return { bgcolor: alpha('#f59e0b', 0.12), color: '#d97706', borderColor: alpha('#d97706', 0.2) };
    case 'Medium': return { bgcolor: alpha(MODULE_COLOR, 0.12), color: MODULE_COLOR, borderColor: alpha(MODULE_COLOR, 0.2) };
    case 'Low': return { bgcolor: alpha('#10b981', 0.12), color: '#059669', borderColor: alpha('#059669', 0.2) };
    default: return { bgcolor: alpha('#64748b', 0.12), color: '#64748b', borderColor: alpha('#64748b', 0.2) };
  }
};

const getOtdColor = (pct) => {
  if (pct < 70) return '#ef4444';
  if (pct <= 85) return '#f59e0b';
  return '#10b981';
};

// ============================================
// COMPONENT
// ============================================
const LamSupplyRisk = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const [selectedRow, setSelectedRow] = useState(null);

  // Compute summary metrics
  const summaryMetrics = useMemo(() => {
    const totalPOs = VENDOR_DATA.reduce((sum, v) => sum + v.skuCount, 0);
    const totalOrdered = VENDOR_DATA.reduce((sum, v) => sum + v.orderedEA, 0);
    const totalOnTime = VENDOR_DATA.reduce((sum, v) => sum + v.onTimeEA, 0);
    const totalLate = VENDOR_DATA.reduce((sum, v) => sum + v.lateEA, 0);
    const avgOtd = totalOrdered > 0 ? Math.round((totalOnTime / totalOrdered) * 100) : 0;
    const totalSSBurden = VENDOR_DATA.reduce((sum, v) => sum + v.ssBurden, 0);
    const totalRiskPremium = VENDOR_DATA.reduce((sum, v) => sum + v.riskPremium, 0);
    const criticalVendors = VENDOR_DATA.filter(v => v.risk === 'Critical' || v.risk === 'High').length;
    return { totalPOs, avgOtd, totalLate, totalSSBurden, totalRiskPremium, criticalVendors };
  }, []);

  const handleRowClick = (params) => {
    setSelectedRow(params.row);
  };

  const handleCloseDetail = () => {
    setSelectedRow(null);
  };

  // ============================================
  // DATAGRID COLUMNS
  // ============================================
  const columns = [
    {
      field: 'vendor',
      headerName: 'Vendor',
      flex: 1,
      minWidth: 160,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: colors.text }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'risk',
      headerName: 'Risk',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const chipColor = getRiskChipColor(params.value);
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              ...chipColor,
              border: '1px solid',
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 22,
            }}
          />
        );
      },
    },
    {
      field: 'skuCount',
      headerName: 'SKUs',
      width: 80,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'orderedEA',
      headerName: 'Ordered EA',
      width: 100,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: colors.text }}>
          {formatNumber(params.value)}
        </Typography>
      ),
    },
    {
      field: 'onTimeEA',
      headerName: 'On-Time EA',
      width: 100,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: colors.text }}>
          {formatNumber(params.value)}
        </Typography>
      ),
    },
    {
      field: 'lateEA',
      headerName: 'Late EA',
      width: 90,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: params.value > 0 ? '#ef4444' : colors.text }}>
          {formatNumber(params.value)}
        </Typography>
      ),
    },
    {
      field: 'otdPct',
      headerName: 'OTD %',
      width: 80,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const pct = params.value;
        const barColor = getOtdColor(pct);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: '100%' }}>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(barColor, 0.15),
                '& .MuiLinearProgress-bar': { bgcolor: barColor, borderRadius: 3 },
              }}
            />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: barColor, minWidth: 28, textAlign: 'right' }}>
              {pct}%
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'ssBurden',
      headerName: 'SS Burden',
      width: 110,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text }}>
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'riskPremium',
      headerName: 'Risk Premium',
      width: 110,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text }}>
          {formatCurrency(params.value)}/yr
        </Typography>
      ),
    },
    {
      field: 'ltGapDays',
      headerName: 'LT Gap',
      width: 90,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: params.value > 10 ? '#ef4444' : colors.text }}>
          {params.value} days
        </Typography>
      ),
    },
  ];

  // ============================================
  // DARK MODE DATAGRID OVERRIDES
  // ============================================
  const dataGridSx = {
    ...stoxTheme.getDataGridSx({ clickable: true }),
    border: `1px solid ${colors.border}`,
    bgcolor: colors.paper,
    ...(darkMode && {
      '& .MuiDataGrid-columnHeaders': {
        backgroundColor: '#21262d',
        color: '#e6edf3',
        fontSize: '0.85rem',
        fontWeight: 700,
        borderBottom: `2px solid ${colors.border}`,
      },
      '& .MuiDataGrid-cell': {
        fontSize: '0.8rem',
        borderBottomColor: colors.border,
      },
      '& .MuiDataGrid-row': {
        cursor: 'pointer',
        '&:hover': { bgcolor: alpha('#4d9eff', 0.08) },
      },
      '& .MuiDataGrid-footerContainer': {
        borderTopColor: colors.border,
        color: colors.textSecondary,
      },
      '& .MuiTablePagination-root': { color: colors.textSecondary },
      '& .MuiDataGrid-toolbarContainer button': { color: colors.textSecondary },
    }),
  };

  // ============================================
  // DETAIL PANEL BAR CHART
  // ============================================
  const getDeliveryChartData = (row) => ({
    labels: MONTHS,
    datasets: [
      {
        label: 'On-Time',
        data: row.monthlyOnTime,
        backgroundColor: darkMode ? alpha('#10b981', 0.7) : alpha('#10b981', 0.8),
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 2,
      },
      {
        label: 'Late',
        data: row.monthlyLate,
        backgroundColor: darkMode ? alpha('#ef4444', 0.7) : alpha('#ef4444', 0.8),
        borderColor: '#ef4444',
        borderWidth: 1,
        borderRadius: 2,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#e6edf3' : '#1e293b',
          font: { size: 11, weight: 600 },
          usePointStyle: true,
          pointStyleWidth: 12,
        },
      },
      title: {
        display: true,
        text: '12-Month PO Delivery Performance',
        color: darkMode ? '#e6edf3' : '#1e293b',
        font: { size: 13, weight: 700 },
        padding: { bottom: 12 },
      },
      tooltip: {
        backgroundColor: darkMode ? '#21262d' : '#ffffff',
        titleColor: darkMode ? '#e6edf3' : '#1e293b',
        bodyColor: darkMode ? '#8b949e' : '#64748b',
        borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          color: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        },
        ticks: {
          color: darkMode ? '#8b949e' : '#64748b',
          font: { size: 10 },
        },
      },
      y: {
        stacked: true,
        grid: {
          color: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        },
        ticks: {
          color: darkMode ? '#8b949e' : '#64748b',
          font: { size: 10 },
        },
      },
    },
  };

  // ============================================
  // RENDER: DETAIL PANEL
  // ============================================
  const renderDetailPanel = () => {
    if (!selectedRow) return null;
    const row = selectedRow;
    const riskChipColor = getRiskChipColor(row.risk);

    return (
      <Paper
        elevation={0}
        sx={{
          mt: 2,
          p: 2.5,
          bgcolor: colors.paper,
          border: `1px solid ${colors.border}`,
          borderRadius: 2,
        }}
      >
        {/* Detail Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: colors.text }}>
              {row.vendor}
            </Typography>
            <Chip
              label={row.risk}
              size="small"
              sx={{ ...riskChipColor, border: '1px solid', fontWeight: 700, fontSize: '0.7rem' }}
            />
          </Stack>
          <IconButton size="small" onClick={handleCloseDetail} sx={{ color: colors.textSecondary }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Grid container spacing={2}>
          {/* Vendor Info Card */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={0}
              sx={{
                bgcolor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderLeft: `4px solid ${MODULE_COLOR}`,
                borderRadius: 2,
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: colors.text, mb: 1.5 }}>
                  Vendor Summary
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>SKU Count</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text }}>{row.skuCount}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Total Ordered</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text }}>{formatNumber(row.orderedEA)} EA</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>On-Time Delivery</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: getOtdColor(row.otdPct) }}>{row.otdPct}%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Late Deliveries</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#ef4444' }}>{formatNumber(row.lateEA)} EA</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>LT Gap</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: row.ltGapDays > 10 ? '#ef4444' : colors.text }}>{row.ltGapDays} days</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Lead Time Distribution */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={0}
              sx={{
                bgcolor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderLeft: '4px solid #0ea5e9',
                borderRadius: 2,
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: colors.text, mb: 1.5 }}>
                  Lead Time Distribution
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Avg Lead Time</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text }}>{row.avgLT} days</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Std Deviation</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text }}>{row.stdDev} days</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Min LT</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>{row.minLT} days</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Max LT</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#ef4444' }}>{row.maxLT} days</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>CV %</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: row.cvPct > 20 ? '#f59e0b' : colors.text }}>{row.cvPct}%</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Financial Impact */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={0}
              sx={{
                bgcolor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderLeft: '4px solid #f59e0b',
                borderRadius: 2,
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: colors.text, mb: 1.5 }}>
                  Financial Impact Breakdown
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Safety Stock Burden</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444' }}>{formatCurrency(row.ssBurden)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Risk Premium</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#f59e0b' }}>{formatCurrency(row.riskPremium)}/yr</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Expedite Costs</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text }}>{formatCurrency(row.expediteCosts)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5, borderTop: `1px solid ${colors.border}` }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: colors.textSecondary }}>Total Impact</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444' }}>
                      {formatCurrency(row.ssBurden + row.riskPremium + row.expediteCosts)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Bar Chart */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: 2,
                height: 280,
              }}
            >
              <Bar data={getDeliveryChartData(row)} options={chartOptions} />
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  // ============================================
  // RENDER: MAIN
  // ============================================
  return (
    <Box sx={{ p: 3, bgcolor: colors.background, minHeight: '100vh' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2.5,
          bgcolor: colors.paper,
          border: `1px solid ${colors.border}`,
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <IconButton
            size="small"
            onClick={onBack}
            sx={{
              bgcolor: alpha(MODULE_COLOR, 0.08),
              color: MODULE_COLOR,
              '&:hover': { bgcolor: alpha(MODULE_COLOR, 0.15) },
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14, color: colors.textSecondary }} />}>
            <Link
              underline="hover"
              sx={{ fontSize: '0.75rem', color: colors.textSecondary, cursor: 'pointer', fontWeight: 600 }}
              onClick={onBack}
            >
              CORE.AI
            </Link>
            <Link
              underline="hover"
              sx={{ fontSize: '0.75rem', color: colors.textSecondary, cursor: 'pointer', fontWeight: 600 }}
              onClick={onBack}
            >
              STOX.AI
            </Link>
            <Link
              underline="hover"
              sx={{ fontSize: '0.75rem', color: colors.textSecondary, cursor: 'pointer', fontWeight: 600 }}
              onClick={onBack}
            >
              Lam Research
            </Link>
            <Typography sx={{ fontSize: '0.75rem', color: MODULE_COLOR, fontWeight: 700 }}>
              Supply Risk & Vendor Perf.
            </Typography>
          </Breadcrumbs>
        </Stack>
        <Typography sx={{ fontWeight: 700, fontSize: '1.15rem', color: colors.text }}>
          Supply Risk & Vendor Performance — External Risk Lens
        </Typography>
      </Paper>

      {/* Dual-Lens Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {/* Vendor Delivery Performance */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: colors.paper,
              border: `1px solid ${colors.border}`,
              borderLeft: `4px solid ${MODULE_COLOR}`,
              borderRadius: 2,
              height: '100%',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  bgcolor: alpha(MODULE_COLOR, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LocalShippingIcon sx={{ fontSize: 20, color: MODULE_COLOR }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: colors.text }}>
                Vendor Delivery Performance
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, fontWeight: 600 }}>
                  POs Tracked
                </Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: colors.text }}>
                  842
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, fontWeight: 600 }}>
                  OTD Rate
                </Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: getOtdColor(78) }}>
                  78%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, fontWeight: 600 }}>
                  Late Deliveries
                </Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444' }}>
                  41,140 EA
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Capital Impact of Risk */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: colors.paper,
              border: `1px solid ${colors.border}`,
              borderLeft: `4px solid ${MODULE_COLOR}`,
              borderRadius: 2,
              height: '100%',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  bgcolor: alpha(MODULE_COLOR, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AttachMoneyIcon sx={{ fontSize: 20, color: MODULE_COLOR }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: colors.text }}>
                Capital Impact of Risk
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, fontWeight: 600 }}>
                  Safety Stock Burden
                </Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: colors.text }}>
                  $9.2M
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, fontWeight: 600 }}>
                  Risk Premium
                </Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b' }}>
                  $3.8M/yr
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, fontWeight: 600 }}>
                  Critical Vendors
                </Typography>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444' }}>
                  14
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* DataGrid */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: colors.paper,
          border: `1px solid ${colors.border}`,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${colors.border}` }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: colors.text }}>
            Vendor Risk Scorecard
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, mt: 0.25 }}>
            Click a row to view detailed vendor performance analysis
          </Typography>
        </Box>
        <Box sx={{ height: 520 }}>
          <DataGrid
            rows={VENDOR_DATA}
            columns={columns}
            density="compact"
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 300 },
              },
            }}
            initialState={{
              pagination: { paginationModel: { pageSize: 12 } },
              sorting: { sortModel: [{ field: 'otdPct', sort: 'asc' }] },
            }}
            pageSizeOptions={[12, 25]}
            sx={dataGridSx}
          />
        </Box>
      </Paper>

      {/* Detail Panel */}
      {renderDetailPanel()}
    </Box>
  );
};

export default LamSupplyRisk;
