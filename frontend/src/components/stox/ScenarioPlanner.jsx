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
  Slider,
  TextField,
  IconButton,
  Tooltip,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  TrendingUp,
  TrendingDown,
  CompareArrows,
  Save,
  Share,
  Download,
  Refresh,
  Add,
  ExpandMore,
  ShowChart,
  Inventory,
  AttachMoney,
  Warning,
  CheckCircle,
  LocalShipping,
  ShoppingCart,
  Assessment,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import {
  madisonReedProducts,
  madisonReedBOMs,
  suppliers as madisonReedSuppliers,
} from '../../data/madisonReedMasterData';

const ScenarioPlanner = ({ onBack }) => {
  // Scenario State
  const [scenarioName, setScenarioName] = useState('New Scenario');
  const [activeScenario, setActiveScenario] = useState('custom');
  const [savedScenarios, setSavedScenarios] = useState([]);

  // Impact Drivers
  const [posGrowth, setPosGrowth] = useState(0);
  const [promoLift, setPromoLift] = useState(0);
  const [channelShiftOnline, setChannelShiftOnline] = useState(0);
  const [channelShiftB2B, setChannelShiftB2B] = useState(0);
  const [productMixPremium, setProductMixPremium] = useState(0);
  const [seasonalFactor, setSeasonalFactor] = useState(0);

  // Filters
  const [selectedProducts, setSelectedProducts] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [timeHorizon, setTimeHorizon] = useState(30); // days

  // Calculated Results
  const [baselineMetrics, setBaselineMetrics] = useState(null);
  const [scenarioMetrics, setScenarioMetrics] = useState(null);
  const [detailedImpact, setDetailedImpact] = useState({
    skuLevel: [],
    componentLevel: [],
    procurementLevel: [],
  });

  // UI State
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    calculateScenario();
  }, [posGrowth, promoLift, channelShiftOnline, channelShiftB2B, productMixPremium, seasonalFactor, selectedProducts, selectedChannel, timeHorizon]);

  const calculateScenario = () => {
    // Baseline calculation (current state)
    const baseline = {
      totalPOS: 10000,
      totalRevenue: 650000,
      fgInventoryReq: 12000,
      componentReq: 48000,
      cashImpact: 250000,
      fillRate: 95,
      serviceLevel: 96,
      stockoutRisk: 5,
    };

    // Apply scenario adjustments
    const totalDemandMultiplier =
      (1 + posGrowth / 100) *
      (1 + promoLift / 100) *
      (1 + seasonalFactor / 100);

    const onlineShift = channelShiftOnline / 100;
    const b2bShift = channelShiftB2B / 100;
    const premiumMix = productMixPremium / 100;

    // Calculate scenario metrics
    const scenarioTotalPOS = Math.round(baseline.totalPOS * totalDemandMultiplier);
    const revenueLift = 1 + premiumMix * 0.3; // Premium products = 30% higher margin
    const scenarioRevenue = Math.round(baseline.totalRevenue * totalDemandMultiplier * revenueLift);

    const scenario = {
      totalPOS: scenarioTotalPOS,
      totalRevenue: scenarioRevenue,
      fgInventoryReq: Math.round(baseline.fgInventoryReq * totalDemandMultiplier * 1.1), // 10% safety buffer
      componentReq: Math.round(baseline.componentReq * totalDemandMultiplier * 1.1),
      cashImpact: Math.round(baseline.cashImpact * totalDemandMultiplier * 1.15),
      fillRate: Math.max(85, baseline.fillRate - Math.abs(posGrowth) * 0.2),
      serviceLevel: Math.max(85, baseline.serviceLevel - Math.abs(posGrowth) * 0.15),
      stockoutRisk: Math.min(25, baseline.stockoutRisk + Math.abs(posGrowth) * 0.3),
    };

    setBaselineMetrics(baseline);
    setScenarioMetrics(scenario);

    // Calculate detailed impacts
    calculateDetailedImpact(totalDemandMultiplier, premiumMix);
  };

  const calculateDetailedImpact = (demandMultiplier, premiumMix) => {
    // SKU-Level Impact
    const topProducts = madisonReedProducts.slice(0, 8);
    const skuImpact = topProducts.map((product, idx) => {
      const baseDemand = 1000 + (idx * 200);
      const isPremium = product.price > 30;
      const productMultiplier = isPremium ? demandMultiplier * (1 + premiumMix * 0.5) : demandMultiplier;
      const scenarioDemand = Math.round(baseDemand * productMultiplier);

      return {
        id: idx + 1,
        sku: product.sku,
        product_name: product.name,
        category: product.category,
        baseline_demand: baseDemand,
        scenario_demand: scenarioDemand,
        delta: scenarioDemand - baseDemand,
        delta_pct: (((scenarioDemand - baseDemand) / baseDemand) * 100).toFixed(1),
        inventory_req: Math.round(scenarioDemand * 1.2),
        revenue_impact: Math.round((scenarioDemand - baseDemand) * product.price),
      };
    });

    // Component-Level Impact (BOM explosion)
    const componentMap = {};
    topProducts.slice(0, 5).forEach(product => {
      const bomComponents = madisonReedBOMs[product.sku];
      if (bomComponents && Array.isArray(bomComponents)) {
        bomComponents.forEach(comp => {
          const key = comp.component_id;
          if (!componentMap[key]) {
            componentMap[key] = {
              component_id: comp.component_id,
              component_name: comp.description,
              baseline_req: 0,
              scenario_req: 0,
            };
          }
          const skuData = skuImpact.find(s => s.sku === product.sku);
          if (skuData) {
            componentMap[key].baseline_req += skuData.baseline_demand * comp.qty;
            componentMap[key].scenario_req += skuData.scenario_demand * comp.qty;
          }
        });
      }
    });

    const componentImpact = Object.values(componentMap).map((comp, idx) => ({
      id: idx + 1,
      ...comp,
      delta: Math.round(comp.scenario_req - comp.baseline_req),
      delta_pct: (((comp.scenario_req - comp.baseline_req) / comp.baseline_req) * 100).toFixed(1),
      supplier: madisonReedSuppliers[idx % madisonReedSuppliers.length]?.name || 'TBD',
    }));

    // Procurement Impact
    const procurementImpact = componentImpact.map((comp, idx) => ({
      id: idx + 1,
      component_id: comp.component_id,
      component_name: comp.component_name,
      additional_qty: Math.max(0, comp.delta),
      pr_status: comp.delta > 0 ? 'Required' : 'No Change',
      estimated_cost: Math.round(comp.delta * (15 + Math.random() * 10)),
      lead_time: 14 + Math.floor(Math.random() * 14),
      supplier: comp.supplier,
    }));

    setDetailedImpact({
      skuLevel: skuImpact,
      componentLevel: componentImpact,
      procurementLevel: procurementImpact,
    });
  };

  const resetScenario = () => {
    setPosGrowth(0);
    setPromoLift(0);
    setChannelShiftOnline(0);
    setChannelShiftB2B(0);
    setProductMixPremium(0);
    setSeasonalFactor(0);
    setScenarioName('New Scenario');
  };

  const loadPresetScenario = (preset) => {
    setActiveScenario(preset);
    switch (preset) {
      case 'best-case':
        setScenarioName('Best Case - Holiday Peak');
        setPosGrowth(50);
        setPromoLift(30);
        setChannelShiftOnline(25);
        setProductMixPremium(40);
        setSeasonalFactor(20);
        break;
      case 'likely':
        setScenarioName('Likely - Baseline Growth');
        setPosGrowth(10);
        setPromoLift(5);
        setChannelShiftOnline(10);
        setProductMixPremium(0);
        setSeasonalFactor(0);
        break;
      case 'worst-case':
        setScenarioName('Worst Case - Market Downturn');
        setPosGrowth(-20);
        setPromoLift(-10);
        setChannelShiftOnline(-5);
        setProductMixPremium(-15);
        setSeasonalFactor(-10);
        break;
      default:
        resetScenario();
    }
  };

  const handleSaveScenario = () => {
    const scenario = {
      name: scenarioName,
      timestamp: new Date().toISOString(),
      drivers: { posGrowth, promoLift, channelShiftOnline, channelShiftB2B, productMixPremium, seasonalFactor },
      metrics: scenarioMetrics,
    };
    setSavedScenarios([...savedScenarios, scenario]);
    setSaveDialogOpen(false);
  };

  const calculateDelta = (scenario, baseline, field) => {
    if (!scenario || !baseline) return { value: 0, pct: 0, color: 'grey' };
    const delta = scenario[field] - baseline[field];
    const pct = ((delta / baseline[field]) * 100).toFixed(1);
    const color = delta > 0 ? (field === 'stockoutRisk' ? 'error' : 'success') :
                  delta < 0 ? (field === 'stockoutRisk' ? 'success' : 'error') : 'grey';
    return { value: delta, pct, color };
  };

  const skuColumns = [
    { field: 'sku', headerName: 'SKU', width: 120 },
    { field: 'product_name', headerName: 'Product', flex: 1, minWidth: 200 },
    { field: 'baseline_demand', headerName: 'Baseline', width: 110, type: 'number' },
    { field: 'scenario_demand', headerName: 'Scenario', width: 110, type: 'number' },
    {
      field: 'delta_pct',
      headerName: 'Change %',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          color={parseFloat(params.value) > 0 ? 'success' : parseFloat(params.value) < 0 ? 'error' : 'default'}
        />
      )
    },
    { field: 'inventory_req', headerName: 'Inventory Req', width: 130, type: 'number' },
    {
      field: 'revenue_impact',
      headerName: 'Revenue Δ',
      width: 130,
      valueFormatter: (params) => `$${params.value?.toLocaleString() || 0}`,
    },
  ];

  const componentColumns = [
    { field: 'component_id', headerName: 'Component ID', width: 130 },
    { field: 'component_name', headerName: 'Component', flex: 1, minWidth: 200 },
    { field: 'baseline_req', headerName: 'Baseline', width: 110, type: 'number', valueFormatter: (params) => Math.round(params.value) },
    { field: 'scenario_req', headerName: 'Scenario', width: 110, type: 'number', valueFormatter: (params) => Math.round(params.value) },
    {
      field: 'delta_pct',
      headerName: 'Change %',
      width: 110,
      renderCell: (params) => (
        <Chip
          label={`${params.value}%`}
          size="small"
          color={parseFloat(params.value) > 0 ? 'warning' : 'default'}
        />
      )
    },
    { field: 'supplier', headerName: 'Supplier', width: 150 },
  ];

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
          <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>
            STOX.AI
          </Link>
          <Typography color="primary" variant="body1" fontWeight={600}>
            What-If Scenario Planner
          </Typography>
        </Breadcrumbs>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.5px', mb: 0.5 }}>
              What-If Scenario Planner
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Model demand scenarios and analyze end-to-end supply chain impact
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button startIcon={<Save />} variant="outlined" size="small" onClick={() => setSaveDialogOpen(true)}>
              Save
            </Button>
            <Button startIcon={<Download />} variant="outlined" size="small">
              Export
            </Button>
            <Button startIcon={<Refresh />} variant="outlined" size="small" onClick={resetScenario}>
              Reset
            </Button>
            <Button startIcon={<ArrowBackIcon />} variant="contained" size="small" onClick={onBack}>
              Back
            </Button>
          </Stack>
        </Stack>

        {/* Preset Scenarios */}
        <ToggleButtonGroup
          value={activeScenario}
          exclusive
          onChange={(e, val) => val && loadPresetScenario(val)}
          size="small"
          sx={{ mb: 2 }}
        >
          <ToggleButton value="custom">Custom</ToggleButton>
          <ToggleButton value="best-case">Best Case</ToggleButton>
          <ToggleButton value="likely">Likely</ToggleButton>
          <ToggleButton value="worst-case">Worst Case</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Scenario Name */}
      <TextField
        label="Scenario Name"
        value={scenarioName}
        onChange={(e) => setScenarioName(e.target.value)}
        size="small"
        disabled={activeScenario !== 'custom'}
        sx={{ mb: 3, maxWidth: 400 }}
      />

      {/* Impact Drivers */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          Impact Drivers
        </Typography>

        <Grid container spacing={3} sx={{ '& .MuiSlider-markLabel': { fontSize: '0.75rem' } }}>
          {/* POS Growth */}
          <Grid item xs={12} md={6}>
            <Box sx={{ pb: 5 }}>
              <Typography variant="body2" fontWeight={500} sx={{ mb: 2 }}>
                Overall POS Growth: {posGrowth > 0 ? '+' : ''}{posGrowth}%
              </Typography>
              <Box sx={{ px: 2, pt: 1 }}>
                <Slider
                  value={posGrowth}
                  onChange={(e, val) => setPosGrowth(val)}
                  min={-50}
                  max={100}
                  step={5}
                  valueLabelDisplay="on"
                  valueLabelFormat={(value) => `${value > 0 ? '+' : ''}${value}%`}
                  sx={{ mb: 2 }}
                />
              </Box>
            </Box>
          </Grid>

          {/* Promo Lift */}
          <Grid item xs={12} md={6}>
            <Box sx={{ pb: 5 }}>
              <Typography variant="body2" fontWeight={500} sx={{ mb: 2 }}>
                Promotional Lift: {promoLift > 0 ? '+' : ''}{promoLift}%
              </Typography>
              <Box sx={{ px: 2, pt: 1 }}>
                <Slider
                  value={promoLift}
                  onChange={(e, val) => setPromoLift(val)}
                  min={-20}
                  max={50}
                  step={5}
                  valueLabelDisplay="on"
                  valueLabelFormat={(value) => `${value > 0 ? '+' : ''}${value}%`}
                  sx={{ mb: 2 }}
                />
              </Box>
            </Box>
          </Grid>

          {/* Online Channel Shift */}
          <Grid item xs={12} md={6}>
            <Box sx={{ pb: 5 }}>
              <Typography variant="body2" fontWeight={500} sx={{ mb: 2 }}>
                Online Channel Shift: {channelShiftOnline > 0 ? '+' : ''}{channelShiftOnline}%
              </Typography>
              <Box sx={{ px: 2, pt: 1 }}>
                <Slider
                  value={channelShiftOnline}
                  onChange={(e, val) => setChannelShiftOnline(val)}
                  min={-30}
                  max={50}
                  step={5}
                  valueLabelDisplay="on"
                  valueLabelFormat={(value) => `${value > 0 ? '+' : ''}${value}%`}
                  sx={{ mb: 2 }}
                />
              </Box>
            </Box>
          </Grid>

          {/* Premium Product Mix */}
          <Grid item xs={12} md={6}>
            <Box sx={{ pb: 5 }}>
              <Typography variant="body2" fontWeight={500} sx={{ mb: 2 }}>
                Premium Product Mix: {productMixPremium > 0 ? '+' : ''}{productMixPremium}%
              </Typography>
              <Box sx={{ px: 2, pt: 1 }}>
                <Slider
                  value={productMixPremium}
                  onChange={(e, val) => setProductMixPremium(val)}
                  min={-30}
                  max={60}
                  step={5}
                  valueLabelDisplay="on"
                  valueLabelFormat={(value) => `${value > 0 ? '+' : ''}${value}%`}
                  sx={{ mb: 2 }}
                />
              </Box>
            </Box>
          </Grid>

          {/* Seasonal Factor */}
          <Grid item xs={12} md={6}>
            <Box sx={{ pb: 5 }}>
              <Typography variant="body2" fontWeight={500} sx={{ mb: 2 }}>
                Seasonal Factor: {seasonalFactor > 0 ? '+' : ''}{seasonalFactor}%
              </Typography>
              <Box sx={{ px: 2, pt: 1 }}>
                <Slider
                  value={seasonalFactor}
                  onChange={(e, val) => setSeasonalFactor(val)}
                  min={-25}
                  max={40}
                  step={5}
                  valueLabelDisplay="on"
                  valueLabelFormat={(value) => `${value > 0 ? '+' : ''}${value}%`}
                  sx={{ mb: 2 }}
                />
              </Box>
            </Box>
          </Grid>

          {/* Time Horizon */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Time Horizon</InputLabel>
              <Select value={timeHorizon} onChange={(e) => setTimeHorizon(e.target.value)}>
                <MenuItem value={7}>1 Week</MenuItem>
                <MenuItem value={30}>1 Month</MenuItem>
                <MenuItem value={90}>1 Quarter</MenuItem>
                <MenuItem value={180}>6 Months</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Scenario Comparison */}
      {baselineMetrics && scenarioMetrics && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            Scenario Impact (vs Baseline)
          </Typography>

          <Grid container spacing={2}>
            {/* Total POS */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderLeft: '4px solid #2196f3' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="caption" color="text.secondary">Total POS Units</Typography>
                      <Typography variant="h5" fontWeight={700}>{scenarioMetrics.totalPOS.toLocaleString()}</Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                        {calculateDelta(scenarioMetrics, baselineMetrics, 'totalPOS').value > 0 ? <TrendingUp fontSize="small" color="success" /> : <TrendingDown fontSize="small" color="error" />}
                        <Typography variant="caption" color={calculateDelta(scenarioMetrics, baselineMetrics, 'totalPOS').color}>
                          {calculateDelta(scenarioMetrics, baselineMetrics, 'totalPOS').pct}% vs baseline
                        </Typography>
                      </Stack>
                    </Box>
                    <ShoppingCart color="primary" />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Revenue */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderLeft: '4px solid #4caf50' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
                      <Typography variant="h5" fontWeight={700}>${(scenarioMetrics.totalRevenue / 1000).toFixed(0)}K</Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                        {calculateDelta(scenarioMetrics, baselineMetrics, 'totalRevenue').value > 0 ? <TrendingUp fontSize="small" color="success" /> : <TrendingDown fontSize="small" color="error" />}
                        <Typography variant="caption" color={calculateDelta(scenarioMetrics, baselineMetrics, 'totalRevenue').color}>
                          {calculateDelta(scenarioMetrics, baselineMetrics, 'totalRevenue').pct}% vs baseline
                        </Typography>
                      </Stack>
                    </Box>
                    <AttachMoney color="success" />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Inventory Requirement */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderLeft: '4px solid #ff9800' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="caption" color="text.secondary">Component Req</Typography>
                      <Typography variant="h5" fontWeight={700}>{scenarioMetrics.componentReq.toLocaleString()}</Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                        {calculateDelta(scenarioMetrics, baselineMetrics, 'componentReq').value > 0 ? <TrendingUp fontSize="small" color="warning" /> : <TrendingDown fontSize="small" />}
                        <Typography variant="caption" color="warning.main">
                          {calculateDelta(scenarioMetrics, baselineMetrics, 'componentReq').pct}% vs baseline
                        </Typography>
                      </Stack>
                    </Box>
                    <Inventory sx={{ color: '#ff9800' }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Cash Impact */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderLeft: '4px solid #9c27b0' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="caption" color="text.secondary">Cash Investment</Typography>
                      <Typography variant="h5" fontWeight={700}>${(scenarioMetrics.cashImpact / 1000).toFixed(0)}K</Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          +${((scenarioMetrics.cashImpact - baselineMetrics.cashImpact) / 1000).toFixed(0)}K additional
                        </Typography>
                      </Stack>
                    </Box>
                    <LocalShipping sx={{ color: '#9c27b0' }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Comparison Table */}
          <TableContainer sx={{ mt: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Metric</strong></TableCell>
                  <TableCell align="right"><strong>Baseline</strong></TableCell>
                  <TableCell align="right"><strong>Scenario</strong></TableCell>
                  <TableCell align="right"><strong>Delta</strong></TableCell>
                  <TableCell align="right"><strong>Change %</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Fill Rate (%)</TableCell>
                  <TableCell align="right">{baselineMetrics.fillRate}%</TableCell>
                  <TableCell align="right">{scenarioMetrics.fillRate.toFixed(1)}%</TableCell>
                  <TableCell align="right">{(scenarioMetrics.fillRate - baselineMetrics.fillRate).toFixed(1)}%</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${calculateDelta(scenarioMetrics, baselineMetrics, 'fillRate').pct}%`}
                      size="small"
                      color={calculateDelta(scenarioMetrics, baselineMetrics, 'fillRate').value >= 0 ? 'success' : 'error'}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Service Level (%)</TableCell>
                  <TableCell align="right">{baselineMetrics.serviceLevel}%</TableCell>
                  <TableCell align="right">{scenarioMetrics.serviceLevel.toFixed(1)}%</TableCell>
                  <TableCell align="right">{(scenarioMetrics.serviceLevel - baselineMetrics.serviceLevel).toFixed(1)}%</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${calculateDelta(scenarioMetrics, baselineMetrics, 'serviceLevel').pct}%`}
                      size="small"
                      color={calculateDelta(scenarioMetrics, baselineMetrics, 'serviceLevel').value >= 0 ? 'success' : 'error'}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Stockout Risk (%)</TableCell>
                  <TableCell align="right">{baselineMetrics.stockoutRisk}%</TableCell>
                  <TableCell align="right">{scenarioMetrics.stockoutRisk.toFixed(1)}%</TableCell>
                  <TableCell align="right">{(scenarioMetrics.stockoutRisk - baselineMetrics.stockoutRisk).toFixed(1)}%</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${calculateDelta(scenarioMetrics, baselineMetrics, 'stockoutRisk').pct}%`}
                      size="small"
                      color={calculateDelta(scenarioMetrics, baselineMetrics, 'stockoutRisk').value <= 0 ? 'success' : 'error'}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Detailed Impact Analysis */}
      <Box>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Detailed Impact Analysis
        </Typography>

        {/* SKU-Level Impact */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Assessment />
              <Typography variant="subtitle1" fontWeight={600}>SKU-Level Demand Impact</Typography>
              <Chip label={`${detailedImpact.skuLevel.length} SKUs`} size="small" />
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ height: 400 }}>
              <DataGrid
                rows={detailedImpact.skuLevel}
                columns={skuColumns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                density="compact"
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Component-Level Impact */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Inventory />
              <Typography variant="subtitle1" fontWeight={600}>Component Requirements (BOM Explosion)</Typography>
              <Chip label={`${detailedImpact.componentLevel.length} Components`} size="small" />
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="info" sx={{ mb: 2 }}>
              Components consolidated across multiple finished goods, showing total requirements per the drill-down capability.
            </Alert>
            <Box sx={{ height: 400 }}>
              <DataGrid
                rows={detailedImpact.componentLevel}
                columns={componentColumns}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                density="compact"
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Procurement Impact */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Stack direction="row" spacing={1} alignItems="center">
              <LocalShipping />
              <Typography variant="subtitle1" fontWeight={600}>Procurement Requirements (PR/PO Impact)</Typography>
              <Chip
                label={`${detailedImpact.procurementLevel.filter(p => p.pr_status === 'Required').length} New PRs`}
                size="small"
                color="warning"
              />
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Component</TableCell>
                    <TableCell align="right">Additional Qty</TableCell>
                    <TableCell>PR Status</TableCell>
                    <TableCell align="right">Est. Cost</TableCell>
                    <TableCell align="right">Lead Time (days)</TableCell>
                    <TableCell>Supplier</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailedImpact.procurementLevel.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{row.component_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.component_id}</Typography>
                      </TableCell>
                      <TableCell align="right">{row.additional_qty.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.pr_status}
                          size="small"
                          color={row.pr_status === 'Required' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">${row.estimated_cost.toLocaleString()}</TableCell>
                      <TableCell align="right">{row.lead_time}</TableCell>
                      <TableCell>{row.supplier}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Scenario</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Scenario Name"
            fullWidth
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveScenario} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScenarioPlanner;
