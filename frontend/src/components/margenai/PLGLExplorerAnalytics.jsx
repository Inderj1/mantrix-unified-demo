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
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { usePLGLData } from '../../hooks/useMargenData';
import stoxTheme from '../stox/stoxTheme';

const PLGLExplorerAnalytics = ({ onBack }) => {
  const theme = useTheme();
  const { data: plData, loading, refetch } = usePLGLData();

  // Calculate KPIs
  const revenue = plData?.filter(row => row.category === 'Revenue').reduce((sum, row) => sum + row.amount, 0) || 0;
  const cogs = plData?.filter(row => row.category === 'COGS').reduce((sum, row) => sum + row.amount, 0) || 0;
  const opex = plData?.filter(row => row.category === 'Operating Expenses').reduce((sum, row) => sum + row.amount, 0) || 0;
  const netIncome = revenue - cogs - opex;

  const glAccountCount = new Set(plData?.map(row => row.gl_account) || []).size;

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `$${(revenue / 1000000).toFixed(1)}M`,
      color: '#10b981',
      icon: TrendingUpIcon,
    },
    {
      title: 'Total COGS',
      value: `$${(cogs / 1000000).toFixed(1)}M`,
      color: '#3b82f6',
      icon: AccountBalanceIcon,
    },
    {
      title: 'Net Income',
      value: `$${(netIncome / 1000000).toFixed(1)}M`,
      color: '#8b5cf6',
      icon: MoneyIcon,
    },
    {
      title: 'GL Accounts',
      value: glAccountCount.toString(),
      color: '#f97316',
      icon: AssessmentIcon,
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
    {
      field: 'gl_account',
      headerName: 'GL Account',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
          {params.value}
        </Typography>
      ),
    },
    { field: 'account_name', headerName: 'Account Name', width: 220 },
    {
      field: 'category',
      headerName: 'Category',
      width: 180,
      renderCell: (params) => {
        const colorMap = {
          'Revenue': '#10b981',
          'COGS': '#3b82f6',
          'Operating Expenses': '#f97316',
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
    { field: 'subcategory', headerName: 'Subcategory', width: 160 },
    { field: 'period', headerName: 'Period', width: 120 },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 140,
      type: 'number',
      renderCell: (params) => {
        const value = params.value;
        if (value === null || value === undefined || isNaN(value)) {
          return <Typography variant="body2">-</Typography>;
        }
        return (
          <Typography variant="body2" fontWeight={600}>
            ${(value / 1000).toFixed(0)}K
          </Typography>
        );
      },
    },
    {
      field: 'budget',
      headerName: 'Budget',
      width: 130,
      type: 'number',
      renderCell: (params) => {
        const value = params.value;
        if (value === null || value === undefined || isNaN(value)) {
          return <Typography variant="body2">-</Typography>;
        }
        return (
          <Typography variant="body2">
            ${(value / 1000).toFixed(0)}K
          </Typography>
        );
      },
    },
    {
      field: 'variance',
      headerName: 'Variance',
      width: 130,
      type: 'number',
      renderCell: (params) => {
        const value = params.value;
        const row = params.row;

        if (value === null || value === undefined || isNaN(value)) {
          return <Typography variant="body2">-</Typography>;
        }

        // For Revenue: positive variance is good (green)
        // For COGS/OpEx: negative variance is good (green)
        let color;
        if (row.category === 'Revenue') {
          color = value > 0 ? '#10b981' : '#ef4444';
        } else {
          color = value < 0 ? '#10b981' : '#ef4444';
        }

        return (
          <Chip
            label={`${value > 0 ? '+' : ''}${(value / 1000).toFixed(0)}K`}
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
      field: 'variance_pct',
      headerName: 'Variance %',
      width: 120,
      type: 'number',
      renderCell: (params) => {
        const value = params.value;
        const row = params.row;

        if (value === null || value === undefined) {
          return <Typography variant="body2">-</Typography>;
        }

        let color;
        if (row.category === 'Revenue') {
          color = value > 0 ? '#10b981' : '#ef4444';
        } else {
          color = value < 0 ? '#10b981' : '#ef4444';
        }

        return (
          <Typography variant="body2" fontWeight={600} color={color}>
            {value > 0 ? '+' : ''}{value.toFixed(1)}%
          </Typography>
        );
      },
    },
  ];

  const handleExport = () => {
    console.log('Exporting P&L data...');
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
              P&L Statement & GL Explorer
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
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AssessmentIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                P&L Statement & GL Explorer
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Complete P&L view with GL account-level detail and variance analysis
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton onClick={refetch} sx={{ bgcolor: alpha('#f97316', 0.1) }}>
              <RefreshIcon sx={{ color: '#f97316' }} />
            </IconButton>
            <IconButton onClick={handleExport} sx={{ bgcolor: alpha('#f97316', 0.1) }}>
              <DownloadIcon sx={{ color: '#f97316' }} />
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
          rows={plData || []}
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

export default PLGLExplorerAnalytics;
