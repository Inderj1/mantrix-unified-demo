/**
 * Working Capital Baseline Mock Data - Arizona Beverages
 * Provides comprehensive mock datasets for WC decomposition analysis
 *
 * Uses actual Arizona Beverages plant and material data for consistency
 */

import { LAM_PLANTS, LAM_MATERIALS, LAM_MATERIAL_PLANT_DATA, getMaterialById } from '../../../data/arizonaBeveragesMasterData';

// Re-export plants and materials for backward compatibility
export const plants = LAM_PLANTS.map(p => ({
  id: p.id,
  name: p.name,
  region: p.region,
  grossMarginPct: p.grossMarginPct,
  carryingCostPct: p.carryingCostPct,
}));

export const skus = LAM_MATERIALS.map(m => ({
  id: m.id,
  name: m.name,
  category: m.materialGroup,
  type: m.type,
  unitCost: m.basePrice,
  grossMargin: m.basePrice * 0.38, // 38% typical gross margin
}));

/**
 * Generate Working Capital Baseline data for all SKU × Plant combinations
 * Uses actual LAM_MATERIAL_PLANT_DATA for realistic values
 *
 * Key Formulas:
 * - Cycle Stock = Lot Size / 2 (average during replenishment cycle)
 * - Safety Stock = z × σ × √LT (service level factor × demand std × sqrt lead time)
 * - Pipeline Stock = Lead Time × Daily Demand (in-transit inventory)
 * - Excess Stock = On-Hand - (Cycle + Safety + Pipeline) when positive
 *
 * - WCP (Working Capital Productivity) = Annual Gross Margin $ / Average WC
 * - DIO (Days Inventory Outstanding) = (Average Inventory / COGS) × 365
 */
export const generateWorkingCapitalData = () => {
  const data = [];
  let idCounter = 1;

  LAM_MATERIAL_PLANT_DATA.forEach((mpd) => {
    const material = getMaterialById(mpd.materialId);
    const plant = LAM_PLANTS.find(p => p.id === mpd.plant);

    if (!material || !plant) return;

    // Calculate inventory value
    const inventoryValue = mpd.totalStock * material.basePrice;

    // Decompose inventory into components (estimated based on material type)
    const isFG = material.type === 'FERT';
    const isSFG = material.type === 'HALB';

    // Cycle stock: ~35% for FG, ~40% for SFG, ~30% for RAW
    const cycleStockPct = isFG ? 0.35 : isSFG ? 0.40 : 0.30;
    // Safety stock: ~25% for FG, ~30% for SFG, ~35% for RAW
    const safetyStockPct = isFG ? 0.25 : isSFG ? 0.30 : 0.35;
    // Pipeline stock: based on lead time ratio (~lead time / (lead time + 30))
    const pipelineStockPct = mpd.leadTime / (mpd.leadTime + 60);
    // Excess: from actual data excessStock field
    const excessStockValue = mpd.excessStock || 0;

    // Calculate base inventory (excluding excess)
    const baseInventoryValue = inventoryValue - excessStockValue;
    const cycleStockValue = Math.round(baseInventoryValue * cycleStockPct);
    const safetyStockValue = Math.round(baseInventoryValue * safetyStockPct);
    const pipelineStockValue = Math.round(baseInventoryValue * pipelineStockPct);

    // Recalculate total to ensure it matches
    const totalWCValue = cycleStockValue + safetyStockValue + pipelineStockValue + excessStockValue;

    // Calculate WCP (Working Capital Productivity)
    // WCP = Annual Gross Margin / Average Working Capital
    const dailyDemand = mpd.totalStock / (mpd.dos || 90); // Estimate daily demand from DOS
    const annualGrossMargin = dailyDemand * 365 * material.basePrice * (plant.grossMarginPct || 0.38);
    const wcp = totalWCValue > 0 ? (annualGrossMargin / totalWCValue) : 0;

    // DIO = 365 / Turns (directly from actual data)
    const dio = mpd.turns > 0 ? Math.round(365 / mpd.turns) : 999;

    // Optimal values (what it should be) - based on target turns
    const targetTurns = isFG ? 4 : isSFG ? 6 : 8;
    const optimalSafetyStock = Math.round(safetyStockValue * 0.85); // 15% reduction opportunity
    const optimalCycleStock = Math.round(cycleStockValue * 0.90); // 10% reduction with better EOQ
    const optimalTotalWC = optimalCycleStock + optimalSafetyStock + pipelineStockValue;
    const wcSavingsOpportunity = Math.max(0, totalWCValue - optimalTotalWC);

    // Carrying cost (annual) - use plant-specific rate
    const carryingRate = plant.carryingCostPct || 0.22;
    const annualCarryingCost = totalWCValue * carryingRate;
    const potentialCarryingSavings = Math.round(wcSavingsOpportunity * carryingRate);

    // Health status based on actual KPIs
    const excessRatio = excessStockValue / totalWCValue;
    let healthStatus;
    if (mpd.dos > 365) {
      healthStatus = 'Dead Stock';
    } else if (excessRatio > 0.2 || mpd.turns < 1) {
      healthStatus = 'Critical';
    } else if (excessRatio > 0.1 || mpd.turns < 2 || wcp < 2) {
      healthStatus = 'At Risk';
    } else if (wcp >= 4 && mpd.turns >= targetTurns) {
      healthStatus = 'Excellent';
    } else {
      healthStatus = 'Good';
    }

    data.push({
      id: `WC${String(idCounter++).padStart(5, '0')}`,
      plant_id: plant.id,
      plant_name: plant.name,
      region: plant.region,
      sku_id: material.id,
      sku_name: material.name,
      category: material.materialGroup,
      material_type: material.type,
      unit_cost: material.basePrice,
      gross_margin: material.basePrice * (plant.grossMarginPct || 0.38),
      daily_demand: Math.round(dailyDemand * 10) / 10,
      lead_time_days: mpd.leadTime,
      lot_size: mpd.lotSize || Math.round(dailyDemand * 30),
      service_level: (92 + Math.random() * 7).toFixed(1),

      // Actual inventory data from source
      total_stock: mpd.totalStock,
      turns: mpd.turns,
      dos: Math.round(mpd.dos),
      fill_rate: mpd.fillRate,
      abc: mpd.abc,
      xyz: mpd.xyz,
      stockouts: mpd.stockouts,

      // Working Capital decomposition ($)
      cycle_stock_value: cycleStockValue,
      safety_stock_value: safetyStockValue,
      pipeline_stock_value: pipelineStockValue,
      excess_stock_value: Math.round(excessStockValue),
      total_wc_value: Math.round(totalWCValue),

      // Optimal values
      optimal_safety_stock: optimalSafetyStock,
      optimal_cycle_stock: optimalCycleStock,
      optimal_total_wc: Math.round(optimalTotalWC),
      wc_savings_opportunity: Math.round(wcSavingsOpportunity),

      // Key metrics
      wcp: parseFloat(wcp.toFixed(2)), // Working Capital Productivity
      dio: dio, // Days Inventory Outstanding
      annual_carrying_cost: Math.round(annualCarryingCost),
      potential_carrying_savings: potentialCarryingSavings,

      // Status
      health_status: healthStatus,

      // Percentages for visualization
      cycle_pct: totalWCValue > 0 ? Math.round((cycleStockValue / totalWCValue) * 100) : 0,
      safety_pct: totalWCValue > 0 ? Math.round((safetyStockValue / totalWCValue) * 100) : 0,
      pipeline_pct: totalWCValue > 0 ? Math.round((pipelineStockValue / totalWCValue) * 100) : 0,
      excess_pct: totalWCValue > 0 ? Math.round((excessStockValue / totalWCValue) * 100) : 0,
    });
  });

  return data;
};

