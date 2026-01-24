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
  Avatar,
  alpha,
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Refresh,
  Download,
  FilterList,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Inventory,
  LocalShipping,
  AttachMoney,
  ShowChart,
  Assignment,
} from '@mui/icons-material';
// import * as XLSX from 'xlsx';
import { LAM_MATERIALS, LAM_MATERIAL_PLANT_DATA, LAM_PLANTS, getMaterialById } from '../../data/arizonaBeveragesMasterData';

// Data generators for each tile based on SAP tables and Excel data
const generateTileData = (tileId) => {
  const dataGenerators = {
    // MODULE 0: Demand Flow
    'sell-through-bridge': () => [
      { id: 1, channel: 'CH01 (Retail Store)', store_id: 'STORE_001', sku: 'SKU_HC_001', date: '2024-01-08', sellThrough: 45, sellIn: 215, forecast: 45, confidence: 92 },
      { id: 2, channel: 'CH02 (E-Commerce)', store_id: 'ONLINE_DIR', sku: 'SKU_HC_001', date: '2024-01-10', sellThrough: 51, sellIn: 450, forecast: 51, confidence: 89 },
      { id: 3, channel: 'CH03 (ULTA)', store_id: 'PARTNER_ULTA', sku: 'SKU_HC_001', date: '2024-01-12', sellThrough: 450, sellIn: 450, forecast: 450, confidence: 85 },
      { id: 4, channel: 'CH01 (Retail Store)', store_id: 'STORE_002', sku: 'SKU_HC_002', date: '2024-01-08', sellThrough: 32, sellIn: 166, forecast: 32, confidence: 94 },
      { id: 5, channel: 'CH04 (CosmoProf)', store_id: 'DIST_COSMO', sku: 'SKU_HC_004', date: '2024-02-12', sellThrough: 67, sellIn: 850, forecast: 70, confidence: 78 },
    ],
    'partner-pos-monitor': () => [
      { id: 1, partner: 'ULTA', edi_feed: 'EDI-852', last_update: '2024-01-15 08:30', status: 'Active', records: 1250, quality: 98 },
      { id: 2, partner: 'SEPHORA', edi_feed: 'EDI-852', last_update: '2024-01-15 08:25', status: 'Active', records: 980, quality: 96 },
      { id: 3, partner: 'TARGET', edi_feed: 'EDI-852', last_update: '2024-01-15 08:45', status: 'Delayed', records: 750, quality: 92 },
      { id: 4, partner: 'WALMART', edi_feed: 'EDI-852', last_update: '2024-01-14 23:30', status: 'Error', records: 0, quality: 0 },
    ],

    // MODULE 1: Demand Forecasting
    'forecast-dashboard': () => [
      { id: 1, sku: 'SKU_HC_001', channel: 'CH01', date: '2024-10-25', actual: 45, forecast: 45, accuracy: 100, bias: 0, mape: 5.2 },
      { id: 2, sku: 'SKU_HC_001', channel: 'CH02', date: '2024-10-25', actual: 51, forecast: 48, accuracy: 94, bias: 3, mape: 6.1 },
      { id: 3, sku: 'SKU_HC_001', channel: 'CH03', date: '2024-10-25', actual: 450, forecast: 465, accuracy: 97, bias: -15, mape: 3.3 },
      { id: 4, sku: 'SKU_HC_002', channel: 'CH01', date: '2024-10-25', actual: 32, forecast: 30, accuracy: 94, bias: 2, mape: 6.7 },
      { id: 5, sku: 'SKU_HC_004', channel: 'CH01', date: '2024-02-14', actual: 89, forecast: 85, accuracy: 96, bias: 4, mape: 4.5 },
    ],
    'demand-analyzer': () => [
      { id: 1, dimension: 'Product', category: 'Hair Color', sku: 'SKU_HC_001', demand: 546, trend: '+12%', region: 'California' },
      { id: 2, dimension: 'Region', category: 'California', sku: 'All', demand: 1250, trend: '+8%', region: 'California' },
      { id: 3, dimension: 'Store', category: 'Mall Flagship', sku: 'All', demand: 890, trend: '+15%', region: 'Multi' },
      { id: 4, dimension: 'Channel', category: 'E-Commerce', sku: 'All', demand: 2100, trend: '+25%', region: 'National' },
    ],
    'forecast-workbench': () => [
      { id: 1, sku: 'SKU_HC_001', week: '2024-W06', ai_forecast: 45, override: null, promo: 'N', final_forecast: 45, status: 'Approved' },
      { id: 2, sku: 'SKU_HC_002', week: '2024-W06', ai_forecast: 32, override: 40, promo: 'Y', final_forecast: 40, status: 'Overridden' },
      { id: 3, sku: 'SKU_HC_004', week: '2024-W07', ai_forecast: 67, override: 75, promo: 'Y', final_forecast: 75, status: 'Pending' },
      { id: 4, sku: 'SKU_HC_006', week: '2024-W18', ai_forecast: 73, override: null, promo: 'Y', final_forecast: 73, status: 'Approved' },
    ],
    'demand-alerts': () => [
      { id: 1, alert_type: 'Stockout Risk', sku: 'SKU_HC_003', store: 'STORE_003', severity: 'High', date: '2024-01-15', message: 'Inventory at 0 units' },
      { id: 2, alert_type: 'Demand Spike', sku: 'SKU_HC_001', store: 'STORE_005', severity: 'Medium', date: '2024-02-14', message: 'Holiday surge: +98% vs forecast' },
      { id: 3, alert_type: 'Forecast Error', sku: 'SKU_HC_010', store: 'STORE_013', severity: 'Low', date: '2024-04-29', message: 'MAPE exceeds 15%' },
    ],

    // MODULE 2: Outbound Replenishment
    'store-replenishment': () => [
      { id: 1, store: 'STORE_001', sku: 'SKU_HC_001', forecast_7d: 315, on_hand: 120, in_transit: 30, safety_stock: 50, replenishment: 215 },
      { id: 2, store: 'STORE_002', sku: 'SKU_HC_001', forecast_7d: 196, on_hand: 65, in_transit: 0, safety_stock: 35, replenishment: 166 },
      { id: 3, store: 'DC_POOL', sku: 'SKU_HC_001', forecast_7d: 357, on_hand: 450, in_transit: 100, safety_stock: 70, replenishment: 0 },
    ],
    'route-optimizer': () => [
      { id: 1, route: 'ROUTE-001', truck: 'TRK-45', stores: 'STORE_001, STORE_002, STORE_003', capacity: '85%', distance: '45 mi', cost: 450 },
      { id: 2, route: 'ROUTE-002', truck: 'TRK-12', stores: 'STORE_005, STORE_006', capacity: '92%', distance: '32 mi', cost: 380 },
      { id: 3, route: 'ROUTE-003', truck: 'TRK-78', stores: 'STORE_010, STORE_012, STORE_015', capacity: '78%', distance: '67 mi', cost: 620 },
    ],
    'stockout-monitor': () => [
      { id: 1, store: 'STORE_003', sku: 'SKU_HC_003', current_stock: 0, forecast_daily: 12, days_to_stockout: 0, risk: 'Critical', action: 'Emergency shipment' },
      { id: 2, store: 'STORE_010', sku: 'SKU_HC_002', current_stock: 15, forecast_daily: 8, days_to_stockout: 2, risk: 'High', action: 'Priority replenishment' },
      { id: 3, store: 'STORE_002', sku: 'SKU_HC_008', current_stock: 45, forecast_daily: 12, days_to_stockout: 4, risk: 'Medium', action: 'Standard replenishment' },
    ],
    'channel-allocation': () => [
      { id: 1, sku: 'SKU_HC_001', dc_available: 950, ch01_allocation: 600, ch02_allocation: 450, ch03_allocation: 800, ch04_allocation: 200, total_demand: 2050 },
      { id: 2, sku: 'SKU_HC_002', dc_available: 220, ch01_allocation: 400, ch02_allocation: 380, ch03_allocation: 500, ch04_allocation: 150, total_demand: 1430 },
      { id: 3, sku: 'SKU_HC_006', dc_available: 1480, ch01_allocation: 800, ch02_allocation: 520, ch03_allocation: 600, ch04_allocation: 300, total_demand: 2220 },
    ],

    // MODULE 3: DC Inventory
    'dc-cockpit': () => [
      { id: 1, sku: 'SKU_HC_001', on_hand: 1800, in_transit: 500, allocated_ch01: 600, allocated_ch02: 450, safety_stock: 300, available: 950 },
      { id: 2, sku: 'SKU_HC_002', on_hand: 1200, in_transit: 0, allocated_ch01: 400, allocated_ch02: 380, safety_stock: 200, available: 220 },
      { id: 3, sku: 'SKU_HC_006', on_hand: 2400, in_transit: 800, allocated_ch01: 800, allocated_ch02: 520, safety_stock: 400, available: 1480 },
    ],
    'working-capital': () => {
      // Generate from actual Arizona Beverages material-plant data
      return LAM_MATERIAL_PLANT_DATA.slice(0, 12).map((mpd, idx) => {
        const material = getMaterialById(mpd.materialId);
        const plant = LAM_PLANTS.find(p => p.id === mpd.plant);
        const inventoryValue = mpd.totalStock * (material?.basePrice || 0);
        // DIO = 365 / Turns
        const dio = mpd.turns > 0 ? Math.round(365 / mpd.turns) : 0;
        // Status based on DOS thresholds
        const status = mpd.dos > 365 ? 'Dead Stock' : mpd.dos > 180 ? 'Slow Moving' : mpd.turns >= 4 ? 'Optimal' : 'Review';
        return {
          id: idx + 1,
          sku: mpd.materialId,
          sku_name: material?.name || mpd.materialId,
          plant: plant?.name || mpd.plant,
          inventory_units: mpd.totalStock,
          unit_cost: material?.basePrice || 0,
          inventory_value: inventoryValue,
          turns: mpd.turns,
          dos: Math.round(mpd.dos),
          dio: dio,
          fill_rate: mpd.fillRate,
          abc: mpd.abc,
          xyz: mpd.xyz,
          status: status,
        };
      });
    },
    'excess-obsolete': () => [
      { id: 1, sku: 'SKU_HC_003', inventory: 0, last_sale: '2024-01-15', days_no_sale: 90, category: 'End-of-Life', action: 'Discontinued', value: 0 },
      { id: 2, sku: 'SKU_HC_010', inventory: 450, last_sale: '2024-04-29', days_no_sale: 60, category: 'Slow-Moving', action: 'Markdown 30%', value: 15750 },
      { id: 3, sku: 'SKU_HC_015', inventory: 820, last_sale: '2024-03-10', days_no_sale: 120, category: 'Obsolete', action: 'Liquidation', value: 32800 },
    ],

    // MODULE 4: Supply Planning
    'supply-dashboard': () => [
      { id: 1, sku: 'SKU_HC_001', weekly_demand: 150, safety_stock: 150, dc_on_hand: 180, dc_on_order: 100, plant_supply_req: 20 },
      { id: 2, sku: 'SKU_HC_002', weekly_demand: 120, safety_stock: 120, dc_on_hand: 90, dc_on_order: 0, plant_supply_req: 150 },
      { id: 3, sku: 'SKU_HC_004', weekly_demand: 180, safety_stock: 180, dc_on_hand: 120, dc_on_order: 50, plant_supply_req: 190 },
      { id: 4, sku: 'SKU_HC_006', weekly_demand: 140, safety_stock: 140, dc_on_hand: 80, dc_on_order: 0, plant_supply_req: 200 },
    ],
    'production-optimizer': () => [
      { id: 1, product_family: 'Permanent Color', campaign_size: 5000, changeover_time: '2 hrs', capacity_util: 85, production_days: 3, efficiency: 92 },
      { id: 2, product_family: 'Semi-Permanent', campaign_size: 3500, changeover_time: '1.5 hrs', capacity_util: 78, production_days: 2, efficiency: 88 },
      { id: 3, product_family: 'Treatment Kits', campaign_size: 2000, changeover_time: '1 hr', capacity_util: 65, production_days: 1, efficiency: 90 },
    ],
    'mrp-accelerator': () => [
      { id: 1, sku: 'SKU_HC_001', planned_order: 'PO-2024-001', quantity: 5000, mrp_date: '2024-02-01', lead_time: 30, status: 'Auto-Approved' },
      { id: 2, sku: 'SKU_HC_002', planned_order: 'PO-2024-002', quantity: 3500, mrp_date: '2024-02-05', lead_time: 30, status: 'Pending Review' },
      { id: 3, sku: 'SKU_HC_004', planned_order: 'PO-2024-003', quantity: 4200, mrp_date: '2024-02-10', lead_time: 30, status: 'Expedited' },
    ],

    // MODULE 5: BOM Explosion
    'bom-analyzer': () => [
      { id: 1, fg_sku: 'SKU_HC_001', plant_req: 20, component: 'TUBE-COLOR-CHEST', qty_per_fg: 1, component_req: 20, supplier: 'ChemCo' },
      { id: 2, fg_sku: 'SKU_HC_001', plant_req: 20, component: 'DEV-60ML', qty_per_fg: 1, component_req: 20, supplier: 'ChemCo' },
      { id: 3, fg_sku: 'SKU_HC_001', plant_req: 20, component: 'BRUSH-APP', qty_per_fg: 1, component_req: 20, supplier: 'PackPro' },
      { id: 4, fg_sku: 'SKU_HC_001', plant_req: 20, component: 'GLOVES-NIT', qty_per_fg: 1, component_req: 20, supplier: 'SafetyFirst' },
      { id: 5, fg_sku: 'SKU_HC_002', plant_req: 150, component: 'BRUSH-APP', qty_per_fg: 1, component_req: 150, supplier: 'PackPro' },
      { id: 6, fg_sku: 'SKU_HC_002', plant_req: 150, component: 'GLOVES-NIT', qty_per_fg: 1, component_req: 150, supplier: 'SafetyFirst' },
    ],
    'component-tracker': () => [
      { id: 1, component: 'GLOVES-NIT', used_in: 'SKU_HC_001, SKU_HC_002, SKU_HC_004, SKU_HC_006, SKU_HC_013', total_fgs: 5, total_demand: 600, on_hand: 100 },
      { id: 2, component: 'BRUSH-APP', used_in: 'SKU_HC_001, SKU_HC_002, SKU_HC_004, SKU_HC_006', total_fgs: 4, total_demand: 560, on_hand: 150 },
      { id: 3, component: 'CARD-INST', used_in: 'ALL SKUs', total_fgs: 5, total_demand: 600, on_hand: 300 },
      { id: 4, component: 'DEV-60ML', used_in: 'SKU_HC_001, SKU_HC_004, SKU_HC_006', total_fgs: 3, total_demand: 410, on_hand: 200 },
    ],
    'bom-exceptions': () => [
      { id: 1, sku: 'SKU_HC_015', exception_type: 'Missing Component', component: 'TUBE-SPECIAL', severity: 'High', action_required: 'Source alternative' },
      { id: 2, sku: 'SKU_HC_008', exception_type: 'Component Shortage', component: 'GLOVES-NIT', severity: 'Medium', action_required: 'Expedite PO' },
      { id: 3, sku: 'SKU_HC_012', exception_type: 'Phantom BOM', component: 'KIT-ASSEMBLY', severity: 'Low', action_required: 'Update BOM' },
    ],

    // MODULE 6: Component Consolidation
    'consolidation-engine': () => [
      { id: 1, component: 'DEV-60ML', used_in: 'SKU_HC_001, 004, 006', total_req: 410, current_inventory: 200, purchase_qty: 210, supplier: 'ChemCo', savings: '$1,260' },
      { id: 2, component: 'BRUSH-APP', used_in: 'SKU_HC_001, 002, 004, 006', total_req: 560, current_inventory: 150, purchase_qty: 410, supplier: 'PackPro', savings: '$820' },
      { id: 3, component: 'GLOVES-NIT', used_in: 'ALL 5 SKUs', total_req: 600, current_inventory: 100, purchase_qty: 500, supplier: 'SafetyFirst', savings: '$1,500' },
      { id: 4, component: 'CARD-INST', used_in: 'ALL 5 SKUs', total_req: 600, current_inventory: 300, purchase_qty: 300, supplier: 'PrintCo', savings: '$450' },
    ],
    'procurement-dashboard': () => [
      { id: 1, component: 'GLOVES-NIT', consolidated_po: 'PO-2024-C-001', quantity: 500, supplier: 'SafetyFirst', unit_cost: 3.00, total_cost: 1500, discount: '20%', savings: 375 },
      { id: 2, component: 'BRUSH-APP', consolidated_po: 'PO-2024-C-002', quantity: 410, supplier: 'PackPro', unit_cost: 2.00, total_cost: 820, discount: '15%', savings: 145 },
      { id: 3, component: 'DEV-60ML', consolidated_po: 'PO-2024-C-003', quantity: 210, supplier: 'ChemCo', unit_cost: 6.00, total_cost: 1260, discount: '18%', savings: 275 },
    ],
    'supplier-portal': () => [
      { id: 1, supplier: 'SafetyFirst', forecast_shared: 'Yes', last_po: '2024-01-10', next_po_est: '2024-02-15', delivery_performance: 98, quality_score: 96 },
      { id: 2, supplier: 'PackPro', forecast_shared: 'Yes', last_po: '2024-01-12', next_po_est: '2024-02-18', delivery_performance: 95, quality_score: 94 },
      { id: 3, supplier: 'ChemCo', forecast_shared: 'Yes', last_po: '2024-01-08', next_po_est: '2024-02-10', delivery_performance: 92, quality_score: 98 },
      { id: 4, supplier: 'PrintCo', forecast_shared: 'No', last_po: '2024-01-05', next_po_est: '2024-02-20', delivery_performance: 88, quality_score: 90 },
    ],

    // MODULE 7: Analytics & What-If
    'scenario-planner': () => [
      { id: 1, scenario: 'Best Case', sku: 'SKU_HC_001', base_demand: 45, promo_impact: '+40%', holiday_impact: '+25%', forecasted_demand: 79, inventory_req: 395 },
      { id: 2, scenario: 'Likely', sku: 'SKU_HC_001', base_demand: 45, promo_impact: '0%', holiday_impact: '0%', forecasted_demand: 45, inventory_req: 225 },
      { id: 3, scenario: 'Worst Case', sku: 'SKU_HC_001', base_demand: 45, promo_impact: '-10%', holiday_impact: '-15%', forecasted_demand: 34, inventory_req: 170 },
    ],
    'kpi-dashboard': () => [
      { id: 1, kpi: 'Forecast Accuracy', value: 92.5, target: 90, unit: '%', trend: '+2.5%', status: 'Exceeds' },
      { id: 2, kpi: 'Fill Rate', value: 96.2, target: 95, unit: '%', trend: '+1.2%', status: 'Meets' },
      { id: 3, kpi: 'Inventory Turns', value: 10.2, target: 10, unit: 'x', trend: '+0.2x', status: 'Meets' },
      { id: 4, kpi: 'Stockout Rate', value: 3.8, target: 5, unit: '%', trend: '-1.2%', status: 'Exceeds' },
      { id: 5, kpi: 'DIO', value: 36, target: 40, unit: 'days', trend: '-4 days', status: 'Exceeds' },
    ],
    'predictive-analytics': () => [
      { id: 1, date: '2024-02-14', anomaly_type: 'Demand Spike', sku: 'SKU_HC_001', store: 'STORE_005', expected: 45, actual: 89, variance: '+98%', reason: 'Valentine Holiday' },
      { id: 2, date: '2024-01-15', anomaly_type: 'Stockout', sku: 'SKU_HC_003', store: 'STORE_003', expected: 28, actual: 0, variance: '-100%', reason: 'End-of-Life' },
      { id: 3, date: '2024-03-18', anomaly_type: 'Slow Sales', sku: 'SKU_HC_002', store: 'STORE_010', expected: 40, actual: 18, variance: '-55%', reason: 'Competitor Promo' },
    ],
    'working-capital-optimizer': () => {
      // Generate optimization recommendations from Arizona Beverages data
      return LAM_MATERIAL_PLANT_DATA.slice(0, 10).map((mpd, idx) => {
        const material = getMaterialById(mpd.materialId);
        const plant = LAM_PLANTS.find(p => p.id === mpd.plant);
        const inventoryValue = mpd.totalStock * (material?.basePrice || 0);
        const dio = mpd.turns > 0 ? Math.round(365 / mpd.turns) : 0;
        // Target turns based on material type: FG=4x, SFG=6x, RAW=8x
        const targetTurns = material?.type === 'FERT' ? 4 : material?.type === 'HALB' ? 6 : 8;
        const targetDio = Math.round(365 / targetTurns);
        // Cash impact = (current inv - optimal inv) where optimal = currentCOGS / targetTurns
        const currentCOGS = inventoryValue * mpd.turns;
        const optimalInv = targetTurns > 0 ? currentCOGS / targetTurns : inventoryValue;
        const cashImpact = inventoryValue - optimalInv;
        const status = mpd.turns >= targetTurns ? 'Optimal' : mpd.turns >= targetTurns * 0.7 ? 'Review' : 'Action Required';
        return {
          id: idx + 1,
          sku: mpd.materialId,
          sku_name: material?.name || mpd.materialId,
          plant: plant?.name || mpd.plant,
          material_type: material?.type || 'Unknown',
          inventory_value: inventoryValue,
          target_turns: targetTurns,
          current_turns: mpd.turns,
          dio: dio,
          target_dio: targetDio,
          cash_impact: cashImpact > 0 ? `+$${(cashImpact/1000).toFixed(0)}K` : cashImpact < -1000 ? `-$${(Math.abs(cashImpact)/1000).toFixed(0)}K` : '$0',
          cash_impact_value: cashImpact,
          excess_stock: mpd.excessStock || 0,
          wcp: plant?.grossMarginPct ? (plant.grossMarginPct * mpd.turns * 2.2).toFixed(1) : '0',
          status: status,
        };
      });
    },
  };

  return dataGenerators[tileId] ? dataGenerators[tileId]() : [];
};

