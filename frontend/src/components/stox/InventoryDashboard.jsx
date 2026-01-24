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
  Tabs,
  Tab,
  LinearProgress,
  Divider,
  useTheme,
  Tooltip,
  IconButton,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Analytics as AnalyticsIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Inventory as InventoryIcon,
  AttachMoney as AttachMoneyIcon,
  Loop as LoopIcon,
  TrackChanges as TrackChangesIcon,
  Warning as WarningIcon,
  Bolt as BoltIcon,
  GridView as GridViewIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as LocalShippingIcon,
  AccountBalance as AccountBalanceIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Savings as SavingsIcon,
  PieChart as PieChartIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { Line, Radar, Bar, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import stoxTheme from './stoxTheme';
import DataSourceChip from './DataSourceChip';
import { getTileDataConfig } from './stoxDataConfig';
import { LAM_PLANTS, LAM_MATERIALS, LAM_MATERIAL_PLANT_DATA, getPlantName, getMaterialById, MRP_TYPES } from '../../data/arizonaBeveragesMasterData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatCurrency = (value) => {
  if (value >= 1e9) return '$' + (value / 1e9).toFixed(1) + 'B';
  if (value >= 1e6) return '$' + (value / 1e6).toFixed(1) + 'M';
  if (value >= 1e3) return '$' + (value / 1e3).toFixed(0) + 'K';
  return '$' + value.toFixed(0);
};

const getStrategy = (abc, xyz) => {
  const strategies = {
    AX: 'JIT + Safety Stock',
    AY: 'Regular Monitoring',
    AZ: 'Make-to-Order',
    BX: 'Reorder Point',
    BY: 'Monthly Review',
    BZ: 'VMI / Consignment',
    CX: 'Min-Max',
    CY: 'Consolidate Orders',
    CZ: 'Consider Discontinue',
  };
  return strategies[abc + xyz] || 'Standard';
};

const getStrategyDescription = (abc, xyz) => {
  const descriptions = {
    AX: 'High-value items with stable demand. Implement JIT delivery with a small safety buffer. Focus on supplier reliability and lead time reduction.',
    AY: 'High-value items with variable demand. Maintain moderate safety stock and review forecasts regularly. Consider demand sensing for better predictions.',
    AZ: 'High-value items with erratic demand. Use make-to-order or assemble-to-order strategies. Minimize inventory while ensuring quick response capability.',
    BX: 'Medium-value items with stable demand. Use reorder point system with statistical safety stock. Automate replenishment where possible.',
    BY: 'Medium-value items with variable demand. Monthly review cycle with periodic adjustments. Balance inventory cost vs service level.',
    BZ: 'Medium-value items with erratic demand. Consider vendor-managed inventory or consignment. Shift risk to suppliers where feasible.',
    CX: 'Low-value items with stable demand. Simple min-max policies. Low management attention, bulk ordering to reduce transaction costs.',
    CY: 'Low-value items with variable demand. Consolidate with other orders. Accept higher relative variability to minimize management effort.',
    CZ: 'Low-value items with erratic demand. Review for potential discontinuation. If needed, use stocking agreements or spot purchases.',
  };
  return descriptions[abc + xyz] || 'Apply standard inventory management practices.';
};