/**
 * Generate summary metrics for Working Capital Baseline
 */
export const generateSummaryMetrics = (data) => {
  if (!data || data.length === 0) {
    return {
      totalWC: 0,
      totalCycleStock: 0,
      totalSafetyStock: 0,
      totalPipelineStock: 0,
      totalExcessStock: 0,
      totalSavingsOpportunity: 0,
      totalPotentialCarrySavings: 0,
      avgWCP: '0',
      avgDIO: 0,
      skuCount: 0,
      criticalCount: 0,
      atRiskCount: 0,
    };
  }

  const totalWC = data.reduce((sum, row) => sum + row.total_wc_value, 0);
  const totalCycleStock = data.reduce((sum, row) => sum + row.cycle_stock_value, 0);
  const totalSafetyStock = data.reduce((sum, row) => sum + row.safety_stock_value, 0);
  const totalPipelineStock = data.reduce((sum, row) => sum + row.pipeline_stock_value, 0);
  const totalExcessStock = data.reduce((sum, row) => sum + row.excess_stock_value, 0);
  const totalSavingsOpportunity = data.reduce((sum, row) => sum + row.wc_savings_opportunity, 0);
  const totalPotentialCarrySavings = data.reduce((sum, row) => sum + row.potential_carrying_savings, 0);
  const avgWCP = data.length > 0 ? data.reduce((sum, row) => sum + row.wcp, 0) / data.length : 0;
  const avgDIO = data.length > 0 ? Math.round(data.reduce((sum, row) => sum + row.dio, 0) / data.length) : 0;

  return {
    totalWC,
    totalCycleStock,
    totalSafetyStock,
    totalPipelineStock,
    totalExcessStock,
    totalSavingsOpportunity,
    totalPotentialCarrySavings,
    avgWCP: avgWCP.toFixed(2),
    avgDIO,
    skuCount: data.length,
    criticalCount: data.filter(d => d.health_status === 'Critical' || d.health_status === 'Dead Stock').length,
    atRiskCount: data.filter(d => d.health_status === 'At Risk').length,
  };
};

/**
 * Weekly trend data for WC over 12 weeks
 * Based on actual Arizona Beverages total inventory value
 */
export const generateWCTrendData = () => {
  const weeks = [];
  // Calculate base WC from actual data
  const wcData = generateWorkingCapitalData();
  const baseWC = wcData.reduce((sum, row) => sum + row.total_wc_value, 0);

  for (let i = 0; i < 12; i++) {
    const weekNum = i + 1;
    // Simulate gradual improvement with some noise
    const improvement = i * 0.008; // 0.8% improvement per week
    const noise = (Math.random() - 0.5) * 0.02; // ±1% noise
    const wcValue = baseWC * (1 - improvement + noise);

    weeks.push({
      week: `W${weekNum}`,
      weekLabel: `Week ${weekNum}`,
      totalWC: Math.round(wcValue),
      cycleStock: Math.round(wcValue * 0.35),
      safetyStock: Math.round(wcValue * 0.28),
      pipelineStock: Math.round(wcValue * 0.22),
      excessStock: Math.round(wcValue * 0.15 * (1 - i * 0.06)), // Excess decreasing
    });
  }

  return weeks;
};

export default {
  plants,
  skus,
  generateWorkingCapitalData,
  generateSummaryMetrics,
  generateWCTrendData,
};
