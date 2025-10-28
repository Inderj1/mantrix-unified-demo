import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha,
} from '@mui/material';
import {
  ViewModule, Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download, Functions, CalendarMonth,
} from '@mui/icons-material';
import { AnalyticalTable, ThemeProvider } from '@ui5/webcomponents-react';
import '@ui5/webcomponents/dist/Assets.js';
import '@ui5/webcomponents-fiori/dist/Assets.js';

const DCPlanningTable = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const dcs = ['DC-East', 'DC-Midwest', 'DC-West'];
      const products = ['MR_HAIR_101', 'MR_HAIR_102', 'MR_HAIR_103'];
      const currentDate = '2025-01-11';
      const isoWeek = '2025-W02';

      const planningData = [];
      let idCounter = 1;

      dcs.forEach((dc) => {
        products.forEach((product) => {
          // Channel forecasts
          const retailFcst = Math.round(400 + Math.random() * 200);
          const amazonFcst = Math.round(250 + Math.random() * 200);
          const wholesaleFcst = Math.round(100 + Math.random() * 100);
          const d2cFcst = Math.round(80 + Math.random() * 50);

          // Aggregated metrics
          const dailyForecastDC = retailFcst + amazonFcst + wholesaleFcst + d2cFcst;
          const weeklyMean = dailyForecastDC * 7;
          const weeklyStdDev = Math.round(Math.sqrt(dailyForecastDC) * 7);
          const correlationAdjustedVar = Math.round(weeklyStdDev * weeklyStdDev * 0.85);

          planningData.push({
            id: `AGG${String(idCounter++).padStart(4, '0')}`,
            dc_location: dc,
            product_sku: product,
            iso_week: isoWeek,
            date: currentDate,
            retail_fcst: retailFcst,
            amazon_fcst: amazonFcst,
            wholesale_fcst: wholesaleFcst,
            d2c_fcst: d2cFcst,
            total_forecast: dailyForecastDC,
            weekly_mean: weeklyMean,
            weekly_std_dev: weeklyStdDev,
            corr_adj_variance: correlationAdjustedVar,
            channel_mix_retail: ((retailFcst / dailyForecastDC) * 100).toFixed(1),
            channel_mix_amazon: ((amazonFcst / dailyForecastDC) * 100).toFixed(1),
            status: dailyForecastDC > 900 ? 'High Demand' : dailyForecastDC > 700 ? 'Normal' : 'Low Demand',
          });
        });
      });

      setData(planningData);

      // Calculate metrics
      const totalRetail = planningData.reduce((sum, row) => sum + row.retail_fcst, 0);
      const totalAmazon = planningData.reduce((sum, row) => sum + row.amazon_fcst, 0);
      const totalWholesale = planningData.reduce((sum, row) => sum + row.wholesale_fcst, 0);
      const totalD2C = planningData.reduce((sum, row) => sum + row.d2c_fcst, 0);
      const totalForecast = totalRetail + totalAmazon + totalWholesale + totalD2C;

      setMetrics({
        totalRecords: planningData.length,
        totalRetail,
        totalAmazon,
        totalWholesale,
        totalD2C,
        totalForecast,
        avgWeeklyMean: Math.round(planningData.reduce((sum, row) => sum + row.weekly_mean, 0) / planningData.length),
      });

      setLoading(false);
    }, 800);
  };

  // UI5 AnalyticalTable columns configuration
  const columns = useMemo(() => [
    {
      Header: 'ID',
      accessor: 'id',
      width: 120,
    },
    {
      Header: 'DC Location',
      accessor: 'dc_location',
      width: 150,
    },
    {
      Header: 'Product SKU',
      accessor: 'product_sku',
      width: 150,
    },
    {
      Header: 'ISO Week',
      accessor: 'iso_week',
      width: 120,
    },
    {
      Header: 'Retail',
      accessor: 'retail_fcst',
      width: 110,
      Cell: ({ value }) => <span>{value?.toLocaleString()}</span>,
    },
    {
      Header: 'Amazon',
      accessor: 'amazon_fcst',
      width: 110,
      Cell: ({ value }) => <span>{value?.toLocaleString()}</span>,
    },
    {
      Header: 'Wholesale',
      accessor: 'wholesale_fcst',
      width: 120,
      Cell: ({ value }) => <span>{value?.toLocaleString()}</span>,
    },
    {
      Header: 'D2C',
      accessor: 'd2c_fcst',
      width: 100,
      Cell: ({ value }) => <span>{value?.toLocaleString()}</span>,
    },
    {
      Header: 'Total Forecast',
      accessor: 'total_forecast',
      width: 140,
      Cell: ({ value }) => <strong>{value?.toLocaleString()}</strong>,
    },
    {
      Header: 'Weekly μ',
      accessor: 'weekly_mean',
      width: 120,
      Cell: ({ value }) => <span>{value?.toLocaleString()}</span>,
    },
    {
      Header: 'Weekly σ',
      accessor: 'weekly_std_dev',
      width: 120,
      Cell: ({ value }) => <span>{value?.toLocaleString()}</span>,
    },
    {
      Header: 'Corr Adj Var',
      accessor: 'corr_adj_variance',
      width: 130,
      Cell: ({ value }) => <span>{value?.toLocaleString()}</span>,
    },
    {
      Header: 'Status',
      accessor: 'status',
      width: 140,
      Cell: ({ value }) => (
        <Chip
          label={value}
          size="small"
          color={value === 'High Demand' ? 'error' : value === 'Normal' ? 'success' : 'default'}
          sx={{ fontSize: '0.75rem' }}
        />
      ),
    },
  ], []);

  // Calculate selection summary
  const selectionSummary = useMemo(() => {
    if (selectedRows.length === 0) return null;

    const selectedData = data.filter(row => selectedRows.includes(row.id));

    return {
      count: selectedData.length,
      sumRetail: selectedData.reduce((sum, row) => sum + row.retail_fcst, 0),
      sumAmazon: selectedData.reduce((sum, row) => sum + row.amazon_fcst, 0),
      sumWholesale: selectedData.reduce((sum, row) => sum + row.wholesale_fcst, 0),
      sumD2C: selectedData.reduce((sum, row) => sum + row.d2c_fcst, 0),
      sumTotal: selectedData.reduce((sum, row) => sum + row.total_forecast, 0),
      avgWeeklyMean: Math.round(selectedData.reduce((sum, row) => sum + row.weekly_mean, 0) / selectedData.length),
    };
  }, [selectedRows, data]);

  const handleRowSelection = (event) => {
    const selected = event.detail.selectedRows || [];
    setSelectedRows(selected.map(row => row.id));
  };

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>DC System</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Planning Table (UI5)</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <ViewModule sx={{ fontSize: 32, color: '#059669' }} />
              <Typography variant="h4" fontWeight={700}>DC Planning Table</Typography>
              <Chip label="UI5 Web Components" size="small" color="success" />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Excel-like planning table with grouping, aggregation, and inline editing using UI5 Web Components
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh"><IconButton onClick={fetchData} color="primary"><Refresh /></IconButton></Tooltip>
            <Tooltip title="Export"><IconButton color="primary"><Download /></IconButton></Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Metrics Cards */}
      {metrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#059669', 0.1)} 0%, ${alpha('#059669', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Functions sx={{ color: '#059669' }} />
                  <Typography variant="body2" color="text.secondary">Total Records</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#059669">{metrics.totalRecords}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#3b82f6', 0.1)} 0%, ${alpha('#3b82f6', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Retail</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color="#3b82f6">{metrics.totalRetail.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Amazon</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color="#f59e0b">{metrics.totalAmazon.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#8b5cf6', 0.1)} 0%, ${alpha('#8b5cf6', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Wholesale</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color="#8b5cf6">{metrics.totalWholesale.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">D2C</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color="#10b981">{metrics.totalD2C.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Selection Summary */}
      {selectionSummary && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: alpha('#059669', 0.05), border: '1px solid', borderColor: alpha('#059669', 0.2) }}>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Box>
              <Typography variant="caption" color="text.secondary">Selected Rows</Typography>
              <Typography variant="h6" fontWeight={700} color="#059669">{selectionSummary.count}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Total Retail</Typography>
              <Typography variant="body1" fontWeight={600}>{selectionSummary.sumRetail.toLocaleString()}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Total Amazon</Typography>
              <Typography variant="body1" fontWeight={600}>{selectionSummary.sumAmazon.toLocaleString()}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Total Wholesale</Typography>
              <Typography variant="body1" fontWeight={600}>{selectionSummary.sumWholesale.toLocaleString()}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Total D2C</Typography>
              <Typography variant="body1" fontWeight={600}>{selectionSummary.sumD2C.toLocaleString()}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Total Forecast</Typography>
              <Typography variant="h6" fontWeight={700} color="#059669">{selectionSummary.sumTotal.toLocaleString()}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Avg Weekly μ</Typography>
              <Typography variant="body1" fontWeight={600}>{selectionSummary.avgWeeklyMean.toLocaleString()}</Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* UI5 AnalyticalTable */}
      <Paper
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          p: 2,
          '& .ui5-table-wrapper': {
            height: '100%',
          },
          '& [ui5-table]': {
            '--sapList_HeaderBackground': '#fafafa',
            '--sapList_HeaderBorderColor': '#d9d9d9',
            '--sapList_HeaderTextColor': '#0a0a0a',
            '--sapList_BorderColor': '#e5e5e5',
            '--sapList_Background': '#ffffff',
            '--sapList_AlternatingBackground': '#fafafa',
            '--sapList_Hover_Background': '#f5f5f5',
            '--sapList_SelectionBackgroundColor': '#e3f2fd',
            '--sapContent_ForegroundColor': '#0a0a0a',
            fontFamily: '"72", "72full", Arial, Helvetica, sans-serif',
          },
          '& .ui5-analytical-table': {
            height: '100%',
          },
          '& table': {
            borderCollapse: 'separate !important',
            borderSpacing: '0 !important',
          },
          '& thead': {
            display: 'table-header-group !important',
          },
          '& thead tr': {
            backgroundColor: '#f8fafc !important',
            height: '48px !important',
            display: 'table-row !important',
          },
          '& thead th': {
            fontWeight: 'bold !important',
            fontFamily: '"72", "72full", Arial, Helvetica, sans-serif !important',
            fontSize: '0.875rem !important',
            color: '#0a0a0a !important',
            padding: '14px 16px !important',
            backgroundColor: '#fafafa !important',
            borderBottom: '1px solid #d9d9d9 !important',
            verticalAlign: 'middle !important',
            lineHeight: '1.2 !important',
            whiteSpace: 'nowrap !important',
            boxSizing: 'border-box !important',
            textTransform: 'none !important',
            letterSpacing: '0.01em !important',
          },
          '& thead th > *': {
            fontWeight: 'bold !important',
          },
          '& thead th span': {
            fontWeight: 'bold !important',
          },
          '& tbody': {
            display: 'table-row-group !important',
          },
          '& tbody tr': {
            height: '40px !important',
            display: 'table-row !important',
          },
          '& tbody tr:first-of-type td': {
            paddingTop: '8px !important',
          },
          '& tbody td': {
            fontSize: '0.875rem !important',
            padding: '8px 16px !important',
            borderBottom: '1px solid #e5e5e5 !important',
            verticalAlign: 'middle !important',
            lineHeight: '1.5 !important',
            boxSizing: 'border-box !important',
            color: '#32363a !important',
          },
          '& tbody tr:hover': {
            backgroundColor: '#f5f5f5 !important',
          },
          '& tbody tr:nth-of-type(odd)': {
            backgroundColor: '#ffffff !important',
          },
          '& tbody tr:nth-of-type(even)': {
            backgroundColor: '#fafafa !important',
          },
          '& tbody tr.is-selected': {
            backgroundColor: '#e3f2fd !important',
          }
        }}
      >
        <AnalyticalTable
          columns={columns}
          data={data}
          groupable
          sortable
          filterable
          visibleRows={15}
          selectionMode="MultiToggle"
          onRowSelect={handleRowSelection}
          loading={loading}
          minRows={5}
          reactTableOptions={{
            autoResetSelectedRows: false,
          }}
          scaleWidthMode="Smart"
          visibleRowCountMode="Fixed"
          rowHeight={40}
          headerRowHeight={48}
        />
      </Paper>
    </Box>
  );
};

export default DCPlanningTable;
