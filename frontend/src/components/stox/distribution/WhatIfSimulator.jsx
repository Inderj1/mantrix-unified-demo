import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Stack,
  Button,
  Breadcrumbs,
  Link,
  Slider,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  LinearProgress,
  Fade,
  Skeleton,
  TextField,
  Autocomplete,
  Alert,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  Science as ScienceIcon,
  Visibility as VisibilityIcon,
  PanTool as PanToolIcon,
  FlashOn as FlashOnIcon,
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  LocalShipping as LocalShippingIcon,
  SmartToy as SmartToyIcon,
  Star as StarIcon,
  Settings as SettingsIcon,
  ShowChart as ChartIcon,
  AttachMoney as MoneyIcon,
  Factory as FactoryIcon,
  CompareArrows as CompareIcon,
  Tune as TuneIcon,
  CloudUpload as CommitIcon,
  Info as InfoIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Balance as BalanceIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

// Import debounce hook
import { useDebounce } from '../../../hooks/useDebounce';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';

// Import centralized brand colors
import { MODULE_COLOR, getColors } from '../../../config/brandColors';
import Paper from '@mui/material/Paper';

// AI Scenario Advisor data
const aiScenarioAdvisor = {
  confidence: 94,
  recommendedScenario: 'AI Recommended',
  summary: 'AI recommends balanced approach with 94% confidence',
  rationale: 'Optimal trade-off between inventory investment ($5.7M) and service protection ($14.2M revenue saved). Net value creation of $8.5M/yr with minimal risk.',
};

// Z-score lookup for service level
const getZScore = (serviceLevel) => {
  const zScores = { 85: 1.04, 90: 1.28, 95: 1.65, 97: 1.88, 99: 2.33, 99.9: 3.09 };
  const levels = Object.keys(zScores).map(Number);
  const closest = levels.reduce((a, b) =>
    Math.abs(b - serviceLevel) < Math.abs(a - serviceLevel) ? b : a
  );
  return zScores[closest];
};

// Generate Monte Carlo projection data - NOW PARAMETER-DRIVEN
const generateMonteCarloData = (params = {}) => {
  const {
    serviceLevelTarget = 97,
    demandVariability = 82,
    leadTimeBuffer = 7,
    baseStock = 1200,
  } = params;

  const days = [];
  const demandCV = demandVariability / 100;
  const zScore = getZScore(serviceLevelTarget);

  // Calculate safety stock based on service level and variability
  const dailySigma = baseStock * demandCV * 0.15;
  const calculatedSafetyStock = Math.round(zScore * dailySigma * Math.sqrt(leadTimeBuffer + 14));

  for (let i = 1; i <= 90; i++) {
    const trend = -i * (3 * (1 - demandCV * 0.3)); // Trend affected by variability
    const cycle = Math.sin(i / 7 * Math.PI) * (150 * (1 + demandCV * 0.5));
    const replenish = Math.floor(i / 14) * (400 / (1 + demandCV * 0.3));

    const p50 = Math.max(200, baseStock + trend + cycle + replenish);

    // Spread factor based on demand variability
    const spreadFactor = 1 + demandCV * 1.5;
    const p90 = p50 + (300 * spreadFactor);
    const p10 = Math.max(0, p50 - (400 * spreadFactor));

    days.push({
      day: i,
      p90: Math.round(p90),
      p50: Math.round(p50),
      p10: Math.round(p10),
      safetyStock: calculatedSafetyStock,
    });
  }
  return days;
};

// Scenario data
const scenarios = [
  {
    id: 'current',
    name: 'Current State',
    iconType: 'assessment',
    description: 'Existing MRP parameters as-is',
    serviceLevel: 91.2,
    inventoryValue: 42.1,
    holdingCost: 9.2,
    stockoutsMonth: 312,
    revenueAtRisk: 18.4,
    netImpact: null,
    recommended: false,
  },
  {
    id: 'ai-recommended',
    name: 'AI Recommended',
    iconType: 'smartToy',
    description: 'Optimal balance of cost & service',
    serviceLevel: 94.8,
    inventoryValue: 47.8,
    holdingCost: 10.5,
    stockoutsMonth: 124,
    revenueAtRisk: 4.2,
    netImpact: 8.5,
    recommended: true,
  },
  {
    id: 'custom',
    name: 'Custom Scenario',
    iconType: 'settings',
    description: 'Adjust parameters below',
    serviceLevel: 97.0,
    inventoryValue: 52.4,
    holdingCost: 11.5,
    stockoutsMonth: 68,
    revenueAtRisk: 2.1,
    netImpact: 6.8,
    recommended: false,
    editable: true,
  },
];

