import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  Chip,
  Button,
  Breadcrumbs,
  Link,
  Stack,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  Divider,
  LinearProgress,
  IconButton,
  Checkbox,
  useTheme,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Layers as LayersIcon,
  Schedule as ScheduleIcon,
  BarChart as BarChartIcon,
  Bolt as BoltIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import stoxTheme from './stoxTheme';
import DataSourceChip from './DataSourceChip';
import { getTileDataConfig } from './stoxDataConfig';
import { LAM_PLANTS, LAM_MATERIALS, LAM_MATERIAL_PLANT_DATA, MRP_TYPES, getPlantName, getMaterialById } from '../../data/arizonaBeveragesMasterData';

// Use MRP Types from centralized data
const mrpTypes = MRP_TYPES;

// Generate materials data from centralized Arizona Beverages data
const generateMaterials = () => {
  const materials = [];

  // Map reasoning based on material type and XYZ classification
  const getRecommendation = (type, mrpType, xyz, abc) => {
    if (type === 'FERT') {
      // Finished goods typically use PD (MRP) or VV (forecast-based)
      if (xyz === 'Z') return { rec: 'VV', reason: 'Variable demand pattern suggests forecast-based VV would improve service.' };
      return { rec: 'PD', reason: 'High-value FG with stable demand. PD strategy optimal for MTO production.' };
    }
    if (type === 'HALB') {
      // Semi-finished goods benefit from automation
      if (xyz === 'X') return { rec: 'VM', reason: 'High-volume stable component. Auto reorder (VM) reduces manual effort.' };
      if (xyz === 'Y') return { rec: 'V2', reason: 'Variable demand benefits from consumption + forecast (V2).' };
      return { rec: 'VV', reason: 'High demand variability. VV improves planning accuracy.' };
    }
    // Raw materials
    if (abc === 'C') return { rec: 'ND', reason: 'Low-value commodity. Consider ND with blanket PO or consignment.' };
    if (xyz === 'X') return { rec: 'VM', reason: 'Stable consumption pattern. VM automates ordering decisions.' };
    if (xyz === 'Y') return { rec: 'V1', reason: 'Variable consumption. V1 better matches actual usage patterns.' };
    return { rec: 'VB', reason: 'Current VB works well for this material type.' };
  };

  // Build materials from LAM_MATERIAL_PLANT_DATA
  LAM_MATERIAL_PLANT_DATA.forEach((plantData) => {
    const baseMaterial = getMaterialById(plantData.materialId);
    if (baseMaterial) {
      const rec = getRecommendation(baseMaterial.type, plantData.mrpType, plantData.xyz, plantData.abc);
      materials.push({
        id: plantData.materialId,
        name: baseMaterial.name,
        type: baseMaterial.type,
        plant: plantData.plant,
        plantName: getPlantName(plantData.plant),
        currentMRP: plantData.mrpType,
        recommendedMRP: rec.rec,
        stock: plantData.totalStock,
        safetyStock: plantData.safetyStock,
        rop: plantData.reorderPoint,
        lotSize: plantData.lotSize,
        leadTime: plantData.leadTime,
        price: baseMaterial.basePrice,
        abc: plantData.abc,
        xyz: plantData.xyz,
        turns: plantData.turns,
        dos: plantData.dos,
        fillRate: plantData.fillRate,
        excessStock: plantData.excessStock,
        reasoning: rec.reason
      });
    }
  });

  // Add a few additional materials for variety
  const additionalMaterials = [
    { id: 'FG0006', name: 'Electrochemical Deposition Phoenix', type: 'FERT', plant: '1000', plantName: 'Keasbey NJ',
      currentMRP: 'PD', recommendedMRP: 'PD', stock: 3, safetyStock: 0, rop: 1, lotSize: 1, leadTime: 150, price: 5500000,
      abc: 'A', xyz: 'Z', reasoning: 'Premium system with MTO approach. PD is well-suited.' },
    { id: 'FG0007', name: 'AZ Arnold Palmer Bevel Etch Tool', type: 'FERT', plant: '2000', plantName: 'Santa Clarita CA',
      currentMRP: 'PD', recommendedMRP: 'VV', stock: 2, safetyStock: 1, rop: 2, lotSize: 1, leadTime: 120, price: 6000000,
      abc: 'A', xyz: 'Y', reasoning: 'Variable demand pattern suggests forecast-based VV would improve service.' },
  ];

  materials.push(...additionalMaterials);
  return materials;
};

