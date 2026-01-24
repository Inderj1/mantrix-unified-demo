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
import DataSourceChip from './DataSourceChip';
import { getTileDataConfig } from './stoxDataConfig';

const StoreHealthMonitor = ({ onBack, darkMode = false }) => {
  const getColors = (darkMode) => ({
    primary: darkMode ? '#4da6ff' : '#0a6ed1',
    text: darkMode ? '#e6edf3' : '#1e293b',
    textSecondary: darkMode ? '#8b949e' : '#64748b',
    background: darkMode ? '#0d1117' : '#f8fbfd',
    paper: darkMode ? '#161b22' : '#ffffff',
    cardBg: darkMode ? '#21262d' : '#ffffff',
    border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  });

  const colors = getColors(darkMode);
  const tileConfig = getTileDataConfig('store-health-monitor');
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = () => {
    setLoading(true);

    setTimeout(() => {
      // Multiple SKUs with store-level health data
      const stores = [
        { id: 'Store-Chicago-001', name: 'Chicago Magnificent Mile', baseData: { 'MR_HAIR_101': { demand: 20, current: 130, target: 162, safety: 22 }, 'MR_HAIR_201': { demand: 13, current: 85, target: 105, safety: 14 }, 'MR_CARE_301': { demand: 9, current: 60, target: 75, safety: 10 } } },
        { id: 'Store-NYC-015', name: 'NYC Fifth Avenue', baseData: { 'MR_HAIR_101': { demand: 27, current: 180, target: 190, safety: 28 }, 'MR_HAIR_201': { demand: 17, current: 115, target: 125, safety: 18 }, 'MR_CARE_301': { demand: 12, current: 80, target: 90, safety: 13 } } },
        { id: 'Store-Boston-022', name: 'Boston Newbury St', baseData: { 'MR_HAIR_101': { demand: 25, current: 200, target: 180, safety: 26 }, 'MR_HAIR_201': { demand: 16, current: 130, target: 115, safety: 17 }, 'MR_CARE_301': { demand: 11, current: 90, target: 82, safety: 12 } } },
        { id: 'Store-Philly-018', name: 'Philadelphia Rittenhouse', baseData: { 'MR_HAIR_101': { demand: 22, current: 150, target: 165, safety: 24 }, 'MR_HAIR_201': { demand: 14, current: 95, target: 108, safety: 15 }, 'MR_CARE_301': { demand: 10, current: 68, target: 78, safety: 11 } } },
        { id: 'Store-DC-Metro-012', name: 'DC Georgetown', baseData: { 'MR_HAIR_101': { demand: 23, current: 140, target: 170, safety: 25 }, 'MR_HAIR_201': { demand: 15, current: 92, target: 112, safety: 16 }, 'MR_CARE_301': { demand: 10, current: 65, target: 80, safety: 11 } } },
        { id: 'Store-Baltimore-009', name: 'Baltimore Harbor', baseData: { 'MR_HAIR_101': { demand: 20, current: 120, target: 155, safety: 22 }, 'MR_HAIR_201': { demand: 13, current: 78, target: 102, safety: 14 }, 'MR_CARE_301': { demand: 9, current: 55, target: 73, safety: 10 } } },
        { id: 'Store-Dallas-019', name: 'Dallas Galleria', baseData: { 'MR_HAIR_101': { demand: 18, current: 95, target: 140, safety: 20 }, 'MR_HAIR_201': { demand: 12, current: 65, target: 92, safety: 13 }, 'MR_CARE_301': { demand: 8, current: 45, target: 66, safety: 9 } } },
        { id: 'Store-Miami-008', name: 'Miami Design District', baseData: { 'MR_HAIR_101': { demand: 22, current: 340, target: 170, safety: 25 }, 'MR_HAIR_201': { demand: 14, current: 210, target: 112, safety: 16 }, 'MR_CARE_301': { demand: 10, current: 145, target: 80, safety: 11 } } },
        { id: 'Store-Minneapolis-031', name: 'Minneapolis Mall', baseData: { 'MR_HAIR_101': { demand: 19, current: 110, target: 145, safety: 21 }, 'MR_HAIR_201': { demand: 12, current: 72, target: 95, safety: 13 }, 'MR_CARE_301': { demand: 9, current: 52, target: 68, safety: 10 } } },
        { id: 'Store-Detroit-025', name: 'Detroit Somerset', baseData: { 'MR_HAIR_101': { demand: 17, current: 100, target: 135, safety: 19 }, 'MR_HAIR_201': { demand: 11, current: 68, target: 88, safety: 12 }, 'MR_CARE_301': { demand: 8, current: 48, target: 63, safety: 9 } } },
        { id: 'Store-STL-014', name: 'St Louis Plaza', baseData: { 'MR_HAIR_101': { demand: 16, current: 90, target: 125, safety: 18 }, 'MR_HAIR_201': { demand: 10, current: 60, target: 82, safety: 11 }, 'MR_CARE_301': { demand: 7, current: 42, target: 58, safety: 8 } } },
        { id: 'Store-KC-027', name: 'Kansas City Plaza', baseData: { 'MR_HAIR_101': { demand: 15, current: 85, target: 120, safety: 17 }, 'MR_HAIR_201': { demand: 10, current: 56, target: 78, safety: 11 }, 'MR_CARE_301': { demand: 7, current: 40, target: 56, safety: 8 } } },
      ];

      const products = [
        { sku: 'MR_HAIR_101', name: 'Premium Hair Color Kit' },
        { sku: 'MR_HAIR_201', name: 'Root Touch-Up Spray' },
        { sku: 'MR_CARE_301', name: 'Intensive Hair Mask' },
      ];

      const healthData = [];
      let idCounter = 1;

      stores.forEach((store) => {
        products.forEach((product) => {
          const base = store.baseData[product.sku];
          const onHand = base.current;
          const available = onHand;
          const healthPct = Math.round((available / base.target) * 100);
          const daysOfSupply = (available / base.demand).toFixed(1);

          // NEW TILE 2 COLUMNS
          // 1. In-Transit Supply (Units) - shipments on the way
          const inTransitSupply = healthPct < 70 ? Math.round(base.target * 0.3) : Math.round(base.target * 0.1);

          // 2. Inventory Position = On-Hand + In-Transit − Committed (assume committed = 0)
          const inventoryPosition = onHand + inTransitSupply;

          // 3. Reorder Trigger Point (ROP) = Safety Stock + (AvgDailyDemand × LeadTime)
          const leadTimeDays = 7; // 1 week lead time from DC to Store
          const avgDailyDemand = base.demand; // Already daily demand
          const reorderTriggerPoint = base.safety + (avgDailyDemand * leadTimeDays);

          // 4. Stockout Risk (%) - Using normal distribution approximation
          // Higher risk if inventory position < ROP
          let stockoutRiskPct;
          if (inventoryPosition >= reorderTriggerPoint * 1.2) {
            stockoutRiskPct = Math.round(2 + Math.random() * 3); // 2-5%
          } else if (inventoryPosition >= reorderTriggerPoint) {
            stockoutRiskPct = Math.round(8 + Math.random() * 7); // 8-15%
          } else if (inventoryPosition >= reorderTriggerPoint * 0.8) {
            stockoutRiskPct = Math.round(20 + Math.random() * 15); // 20-35%
          } else {
            stockoutRiskPct = Math.round(50 + Math.random() * 30); // 50-80%
          }

          // 5. Excess Flag = "Y" if OnHand > MaxLevel (1.5× target)
          const maxLevel = base.target * 1.5;
          const excessFlag = onHand > maxLevel ? 'Y' : 'N';

          let healthStatus, action;
          if (healthPct > 150) {
            healthStatus = '🟠 Overstock (Orange)';
            action = 'Slow down orders - too much inventory';
          } else if (healthPct >= 90) {
            healthStatus = '🟢 Healthy (Green)';
            action = 'No action needed';
          } else if (healthPct >= 70) {
            healthStatus = '🟡 Reorder Soon (Yellow)';
            action = 'Plan replenishment - inventory below 70% of target';
          } else {
            healthStatus = '🔴 Critical (Red)';
            action = 'Urgent replenishment required';
          }

          healthData.push({
            id: `HM${String(idCounter++).padStart(4, '0')}`,
            store_id: store.id,
            store_name: store.name,
            product_sku: product.sku,
            product_name: product.name,
            current_inventory: onHand,
            available_inventory: available,
            target_inventory: base.target,
            safety_stock: base.safety,
            days_of_supply: parseFloat(daysOfSupply),
            inventory_health_pct: healthPct,
            health_status: healthStatus,
            fill_rate: 0.92 + Math.random() * 0.08,
            stockout_risk: healthPct >= 80 ? 'Low Risk' : healthPct >= 60 ? 'Medium Risk' : 'High Risk',
            action: action,
            // New Tile 2 columns
            in_transit_supply: inTransitSupply,
            inventory_position: inventoryPosition,
            reorder_trigger_point: reorderTriggerPoint,
            stockout_risk_pct: stockoutRiskPct,
            excess_flag: excessFlag,
          });
        });
      });

      setHealthData(healthData);

      // Calculate metrics based on health status
      const healthyCount = healthData.filter(d => d.health_status.includes('Green')).length;
      const warningCount = healthData.filter(d => d.health_status.includes('Yellow')).length;
      const criticalCount = healthData.filter(d => d.health_status.includes('Red')).length;
      const overstockCount = healthData.filter(d => d.health_status.includes('Orange')).length;
      const avgHealthScore = (healthData.reduce((sum, row) => sum + row.inventory_health_pct, 0) / healthData.length).toFixed(1);
      const avgFillRate = ((healthData.reduce((sum, row) => sum + row.fill_rate, 0) / healthData.length) * 100).toFixed(1);

      setMetrics({
        totalRecords: healthData.length,
        healthyCount,
        warningCount,
        criticalCount,
        overstockCount,
        avgHealthScore,
        avgFillRate,
      });

      setLoading(false);
    }, 800);
  };

  const columns = [
    { field: 'id', headerName: 'ID', minWidth: 100, flex: 0.8 },
    { field: 'store_id', headerName: 'Store ID', minWidth: 140, flex: 1.1, align: 'center', headerAlign: 'center' },
    { field: 'store_name', headerName: 'Store Name', minWidth: 180, flex: 1.4 },
    { field: 'product_sku', headerName: 'SKU', minWidth: 120, flex: 0.9, align: 'center', headerAlign: 'center' },
    { field: 'product_name', headerName: 'Product', minWidth: 180, flex: 1.4 },
    {
      field: 'current_inventory',
      headerName: 'Current',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'available_inventory',
      headerName: 'Available',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'target_inventory',
      headerName: 'Target',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'safety_stock',
      headerName: 'Safety Stock',
      minWidth: 120,
      flex: 1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'days_of_supply',
      headerName: 'Days of Stock',
      minWidth: 130,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `${params.value?.toFixed(1)} days`,
    },
    {
      field: 'inventory_health_pct',
      headerName: 'Health %',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          color={params.value >= 70 ? 'success' : params.value >= 30 ? 'warning' : 'error'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'health_status',
      headerName: 'Status',
      minWidth: 160,
      flex: 1.3,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'fill_rate',
      headerName: 'Fill Rate',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `${(params.value * 100).toFixed(1)}%`,
    },
    {
      field: 'stockout_risk',
      headerName: 'Stockout Risk',
      minWidth: 180,
      flex: 1.4,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'in_transit_supply',
      headerName: 'In-Transit',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value?.toLocaleString()}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#f59e0b', 0.12),
            color: '#d97706',
          }}
        />
      ),
    },
    {
      field: 'inventory_position',
      headerName: 'Inventory Position',
      minWidth: 150,
      flex: 1.2,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => params.value?.toLocaleString(),
    },
    {
      field: 'reorder_trigger_point',
      headerName: 'ROP (Trigger)',
      minWidth: 140,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value?.toLocaleString()}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#0078d4', 0.12),
            color: '#005a9e',
          }}
        />
      ),
    },
    {
      field: 'stockout_risk_pct',
      headerName: 'Stockout Risk %',
      minWidth: 150,
      flex: 1.2,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          color={params.value < 10 ? 'success' : params.value < 30 ? 'warning' : 'error'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'excess_flag',
      headerName: 'Excess',
      minWidth: 100,
      flex: 0.8,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        params.value === 'Y' ? (
          <Chip label="Yes" size="small" color="error" sx={{ fontWeight: 600 }} />
        ) : (
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>No</Typography>
        )
      ),
    },
    {
      field: 'action',
      headerName: 'Action / Recommendation',
      minWidth: 250,
      flex: 2,
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: colors.background }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text }}>CORE.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: colors.text }}>Store System</Link>
            <Typography sx={{ color: colors.primary }} variant="body1" fontWeight={600}>Tile 2: Inventory Health</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <ShowChart sx={{ fontSize: 32, color: '#10b981' }} />
              <Typography variant="h4" fontWeight={700} sx={{ color: colors.text }}>Tile 2: Inventory Health Monitoring</Typography>
              <DataSourceChip dataType={tileConfig.dataType} />
            </Stack>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Measure inventory adequacy vs. forecast, compute safety stock, ROP, and stockout risk
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh"><IconButton onClick={fetchHealthData} color="primary"><Refresh /></IconButton></Tooltip>
            <Tooltip title="Export"><IconButton color="primary"><Download /></IconButton></Tooltip>
          </Stack>
        </Stack>
      </Box>

      {metrics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <CheckCircle sx={{ color: '#10b981' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Healthy</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">{metrics.healthyCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Warning sx={{ color: '#f59e0b' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Warning</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#f59e0b">{metrics.warningCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#ef4444', 0.1)} 0%, ${alpha('#ef4444', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Error sx={{ color: '#ef4444' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Critical</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#ef4444">{metrics.criticalCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#2b88d8', 0.1)} 0%, ${alpha('#2b88d8', 0.05)} 100%)`, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Inventory sx={{ color: '#2b88d8' }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>Avg Health</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#2b88d8">{metrics.avgHealthScore}%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, width: '100%', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
        <DataGrid
          rows={healthData}
          columns={columns}
          loading={loading}
          density="compact"
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{
            ...stoxTheme.getDataGridSx(),
            ...(darkMode && {
              '& .MuiDataGrid-root': { color: colors.text, bgcolor: colors.paper },
              '& .MuiDataGrid-cell': { borderColor: colors.border, color: colors.text },
              '& .MuiDataGrid-columnHeaders': { bgcolor: colors.cardBg, borderColor: colors.border, color: colors.text },
              '& .MuiDataGrid-columnHeaderTitle': { color: colors.text },
              '& .MuiDataGrid-row': { bgcolor: colors.paper, '&:hover': { bgcolor: alpha(colors.primary, 0.08) } },
              '& .MuiDataGrid-footerContainer': { borderColor: colors.border, bgcolor: colors.cardBg },
              '& .MuiTablePagination-root': { color: colors.text },
              '& .MuiCheckbox-root': { color: colors.textSecondary },
              '& .MuiDataGrid-toolbarContainer': { color: colors.text },
            })
          }}
        />
      </Paper>
    </Box>
  );
};

export default StoreHealthMonitor;
