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
  LinearProgress,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Engineering as EquipmentIcon,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  CheckCircle,
  LocalShipping as AssetIcon,
  Speed as StatusIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import stoxTheme from '../stox/stoxTheme';

const AssetTracking = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);

    setTimeout(() => {
      // Mock data for asset tracking
      const assetData = [
        { id: 1, asset_id: 'EQ-001', name: 'Trailer T-4501', type: 'Refrigerated Trailer', status: 'In Use', location: 'Boston, MA', utilization: 92, last_updated: '2025-01-15 14:30' },
        { id: 2, asset_id: 'EQ-002', name: 'Truck TR-2340', type: 'Box Truck', status: 'Idle', location: 'Chicago, IL', utilization: 65, last_updated: '2025-01-15 14:25' },
        { id: 3, asset_id: 'EQ-003', name: 'Trailer T-4502', type: 'Flatbed Trailer', status: 'In Use', location: 'Atlanta, GA', utilization: 88, last_updated: '2025-01-15 14:32' },
        { id: 4, asset_id: 'EQ-004', name: 'Truck TR-2341', type: 'Refrigerated Truck', status: 'In Transit', location: 'Los Angeles, CA', utilization: 95, last_updated: '2025-01-15 14:28' },
        { id: 5, asset_id: 'EQ-005', name: 'Trailer T-4503', type: 'Dry Van', status: 'In Use', location: 'New York, NY', utilization: 90, last_updated: '2025-01-15 14:31' },
        { id: 6, asset_id: 'EQ-006', name: 'Forklift FL-890', type: 'Electric Forklift', status: 'Maintenance', location: 'Dallas, TX', utilization: 45, last_updated: '2025-01-15 14:20' },
        { id: 7, asset_id: 'EQ-007', name: 'Truck TR-2342', type: 'Tanker Truck', status: 'In Use', location: 'Houston, TX', utilization: 87, last_updated: '2025-01-15 14:29' },
        { id: 8, asset_id: 'EQ-008', name: 'Trailer T-4504', type: 'Refrigerated Trailer', status: 'In Use', location: 'Phoenix, AZ', utilization: 91, last_updated: '2025-01-15 14:33' },
      ];

      setData(assetData);

      // Calculate metrics
      const totalAssets = assetData.length;
      const activeAssets = assetData.filter(a => a.status === 'In Use' || a.status === 'In Transit').length;
      const avgUtilization = assetData.reduce((sum, a) => sum + a.utilization, 0) / assetData.length;
      const inMaintenance = assetData.filter(a => a.status === 'Maintenance').length;

      setMetrics({
        totalAssets,
        activeAssets,
        avgUtilization,
        inMaintenance,
      });

      setLoading(false);
    }, 800);
  };

  const columns = [
    {
      field: 'asset_id',
      headerName: 'Asset ID',
      minWidth: 120,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#475569', 0.12),
            color: '#475569',
            border: '1px solid',
            borderColor: alpha('#475569', 0.2),
          }}
        />
      ),
    },
    {
      field: 'name',
      headerName: 'Asset Name',
      minWidth: 180,
      flex: 1.4,
    },
    {
      field: 'type',
      headerName: 'Type',
      minWidth: 180,
      flex: 1.3,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 130,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const colorMap = {
          'In Use': { bgcolor: alpha('#10b981', 0.12), color: '#059669', border: alpha('#059669', 0.2) },
          'In Transit': { bgcolor: alpha('#0ea5e9', 0.12), color: '#0284c7', border: alpha('#0284c7', 0.2) },
          'Idle': { bgcolor: alpha('#f59e0b', 0.12), color: '#d97706', border: alpha('#d97706', 0.2) },
          'Maintenance': { bgcolor: alpha('#ef4444', 0.12), color: '#dc2626', border: alpha('#dc2626', 0.2) },
        };
        const style = colorMap[params.value] || { bgcolor: alpha('#64748b', 0.12), color: '#475569', border: alpha('#475569', 0.2) };
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor: style.bgcolor,
              color: style.color,
              border: '1px solid',
              borderColor: style.border,
            }}
          />
        );
      },
    },
    {
      field: 'location',
      headerName: 'Location',
      minWidth: 180,
      flex: 1.3,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          icon={<LocationIcon />}
          label={params.value}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: alpha('#a855f7', 0.12),
            color: '#9333ea',
            border: '1px solid',
            borderColor: alpha('#9333ea', 0.2),
          }}
        />
      ),
    },
    {
      field: 'utilization',
      headerName: 'Utilization %',
      minWidth: 150,
      flex: 1.1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const color = params.value >= 85 ? '#059669' : params.value >= 70 ? '#d97706' : '#dc2626';
        return (
          <Box sx={{ textAlign: 'center', width: '100%' }}>
            <Typography
              variant="body2"
              fontWeight="bold"
              sx={{ color, mb: 0.5 }}
            >
              {params.value}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={params.value}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: alpha(color, 0.2),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: color,
                },
              }}
            />
          </Box>
        );
      },
    },
    {
      field: 'last_updated',
      headerName: 'Last Updated',
      minWidth: 180,
      flex: 1.2,
      align: 'center',
      headerAlign: 'center',
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>REVEQ.AI</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Asset Tracking</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <EquipmentIcon sx={{ fontSize: 32, color: '#9c27b0' }} />
              <Typography variant="h4" fontWeight={700}>Asset Tracking</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Real-time equipment location, status tracking, and operational visibility across all assets
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh"><IconButton onClick={fetchData} color="primary"><Refresh /></IconButton></Tooltip>
            <Tooltip title="Export"><IconButton color="primary"><Download /></IconButton></Tooltip>
          </Stack>
        </Stack>
      </Box>

      {metrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#9c27b0', 0.1)} 0%, ${alpha('#9c27b0', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <AssetIcon sx={{ color: '#9c27b0' }} />
                  <Typography variant="body2" color="text.secondary">Total Assets</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#9c27b0">{metrics.totalAssets}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <CheckCircle sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="text.secondary">Active Assets</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">{metrics.activeAssets}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <StatusIcon sx={{ color: '#f59e0b' }} />
                  <Typography variant="body2" color="text.secondary">Avg Utilization</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#f59e0b">{metrics.avgUtilization.toFixed(1)}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#ef4444', 0.1)} 0%, ${alpha('#ef4444', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <EquipmentIcon sx={{ color: '#ef4444' }} />
                  <Typography variant="body2" color="text.secondary">In Maintenance</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#ef4444">{metrics.inMaintenance}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, width: '100%' }}>
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
          sx={stoxTheme.getDataGridSx()}
        />
      </Paper>
    </Box>
  );
};

export default AssetTracking;
