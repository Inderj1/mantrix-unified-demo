import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Stack,
  IconButton,
  Button,
  Breadcrumbs,
  Link,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useRevenueGrowth } from '../../hooks/useMargenData';
import stoxTheme from '../stox/stoxTheme';

const RevenueGrowthAnalytics = ({ onBack }) => {
  const theme = useTheme();
  const { data: revenueData, loading, refetch } = useRevenueGrowth();

  // Calculate KPIs
  const totalRevenue = revenueData?.reduce((sum, row) => sum + row.revenue, 0) || 0;
  const avgGrowth = revenueData?.reduce((sum, row) => sum + row.growth_pct, 0) / (revenueData?.length || 1) || 0;

  const productRevenue = {};
  revenueData?.forEach(row => {
    productRevenue[row.product] = (productRevenue[row.product] || 0) + row.revenue;
  });
  const topProduct = Object.entries(productRevenue).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const channelRevenue = {};
  revenueData?.forEach(row => {
    channelRevenue[row.channel] = (channelRevenue[row.channel] || 0) + row.revenue;
  });
  const topChannel = Object.entries(channelRevenue).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `$${(totalRevenue / 1000000).toFixed(1)}M`,
      color: '#10b981',
      icon: TrendingUpIcon,
    },
    {
      title: 'Avg YoY Growth',
      value: `${avgGrowth.toFixed(1)}%`,
      color: avgGrowth > 0 ? '#10b981' : '#ef4444',
      icon: avgGrowth > 0 ? ArrowUpwardIcon : ArrowDownwardIcon,
    },
    {
      title: 'Top Product',
      value: topProduct,
      color: '#3b82f6',
      icon: TrendingUpIcon,
    },
    {
      title: 'Top Channel',
      value: topChannel,
      color: '#8b5cf6',
      icon: TrendingUpIcon,
    },
  ];

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} color="primary">
          {params.value}
        </Typography>
      ),
    },
    { field: 'period', headerName: 'Period', width: 120 },
    { field: 'product', headerName: 'Product', width: 180 },
    { field: 'channel', headerName: 'Channel', width: 140 },
    { field: 'region', headerName: 'Region', width: 100 },
    {
      field: 'revenue',
      headerName: 'Revenue',
      width: 130,
      type: 'number',
      renderCell: (params) => {
        const value = params.value;
        if (value === null || value === undefined || isNaN(value)) {
          return <Typography variant="body2">-</Typography>;
        }
        return (
          <Typography variant="body2" fontWeight={600}>
            ${(value / 1000).toFixed(1)}K
          </Typography>
        );
      },
    },
    {
      field: 'units',
      headerName: 'Units',
      width: 100,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'avg_price',
      headerName: 'Avg Price',
      width: 110,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2">
          ${params.value.toFixed(2)}
        </Typography>
      ),
    },
    {
      field: 'growth_pct',
      headerName: 'Growth %',
      width: 120,
      type: 'number',
      renderCell: (params) => {
        const value = params.value;
        const color = value > 10 ? '#10b981' : value > 0 ? '#f59e0b' : '#ef4444';
        return (
          <Chip
            label={`${value > 0 ? '+' : ''}${value.toFixed(1)}%`}
            size="small"
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        );
      },
    },
    {
      field: 'trend',
      headerName: 'Trend',
      width: 120,
      renderCell: (params) => {
        const colorMap = {
          'Growing': '#10b981',
          'Stable': '#f59e0b',
          'Declining': '#ef4444',
        };
        const color = colorMap[params.value] || '#6b7280';
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        );
      },
    },
  ];

  const handleExport = () => {
    console.log('Exporting revenue data...');
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link
              component="button"
              variant="body1"
              onClick={onBack}
              sx={{
                textDecoration: 'none',
                color: 'text.primary',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              MARGEN.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              Revenue & Growth Analytics
            </Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
            Back
          </Button>
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUpIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Revenue & Growth Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Top-line revenue performance, growth trends, and sales analysis
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton onClick={refetch} sx={{ bgcolor: alpha('#10b981', 0.1) }}>
              <RefreshIcon sx={{ color: '#10b981' }} />
            </IconButton>
            <IconButton onClick={handleExport} sx={{ bgcolor: alpha('#10b981', 0.1) }}>
              <DownloadIcon sx={{ color: '#10b981' }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {kpiCards.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${alpha(kpi.color, 0.1)} 0%, ${alpha(kpi.color, 0.05)} 100%)`,
                border: `1px solid ${alpha(kpi.color, 0.2)}`,
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {kpi.title}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color={kpi.color}>
                      {kpi.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      bgcolor: alpha(kpi.color, 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <kpi.icon sx={{ color: kpi.color, fontSize: 24 }} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* DataGrid */}
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DataGrid
          rows={revenueData || []}
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

export default RevenueGrowthAnalytics;