const WhatIfSimulator = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const [selectedScenario, setSelectedScenario] = useState('ai-recommended');
  const [executionMode, setExecutionMode] = useState('simulate');

  // AI theme color for Tile 5 (Purple-Blue)
  const aiThemeColor = '#00357a';

  // Loading and animation states
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculated, setLastCalculated] = useState(null);
  const [chartAnimating, setChartAnimating] = useState(false);

  // Data context states (for SKU/Plant selection)
  const [selectedSKU, setSelectedSKU] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [baseStock, setBaseStock] = useState(1200);

  // CSV upload states
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isParsingFile, setIsParsingFile] = useState(false);

  // CSV parsing function
  const parseCSV = useCallback((csvText) => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) throw new Error('CSV must have header and at least one data row');

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredHeaders = ['sku', 'stock'];
      const hasRequired = requiredHeaders.every(h => headers.includes(h));

      if (!hasRequired) throw new Error('CSV must include "sku" and "stock" columns');

      const data = lines.slice(1).map((line, idx) => {
        const values = line.split(',');
        const row = {};
        headers.forEach((header, i) => {
          row[header] = values[i]?.trim();
        });
        return { ...row, rowIndex: idx + 1 };
      }).filter(row => row.sku && row.stock);

      return { headers, data, rowCount: data.length };
    } catch (err) {
      throw new Error(`Parse error: ${err.message}`);
    }
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setUploadError('Please upload a CSV file');
      return;
    }

    setIsParsingFile(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        const parsed = parseCSV(text);
        setUploadedData(parsed);
        setUploadedFile(file);

        // Auto-set base stock from first row if available
        if (parsed.data[0]?.stock) {
          setBaseStock(Number(parsed.data[0].stock) || 1200);
        }
      } catch (err) {
        setUploadError(err.message);
        setUploadedData(null);
      } finally {
        setIsParsingFile(false);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read file');
      setIsParsingFile(false);
    };
    reader.readAsText(file);
  }, [parseCSV]);

  // Clear uploaded file
  const handleClearUpload = useCallback(() => {
    setUploadedFile(null);
    setUploadedData(null);
    setUploadError(null);
  }, []);

  // Slider states
  const [serviceLevelTarget, setServiceLevelTarget] = useState(97);
  const [demandVariability, setDemandVariability] = useState(82);
  const [leadTimeBuffer, setLeadTimeBuffer] = useState(7);
  const [holdingCostRate, setHoldingCostRate] = useState(22);
  const [stockoutMultiplier, setStockoutMultiplier] = useState(25);

  // Combine slider params for debouncing
  const sliderParams = useMemo(() => ({
    serviceLevelTarget,
    demandVariability,
    leadTimeBuffer,
    holdingCostRate,
    stockoutMultiplier,
    baseStock,
  }), [serviceLevelTarget, demandVariability, leadTimeBuffer, holdingCostRate, stockoutMultiplier, baseStock]);

  // Debounce slider params - recalculate 300ms after user stops sliding
  const debouncedParams = useDebounce(sliderParams, 300);

  // Generate Monte Carlo data based on debounced params
  const monteCarloData = useMemo(() => {
    return generateMonteCarloData(debouncedParams);
  }, [debouncedParams]);

  // Effect to show loading state during recalculation
  useEffect(() => {
    // Skip on initial render
    if (lastCalculated !== null) {
      setIsCalculating(true);
      setChartAnimating(true);
    }

    const timer = setTimeout(() => {
      setIsCalculating(false);
      setLastCalculated(new Date());
      setTimeout(() => setChartAnimating(false), 300);
    }, 350);

    return () => clearTimeout(timer);
  }, [debouncedParams]);

  // Manual recalculate handler
  const handleRecalculate = useCallback(() => {
    setIsCalculating(true);
    setChartAnimating(true);

    // Force recalculation by triggering state update
    setTimeout(() => {
      setIsCalculating(false);
      setLastCalculated(new Date());
      setTimeout(() => setChartAnimating(false), 300);
    }, 500);
  }, []);

  // Calculate custom scenario values based on sliders
  const calculateCustomScenario = () => {
    const baseInv = 42.1;
    const invIncrease = (serviceLevelTarget - 85) * 0.8;
    const newInv = baseInv + invIncrease;
    const holdingCost = newInv * (holdingCostRate / 100);
    const stockouts = Math.max(0, 312 - (serviceLevelTarget - 85) * 18);
    const riskReduction = 18.4 - (serviceLevelTarget - 85) * 1.2;
    const netBenefit = 18.4 - riskReduction - (invIncrease * holdingCostRate / 100);

    return {
      serviceLevel: serviceLevelTarget,
      inventoryValue: newInv.toFixed(1),
      holdingCost: holdingCost.toFixed(1),
      stockoutsMonth: stockouts,
      revenueAtRisk: riskReduction.toFixed(1),
      netImpact: netBenefit.toFixed(1),
    };
  };

  const customValues = calculateCustomScenario();

  // Scenario icon helper
  const getScenarioIcon = (iconType) => {
    switch (iconType) {
      case 'assessment': return <AssessmentIcon sx={{ fontSize: 18, mr: 0.5 }} />;
      case 'smartToy': return <SmartToyIcon sx={{ fontSize: 18, mr: 0.5 }} />;
      case 'settings': return <SettingsIcon sx={{ fontSize: 18, mr: 0.5 }} />;
      default: return null;
    }
  };

  // KPI Card Component
  const KPICard = ({ label, value, color, sub }) => (
    <Card
      variant="outlined"
      sx={{
        bgcolor: colors.cardBg,
        borderColor: alpha('#00357a', 0.2),
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor: alpha('#00357a', 0.4),
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography
          sx={{
            fontSize: '0.65rem',
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 1,
            mb: 1,
          }}
        >
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={700} sx={{ color }}>
          {value}
        </Typography>
        {sub && (
          <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, mt: 0.5 }}>
            {sub}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  // Scenario Card Component
  const ScenarioCard = ({ scenario, isSelected, onClick }) => {
    const isCustom = scenario.id === 'custom';
    const displayValues = isCustom ? {
      ...scenario,
      ...customValues,
    } : scenario;

    return (
      <Card
        onClick={onClick}
        sx={{
          cursor: 'pointer',
          border: `2px solid`,
          borderColor: isSelected
            ? (scenario.recommended ? '#10b981' : '#00357a')
            : alpha('#00357a', 0.15),
          bgcolor: colors.cardBg,
          transition: 'all 0.3s',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            borderColor: alpha('#00357a', 0.4),
            transform: 'translateY(-4px)',
          },
        }}
      >
        {scenario.recommended && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              py: 0.5,
              bgcolor: '#10b981',
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: 'white', letterSpacing: 1 }}>
              AI RECOMMENDED
            </Typography>
          </Box>
        )}

        <CardContent sx={{ pt: scenario.recommended ? 4 : 2 }}>
          <Stack direction="row" alignItems="center" sx={{ mb: 0.5 }}>
            {getScenarioIcon(scenario.iconType)}
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: colors.text }}>
              {scenario.name}
            </Typography>
          </Stack>
          <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, mb: 2 }}>
            {scenario.description}
          </Typography>

          {[
            { label: 'Service Level', value: `${displayValues.serviceLevel}%`, type: displayValues.serviceLevel > 93 ? 'positive' : 'neutral' },
            { label: 'Inventory Value', value: `$${displayValues.inventoryValue}M`, type: 'highlight' },
            { label: 'Annual Holding Cost', value: `$${displayValues.holdingCost}M`, type: 'highlight' },
            { label: 'Stockouts / Month', value: displayValues.stockoutsMonth, type: displayValues.stockoutsMonth < 150 ? 'positive' : 'negative' },
            { label: 'Revenue at Risk', value: `$${displayValues.revenueAtRisk}M`, type: displayValues.revenueAtRisk < 5 ? 'positive' : 'negative' },
          ].map((kpi, idx) => (
            <Stack
              key={idx}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ py: 1, borderBottom: idx < 4 ? `1px solid ${alpha('#00357a', 0.08)}` : 'none' }}
            >
              <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>{kpi.label}</Typography>
              <Typography sx={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: kpi.type === 'positive' ? '#10b981' : kpi.type === 'negative' ? '#ef4444' : kpi.type === 'highlight' ? '#00357a' : colors.textSecondary,
              }}>
                {kpi.value}
              </Typography>
            </Stack>
          ))}
        </CardContent>

        <Box sx={{ p: 2, bgcolor: alpha(colors.background, 0.5), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontSize: '0.6rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
              Net Impact
            </Typography>
            <Typography sx={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: displayValues.netImpact ? (displayValues.netImpact > 0 ? '#10b981' : '#ef4444') : colors.textSecondary,
              mt: 0.5,
            }}>
              {displayValues.netImpact ? `+$${displayValues.netImpact}M/yr` : 'Baseline'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            sx={{
              bgcolor: '#00357a',
              '&:hover': {
                bgcolor: '#002352',
              },
            }}
          >
            Select
          </Button>
        </Box>
      </Card>
    );
  };

  return (
    <Box
      sx={{
        p: 3,
        minHeight: '100vh',
        bgcolor: colors.background,
        overflow: 'auto',
      }}
    >
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link
              component="button"
              variant="body1"
              onClick={() => onBack('core')}
              sx={{
                textDecoration: 'none',
                color: colors.text,
                '&:hover': { textDecoration: 'underline', color: colors.primary },
                cursor: 'pointer',
              }}
            >
              CORE.AI
            </Link>
            <Link
              component="button"
              variant="body1"
              onClick={() => onBack('stox')}
              sx={{
                textDecoration: 'none',
                color: colors.text,
                '&:hover': { textDecoration: 'underline', color: colors.primary },
                cursor: 'pointer',
              }}
            >
              STOX.AI
            </Link>
            <Link
              component="button"
              variant="body1"
              onClick={() => onBack('distribution')}
              sx={{
                textDecoration: 'none',
                color: colors.text,
                '&:hover': { textDecoration: 'underline', color: colors.primary },
                cursor: 'pointer',
              }}
            >
              Distribution
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              What-If Simulator
            </Typography>
          </Breadcrumbs>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => onBack('mrp-parameter-advisor')}
              sx={{
                borderColor: alpha('#3b82f6', 0.4),
                color: '#3b82f6',
                '&:hover': {
                  borderColor: '#3b82f6',
                  bgcolor: alpha('#3b82f6', 0.08),
                },
              }}
            >
              ← Back to Parameter Advisor
            </Button>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => onBack('distribution')}
              variant="outlined"
              size="small"
              sx={{ borderColor: colors.border }}
            >
              Back to Distribution
            </Button>
          </Stack>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: '#00357a',
            }}
          >
            <ScienceIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ color: '#00357a' }}
            >
              What-If Simulator
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Monte Carlo & Scenario Planning
            </Typography>
          </Box>
          <Chip
            label="TILE 5 — STRATEGIC SANDBOX"
            sx={{
              ml: 'auto',
              bgcolor: '#00357a',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
              letterSpacing: 1,
            }}
          />
        </Stack>
      </Box>

      {/* AI Scenario Advisor Card */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          bgcolor: alpha(aiThemeColor, 0.04),
          border: `1px solid ${alpha(aiThemeColor, 0.15)}`,
          borderLeft: `3px solid ${aiThemeColor}`,
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(aiThemeColor, 0.15) }}>
            <SmartToyIcon sx={{ fontSize: 22, color: aiThemeColor }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: aiThemeColor }}>
                AI Scenario Advisor
              </Typography>
              <Chip
                icon={<StarIcon sx={{ fontSize: 12 }} />}
                label="Recommended"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.6rem',
                  bgcolor: alpha('#10b981', 0.12),
                  color: '#10b981',
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: '#10b981' },
                }}
              />
            </Stack>
            <Typography sx={{ fontSize: '0.8rem', color: colors.textSecondary }}>
              {aiScenarioAdvisor.rationale}
            </Typography>
          </Box>
          <Chip
            label={`${aiScenarioAdvisor.confidence}% Confidence`}
            size="small"
            sx={{ bgcolor: alpha(aiThemeColor, 0.12), color: aiThemeColor, fontWeight: 600, fontSize: '0.7rem' }}
          />
        </Stack>
      </Paper>

      {/* Portfolio Summary KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard label="Portfolio Value at Risk" value="$18.4M" color="#ef4444" sub="312 SKUs with stockout risk" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard label="Recommended Investment" value="$5.7M" color="#f59e0b" sub="Inventory increase" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard label="Protected Revenue" value="$14.2M" color="#10b981" sub="Risk mitigation value" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard label="Net Value Creation" value="$8.5M" color="#00357a" sub="Annual benefit" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard label="Simulation Confidence" value="89%" color="#a855f7" sub="Model reliability" />
        </Grid>
      </Grid>

      {/* Scenario Comparison */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <CompareIcon sx={{ fontSize: 18, color: '#00357a' }} />
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 2 }}>
            Scenario Comparison
          </Typography>
        </Stack>
        <Grid container spacing={3}>
          {scenarios.map((scenario) => (
            <Grid item xs={12} md={4} key={scenario.id}>
              <ScenarioCard
                scenario={scenario}
                isSelected={selectedScenario === scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Data Context Card - SKU/Plant Selection */}
      <Card
        variant="outlined"
        sx={{
          mb: 3,
          bgcolor: colors.cardBg,
          borderColor: alpha('#00357a', 0.2),
        }}
      >
        <CardContent sx={{ py: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: alpha('#00357a', 0.1), width: 36, height: 36 }}>
              <InventoryIcon sx={{ color: '#00357a', fontSize: 20 }} />
            </Avatar>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#00357a', flex: 1 }}>
              Data Context
            </Typography>
            {selectedSKU && (
              <Chip
                label={`Base Stock: ${baseStock.toLocaleString()} EA`}
                size="small"
                sx={{ bgcolor: alpha('#10b981', 0.12), color: '#10b981', fontWeight: 600 }}
              />
            )}
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Autocomplete
                size="small"
                options={[
                  { id: 'SKU-001', name: 'Industrial Pump A-100', stock: 1200 },
                  { id: 'SKU-002', name: 'Valve Assembly B-200', stock: 850 },
                  { id: 'SKU-003', name: 'Motor Controller C-300', stock: 2100 },
                  { id: 'SKU-004', name: 'Bearing Kit D-400', stock: 450 },
                  { id: 'SKU-005', name: 'Sensor Module E-500', stock: 1800 },
                ]}
                getOptionLabel={(option) => `${option.id} - ${option.name}`}
                value={selectedSKU}
                onChange={(_, newValue) => {
                  setSelectedSKU(newValue);
                  if (newValue) setBaseStock(newValue.stock);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select SKU"
                    placeholder="Search materials..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#00357a' },
                        '&.Mui-focused fieldset': { borderColor: '#00357a' },
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#00357a' },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                size="small"
                options={[
                  { id: 'P1000', name: 'Phoenix Distribution Center' },
                  { id: 'P2000', name: 'Tucson Warehouse' },
                  { id: 'P3000', name: 'Flagstaff Hub' },
                ]}
                getOptionLabel={(option) => `${option.id} - ${option.name}`}
                value={selectedPlant}
                onChange={(_, newValue) => setSelectedPlant(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Plant"
                    placeholder="Search plants..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#00357a' },
                        '&.Mui-focused fieldset': { borderColor: '#00357a' },
                      },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#00357a' },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                size="small"
                fullWidth
                label="Base Stock Level"
                type="number"
                value={baseStock}
                onChange={(e) => setBaseStock(Number(e.target.value) || 1200)}
                InputProps={{
                  endAdornment: <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>EA</Typography>,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#00357a' },
                    '&.Mui-focused fieldset': { borderColor: '#00357a' },
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#00357a' },
                }}
              />
            </Grid>
          </Grid>

          {/* CSV Upload Section */}
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="csv-upload-input"
              />
              <label htmlFor="csv-upload-input">
                <Button
                  component="span"
                  variant="outlined"
                  size="small"
                  disabled={isParsingFile}
                  startIcon={isParsingFile ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                  sx={{
                    borderColor: alpha('#00357a', 0.3),
                    color: '#00357a',
                    '&:hover': {
                      borderColor: '#00357a',
                      bgcolor: alpha('#00357a', 0.05),
                    },
                  }}
                >
                  {isParsingFile ? 'Parsing...' : 'Upload CSV'}
                </Button>
              </label>
              {uploadedFile && (
                <Chip
                  label={`${uploadedFile.name} (${uploadedData?.rowCount || 0} rows)`}
                  size="small"
                  onDelete={handleClearUpload}
                  sx={{ ml: 1, bgcolor: alpha('#10b981', 0.12), color: '#10b981' }}
                />
              )}
            </Box>
          </Stack>

          {/* Upload Error */}
          {uploadError && (
            <Alert severity="error" sx={{ mt: 1.5 }} onClose={() => setUploadError(null)}>
              {uploadError}
            </Alert>
          )}

        </CardContent>
      </Card>

      {/* Simulator Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Parameter Sandbox */}
        <Grid item xs={12} md={4}>
          <Card
            variant="outlined"
            sx={{
              bgcolor: colors.cardBg,
              borderColor: alpha('#00357a', 0.2),
              height: '100%',
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3, pb: 2, borderBottom: `1px solid ${alpha('#00357a', 0.15)}` }}>
                <Avatar sx={{ bgcolor: '#00357a' }}>
                  <TuneIcon />
                </Avatar>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#00357a' }}>
                  Parameter Sandbox
                </Typography>
              </Stack>

              {/* Sliders */}
              {[
                { label: 'Target Service Level', value: serviceLevelTarget, setValue: setServiceLevelTarget, min: 85, max: 99, format: (v) => `${v}%`, hint: ['85% (Cost Focus)', '99% (Service Focus)'] },
                { label: 'Demand Variability (CV)', value: demandVariability, setValue: setDemandVariability, min: 0, max: 100, format: (v) => (v / 100).toFixed(2), hint: ['0.00 (Stable)', '1.00 (Erratic)'] },
                { label: 'Lead Time Buffer', value: leadTimeBuffer, setValue: setLeadTimeBuffer, min: 0, max: 14, format: (v) => `+${v} days`, hint: ['0 days', '+14 days'] },
                { label: 'Holding Cost Rate', value: holdingCostRate, setValue: setHoldingCostRate, min: 15, max: 30, format: (v) => `${v}%`, hint: ['15%', '30%'] },
                { label: 'Stockout Cost Multiplier', value: stockoutMultiplier, setValue: setStockoutMultiplier, min: 10, max: 50, format: (v) => `${(v / 10).toFixed(1)}x`, hint: ['1.0x (Low)', '5.0x (Critical)'] },
              ].map((slider, idx) => (
                <Box key={idx} sx={{ mb: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary, fontWeight: 500 }}>
                      {slider.label}
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#00357a' }}>
                      {slider.format(slider.value)}
                    </Typography>
                  </Stack>
                  <Slider
                    value={slider.value}
                    onChange={(_, v) => slider.setValue(v)}
                    min={slider.min}
                    max={slider.max}
                    valueLabelDisplay="auto"
                    valueLabelFormat={slider.format}
                    sx={{
                      color: '#00357a',
                      height: 8,
                      '& .MuiSlider-thumb': {
                        bgcolor: '#00357a',
                        width: 18,
                        height: 18,
                        transition: 'transform 0.1s',
                        '&:hover': {
                          boxShadow: `0 0 0 8px ${alpha('#00357a', 0.16)}`,
                        },
                        '&:active': {
                          transform: 'scale(1.2)',
                        },
                      },
                      '& .MuiSlider-track': {
                        bgcolor: '#00357a',
                        border: 'none',
                      },
                      '& .MuiSlider-rail': {
                        bgcolor: alpha('#00357a', 0.15),
                      },
                      '& .MuiSlider-valueLabel': {
                        bgcolor: '#00357a',
                        borderRadius: 1,
                        fontSize: '0.75rem',
                      },
                    }}
                  />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ fontSize: '0.6rem', color: colors.textSecondary }}>{slider.hint[0]}</Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: colors.textSecondary }}>{slider.hint[1]}</Typography>
                  </Stack>
                </Box>
              ))}

              <Button
                fullWidth
                variant="contained"
                onClick={handleRecalculate}
                disabled={isCalculating}
                startIcon={isCalculating ? <CircularProgress size={18} color="inherit" /> : <FlashOnIcon />}
                sx={{
                  mt: 2,
                  py: 1.5,
                  bgcolor: isCalculating ? alpha('#00357a', 0.7) : '#00357a',
                  fontWeight: 600,
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: '#002352',
                    transform: 'scale(1.02)',
                  },
                  '&:disabled': {
                    bgcolor: alpha('#00357a', 0.5),
                    color: 'white',
                  },
                }}
              >
                {isCalculating ? 'Calculating...' : 'Recalculate Scenario'}
              </Button>


              {/* Execution Modes */}
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', mt: 3, mb: 1.5 }}>
                Execution Mode
              </Typography>
              <Stack direction="row" spacing={1}>
                {[
                  { value: 'simulate', IconComp: VisibilityIcon, label: 'Simulate', desc: 'Read-only' },
                  { value: 'recommend', IconComp: PanToolIcon, label: 'Recommend', desc: "Approval req'd" },
                  { value: 'auto', IconComp: FlashOnIcon, label: 'Auto-Execute', desc: 'Within guardrails' },
                ].map((mode) => (
                  <Box
                    key={mode.value}
                    onClick={() => setExecutionMode(mode.value)}
                    sx={{
                      flex: 1,
                      p: 1.5,
                      borderRadius: 2,
                      border: `2px solid`,
                      borderColor: executionMode === mode.value ? '#00357a' : alpha('#00357a', 0.2),
                      bgcolor: executionMode === mode.value ? alpha('#00357a', 0.15) : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: alpha('#00357a', 0.5),
                        bgcolor: alpha('#00357a', 0.1),
                      },
                    }}
                  >
                    <mode.IconComp sx={{ fontSize: 24, mb: 0.5, color: executionMode === mode.value ? '#00357a' : colors.textSecondary }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.text }}>{mode.label}</Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: colors.textSecondary }}>{mode.desc}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Monte Carlo Chart */}
        <Grid item xs={12} md={8}>
          <Card
            variant="outlined"
            sx={{
              bgcolor: colors.cardBg,
              borderColor: alpha('#00357a', 0.2),
              height: '100%',
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: colors.textSecondary }}>
                  90-Day Inventory Forecast
                </Typography>
                <Stack direction="row" spacing={2}>
                  {[
                    { color: alpha('#00357a', 0.4), label: 'Best Case' },
                    { color: '#00357a', label: 'Expected' },
                    { color: '#ef4444', label: 'Worst Case' },
                  ].map((legend, idx) => (
                    <Stack key={idx} direction="row" alignItems="center" spacing={0.5}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: legend.color }} />
                      <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary }}>{legend.label}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>

              <Box sx={{ height: 320, position: 'relative' }}>
                {/* Loading overlay */}
                {isCalculating && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: alpha(colors.cardBg, 0.8),
                      zIndex: 10,
                      borderRadius: 1,
                      backdropFilter: 'blur(2px)',
                    }}
                  >
                    <CircularProgress size={40} sx={{ color: '#00357a' }} />
                  </Box>
                )}
                <Fade in={!chartAnimating} timeout={300}>
                  <Box sx={{ height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monteCarloData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha('#00357a', 0.1)} />
                        <XAxis
                          dataKey="day"
                          tick={{ fontSize: 9, fill: colors.textSecondary }}
                          tickFormatter={(v) => `D${v}`}
                        />
                        <YAxis
                          tick={{ fontSize: 9, fill: colors.textSecondary }}
                          tickFormatter={(v) => `${v} EA`}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: colors.cardBg,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 8,
                            fontSize: 12,
                            padding: '8px 12px',
                          }}
                          formatter={(value, name) => {
                            const labels = { p90: 'Best Case', p50: 'Expected', p10: 'Worst Case', safetyStock: 'Safety Stock' };
                            return [`${Math.round(value).toLocaleString()} EA`, labels[name] || name];
                          }}
                          labelFormatter={(day) => `Day ${day}`}
                        />
                        <Area
                          type="monotone"
                          dataKey="p90"
                          stroke={alpha('#00357a', 0.3)}
                          fill={alpha('#00357a', 0.1)}
                          strokeWidth={1}
                          isAnimationActive={!isCalculating}
                        />
                        <Area
                          type="monotone"
                          dataKey="p50"
                          stroke="#00357a"
                          fill="transparent"
                          strokeWidth={2}
                          isAnimationActive={!isCalculating}
                        />
                        <Area
                          type="monotone"
                          dataKey="p10"
                          stroke={alpha('#ef4444', 0.5)}
                          fill={alpha('#ef4444', 0.1)}
                          strokeWidth={1}
                          isAnimationActive={!isCalculating}
                        />
                        <ReferenceLine
                          y={monteCarloData[0]?.safetyStock || 680}
                          stroke="#fbbf24"
                          strokeDasharray="6 4"
                          strokeWidth={2}
                          label={{ value: `Safety Stock (${monteCarloData[0]?.safetyStock || 680} EA)`, position: 'right', fill: '#fbbf24', fontSize: 10 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Fade>
              </Box>

              {/* Monte Carlo Interpretation Guide - NEW */}
              <Paper
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: alpha('#00357a', 0.04),
                  border: `1px solid ${alpha('#00357a', 0.12)}`,
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <SmartToyIcon sx={{ fontSize: 18, color: '#00357a' }} />
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#00357a' }}>
                    AI Monte Carlo Interpretation Guide
                  </Typography>
                  <Chip
                    label="Plain English"
                    size="small"
                    sx={{ height: 18, fontSize: '0.6rem', bgcolor: alpha('#10b981', 0.12), color: '#10b981' }}
                  />
                </Stack>

                {/* P-Band Explanations */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {[
                    {
                      band: 'P90 (Best Case)',
                      color: alpha('#00357a', 0.3),
                      meaning: 'In 90% of simulations, inventory stays above this level',
                      businessImpact: 'If demand is lower than expected or suppliers deliver early, you\'ll have this much stock',
                      riskLevel: 'LOW',
                      riskColor: '#10b981',
                    },
                    {
                      band: 'P50 (Expected)',
                      color: '#00357a',
                      meaning: 'The median outcome across 10,000 Monte Carlo runs',
                      businessImpact: 'Most likely scenario - plan operations around this trajectory',
                      riskLevel: 'MEDIUM',
                      riskColor: '#f59e0b',
                    },
                    {
                      band: 'P10 (Worst Case)',
                      color: alpha('#ef4444', 0.5),
                      meaning: 'Only 10% of simulations fall below this level',
                      businessImpact: 'If demand spikes AND suppliers are late, inventory could drop here',
                      riskLevel: 'HIGH',
                      riskColor: '#ef4444',
                    },
                  ].map((item, idx) => (
                    <Grid item xs={12} md={4} key={idx}>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: colors.cardBg,
                          borderRadius: 1.5,
                          border: `1px solid ${colors.border}`,
                          height: '100%',
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.text }}>
                            {item.band}
                          </Typography>
                          <Chip
                            label={item.riskLevel}
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: '0.55rem',
                              bgcolor: alpha(item.riskColor, 0.12),
                              color: item.riskColor,
                              fontWeight: 600,
                              ml: 'auto',
                            }}
                          />
                        </Stack>
                        <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, mb: 0.5 }}>
                          <strong>What it means:</strong> {item.meaning}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>
                          <strong>Business impact:</strong> {item.businessImpact}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {/* Key Insight */}
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: alpha('#f59e0b', 0.08),
                    borderRadius: 1.5,
                    border: `1px solid ${alpha('#f59e0b', 0.2)}`,
                    mb: 2,
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <InfoIcon sx={{ fontSize: 16, color: '#f59e0b', mt: 0.3 }} />
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', mb: 0.5 }}>
                        Critical Insight: Safety Stock Crossover
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, lineHeight: 1.6 }}>
                        The yellow dashed line shows your safety stock level (680 EA). When the <strong style={{ color: '#ef4444' }}>P10 band dips below this line</strong>,
                        there's a 10% chance of stockout on those days. In this projection, <strong style={{ color: colors.text }}>42% of days in weeks 3-6</strong> show
                        P10 below safety stock — indicating elevated stockout risk during that window.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Scenario Selection Guidance */}
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#00357a', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>
                  Scenario Selection Guide by Risk Tolerance
                </Typography>
                <Grid container spacing={2}>
                  {[
                    {
                      profile: 'Conservative',
                      IconComp: SecurityIcon,
                      description: 'Prioritize service level over cost',
                      recommendation: 'Use Custom Scenario with 97%+ service target',
                      bestFor: 'Critical A-class items, contractual SLAs, strategic customers',
                      color: '#10b981',
                    },
                    {
                      profile: 'Balanced',
                      IconComp: BalanceIcon,
                      description: 'Optimize cost-service trade-off',
                      recommendation: 'Use AI Recommended scenario (94.8% service)',
                      bestFor: 'Standard B-class items, general inventory',
                      color: '#00357a',
                    },
                    {
                      profile: 'Aggressive',
                      IconComp: SpeedIcon,
                      description: 'Minimize inventory investment',
                      recommendation: 'Start from Current State, adjust incrementally',
                      bestFor: 'C-class items, slow-movers, commodities',
                      color: '#f59e0b',
                    },
                  ].map((profile, idx) => (
                    <Grid item xs={12} md={4} key={idx}>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: alpha(profile.color, 0.04),
                          borderRadius: 1.5,
                          border: `1px solid ${alpha(profile.color, 0.2)}`,
                          height: '100%',
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                          <profile.IconComp sx={{ fontSize: 18, color: profile.color }} />
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: profile.color }}>
                            {profile.profile}
                          </Typography>
                        </Stack>
                        <Typography sx={{ fontSize: '0.68rem', color: colors.textSecondary, mb: 0.5 }}>
                          {profile.description}
                        </Typography>
                        <Typography sx={{ fontSize: '0.68rem', color: colors.text, fontWeight: 500, mb: 0.5 }}>
                          {profile.recommendation}
                        </Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, fontStyle: 'italic' }}>
                          Best for: {profile.bestFor}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Trade-off Analysis */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: alpha('#00357a', 0.2) }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <MoneyIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: colors.textSecondary }}>
                  Cost-Service Trade-off
                </Typography>
              </Stack>

              {/* Header */}
              <Grid container sx={{ py: 1, borderBottom: `1px solid ${colors.border}` }}>
                {['Dimension', 'Before', 'After', 'Δ Impact'].map((h, i) => (
                  <Grid item xs={3} key={i}>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase' }}>
                      {h}
                    </Typography>
                  </Grid>
                ))}
              </Grid>

              {/* Rows */}
              {[
                { metric: 'Service Level', before: '91.2%', after: `${customValues.serviceLevel}.0%`, delta: `+${(customValues.serviceLevel - 91.2).toFixed(1)} pts`, deltaColor: '#10b981' },
                { metric: 'Inventory Value', before: '$42.1M', after: `$${customValues.inventoryValue}M`, delta: `+$${(customValues.inventoryValue - 42.1).toFixed(1)}M`, deltaColor: '#f59e0b' },
                { metric: 'Annual Holding Cost', before: '$9.2M', after: `$${customValues.holdingCost}M`, delta: `+$${(customValues.holdingCost - 9.2).toFixed(1)}M`, deltaColor: '#f59e0b' },
                { metric: 'Stockouts / Month', before: '312', after: customValues.stockoutsMonth, delta: `−${312 - customValues.stockoutsMonth}`, deltaColor: '#10b981' },
                { metric: 'Revenue at Risk', before: '$18.4M', after: `$${customValues.revenueAtRisk}M`, delta: `−$${(18.4 - customValues.revenueAtRisk).toFixed(1)}M`, deltaColor: '#10b981' },
              ].map((row, idx) => (
                <Grid container key={idx} sx={{ py: 1.5, borderBottom: idx < 4 ? `1px solid ${alpha(colors.border, 0.5)}` : 'none', alignItems: 'center' }}>
                  <Grid item xs={3}>
                    <Typography sx={{ fontSize: '0.8rem', color: colors.textSecondary }}>{row.metric}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography sx={{ fontSize: '0.8rem', color: colors.textSecondary }}>{row.before}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>{row.after}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: row.deltaColor }}>{row.delta}</Typography>
                  </Grid>
                </Grid>
              ))}

              {/* Net Value Creation */}
              <Box sx={{ mt: 2, p: 2, bgcolor: alpha('#00357a', 0.1), borderRadius: 2 }}>
                <Grid container alignItems="center">
                  <Grid item xs={3}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: colors.text }}>Net Value Creation</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography sx={{ fontSize: '0.8rem', color: colors.textSecondary }}>—</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>${customValues.netImpact}M/yr</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Chip icon={<CheckCircleIcon sx={{ fontSize: 14 }} />} label="CEO-Ready" size="small" sx={{ bgcolor: alpha('#10b981', 0.15), color: '#10b981', fontWeight: 600, '& .MuiChip-icon': { color: '#10b981' } }} />
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: alpha('#00357a', 0.2), height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <AssessmentIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: colors.textSecondary }}>
                  Risk-Adjusted Recommendation
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, mb: 0.5 }}>RECOMMENDATION CONFIDENCE</Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ color: '#10b981' }}>89%</Typography>
                </Box>
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: `conic-gradient(#10b981 0deg 320deg, ${alpha('#64748b', 0.3)} 320deg 360deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      bgcolor: colors.cardBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 32, color: '#10b981' }} />
                  </Box>
                </Box>
              </Stack>

              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', mb: 0.5 }}>
                  Primary Risk Driver:
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: colors.textSecondary }}>
                  Demand volatility (CV 0.82) — accounts for 62% of uncertainty
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', mb: 0.5 }}>
                  Secondary Risk:
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: colors.textSecondary }}>
                  Supplier lead-time variability (±5 days) — accounts for 28%
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', mb: 0.5 }}>
                  Suggested Review:
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: colors.textSecondary }}>
                  Bi-weekly monitoring recommended for first 60 days
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Executive Summary and SAP Payload */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              bgcolor: alpha('#00357a', 0.04),
              border: `1px solid ${alpha('#00357a', 0.2)}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                bgcolor: '#00357a',
              }}
            />
            <CardContent sx={{ pt: 3 }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#00357a', mb: 2 }}>
                Executive Summary — Board Ready
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: colors.textSecondary, lineHeight: 1.8, mb: 3 }}>
                We recommend <strong style={{ color: colors.text }}>increasing safety stock on 312 SKUs</strong> across 3 plants.
                This investment of <span style={{ color: '#f59e0b' }}>${(customValues.inventoryValue - 42.1).toFixed(1)}M in inventory</span> (additional <span style={{ color: '#f59e0b' }}>${(customValues.holdingCost - 9.2).toFixed(1)}M annual holding cost</span>)
                will protect <span style={{ color: '#10b981', fontWeight: 700 }}>${(18.4 - customValues.revenueAtRisk).toFixed(1)}M in annual revenue</span> currently at risk from stockouts.<br /><br />
                Net value creation: <span style={{ color: '#10b981', fontWeight: 700 }}>${customValues.netImpact}M per year</span> with improved customer service (91% → {customValues.serviceLevel}%).<br /><br />
                The recommendation is <strong style={{ color: colors.text }}>reversible within 1 MRP cycle</strong> if service targets are exceeded.
                No ERP disruption expected; changes apply to material master records only.
              </Typography>

              <Grid container spacing={2}>
                {[
                  { IconComp: InventoryIcon, label: 'SKUs optimized', value: '312' },
                  { IconComp: FactoryIcon, label: 'Plants affected', value: '3' },
                  { IconComp: MoneyIcon, label: 'Net benefit/yr', value: `$${customValues.netImpact}M` },
                  { IconComp: TrendingUpIcon, label: 'Service gain', value: `+${(customValues.serviceLevel - 91.2).toFixed(1)} pts` },
                ].map((item, idx) => (
                  <Grid item xs={6} sm={3} key={idx}>
                    <Box sx={{ p: 1.5, bgcolor: alpha(colors.background, 0.5), borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <item.IconComp sx={{ fontSize: 20, color: '#00357a' }} />
                      <Box>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: colors.text }}>{item.value}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary }}>{item.label}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            variant="outlined"
            sx={{
              bgcolor: alpha(colors.background, 0.9),
              borderColor: alpha('#00357a', 0.2),
              height: '100%',
            }}
          >
            <CardContent>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#06b6d4', mb: 2 }}>
                ⚡ SAP Change Set Preview
              </Typography>

              <Stack direction="row" spacing={3} sx={{ mb: 2, pb: 2, borderBottom: `1px solid ${alpha('#00357a', 0.1)}` }}>
                {[
                  { value: '312', label: 'Materials' },
                  { value: '847', label: 'Field Changes' },
                  { value: 'MARC', label: 'Target Table' },
                ].map((stat, idx) => (
                  <Box key={idx} sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#00357a' }}>{stat.value}</Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: colors.textSecondary, textTransform: 'uppercase' }}>{stat.label}</Typography>
                  </Box>
                ))}
              </Stack>

              <Box
                sx={{
                  bgcolor: alpha('#000', 0.3),
                  borderRadius: 2,
                  p: 2,
                  fontFamily: 'monospace',
                  fontSize: '0.65rem',
                  color: '#06b6d4',
                  maxHeight: 180,
                  overflow: 'auto',
                }}
              >
                <Typography sx={{ color: colors.textSecondary, fontFamily: 'inherit', fontSize: 'inherit' }}>
                  // BAPI_MATERIAL_SAVEDATA payload preview
                </Typography>
                {`{`}<br />
                &nbsp;&nbsp;<span style={{ color: '#a78bfa' }}>"HEADDATA"</span>: {`{`}<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#a78bfa' }}>"MATERIAL"</span>: <span style={{ color: '#fbbf24' }}>"MAT-1001"</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#a78bfa' }}>"MRP_VIEW"</span>: <span style={{ color: '#fbbf24' }}>"X"</span><br />
                &nbsp;&nbsp;{`}`},<br />
                &nbsp;&nbsp;<span style={{ color: '#a78bfa' }}>"PLANTDATA"</span>: {`{`}<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#a78bfa' }}>"PLANT"</span>: <span style={{ color: '#fbbf24' }}>"P1000"</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#a78bfa' }}>"EISBE"</span>: <span style={{ color: '#10b981' }}>680</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#a78bfa' }}>"MINBE"</span>: <span style={{ color: '#10b981' }}>1008</span>,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#a78bfa' }}>"PLIFZ"</span>: <span style={{ color: '#10b981' }}>21</span><br />
                &nbsp;&nbsp;{`}`}<br />
                {`}`}<br />
                <Typography sx={{ color: colors.textSecondary, fontFamily: 'inherit', fontSize: 'inherit' }}>
                  // ... +311 more records
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Bar */}
      <Card
        sx={{
          bgcolor: alpha(colors.cardBg, 0.9),
          border: `1px solid ${alpha('#00357a', 0.3)}`,
          p: 3,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: '#10b981', width: 48, height: 48 }}>
              <CheckCircleIcon />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: colors.text }}>
                Ready to Execute Custom Scenario
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>
                312 materials • 847 field changes • ${customValues.netImpact}M net value creation
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              sx={{
                borderColor: alpha('#00357a', 0.3),
                color: '#00357a',
                '&:hover': {
                  borderColor: '#00357a',
                  bgcolor: alpha('#00357a', 0.08),
                },
              }}
            >
              Export Analysis
            </Button>
            <Button
              variant="outlined"
              startIcon={<AssessmentIcon />}
              sx={{
                borderColor: alpha('#00357a', 0.3),
                color: '#00357a',
                '&:hover': {
                  borderColor: '#00357a',
                  bgcolor: alpha('#00357a', 0.08),
                },
              }}
            >
              Download Report
            </Button>
            <Button
              variant="contained"
              startIcon={<CommitIcon sx={{ fontSize: 18 }} />}
              sx={{
                bgcolor: '#10b981',
                fontWeight: 600,
                px: 3,
                '&:hover': {
                  bgcolor: '#059669',
                },
              }}
            >
              Commit to SAP Queue
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
};

export default WhatIfSimulator;
