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
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useMarginProfitability } from '../../hooks/useMargenData';
import stoxTheme from '../stox/stoxTheme';

const MarginProfitabilityAnalytics = ({ onBack }) => {
  const theme = useTheme();
  const { data: marginData, loading, refetch } = useMarginProfitability();

  // Calculate KPIs
  const totalRevenue = marginData?.reduce((sum, row) => sum + row.revenue, 0) || 0;
  const totalCOGS = marginData?.reduce((sum, row) => sum + row.cogs, 0) || 0;
  const grossMargin = totalRevenue > 0 ? ((totalRevenue - totalCOGS) / totalRevenue) * 100 : 0;

  const avgOpMargin = marginData?.reduce((sum, row) => sum + row.operating_margin, 0) / (marginData?.length || 1) || 0;
  const avgNetMargin = marginData?.reduce((sum, row) => sum + row.net_margin, 0) / (marginData?.length || 1) || 0;

  const highMarginItems = marginData?.filter(row => row.gross_margin > 35).length || 0;

  const kpiCards = [
    {
      title: 'Gross Margin',
      value: `${grossMargin.toFixed(1)}%`,
      color: '#8b5cf6',
      icon: MoneyIcon,
    },
    {
      title: 'Avg Operating Margin',
      value: `${avgOpMargin.toFixed(1)}%`,
      color: '#10b981',
      icon: TrendingUpIcon,
    },
    {
      title: 'Avg Net Margin',
      value: `${avgNetMargin.toFixed(1)}%`,
      color: '#3b82f6',
      icon: TrendingUpIcon,
    },
    {
      title: 'High Margin Items',
      value: highMarginItems.toString(),
      color: '#f59e0b',
      icon: MoneyIcon,
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
    { field: 'type', headerName: 'Type', width: 120 },
    { field: 'name', headerName: 'Name', width: 180 },
    { field: 'period', headerName: 'Period', width: 120 },
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
            ${(value / 1000).toFixed(0)}K
          </Typography>
        );
      },
    },
    {
      field: 'cogs',
      headerName: 'COGS',
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
      field: 'gross_margin',
      headerName: 'Gross Margin %',
      width: 140,
      type: 'number',
      renderCell: (params) => {
        const value = params.value;
        const color = value > 35 ? '#10b981' : value > 25 ? '#f59e0b' : '#ef4444';
        return (
          <Chip
            label={`${value.toFixed(1)}%`}
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
      field: 'opex',
      headerName: 'OpEx',
      width: 110,
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
      field: 'operating_margin',
      headerName: 'Operating Margin %',
      width: 160,
      type: 'number',
      renderCell: (params) => {
        const value = params.value;
        const color = value > 20 ? '#10b981' : value > 10 ? '#f59e0b' : '#ef4444';
        return (
          <Chip
            label={`${value.toFixed(1)}%`}
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
      field: 'net_margin',
      headerName: 'Net Margin %',
      width: 130,
      type: 'number',
      renderCell: (params) => {
        const value = params.value;
        const color = value > 15 ? '#10b981' : value > 8 ? '#f59e0b' : '#ef4444';
        return (
          <Typography variant="body2" fontWeight={600} color={color}>
            {value.toFixed(1)}%
          </Typography>
        );
      },
    },
    {
      field: 'contribution',
      headerName: 'Contribution',
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
      field: 'trend',
      headerName: 'Trend',
      width: 120,
      renderCell: (params) => {
        const colorMap = {
          'Improving': '#10b981',
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
    console.log('Exporting margin data...');
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
              Margin & Profitability
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
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MoneyIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Margin & Profitability
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gross margin, operating margin, and profitability by segment
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton onClick={refetch} sx={{ bgcolor: alpha('#8b5cf6', 0.1) }}>
              <RefreshIcon sx={{ color: '#8b5cf6' }} />
            </IconButton>
            <IconButton onClick={handleExport} sx={{ bgcolor: alpha('#8b5cf6', 0.1) }}>
              <DownloadIcon sx={{ color: '#8b5cf6' }} />
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
          rows={marginData || []}
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

export default MarginProfitabilityAnalytics;
