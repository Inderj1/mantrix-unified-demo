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
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  LocalShipping as ShippingIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Lightbulb as LightbulbIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Route as RouteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import traxxTheme from './traxxTheme';

// Format currency
const formatCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
};

// Generate mock movement data
const generateMovementData = () => {
  const movements = [
    {
      id: 'MOV-2024-0847',
      kitId: 'NXS-PLIF-009',
      movementType: 'Loaner Return',
      origin: 'Stanford Medical Center',
      originShort: 'Stanford MC',
      destination: 'Phoenix Distribution Center',
      destinationShort: 'Phoenix DC',
      carrier: 'FedEx',
      serviceClass: 'Overnight',
      plannedCost: 200.00,
      actualCost: 245.50,
      variance: 45.50,
      variancePercent: 22.75,
      distanceMiles: 687,
      plannedDistance: 652,
      costPerMile: 0.36,
      benchmarkCostMile: 0.31,
      marginImpact: -45.50,
      optimizationSignal: 'Better carrier available',
      optimizationType: 'opportunity',
      baseFreight: 159.00,
      fuelSurcharge: 37.00,
      accessorials: 29.50,
      otherSurcharges: 20.00,
      dispatchTime: '2024-12-14T08:00:00Z',
      deliveryTime: '2024-12-15T10:30:00Z',
      kitRevenue: 11200,
      carrierPerformance: 82,
      etaVariance: 2.5,
      historicalAvg: 198.40,
      historicalLow: 156.00,
      historicalHigh: 289.00,
    },
    {
      id: 'MOV-2024-0851',
      kitId: 'NXS-TLIF-008',
      movementType: 'Transfer',
      origin: 'Dallas Distribution Center',
      originShort: 'Dallas DC',
      destination: 'Memphis Sterile Processing',
      destinationShort: 'Memphis SP',
      carrier: 'UPS',
      serviceClass: '2-Day',
      plannedCost: 145.00,
      actualCost: 138.25,
      variance: -6.75,
      variancePercent: -4.66,
      distanceMiles: 452,
      plannedDistance: 445,
      costPerMile: 0.31,
      benchmarkCostMile: 0.32,
      marginImpact: 6.75,
      optimizationSignal: 'On target',
      optimizationType: 'none',
      baseFreight: 98.00,
      fuelSurcharge: 22.50,
      accessorials: 0,
      otherSurcharges: 17.75,
      dispatchTime: '2024-12-13T14:00:00Z',
      deliveryTime: '2024-12-15T09:00:00Z',
      kitRevenue: 9800,
      carrierPerformance: 91,
      etaVariance: -1.0,
      historicalAvg: 142.80,
      historicalLow: 118.00,
      historicalHigh: 178.00,
    },
    {
      id: 'MOV-2024-0853',
      kitId: 'NXS-PLIF-003',
      movementType: 'Delivery',
      origin: 'Chicago Hub',
      originShort: 'Chicago Hub',
      destination: 'Cleveland Clinic',
      destinationShort: 'Cleveland Clinic',
      carrier: 'UPS',
      serviceClass: 'Ground',
      plannedCost: 89.00,
      actualCost: 124.75,
      variance: 35.75,
      variancePercent: 40.17,
      distanceMiles: 344,
      plannedDistance: 340,
      costPerMile: 0.36,
      benchmarkCostMile: 0.26,
      marginImpact: -35.75,
      optimizationSignal: 'Unexpected accessorials',
      optimizationType: 'alert',
      baseFreight: 72.00,
      fuelSurcharge: 16.50,
      accessorials: 24.25,
      otherSurcharges: 12.00,
      dispatchTime: '2024-12-13T16:45:00Z',
      deliveryTime: '2024-12-14T14:00:00Z',
      kitRevenue: 9800,
      carrierPerformance: 78,
      etaVariance: 0,
      historicalAvg: 92.40,
      historicalLow: 76.00,
      historicalHigh: 134.00,
    },
    {
      id: 'MOV-2024-0855',
      kitId: 'NXS-CERVICAL-001',
      movementType: 'Delivery',
      origin: 'Minneapolis Hub',
      originShort: 'Minneapolis Hub',
      destination: 'Mayo Clinic Rochester',
      destinationShort: 'Mayo Clinic',
      carrier: 'FedEx',
      serviceClass: 'Overnight',
      plannedCost: 175.00,
      actualCost: 178.50,
      variance: 3.50,
      variancePercent: 2.00,
      distanceMiles: 85,
      plannedDistance: 84,
      costPerMile: 2.10,
      benchmarkCostMile: 2.05,
      marginImpact: -3.50,
      optimizationSignal: 'Ground option available',
      optimizationType: 'opportunity',
      baseFreight: 145.00,
      fuelSurcharge: 18.50,
      accessorials: 0,
      otherSurcharges: 15.00,
      dispatchTime: '2024-12-14T06:00:00Z',
      deliveryTime: '2024-12-14T10:30:00Z',
      kitRevenue: 7200,
      carrierPerformance: 95,
      etaVariance: -0.5,
      historicalAvg: 168.00,
      historicalLow: 145.00,
      historicalHigh: 198.00,
    },
    {
      id: 'MOV-2024-0857',
      kitId: 'NXS-DEF-002',
      movementType: 'Delivery',
      origin: 'Baltimore Hub',
      originShort: 'Baltimore Hub',
      destination: 'Johns Hopkins Hospital',
      destinationShort: 'Johns Hopkins',
      carrier: 'FedEx',
      serviceClass: 'Ground',
      plannedCost: 65.00,
      actualCost: 112.00,
      variance: 47.00,
      variancePercent: 72.31,
      distanceMiles: 42,
      plannedDistance: 40,
      costPerMile: 2.67,
      benchmarkCostMile: 1.60,
      marginImpact: -47.00,
      optimizationSignal: 'Expedite fee detected',
      optimizationType: 'alert',
      baseFreight: 45.00,
      fuelSurcharge: 8.00,
      accessorials: 12.00,
      otherSurcharges: 47.00,
      dispatchTime: '2024-12-12T08:00:00Z',
      deliveryTime: '2024-12-12T14:00:00Z',
      kitRevenue: 28500,
      carrierPerformance: 88,
      etaVariance: 0,
      historicalAvg: 58.00,
      historicalLow: 42.00,
      historicalHigh: 95.00,
    },
    {
      id: 'MOV-2024-0859',
      kitId: 'NXS-TLIF-001',
      movementType: 'Delivery',
      origin: 'Boston Hub',
      originShort: 'Boston Hub',
      destination: 'Mass General Hospital',
      destinationShort: 'Mass General',
      carrier: 'FedEx',
      serviceClass: 'Ground',
      plannedCost: 55.00,
      actualCost: 87.50,
      variance: 32.50,
      variancePercent: 59.09,
      distanceMiles: 12,
      plannedDistance: 10,
      costPerMile: 7.29,
      benchmarkCostMile: 5.50,
      marginImpact: -32.50,
      optimizationSignal: 'Local courier cheaper',
      optimizationType: 'opportunity',
      baseFreight: 48.00,
      fuelSurcharge: 9.50,
      accessorials: 15.00,
      otherSurcharges: 15.00,
      dispatchTime: '2024-12-12T10:00:00Z',
      deliveryTime: '2024-12-12T12:30:00Z',
      kitRevenue: 12450,
      carrierPerformance: 85,
      etaVariance: 0.5,
      historicalAvg: 52.00,
      historicalLow: 38.00,
      historicalHigh: 78.00,
    },
    {
      id: 'MOV-2024-0861',
      kitId: 'NXS-TLIF-012',
      movementType: 'Loaner Return',
      origin: 'Methodist Le Bonheur',
      originShort: 'Methodist LB',
      destination: 'Memphis Sterile Processing',
      destinationShort: 'Memphis SP',
      carrier: 'FedEx',
      serviceClass: 'Ground',
      plannedCost: 45.00,
      actualCost: 98.25,
      variance: 53.25,
      variancePercent: 118.33,
      distanceMiles: 8,
      plannedDistance: 8,
      costPerMile: 12.28,
      benchmarkCostMile: 5.60,
      marginImpact: -53.25,
      optimizationSignal: 'Internal courier option',
      optimizationType: 'opportunity',
      baseFreight: 42.00,
      fuelSurcharge: 8.25,
      accessorials: 28.00,
      otherSurcharges: 20.00,
      dispatchTime: '2024-12-13T16:00:00Z',
      deliveryTime: '2024-12-13T17:30:00Z',
      kitRevenue: 8950,
      carrierPerformance: 72,
      etaVariance: 0,
      historicalAvg: 48.00,
      historicalLow: 35.00,
      historicalHigh: 72.00,
    },
    {
      id: 'MOV-2024-0863',
      kitId: 'NXS-DEF-007',
      movementType: 'Replenishment',
      origin: 'Phoenix Distribution Center',
      originShort: 'Phoenix DC',
      destination: 'Pending Assignment',
      destinationShort: 'TBD',
      carrier: 'TBD',
      serviceClass: 'TBD',
      plannedCost: 150.00,
      actualCost: 0,
      variance: 0,
      variancePercent: 0,
      distanceMiles: 0,
      plannedDistance: 500,
      costPerMile: 0,
      benchmarkCostMile: 0.30,
      marginImpact: 0,
      optimizationSignal: 'Awaiting route selection',
      optimizationType: 'pending',
      baseFreight: 0,
      fuelSurcharge: 0,
      accessorials: 0,
      otherSurcharges: 0,
      dispatchTime: null,
      deliveryTime: null,
      kitRevenue: 28500,
      carrierPerformance: 0,
      etaVariance: 0,
      historicalAvg: 145.00,
      historicalLow: 112.00,
      historicalHigh: 189.00,
    },
  ];

  return movements;
};

