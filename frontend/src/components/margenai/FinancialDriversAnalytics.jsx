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
  LinearProgress,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useFinancialDrivers } from '../../hooks/useMargenData';
import stoxTheme from '../stox/stoxTheme';

const getColors = (darkMode) => ({
  primary: darkMode ? '#4da6ff' : '#0a6ed1',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const FinancialDriversAnalytics = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const theme = useTheme();
  const { data: driversData, loading, refetch } = useFinancialDrivers();

  // Calculate KPIs
  const totalScenarios = driversData?.length || 0;
  const avgImpact = driversData?.reduce((sum, row) => sum + row.revenue_impact, 0) / (driversData?.length || 1) || 0;
  const highImpactCount = driversData?.filter(row => Math.abs(row.revenue_impact) > 1000000).length || 0;
  const avgSensitivity = driversData?.reduce((sum, row) => sum + row.sensitivity, 0) / (driversData?.length || 1) || 0;

  const kpiCards = [
    {
      title: 'Total Scenarios',
      value: totalScenarios.toString(),
      color: '#06b6d4',
      icon: AnalyticsIcon,
    },
    {
      title: 'Avg Revenue Impact',
      value: `$${(avgImpact / 1000000).toFixed(1)}M`,
      color: avgImpact > 0 ? '#10b981' : '#ef4444',
      icon: TrendingUpIcon,
    },
    {
      title: 'High Impact Drivers',
      value: highImpactCount.toString(),
      color: '#f97316',
      icon: SpeedIcon,
    },
    {
      title: 'Avg Sensitivity',
      value: avgSensitivity.toFixed(1),
      color: '#8b5cf6',
      icon: AccountBalanceIcon,
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
    { field: 'driver_name', headerName: 'Driver Name', width: 200 },
    {
      field: 'category',
      headerName: 'Category',
      width: 140,
      renderCell: (params) => {
        const colorMap = {
          'Revenue': '#10b981',
          'Cost': '#2b88d8',
          'Volume': '#f97316',
          'Pricing': '#8b5cf6',
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
    {
      field: 'current_value',
      headerName: 'Current Value',
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'scenario_value',
      headerName: 'Scenario Value',
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'change_pct',
      headerName: 'Change %',
      width: 120,
      type: 'number',
      renderCell: (params) => {
        const value = params.value;
        const color = value > 0 ? '#10b981' : '#ef4444';
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
      field: 'revenue_impact',
      headerName: 'Revenue Impact',
      width: 150,
      type: 'number',
      renderCell: (params) => {
        const value = params.value;
        if (value === null || value === undefined || isNaN(value)) {
          return <Typography variant="body2">-</Typography>;
        }
        const color = value > 0 ? '#10b981' : '#ef4444';
        return (
          <Typography variant="body2" fontWeight={700} color={color}>
            {value > 0 ? '+' : ''}${(value / 1000000).toFixed(2)}M
          </Typography>
        );
      },
    },
    {
      field: 'margin_impact',
      headerName: 'Margin Impact',
      width: 140,
      type: 'number',
      renderCell: (params) => {
        const value = params.value;
        const color = value > 0 ? '#10b981' : '#ef4444';
        return (
          <Typography variant="body2" fontWeight={600} color={color}>
            {value > 0 ? '+' : ''}{value.toFixed(2)}%
          </Typography>
        );
      },
    },
    {
      field: 'sensitivity',
      headerName: 'Sensitivity',
      width: 150,
      renderCell: (params) => {
        const value = params.value;
        const normalized = Math.min(value / 10, 1) * 100;
        const color = value > 7 ? '#ef4444' : value > 4 ? '#f59e0b' : '#10b981';
        return (
          <Box sx={{ width: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LinearProgress
                variant="determinate"
                value={normalized}
                sx={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: alpha(color, 0.2),
                  '& .MuiLinearProgress-bar': {
                    bgcolor: color,
                    borderRadius: 3,
                  },
                }}
              />
              <Typography variant="caption" fontWeight={600} sx={{ minWidth: 30 }}>
                {value.toFixed(1)}
              </Typography>
            </Stack>
          </Box>
        );
      },
    },
    {
      field: 'probability',
      headerName: 'Probability',
      width: 130,
      renderCell: (params) => {
        const colorMap = {
          'High': '#10b981',
          'Medium': '#f59e0b',
          'Low': '#ef4444',
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
    console.log('Exporting financial drivers data...');
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: colors.background }}>
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
              Financial Drivers & What-If
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
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AnalyticsIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Financial Drivers & What-If Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Key value drivers, scenario modeling, and forecasted P&L impact
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton onClick={refetch} sx={{ bgcolor: alpha('#06b6d4', 0.1) }}>
              <RefreshIcon sx={{ color: '#06b6d4' }} />
            </IconButton>
            <IconButton onClick={handleExport} sx={{ bgcolor: alpha('#06b6d4', 0.1) }}>
              <DownloadIcon sx={{ color: '#06b6d4' }} />
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
                bgcolor: colors.cardBg,
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
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: colors.paper }}>
        <DataGrid
          rows={driversData || []}
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
          sx={{
            ...stoxTheme.getDataGridSx(),
            bgcolor: colors.paper,
            '& .MuiDataGrid-cell': { color: colors.text, borderColor: colors.border },
            '& .MuiDataGrid-columnHeaders': { bgcolor: darkMode ? colors.cardBg : '#fafafa', color: colors.text, borderColor: colors.border },
            '& .MuiDataGrid-footerContainer': { bgcolor: colors.paper, borderColor: colors.border },
          }}
        />
      </Paper>
    </Box>
  );
};

export default FinancialDriversAnalytics;