// Generate material data using centralized Arizona Beverages data
const generateMaterialData = () => {
  // Build base materials from centralized data, expanding for each plant where data exists
  const baseMaterials = [];

  // Use data from LAM_MATERIAL_PLANT_DATA which has material-plant combinations
  LAM_MATERIAL_PLANT_DATA.forEach((plantData) => {
    const material = getMaterialById(plantData.materialId);
    if (material) {
      baseMaterials.push({
        id: `${plantData.materialId}-${plantData.plant}`,
        materialId: plantData.materialId,
        name: material.name,
        type: material.type,
        category: material.materialGroup,
        plant: plantData.plant,
        plantName: getPlantName(plantData.plant),
        price: material.basePrice,
        // Pre-populated from Excel data
        realStock: plantData.totalStock,
        realTurns: plantData.turns,
        realDOS: plantData.dos,
        realFillRate: plantData.fillRate,
        realABC: plantData.abc,
        realXYZ: plantData.xyz,
        realStockouts: plantData.stockouts,
        realExcess: plantData.excessStock,
        realMrpType: plantData.mrpType,
        realSafetyStock: plantData.safetyStock,
        realReorderPoint: plantData.reorderPoint,
        realLotSize: plantData.lotSize,
        realLeadTime: plantData.leadTime,
      });
    }
  });

  // Add additional materials not in plant data for variety
  const additionalMaterials = [
    { id: 'FG0006-1000', materialId: 'FG0006', name: 'Electrochemical Deposition - Phoenix', type: 'FERT', category: 'Deposition', plant: '1000', plantName: 'Keasbey NJ', price: 5500000 },
    { id: 'FG0007-2000', materialId: 'FG0007', name: 'AZ Arnold Palmer Bevel Etch Tool', type: 'FERT', category: 'Etch', plant: '2000', plantName: 'Santa Clarita CA', price: 6000000 },
    { id: 'SFG0010-1000', materialId: 'SFG0010', name: 'Endpoint Detection Module', type: 'HALB', category: 'Sensors', plant: '1000', plantName: 'Keasbey NJ', price: 48000 },
    { id: 'SFG0011-2000', materialId: 'SFG0011', name: 'Electrostatic Chuck Assembly', type: 'HALB', category: 'Chamber', plant: '2000', plantName: 'Santa Clarita CA', price: 95000 },
    { id: 'RAW0004-1000', materialId: 'RAW0004', name: 'Ceramic Insulator Ring', type: 'ROH', category: 'Ceramics', plant: '1000', plantName: 'Keasbey NJ', price: 320 },
    { id: 'RAW0005-2000', materialId: 'RAW0005', name: 'UHP O-Ring Kit Viton', type: 'ROH', category: 'Seals', plant: '2000', plantName: 'Santa Clarita CA', price: 85 },
    { id: 'RAW0010-1000', materialId: 'RAW0010', name: 'Hastelloy Bellows Assembly', type: 'ROH', category: 'Motion', plant: '1000', plantName: 'Keasbey NJ', price: 1250 },
  ];

  baseMaterials.push(...additionalMaterials);

  const materials = baseMaterials.map((mat, idx) => {
    // Use real data from Excel when available
    const hasRealData = mat.realStock !== undefined;

    const xyzPattern = mat.realXYZ === 'X' ? 0 : mat.realXYZ === 'Y' ? 1 : idx % 3;
    const baseConsumption = mat.type === 'FERT' ? Math.floor(Math.random() * 4) + 2 :
      mat.type === 'HALB' ? Math.floor(Math.random() * 40) + 20 :
        Math.floor(Math.random() * 200) + 80;

    const monthlyData = months.map((month, i) => {
      let variability = xyzPattern === 0 ? 0.1 : xyzPattern === 1 ? 0.35 : 0.7;
      const seasonal = 1 + 0.1 * Math.sin(2 * Math.PI * i / 12);
      const noise = 1 + (Math.random() - 0.5) * 2 * variability;
      const consumption = Math.max(1, Math.floor(baseConsumption * seasonal * noise));
      const receipts = Math.floor(consumption * (0.8 + Math.random() * 0.4));
      return { month, consumption, receipts };
    });

    const consumptionValues = monthlyData.map(d => d.consumption);
    const totalConsumption = consumptionValues.reduce((a, b) => a + b, 0);
    const avgConsumption = totalConsumption / 12;
    const variance = consumptionValues.reduce((sum, val) => sum + Math.pow(val - avgConsumption, 2), 0) / 12;
    const stdDev = Math.sqrt(variance);
    const cv = avgConsumption > 0 ? stdDev / avgConsumption : 0;
    const annualValue = totalConsumption * mat.price;

    // Use real XYZ from Excel if available, otherwise calculate
    const xyz = hasRealData ? mat.realXYZ : (cv < 0.5 ? 'X' : cv < 1.0 ? 'Y' : 'Z');

    // Use real stock from Excel if available
    const baseStock = hasRealData ? mat.realStock : (mat.type === 'FERT' ? Math.floor(Math.random() * 5) :
      mat.type === 'HALB' ? Math.floor(Math.random() * 60) + 20 :
        Math.floor(Math.random() * 400) + 100);

    // Use real lead time and MRP parameters if available
    const leadTime = hasRealData ? mat.realLeadTime : (Math.floor(Math.random() * 30) + 15);
    const currentSS = hasRealData ? mat.realSafetyStock : Math.floor(avgConsumption * (Math.random() * 0.8 + 0.3));
    const currentROP = hasRealData ? mat.realReorderPoint : (currentSS + Math.floor(avgConsumption * leadTime / 30));
    const currentLotSize = hasRealData ? mat.realLotSize : Math.floor(avgConsumption * (Math.random() * 2 + 1));

    const zScore = 1.65;
    const optSS = Math.floor(zScore * cv * avgConsumption * Math.sqrt(leadTime / 7));
    const optROP = optSS + Math.floor(avgConsumption * leadTime / 30 * 1.1);
    const holdingCost = mat.price * 0.25 / 12;
    const orderCost = mat.type === 'FERT' ? 5000 : mat.type === 'HALB' ? 500 : 50;
    const optLotSize = Math.floor(Math.sqrt(2 * avgConsumption * 12 * orderCost / holdingCost)) || 1;

    // Use real KPIs from Excel if available
    const turns = hasRealData ? mat.realTurns : (avgConsumption * 12 / (baseStock || 1));
    const dos = hasRealData ? mat.realDOS : (baseStock / (avgConsumption / 30 || 1));
    const fillRate = hasRealData ? mat.realFillRate : (92 + Math.random() * 7);
    const stockouts = hasRealData ? mat.realStockouts : Math.floor(Math.random() * 4);

    // Working Capital calculations
    const transitStock = Math.floor(baseStock * 0.08);
    const cycleStockValue = mat.price * (currentLotSize / 2);
    const safetyStockValue = mat.price * currentSS;
    const pipelineStockValue = mat.price * transitStock;
    const excessStockValue = mat.price * Math.max(0, baseStock - currentROP) * 0.3; // 30% of excess
    const totalWCValue = cycleStockValue + safetyStockValue + pipelineStockValue + excessStockValue;

    // WCP = Gross Margin $ / Avg Working Capital (simplified as annual value / total WC)
    const wcp = totalWCValue > 0 ? Math.round((annualValue * 0.35 / totalWCValue) * 100) / 100 : 0;
    // DIO = (Avg Inventory / COGS) * 365
    const dio = avgConsumption > 0 ? Math.round((baseStock / (avgConsumption * 12)) * 365) : 0;

    // Optimal WC calculations
    const optCycleStockValue = mat.price * (optLotSize / 2);
    const optSafetyStockValue = mat.price * optSS;
    const optTotalWC = optCycleStockValue + optSafetyStockValue + pipelineStockValue;
    const wcSavingsOpportunity = Math.max(0, totalWCValue - optTotalWC);
    const carryingCostSavings = Math.floor(wcSavingsOpportunity * 0.25); // 25% carrying cost

    // Use real excess from Excel if available
    const realExcessValue = hasRealData && mat.realExcess ? mat.realExcess : excessStockValue;

    return {
      ...mat,
      stock: baseStock,
      qiStock: Math.floor(baseStock * 0.05),
      blockedStock: Math.floor(baseStock * 0.02),
      transitStock,
      avgConsumption: Math.round(avgConsumption * 10) / 10,
      totalConsumption,
      annualValue,
      leadTime,
      stdDev: Math.round(stdDev * 100) / 100,
      cv: Math.round(cv * 1000) / 1000,
      xyz,
      mrpType: hasRealData ? mat.realMrpType : (mat.type === 'FERT' ? 'PD' : mat.type === 'HALB' ? 'PD' : 'VB'),
      mrpTypeName: hasRealData && MRP_TYPES[mat.realMrpType] ? MRP_TYPES[mat.realMrpType].name : 'MRP',
      presetABC: hasRealData ? mat.realABC : null, // Store real ABC for use after calculation
      current: { safetyStock: currentSS, reorderPoint: currentROP, lotSize: currentLotSize },
      optimized: { safetyStock: optSS, reorderPoint: optROP, lotSize: optLotSize },
      kpis: {
        turns: typeof turns === 'number' ? turns.toFixed(1) : turns,
        dos: Math.round(dos),
        fillRate: typeof fillRate === 'number' ? fillRate.toFixed(1) : fillRate,
        stockouts
      },
      monthlyData,
      healthScore: Math.floor(70 + Math.random() * 25),
      savingsPotential: Math.floor(Math.max(0, (currentSS - optSS) * mat.price * 0.25)),
      status: baseStock < currentROP ? 'critical' : baseStock < currentROP * 1.5 ? 'warning' : 'healthy',
      // Working Capital fields
      total_wc_value: Math.round(totalWCValue),
      cycle_stock_value: Math.round(cycleStockValue),
      safety_stock_value: Math.round(safetyStockValue),
      pipeline_stock_value: Math.round(pipelineStockValue),
      excess_stock_value: Math.round(excessStockValue),
      cycle_pct: totalWCValue > 0 ? Math.round((cycleStockValue / totalWCValue) * 100) : 0,
      safety_pct: totalWCValue > 0 ? Math.round((safetyStockValue / totalWCValue) * 100) : 0,
      pipeline_pct: totalWCValue > 0 ? Math.round((pipelineStockValue / totalWCValue) * 100) : 0,
      excess_pct: totalWCValue > 0 ? Math.round((excessStockValue / totalWCValue) * 100) : 0,
      wcp,
      dio,
      wc_savings_opportunity: Math.round(wcSavingsOpportunity),
      carrying_cost_savings: carryingCostSavings,
      optimal_wc: Math.round(optTotalWC),
    };
  });

  // Calculate ABC classification - use real ABC from Excel when available
  const sortedByValue = [...materials].sort((a, b) => b.annualValue - a.annualValue);
  const totalValue = sortedByValue.reduce((sum, m) => sum + m.annualValue, 0);
  let cumulativeValue = 0;

  sortedByValue.forEach((mat, idx) => {
    cumulativeValue += mat.annualValue;
    const cumulativePct = (cumulativeValue / totalValue) * 100;
    const original = materials.find(m => m.id === mat.id);
    // Use preset ABC from Excel if available, otherwise calculate
    original.abc = original.presetABC || (cumulativePct <= 80 ? 'A' : cumulativePct <= 95 ? 'B' : 'C');
    original.valueRank = idx + 1;
    original.cumulativeValuePct = Math.round(cumulativePct * 10) / 10;
    original.valueContributionPct = Math.round((mat.annualValue / totalValue) * 1000) / 10;
  });

  return materials;
};

