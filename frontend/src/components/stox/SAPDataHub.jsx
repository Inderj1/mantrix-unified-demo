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
  Hub as HubIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  CheckCircle,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  CloudSync as CloudSyncIcon,
  Schedule as ScheduleIcon,
  DataObject as DataObjectIcon,
  Memory as MemoryIcon,
} from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import stoxTheme from './stoxTheme';
import { LAM_PLANTS } from '../../data/arizonaBeveragesMasterData';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

// Generate SAP system data for Arizona Beverages plants
const generateSAPData = () => {
  // Map Arizona Beverages plants to SAP system data
  const systems = LAM_PLANTS.map(plant => ({
    id: plant.id,
    name: `${plant.name} (${plant.country})`,
    version: plant.id === '1000' || plant.id === '2000' ? 'S/4HANA 2023' :
             plant.id === '3000' ? 'S/4HANA 2022' :
             plant.id === '4000' ? 'S/4HANA 2022' : 'S/4HANA 2021',
    client: plant.region === 'Americas' ? '100' : plant.region === 'Asia' ? '200' : '300',
    region: plant.region,
    currency: plant.currency,
  }));

  // Define statuses per plant (mostly healthy with one delayed for realism)
  const statuses = ['connected', 'connected', 'connected', 'delayed', 'connected'];
  const rfcStatuses = ['Active', 'Active', 'Active', 'Active', 'Active'];
  const odataStatuses = ['Active', 'Active', 'Active', 'Slow', 'Active'];

  return systems.map((sys, idx) => {
    const status = statuses[idx];
    const isHealthy = status === 'connected';
    const isDelayed = status === 'delayed';

    return {
      id: sys.id,
      name: sys.name,
      version: sys.version,
      client: sys.client,
      region: sys.region,
      currency: sys.currency,
      status,
      statusText: isHealthy ? 'Connected' : isDelayed ? 'Delayed' : 'Error',
      rfc: rfcStatuses[idx],
      odata: odataStatuses[idx],
      cdsViews: isDelayed ? 18 : 24,
      odqStatus: isHealthy ? 'Clear' : `${(Math.random() * 8 + 2).toFixed(1)}K Behind`,
      lastSync: isHealthy ? `${Math.floor(Math.random() * 5) + 1} min` : `${Math.floor(Math.random() * 15) + 8} min`,
      latency: isHealthy ? `${(Math.random() * 2 + 1).toFixed(1)} min` : `${(Math.random() * 3 + 3).toFixed(1)} min`,
      dataQuality: isHealthy ? (95 + Math.random() * 4).toFixed(1) : (92 + Math.random() * 3).toFixed(1),
      jobsSuccess: isHealthy ? 42 : Math.floor(35 + Math.random() * 5),
      jobsTotal: isHealthy ? 42 : Math.floor(38 + Math.random() * 4),
      // Detail data
      rfcConnection: `STOXAI_${sys.id}`,
      btpStatus: 'Connected',
      lastHeartbeat: isHealthy ? '2 min ago' : '15 min ago',
      avgResponse: isHealthy ? `${Math.floor(100 + Math.random() * 50)} ms` : `${Math.floor(600 + Math.random() * 400)} ms`,
      dq: {
        overall: isHealthy ? (97 + Math.random() * 2).toFixed(1) : (93 + Math.random() * 2).toFixed(1),
        completeness: (97 + Math.random() * 2.5).toFixed(1),
        accuracy: (95 + Math.random() * 4).toFixed(1),
        timeliness: (96 + Math.random() * 3).toFixed(1),
        consistency: (96 + Math.random() * 3).toFixed(1),
      },
      odq: {
        status: isHealthy ? 'Clear' : 'Behind',
        subscriptions: Math.floor(10 + Math.random() * 4),
        pending: isHealthy ? '0' : `${Math.floor(2000 + Math.random() * 6000).toLocaleString()}`,
        lastDelta: isHealthy ? '2 min ago' : '15 min ago',
        cleanup: 'Scheduled',
      },
      jobs: [
        { name: 'STOX_FULL_MARC_MARD', time: 'Today 02:00 AM', status: 'success' },
        { name: 'STOX_DELTA_MSEG', time: 'Today 10:45 AM (Hourly)', status: isHealthy ? 'running' : 'failed' },
        { name: 'STOX_DELTA_EKBE', time: 'Today 10:30 AM', status: 'success' },
        { name: 'STOX_DELTA_MVER', time: 'Today 10:15 AM', status: 'success' },
        { name: 'ODQ_CLEANUP', time: 'Tomorrow 01:00 AM', status: 'scheduled' },
      ],
      tables: [
        { name: 'MARC', freshness: '1h', stale: false },
        { name: 'MARD', freshness: '1h', stale: false },
        { name: 'MBEW', freshness: '4h', stale: false },
        { name: 'MSEG', freshness: isHealthy ? '1h' : '6h', stale: !isHealthy },
        { name: 'MKPF', freshness: isHealthy ? '1h' : '6h', stale: !isHealthy },
        { name: 'EKKO', freshness: '4h', stale: false },
        { name: 'EKPO', freshness: '4h', stale: false },
        { name: 'EKBE', freshness: '4h', stale: false },
        { name: 'EINA', freshness: '12h', stale: false },
        { name: 'EINE', freshness: '12h', stale: false },
        { name: 'LFA1', freshness: '24h', stale: false },
        { name: 'MVER', freshness: '4h', stale: false },
        { name: 'PLAF', freshness: '6h', stale: false },
        { name: 'MDKP', freshness: '6h', stale: false },
        { name: 'VBAP', freshness: '4h', stale: false },
        { name: 'LIPS', freshness: '4h', stale: false },
      ],
      throughput: Array.from({ length: 12 }, () => Math.floor(800 + Math.random() * 1600)),
      records: `${(1.5 + Math.random() * 1.5).toFixed(1)}M`,
      avgThroughput: `${(1 + Math.random() * 1).toFixed(1)}K/sec`,
      peakLoad: `${(2 + Math.random() * 2.5).toFixed(1)}K/sec`,
      errors: isHealthy ? [] : [
        { type: 'warning', time: 'Today 10:32 AM', msg: 'MSEG delta extraction timeout - RFC_COMMUNICATION_FAILURE', source: 'Job: STOX_DELTA_MSEG' },
      ],
      cpu: isHealthy ? Math.floor(35 + Math.random() * 30) : Math.floor(75 + Math.random() * 15),
      memory: isHealthy ? Math.floor(50 + Math.random() * 20) : Math.floor(80 + Math.random() * 10),
      workProcesses: isHealthy ? `${Math.floor(12 + Math.random() * 6)} / 20 Free` : `${Math.floor(2 + Math.random() * 4)} / 20 Free`,
      wpPct: isHealthy ? Math.floor(30 + Math.random() * 20) : Math.floor(75 + Math.random() * 15),
    };
  });
};

