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
  Tabs,
  Tab,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Dashboard as DashboardIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  CheckCircle,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  LocalHospital as HospitalIcon,
  Schedule as ScheduleIcon,
  Sensors as SensorsIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
  Map as MapIcon,
  ViewList as ListIcon,
} from '@mui/icons-material';
import traxxTheme from './traxxTheme';
import SmadeTrackerMap from './smadeTrackerMap';

// Format currency
const formatCurrency = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(2)}`;
};

// Generate mock kit data
const generateKitData = () => {
  const kits = [
    {
      id: 'NXS-TLIF-001',
      kitSerial: 'SN-2024-00147',
      kitType: 'Loaner',
      kitCategory: 'TLIF',
      currentStatus: 'At Hospital',
      locationDescription: 'Mass General Hospital',
      gpsLat: 42.3626,
      gpsLong: -71.0699,
      distributorName: 'Northeast Spine Solutions',
      hospitalName: 'Mass General Hospital',
      daysInStatus: 2,
      nextExpectedAction: 'Surgery Scheduled',
      priority: 'green',
      contractTier: 'Tier 1',
      trackerId: 'TRK-2847',
      lastHeartbeat: '2024-12-14T14:22:00Z',
      tempAlerts: 0,
      tamperAlerts: 0,
      lastShipmentWaybill: 'FX-789456123',
      lastShipmentProvider: 'FedEx',
      lastShipmentCost: 87.50,
      revenueThisUsage: 12450,
      cogsThisUsage: 4280,
      commissionThisUsage: 1245,
      shippingCostThisUsage: 87.50,
    },
    {
      id: 'NXS-PLIF-003',
      kitSerial: 'SN-2024-00163',
      kitType: 'Consignment',
      kitCategory: 'PLIF',
      currentStatus: 'In Transit',
      locationDescription: 'In Transit to Cleveland Clinic',
      gpsLat: 41.1234,
      gpsLong: -81.4567,
      distributorName: 'Midwest Ortho Partners',
      hospitalName: 'Cleveland Clinic',
      daysInStatus: 1,
      nextExpectedAction: 'Delivery Expected',
      priority: 'green',
      contractTier: 'Tier 2',
      trackerId: 'TRK-2851',
      lastHeartbeat: '2024-12-14T14:18:00Z',
      tempAlerts: 0,
      tamperAlerts: 0,
      lastShipmentWaybill: 'UPS-1Z999AA10',
      lastShipmentProvider: 'UPS',
      lastShipmentCost: 124.75,
      revenueThisUsage: 9800,
      cogsThisUsage: 3420,
      commissionThisUsage: 980,
      shippingCostThisUsage: 124.75,
    },
    {
      id: 'NXS-DEF-007',
      kitSerial: 'SN-2024-00098',
      kitType: 'Loaner',
      kitCategory: 'Deformity',
      currentStatus: 'Idle',
      locationDescription: 'Phoenix Distribution Center',
      gpsLat: 33.4484,
      gpsLong: -112.0740,
      distributorName: 'Southwest Surgical Supply',
      hospitalName: 'Unassigned',
      daysInStatus: 7,
      nextExpectedAction: 'Needs Assignment',
      priority: 'yellow',
      contractTier: 'Tier 1',
      trackerId: 'TRK-2839',
      lastHeartbeat: '2024-12-14T14:10:00Z',
      tempAlerts: 0,
      tamperAlerts: 0,
      lastShipmentWaybill: 'FX-456789012',
      lastShipmentProvider: 'FedEx',
      lastShipmentCost: 156.00,
      revenueThisUsage: 0,
      cogsThisUsage: 0,
      commissionThisUsage: 0,
      shippingCostThisUsage: 156.00,
    },
    {
      id: 'NXS-TLIF-012',
      kitSerial: 'SN-2024-00201',
      kitType: 'Loaner',
      kitCategory: 'TLIF',
      currentStatus: 'QC',
      locationDescription: 'Memphis Sterile Processing',
      gpsLat: 35.1495,
      gpsLong: -90.0490,
      distributorName: 'Southern Spine Distributors',
      hospitalName: 'Methodist Le Bonheur',
      daysInStatus: 0,
      nextExpectedAction: 'Ready for Redeployment',
      priority: 'green',
      contractTier: 'Tier 2',
      trackerId: 'TRK-2856',
      lastHeartbeat: '2024-12-14T14:25:00Z',
      tempAlerts: 0,
      tamperAlerts: 0,
      lastShipmentWaybill: 'FX-321654987',
      lastShipmentProvider: 'FedEx',
      lastShipmentCost: 98.25,
      revenueThisUsage: 8950,
      cogsThisUsage: 3100,
      commissionThisUsage: 895,
      shippingCostThisUsage: 98.25,
    },
    {
      id: 'NXS-PLIF-009',
      kitSerial: 'SN-2024-00089',
      kitType: 'Consignment',
      kitCategory: 'PLIF',
      currentStatus: 'Idle',
      locationDescription: 'Stanford Medical Center',
      gpsLat: 37.4346,
      gpsLong: -122.1609,
      distributorName: 'Pacific Surgical Partners',
      hospitalName: 'Stanford Medical Center',
      daysInStatus: 14,
      nextExpectedAction: 'Review Required',
      priority: 'red',
      contractTier: 'Tier 1',
      trackerId: 'TRK-2822',
      lastHeartbeat: '2024-12-14T13:55:00Z',
      tempAlerts: 1,
      tamperAlerts: 0,
      lastShipmentWaybill: 'UPS-1Z888BB20',
      lastShipmentProvider: 'UPS',
      lastShipmentCost: 145.50,
      revenueThisUsage: 11200,
      cogsThisUsage: 3890,
      commissionThisUsage: 1120,
      shippingCostThisUsage: 145.50,
    },
    {
      id: 'NXS-DEF-002',
      kitSerial: 'SN-2024-00215',
      kitType: 'Loaner',
      kitCategory: 'Deformity',
      currentStatus: 'At Hospital',
      locationDescription: 'Johns Hopkins Hospital',
      gpsLat: 39.2964,
      gpsLong: -76.5925,
      distributorName: 'Atlantic Spine Solutions',
      hospitalName: 'Johns Hopkins Hospital',
      daysInStatus: 1,
      nextExpectedAction: 'Surgery Scheduled',
      priority: 'green',
      contractTier: 'Tier 1',
      trackerId: 'TRK-2861',
      lastHeartbeat: '2024-12-14T14:20:00Z',
      tempAlerts: 0,
      tamperAlerts: 0,
      lastShipmentWaybill: 'FX-654321789',
      lastShipmentProvider: 'FedEx',
      lastShipmentCost: 112.00,
      revenueThisUsage: 28500,
      cogsThisUsage: 9800,
      commissionThisUsage: 2850,
      shippingCostThisUsage: 112.00,
    },
    {
      id: 'NXS-TLIF-008',
      kitSerial: 'SN-2024-00134',
      kitType: 'Loaner',
      kitCategory: 'TLIF',
      currentStatus: 'Quarantine',
      locationDescription: 'Dallas Distribution Center',
      gpsLat: 32.7767,
      gpsLong: -96.7970,
      distributorName: 'Texas Spine Networks',
      hospitalName: 'Unassigned',
      daysInStatus: 2,
      nextExpectedAction: 'Investigation Required',
      priority: 'red',
      contractTier: 'Tier 2',
      trackerId: 'TRK-2844',
      lastHeartbeat: '2024-12-14T14:05:00Z',
      tempAlerts: 3,
      tamperAlerts: 1,
      lastShipmentWaybill: 'UPS-1Z777CC30',
      lastShipmentProvider: 'UPS',
      lastShipmentCost: 89.00,
      revenueThisUsage: 0,
      cogsThisUsage: 0,
      commissionThisUsage: 0,
      shippingCostThisUsage: 89.00,
    },
    {
      id: 'NXS-CERVICAL-001',
      kitSerial: 'SN-2024-00228',
      kitType: 'Loaner',
      kitCategory: 'Cervical',
      currentStatus: 'In Transit',
      locationDescription: 'In Transit to Mayo Clinic',
      gpsLat: 44.0225,
      gpsLong: -92.4669,
      distributorName: 'Midwest Ortho Partners',
      hospitalName: 'Mayo Clinic Rochester',
      daysInStatus: 0,
      nextExpectedAction: 'Delivery Expected Today',
      priority: 'green',
      contractTier: 'Tier 1',
      trackerId: 'TRK-2868',
      lastHeartbeat: '2024-12-14T14:28:00Z',
      tempAlerts: 0,
      tamperAlerts: 0,
      lastShipmentWaybill: 'FX-987654321',
      lastShipmentProvider: 'FedEx Priority',
      lastShipmentCost: 178.50,
      revenueThisUsage: 7200,
      cogsThisUsage: 2480,
      commissionThisUsage: 720,
      shippingCostThisUsage: 178.50,
    },
  ];

  return kits;
};

const KitControlTower = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKit, setSelectedKit] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0 = List View, 1 = Map View

  // Fetch data
  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(generateKitData());
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchData();
  }, []);


  const handleRowClick = (params) => {
    setSelectedKit(params.row);
  };

  const handleBackToList = () => {
    setSelectedKit(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedKit(null); // Reset selection when switching tabs
  };

  // Handle back from map view - returns to list tab
  const handleBackFromMap = () => {
    setActiveTab(0);
  };

  // Summary stats
  const summaryStats = {
    totalKits: data.length,
    inTransit: data.filter(k => k.currentStatus === 'In Transit').length,
    atHospital: data.filter(k => k.currentStatus === 'At Hospital').length,
    idle: data.filter(k => k.currentStatus === 'Idle').length,
    alerts: data.filter(k => k.priority === 'red' || k.priority === 'yellow').length,
    avgDays: data.length > 0 ? (data.reduce((sum, k) => sum + k.daysInStatus, 0) / data.length).toFixed(1) : 0,
  };

  // Get status chip style
  const getStatusChipProps = (status) => {
    const statusKey = status.toLowerCase().replace(' ', '-');
    const styles = traxxTheme.chips.kitStatus[statusKey] || traxxTheme.chips.status.info;
    return styles;
  };

  // Get priority chip style
  const getPriorityChipProps = (priority) => {
    return traxxTheme.chips.priority[priority] || traxxTheme.chips.priority.green;
  };

  // Get type chip style
  const getTypeChipProps = (type) => {
    const typeKey = type.toLowerCase();
    return traxxTheme.chips.kitTypes[typeKey] || traxxTheme.chips.primary;
  };

  // Get category chip style
  const getCategoryChipProps = (category) => {
    const catKey = category.toLowerCase();
    return traxxTheme.chips.kitCategories[catKey] || traxxTheme.chips.primary;
  };

  // DataGrid columns
  const columns = [
    {
      field: 'priority',
      headerName: 'Priority',
      minWidth: 100,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value.toUpperCase()}
          size="small"
          sx={{ ...getPriorityChipProps(params.value), fontWeight: 700 }}
        />
      ),
    },
    {
      field: 'id',
      headerName: 'Kit ID',
      minWidth: 140,
      flex: 1,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, color: '#0891b2', fontSize: '0.85rem' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'kitType',
      headerName: 'Type',
      minWidth: 110,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip label={params.value} size="small" sx={getTypeChipProps(params.value)} />
      ),
    },
    {
      field: 'kitCategory',
      headerName: 'Category',
      minWidth: 110,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip label={params.value} size="small" sx={getCategoryChipProps(params.value)} />
      ),
    },
    {
      field: 'currentStatus',
      headerName: 'Status',
      minWidth: 120,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip label={params.value} size="small" sx={getStatusChipProps(params.value)} />
      ),
    },
    {
      field: 'locationDescription',
      headerName: 'Location',
      minWidth: 180,
      flex: 1.3,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: '#475569' }} noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'hospitalName',
      headerName: 'Hospital',
      minWidth: 160,
      flex: 1.2,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: '#475569' }} noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'distributorName',
      headerName: 'Distributor',
      minWidth: 160,
      flex: 1.2,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: '#475569' }} noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'daysInStatus',
      headerName: 'Days',
      minWidth: 100,
      flex: 0.7,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const days = params.value;
        const color = days > 7 ? '#dc2626' : days > 3 ? '#d97706' : '#059669';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 40, height: 6, bgcolor: alpha('#64748b', 0.2), borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ width: `${Math.min((days / 14) * 100, 100)}%`, height: '100%', bgcolor: color, borderRadius: 3 }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color }}>{days}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'nextExpectedAction',
      headerName: 'Next Action',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: '#0891b2' }}>
          {params.value}
        </Typography>
      ),
    },
  ];

  // Render Detail View
  const renderDetailView = () => {
    if (!selectedKit) return null;

    const margin = selectedKit.revenueThisUsage - selectedKit.cogsThisUsage - selectedKit.commissionThisUsage - selectedKit.shippingCostThisUsage;
    const priorityColor = selectedKit.priority === 'green' ? '#10b981' : selectedKit.priority === 'yellow' ? '#f59e0b' : '#ef4444';

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Kit Header */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)',
            borderBottom: '2px solid',
            borderColor: alpha('#0891b2', 0.2),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton sx={{ bgcolor: alpha('#0891b2', 0.1) }}>
                <InventoryIcon sx={{ color: '#0891b2' }} />
              </IconButton>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0891b2' }}>
                  {selectedKit.id}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {selectedKit.kitSerial} • {selectedKit.kitCategory} • {selectedKit.hospitalName}
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={selectedKit.kitType} size="small" sx={getTypeChipProps(selectedKit.kitType)} />
              <Chip label={selectedKit.currentStatus} size="small" sx={getStatusChipProps(selectedKit.currentStatus)} />
            </Stack>
          </Box>
        </Paper>

        {/* Info Cards Row */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Contract Tier', value: selectedKit.contractTier, sub: selectedKit.distributorName, color: '#06b6d4', icon: <PersonIcon /> },
            { label: 'Days in Status', value: selectedKit.daysInStatus, sub: selectedKit.currentStatus, color: priorityColor, icon: <ScheduleIcon /> },
            { label: 'Tracker ID', value: selectedKit.trackerId, sub: `Last: ${new Date(selectedKit.lastHeartbeat).toLocaleTimeString()}`, color: '#a855f7', icon: <SensorsIcon /> },
            { label: 'Next Action', value: selectedKit.nextExpectedAction, sub: 'Pending', color: '#f97316', icon: <TrendingUpIcon /> },
          ].map((stat, idx) => (
            <Grid item xs={6} sm={3} key={idx}>
              <Card sx={{ borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: `3px solid ${stat.color}` }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <Box sx={{ color: stat.color, display: 'flex' }}>{stat.icon}</Box>
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>{stat.value}</Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>{stat.sub}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Detail Sections */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Identity & Allocation */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <InventoryIcon sx={{ color: '#0891b2' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Identity & Allocation
                  </Typography>
                  <Chip label="ERP" size="small" sx={{ ml: 'auto', fontSize: '0.6rem', height: 20, bgcolor: alpha('#06b6d4', 0.1), color: '#0891b2' }} />
                </Stack>
                {[
                  { label: 'Kit ID', value: selectedKit.id, highlight: true },
                  { label: 'Serial Number', value: selectedKit.kitSerial },
                  { label: 'Contract Tier', value: selectedKit.contractTier },
                  { label: 'Distributor', value: selectedKit.distributorName },
                  { label: 'Hospital', value: selectedKit.hospitalName },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 4 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.15) }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: item.highlight ? '#0891b2' : '#1e293b' }}>{item.value}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* IoT Telemetry */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <SensorsIcon sx={{ color: '#a855f7' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    IoT Telemetry
                  </Typography>
                  <Chip label="SMADE IO" size="small" sx={{ ml: 'auto', fontSize: '0.6rem', height: 20, bgcolor: alpha('#a855f7', 0.1), color: '#9333ea' }} />
                </Stack>
                {[
                  { label: 'Tracker ID', value: selectedKit.trackerId, highlight: true },
                  { label: 'Last Heartbeat', value: new Date(selectedKit.lastHeartbeat).toLocaleTimeString() },
                  { label: 'GPS Coordinates', value: `${selectedKit.gpsLat.toFixed(4)}, ${selectedKit.gpsLong.toFixed(4)}` },
                  { label: 'Temp Alerts', value: selectedKit.tempAlerts, isAlert: selectedKit.tempAlerts > 0 },
                  { label: 'Tamper Alerts', value: selectedKit.tamperAlerts, isAlert: selectedKit.tamperAlerts > 0 },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 4 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.15) }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{item.label}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {item.isAlert !== undefined && (
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.isAlert ? '#ef4444' : '#10b981', boxShadow: `0 0 6px ${item.isAlert ? '#ef4444' : '#10b981'}` }} />
                      )}
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: item.highlight ? '#9333ea' : '#1e293b' }}>{item.value}</Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Last Shipment */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <ShippingIcon sx={{ color: '#f97316' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Last Shipment
                  </Typography>
                  <Chip label="SHIPPING" size="small" sx={{ ml: 'auto', fontSize: '0.6rem', height: 20, bgcolor: alpha('#f97316', 0.1), color: '#ea580c' }} />
                </Stack>
                {[
                  { label: 'Waybill', value: selectedKit.lastShipmentWaybill, highlight: true },
                  { label: 'Provider', value: selectedKit.lastShipmentProvider },
                  { label: 'Shipping Cost', value: formatCurrency(selectedKit.lastShipmentCost) },
                  { label: 'Days in Status', value: `${selectedKit.daysInStatus} days` },
                  { label: 'Location', value: selectedKit.locationDescription },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 4 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.15) }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: item.highlight ? '#ea580c' : '#1e293b', maxWidth: 140 }} noWrap>{item.value}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Instance Economics */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <MoneyIcon sx={{ color: '#10b981' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                Instance Economics
              </Typography>
              <Chip label="DERIVED" size="small" sx={{ ml: 'auto', fontSize: '0.6rem', height: 20, bgcolor: alpha('#10b981', 0.1), color: '#059669' }} />
            </Stack>
            <Grid container spacing={2}>
              {[
                { label: 'Revenue This Usage', value: formatCurrency(selectedKit.revenueThisUsage), color: '#10b981' },
                { label: 'COGS This Usage', value: formatCurrency(selectedKit.cogsThisUsage), color: '#ef4444' },
                { label: 'Commission', value: formatCurrency(selectedKit.commissionThisUsage), color: '#ef4444' },
                { label: 'Shipping Cost', value: formatCurrency(selectedKit.shippingCostThisUsage), color: '#ef4444' },
                { label: 'Margin This Usage', value: formatCurrency(margin), color: margin > 0 ? '#10b981' : '#ef4444', highlight: true },
              ].map((item, idx) => (
                <Grid item xs={6} sm={4} md={2.4} key={idx}>
                  <Box sx={{ p: 1.5, bgcolor: alpha(item.color, 0.08), borderRadius: 1, borderLeft: item.highlight ? `3px solid ${item.color}` : 'none', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', mb: 0.5 }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: item.color }}>{item.value}</Typography>
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
    <Box sx={{ p: 3, height: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>
              TRAXX.AI
            </Link>
            {selectedKit ? (
              <>
                <Link component="button" variant="body1" onClick={() => setSelectedKit(null)} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>
                  Kit Control Tower
                </Link>
                <Typography color="primary" variant="body1" fontWeight={600}>
                  {selectedKit.id}
                </Typography>
              </>
            ) : (
              <Typography color="primary" variant="body1" fontWeight={600}>
                Kit Control Tower
              </Typography>
            )}
          </Breadcrumbs>
          <Stack direction="row" spacing={1} alignItems="center">
            {!selectedKit && (
              <>
                {/* View Tabs */}
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  sx={{
                    minHeight: 32,
                    '& .MuiTabs-indicator': {
                      height: 2,
                      borderRadius: '2px 2px 0 0',
                      backgroundColor: '#0891b2',
                    },
                  }}
                >
                  <Tab
                    icon={<ListIcon sx={{ fontSize: 16 }} />}
                    iconPosition="start"
                    label="List"
                    sx={{
                      minHeight: 32,
                      py: 0.25,
                      px: 1.5,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      color: '#64748b',
                      '&.Mui-selected': { color: '#0891b2' },
                    }}
                  />
                  <Tab
                    icon={<MapIcon sx={{ fontSize: 16 }} />}
                    iconPosition="start"
                    label="Map"
                    sx={{
                      minHeight: 32,
                      py: 0.25,
                      px: 1.5,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      color: '#64748b',
                      '&.Mui-selected': { color: '#0891b2' },
                    }}
                  />
                </Tabs>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <Tooltip title="Refresh">
                  <IconButton onClick={fetchData} color="primary" size="small"><Refresh /></IconButton>
                </Tooltip>
                <Tooltip title="Export">
                  <IconButton color="primary" size="small"><Download /></IconButton>
                </Tooltip>
              </>
            )}
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small" sx={{ color: '#00357a', borderColor: '#00357a' }}>
              Back
            </Button>
          </Stack>
        </Stack>

        {/* Summary Cards - Only show in list view */}
        {!selectedKit && activeTab === 0 && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Total Kits', value: summaryStats.totalKits, sub: 'Active in network', color: '#06b6d4', icon: <InventoryIcon /> },
              { label: 'In Transit', value: summaryStats.inTransit, sub: 'Currently moving', color: '#a855f7', icon: <ShippingIcon /> },
              { label: 'At Hospital', value: summaryStats.atHospital, sub: 'Deployed on-site', color: '#10b981', icon: <HospitalIcon /> },
              { label: 'Idle', value: summaryStats.idle, sub: 'Needs attention', color: '#f59e0b', icon: <WarningIcon /> },
              { label: 'Alerts', value: summaryStats.alerts, sub: 'Red/Yellow flags', color: '#ef4444', icon: <ErrorIcon /> },
              { label: 'Avg Days in Status', value: summaryStats.avgDays, sub: 'Across all kits', color: '#ec4899', icon: <ScheduleIcon /> },
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
      {selectedKit ? (
        renderDetailView()
      ) : activeTab === 1 ? (
        /* Map View Tab - Contained within parent, no scroll */
        <Box sx={{
          flex: 1,
          height: 'calc(100vh - 200px)',
          minHeight: 500,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          mx: -3,
          mb: -3,
          mt: -2,
        }}>
          <SmadeTrackerMap onBack={handleBackFromMap} kitData={data} />
        </Box>
      ) : (
        /* List View Tab */
        <Paper elevation={0} sx={{ borderRadius: 3, bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: alpha('#64748b', 0.2), background: `linear-gradient(90deg, ${alpha('#06b6d4', 0.05)}, ${alpha('#64748b', 0.02)})` }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                Kit Inventory — <Typography component="span" sx={{ color: '#0891b2' }}>Click Row for Details</Typography>
              </Typography>
              <Chip label="ERP | SMADE IO | SHIPPING" size="small" sx={{ fontSize: '0.6rem', bgcolor: alpha('#06b6d4', 0.1), color: '#0891b2' }} />
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
                sorting: { sortModel: [{ field: 'priority', sort: 'asc' }] },
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

export default KitControlTower;