const formatCurrency = (val) => {
  const abs = Math.abs(val);
  const sign = val > 0 ? '+' : val < 0 ? '-' : '';
  if (abs >= 1e6) return sign + '$' + (abs / 1e6).toFixed(1) + 'M';
  if (abs >= 1e3) return sign + '$' + (abs / 1e3).toFixed(0) + 'K';
  return sign + '$' + abs.toFixed(0);
};

const MRPOptimizerDashboard = ({ onBack, onTileClick }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [scenarioState, setScenarioState] = useState({});
  const [selectedMaterials, setSelectedMaterials] = useState(new Set());
  const [filters, setFilters] = useState({
    type: 'all',
    plant: 'all',
    mrpType: 'all',
    search: '',
    showRecommendedOnly: false,
    showModifiedOnly: false,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const tileConfig = getTileDataConfig('mrp-optimizer');
  const typeLabels = { FERT: 'FG', HALB: 'SFG', ROH: 'RAW' };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mats = generateMaterials();
      setMaterials(mats);

      // Initialize scenario state
      const initialState = {};
      mats.forEach(m => {
        const key = `${m.id}-${m.plant}`;
        initialState[key] = {
          mrpType: m.currentMRP,
          safetyStock: m.safetyStock,
          rop: m.rop,
          lotSize: m.lotSize,
          typeModified: false,
          paramsModified: false,
        };
      });
      setScenarioState(initialState);
      setLoading(false);
    }, 800);
  }, []);

  const getKey = (m) => `${m.id}-${m.plant}`;

  // Compute stats
  const stats = useMemo(() => {
    let typeChangeCount = 0;
    let paramChangeCount = 0;
    let netSSDelta = 0;
    let netValueDelta = 0;

    materials.forEach(m => {
      const key = getKey(m);
      const s = scenarioState[key];
      if (!s) return;
      if (s.typeModified) typeChangeCount++;
      if (s.paramsModified) paramChangeCount++;
      const ssDelta = s.safetyStock - m.safetyStock;
      netSSDelta += ssDelta;
      netValueDelta += ssDelta * m.price;
    });

    return {
      totalCount: materials.length,
      typeChangeCount,
      paramChangeCount,
      netSSDelta,
      netValueDelta,
    };
  }, [materials, scenarioState]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      if (filters.type !== 'all' && m.type !== filters.type) return false;
      if (filters.plant !== 'all' && m.plant !== filters.plant) return false;
      if (filters.mrpType !== 'all' && m.currentMRP !== filters.mrpType) return false;
      if (filters.search && !m.id.toLowerCase().includes(filters.search.toLowerCase()) &&
          !m.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.showRecommendedOnly && m.currentMRP === m.recommendedMRP) return false;
      const key = getKey(m);
      if (filters.showModifiedOnly && scenarioState[key] &&
          !scenarioState[key].typeModified && !scenarioState[key].paramsModified) return false;
      return true;
    });
  }, [materials, filters, scenarioState]);

  const showToast = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const updateMRPType = (key, value) => {
    const mat = materials.find(m => getKey(m) === key);
    setScenarioState(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        mrpType: value,
        typeModified: value !== mat.currentMRP,
      }
    }));
  };

  const updateParam = (key, field, value) => {
    const mat = materials.find(m => getKey(m) === key);
    setScenarioState(prev => {
      const newState = {
        ...prev,
        [key]: {
          ...prev[key],
          [field]: parseInt(value) || 0,
        }
      };
      const s = newState[key];
      s.paramsModified = s.safetyStock !== mat.safetyStock || s.rop !== mat.rop || s.lotSize !== mat.lotSize;
      return newState;
    });
  };

  const applyRecommendation = (key) => {
    const mat = materials.find(m => getKey(m) === key);
    setScenarioState(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        mrpType: mat.recommendedMRP,
        typeModified: mat.recommendedMRP !== mat.currentMRP,
      }
    }));
    showToast(`Applied: ${mat.currentMRP} → ${mat.recommendedMRP}`);
  };

  const applyAllRecommendations = () => {
    let count = 0;
    const newState = { ...scenarioState };
    materials.forEach(m => {
      if (m.currentMRP !== m.recommendedMRP) {
        const key = getKey(m);
        newState[key] = {
          ...newState[key],
          mrpType: m.recommendedMRP,
          typeModified: true,
        };
        count++;
      }
    });
    setScenarioState(newState);
    showToast(`Applied ${count} recommendations`);
  };

  const resetMaterial = (key) => {
    const mat = materials.find(m => getKey(m) === key);
    setScenarioState(prev => ({
      ...prev,
      [key]: {
        mrpType: mat.currentMRP,
        safetyStock: mat.safetyStock,
        rop: mat.rop,
        lotSize: mat.lotSize,
        typeModified: false,
        paramsModified: false,
      }
    }));
    showToast('Reset to current values');
  };

  const resetAll = () => {
    const newState = {};
    materials.forEach(m => {
      const key = getKey(m);
      newState[key] = {
        mrpType: m.currentMRP,
        safetyStock: m.safetyStock,
        rop: m.rop,
        lotSize: m.lotSize,
        typeModified: false,
        paramsModified: false,
      };
    });
    setScenarioState(newState);
    setSelectedMaterials(new Set());
    showToast('All reset');
  };

  const toggleSelect = (key) => {
    setSelectedMaterials(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const saveMaterial = (key) => {
    showToast('Saved!');
  };

  const saveAll = () => {
    showToast('All changes saved!');
  };

  const pushToSAP = () => {
    const modified = materials.filter(m => {
      const key = getKey(m);
      return scenarioState[key]?.typeModified || scenarioState[key]?.paramsModified;
    });
    if (modified.length === 0) {
      showToast('No changes to push', 'info');
      return;
    }
    showToast(`Pushed ${modified.length} changes to SAP!`);
  };

  // Material Card Component
  const MaterialCard = ({ m }) => {
    const key = getKey(m);
    const scenario = scenarioState[key] || {};
    const hasRecommendation = m.currentMRP !== m.recommendedMRP;
    const isModified = scenario.typeModified || scenario.paramsModified;

    const ssDelta = (scenario.safetyStock || 0) - m.safetyStock;
    const ropDelta = (scenario.rop || 0) - m.rop;
    const lotDelta = (scenario.lotSize || 0) - m.lotSize;
    const valueDelta = ssDelta * m.price;

    return (
      <Card
        sx={{
          mb: 2,
          border: 1,
          borderColor: isModified ? theme.palette.primary.main : 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.5),
          }
        }}
      >
        {/* Card Header */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          bgcolor: 'background.default',
          borderBottom: 1,
          borderColor: 'divider',
        }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Checkbox
              checked={selectedMaterials.has(key)}
              onChange={() => toggleSelect(key)}
              size="small"
            />
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body1" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                {m.id}
              </Typography>
              <Chip
                label={m.plant}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.text.secondary, 0.1),
                  fontFamily: 'monospace',
                  fontSize: '0.7rem',
                }}
              />
              <Chip
                label={typeLabels[m.type]}
                size="small"
                sx={{
                  bgcolor: alpha(
                    m.type === 'FERT' ? theme.palette.info.main :
                    m.type === 'HALB' ? theme.palette.primary.main :
                    theme.palette.warning.main,
                    0.12
                  ),
                  color: m.type === 'FERT' ? theme.palette.info.main :
                    m.type === 'HALB' ? theme.palette.primary.main :
                    theme.palette.warning.main,
                  fontWeight: 700,
                  fontSize: '0.65rem',
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {m.name} • {m.plantName}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {hasRecommendation && (
              <Chip label="Recommendation" size="small" sx={{ bgcolor: alpha(theme.palette.warning.main, 0.15), color: theme.palette.warning.main, fontWeight: 600 }} />
            )}
            {isModified && (
              <Chip label="Modified" size="small" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.15), color: theme.palette.primary.main, fontWeight: 600 }} />
            )}
            <Button size="small" variant="outlined" color="success" onClick={() => saveMaterial(key)} startIcon={<SaveIcon />}>
              Save
            </Button>
            <Button size="small" variant="outlined" onClick={() => resetMaterial(key)} startIcon={<RefreshIcon />}>
              Reset
            </Button>
          </Stack>
        </Box>

        {/* Card Body - Two Column Layout */}
        <Grid container>
          {/* MRP Type Section (Left) */}
          <Grid item xs={12} md={6} sx={{ p: 2.5, borderRight: { md: 1 }, borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                MRP Type
              </Typography>
            </Stack>

            <Grid container spacing={2} alignItems="center">
              {/* Current Box */}
              <Grid item xs={5}>
                <Box sx={{
                  p: 2,
                  textAlign: 'center',
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  border: 1,
                  borderColor: alpha(theme.palette.info.main, 0.25),
                }}>
                  <Typography variant="caption" fontWeight={700} color="info.main" sx={{ textTransform: 'uppercase' }}>
                    Current
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="info.main" sx={{ fontFamily: 'monospace', my: 0.5 }}>
                    {m.currentMRP}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {mrpTypes[m.currentMRP]?.name}
                  </Typography>
                </Box>
              </Grid>

              {/* Arrow */}
              <Grid item xs={2} sx={{ textAlign: 'center' }}>
                <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
              </Grid>

              {/* Scenario Box */}
              <Grid item xs={5}>
                <Box sx={{
                  p: 2,
                  textAlign: 'center',
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  border: 1,
                  borderColor: alpha(theme.palette.primary.main, 0.25),
                }}>
                  <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ textTransform: 'uppercase' }}>
                    Scenario
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ fontFamily: 'monospace', my: 0.5 }}>
                    {scenario.mrpType || m.currentMRP}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {mrpTypes[scenario.mrpType || m.currentMRP]?.name}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* MRP Type Selector */}
            <FormControl fullWidth size="small" sx={{ mt: 2 }}>
              <Select
                value={scenario.mrpType || m.currentMRP}
                onChange={(e) => updateMRPType(key, e.target.value)}
              >
                {Object.entries(mrpTypes).map(([code, info]) => (
                  <MenuItem key={code} value={code}>{code} - {info.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Recommendation Row */}
            {hasRecommendation && (
              <Box
                onClick={() => applyRecommendation(key)}
                sx={{
                  mt: 2,
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.warning.main, 0.08),
                  border: 1,
                  borderColor: alpha(theme.palette.warning.main, 0.2),
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.warning.main, 0.15),
                  }
                }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <BoltIcon sx={{ color: theme.palette.warning.main, fontSize: 18 }} />
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="warning.main">
                      AI: {m.currentMRP} → {m.recommendedMRP}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                      {m.reasoning}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}
          </Grid>

          {/* MRP Parameters Section (Right) */}
          <Grid item xs={12} md={6} sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <BarChartIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                MRP Parameters
              </Typography>
            </Stack>

            <Grid container spacing={1.5}>
              {/* Safety Stock */}
              <Grid item xs={6} md={3}>
                <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Safety Stock
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center" sx={{ mt: 1 }}>
                    <Chip label={m.safetyStock} size="small" sx={{ bgcolor: alpha(theme.palette.info.main, 0.15), color: theme.palette.info.main, fontFamily: 'monospace', fontWeight: 600 }} />
                    <Typography variant="caption" color="text.secondary">→</Typography>
                    <TextField
                      type="number"
                      size="small"
                      value={scenario.safetyStock ?? m.safetyStock}
                      onChange={(e) => updateParam(key, 'safetyStock', e.target.value)}
                      sx={{
                        width: 60,
                        '& input': {
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          p: 0.5,
                          color: ssDelta > 0 ? theme.palette.error.main : ssDelta < 0 ? theme.palette.success.main : theme.palette.primary.main,
                        },
                        '& .MuiOutlinedInput-root': {
                          bgcolor: ssDelta > 0 ? alpha(theme.palette.error.main, 0.1) : ssDelta < 0 ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.primary.main, 0.1),
                        }
                      }}
                    />
                  </Stack>
                  <Typography variant="caption" sx={{
                    display: 'block',
                    textAlign: 'center',
                    mt: 0.5,
                    color: ssDelta > 0 ? theme.palette.error.main : ssDelta < 0 ? theme.palette.success.main : 'text.secondary',
                    fontWeight: 600,
                  }}>
                    {ssDelta !== 0 ? (ssDelta > 0 ? '+' : '') + ssDelta : '—'}
                  </Typography>
                </Box>
              </Grid>

              {/* Reorder Point */}
              <Grid item xs={6} md={3}>
                <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Reorder Point
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center" sx={{ mt: 1 }}>
                    <Chip label={m.rop} size="small" sx={{ bgcolor: alpha(theme.palette.info.main, 0.15), color: theme.palette.info.main, fontFamily: 'monospace', fontWeight: 600 }} />
                    <Typography variant="caption" color="text.secondary">→</Typography>
                    <TextField
                      type="number"
                      size="small"
                      value={scenario.rop ?? m.rop}
                      onChange={(e) => updateParam(key, 'rop', e.target.value)}
                      sx={{
                        width: 60,
                        '& input': {
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          p: 0.5,
                          color: ropDelta !== 0 ? (ropDelta > 0 ? theme.palette.error.main : theme.palette.success.main) : theme.palette.primary.main,
                        },
                        '& .MuiOutlinedInput-root': {
                          bgcolor: ropDelta !== 0 ? (ropDelta > 0 ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.success.main, 0.1)) : alpha(theme.palette.primary.main, 0.1),
                        }
                      }}
                    />
                  </Stack>
                  <Typography variant="caption" sx={{
                    display: 'block',
                    textAlign: 'center',
                    mt: 0.5,
                    color: ropDelta > 0 ? theme.palette.error.main : ropDelta < 0 ? theme.palette.success.main : 'text.secondary',
                    fontWeight: 600,
                  }}>
                    {ropDelta !== 0 ? (ropDelta > 0 ? '+' : '') + ropDelta : '—'}
                  </Typography>
                </Box>
              </Grid>

              {/* Lot Size */}
              <Grid item xs={6} md={3}>
                <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Lot Size
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center" sx={{ mt: 1 }}>
                    <Chip label={m.lotSize} size="small" sx={{ bgcolor: alpha(theme.palette.info.main, 0.15), color: theme.palette.info.main, fontFamily: 'monospace', fontWeight: 600 }} />
                    <Typography variant="caption" color="text.secondary">→</Typography>
                    <TextField
                      type="number"
                      size="small"
                      value={scenario.lotSize ?? m.lotSize}
                      onChange={(e) => updateParam(key, 'lotSize', e.target.value)}
                      sx={{
                        width: 60,
                        '& input': {
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          p: 0.5,
                          color: lotDelta !== 0 ? (lotDelta > 0 ? theme.palette.error.main : theme.palette.success.main) : theme.palette.primary.main,
                        },
                        '& .MuiOutlinedInput-root': {
                          bgcolor: lotDelta !== 0 ? (lotDelta > 0 ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.success.main, 0.1)) : alpha(theme.palette.primary.main, 0.1),
                        }
                      }}
                    />
                  </Stack>
                  <Typography variant="caption" sx={{
                    display: 'block',
                    textAlign: 'center',
                    mt: 0.5,
                    color: lotDelta > 0 ? theme.palette.error.main : lotDelta < 0 ? theme.palette.success.main : 'text.secondary',
                    fontWeight: 600,
                  }}>
                    {lotDelta !== 0 ? (lotDelta > 0 ? '+' : '') + lotDelta : '—'}
                  </Typography>
                </Box>
              </Grid>

              {/* Lead Time (Read-only) */}
              <Grid item xs={6} md={3}>
                <Box sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Lead Time
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="text.secondary" sx={{ fontFamily: 'monospace', textAlign: 'center', mt: 1 }}>
                    {m.leadTime} days
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5, color: 'text.secondary' }}>
                    Fixed
                  </Typography>
                </Box>
              </Grid>

              {/* Value Impact */}
              <Grid item xs={12}>
                <Box sx={{
                  p: 1.5,
                  borderRadius: 1,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.info.main, 0.1)})`,
                  border: 1,
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>
                    Working Capital Impact
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      color: valueDelta > 0 ? theme.palette.error.main : valueDelta < 0 ? theme.palette.success.main : 'text.secondary',
                    }}
                  >
                    {valueDelta !== 0 ? formatCurrency(valueDelta) : 'No Change'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>Layer 5: Sandbox</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>MRP Optimizer</Typography>
          </Breadcrumbs>

          <Stack direction="row" spacing={1}>
            {tileConfig && <DataSourceChip dataType={tileConfig.dataType} />}
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ width: 4, height: 50, bgcolor: 'primary.main', borderRadius: 1 }} />
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <LayersIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h5" fontWeight={700}>MRP Optimizer</Typography>
              <Chip label="Layer 5 - Sandbox" size="small" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              MRP Type ↔ Parameter Optimization by SKU/Plant
            </Typography>
          </Box>
        </Stack>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { label: 'Total SKUs', value: stats.totalCount, color: theme.palette.info.main },
          { label: 'MRP Type Changes', value: stats.typeChangeCount, color: theme.palette.warning.main },
          { label: 'Param Changes', value: stats.paramChangeCount, color: theme.palette.primary.main },
          { label: 'Net SS Δ', value: `${stats.netSSDelta >= 0 ? '+' : ''}${stats.netSSDelta} units`, color: stats.netSSDelta > 0 ? theme.palette.error.main : stats.netSSDelta < 0 ? theme.palette.success.main : theme.palette.text.secondary },
          { label: 'Net Value Impact', value: formatCurrency(stats.netValueDelta), color: stats.netValueDelta > 0 ? theme.palette.error.main : stats.netValueDelta < 0 ? theme.palette.success.main : theme.palette.text.secondary },
        ].map((stat, i) => (
          <Grid item xs={6} sm={4} md={2.4} key={i}>
            <Card sx={{ p: 1.5 }}>
              <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: stat.color }}>{stat.value}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filter Bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Material Type</InputLabel>
              <Select value={filters.type} label="Material Type" onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}>
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="FERT">Finished Goods</MenuItem>
                <MenuItem value="HALB">Semi-Finished</MenuItem>
                <MenuItem value="ROH">Raw Materials</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Plant</InputLabel>
              <Select value={filters.plant} label="Plant" onChange={(e) => setFilters(prev => ({ ...prev, plant: e.target.value }))}>
                <MenuItem value="all">All Plants</MenuItem>
                <MenuItem value="1000">1000 - Keasbey</MenuItem>
                <MenuItem value="2000">2000 - Santa Clarita</MenuItem>
                <MenuItem value="3000">3000 - Hwaseong</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>MRP Type</InputLabel>
              <Select value={filters.mrpType} label="MRP Type" onChange={(e) => setFilters(prev => ({ ...prev, mrpType: e.target.value }))}>
                <MenuItem value="all">All MRP Types</MenuItem>
                <MenuItem value="VB">VB - Reorder Point</MenuItem>
                <MenuItem value="PD">PD - MRP</MenuItem>
                <MenuItem value="VM">VM - Auto Reorder</MenuItem>
                <MenuItem value="VV">VV - Forecast-based</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              placeholder="Search material..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              sx={{ width: 180 }}
            />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant={filters.showRecommendedOnly ? 'contained' : 'outlined'}
              onClick={() => setFilters(prev => ({ ...prev, showRecommendedOnly: !prev.showRecommendedOnly }))}
            >
              Recommendations Only
            </Button>
            <Button
              size="small"
              variant={filters.showModifiedOnly ? 'contained' : 'outlined'}
              onClick={() => setFilters(prev => ({ ...prev, showModifiedOnly: !prev.showModifiedOnly }))}
            >
              Modified Only
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Materials List */}
      <Box sx={{ mb: 12 }}>
        {filteredMaterials.map(m => (
          <MaterialCard key={getKey(m)} m={m} />
        ))}
        {filteredMaterials.length === 0 && !loading && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No materials match your filters</Typography>
          </Paper>
        )}
      </Box>

      {/* Action Bar (Sticky) */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: 'calc(100% - 320px)',
          maxWidth: 1200,
          zIndex: 1000,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            <strong style={{ color: theme.palette.primary.main }}>{selectedMaterials.size}</strong> selected
          </Typography>
          <Button size="small" variant="outlined" onClick={applyAllRecommendations}>
            Accept All Recommendations
          </Button>
          <Button size="small" variant="outlined" onClick={resetAll} startIcon={<RefreshIcon />}>
            Reset All
          </Button>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={saveAll} startIcon={<SaveIcon />}>
            Save All Changes
          </Button>
          <Button size="small" variant="contained" onClick={pushToSAP}>
            Push to SAP MRP
          </Button>
        </Stack>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MRPOptimizerDashboard;