const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const SAPDataHub = ({ onBack, onTileClick, darkMode = false }) => {
  const colors = getColors(darkMode);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSystem, setSelectedSystem] = useState(null);

  // Fetch data
  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      setData(generateSAPData());
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRowClick = (params) => {
    setSelectedSystem(params.row);
  };

  const handleBackToList = () => {
    setSelectedSystem(null);
  };

  // Summary stats
  const summaryStats = {
    systemsConnected: data.filter(d => d.status === 'connected').length,
    totalSystems: data.length,
    dataQuality: data.length > 0 ? (data.reduce((sum, d) => sum + parseFloat(d.dataQuality), 0) / data.length).toFixed(1) : 0,
    successRate: data.length > 0 ? ((data.reduce((sum, d) => sum + d.jobsSuccess, 0) / data.reduce((sum, d) => sum + d.jobsTotal, 0)) * 100).toFixed(1) : 0,
    odqBacklog: data.filter(d => d.odqStatus !== 'Clear').length > 0 ? `${data.filter(d => d.odqStatus !== 'Clear').length} queues` : 'Clear',
    avgLatency: data.length > 0 ? (data.reduce((sum, d) => sum + parseFloat(d.latency), 0) / data.length).toFixed(1) : 0,
    errors24h: data.reduce((sum, d) => sum + d.errors.length, 0),
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
          color={params.value === 'connected' ? 'success' : params.value === 'delayed' ? 'warning' : 'error'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'rfc',
      headerName: 'RFC',
      minWidth: 100,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Active' ? 'success' : 'warning'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'odata',
      headerName: 'OData',
      minWidth: 100,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Active' ? 'success' : 'warning'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'cdsViews',
      headerName: 'CDS Views',
      minWidth: 100,
      flex: 0.7,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{ fontWeight: 700, bgcolor: alpha('#1a5a9e', 0.12), color: '#1a5a9e' }}
        />
      ),
    },
    {
      field: 'odqStatus',
      headerName: 'ODQ Status',
      minWidth: 120,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Clear' ? 'success' : 'warning'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    { field: 'lastSync', headerName: 'Last Sync', minWidth: 100, flex: 0.7, align: 'center', headerAlign: 'center' },
    {
      field: 'dataQuality',
      headerName: 'Data Quality',
      minWidth: 110,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const quality = parseFloat(params.value);
        return (
          <Chip
            label={`${params.value}%`}
            size="small"
            color={quality >= 97 ? 'success' : quality >= 95 ? 'warning' : 'error'}
            sx={{ fontWeight: 700 }}
          />
        );
      },
    },
    {
      field: 'jobsSuccess',
      headerName: 'Jobs (24h)',
      minWidth: 110,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const success = params.value;
        const total = params.row.jobsTotal;
        const rate = total > 0 ? (success / total) * 100 : 0;
        return (
          <Chip
            label={`${success}/${total}`}
            size="small"
            color={rate === 100 ? 'success' : rate >= 95 ? 'warning' : 'error'}
            sx={{ fontWeight: 600 }}
          />
        );
      },
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
          callback: (v) => `${(v / 1000).toFixed(0)}K`,
        },
      },
    },
  };

  // Render Detail View
  const renderDetailView = () => {
    if (!selectedSystem) return null;

    const isHealthy = selectedSystem.status === 'connected';
    const cpuColor = selectedSystem.cpu < 70 ? '#10b981' : selectedSystem.cpu < 85 ? '#f59e0b' : '#ef4444';
    const memColor = selectedSystem.memory < 70 ? '#10b981' : selectedSystem.memory < 85 ? '#f59e0b' : '#ef4444';
    const wpColor = selectedSystem.wpPct < 60 ? '#10b981' : selectedSystem.wpPct < 80 ? '#f59e0b' : '#ef4444';

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Header with chips */}
        <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1}>
            <Chip label={selectedSystem.id} size="small" sx={{ bgcolor: alpha('#64748b', 0.1), fontWeight: 700 }} />
            <Chip label={selectedSystem.version} size="small" sx={{ bgcolor: alpha('#06b6d4', 0.12), color: '#0891b2' }} />
            <Chip
              icon={isHealthy ? <CheckCircle sx={{ fontSize: 14 }} /> : <WarningIcon sx={{ fontSize: 14 }} />}
              label={selectedSystem.statusText}
              size="small"
              sx={{
                fontWeight: 600,
                bgcolor: isHealthy ? alpha('#10b981', 0.12) : alpha('#f59e0b', 0.12),
                color: isHealthy ? '#059669' : '#d97706',
              }}
            />
          </Stack>
        </Stack>

        {/* System Title */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{selectedSystem.name}</Typography>
        <Typography sx={{ color: '#64748b', mb: 3 }}>
          RFC: {selectedSystem.rfcConnection} | Client: {selectedSystem.client}
        </Typography>

        {/* Connection, Data Quality, ODQ Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Connection Status */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <CloudSyncIcon sx={{ color: '#0891b2' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Connection Status
                  </Typography>
                  <Chip label="SM59 / SICF" size="small" sx={{ ml: 'auto', fontSize: '0.6rem', height: 20, bgcolor: alpha('#06b6d4', 0.1), color: '#0891b2' }} />
                </Stack>
                {[
                  { label: 'RFC Connection', value: selectedSystem.rfc, color: selectedSystem.rfc === 'Active' ? '#059669' : '#d97706' },
                  { label: 'OData Service', value: selectedSystem.odata, color: selectedSystem.odata === 'Active' ? '#059669' : '#d97706' },
                  { label: 'BTP Integration', value: selectedSystem.btpStatus, color: '#059669' },
                  { label: 'Last Heartbeat', value: selectedSystem.lastHeartbeat, color: '#1e293b' },
                  { label: 'Avg Response Time', value: selectedSystem.avgResponse, color: '#1e293b' },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 4 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.1) }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: item.color }}>
                      {item.color !== '#1e293b' ? '● ' : ''}{item.value}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Data Quality */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <StorageIcon sx={{ color: '#0891b2' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Data Quality Score
                  </Typography>
                  <Chip label="DQM" size="small" sx={{ ml: 'auto', fontSize: '0.6rem', height: 20, bgcolor: alpha('#06b6d4', 0.1), color: '#0891b2' }} />
                </Stack>
                {[
                  { label: 'Overall Score', value: `${selectedSystem.dq.overall}%`, highlight: true },
                  { label: 'Completeness', value: `${selectedSystem.dq.completeness}%` },
                  { label: 'Accuracy', value: `${selectedSystem.dq.accuracy}%` },
                  { label: 'Timeliness', value: `${selectedSystem.dq.timeliness}%` },
                  { label: 'Consistency', value: `${selectedSystem.dq.consistency}%` },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 4 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.1) }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: item.highlight ? (parseFloat(selectedSystem.dq.overall) >= 97 ? '#059669' : '#d97706') : '#1e293b' }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Delta Queue (ODQ) */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <ScheduleIcon sx={{ color: '#0891b2' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Delta Queue (ODQ)
                  </Typography>
                  <Chip label="ODQMON" size="small" sx={{ ml: 'auto', fontSize: '0.6rem', height: 20, bgcolor: alpha('#06b6d4', 0.1), color: '#0891b2' }} />
                </Stack>
                {[
                  { label: 'Queue Status', value: selectedSystem.odq.status, color: selectedSystem.odq.status === 'Clear' ? '#059669' : '#d97706' },
                  { label: 'Active Subscriptions', value: selectedSystem.odq.subscriptions, color: '#1e293b' },
                  { label: 'Pending Records', value: selectedSystem.odq.pending, color: '#1e293b' },
                  { label: 'Last Delta Extract', value: selectedSystem.odq.lastDelta, color: '#1e293b' },
                  { label: 'Cleanup Job', value: selectedSystem.odq.cleanup, color: '#059669' },
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 4 ? '1px solid' : 'none', borderColor: alpha('#64748b', 0.1) }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: item.color }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Jobs and Tables */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Extraction Jobs */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <DataObjectIcon sx={{ color: '#0891b2' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Extraction Jobs (Last 24h)
                  </Typography>
                  <Chip label="SM37" size="small" sx={{ ml: 'auto', fontSize: '0.6rem', height: 20, bgcolor: alpha('#06b6d4', 0.1), color: '#0891b2' }} />
                </Stack>
                <Stack spacing={1}>
                  {selectedSystem.jobs.map((job, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: alpha('#64748b', 0.03), borderRadius: 1 }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{job.name}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>{job.time}</Typography>
                      </Box>
                      <Chip
                        label={job.status === 'success' ? 'Complete' : job.status === 'running' ? 'Running' : job.status === 'failed' ? 'Failed' : 'Scheduled'}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.65rem',
                          height: 22,
                          bgcolor: job.status === 'success' ? alpha('#10b981', 0.12) :
                                   job.status === 'running' ? alpha('#06b6d4', 0.12) :
                                   job.status === 'failed' ? alpha('#ef4444', 0.12) :
                                   alpha('#64748b', 0.12),
                          color: job.status === 'success' ? '#059669' :
                                 job.status === 'running' ? '#0891b2' :
                                 job.status === 'failed' ? '#dc2626' :
                                 '#64748b',
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* CDS Views & Table Freshness */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <StorageIcon sx={{ color: '#0891b2' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    CDS Views & Table Freshness
                  </Typography>
                  <Chip label="SE11 / SEGW" size="small" sx={{ ml: 'auto', fontSize: '0.6rem', height: 20, bgcolor: alpha('#06b6d4', 0.1), color: '#0891b2' }} />
                </Stack>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {selectedSystem.tables.map((table, idx) => (
                    <Chip
                      key={idx}
                      label={`${table.name} • ${table.freshness}`}
                      size="small"
                      sx={{
                        fontSize: '0.65rem',
                        height: 24,
                        bgcolor: table.stale ? alpha('#f59e0b', 0.12) : alpha('#06b6d4', 0.08),
                        color: table.stale ? '#d97706' : '#0891b2',
                        border: '1px solid',
                        borderColor: table.stale ? alpha('#f59e0b', 0.3) : alpha('#06b6d4', 0.2),
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Throughput Chart and Error Log */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Throughput Chart */}
          <Grid item xs={12} md={8}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <SpeedIcon sx={{ color: '#0891b2' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Data Throughput (Last 24h)
                  </Typography>
                </Stack>
                <Box sx={{ height: 180, mb: 2 }}>
                  <Bar
                    data={{
                      labels: ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'],
                      datasets: [{
                        data: selectedSystem.throughput,
                        backgroundColor: alpha('#06b6d4', 0.6),
                        borderColor: '#06b6d4',
                        borderWidth: 1,
                        borderRadius: 4,
                      }],
                    }}
                    options={chartOptions}
                  />
                </Box>
                <Grid container spacing={3}>
                  {[
                    { label: 'Records Extracted', value: selectedSystem.records, color: '#10b981' },
                    { label: 'Avg Throughput', value: selectedSystem.avgThroughput, color: '#06b6d4' },
                    { label: 'Peak Load', value: selectedSystem.peakLoad, color: '#f59e0b' },
                  ].map((item, idx) => (
                    <Grid item xs={4} key={idx}>
                      <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>{item.label}</Typography>
                      <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: item.color }}>{item.value}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Error Log */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <WarningIcon sx={{ color: '#0891b2' }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Error Log (24h)
                  </Typography>
                  <Chip label="SM21 / ST22" size="small" sx={{ ml: 'auto', fontSize: '0.6rem', height: 20, bgcolor: alpha('#06b6d4', 0.1), color: '#0891b2' }} />
                </Stack>
                {selectedSystem.errors.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircle sx={{ fontSize: 40, color: '#10b981', mb: 1 }} />
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>No errors in last 24 hours</Typography>
                  </Box>
                ) : (
                  <Stack spacing={1}>
                    {selectedSystem.errors.map((error, idx) => (
                      <Box key={idx} sx={{ p: 1.5, borderRadius: 1, bgcolor: alpha('#f59e0b', 0.05), borderLeft: '3px solid #f59e0b' }}>
                        <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>{error.time}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{error.msg}</Typography>
                        <Typography sx={{ fontSize: '0.6rem', color: '#64748b', mt: 0.5 }}>{error.source}</Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* System Resources */}
        <Card variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <MemoryIcon sx={{ color: '#0891b2' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                SAP System Resources
              </Typography>
              <Chip label="ST06 / SM66" size="small" sx={{ ml: 'auto', fontSize: '0.6rem', height: 20, bgcolor: alpha('#06b6d4', 0.1), color: '#0891b2' }} />
            </Stack>
            <Grid container spacing={3}>
              {[
                { label: 'CPU Utilization', value: `${selectedSystem.cpu}%`, pct: selectedSystem.cpu, color: cpuColor },
                { label: 'Memory Usage', value: `${selectedSystem.memory}%`, pct: selectedSystem.memory, color: memColor },
                { label: 'Dialog Work Processes', value: selectedSystem.workProcesses, pct: selectedSystem.wpPct, color: wpColor },
              ].map((item, idx) => (
                <Grid item xs={12} md={4} key={idx}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', mb: 0.5 }}>{item.label}</Typography>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: item.color, mb: 1 }}>{item.value}</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={item.pct}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha('#64748b', 0.1),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: item.color,
                        borderRadius: 3,
                      },
                    }}
                  />
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
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: colors.background }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text, '&:hover': { textDecoration: 'underline', color: colors.primary }, cursor: 'pointer' }}>
              STOX.AI
            </Link>
            <Link component="button" variant="body1" onClick={() => selectedSystem ? setSelectedSystem(null) : onBack()} sx={{ textDecoration: 'none', color: colors.text, '&:hover': { textDecoration: 'underline', color: colors.primary }, cursor: 'pointer' }}>
              Layer 1: Foundation
            </Link>
            {selectedSystem ? (
              <>
                <Link component="button" variant="body1" onClick={() => setSelectedSystem(null)} sx={{ textDecoration: 'none', color: colors.text, '&:hover': { textDecoration: 'underline', color: colors.primary }, cursor: 'pointer' }}>
                  SAP Data Hub
                </Link>
                <Typography color="primary" variant="body1" fontWeight={600}>{selectedSystem.name}</Typography>
              </>
            ) : (
              <Typography color="primary" variant="body1" fontWeight={600}>SAP Data Hub</Typography>
            )}
          </Breadcrumbs>
          {!selectedSystem && (
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
        {!selectedSystem && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Systems Connected', value: `${summaryStats.systemsConnected} / ${summaryStats.totalSystems}`, sub: 'All RFC/OData Active', color: '#10b981', icon: <CloudSyncIcon /> },
              { label: 'Data Quality Score', value: `${summaryStats.dataQuality}%`, sub: '↑ vs last week', color: '#10b981', icon: <StorageIcon /> },
              { label: 'Extraction Jobs (24h)', value: `${summaryStats.successRate}%`, sub: 'Success rate', color: '#10b981', icon: <DataObjectIcon /> },
              { label: 'ODQ Delta Backlog', value: summaryStats.odqBacklog, sub: summaryStats.odqBacklog === 'Clear' ? 'All queues clear' : 'Behind', color: summaryStats.odqBacklog === 'Clear' ? '#10b981' : '#f59e0b', icon: <ScheduleIcon /> },
              { label: 'Avg Latency', value: `${summaryStats.avgLatency} min`, sub: 'Source → STOX.AI', color: '#10b981', icon: <SpeedIcon /> },
              { label: 'Errors (24h)', value: summaryStats.errors24h, sub: summaryStats.errors24h === 0 ? 'No errors' : 'Warnings', color: summaryStats.errors24h === 0 ? '#10b981' : '#f59e0b', icon: <WarningIcon /> },
            ].map((stat, idx) => (
              <Grid item xs={6} sm={4} md={2} key={idx}>
                <Card variant="outlined" sx={{ borderLeft: `3px solid ${stat.color}`, bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
                  <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <Box sx={{ color: stat.color, display: 'flex' }}>{stat.icon}</Box>
                      <Typography sx={{ fontSize: '0.6rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: colors.text }}>{stat.value}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary }}>{stat.sub}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Content */}
      {selectedSystem ? (
        renderDetailView()
      ) : (
        <Paper elevation={0} variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: colors.border, background: darkMode ? alpha('#0284c7', 0.08) : `linear-gradient(90deg, ${alpha('#0284c7', 0.05)}, ${alpha('#64748b', 0.02)})` }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: colors.primary }}>
                SAP System Connections — <Typography component="span" sx={{ color: '#0891b2' }}>Click to View Details</Typography>
              </Typography>
              <Chip label="RFC · OData · BTP · CDS · ODP" size="small" sx={{ fontSize: '0.6rem', bgcolor: alpha('#06b6d4', 0.1), color: '#0891b2' }} />
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
              sx={{
                ...stoxTheme.getDataGridSx({ clickable: true }),
                bgcolor: colors.paper,
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: darkMode ? '#161b22' : '#f8fafc',
                  borderBottom: `1px solid ${colors.border}`,
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  color: colors.text,
                  fontWeight: 600,
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${colors.border}`,
                  color: colors.text,
                },
                '& .MuiDataGrid-row': {
                  bgcolor: colors.paper,
                  '&:hover': {
                    bgcolor: darkMode ? alpha('#4d9eff', 0.08) : alpha('#00357a', 0.04),
                  },
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: `1px solid ${colors.border}`,
                  bgcolor: darkMode ? '#161b22' : '#f8fafc',
                },
                '& .MuiTablePagination-root': {
                  color: colors.text,
                },
                '& .MuiDataGrid-toolbarContainer': {
                  color: colors.text,
                  borderBottom: `1px solid ${colors.border}`,
                },
              }}
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

export default SAPDataHub;
