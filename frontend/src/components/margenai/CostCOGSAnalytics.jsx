import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
  Tab,
  Tabs,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Inventory as ProductIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import stoxTheme from '../stox/stoxTheme';

const API_BASE = 'http://localhost:8000/api/v1/margen/csg';

const CostCOGSAnalytics = ({ onBack }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const [summary, setSummary] = useState(null);
  const [systemData, setSystemData] = useState([]);
  const [distributorData, setDistributorData] = useState([]);
  const [itemData, setItemData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, systemRes, distRes, itemRes] = await Promise.all([
        fetch(`${API_BASE}/cogs/summary`).then(r => r.json()),
        fetch(`${API_BASE}/cogs/by-system`).then(r => r.json()),
        fetch(`${API_BASE}/cogs/by-distributor`).then(r => r.json()),
        fetch(`${API_BASE}/cogs/by-item?limit=100`).then(r => r.json()),
      ]);

      setSummary(summaryRes.summary);
      setSystemData(systemRes.systems || []);
      setDistributorData(distRes.distributors || []);
      setItemData(itemRes.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (value) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined) return '0%';
    return `${value.toFixed(1)}%`;
  };

  // Calculate derived metrics for KPI cards
  const totalCost = summary?.total_cogs || 0;
  const topCategory = systemData.length > 0 ? systemData[0].system : 'N/A';

  // Calculate cost metrics
  const avgCogsPerTransaction = summary ? (summary.total_cogs / summary.transaction_count) : 0;
  const totalCogsUnits = systemData.reduce((sum, sys) => sum + (sys.quantity || 0), 0);
  const avgCogsPerUnit = totalCogsUnits > 0 ? (summary?.total_cogs || 0) / totalCogsUnits : 0;

  const kpiCards = summary ? [
    {
      title: 'Total COGS',
      value: formatCurrency(summary.total_cogs),
      subtitle: `${summary.transaction_count?.toLocaleString()} transactions`,
      color: '#ef4444',
      icon: AccountBalanceIcon,
    },
    {
      title: 'COGS % of Revenue',
      value: formatPercent(summary.cogs_percent),
      subtitle: 'Cost ratio',
      color: '#f59e0b',
      icon: TrendingDownIcon,
    },
    {
      title: 'Highest Cost System',
      value: topCategory,
      subtitle: systemData.length > 0 ? formatCurrency(systemData[0].total_cogs) : '$0',
      color: '#8b5cf6',
      icon: ProductIcon,
    },
    {
      title: 'Avg COGS per Unit',
      value: formatCurrency(avgCogsPerUnit),
      subtitle: `${totalCogsUnits.toLocaleString()} total units`,
      color: '#3b82f6',
      icon: CategoryIcon,
    },
  ] : [];

  // Unified DataGrid columns - used for all tabs
  const getColumns = (viewType) => {
    const nameField = viewType === 'system' ? 'system' :
                      viewType === 'distributor' ? 'distributor' : 'item_code';

    const nameHeader = viewType === 'system' ? 'Product System' :
                       viewType === 'distributor' ? 'Distributor' : 'Item Code';

    const baseColumns = [
      {
        field: nameField,
        headerName: nameHeader,
        width: 200,
        flex: 1,
        minWidth: 150,
      },
      ...(viewType === 'item' ? [{
        field: 'item_description',
        headerName: 'Description',
        width: 250,
      }] : []),
      {
        field: 'total_cogs',
        headerName: 'Total COGS',
        width: 130,
        type: 'number',
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={600} color="error">
            {formatCurrency(params.value)}
          </Typography>
        ),
      },
      {
        field: 'total_revenue',
        headerName: 'Revenue',
        width: 130,
        type: 'number',
        renderCell: (params) => (
          <Typography variant="body2">
            {formatCurrency(params.value)}
          </Typography>
        ),
      },
      {
        field: 'total_gm',
        headerName: 'Gross Margin',
        width: 130,
        type: 'number',
        renderCell: (params) => (
          <Typography variant="body2" fontWeight={600} color="success">
            {formatCurrency(params.value)}
          </Typography>
        ),
      },
      {
        field: 'cogs_percent',
        headerName: 'COGS %',
        width: 100,
        type: 'number',
        renderCell: (params) => (
          <Chip
            label={formatPercent(params.value)}
            size="small"
            sx={{
              bgcolor: params.value < 10 ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
              color: params.value < 10 ? '#10b981' : '#ef4444',
              fontWeight: 600,
            }}
          />
        ),
      },
      {
        field: 'transaction_count',
        headerName: 'Transactions',
        width: 110,
        type: 'number',
      },
      {
        field: 'quantity',
        headerName: 'Units',
        width: 100,
        type: 'number',
      },
    ];

    return baseColumns;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
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
            <IconButton onClick={fetchData} sx={{ bgcolor: alpha('#ef4444', 0.1) }}>
              <RefreshIcon sx={{ color: '#ef4444' }} />
            </IconButton>
            <IconButton sx={{ bgcolor: alpha('#ef4444', 0.1) }}>
              <DownloadIcon sx={{ color: '#ef4444' }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading data: {error}
        </Alert>
      )}

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
                    <Typography variant="caption" color="text.secondary">
                      {kpi.subtitle}
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

      {/* Tabs for different views */}
      <Paper sx={{ mb: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="By Product System" icon={<ProductIcon />} iconPosition="start" />
          <Tab label="By Distributor" icon={<BusinessIcon />} iconPosition="start" />
          <Tab label="By Item" icon={<CategoryIcon />} iconPosition="start" />
        </Tabs>

        {/* Unified DataGrid - structure stays consistent across tabs */}
        <Box sx={{ p: 2, height: 600 }}>
          <DataGrid
            rows={
              activeTab === 0 ? systemData.map((row, idx) => ({ id: idx + 1, ...row })) :
              activeTab === 1 ? distributorData.map((row, idx) => ({ id: idx + 1, ...row })) :
              itemData.map((row, idx) => ({ id: idx + 1, ...row }))
            }
            columns={getColumns(
              activeTab === 0 ? 'system' :
              activeTab === 1 ? 'distributor' : 'item'
            )}
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
        </Box>
      </Paper>
    </Box>
  );
};

export default CostCOGSAnalytics;