// ABC/XYZ Matrix component
const ABCXYZMatrix = ({ data, filters, onCellClick, theme }) => {
  const matrix = [
    { abc: 'A', xyz: 'X', strategy: 'JIT + Safety Stock', color: theme.palette.success.main },
    { abc: 'A', xyz: 'Y', strategy: 'Regular Monitoring', color: theme.palette.info.main },
    { abc: 'A', xyz: 'Z', strategy: 'Make-to-Order', color: theme.palette.warning.main },
    { abc: 'B', xyz: 'X', strategy: 'Reorder Point', color: theme.palette.info.main },
    { abc: 'B', xyz: 'Y', strategy: 'Monthly Review', color: theme.palette.primary.main },
    { abc: 'B', xyz: 'Z', strategy: 'VMI / Consignment', color: theme.palette.warning.main },
    { abc: 'C', xyz: 'X', strategy: 'Min-Max', color: theme.palette.success.main },
    { abc: 'C', xyz: 'Y', strategy: 'Consolidate Orders', color: theme.palette.primary.main },
    { abc: 'C', xyz: 'Z', strategy: 'Consider Discontinue', color: theme.palette.error.main },
  ];

  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <GridViewIcon sx={{ color: theme.palette.primary.main }} />
        <Typography variant="subtitle1" fontWeight={600}>ABC/XYZ Matrix</Typography>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: '50px repeat(3, 1fr)', gap: 0.5 }}>
        <Box />
        {['X (Stable)', 'Y (Variable)', 'Z (Erratic)'].map(label => (
          <Typography key={label} variant="caption" sx={{ textAlign: 'center', color: 'text.secondary', fontSize: '0.65rem' }}>
            {label}
          </Typography>
        ))}

        {['A', 'B', 'C'].map(abc => (
          <React.Fragment key={abc}>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontSize: '0.65rem' }}>
              {abc} ({abc === 'A' ? 'High $' : abc === 'B' ? 'Med $' : 'Low $'})
            </Typography>
            {['X', 'Y', 'Z'].map(xyz => {
              const cell = matrix.find(c => c.abc === abc && c.xyz === xyz);
              const count = data.filter(m => m.abc === abc && m.xyz === xyz).length;
              const isActive = filters.abc === abc && filters.xyz === xyz;

              return (
                <Box
                  key={xyz}
                  onClick={() => onCellClick(abc, xyz)}
                  sx={{
                    aspectRatio: '1',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    bgcolor: alpha(cell.color, 0.15),
                    border: isActive ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      bgcolor: alpha(cell.color, 0.25),
                    },
                  }}
                >
                  <Typography variant="h6" fontWeight={700}>{count}</Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.55rem', opacity: 0.8, textAlign: 'center', px: 0.5 }}>
                    {cell.strategy}
                  </Typography>
                </Box>
              );
            })}
          </React.Fragment>
        ))}
      </Box>
    </Card>
  );
};