const LogisticsEconomics = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovement, setSelectedMovement] = useState(null);

  // Fetch data
  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(generateMovementData());
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRowClick = (params) => {
    setSelectedMovement(params.row);
  };

  const handleBackToList = () => {
    setSelectedMovement(null);
  };

  // Summary stats
  const completed = data.filter(m => m.actualCost > 0);
  const summaryStats = {
    totalFreight: completed.reduce((sum, m) => sum + m.actualCost, 0),
    costOverruns: completed.filter(m => m.variance > 0).reduce((sum, m) => sum + m.variance, 0),
    costSavings: completed.filter(m => m.variance < 0).reduce((sum, m) => sum + Math.abs(m.variance), 0),
    avgCostMile: completed.length > 0 ? completed.reduce((sum, m) => sum + m.costPerMile, 0) / completed.length : 0,
    optimizations: data.filter(m => m.optimizationType === 'opportunity').length,
    alerts: data.filter(m => m.optimizationType === 'alert').length,
    pendingMoves: data.filter(m => m.actualCost === 0).length,
    potentialSavings: data.filter(m => m.optimizationType === 'opportunity' || m.optimizationType === 'alert').reduce((sum, m) => sum + Math.abs(m.variance) + 30, 0),
  };

  // Get movement type chip style
  const getTypeChipProps = (type) => {
    const styles = {
      'Loaner Return': { bgcolor: alpha('#f97316', 0.12), color: '#ea580c', border: '1px solid', borderColor: alpha('#ea580c', 0.2) },
      'Replenishment': { bgcolor: alpha('#a855f7', 0.12), color: '#9333ea', border: '1px solid', borderColor: alpha('#9333ea', 0.2) },
      'Transfer': { bgcolor: alpha('#06b6d4', 0.12), color: '#0891b2', border: '1px solid', borderColor: alpha('#0891b2', 0.2) },
      'Delivery': { bgcolor: alpha('#10b981', 0.12), color: '#059669', border: '1px solid', borderColor: alpha('#059669', 0.2) },
    };
    return styles[type] || traxxTheme.chips.primary;
  };

  // Get carrier chip style
  const getCarrierChipProps = (carrier) => {
    const styles = {
      'FedEx': { bgcolor: alpha('#a855f7', 0.12), color: '#9333ea', border: '1px solid', borderColor: alpha('#9333ea', 0.2) },
      'UPS': { bgcolor: alpha('#f59e0b', 0.12), color: '#d97706', border: '1px solid', borderColor: alpha('#d97706', 0.2) },
      'TBD': { bgcolor: alpha('#64748b', 0.12), color: '#475569', border: '1px solid', borderColor: alpha('#475569', 0.2) },
    };
    return styles[carrier] || traxxTheme.chips.primary;
  };

  // Get service class chip style
  const getServiceChipProps = (service) => {
    const styles = {
      'Overnight': { bgcolor: alpha('#ef4444', 0.12), color: '#dc2626', border: '1px solid', borderColor: alpha('#dc2626', 0.2) },
      '2-Day': { bgcolor: alpha('#f97316', 0.12), color: '#ea580c', border: '1px solid', borderColor: alpha('#ea580c', 0.2) },
      'Ground': { bgcolor: alpha('#10b981', 0.12), color: '#059669', border: '1px solid', borderColor: alpha('#059669', 0.2) },
      'TBD': { bgcolor: alpha('#64748b', 0.12), color: '#475569', border: '1px solid', borderColor: alpha('#475569', 0.2) },
    };
    return styles[service] || traxxTheme.chips.primary;
  };

  // Get optimization chip style
  const getOptimizationChipProps = (type) => {
    const styles = {
      'opportunity': { bgcolor: alpha('#84cc16', 0.12), color: '#65a30d', border: '1px solid', borderColor: alpha('#65a30d', 0.3) },
      'alert': { bgcolor: alpha('#ef4444', 0.12), color: '#dc2626', border: '1px solid', borderColor: alpha('#dc2626', 0.3) },
      'warning': { bgcolor: alpha('#f59e0b', 0.12), color: '#d97706', border: '1px solid', borderColor: alpha('#d97706', 0.3) },
      'none': { bgcolor: alpha('#64748b', 0.12), color: '#475569', border: '1px solid', borderColor: alpha('#475569', 0.3) },
      'pending': { bgcolor: alpha('#06b6d4', 0.12), color: '#0891b2', border: '1px solid', borderColor: alpha('#0891b2', 0.3) },
    };
    return styles[type] || styles['none'];
  };

  // DataGrid columns
  const columns = [
    {
      field: 'id',
      headerName: 'Movement ID',
      minWidth: 130,
      flex: 1,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, color: '#059669', fontSize: '0.85rem' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'kitId',
      headerName: 'Kit ID',
      minWidth: 130,
      flex: 1,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: '#0891b2', fontSize: '0.8rem' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'movementType',
      headerName: 'Type',
      minWidth: 120,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip label={params.value} size="small" sx={{ ...getTypeChipProps(params.value), fontWeight: 600, fontSize: '0.7rem' }} />
      ),
    },
    {
      field: 'route',
      headerName: 'Route',
      minWidth: 200,
      flex: 1.4,
      valueGetter: (params) => {
        const row = params.row || params;
        return `${row.originShort} → ${row.destinationShort}`;
      },
      renderCell: (params) => {
        const row = params.row;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{row.originShort}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>→</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#1e293b' }}>{row.destinationShort}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'carrier',
      headerName: 'Carrier',
      minWidth: 90,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip label={params.value} size="small" sx={{ ...getCarrierChipProps(params.value), fontWeight: 600, fontSize: '0.7rem' }} />
      ),
    },
    {
      field: 'serviceClass',
      headerName: 'Service',
      minWidth: 100,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip label={params.value} size="small" sx={{ ...getServiceChipProps(params.value), fontWeight: 600, fontSize: '0.7rem' }} />
      ),
    },
    {
      field: 'plannedCost',
      headerName: 'Planned',
      minWidth: 90,
      flex: 0.7,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.85rem' }}>
          ${params.value.toFixed(0)}
        </Typography>
      ),
    },
    {
      field: 'actualCost',
      headerName: 'Actual',
      minWidth: 90,
      flex: 0.7,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>
          {params.value > 0 ? `$${params.value.toFixed(0)}` : '—'}
        </Typography>
      ),
    },
    {
      field: 'variance',
      headerName: 'Variance',
      minWidth: 100,
      flex: 0.8,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => {
        const value = params.value;
        const color = value > 10 ? '#dc2626' : value < -10 ? '#059669' : '#64748b';
        const sign = value > 0 ? '+' : '';
        return (
          <Typography sx={{ fontWeight: 700, color, fontSize: '0.85rem' }}>
            {value !== 0 ? `${sign}$${Math.abs(value).toFixed(0)}` : '—'}
          </Typography>
        );
      },
    },
    {
      field: 'distanceMiles',
      headerName: 'Distance',
      minWidth: 80,
      flex: 0.6,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: '#475569' }}>
          {params.value > 0 ? `${params.value} mi` : '—'}
        </Typography>
      ),
    },
    {
      field: 'costPerMile',
      headerName: '$/Mile',
      minWidth: 80,
      flex: 0.6,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => {
        const value = params.value;
        const benchmark = params.row.benchmarkCostMile;
        const color = value === 0 ? '#64748b' : value <= benchmark ? '#059669' : value <= benchmark * 1.2 ? '#d97706' : '#dc2626';
        return (
          <Typography sx={{ fontWeight: 600, color, fontSize: '0.8rem' }}>
            {value > 0 ? `$${value.toFixed(2)}` : '—'}
          </Typography>
        );
      },
    },
    {
      field: 'marginImpact',
      headerName: 'Margin',
      minWidth: 90,
      flex: 0.7,
      type: 'number',
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => {
        const value = params.value;
        const color = value < 0 ? '#dc2626' : value > 0 ? '#059669' : '#64748b';
        const sign = value > 0 ? '+' : '';
        return (
          <Typography sx={{ fontWeight: 700, color, fontSize: '0.8rem' }}>
            {value !== 0 ? `${sign}$${Math.abs(value).toFixed(0)}` : '—'}
          </Typography>
        );
      },
    },
    {
      field: 'optimizationSignal',
      headerName: 'Optimization',
      minWidth: 160,
      flex: 1.2,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{ ...getOptimizationChipProps(params.row.optimizationType), fontWeight: 600, fontSize: '0.65rem' }}
        />
      ),
    },
  ];

  // Render Detail View
  const renderDetailView = () => {
    if (!selectedMovement) return null;

    const m = selectedMovement;
    const varianceColor = m.variance > 10 ? '#dc2626' : m.variance < -10 ? '#059669' : '#64748b';
    const varianceSign = m.variance > 0 ? '+' : '';
    const variancePercent = m.plannedCost > 0 ? ((m.variance / m.plannedCost) * 100).toFixed(0) : 0;
    const distVariance = m.distanceMiles - m.plannedDistance;
    const potentialRecovery = Math.abs(m.variance) + 50;

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Header with Back Button */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList} variant="outlined" size="small">
            Back to Movement List
          </Button>
          <Stack direction="row" spacing={1}>
            <Chip label={m.id} size="small" sx={{ bgcolor: alpha('#10b981', 0.12), color: '#059669', fontWeight: 700, border: '1px solid', borderColor: alpha('#059669', 0.2) }} />
            <Chip label={m.movementType} size="small" sx={getTypeChipProps(m.movementType)} />
          </Stack>
        </Stack>

        {/* Movement Title */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: '#059669' }}>{m.id}</Typography>
        <Typography sx={{ color: '#64748b', mb: 1 }}>{m.movementType} — {m.origin} → {m.destination}</Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Chip label={m.carrier} size="small" sx={getCarrierChipProps(m.carrier)} />
          <Chip label={m.serviceClass} size="small" sx={getServiceChipProps(m.serviceClass)} />
          <Chip label={m.optimizationSignal} size="small" sx={getOptimizationChipProps(m.optimizationType)} />
        </Stack>

        {/* Cost Variance Banner */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, mb: 3, borderRadius: 2, bgcolor: alpha(varianceColor, 0.08), border: `1px solid ${alpha(varianceColor, 0.2)}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {m.variance > 0 ? <TrendingUpIcon sx={{ fontSize: 32, color: '#dc2626' }} /> : m.variance < 0 ? <TrendingDownIcon sx={{ fontSize: 32, color: '#059669' }} /> : <TimelineIcon sx={{ fontSize: 32, color: '#64748b' }} />}
            <Box>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Cost Variance</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#475569' }}>{m.variance > 0 ? 'Over budget' : m.variance < 0 ? 'Under budget' : 'On target'}</Typography>
            </Box>
          </Box>
          <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: varianceColor }}>
            {m.variance !== 0 ? `${varianceSign}$${Math.abs(m.variance).toFixed(2)}` : '—'}
          </Typography>
        </Box>

        {/* Detail Sections */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Movement Details */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <ShippingIcon sx={{ color: '#059669' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Movement Details
                  </Typography>
                </Stack>
                {[
                  { label: 'Movement ID', value: m.id, highlight: true },
                  { label: 'Kit ID', value: m.kitId, color: '#0891b2' },
                  { label: 'Movement Type', value: m.movementType },
                  { label: 'Origin', value: m.origin },
                  { label: 'Destination', value: m.destination },
                  { label: 'Dispatch Time', value: m.dispatchTime ? new Date(m.dispatchTime).toLocaleString() : '—' },
                  { label: 'Delivery Time', value: m.deliveryTime ? new Date(m.deliveryTime).toLocaleString() : '—' },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 6 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.15) }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: item.highlight ? '#059669' : item.color || '#1e293b', maxWidth: 160 }} noWrap>{item.value}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Freight Cost Breakdown */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ borderColor: alpha('#06b6d4', 0.3) }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <MoneyIcon sx={{ color: '#06b6d4' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Freight Cost Breakdown
                  </Typography>
                </Stack>
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', mb: 0.5 }}>Total Actual Cost</Typography>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: m.actualCost > m.plannedCost ? '#dc2626' : '#059669' }}>
                    {m.actualCost > 0 ? `$${m.actualCost.toFixed(2)}` : '—'}
                  </Typography>
                </Box>
                {/* Cost Breakdown Bar */}
                {m.actualCost > 0 && (
                  <Box sx={{ display: 'flex', height: 24, borderRadius: 1, overflow: 'hidden', mb: 2 }}>
                    <Box sx={{ width: `${(m.baseFreight / m.actualCost) * 100}%`, bgcolor: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ fontSize: '0.6rem', color: '#fff', fontWeight: 600 }}>${m.baseFreight.toFixed(0)}</Typography>
                    </Box>
                    <Box sx={{ width: `${(m.fuelSurcharge / m.actualCost) * 100}%`, bgcolor: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {(m.fuelSurcharge / m.actualCost) * 100 > 10 && <Typography sx={{ fontSize: '0.6rem', color: '#fff', fontWeight: 600 }}>${m.fuelSurcharge.toFixed(0)}</Typography>}
                    </Box>
                    <Box sx={{ width: `${(m.accessorials / m.actualCost) * 100}%`, bgcolor: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {(m.accessorials / m.actualCost) * 100 > 10 && <Typography sx={{ fontSize: '0.6rem', color: '#fff', fontWeight: 600 }}>${m.accessorials.toFixed(0)}</Typography>}
                    </Box>
                    <Box sx={{ width: `${(m.otherSurcharges / m.actualCost) * 100}%`, bgcolor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {(m.otherSurcharges / m.actualCost) * 100 > 8 && <Typography sx={{ fontSize: '0.6rem', color: '#fff', fontWeight: 600 }}>${m.otherSurcharges.toFixed(0)}</Typography>}
                    </Box>
                  </Box>
                )}
                {[
                  { label: 'Base Freight', value: `$${m.baseFreight.toFixed(2)}` },
                  { label: 'Fuel Surcharge', value: `$${m.fuelSurcharge.toFixed(2)}` },
                  { label: 'Accessorials', value: `$${m.accessorials.toFixed(2)}` },
                  { label: 'Other Surcharges', value: `$${m.otherSurcharges.toFixed(2)}` },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: idx < 3 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.15) }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>{item.value}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1.5 }} />
                {[
                  { label: 'Planned Cost', value: `$${m.plannedCost.toFixed(2)}` },
                  { label: 'Variance', value: m.variance !== 0 ? `${varianceSign}$${Math.abs(m.variance).toFixed(2)} (${variancePercent}%)` : '—', color: varianceColor },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: item.color ? 600 : 400 }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: item.color || '#1e293b' }}>{item.value}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Route Intelligence */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <RouteIcon sx={{ color: '#a855f7' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Route Intelligence
                  </Typography>
                </Stack>
                {[
                  { label: 'Planned Distance', value: `${m.plannedDistance} mi` },
                  { label: 'Actual Distance', value: m.distanceMiles > 0 ? `${m.distanceMiles} mi` : '—' },
                  { label: 'Distance Variance', value: m.distanceMiles > 0 ? `${distVariance > 0 ? '+' : ''}${distVariance} mi (${((distVariance / m.plannedDistance) * 100).toFixed(1)}%)` : '—', color: distVariance > 0 ? '#d97706' : '#059669' },
                  { label: 'Cost per Mile', value: m.costPerMile > 0 ? `$${m.costPerMile.toFixed(2)}` : '—' },
                  { label: 'Benchmark $/Mile', value: `$${m.benchmarkCostMile.toFixed(2)}` },
                  { label: 'Carrier Performance', value: m.carrierPerformance > 0 ? `${m.carrierPerformance}/100` : '—', color: m.carrierPerformance >= 90 ? '#059669' : m.carrierPerformance >= 80 ? '#d97706' : '#dc2626' },
                  { label: 'ETA Variance', value: m.etaVariance !== 0 ? `${m.etaVariance > 0 ? '+' : ''}${m.etaVariance} hrs ${m.etaVariance > 0 ? 'late' : 'early'}` : 'On time', color: m.etaVariance > 0 ? '#dc2626' : '#059669' },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 6 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.15) }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: item.color || '#1e293b' }}>{item.value}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Optimization Recommendations */}
        <Card variant="outlined" sx={{ mb: 3, borderColor: alpha('#84cc16', 0.3) }}>
          <CardContent sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <LightbulbIcon sx={{ color: '#84cc16' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                Optimization Recommendations
              </Typography>
            </Stack>
            <Grid container spacing={2}>
              {[
                { icon: '🔄', title: 'Use UPS for this lane', desc: 'Historical data shows UPS averages $0.28/mile on this route vs FedEx $0.36/mile', impact: 'Save ~$55 per shipment', type: 'success' },
                { icon: '📦', title: 'Select 2-Day vs Overnight', desc: 'SLA allows 48hr delivery — 2-Day service would meet requirements', impact: 'Save ~$78 per shipment', type: 'success' },
                { icon: '⚠️', title: 'Avoid residential delivery', desc: `Accessorial charge of $${m.accessorials.toFixed(2)} added — route to commercial address`, impact: `Save $${m.accessorials.toFixed(2)}`, type: 'warning' },
                { icon: '🚛', title: 'Consolidate with return batch', desc: '3 other kits returning to destination this week — consolidate pickup', impact: 'Save ~$85 combined', type: 'success' },
              ].map((rec, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <Box sx={{ p: 2, bgcolor: alpha(rec.type === 'warning' ? '#f59e0b' : '#84cc16', 0.05), borderRadius: 1, borderLeft: `3px solid ${rec.type === 'warning' ? '#f59e0b' : '#84cc16'}` }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontSize: '1rem' }}>{rec.icon}</Typography>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{rec.title}</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mb: 1 }}>{rec.desc}</Typography>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#84cc16' }}>{rec.impact}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Margin Impact & Historical Comparison */}
        <Grid container spacing={2} sx={{ pb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <TrendingUpIcon sx={{ color: '#f97316' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Margin Impact Analysis
                  </Typography>
                </Stack>
                {[
                  { label: 'Kit Revenue (This Instance)', value: formatCurrency(m.kitRevenue), color: '#059669' },
                  { label: 'Expected Freight Cost', value: `$${m.plannedCost.toFixed(2)}` },
                  { label: 'Actual Freight Cost', value: m.actualCost > 0 ? `$${m.actualCost.toFixed(2)}` : '—', color: m.actualCost > m.plannedCost ? '#dc2626' : '#059669' },
                  { label: 'Margin Erosion', value: m.marginImpact !== 0 ? `${m.marginImpact > 0 ? '+' : ''}$${m.marginImpact.toFixed(2)} (${((m.marginImpact / m.kitRevenue) * 100).toFixed(1)}%)` : '—', color: m.marginImpact < 0 ? '#dc2626' : '#059669' },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 3 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.15) }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: item.color || '#1e293b' }}>{item.value}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Optimized Margin Recovery</Typography>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#84cc16' }}>+${potentialRecovery.toFixed(2)}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <TimelineIcon sx={{ color: '#06b6d4' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Historical Comparison
                  </Typography>
                </Stack>
                {[
                  { label: 'Avg Cost (Same Route)', value: `$${m.historicalAvg.toFixed(2)}` },
                  { label: 'This Shipment vs Avg', value: m.actualCost > 0 ? `${m.actualCost > m.historicalAvg ? '+' : ''}$${(m.actualCost - m.historicalAvg).toFixed(2)} (${(((m.actualCost - m.historicalAvg) / m.historicalAvg) * 100).toFixed(0)}%)` : '—', color: m.actualCost > m.historicalAvg ? '#dc2626' : '#059669' },
                  { label: 'Lowest Cost (Same Route)', value: `$${m.historicalLow.toFixed(2)}`, color: '#059669' },
                  { label: 'Highest Cost (Same Route)', value: `$${m.historicalHigh.toFixed(2)}` },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 3 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.15) }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: item.color || '#1e293b' }}>{item.value}</Typography>
                  </Box>
                ))}
                {m.actualCost > 0 && (
                  <>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>This Shipment Percentile</Typography>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#d97706' }}>
                        {Math.round(((m.actualCost - m.historicalLow) / (m.historicalHigh - m.historicalLow)) * 100)}th {m.actualCost > (m.historicalHigh + m.historicalLow) / 2 ? '(above median)' : '(below median)'}
                      </Typography>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Main render
  return (
    <Box sx={{ p: 3, height: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>
              TRAXX.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              {selectedMovement ? selectedMovement.id : 'Logistics Economics'}
            </Typography>
          </Breadcrumbs>
          {!selectedMovement && (
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

        {/* Optimization Banner - Only show in list view */}
        {!selectedMovement && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, mb: 3, borderRadius: 2, background: `linear-gradient(135deg, ${alpha('#10b981', 0.08)}, ${alpha('#84cc16', 0.08)})`, border: `1px solid ${alpha('#10b981', 0.3)}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LightbulbIcon sx={{ fontSize: 32, color: '#84cc16' }} />
              <Box>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#059669' }}>OPTIMIZATION OPPORTUNITIES DETECTED</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {summaryStats.optimizations} shipments have cost-saving alternatives — {summaryStats.alerts} exceeded budget
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#84cc16' }}>{formatCurrency(summaryStats.potentialSavings)}</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Potential Savings Available</Typography>
            </Box>
          </Box>
        )}

        {/* Summary Cards - Only show in list view */}
        {!selectedMovement && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Total Freight (MTD)', value: formatCurrency(summaryStats.totalFreight), sub: `${completed.length} movements`, color: '#06b6d4', icon: <ShippingIcon /> },
              { label: 'Cost Overruns', value: `+$${summaryStats.costOverruns.toFixed(0)}`, sub: `${data.filter(m => m.variance > 0).length} shipments over budget`, color: '#ef4444', icon: <TrendingUpIcon /> },
              { label: 'Cost Savings', value: `-$${summaryStats.costSavings.toFixed(0)}`, sub: `${data.filter(m => m.variance < 0).length} shipments under budget`, color: '#10b981', icon: <TrendingDownIcon /> },
              { label: 'Avg Cost/Mile', value: `$${summaryStats.avgCostMile.toFixed(2)}`, sub: 'Target: $1.85', color: '#a855f7', icon: <SpeedIcon /> },
              { label: 'Optimization Available', value: formatCurrency(summaryStats.potentialSavings), sub: 'If recommendations applied', color: '#84cc16', icon: <LightbulbIcon /> },
              { label: 'Pending Movements', value: summaryStats.pendingMoves, sub: 'Ready for optimization', color: '#f59e0b', icon: <WarningIcon /> },
            ].map((stat, idx) => (
              <Grid item xs={6} sm={4} md={2} key={idx}>
                <Card sx={{ borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: `3px solid ${stat.color}` }}>
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
      {selectedMovement ? (
        renderDetailView()
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: alpha('#64748b', 0.2), background: `linear-gradient(90deg, ${alpha('#10b981', 0.05)}, ${alpha('#64748b', 0.02)})` }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                Movement Economics — <Typography component="span" sx={{ color: '#059669' }}>Click Row for Details</Typography>
              </Typography>
              <Chip label="SMADE IO | ERP | SHIPPING" size="small" sx={{ fontSize: '0.6rem', bgcolor: alpha('#10b981', 0.1), color: '#059669' }} />
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
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
                sorting: { sortModel: [{ field: 'variance', sort: 'desc' }] },
              }}
              sx={traxxTheme.getDataGridSx({ clickable: true })}
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

export default LogisticsEconomics;