// Column definitions for each tile
const getColumnConfig = (tileId) => {
  const columnConfigs = {
    'sell-through-bridge': [
      { field: 'channel', headerName: 'Channel', minWidth: 200, flex: 1.2 },
      { field: 'store_id', headerName: 'Store/Location', minWidth: 170, flex: 1 },
      { field: 'sku', headerName: 'SKU', minWidth: 150, flex: 1 },
      { field: 'date', headerName: 'Date', minWidth: 140, flex: 0.9 },
      { field: 'sellThrough', headerName: 'Sell-Through', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'sellIn', headerName: 'Sell-In (Forecast)', minWidth: 170, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'forecast', headerName: 'AI Forecast', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'confidence', headerName: 'Confidence %', minWidth: 150, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
    ],
    'partner-pos-monitor': [
      { field: 'partner', headerName: 'Partner', minWidth: 170, flex: 1 },
      { field: 'edi_feed', headerName: 'EDI Feed', minWidth: 140, flex: 0.9 },
      { field: 'last_update', headerName: 'Last Update', minWidth: 200, flex: 1.2 },
      { field: 'status', headerName: 'Status', minWidth: 140, flex: 0.9, align: 'center', headerAlign: 'center', renderCell: (params) => (
        <Chip label={params.value} color={params.value === 'Active' ? 'success' : params.value === 'Delayed' ? 'warning' : 'error'} size="small" />
      )},
      { field: 'records', headerName: 'Records', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'quality', headerName: 'Quality %', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
    ],
    'forecast-dashboard': [
      { field: 'sku', headerName: 'SKU', minWidth: 150, flex: 1 },
      { field: 'channel', headerName: 'Channel', minWidth: 120, flex: 0.8 },
      { field: 'date', headerName: 'Date', minWidth: 140, flex: 0.9 },
      { field: 'actual', headerName: 'Actual', minWidth: 120, flex: 0.8, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'forecast', headerName: 'Forecast', minWidth: 120, flex: 0.8, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'accuracy', headerName: 'Accuracy %', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'bias', headerName: 'Bias', minWidth: 120, flex: 0.8, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'mape', headerName: 'MAPE %', minWidth: 120, flex: 0.8, type: 'number', align: 'center', headerAlign: 'center'},
    ],
    'demand-analyzer': [
      { field: 'dimension', headerName: 'Dimension', minWidth: 150, flex: 1 },
      { field: 'category', headerName: 'Category', minWidth: 170, flex: 1 },
      { field: 'sku', headerName: 'SKU', minWidth: 150, flex: 1 },
      { field: 'demand', headerName: 'Demand', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'trend', headerName: 'Trend', minWidth: 140, flex: 0.9 },
      { field: 'region', headerName: 'Region', minWidth: 150, flex: 1 },
    ],
    'forecast-workbench': [
      { field: 'sku', headerName: 'SKU', minWidth: 150, flex: 1 },
      { field: 'week', headerName: 'Week', minWidth: 140, flex: 0.9 },
      { field: 'ai_forecast', headerName: 'AI Forecast', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'override', headerName: 'Override', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'promo', headerName: 'Promo', minWidth: 120, flex: 0.8 },
      { field: 'final_forecast', headerName: 'Final Forecast', minWidth: 160, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'status', headerName: 'Status', minWidth: 150, flex: 1, align: 'center', headerAlign: 'center', renderCell: (params) => (
        <Chip label={params.value} color={params.value === 'Approved' ? 'success' : params.value === 'Overridden' ? 'warning' : 'default'} size="small" />
      )},
    ],
    'demand-alerts': [
      { field: 'alert_type', headerName: 'Alert Type', minWidth: 170, flex: 1 },
      { field: 'sku', headerName: 'SKU', minWidth: 150, flex: 1 },
      { field: 'store', headerName: 'Store', minWidth: 150, flex: 1 },
      { field: 'severity', headerName: 'Severity', minWidth: 140, flex: 0.9, align: 'center', headerAlign: 'center', renderCell: (params) => (
        <Chip label={params.value} color={params.value === 'High' ? 'error' : params.value === 'Medium' ? 'warning' : 'info'} size="small" />
      )},
      { field: 'date', headerName: 'Date', minWidth: 140, flex: 0.9 },
      { field: 'message', headerName: 'Message', minWidth: 320, flex: 2 },
    ],
    'store-replenishment': [
      { field: 'store', headerName: 'Store', minWidth: 150, flex: 1 },
      { field: 'sku', headerName: 'SKU', minWidth: 150, flex: 1 },
      { field: 'forecast_7d', headerName: 'Forecast (7d)', minWidth: 160, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'on_hand', headerName: 'On Hand', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'in_transit', headerName: 'In Transit', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'safety_stock', headerName: 'Safety Stock', minWidth: 150, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'replenishment', headerName: 'Replenishment', minWidth: 170, flex: 1, type: 'number', align: 'center', headerAlign: 'center', cellClassName: (params) => params.value > 0 ? 'highlight-cell' : '' },
    ],
    'route-optimizer': [
      { field: 'route', headerName: 'Route ID', minWidth: 150, flex: 1 },
      { field: 'truck', headerName: 'Truck', minWidth: 120, flex: 0.8 },
      { field: 'stores', headerName: 'Stores', minWidth: 270, flex: 1.5 },
      { field: 'capacity', headerName: 'Capacity', minWidth: 140, flex: 0.9 },
      { field: 'distance', headerName: 'Distance', minWidth: 140, flex: 0.9 },
      { field: 'cost', headerName: 'Cost ($)', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
    ],
    'stockout-monitor': [
      { field: 'store', headerName: 'Store', minWidth: 150, flex: 1 },
      { field: 'sku', headerName: 'SKU', minWidth: 150, flex: 1 },
      { field: 'current_stock', headerName: 'Current Stock', minWidth: 160, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'forecast_daily', headerName: 'Daily Forecast', minWidth: 160, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'days_to_stockout', headerName: 'Days to Stockout', minWidth: 180, flex: 1.1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'risk', headerName: 'Risk', minWidth: 140, flex: 0.9, align: 'center', headerAlign: 'center', renderCell: (params) => (
        <Chip label={params.value} color={params.value === 'Critical' ? 'error' : params.value === 'High' ? 'warning' : 'info'} size="small" />
      )},
      { field: 'action', headerName: 'Action Required', minWidth: 220, flex: 1.3 },
    ],
    'channel-allocation': [
      { field: 'sku', headerName: 'SKU', minWidth: 150, flex: 1 },
      { field: 'dc_available', headerName: 'DC Available', minWidth: 160, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'ch01_allocation', headerName: 'CH01', minWidth: 120, flex: 0.8, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'ch02_allocation', headerName: 'CH02', minWidth: 120, flex: 0.8, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'ch03_allocation', headerName: 'CH03', minWidth: 120, flex: 0.8, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'ch04_allocation', headerName: 'CH04', minWidth: 120, flex: 0.8, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'total_demand', headerName: 'Total Demand', minWidth: 160, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
    ],
    'dc-cockpit': [
      { field: 'sku', headerName: 'SKU', minWidth: 150, flex: 1 },
      { field: 'on_hand', headerName: 'On Hand', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'in_transit', headerName: 'In Transit', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'allocated_ch01', headerName: 'Allocated CH01', minWidth: 170, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'allocated_ch02', headerName: 'Allocated CH02', minWidth: 170, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'safety_stock', headerName: 'Safety Stock', minWidth: 150, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'available', headerName: 'Available', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center', cellClassName: 'highlight-cell' },
    ],
    'working-capital': [
      { field: 'sku', headerName: 'Material ID', minWidth: 100, flex: 0.7 },
      { field: 'sku_name', headerName: 'Material Name', minWidth: 200, flex: 1.3 },
      { field: 'plant', headerName: 'Plant', minWidth: 130, flex: 0.8 },
      { field: 'inventory_units', headerName: 'Stock', minWidth: 80, flex: 0.5, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'inventory_value', headerName: 'Inventory $', minWidth: 120, flex: 0.8, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value >= 1000000 ? `$${(params.value/1000000).toFixed(1)}M` : `$${(params.value/1000).toFixed(0)}K` },
      { field: 'turns', headerName: 'Turns', minWidth: 80, flex: 0.5, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toFixed(1) },
      { field: 'dos', headerName: 'DOS', minWidth: 80, flex: 0.5, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'dio', headerName: 'DIO', minWidth: 80, flex: 0.5, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'fill_rate', headerName: 'Fill %', minWidth: 80, flex: 0.5, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => `${params.value?.toFixed(1)}%` },
      { field: 'abc', headerName: 'ABC', minWidth: 60, flex: 0.4, align: 'center', headerAlign: 'center'},
      { field: 'status', headerName: 'Status', minWidth: 110, flex: 0.7, align: 'center', headerAlign: 'center', renderCell: (params) => (
        <Chip label={params.value} size="small" color={params.value === 'Optimal' ? 'success' : params.value === 'Dead Stock' ? 'error' : params.value === 'Slow Moving' ? 'warning' : 'info'} />
      )},
    ],
    'excess-obsolete': [
      { field: 'sku', headerName: 'SKU', minWidth: 150, flex: 1 },
      { field: 'inventory', headerName: 'Inventory', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'last_sale', headerName: 'Last Sale', minWidth: 140, flex: 0.9 },
      { field: 'days_no_sale', headerName: 'Days No Sale', minWidth: 160, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'category', headerName: 'Category', minWidth: 160, flex: 1 },
      { field: 'action', headerName: 'Action', minWidth: 170, flex: 1 },
      { field: 'value', headerName: 'Value ($)', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
    ],
    'supply-dashboard': [
      { field: 'sku', headerName: 'SKU', minWidth: 150, flex: 1 },
      { field: 'weekly_demand', headerName: 'Weekly Demand', minWidth: 170, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'safety_stock', headerName: 'Safety Stock', minWidth: 150, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'dc_on_hand', headerName: 'DC On Hand', minWidth: 150, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'dc_on_order', headerName: 'DC On Order', minWidth: 160, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'plant_supply_req', headerName: 'Plant Supply Req', minWidth: 180, flex: 1.1, type: 'number', align: 'center', headerAlign: 'center', cellClassName: 'highlight-cell' },
    ],
    'production-optimizer': [
      { field: 'product_family', headerName: 'Product Family', minWidth: 200, flex: 1.2 },
      { field: 'campaign_size', headerName: 'Campaign Size', minWidth: 170, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'changeover_time', headerName: 'Changeover Time', minWidth: 180, flex: 1.1 },
      { field: 'capacity_util', headerName: 'Capacity Util %', minWidth: 170, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'production_days', headerName: 'Production Days', minWidth: 180, flex: 1.1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'efficiency', headerName: 'Efficiency %', minWidth: 160, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
    ],
    'mrp-accelerator': [
      { field: 'sku', headerName: 'SKU', minWidth: 150, flex: 1 },
      { field: 'planned_order', headerName: 'Planned Order', minWidth: 170, flex: 1 },
      { field: 'quantity', headerName: 'Quantity', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'mrp_date', headerName: 'MRP Date', minWidth: 150, flex: 1 },
      { field: 'lead_time', headerName: 'Lead Time (days)', minWidth: 170, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'status', headerName: 'Status', minWidth: 170, flex: 1, align: 'center', headerAlign: 'center', renderCell: (params) => (
        <Chip label={params.value} color={params.value === 'Auto-Approved' ? 'success' : params.value === 'Expedited' ? 'error' : 'warning'} size="small" />
      )},
    ],
    'bom-analyzer': [
      { field: 'fg_sku', headerName: 'FG SKU', minWidth: 150, flex: 1 },
      { field: 'plant_req', headerName: 'Plant Req', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'component', headerName: 'Component', minWidth: 200, flex: 1.2 },
      { field: 'qty_per_fg', headerName: 'Qty per FG', minWidth: 150, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'component_req', headerName: 'Component Req', minWidth: 170, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'supplier', headerName: 'Supplier', minWidth: 170, flex: 1 },
    ],
    'component-tracker': [
      { field: 'component', headerName: 'Component', minWidth: 170, flex: 1 },
      { field: 'used_in', headerName: 'Used In (FGs)', minWidth: 320, flex: 2 },
      { field: 'total_fgs', headerName: 'Total FGs', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'total_demand', headerName: 'Total Demand', minWidth: 160, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'on_hand', headerName: 'On Hand', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
    ],
    'bom-exceptions': [
      { field: 'sku', headerName: 'SKU', minWidth: 150, flex: 1 },
      { field: 'exception_type', headerName: 'Exception Type', minWidth: 200, flex: 1.2 },
      { field: 'component', headerName: 'Component', minWidth: 170, flex: 1 },
      { field: 'severity', headerName: 'Severity', minWidth: 140, flex: 0.9, align: 'center', headerAlign: 'center', renderCell: (params) => (
        <Chip label={params.value} color={params.value === 'High' ? 'error' : params.value === 'Medium' ? 'warning' : 'info'} size="small" />
      )},
      { field: 'action_required', headerName: 'Action Required', minWidth: 220, flex: 1.3 },
    ],
    'consolidation-engine': [
      { field: 'component', headerName: 'Component', minWidth: 170, flex: 1 },
      { field: 'used_in', headerName: 'Used In (FGs)', minWidth: 220, flex: 1.3 },
      { field: 'total_req', headerName: 'Total Req', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'current_inventory', headerName: 'Current Inventory', minWidth: 180, flex: 1.1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'purchase_qty', headerName: 'Purchase Qty', minWidth: 160, flex: 1, type: 'number', align: 'center', headerAlign: 'center', cellClassName: 'highlight-cell' },
      { field: 'supplier', headerName: 'Supplier', minWidth: 160, flex: 1 },
      { field: 'savings', headerName: 'Savings', minWidth: 140, flex: 0.9 },
    ],
    'procurement-dashboard': [
      { field: 'component', headerName: 'Component', minWidth: 170, flex: 1 },
      { field: 'consolidated_po', headerName: 'Consolidated PO', minWidth: 190, flex: 1.1 },
      { field: 'quantity', headerName: 'Quantity', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'supplier', headerName: 'Supplier', minWidth: 160, flex: 1 },
      { field: 'unit_cost', headerName: 'Unit Cost ($)', minWidth: 150, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'total_cost', headerName: 'Total Cost ($)', minWidth: 160, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'discount', headerName: 'Discount', minWidth: 140, flex: 0.9 },
      { field: 'savings', headerName: 'Savings ($)', minWidth: 150, flex: 1, type: 'number', align: 'center', headerAlign: 'center', cellClassName: 'highlight-cell' },
    ],
    'supplier-portal': [
      { field: 'supplier', headerName: 'Supplier', minWidth: 170, flex: 1 },
      { field: 'forecast_shared', headerName: 'Forecast Shared', minWidth: 180, flex: 1.1 },
      { field: 'last_po', headerName: 'Last PO', minWidth: 150, flex: 1 },
      { field: 'next_po_est', headerName: 'Next PO Est', minWidth: 160, flex: 1 },
      { field: 'delivery_performance', headerName: 'Delivery %', minWidth: 150, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'quality_score', headerName: 'Quality Score', minWidth: 160, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
    ],
    'scenario-planner': [
      { field: 'scenario', headerName: 'Scenario', minWidth: 150, flex: 1 },
      { field: 'sku', headerName: 'SKU', minWidth: 150, flex: 1 },
      { field: 'base_demand', headerName: 'Base Demand', minWidth: 160, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'promo_impact', headerName: 'Promo Impact', minWidth: 160, flex: 1 },
      { field: 'holiday_impact', headerName: 'Holiday Impact', minWidth: 170, flex: 1 },
      { field: 'forecasted_demand', headerName: 'Forecasted Demand', minWidth: 190, flex: 1.1, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'inventory_req', headerName: 'Inventory Req', minWidth: 170, flex: 1, type: 'number', align: 'center', headerAlign: 'center'},
    ],
    'kpi-dashboard': [
      { field: 'kpi', headerName: 'KPI', minWidth: 220, flex: 1.3 },
      { field: 'value', headerName: 'Value', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'target', headerName: 'Target', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'unit', headerName: 'Unit', minWidth: 120, flex: 0.8 },
      { field: 'trend', headerName: 'Trend', minWidth: 140, flex: 0.9 },
      { field: 'status', headerName: 'Status', minWidth: 150, flex: 1, align: 'center', headerAlign: 'center', renderCell: (params) => (
        <Chip label={params.value} color={params.value === 'Exceeds' ? 'success' : params.value === 'Meets' ? 'info' : 'warning'} size="small" />
      )},
    ],
    'predictive-analytics': [
      { field: 'date', headerName: 'Date', minWidth: 140, flex: 0.9 },
      { field: 'anomaly_type', headerName: 'Anomaly Type', minWidth: 170, flex: 1 },
      { field: 'sku', headerName: 'SKU', minWidth: 150, flex: 1 },
      { field: 'store', headerName: 'Store', minWidth: 150, flex: 1 },
      { field: 'expected', headerName: 'Expected', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'actual', headerName: 'Actual', minWidth: 140, flex: 0.9, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'variance', headerName: 'Variance', minWidth: 140, flex: 0.9 },
      { field: 'reason', headerName: 'Reason', minWidth: 220, flex: 1.3 },
    ],
    'working-capital-optimizer': [
      { field: 'sku', headerName: 'Material', minWidth: 90, flex: 0.6 },
      { field: 'sku_name', headerName: 'Material Name', minWidth: 180, flex: 1.2 },
      { field: 'plant', headerName: 'Plant', minWidth: 120, flex: 0.7 },
      { field: 'material_type', headerName: 'Type', minWidth: 70, flex: 0.4 },
      { field: 'inventory_value', headerName: 'Inv Value', minWidth: 100, flex: 0.7, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value >= 1000000 ? `$${(params.value/1000000).toFixed(1)}M` : `$${(params.value/1000).toFixed(0)}K` },
      { field: 'current_turns', headerName: 'Curr Turns', minWidth: 90, flex: 0.5, type: 'number', align: 'center', headerAlign: 'center', valueFormatter: (params) => params.value?.toFixed(1) },
      { field: 'target_turns', headerName: 'Target', minWidth: 70, flex: 0.4, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'dio', headerName: 'DIO', minWidth: 60, flex: 0.4, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'target_dio', headerName: 'Tgt DIO', minWidth: 70, flex: 0.4, type: 'number', align: 'center', headerAlign: 'center'},
      { field: 'wcp', headerName: 'WCP', minWidth: 70, flex: 0.4, align: 'center', headerAlign: 'center'},
      { field: 'cash_impact', headerName: 'Cash Impact', minWidth: 100, flex: 0.6, renderCell: (params) => (
        <Chip label={params.value} size="small" sx={{ fontWeight: 600 }} color={params.value?.startsWith('+') ? 'success' : params.value?.startsWith('-') ? 'error' : 'default'} />
      )},
      { field: 'status', headerName: 'Status', minWidth: 120, flex: 0.7, align: 'center', headerAlign: 'center', renderCell: (params) => (
        <Chip label={params.value} size="small" color={params.value === 'Optimal' ? 'success' : params.value === 'Action Required' ? 'error' : 'warning'} />
      )},
    ],
  };

  return columnConfigs[tileId] || [];
};

// KPI metrics for each tile
const getTileMetrics = (tileId, data) => {
  // Safety check
  if (!data || data.length === 0) {
    return [
      { label: 'Total Records', value: '0', icon: Assignment, color: '#06b6d4', trend: null },
      { label: 'Status', value: 'No Data', icon: Warning, color: '#f59e0b', trend: null },
    ];
  }

  const metricConfigs = {
    'sell-through-bridge': [
      { label: 'Total Channels', value: '4', icon: ShowChart, color: '#06b6d4', trend: null },
      { label: 'Avg Confidence', value: '88%', icon: CheckCircle, color: '#10b981', trend: '+2%' },
      { label: 'Forecast Accuracy', value: '92%', icon: TrendingUp, color: '#1a5a9e', trend: '+1.5%' },
      { label: 'Total Units', value: data.reduce((sum, row) => sum + (row.sellThrough || 0), 0), icon: Inventory, color: '#f59e0b', trend: null },
    ],
    'partner-pos-monitor': [
      { label: 'Active Partners', value: data.filter(r => r.status === 'Active').length, icon: CheckCircle, color: '#10b981', trend: null },
      { label: 'Avg Quality', value: '96%', icon: TrendingUp, color: '#1a5a9e', trend: '+3%' },
      { label: 'Error Feeds', value: data.filter(r => r.status === 'Error').length, icon: ErrorIcon, color: '#ef4444', trend: null },
      { label: 'Total Records', value: data.reduce((sum, row) => sum + (row.records || 0), 0).toLocaleString(), icon: Assignment, color: '#00357a', trend: null },
    ],
    'forecast-dashboard': [
      { label: 'Avg Accuracy', value: '95%', icon: CheckCircle, color: '#10b981', trend: '+2%' },
      { label: 'Avg MAPE', value: '5.2%', icon: TrendingDown, color: '#1a5a9e', trend: '-0.8%' },
      { label: 'Forecast Bias', value: '-1.2', icon: Warning, color: '#f59e0b', trend: 'Improving' },
      { label: 'Total SKUs', value: new Set(data.map(r => r.sku)).size, icon: Inventory, color: '#00357a', trend: null },
    ],
    'demand-analyzer': [
      { label: 'Total Demand', value: data.reduce((sum, row) => sum + (row.demand || 0), 0).toLocaleString(), icon: ShowChart, color: '#06b6d4', trend: '+12%' },
      { label: 'Dimensions', value: new Set(data.map(r => r.dimension)).size, icon: Assignment, color: '#10b981', trend: null },
      { label: 'Growth Rate', value: '+15%', icon: TrendingUp, color: '#1a5a9e', trend: 'YoY' },
      { label: 'Regions', value: new Set(data.map(r => r.region)).size, icon: Inventory, color: '#f59e0b', trend: null },
    ],
    'forecast-workbench': [
      { label: 'Total Forecasts', value: data.length, icon: Assignment, color: '#06b6d4', trend: null },
      { label: 'Overridden', value: data.filter(r => r.override !== null).length, icon: Warning, color: '#f59e0b', trend: null },
      { label: 'Approved', value: data.filter(r => r.status === 'Approved').length, icon: CheckCircle, color: '#10b981', trend: null },
      { label: 'With Promo', value: data.filter(r => r.promo === 'Y').length, icon: TrendingUp, color: '#00357a', trend: null },
    ],
    'demand-alerts': [
      { label: 'Total Alerts', value: data.length, icon: Warning, color: '#f59e0b', trend: null },
      { label: 'High Severity', value: data.filter(r => r.severity === 'High').length, icon: ErrorIcon, color: '#ef4444', trend: null },
      { label: 'Stockout Risks', value: data.filter(r => r.alert_type === 'Stockout Risk').length, icon: Inventory, color: '#06b6d4', trend: null },
      { label: 'Resolved', value: '0', icon: CheckCircle, color: '#10b981', trend: 'Pending' },
    ],
    'store-replenishment': [
      { label: 'Stores', value: new Set(data.map(r => r.store)).size, icon: LocalShipping, color: '#06b6d4', trend: null },
      { label: 'Total Replenishment', value: data.reduce((sum, row) => sum + (row.replenishment || 0), 0).toLocaleString(), icon: Inventory, color: '#10b981', trend: null },
      { label: 'In Transit', value: data.reduce((sum, row) => sum + (row.in_transit || 0), 0).toLocaleString(), icon: LocalShipping, color: '#1a5a9e', trend: null },
      { label: 'On Hand', value: data.reduce((sum, row) => sum + (row.on_hand || 0), 0).toLocaleString(), icon: Inventory, color: '#f59e0b', trend: null },
    ],
    'route-optimizer': [
      { label: 'Total Routes', value: data.length, icon: LocalShipping, color: '#06b6d4', trend: null },
      { label: 'Avg Capacity', value: '85%', icon: TrendingUp, color: '#10b981', trend: 'Optimal' },
      { label: 'Total Distance', value: data.reduce((sum, row) => sum + parseInt(row.distance), 0) + ' mi', icon: ShowChart, color: '#1a5a9e', trend: null },
      { label: 'Total Cost', value: '$' + data.reduce((sum, row) => sum + (row.cost || 0), 0).toLocaleString(), icon: AttachMoney, color: '#f59e0b', trend: '-5%' },
    ],
    'stockout-monitor': [
      { label: 'Critical Risks', value: data.filter(r => r.risk === 'Critical').length, icon: ErrorIcon, color: '#ef4444', trend: null },
      { label: 'High Risks', value: data.filter(r => r.risk === 'High').length, icon: Warning, color: '#f59e0b', trend: null },
      { label: 'Avg Days to Stockout', value: Math.round(data.reduce((sum, row) => sum + (row.days_to_stockout || 0), 0) / data.length) + ' days', icon: ShowChart, color: '#1a5a9e', trend: null },
      { label: 'Total SKUs at Risk', value: data.length, icon: Inventory, color: '#00357a', trend: null },
    ],
    'channel-allocation': [
      { label: 'Total SKUs', value: data.length, icon: Inventory, color: '#06b6d4', trend: null },
      { label: 'DC Available', value: data.reduce((sum, row) => sum + (row.dc_available || 0), 0).toLocaleString(), icon: CheckCircle, color: '#10b981', trend: null },
      { label: 'Total Demand', value: data.reduce((sum, row) => sum + (row.total_demand || 0), 0).toLocaleString(), icon: TrendingUp, color: '#ef4444', trend: 'Shortage' },
      { label: 'Fulfillment Rate', value: '75%', icon: ShowChart, color: '#f59e0b', trend: '-10%' },
    ],
    'dc-cockpit': [
      { label: 'Total On Hand', value: data.reduce((sum, row) => sum + (row.on_hand || 0), 0).toLocaleString(), icon: Inventory, color: '#06b6d4', trend: null },
      { label: 'In Transit', value: data.reduce((sum, row) => sum + (row.in_transit || 0), 0).toLocaleString(), icon: LocalShipping, color: '#10b981', trend: null },
      { label: 'Available ATP', value: data.reduce((sum, row) => sum + (row.available || 0), 0).toLocaleString(), icon: CheckCircle, color: '#1a5a9e', trend: '+5%' },
      { label: 'Total Allocated', value: data.reduce((sum, row) => sum + (row.allocated_ch01 || 0) + (row.allocated_ch02 || 0), 0).toLocaleString(), icon: Assignment, color: '#f59e0b', trend: null },
    ],
    'working-capital': [
      { label: 'Total Inventory Value', value: '$' + data.reduce((sum, row) => sum + (row.inventory_value || 0), 0).toLocaleString(), icon: AttachMoney, color: '#06b6d4', trend: null },
      { label: 'Avg Turns', value: (data.reduce((sum, row) => sum + (row.turns || 0), 0) / data.length).toFixed(1) + 'x', icon: TrendingUp, color: '#10b981', trend: '+0.5x' },
      { label: 'Avg DIO', value: Math.round(data.reduce((sum, row) => sum + (row.dio || 0), 0) / data.length) + ' days', icon: ShowChart, color: '#1a5a9e', trend: '-4 days' },
      { label: 'Optimal SKUs', value: data.filter(r => r.status === 'Optimal').length, icon: CheckCircle, color: '#10b981', trend: null },
    ],
    'excess-obsolete': [
      { label: 'Total Items', value: data.length, icon: Inventory, color: '#ef4444', trend: null },
      { label: 'Total Value', value: '$' + data.reduce((sum, row) => sum + (row.value || 0), 0).toLocaleString(), icon: AttachMoney, color: '#f59e0b', trend: null },
      { label: 'End-of-Life', value: data.filter(r => r.category === 'End-of-Life').length, icon: ErrorIcon, color: '#ef4444', trend: null },
      { label: 'Obsolete', value: data.filter(r => r.category === 'Obsolete').length, icon: Warning, color: '#f59e0b', trend: 'Action Needed' },
    ],
    'supply-dashboard': [
      { label: 'Total SKUs', value: data.length, icon: Inventory, color: '#06b6d4', trend: null },
      { label: 'Total Supply Req', value: data.reduce((sum, row) => sum + (row.plant_supply_req || 0), 0).toLocaleString(), icon: Assignment, color: '#10b981', trend: null },
      { label: 'Weekly Demand', value: data.reduce((sum, row) => sum + (row.weekly_demand || 0), 0).toLocaleString(), icon: TrendingUp, color: '#1a5a9e', trend: null },
      { label: 'DC On Hand', value: data.reduce((sum, row) => sum + (row.dc_on_hand || 0), 0).toLocaleString(), icon: Inventory, color: '#f59e0b', trend: null },
    ],
    'production-optimizer': [
      { label: 'Total Campaigns', value: data.length, icon: Assignment, color: '#06b6d4', trend: null },
      { label: 'Avg Capacity', value: Math.round(data.reduce((sum, row) => sum + (row.capacity_util || 0), 0) / data.length) + '%', icon: TrendingUp, color: '#10b981', trend: 'Optimal' },
      { label: 'Avg Efficiency', value: Math.round(data.reduce((sum, row) => sum + (row.efficiency || 0), 0) / data.length) + '%', icon: CheckCircle, color: '#1a5a9e', trend: '+2%' },
      { label: 'Total Production Days', value: data.reduce((sum, row) => sum + (row.production_days || 0), 0), icon: ShowChart, color: '#f59e0b', trend: null },
    ],
    'mrp-accelerator': [
      { label: 'Planned Orders', value: data.length, icon: Assignment, color: '#06b6d4', trend: null },
      { label: 'Auto-Approved', value: data.filter(r => r.status === 'Auto-Approved').length, icon: CheckCircle, color: '#10b981', trend: 'AI-Driven' },
      { label: 'Expedited', value: data.filter(r => r.status === 'Expedited').length, icon: Warning, color: '#ef4444', trend: null },
      { label: 'Total Quantity', value: data.reduce((sum, row) => sum + (row.quantity || 0), 0).toLocaleString(), icon: Inventory, color: '#1a5a9e', trend: null },
    ],
    'bom-analyzer': [
      { label: 'Total FGs', value: new Set(data.map(r => r.fg_sku)).size, icon: Inventory, color: '#06b6d4', trend: null },
      { label: 'Total Components', value: new Set(data.map(r => r.component)).size, icon: Assignment, color: '#10b981', trend: null },
      { label: 'Component Req', value: data.reduce((sum, row) => sum + (row.component_req || 0), 0).toLocaleString(), icon: TrendingUp, color: '#1a5a9e', trend: null },
      { label: 'Suppliers', value: new Set(data.map(r => r.supplier)).size, icon: CheckCircle, color: '#f59e0b', trend: null },
    ],
    'component-tracker': [
      { label: 'Total Components', value: data.length, icon: Inventory, color: '#06b6d4', trend: null },
      { label: 'Total Demand', value: data.reduce((sum, row) => sum + (row.total_demand || 0), 0).toLocaleString(), icon: TrendingUp, color: '#10b981', trend: null },
      { label: 'On Hand', value: data.reduce((sum, row) => sum + (row.on_hand || 0), 0).toLocaleString(), icon: CheckCircle, color: '#1a5a9e', trend: null },
      { label: 'Used in FGs', value: data.reduce((sum, row) => sum + (row.total_fgs || 0), 0), icon: Assignment, color: '#f59e0b', trend: null },
    ],
    'bom-exceptions': [
      { label: 'Total Exceptions', value: data.length, icon: Warning, color: '#ef4444', trend: null },
      { label: 'High Severity', value: data.filter(r => r.severity === 'High').length, icon: ErrorIcon, color: '#ef4444', trend: 'Critical' },
      { label: 'Medium Severity', value: data.filter(r => r.severity === 'Medium').length, icon: Warning, color: '#f59e0b', trend: null },
      { label: 'Low Severity', value: data.filter(r => r.severity === 'Low').length, icon: CheckCircle, color: '#1a5a9e', trend: null },
    ],
    'consolidation-engine': [
      { label: 'Components', value: data.length, icon: Inventory, color: '#06b6d4', trend: null },
      { label: 'Total Savings', value: '$' + data.reduce((sum, row) => {
        try {
          return sum + (parseInt(row.savings?.replace(/[$,]/g, '') || '0') || 0);
        } catch {
          return sum;
        }
      }, 0).toLocaleString(), icon: AttachMoney, color: '#10b981', trend: '+20%' },
      { label: 'Purchase Qty', value: data.reduce((sum, row) => sum + (row.purchase_qty || 0), 0).toLocaleString(), icon: TrendingUp, color: '#1a5a9e', trend: null },
      { label: 'Suppliers', value: new Set(data.map(r => r.supplier)).size, icon: CheckCircle, color: '#f59e0b', trend: 'Consolidated' },
    ],
    'procurement-dashboard': [
      { label: 'Consolidated POs', value: data.length, icon: Assignment, color: '#06b6d4', trend: null },
      { label: 'Total Cost', value: '$' + data.reduce((sum, row) => sum + (row.total_cost || 0), 0).toLocaleString(), icon: AttachMoney, color: '#10b981', trend: null },
      { label: 'Total Savings', value: '$' + data.reduce((sum, row) => sum + (row.savings || 0), 0).toLocaleString(), icon: TrendingUp, color: '#1a5a9e', trend: '+18%' },
      { label: 'Avg Discount', value: '18%', icon: CheckCircle, color: '#f59e0b', trend: 'Volume Discount' },
    ],
    'supplier-portal': [
      { label: 'Total Suppliers', value: data.length, icon: Assignment, color: '#06b6d4', trend: null },
      { label: 'Forecast Shared', value: data.filter(r => r.forecast_shared === 'Yes').length, icon: CheckCircle, color: '#10b981', trend: null },
      { label: 'Avg Delivery', value: Math.round(data.reduce((sum, row) => sum + (row.delivery_performance || 0), 0) / data.length) + '%', icon: TrendingUp, color: '#1a5a9e', trend: '+2%' },
      { label: 'Avg Quality', value: Math.round(data.reduce((sum, row) => sum + (row.quality_score || 0), 0) / data.length) + '%', icon: CheckCircle, color: '#f59e0b', trend: '+1%' },
    ],
    'scenario-planner': [
      { label: 'Scenarios', value: new Set(data.map(r => r.scenario)).size, icon: Assignment, color: '#06b6d4', trend: null },
      { label: 'Best Case Demand', value: data.filter(r => r.scenario === 'Best Case').reduce((sum, row) => sum + (row.forecasted_demand || 0), 0), icon: TrendingUp, color: '#10b981', trend: '+75%' },
      { label: 'Likely Demand', value: data.filter(r => r.scenario === 'Likely').reduce((sum, row) => sum + (row.forecasted_demand || 0), 0), icon: ShowChart, color: '#1a5a9e', trend: 'Baseline' },
      { label: 'Worst Case Demand', value: data.filter(r => r.scenario === 'Worst Case').reduce((sum, row) => sum + (row.forecasted_demand || 0), 0), icon: TrendingDown, color: '#f59e0b', trend: '-25%' },
    ],
    'kpi-dashboard': [
      { label: 'Total KPIs', value: data.length, icon: ShowChart, color: '#06b6d4', trend: null },
      { label: 'Exceeds Target', value: data.filter(r => r.status === 'Exceeds').length, icon: CheckCircle, color: '#10b981', trend: 'Excellent' },
      { label: 'Meets Target', value: data.filter(r => r.status === 'Meets').length, icon: CheckCircle, color: '#1a5a9e', trend: 'Good' },
      { label: 'Below Target', value: data.filter(r => r.status === 'Below').length, icon: Warning, color: '#f59e0b', trend: 'Review' },
    ],
    'predictive-analytics': [
      { label: 'Total Anomalies', value: data.length, icon: Warning, color: '#ef4444', trend: null },
      { label: 'Demand Spikes', value: data.filter(r => r.anomaly_type === 'Demand Spike').length, icon: TrendingUp, color: '#10b981', trend: null },
      { label: 'Stockouts', value: data.filter(r => r.anomaly_type === 'Stockout').length, icon: ErrorIcon, color: '#ef4444', trend: null },
      { label: 'Avg Variance', value: '55%', icon: ShowChart, color: '#1a5a9e', trend: 'High' },
    ],
    'working-capital-optimizer': [
      { label: 'Total Inventory Value', value: (() => {
        const total = data.reduce((sum, row) => sum + (row.inventory_value || 0), 0);
        return total >= 1000000 ? `$${(total/1000000).toFixed(1)}M` : `$${(total/1000).toFixed(0)}K`;
      })(), icon: AttachMoney, color: '#06b6d4', trend: null },
      { label: 'Optimal SKUs', value: data.filter(r => r.status === 'Optimal').length, icon: CheckCircle, color: '#10b981', trend: null },
      { label: 'Action Required', value: data.filter(r => r.status === 'Action Required').length, icon: Warning, color: '#ef4444', trend: null },
      { label: 'WC Release Potential', value: (() => {
        const total = data.reduce((sum, row) => sum + (row.cash_impact_value || 0), 0);
        return total >= 0 ? `+$${(total/1000000).toFixed(1)}M` : `-$${(Math.abs(total)/1000000).toFixed(1)}M`;
      })(), icon: TrendingUp, color: '#1a5a9e', trend: 'Optimization' },
    ],
  };

  return metricConfigs[tileId] || [
    { label: 'Total Records', value: data.length, icon: Assignment, color: '#06b6d4', trend: null },
    { label: 'Status', value: 'Active', icon: CheckCircle, color: '#10b981', trend: null },
  ];
};

const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const FioriTileDetail = ({ tileId, tileTitle, moduleColor, onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [tileId]);

  const fetchData = () => {
    setLoading(true);
    try {
      // Removed setTimeout for instant loading with mock data
      const generatedData = generateTileData(tileId);
      setData(generatedData || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Simple CSV export instead of XLSX
    const csvContent = [
      columns.map(col => col.headerName).join(','),
      ...data.map(row => columns.map(col => row[col.field] || '').join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tileId}_export.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns = getColumnConfig(tileId);
  const metrics = getTileMetrics(tileId, data);

  // Debug info
  console.log('FioriTileDetail rendering:', { tileId, dataLength: data.length, metricsCount: metrics.length });

  return (
    <Box sx={{ p: 2, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: colors.background }}>
      {/* Header */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body2" onClick={() => onBack('core')}>
              CORE.AI
            </Link>
            <Link component="button" variant="body2" onClick={() => onBack('stox')}>
              STOX.AI
            </Link>
            <Link component="button" variant="body2" onClick={() => onBack('module')}>
              Module
            </Link>
            <Typography color="primary" variant="body2" fontWeight={600}>
              {tileTitle}
            </Typography>
          </Breadcrumbs>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh Data">
              <IconButton onClick={fetchData} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => onBack('module')}
              variant="outlined"
              size="small"
            >
              Back
            </Button>
          </Stack>
        </Stack>

        <Typography variant="h5" fontWeight={700} sx={{ color: darkMode ? colors.text : moduleColor }}>
          {tileTitle}
        </Typography>
      </Box>

      {/* KPI Metrics Cards */}
      {!loading && data.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 2, flexShrink: 0 }}>
          {metrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{
                height: '100vh',
                borderLeft: `4px solid ${metric.color}`,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
                bgcolor: colors.cardBg,
                border: `1px solid ${colors.border}`,
              }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Avatar sx={{
                      bgcolor: alpha(metric.color, 0.1),
                      color: metric.color,
                      width: 40,
                      height: 40,
                    }}>
                      <metric.icon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.25 }}>
                        {metric.label}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 0.25, color: colors.text }}>
                        {metric.value}
                      </Typography>
                      {metric.trend && (
                        <Chip
                          label={metric.trend}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            bgcolor: alpha(metric.color, 0.1),
                            color: metric.color,
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Loading Skeleton for Metrics */}
      {loading && (
        <Grid container spacing={2} sx={{ mb: 2, flexShrink: 0 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ height: '100vh' , bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Avatar sx={{ bgcolor: alpha('#ccc', 0.3), width: 40, height: 40 }}>
                      <ShowChart sx={{ fontSize: 20, color: '#ccc' }} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ bgcolor: alpha('#ccc', 0.3), height: 12, width: '60%', mb: 0.5, borderRadius: 1 }} />
                      <Box sx={{ bgcolor: alpha('#ccc', 0.3), height: 20, width: '80%', mb: 0.5, borderRadius: 1 }} />
                      <Box sx={{ bgcolor: alpha('#ccc', 0.3), height: 14, width: '40%', borderRadius: 1 }} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Data Grid */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
          <DataGrid
            rows={data}
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
            sx={{
              flex: 1,
              '& .highlight-cell': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                fontWeight: 600,
              },
              '& .MuiDataGrid-cell': {
                fontSize: '0.8rem',
                color: colors.text,
                borderBottom: `1px solid ${colors.border}`,
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: darkMode ? colors.cardBg : moduleColor,
                color: darkMode ? colors.text : 'white',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderBottom: `1px solid ${colors.border}`,
              },
              '& .MuiDataGrid-row': {
                '&:hover': {
                  backgroundColor: alpha(colors.primary, 0.08),
                },
              },
              '& .MuiDataGrid-footerContainer': {
                backgroundColor: colors.cardBg,
                borderTop: `1px solid ${colors.border}`,
                color: colors.text,
              },
            }}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            disableRowSelectionOnClick
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default FioriTileDetail;