const InventoryDashboard = ({ onBack, onTileClick }) => {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: 'all', plant: 'all', status: 'all', abc: null, xyz: null, search: '' });
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const tileConfig = getTileDataConfig('inventory-dashboard');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setData(generateMaterialData());
      setLoading(false);
    }, 800);
  }, []);

  const kpis = useMemo(() => {
    if (!data.length) return null;
    const totalInventoryValue = data.reduce((sum, m) => sum + m.stock * m.price, 0);
    const avgTurns = (data.reduce((sum, m) => sum + parseFloat(m.kpis.turns), 0) / data.length).toFixed(1);
    const avgFillRate = (data.reduce((sum, m) => sum + parseFloat(m.kpis.fillRate), 0) / data.length).toFixed(1);
    const atRiskItems = data.filter(m => m.status !== 'healthy').length;
    const criticalItems = data.filter(m => m.status === 'critical').length;
    const totalSavings = data.reduce((sum, m) => sum + m.savingsPotential, 0);

    // Working Capital KPIs
    const totalWC = data.reduce((sum, m) => sum + m.total_wc_value, 0);
    const avgWCP = (data.reduce((sum, m) => sum + m.wcp, 0) / data.length).toFixed(2);
    const avgDIO = Math.round(data.reduce((sum, m) => sum + m.dio, 0) / data.length);
    const totalWCSavings = data.reduce((sum, m) => sum + m.wc_savings_opportunity, 0);

    return [
      { label: 'Total SKUs', value: data.length, subtext: 'Across 3 plants', icon: InventoryIcon, color: theme.palette.primary.main },
      { label: 'Total Inventory', value: formatCurrency(totalInventoryValue), subtext: 'Current valuation', icon: AttachMoneyIcon, color: theme.palette.primary.main, trend: -3.2 },
      { label: 'Total WC Tied', value: formatCurrency(totalWC), subtext: `DIO: ${avgDIO} days`, icon: AccountBalanceIcon, color: '#106ebe' },
      { label: 'Avg WCP', value: avgWCP + 'x', subtext: 'Working Capital Productivity', icon: SpeedIcon, color: '#0078d4' },
      { label: 'Avg Turns', value: avgTurns + 'x', subtext: 'Annual turnover', icon: LoopIcon, color: theme.palette.success.main, trend: 5.1 },
      { label: 'Avg Fill Rate', value: avgFillRate + '%', subtext: 'Service level', icon: TrackChangesIcon, color: theme.palette.success.main },
      { label: 'At Risk Items', value: atRiskItems, subtext: `${criticalItems} critical`, icon: WarningIcon, color: theme.palette.warning.main },
      { label: 'WC Savings', value: formatCurrency(totalWCSavings), subtext: 'AI-optimized', icon: SavingsIcon, color: theme.palette.success.main },
    ];
  }, [data, theme]);

  const filteredData = useMemo(() => {
    return data.filter(m => {
      if (filters.type !== 'all' && m.type !== filters.type) return false;
      if (filters.plant !== 'all' && m.plant !== filters.plant) return false;
      if (filters.status !== 'all' && m.status !== filters.status) return false;
      if (filters.abc && m.abc !== filters.abc) return false;
      if (filters.xyz && m.xyz !== filters.xyz) return false;
      if (filters.search && !m.id.toLowerCase().includes(filters.search.toLowerCase()) &&
        !m.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [data, filters]);

  const handleMatrixClick = (abc, xyz) => {
    if (filters.abc === abc && filters.xyz === xyz) {
      setFilters(prev => ({ ...prev, abc: null, xyz: null }));
    } else {
      setFilters(prev => ({ ...prev, abc, xyz }));
    }
  };

  const handleRowClick = (params) => {
    setSelectedMaterial(params.row);
    setActiveTab(0);
  };

  const handleBackToList = () => {
    setSelectedMaterial(null);
  };

  const clearFilters = () => {
    setFilters({ type: 'all', plant: 'all', status: 'all', abc: null, xyz: null, search: '' });
  };

  const typeLabels = { FERT: 'Finished', HALB: 'Semi-Fin', ROH: 'Raw Mat', HAWA: 'Trade' };

  const columns = [
    {
      field: 'id',
      headerName: 'Material',
      width: 180,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>{params.row.id}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {params.row.name}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={typeLabels[params.value]}
          size="small"
          sx={{
            bgcolor: alpha(
              params.value === 'FERT' ? theme.palette.info.main :
                params.value === 'HALB' ? theme.palette.primary.main :
                  params.value === 'ROH' ? theme.palette.warning.main :
                    theme.palette.success.main,
              0.12
            ),
            color: params.value === 'FERT' ? theme.palette.info.dark :
              params.value === 'HALB' ? theme.palette.primary.dark :
                params.value === 'ROH' ? theme.palette.warning.dark :
                  theme.palette.success.dark,
            fontWeight: 600,
            fontSize: '0.7rem',
          }}
        />
      ),
    },
    { field: 'plant', headerName: 'Plant', width: 80, align: 'center', headerAlign: 'center' },
    { field: 'stock', headerName: 'Stock', width: 80, align: 'right', headerAlign: 'right' },
    {
      field: 'stockValue',
      headerName: 'Stock Value',
      width: 110,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (params) => params.row.stock * params.row.price,
      renderCell: (params) => formatCurrency(params.row.stock * params.row.price),
    },
    { field: 'avgConsumption', headerName: 'Avg Cons/Mo', width: 100, align: 'right', headerAlign: 'right' },
    {
      field: 'turns',
      headerName: 'Turns',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (params) => params.row.kpis.turns,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: parseFloat(params.row.kpis.turns) >= 6 ? theme.palette.success.main : parseFloat(params.row.kpis.turns) >= 3 ? theme.palette.warning.main : theme.palette.error.main }}>
          {params.row.kpis.turns}x
        </Typography>
      ),
    },
    {
      field: 'dos',
      headerName: 'DOS',
      width: 70,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (params) => params.row.kpis.dos,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: params.row.kpis.dos <= 60 ? theme.palette.success.main : params.row.kpis.dos <= 90 ? theme.palette.warning.main : theme.palette.error.main }}>
          {params.row.kpis.dos}d
        </Typography>
      ),
    },
    {
      field: 'fillRate',
      headerName: 'Fill Rate',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (params) => params.row.kpis.fillRate,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: parseFloat(params.row.kpis.fillRate) >= 95 ? theme.palette.success.main : parseFloat(params.row.kpis.fillRate) >= 90 ? theme.palette.warning.main : theme.palette.error.main }}>
          {params.row.kpis.fillRate}%
        </Typography>
      ),
    },
    {
      field: 'abc',
      headerName: 'ABC',
      width: 60,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip label={params.value} size="small" sx={{ minWidth: 28, height: 24, fontWeight: 700, fontSize: '0.7rem', bgcolor: alpha(params.value === 'A' ? theme.palette.error.main : params.value === 'B' ? theme.palette.warning.main : theme.palette.text.secondary, 0.15), color: params.value === 'A' ? theme.palette.error.main : params.value === 'B' ? theme.palette.warning.main : theme.palette.text.secondary }} />
      ),
    },
    {
      field: 'xyz',
      headerName: 'XYZ',
      width: 60,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip label={params.value} size="small" sx={{ minWidth: 28, height: 24, fontWeight: 700, fontSize: '0.7rem', bgcolor: alpha(params.value === 'X' ? theme.palette.success.main : params.value === 'Y' ? theme.palette.info.main : theme.palette.primary.main, 0.15), color: params.value === 'X' ? theme.palette.success.main : params.value === 'Y' ? theme.palette.info.main : theme.palette.primary.main }} />
      ),
    },
    { field: 'cv', headerName: 'CV', width: 70, align: 'center', headerAlign: 'center' },
    {
      field: 'healthScore',
      headerName: 'Health',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 50, height: 6, bgcolor: alpha(theme.palette.divider, 0.3), borderRadius: 1, overflow: 'hidden' }}>
            <Box sx={{ width: `${params.value}%`, height: '100%', bgcolor: params.value >= 85 ? theme.palette.success.main : params.value >= 70 ? theme.palette.warning.main : theme.palette.error.main, borderRadius: 1 }} />
          </Box>
          <Typography variant="caption">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip label={params.value.charAt(0).toUpperCase() + params.value.slice(1)} size="small" color={params.value === 'healthy' ? 'success' : params.value === 'warning' ? 'warning' : 'error'} sx={{ fontSize: '0.7rem', fontWeight: 600 }} />
      ),
    },
    {
      field: 'savingsPotential',
      headerName: 'Savings',
      width: 100,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: params.value > 0 ? theme.palette.success.main : 'inherit' }}>
          {params.value > 0 ? formatCurrency(params.value) : '-'}
        </Typography>
      ),
    },
    // Working Capital columns
    {
      field: 'total_wc_value',
      headerName: 'Total WC ($)',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Chip
          label={formatCurrency(params.value)}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: alpha('#106ebe', 0.12),
            color: '#106ebe',
            fontSize: '0.7rem',
          }}
        />
      ),
    },
    {
      field: 'wcp',
      headerName: 'WCP',
      width: 70,
      align: 'center',
      headerAlign: 'center',
      description: 'Working Capital Productivity = GM$ / Avg WC',
      renderCell: (params) => (
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            color: params.value >= 4 ? theme.palette.success.main :
              params.value >= 2 ? '#0078d4' : theme.palette.warning.main
          }}
        >
          {params.value.toFixed(1)}x
        </Typography>
      ),
    },
    {
      field: 'dio',
      headerName: 'DIO',
      width: 70,
      align: 'center',
      headerAlign: 'center',
      description: 'Days Inventory Outstanding',
      renderCell: (params) => (
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            color: params.value > 60 ? theme.palette.error.main :
              params.value > 30 ? theme.palette.warning.main : theme.palette.success.main
          }}
        >
          {params.value}d
        </Typography>
      ),
    },
  ];

  // Chart configurations
  const getRadarChartData = (material) => ({
    labels: ['Fill Rate', 'Turns', 'DOS Efficiency', 'Stock Health', 'Cost Efficiency'],
    datasets: [{
      data: [
        parseFloat(material.kpis.fillRate),
        Math.min(parseFloat(material.kpis.turns) * 10, 100),
        Math.max(0, 100 - material.kpis.dos / 3),
        material.healthScore,
        Math.max(0, 100 - (material.savingsPotential / (material.stock * material.price || 1) * 100))
      ],
      backgroundColor: alpha(theme.palette.success.main, 0.2),
      borderColor: theme.palette.success.main,
      borderWidth: 2,
      pointBackgroundColor: theme.palette.success.main
    }]
  });

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { color: theme.palette.text.secondary, backdropColor: 'transparent' },
        grid: { color: theme.palette.divider },
        angleLines: { color: theme.palette.divider },
        pointLabels: { color: theme.palette.text.secondary, font: { size: 11 } }
      }
    },
    plugins: { legend: { display: false } }
  };

  const getConsumptionChartData = (material) => {
    let inv = 220;
    const sawtoothData = [];
    const receiptsData = [];
    const consumptionData = material.monthlyData.map(d => d.consumption);

    material.monthlyData.forEach((d, i) => {
      inv -= d.consumption * 0.8;
      if (i % 2 === 1) {
        const receipt = d.consumption * 2 + Math.random() * 50;
        receiptsData.push(Math.round(receipt));
        inv += receipt;
      } else {
        receiptsData.push(0);
      }
      sawtoothData.push(Math.max(50, Math.round(inv)));
    });

    return {
      labels: months,
      datasets: [
        { label: 'Inventory Level', data: sawtoothData, borderColor: theme.palette.primary.main, backgroundColor: alpha(theme.palette.primary.main, 0.1), fill: true, tension: 0, borderWidth: 2, pointRadius: 0 },
        { label: 'Receipts (AI Optimized)', data: receiptsData, borderColor: theme.palette.success.main, backgroundColor: theme.palette.success.main, pointStyle: 'circle', pointRadius: 6, pointHoverRadius: 8, showLine: true, tension: 0, borderWidth: 2 },
        { label: 'Consumption', data: consumptionData, borderColor: theme.palette.error.main, borderDash: [5, 5], pointStyle: 'crossRot', pointRadius: 5, tension: 0.3, borderWidth: 2, fill: false }
      ]
    };
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    scales: {
      x: { grid: { color: theme.palette.divider }, ticks: { color: theme.palette.text.secondary } },
      y: { grid: { color: theme.palette.divider }, ticks: { color: theme.palette.text.secondary }, title: { display: true, text: 'Units', color: theme.palette.text.secondary } }
    },
    plugins: { legend: { position: 'top', align: 'end', labels: { color: theme.palette.text.secondary, usePointStyle: true, padding: 20 } } }
  };

  // Detail View Render
  const renderDetailView = () => {
    if (!selectedMaterial) return null;
    const mat = selectedMaterial;

    return (
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList} variant="outlined" size="small" sx={{ mb: 2 }}>
          Back to List
        </Button>

        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <Typography variant="h5" fontWeight={700} sx={{ fontFamily: 'monospace' }}>{mat.id}</Typography>
                <Chip label={typeLabels[mat.type]} size="small" color="primary" variant="outlined" />
                <Chip label={mat.status.charAt(0).toUpperCase() + mat.status.slice(1)} size="small" color={mat.status === 'healthy' ? 'success' : mat.status === 'warning' ? 'warning' : 'error'} />
                <Chip label={mat.abc} size="small" sx={{ bgcolor: alpha(mat.abc === 'A' ? theme.palette.error.main : mat.abc === 'B' ? theme.palette.warning.main : theme.palette.text.secondary, 0.15) }} />
                <Chip label={mat.xyz} size="small" sx={{ bgcolor: alpha(mat.xyz === 'X' ? theme.palette.success.main : mat.xyz === 'Y' ? theme.palette.info.main : theme.palette.primary.main, 0.15) }} />
              </Stack>
              <Typography variant="body2" color="text.secondary">{mat.name}</Typography>
            </Box>
            <Stack direction="row" spacing={3} alignItems="center">
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">Plant</Typography>
                <Typography variant="body2" fontWeight={600}>{mat.plant} - {mat.plantName}</Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">Unit Price</Typography>
                <Typography variant="body2" fontWeight={600}>{formatCurrency(mat.price)}</Typography>
              </Box>
            </Stack>
          </Stack>
        </Paper>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tab label="Overview" />
          <Tab label="Working Capital" />
          <Tab label="ABC/XYZ Analysis" />
          <Tab label="Consumption" />
          <Tab label="Optimization" />
          <Tab label="KPIs" />
        </Tabs>

        {/* Tab 0: Overview */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <InventoryIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight={600}>Stock Position</Typography>
                </Stack>
                {[
                  { label: 'Unrestricted', value: mat.stock, color: 'text.primary' },
                  { label: 'Quality Inspection', value: mat.qiStock, color: 'warning.main' },
                  { label: 'Blocked', value: mat.blockedStock, color: 'error.main' },
                  { label: 'In Transit', value: mat.transitStock, color: 'info.main' },
                ].map((item, i) => (
                  <Stack key={i} direction="row" justifyContent="space-between" sx={{ py: 1, borderBottom: i < 3 ? 1 : 0, borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: item.color }}>{item.value}</Typography>
                  </Stack>
                ))}
                <Stack direction="row" justifyContent="space-between" sx={{ pt: 2, mt: 1, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" fontWeight={600}>Total Value</Typography>
                  <Typography variant="body1" fontWeight={700} color="primary.main">{formatCurrency((mat.stock + mat.qiStock + mat.transitStock) * mat.price)}</Typography>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <CheckCircleIcon sx={{ color: 'success.main' }} />
                  <Typography variant="subtitle1" fontWeight={600}>Health Score: {mat.healthScore}/100</Typography>
                </Stack>
                <Box sx={{ height: 250 }}>
                  <Radar data={getRadarChartData(mat)} options={radarOptions} />
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                {[
                  { icon: LoopIcon, label: 'Inventory Turns', value: mat.kpis.turns + 'x', color: 'primary.main' },
                  { icon: TrackChangesIcon, label: 'Days of Supply', value: mat.kpis.dos + 'd', color: 'warning.main' },
                  { icon: CheckCircleIcon, label: 'Fill Rate', value: mat.kpis.fillRate + '%', color: 'success.main' },
                  { icon: LocalShippingIcon, label: 'Lead Time', value: mat.leadTime + 'd', color: 'info.main' },
                ].map((item, i) => (
                  <Card key={i} sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <item.icon sx={{ fontSize: 18, color: item.color }} />
                        <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight={700}>{item.value}</Typography>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Grid>
          </Grid>
        )}

        {/* Tab 1: Working Capital */}
        {activeTab === 1 && (
          <>
            {/* WC Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                { label: 'Total WC Tied', value: formatCurrency(mat.total_wc_value), icon: AccountBalanceIcon, color: '#106ebe' },
                { label: 'WCP (Productivity)', value: mat.wcp.toFixed(2) + 'x', icon: SpeedIcon, color: mat.wcp >= 4 ? theme.palette.success.main : mat.wcp >= 2 ? '#0078d4' : theme.palette.warning.main },
                { label: 'DIO (Days)', value: mat.dio + ' days', icon: TimelineIcon, color: mat.dio > 60 ? theme.palette.error.main : mat.dio > 30 ? theme.palette.warning.main : theme.palette.success.main },
                { label: 'WC Savings', value: formatCurrency(mat.wc_savings_opportunity), icon: SavingsIcon, color: theme.palette.success.main },
              ].map((item, i) => (
                <Grid item xs={6} md={3} key={i}>
                  <Card sx={{ p: 2.5, background: `linear-gradient(135deg, ${alpha(item.color, 0.1)} 0%, ${alpha(item.color, 0.05)} 100%)` }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <item.icon sx={{ color: item.color, fontSize: 20 }} />
                      <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    </Stack>
                    <Typography variant="h5" fontWeight={700} sx={{ color: item.color }}>{item.value}</Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* WC Decomposition Bar */}
            <Card sx={{ p: 3, mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <PieChartIcon sx={{ color: '#64748b' }} />
                <Typography variant="subtitle1" fontWeight={600}>Working Capital Decomposition</Typography>
              </Stack>
              <Box sx={{ display: 'flex', height: 32, borderRadius: 1, overflow: 'hidden', mb: 2 }}>
                {[
                  { label: 'Cycle Stock', value: mat.cycle_stock_value, pct: mat.cycle_pct, color: '#2b88d8' },
                  { label: 'Safety Stock', value: mat.safety_stock_value, pct: mat.safety_pct, color: '#0078d4' },
                  { label: 'Pipeline Stock', value: mat.pipeline_stock_value, pct: mat.pipeline_pct, color: '#06b6d4' },
                  { label: 'Excess Stock', value: mat.excess_stock_value, pct: mat.excess_pct, color: '#ef4444' },
                ].map((seg, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      width: `${seg.pct}%`,
                      bgcolor: seg.color,
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.8 },
                    }}
                    title={`${seg.label}: ${formatCurrency(seg.value)} (${seg.pct}%)`}
                  />
                ))}
              </Box>
              <Stack direction="row" spacing={4} justifyContent="center" flexWrap="wrap">
                {[
                  { label: 'Cycle Stock', value: mat.cycle_stock_value, pct: mat.cycle_pct, color: '#2b88d8' },
                  { label: 'Safety Stock', value: mat.safety_stock_value, pct: mat.safety_pct, color: '#0078d4' },
                  { label: 'Pipeline', value: mat.pipeline_stock_value, pct: mat.pipeline_pct, color: '#06b6d4' },
                  { label: 'Excess', value: mat.excess_stock_value, pct: mat.excess_pct, color: '#ef4444' },
                ].map((seg, idx) => (
                  <Stack key={idx} direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: seg.color }} />
                    <Typography variant="body2">
                      {seg.label}: <strong>{formatCurrency(seg.value)}</strong> ({seg.pct}%)
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Card>

            {/* Current vs Optimal WC */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2.5, bgcolor: alpha('#106ebe', 0.05) }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Current State</Typography>
                  <Stack spacing={1.5}>
                    {[
                      { label: 'Total Working Capital', value: formatCurrency(mat.total_wc_value), bold: true },
                      { label: 'Cycle Stock', value: `${formatCurrency(mat.cycle_stock_value)} (${mat.cycle_pct}%)` },
                      { label: 'Safety Stock', value: `${formatCurrency(mat.safety_stock_value)} (${mat.safety_pct}%)` },
                      { label: 'Pipeline Stock', value: `${formatCurrency(mat.pipeline_stock_value)} (${mat.pipeline_pct}%)` },
                      { label: 'Excess Stock', value: `${formatCurrency(mat.excess_stock_value)} (${mat.excess_pct}%)`, color: mat.excess_stock_value > 0 ? theme.palette.error.main : theme.palette.success.main },
                    ].map((item, i) => (
                      <Stack key={i} direction="row" justifyContent="space-between" sx={{ py: 0.5, borderBottom: i < 4 ? 1 : 0, borderColor: 'divider' }}>
                        <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                        <Typography variant="body2" fontWeight={item.bold ? 700 : 400} sx={{ color: item.color || 'text.primary' }}>{item.value}</Typography>
                      </Stack>
                    ))}
                    <Divider />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">WCP (Productivity)</Typography>
                      <Chip label={`${mat.wcp.toFixed(2)}x`} size="small" color={mat.wcp >= 4 ? 'success' : mat.wcp >= 2 ? 'primary' : 'warning'} sx={{ fontWeight: 700 }} />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">DIO (Days)</Typography>
                      <Typography variant="body2" fontWeight={600}>{mat.dio} days</Typography>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2.5, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Optimal vs Current</Typography>
                  <Stack spacing={1.5}>
                    {[
                      { label: 'Optimal Total WC', value: formatCurrency(mat.optimal_wc), bold: true },
                      { label: 'Optimal Safety Stock', value: formatCurrency(mat.optimized.safetyStock * mat.price) },
                      { label: 'Optimal Cycle Stock', value: formatCurrency(mat.optimized.lotSize * mat.price / 2) },
                    ].map((item, i) => (
                      <Stack key={i} direction="row" justifyContent="space-between" sx={{ py: 0.5, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                        <Typography variant="body2" fontWeight={item.bold ? 700 : 400}>{item.value}</Typography>
                      </Stack>
                    ))}
                    <Box sx={{ pt: 1.5, mt: 1 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ color: theme.palette.success.main }}>WC Savings Opportunity</Typography>
                        <Chip label={formatCurrency(mat.wc_savings_opportunity)} size="small" color="success" sx={{ fontWeight: 700 }} />
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Annual Carrying Savings</Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.success.main }}>{formatCurrency(mat.carrying_cost_savings)}/yr</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </>
        )}

        {/* Tab 2: ABC/XYZ Analysis */}
        {activeTab === 2 && (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                { label: 'ABC Class (Value)', value: mat.abc, desc: mat.abc === 'A' ? 'High Value' : mat.abc === 'B' ? 'Medium Value' : 'Low Value', color: mat.abc === 'A' ? 'error.main' : mat.abc === 'B' ? 'warning.main' : 'text.secondary' },
                { label: 'XYZ Class (Variability)', value: mat.xyz, desc: mat.xyz === 'X' ? 'Stable Demand' : mat.xyz === 'Y' ? 'Variable Demand' : 'Erratic Demand', color: mat.xyz === 'X' ? 'success.main' : mat.xyz === 'Y' ? 'info.main' : 'primary.main' },
                { label: 'Combined Class', value: mat.abc + mat.xyz, desc: getStrategy(mat.abc, mat.xyz), color: 'primary.main', special: true },
              ].map((item, i) => (
                <Grid item xs={12} md={4} key={i}>
                  <Card sx={{ p: 3, textAlign: 'center', ...(item.special && { bgcolor: alpha(theme.palette.primary.main, 0.05), border: 1, borderColor: alpha(theme.palette.primary.main, 0.2) }) }}>
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    <Typography variant="h3" fontWeight={800} sx={{ color: item.color, my: 1 }}>{item.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                { label: 'Annual Value', value: formatCurrency(mat.annualValue) },
                { label: 'Value Rank', value: `#${mat.valueRank} of ${data.length}` },
                { label: 'Value Contribution', value: `${mat.valueContributionPct}%` },
                { label: 'Avg Monthly Qty', value: mat.avgConsumption },
                { label: 'Std Deviation (σ)', value: mat.stdDev },
                { label: 'CV (σ/μ)', value: mat.cv, color: mat.xyz === 'X' ? 'success.main' : mat.xyz === 'Y' ? 'info.main' : 'primary.main' },
              ].map((item, i) => (
                <Grid item xs={6} md={2} key={i}>
                  <Card sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    <Typography variant="h6" fontWeight={700} sx={{ color: item.color || 'text.primary' }}>{item.value}</Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pareto and CV Distribution Charts */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>ABC Analysis (Pareto - Value Based)</Typography>
                  <Box sx={{ height: 280 }}>
                    {(() => {
                      const sortedMats = [...data].sort((a, b) => b.annualValue - a.annualValue).slice(0, 15);
                      let cumPct = 0;
                      const cumData = sortedMats.map(m => {
                        cumPct += m.valueContributionPct;
                        return cumPct;
                      });
                      return (
                        <Bar
                          data={{
                            labels: sortedMats.map(m => m.id),
                            datasets: [
                              {
                                type: 'bar',
                                label: 'Annual Value',
                                data: sortedMats.map(m => m.annualValue),
                                backgroundColor: sortedMats.map(m =>
                                  m.id === mat.id ? '#10b981' :
                                  m.abc === 'A' ? alpha('#f43f5e', 0.6) :
                                  m.abc === 'B' ? alpha('#f59e0b', 0.6) : alpha('#64748b', 0.6)
                                ),
                                borderColor: sortedMats.map(m => m.id === mat.id ? '#10b981' : 'transparent'),
                                borderWidth: sortedMats.map(m => m.id === mat.id ? 2 : 0),
                                yAxisID: 'y'
                              },
                              {
                                type: 'line',
                                label: 'Cumulative %',
                                data: cumData,
                                borderColor: '#06b6d4',
                                borderWidth: 2,
                                pointRadius: 0,
                                yAxisID: 'y1'
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              x: { grid: { display: false }, ticks: { color: theme.palette.text.secondary, font: { size: 9 }, maxRotation: 45 } },
                              y: {
                                position: 'left',
                                grid: { color: theme.palette.divider },
                                ticks: { color: theme.palette.text.secondary, callback: v => formatCurrency(v) }
                              },
                              y1: {
                                position: 'right',
                                min: 0,
                                max: 100,
                                grid: { display: false },
                                ticks: { color: '#06b6d4', callback: v => v + '%' }
                              }
                            },
                            plugins: { legend: { display: false } }
                          }}
                        />
                      );
                    })()}
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>XYZ Analysis (CV Distribution)</Typography>
                  <Box sx={{ height: 280 }}>
                    <Scatter
                      data={{
                        datasets: [{
                          label: 'Materials',
                          data: data.map(m => ({ x: m.cv, y: m.annualValue / 1000000 })),
                          backgroundColor: data.map(m =>
                            m.id === mat.id ? '#10b981' :
                            m.xyz === 'X' ? alpha('#10b981', 0.6) :
                            m.xyz === 'Y' ? alpha('#06b6d4', 0.6) : alpha('#8b5cf6', 0.6)
                          ),
                          pointRadius: data.map(m => m.id === mat.id ? 12 : 6),
                          pointBorderColor: data.map(m => m.id === mat.id ? '#ffffff' : 'transparent'),
                          pointBorderWidth: data.map(m => m.id === mat.id ? 3 : 0)
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: {
                            title: { display: true, text: 'Coefficient of Variation (CV)', color: theme.palette.text.secondary },
                            grid: { color: theme.palette.divider },
                            ticks: { color: theme.palette.text.secondary }
                          },
                          y: {
                            title: { display: true, text: 'Annual Value ($M)', color: theme.palette.text.secondary },
                            grid: { color: theme.palette.divider },
                            ticks: { color: theme.palette.text.secondary }
                          }
                        },
                        plugins: { legend: { display: false } }
                      }}
                    />
                  </Box>
                </Card>
              </Grid>
            </Grid>

            {/* Variability Bands Chart */}
            <Card sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Monthly Consumption with Variability Bands</Typography>
              <Box sx={{ height: 280 }}>
                {(() => {
                  const upperBand = mat.monthlyData.map(() => mat.avgConsumption + mat.stdDev);
                  const lowerBand = mat.monthlyData.map(() => Math.max(0, mat.avgConsumption - mat.stdDev));
                  return (
                    <Bar
                      data={{
                        labels: months,
                        datasets: [
                          {
                            type: 'line',
                            label: 'Upper Band (+1σ)',
                            data: upperBand,
                            borderColor: alpha('#8b5cf6', 0.5),
                            backgroundColor: alpha('#8b5cf6', 0.1),
                            fill: '+1',
                            borderWidth: 1,
                            pointRadius: 0
                          },
                          {
                            type: 'line',
                            label: 'Mean (μ)',
                            data: mat.monthlyData.map(() => mat.avgConsumption),
                            borderColor: '#fbbf24',
                            borderDash: [5, 5],
                            borderWidth: 2,
                            pointRadius: 0,
                            fill: false
                          },
                          {
                            type: 'line',
                            label: 'Lower Band (-1σ)',
                            data: lowerBand,
                            borderColor: alpha('#8b5cf6', 0.5),
                            backgroundColor: 'transparent',
                            borderWidth: 1,
                            pointRadius: 0,
                            fill: false
                          },
                          {
                            type: 'bar',
                            label: 'Actual Consumption',
                            data: mat.monthlyData.map(d => d.consumption),
                            borderColor: '#06b6d4',
                            backgroundColor: alpha('#06b6d4', 0.3),
                            borderWidth: 1
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: { grid: { color: theme.palette.divider }, ticks: { color: theme.palette.text.secondary } },
                          y: { grid: { color: theme.palette.divider }, ticks: { color: theme.palette.text.secondary } }
                        },
                        plugins: {
                          legend: {
                            position: 'top',
                            labels: { color: theme.palette.text.secondary, usePointStyle: true }
                          }
                        }
                      }}
                    />
                  );
                })()}
              </Box>
            </Card>

            <Card sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), border: 1, borderColor: alpha(theme.palette.primary.main, 0.2) }}>
              <Typography variant="subtitle1" fontWeight={600} color="primary.main" sx={{ mb: 1 }}>
                Recommended Strategy for {mat.abc}{mat.xyz}: {getStrategy(mat.abc, mat.xyz)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {getStrategyDescription(mat.abc, mat.xyz)}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Service Level Target:</Typography>
                  <Typography variant="body2" fontWeight={600}>{mat.abc === 'A' ? '99%' : mat.abc === 'B' ? '95%' : '90%'}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Review Frequency:</Typography>
                  <Typography variant="body2" fontWeight={600}>{mat.xyz === 'X' ? 'Weekly' : mat.xyz === 'Y' ? 'Monthly' : 'Quarterly'}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Planning Approach:</Typography>
                  <Typography variant="body2" fontWeight={600}>{mat.abc === 'A' ? 'Detailed' : mat.abc === 'B' ? 'Standard' : 'Simplified'}</Typography>
                </Grid>
              </Grid>
            </Card>
          </>
        )}

        {/* Tab 3: Consumption */}
        {activeTab === 3 && (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>AI-Optimized Planning: Lean Inventory ({mat.id})</Typography>
                  <Box sx={{ height: 280 }}>
                    <Line data={getConsumptionChartData(mat)} options={lineChartOptions} />
                  </Box>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Daily Consumption Volatility (30 Days)</Typography>
                  <Box sx={{ height: 280 }}>
                    <Line
                      data={{
                        labels: Array.from({ length: 30 }, (_, i) => i + 1),
                        datasets: [{
                          label: 'Daily Usage',
                          data: Array.from({ length: 30 }, () =>
                            Math.max(0, Math.floor(mat.avgConsumption / 30 * (1 + (Math.random() - 0.5) * 2 * mat.cv)))
                          ),
                          borderColor: '#8b5cf6',
                          backgroundColor: alpha('#8b5cf6', 0.2),
                          fill: true,
                          tension: 0.4,
                          borderWidth: 2
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: {
                            grid: { color: theme.palette.divider },
                            ticks: { color: theme.palette.text.secondary },
                            title: { display: true, text: 'Day', color: theme.palette.text.secondary }
                          },
                          y: { grid: { color: theme.palette.divider }, ticks: { color: theme.palette.text.secondary } }
                        },
                        plugins: { legend: { display: false } }
                      }}
                    />
                  </Box>
                </Card>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              {[
                { label: 'Avg Monthly Consumption', value: `${mat.avgConsumption} units` },
                { label: 'Demand CV (σ/μ)', value: mat.cv, color: 'warning.main' },
                { label: 'Annual Consumption Value', value: formatCurrency(mat.annualValue), color: 'primary.main' },
                { label: 'Stockout Events', value: mat.kpis.stockouts, color: 'error.main' },
              ].map((item, i) => (
                <Grid item xs={6} md={3} key={i}>
                  <Card sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ color: item.color || 'text.primary' }}>{item.value}</Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* Tab 4: Optimization */}
        {activeTab === 4 && (
          <>
            <Card sx={{ p: 3, mb: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.1)} 100%)`, border: 1, borderColor: alpha(theme.palette.primary.main, 0.2) }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.15) }}>
                    <BoltIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>AI-Optimized MRP Parameters</Typography>
                    <Typography variant="body2" color="text.secondary">Based on Monte Carlo simulation & probabilistic demand forecasting</Typography>
                  </Box>
                </Stack>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">Potential Annual Savings</Typography>
                  <Typography variant="h4" fontWeight={800} color="success.main">{formatCurrency(mat.savingsPotential)}</Typography>
                </Box>
              </Stack>
            </Card>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                { label: 'Safety Stock (MARC-EISBE)', current: mat.current.safetyStock, optimized: mat.optimized.safetyStock },
                { label: 'Reorder Point (MARC-MINBE)', current: mat.current.reorderPoint, optimized: mat.optimized.reorderPoint },
                { label: 'Lot Size EOQ (MARC-BSTFE)', current: mat.current.lotSize, optimized: mat.optimized.lotSize },
              ].map((item, i) => {
                const currentVal = item.current || 0;
                const optimizedVal = item.optimized || 0;
                const changeNum = currentVal !== 0 ? Math.round((optimizedVal - currentVal) / currentVal * 100) : 0;
                const isDecrease = changeNum <= 0;
                return (
                  <Grid item xs={12} md={4} key={i}>
                    <Card sx={{ p: 2 }}>
                      <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mt: 1 }}>
                        <Box>
                          <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.disabled' }}>{currentVal} units</Typography>
                          <Typography variant="h5" fontWeight={700} color="primary.main">{optimizedVal} units</Typography>
                        </Box>
                        <Chip icon={isDecrease ? <TrendingDownIcon /> : <TrendingUpIcon />} label={`${Math.abs(changeNum)}%`} size="small" color={isDecrease ? 'success' : 'error'} />
                      </Stack>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Optimization Methodology</Typography>
                  {[
                    { num: 1, title: 'Demand Sensing (XGBoost)', desc: 'ML model identifies seasonality, trends, and demand patterns from MVER/MSEG historical data', color: theme.palette.primary.main },
                    { num: 2, title: 'Lead Time Simulation (Monte Carlo)', desc: '10,000 simulations using EKBE/EKET to model supplier delivery variability', color: theme.palette.secondary.main },
                    { num: 3, title: 'TCO Optimization', desc: 'Minimize total cost: Ordering + Holding + Stockout penalty costs', color: theme.palette.success.main },
                  ].map((step, i) => (
                    <Stack direction="row" spacing={2} key={i} sx={{ mb: 2 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: alpha(step.color, 0.15), color: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{step.num}</Box>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{step.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{step.desc}</Typography>
                      </Box>
                    </Stack>
                  ))}
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Write-Back to SAP</Typography>
                  {[
                    { label: 'MARC-EISBE (Safety Stock)', value: mat.optimized.safetyStock },
                    { label: 'MARC-MINBE (Reorder Point)', value: mat.optimized.reorderPoint },
                    { label: 'MARC-BSTFE (Lot Size)', value: mat.optimized.lotSize },
                  ].map((item, i) => (
                    <Stack direction="row" justifyContent="space-between" key={i} sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1, mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                      <Typography variant="body2" fontWeight={600} color="primary.main" sx={{ fontFamily: 'monospace' }}>{item.value}</Typography>
                    </Stack>
                  ))}
                  <Button variant="contained" fullWidth sx={{ mt: 1 }} startIcon={<LoopIcon />}>Apply via BAPI_MATERIAL_MAINTAINDATA_RT</Button>
                </Card>
              </Grid>
            </Grid>
          </>
        )}

        {/* Tab 5: KPIs */}
        {activeTab === 5 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Inventory Health Metrics</Typography>
                {[
                  { label: 'Inventory Turns', value: mat.kpis.turns + 'x', target: '6.0x', pass: parseFloat(mat.kpis.turns) >= 6 },
                  { label: 'Days of Supply', value: mat.kpis.dos + 'd', target: '<60d', pass: mat.kpis.dos < 60 },
                  { label: 'Fill Rate', value: mat.kpis.fillRate + '%', target: '>95%', pass: parseFloat(mat.kpis.fillRate) >= 95 },
                  { label: 'Stockout Events', value: mat.kpis.stockouts, target: '0', pass: mat.kpis.stockouts === 0 },
                  { label: 'Excess Stock Value', value: formatCurrency(mat.savingsPotential), target: '$0', pass: mat.savingsPotential === 0 },
                ].map((kpi, i) => (
                  <Stack direction="row" justifyContent="space-between" alignItems="center" key={i} sx={{ py: 1.5, borderBottom: i < 4 ? 1 : 0, borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">{kpi.label}</Typography>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography variant="caption" color="text.disabled">Target: {kpi.target}</Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ color: kpi.pass ? 'success.main' : 'warning.main' }}>{kpi.value}</Typography>
                      {kpi.pass ? <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} /> : <WarningIcon sx={{ fontSize: 18, color: 'warning.main' }} />}
                    </Stack>
                  </Stack>
                ))}
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Classification Summary</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Chip label={mat.abc} size="small" sx={{ bgcolor: alpha(mat.abc === 'A' ? theme.palette.error.main : mat.abc === 'B' ? theme.palette.warning.main : theme.palette.text.secondary, 0.15) }} />
                        <Typography variant="body2" fontWeight={600}>ABC Classification</Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {mat.abc === 'A' ? 'Top 80% value - Critical items requiring close attention' :
                          mat.abc === 'B' ? 'Next 15% value - Important items with regular monitoring' :
                            'Bottom 5% value - Low priority items'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Chip label={mat.xyz} size="small" sx={{ bgcolor: alpha(mat.xyz === 'X' ? theme.palette.success.main : mat.xyz === 'Y' ? theme.palette.info.main : theme.palette.primary.main, 0.15) }} />
                        <Typography variant="body2" fontWeight={600}>XYZ Classification</Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {mat.xyz === 'X' ? 'CV < 0.5 - Highly predictable demand' :
                          mat.xyz === 'Y' ? 'CV 0.5-1.0 - Moderately variable demand' :
                            'CV > 1.0 - Erratic, hard to predict'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={() => selectedMaterial ? setSelectedMaterial(null) : onBack()} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>Layer 2: Diagnostics</Link>
            {selectedMaterial ? (
              <>
                <Link component="button" variant="body1" onClick={() => setSelectedMaterial(null)} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>Inventory Dashboard</Link>
                <Typography color="primary" variant="body1" fontWeight={600}>{selectedMaterial.id} Detail</Typography>
              </>
            ) : (
              <Typography color="primary" variant="body1" fontWeight={600}>Inventory Dashboard</Typography>
            )}
          </Breadcrumbs>

          {!selectedMaterial && (
            <Stack direction="row" spacing={1}>
              {tileConfig && <DataSourceChip dataType={tileConfig.dataType} />}
              <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
            </Stack>
          )}
        </Stack>

        {!selectedMaterial && (
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: 4, height: 50, bgcolor: 'primary.main', borderRadius: 1 }} />
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <AnalyticsIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h5" fontWeight={700}>Inventory Dashboard</Typography>
                <Chip label="Layer 2 - Diagnostics" size="small" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }} />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Comprehensive inventory health dashboard with ABC/XYZ matrix and drill-down analytics
              </Typography>
            </Box>
          </Stack>
        )}
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Conditional Render: Detail View OR List View */}
      {selectedMaterial ? (
        renderDetailView()
      ) : (
        <>
          {/* KPI Cards */}
          {kpis && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {kpis.map((kpi, index) => (
                <Grid item xs={12} sm={6} md={3} lg={1.5} key={index}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="caption" color="text.secondary">{kpi.label}</Typography>
                      <Box sx={{ p: 0.75, borderRadius: 1, bgcolor: alpha(kpi.color, 0.1) }}>
                        <kpi.icon sx={{ fontSize: 18, color: kpi.color }} />
                      </Box>
                    </Stack>
                    <Typography variant="h5" fontWeight={700} sx={{ my: 0.5 }}>{kpi.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{kpi.subtext}</Typography>
                    {kpi.trend !== undefined && (
                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                        {kpi.trend >= 0 ? <TrendingUpIcon sx={{ fontSize: 14, color: 'success.main' }} /> : <TrendingDownIcon sx={{ fontSize: 14, color: 'error.main' }} />}
                        <Typography variant="caption" sx={{ color: kpi.trend >= 0 ? 'success.main' : 'error.main' }}>
                          {Math.abs(kpi.trend)}% vs last month
                        </Typography>
                      </Stack>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Main Content */}
          <Grid container spacing={2}>
            {/* Sidebar - Collapsible */}
            <Grid
              item
              xs={12}
              md={sidebarCollapsed ? 0.5 : 3}
              lg={sidebarCollapsed ? 0.4 : 2.5}
              sx={{
                transition: 'all 0.3s ease',
                display: { xs: sidebarCollapsed ? 'none' : 'block', md: 'block' },
              }}
            >
              <Box sx={{ position: 'relative' }}>
                {/* Collapse/Expand Button */}
                <IconButton
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  size="small"
                  sx={{
                    position: 'absolute',
                    right: sidebarCollapsed ? '50%' : -12,
                    top: 8,
                    transform: sidebarCollapsed ? 'translateX(50%)' : 'none',
                    zIndex: 10,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    boxShadow: 1,
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
                  }}
                >
                  {sidebarCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
                </IconButton>

                {/* Collapsed State - Show icons only */}
                {sidebarCollapsed ? (
                  <Stack spacing={1} alignItems="center" sx={{ pt: 5 }}>
                    <Tooltip title="ABC/XYZ Matrix" placement="right">
                      <IconButton
                        onClick={() => setSidebarCollapsed(false)}
                        sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                      >
                        <GridViewIcon sx={{ color: 'primary.main' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Quick Filters" placement="right">
                      <IconButton
                        onClick={() => setSidebarCollapsed(false)}
                        sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                      >
                        <FilterListIcon sx={{ color: 'primary.main' }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ) : (
                  <Stack spacing={2}>
                    <ABCXYZMatrix data={data} filters={filters} onCellClick={handleMatrixClick} theme={theme} />

                    {/* Filters */}
                    <Card sx={{ p: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>Quick Filters</Typography>

                      <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                        <InputLabel>Material Type</InputLabel>
                        <Select value={filters.type} label="Material Type" onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}>
                          <MenuItem value="all">All Types</MenuItem>
                          <MenuItem value="FERT">Finished Goods (FG)</MenuItem>
                          <MenuItem value="HALB">Semi-Finished (SFG)</MenuItem>
                          <MenuItem value="ROH">Raw Materials (RAW)</MenuItem>
                          <MenuItem value="HAWA">Trade Goods (TRD)</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                        <InputLabel>Plant</InputLabel>
                        <Select value={filters.plant} label="Plant" onChange={(e) => setFilters(prev => ({ ...prev, plant: e.target.value }))}>
                          <MenuItem value="all">All Plants</MenuItem>
                          <MenuItem value="1000">1000 - Keasbey NJ</MenuItem>
                          <MenuItem value="2000">2000 - Santa Clarita CA</MenuItem>
                          <MenuItem value="3000">3000 - Hwaseong Douglas</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                        <InputLabel>Status</InputLabel>
                        <Select value={filters.status} label="Status" onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}>
                          <MenuItem value="all">All Status</MenuItem>
                          <MenuItem value="healthy">Healthy</MenuItem>
                          <MenuItem value="warning">Warning</MenuItem>
                          <MenuItem value="critical">Critical</MenuItem>
                        </Select>
                      </FormControl>

                      <Button variant="outlined" fullWidth size="small" onClick={clearFilters}>Clear All Filters</Button>
                    </Card>
                  </Stack>
                )}
              </Box>
            </Grid>

            {/* Table Section */}
            <Grid item xs={12} md={sidebarCollapsed ? 11.5 : 9} lg={sidebarCollapsed ? 11.6 : 9.5} sx={{ transition: 'all 0.3s ease' }}>
              <Card sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Search materials by ID or name..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                    sx={{ flex: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Showing <strong>{filteredData.length}</strong> of <strong>{data.length}</strong> materials
                  </Typography>
                </Stack>

                <DataGrid
                  rows={filteredData}
                  columns={columns}
                  autoHeight
                  initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                  pageSizeOptions={[10, 25, 50]}
                  disableRowSelectionOnClick
                  onRowClick={handleRowClick}
                  sx={{
                    ...stoxTheme.getDataGridSx({ clickable: true }),
                    '& .MuiDataGrid-row': { cursor: 'pointer' },
                  }}
                  slots={{ toolbar: GridToolbar }}
                  slotProps={{ toolbar: { showQuickFilter: false } }}
                />
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default InventoryDashboard;
