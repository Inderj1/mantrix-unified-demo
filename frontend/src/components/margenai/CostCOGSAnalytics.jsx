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
  AccountBalance as AccountBalanceIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useCostCOGS } from '../../hooks/useMargenData';
import stoxTheme from '../stox/stoxTheme';

const CostCOGSAnalytics = ({ onBack }) => {
  const theme = useTheme();
  const { data: costData, loading, refetch } = useCostCOGS();

  // Calculate KPIs
  const totalCost = costData?.reduce((sum, row) => sum + row.amount, 0) || 0;
  const totalVariance = costData?.reduce((sum, row) => sum + row.variance, 0) || 0;

  const categoryTotals = {};
  costData?.forEach(row => {
    categoryTotals[row.cost_category] = (categoryTotals[row.cost_category] || 0) + row.amount;
  });
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const overBudgetCount = costData?.filter(row => row.variance > 0).length || 0;

  const kpiCards = [
    {
      title: 'Total COGS',
      value: `$${(totalCost / 1000000).toFixed(1)}M`,
      color: '#3b82f6',
      icon: AccountBalanceIcon,
    },
    {
      title: 'Budget Variance',
      value: `$${(totalVariance / 1000).toFixed(0)}K`,
      color: totalVariance > 0 ? '#ef4444' : '#10b981',
      icon: totalVariance > 0 ? TrendingUpIcon : TrendingDownIcon,
    },
    {
      title: 'Top Cost Category',
      value: topCategory,
      color: '#8b5cf6',
      icon: AccountBalanceIcon,
    },
    {
      title: 'Over Budget Items',
      value: overBudgetCount.toString(),
      color: '#f59e0b',
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
    { field: 'cost_category', headerName: 'Cost Category', width: 180 },
    {
      field: 'gl_account',
      headerName: 'GL Account',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontFamily="monospace">
          {params.value}
        </Typography>
      ),
    },
    { field: 'subcategory', headerName: 'Subcategory', width: 160 },
    {
      field: 'amount',
      headerName: 'Amount',
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
      field: 'pct_of_total',
      headerName: '% of Total',
      width: 110,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value.toFixed(1)}%
        </Typography>
      ),
    },
    {
      field: 'vs_budget',
      headerName: 'vs Budget',
      width: 120,
      type: 'number',
      renderCell: (params) => {
        const value = params.value;
        if (value === null || value === undefined || isNaN(value)) {
          return <Typography variant="body2">-</Typography>;
        }
        return (
          <Typography variant="body2">
            ${(value / 1000).toFixed(1)}K
          </Typography>
        );
      },
    },
    {
      field: 'variance',
      headerName: 'Variance',
      width: 120,
      type: 'number',
      renderCell: (params) => {
        const value = params.value;
        if (value === null || value === undefined || isNaN(value)) {
          return <Typography variant="body2">-</Typography>;
        }
        const color = value > 0 ? '#ef4444' : '#10b981';
        return (
          <Chip
            label={`${value > 0 ? '+' : ''}${(value / 1000).toFixed(1)}K`}
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
          'Increasing': '#ef4444',
          'Stable': '#f59e0b',
          'Decreasing': '#10b981',
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
    console.log('Exporting cost data...');
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
              Cost & COGS Analysis
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
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AccountBalanceIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Cost & COGS Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cost structure breakdown, COGS components, and expense tracking
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton onClick={refetch} sx={{ bgcolor: alpha('#3b82f6', 0.1) }}>
              <RefreshIcon sx={{ color: '#3b82f6' }} />
            </IconButton>
            <IconButton onClick={handleExport} sx={{ bgcolor: alpha('#3b82f6', 0.1) }}>
              <DownloadIcon sx={{ color: '#3b82f6' }} />
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
          rows={costData || []}
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

export default CostCOGSAnalytics;
