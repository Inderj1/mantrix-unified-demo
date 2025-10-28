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
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  ShowChart,
  Refresh,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Download,
  Warning,
  CheckCircle,
  Error,
  Store,
  Inventory,
} from '@mui/icons-material';
import stoxTheme from './stoxTheme';

const StoreHealthMonitor = ({ onBack }) => {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = () => {
    setLoading(true);

    setTimeout(() => {
      const stores = [
        { id: 'STORE-001', name: 'NYC Fifth Avenue', region: 'Northeast' },
        { id: 'STORE-045', name: 'LA Beverly Hills', region: 'West' },
        { id: 'STORE-089', name: 'Chicago Magnificent Mile', region: 'Midwest' },
        { id: 'STORE-123', name: 'Miami Design District', region: 'Southeast' },
        { id: 'STORE-167', name: 'Dallas Galleria', region: 'Southwest' },
      ];

      const products = [
        { sku: 'SKU-7891', name: 'Premium Color Kit' },
        { sku: 'SKU-4523', name: 'Color Reviving Gloss' },
        { sku: 'SKU-9021', name: 'Root Retouch Kit' },
        { sku: 'SKU-3456', name: 'Hair Treatment Serum' },
      ];

      const data = [];
      let idCounter = 1;

      stores.forEach((store) => {
        products.forEach((product) => {
          const onHand = Math.round(50 + Math.random() * 200);
          const minStock = Math.round(onHand * 0.3);
          const maxStock = Math.round(onHand * 1.8);
          const avgDailySales = Math.round(5 + Math.random() * 15);
          const daysOfStock = Math.round(onHand / avgDailySales);
          const stockoutRisk = daysOfStock < 7 ? 'High' : daysOfStock < 14 ? 'Medium' : 'Low';
          const overstock = onHand > maxStock ? 'Yes' : 'No';
          const healthScore = overstock === 'Yes' ? 60 : stockoutRisk === 'High' ? 55 : stockoutRisk === 'Medium' ? 75 : 95;

          data.push({
            id: `SH${String(idCounter++).padStart(4, '0')}`,
            store_id: store.id,
            store_name: store.name,
            region: store.region,
            product_sku: product.sku,
            product_name: product.name,
            on_hand: onHand,
            min_stock: minStock,
            max_stock: maxStock,
            avg_daily_sales: avgDailySales,
            days_of_stock: daysOfStock,
            stockout_risk: stockoutRisk,
            overstock: overstock,
            health_score: healthScore,
            status: healthScore > 85 ? 'Healthy' : healthScore > 70 ? 'Warning' : 'Critical',
          });
        });
      });

      setHealthData(data);

      const healthyCount = data.filter(d => d.status === 'Healthy').length;
      const warningCount = data.filter(d => d.status === 'Warning').length;
      const criticalCount = data.filter(d => d.status === 'Critical').length;
      const avgHealthScore = data.reduce((sum, row) => sum + row.health_score, 0) / data.length;

      setMetrics({
        totalRecords: data.length,
        healthyCount,
        warningCount,
        criticalCount,
        avgHealthScore: avgHealthScore.toFixed(1),
      });

      setLoading(false);
    }, 800);
  };

  const columns = [
    { field: 'id', headerName: 'Health ID', minWidth: 110, flex: 1 },
    { field: 'store_id', headerName: 'Store ID', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'store_name', headerName: 'Store Name', minWidth: 180, flex: 1.2, align: 'center', headerAlign: 'center' },
    { field: 'region', headerName: 'Region', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'product_sku', headerName: 'SKU', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'product_name', headerName: 'Product', minWidth: 180, flex: 1.2, align: 'center', headerAlign: 'center' },
    {
      field: 'on_hand',
      headerName: 'On Hand',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'avg_daily_sales',
      headerName: 'Avg Daily Sales',
      minWidth: 140,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'days_of_stock',
      headerName: 'Days of Stock',
      minWidth: 130,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value} days`}
          size="small"
          color={params.value < 7 ? 'error' : params.value < 14 ? 'warning' : 'success'}
        />
      ),
    },
    {
      field: 'stockout_risk',
      headerName: 'Stockout Risk',
      minWidth: 130,
      flex: 1.1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'High' ? 'error' : params.value === 'Medium' ? 'warning' : 'success'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'overstock',
      headerName: 'Overstock',
      minWidth: 110,
      flex: 0.9,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Yes' ? 'warning' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'health_score',
      headerName: 'Health Score',
      minWidth: 130,
      flex: 1.2,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
          <Box
            sx={{
              width: 60,
              height: 6,
              bgcolor: alpha('#e0e0e0', 0.3),
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${params.value}%`,
                height: '100vh',
                bgcolor: params.value > 85 ? '#10b981' : params.value > 70 ? '#f59e0b' : '#ef4444',
              }}
            />
          </Box>
        </Stack>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          {params.value === 'Healthy' ? (
            <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
          ) : params.value === 'Warning' ? (
            <Warning sx={{ fontSize: 16, color: 'warning.main' }} />
          ) : (
            <Error sx={{ fontSize: 16, color: 'error.main' }} />
          )}
          <Typography variant="caption">{params.value}</Typography>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>
              STOX.AI
            </Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>
              Store Level View
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              Health Monitor
            </Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
            Back
          </Button>
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <ShowChart sx={{ fontSize: 32, color: '#2563eb' }} />
              <Typography variant="h4" fontWeight={700}>
                Store Health Monitor
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Real-time store inventory health monitoring with stock alerts and availability tracking
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={fetchHealthData} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Data">
              <IconButton color="primary">
                <Download />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Metrics */}
      {metrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <CheckCircle sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="text.secondary">Healthy</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">{metrics.healthyCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Warning sx={{ color: '#f59e0b' }} />
                  <Typography variant="body2" color="text.secondary">Warning</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#f59e0b">{metrics.warningCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#ef4444', 0.1)} 0%, ${alpha('#ef4444', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Error sx={{ color: '#ef4444' }} />
                  <Typography variant="body2" color="text.secondary">Critical</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#ef4444">{metrics.criticalCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#2563eb', 0.1)} 0%, ${alpha('#2563eb', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <ShowChart sx={{ color: '#2563eb' }} />
                  <Typography variant="body2" color="text.secondary">Avg Health Score</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#2563eb">{metrics.avgHealthScore}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* DataGrid */}
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DataGrid
          rows={healthData}
          columns={columns}
          loading={loading}
          density="compact"
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={stoxTheme.getDataGridSx()}
        />
      </Paper>
    </Box>
  );
};

export default StoreHealthMonitor;
