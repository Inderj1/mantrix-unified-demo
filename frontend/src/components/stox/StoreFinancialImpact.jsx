import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Chip, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha, Select, MenuItem,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Analytics, Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Download, AttachMoney, TrendingUp, CheckCircle,
} from '@mui/icons-material';
import stoxTheme from './stoxTheme';

const StoreFinancialImpact = ({ onBack }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      // 12 Stores with inventory data
      const stores = [
        { id: 'Store-Chicago-001', name: 'Chicago Magnificent Mile', region: 'DC-East' },
        { id: 'Store-NYC-015', name: 'NYC Fifth Avenue', region: 'DC-East' },
        { id: 'Store-Boston-022', name: 'Boston Newbury St', region: 'DC-East' },
        { id: 'Store-Philly-018', name: 'Philadelphia Rittenhouse', region: 'DC-East' },
        { id: 'Store-DC-Metro-012', name: 'DC Georgetown', region: 'DC-East' },
        { id: 'Store-Baltimore-009', name: 'Baltimore Harbor', region: 'DC-East' },
        { id: 'Store-Dallas-019', name: 'Dallas Galleria', region: 'DC-Midwest' },
        { id: 'Store-Miami-008', name: 'Miami Design District', region: 'DC-Midwest' },
        { id: 'Store-Minneapolis-031', name: 'Minneapolis Mall', region: 'DC-Midwest' },
        { id: 'Store-Detroit-025', name: 'Detroit Somerset', region: 'DC-Midwest' },
        { id: 'Store-STL-014', name: 'St Louis Plaza', region: 'DC-Midwest' },
        { id: 'Store-KC-027', name: 'Kansas City Plaza', region: 'DC-Midwest' },
      ];

      // 3 Products with pricing
      const products = [
        { sku: 'MR_HAIR_101', name: 'Premium Hair Color Kit', family: 'Hair Care', unitPrice: 25.00, unitCost: 10.00, margin: 15.00 },
        { sku: 'MR_HAIR_201', name: 'Root Touch-Up Spray', family: 'Hair Care', unitPrice: 22.00, unitCost: 9.00, margin: 13.00 },
        { sku: 'MR_CARE_301', name: 'Intensive Hair Mask', family: 'Hair Treatment', unitPrice: 28.00, unitCost: 11.00, margin: 17.00 },
      ];

      const financialData = [];
      let idCounter = 1;

      stores.forEach((store) => {
        products.forEach((product) => {
          // Simulate inventory positions (from Tile 2 data)
          const targetLevel = 100 + Math.round(Math.random() * 100); // 100-200 units
          const currentInventoryPosition = Math.round(targetLevel * (0.5 + Math.random() * 0.7)); // 50-120% of target

          // 1. Recommended Supply Order Qty = Target − InventoryPosition
          const recommendedSupplyOrderQty = Math.max(0, targetLevel - currentInventoryPosition);

          // Calculate if this order makes financial sense
          const avgDailyDemand = Math.round(5 + Math.random() * 15); // 5-20 units/day
          const stockoutDays = recommendedSupplyOrderQty > 0 ? Math.round(Math.random() * 5) : 0; // Days we'd be out of stock without order

          // 2. Avoided Lost Margin ($) = LostSales × UnitMargin
          const lostSales = stockoutDays * avgDailyDemand;
          const avoidedLostMargin = lostSales * product.margin;

          // 3. Added Carrying Cost ($) = (ExtraUnits × UnitCost × HoldingRate × DaysHeld/30)
          const holdingRate = 0.02; // 2% monthly holding rate
          const daysHeld = 30; // Hold for 1 month on average
          const addedCarryingCost = recommendedSupplyOrderQty * product.unitCost * holdingRate * (daysHeld / 30);

          // 4. Freight Cost ($) = Qty × FreightRate
          const freightRatePerUnit = 0.50; // $0.50 per unit shipping
          const freightCost = recommendedSupplyOrderQty * freightRatePerUnit;

          // 5. Cash Impact (ΔWC $) = ΔInventory × UnitCost
          const cashImpact = recommendedSupplyOrderQty * product.unitCost;

          // 6. Net Value (ΔValue $) = AvoidedMargin − (Carrying + Freight)
          // Note: We don't subtract cashImpact from net value as it's working capital, not a cost
          const netValue = avoidedLostMargin - (addedCarryingCost + freightCost);

          // 7. GMROI = GrossMargin / AvgInventoryCost
          const grossMarginFromOrder = recommendedSupplyOrderQty * product.margin * 0.8; // Assume 80% sell-through
          const avgInventoryCost = cashImpact / 2; // Average inventory = half the order
          const gmroi = avgInventoryCost > 0 ? (grossMarginFromOrder / avgInventoryCost) : 0;

          // 8. Decision - Auto-calculate recommendation
          let decision, decisionColor;
          if (netValue > 500 && gmroi > 1.5) {
            decision = 'Approve';
            decisionColor = 'success';
          } else if (netValue > 0 && gmroi > 1.0) {
            decision = 'Resize';
            decisionColor = 'warning';
          } else if (netValue < 0 || gmroi < 0.8) {
            decision = 'Delay';
            decisionColor = 'error';
          } else {
            decision = 'Review';
            decisionColor = 'default';
          }

          financialData.push({
            id: `FI${String(idCounter++).padStart(4, '0')}`,
            store_id: store.id,
            store_name: store.name,
            product_sku: product.sku,
            product_name: product.name,
            product_family: product.family,
            recommended_supply_order_qty: recommendedSupplyOrderQty,
            avoided_lost_margin: avoidedLostMargin,
            added_carrying_cost: addedCarryingCost,
            freight_cost: freightCost,
            cash_impact: cashImpact,
            net_value: netValue,
            gmroi: gmroi,
            decision: decision,
            decisionColor: decisionColor,
            // Additional context
            current_position: currentInventoryPosition,
            target_level: targetLevel,
            stockout_days: stockoutDays,
          });
        });
      });

      setData(financialData);

      // Calculate metrics
      const approvedCount = financialData.filter(d => d.decision === 'Approve').length;
      const totalNetValue = financialData.reduce((sum, row) => sum + row.net_value, 0);
      const totalAvoidedMargin = financialData.reduce((sum, row) => sum + row.avoided_lost_margin, 0);
      const avgGMROI = financialData.length > 0
        ? (financialData.reduce((sum, row) => sum + row.gmroi, 0) / financialData.length)
        : 0;

      setMetrics({
        totalOrders: financialData.length,
        approvedCount,
        totalNetValue: totalNetValue,
        totalAvoidedMargin: totalAvoidedMargin,
        avgGMROI: avgGMROI.toFixed(2),
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
    { field: 'product_family', headerName: 'Family', minWidth: 130, flex: 1, align: 'center', headerAlign: 'center' },
    {
      field: 'recommended_supply_order_qty',
      headerName: 'Recommended Qty',
      minWidth: 160,
      flex: 1.2,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value?.toLocaleString()}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#106ebe', 0.12),
            color: '#106ebe',
          }}
        />
      ),
    },
    {
      field: 'avoided_lost_margin',
      headerName: 'Avoided Lost Margin ($)',
      minWidth: 180,
      flex: 1.4,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`$${params.value?.toLocaleString()}`}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#10b981', 0.12),
            color: '#059669',
          }}
        />
      ),
    },
    {
      field: 'added_carrying_cost',
      headerName: 'Carrying Cost ($)',
      minWidth: 150,
      flex: 1.2,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `$${params.value?.toFixed(2)}`,
    },
    {
      field: 'freight_cost',
      headerName: 'Freight Cost ($)',
      minWidth: 140,
      flex: 1.1,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => `$${params.value?.toFixed(2)}`,
    },
    {
      field: 'cash_impact',
      headerName: 'Cash Impact (ΔWC $)',
      minWidth: 170,
      flex: 1.3,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`$${params.value?.toLocaleString()}`}
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
      field: 'net_value',
      headerName: 'Net Value (ΔValue $)',
      minWidth: 170,
      flex: 1.3,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={`$${params.value?.toLocaleString()}`}
          size="small"
          color={params.value > 500 ? 'success' : params.value > 0 ? 'warning' : 'error'}
          sx={{ fontWeight: 700 }}
        />
      ),
    },
    {
      field: 'gmroi',
      headerName: 'GMROI',
      minWidth: 110,
      flex: 0.9,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value?.toFixed(2)}
          size="small"
          color={params.value > 1.5 ? 'success' : params.value > 1.0 ? 'warning' : 'error'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'decision',
      headerName: 'Decision',
      minWidth: 140,
      flex: 1.1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const row = params.row;
        return (
          <Chip
            label={params.value}
            size="small"
            color={row.decisionColor}
            icon={params.value === 'Approve' ? <CheckCircle /> : undefined}
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
  ];

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>CORE.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>Store System</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Tile 3: Financial Impact</Typography>
          </Breadcrumbs>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <Analytics sx={{ fontSize: 32, color: '#0078d4' }} />
              <Typography variant="h4" fontWeight={700}>Tile 3: Financial Impact & Recommendation Engine</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Quantify financial value of replenishment actions with GMROI, avoided margin, and net value calculations
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
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#0078d4', 0.1)} 0%, ${alpha('#0078d4', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Analytics sx={{ color: '#0078d4' }} />
                  <Typography variant="body2" color="text.secondary">Total Orders</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#0078d4">{metrics.totalOrders}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <CheckCircle sx={{ color: '#10b981' }} />
                  <Typography variant="body2" color="text.secondary">Approved</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#10b981">{metrics.approvedCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#106ebe', 0.1)} 0%, ${alpha('#106ebe', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <AttachMoney sx={{ color: '#106ebe' }} />
                  <Typography variant="body2" color="text.secondary">Total Net Value</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#106ebe">${metrics.totalNetValue.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: `linear-gradient(135deg, ${alpha('#f59e0b', 0.1)} 0%, ${alpha('#f59e0b', 0.05)} 100%)` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <TrendingUp sx={{ color: '#f59e0b' }} />
                  <Typography variant="body2" color="text.secondary">Avg GMROI</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="#f59e0b">{metrics.avgGMROI}</Typography>
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

export default StoreFinancialImpact;
