/**
 * Working Capital Baseline Mock Data
 * Provides comprehensive mock datasets for WC decomposition analysis
 */

// Plants data
export const plants = [
  { id: 'PLANT-001', name: 'Chicago Distribution', region: 'Midwest' },
  { id: 'PLANT-002', name: 'Dallas Hub', region: 'South' },
  { id: 'PLANT-003', name: 'Newark Warehouse', region: 'East' },
  { id: 'PLANT-004', name: 'Phoenix Center', region: 'West' },
];

// SKUs with unit costs and margins
export const skus = [
  { id: 'SKU-10001', name: 'Premium Hair Color - Blonde', category: 'Hair Color', unitCost: 12.50, grossMargin: 18.75, dailyDemand: 45 },
  { id: 'SKU-10002', name: 'Premium Hair Color - Brunette', category: 'Hair Color', unitCost: 12.50, grossMargin: 18.75, dailyDemand: 62 },
  { id: 'SKU-10003', name: 'Premium Hair Color - Black', category: 'Hair Color', unitCost: 12.50, grossMargin: 18.75, dailyDemand: 38 },
  { id: 'SKU-10004', name: 'Root Touch-Up Spray', category: 'Touch-Up', unitCost: 8.00, grossMargin: 14.00, dailyDemand: 85 },
  { id: 'SKU-10005', name: 'Intensive Hair Mask', category: 'Treatment', unitCost: 15.00, grossMargin: 22.00, dailyDemand: 28 },
  { id: 'SKU-10006', name: 'Color Protect Shampoo', category: 'Shampoo', unitCost: 6.50, grossMargin: 11.50, dailyDemand: 120 },
  { id: 'SKU-10007', name: 'Color Protect Conditioner', category: 'Conditioner', unitCost: 7.00, grossMargin: 12.00, dailyDemand: 95 },
  { id: 'SKU-10008', name: 'Styling Gel - Strong Hold', category: 'Styling', unitCost: 5.50, grossMargin: 9.50, dailyDemand: 55 },
];

/**
 * Generate Working Capital Baseline data for all SKU × Plant combinations
 *
 * Key Formulas:
 * - Cycle Stock = Lot Size / 2 (average during replenishment cycle)
 * - Safety Stock = z × σ × √LT (service level factor × demand std × sqrt lead time)
 * - Pipeline Stock = Lead Time × Daily Demand
 * - Excess Stock = On-Hand - (Cycle + Safety + Pipeline) when positive
 *
 * - WCP (Working Capital Productivity) = Annual Gross Margin $ / Average WC
 * - DIO (Days Inventory Outstanding) = (Average Inventory / COGS) × 365
 */
export const generateWorkingCapitalData = () => {
  const data = [];
  let idCounter = 1;

  plants.forEach((plant) => {
    skus.forEach((sku) => {
      // Variability factors by plant
      const plantFactor = {
        'PLANT-001': 1.0,
        'PLANT-002': 1.15,
        'PLANT-003': 0.95,
        'PLANT-004': 1.08,
      }[plant.id] || 1.0;

      // Base parameters
      const dailyDemand = Math.round(sku.dailyDemand * plantFactor);
      const leadTimeDays = Math.round(7 + Math.random() * 14); // 7-21 days
      const lotSize = Math.round(dailyDemand * (14 + Math.random() * 21)); // 2-5 weeks of demand
      const demandStdDev = Math.round(dailyDemand * (0.15 + Math.random() * 0.25)); // 15-40% CV
      const serviceLevel = 0.95 + Math.random() * 0.04; // 95-99%
      const zScore = serviceLevel > 0.98 ? 2.33 : serviceLevel > 0.95 ? 1.96 : 1.65;

      // Calculate inventory components (in units)
      const cycleStockUnits = Math.round(lotSize / 2);
      const safetyStockUnits = Math.round(zScore * demandStdDev * Math.sqrt(leadTimeDays));
      const pipelineStockUnits = Math.round(leadTimeDays * dailyDemand);

      // Some SKUs have excess (policy errors)
      const hasExcess = Math.random() > 0.7;
      const excessStockUnits = hasExcess ? Math.round((0.1 + Math.random() * 0.3) * (cycleStockUnits + safetyStockUnits)) : 0;

      // Total on-hand inventory
      const totalUnits = cycleStockUnits + safetyStockUnits + pipelineStockUnits + excessStockUnits;

      // Convert to dollar values
      const cycleStockValue = cycleStockUnits * sku.unitCost;
      const safetyStockValue = safetyStockUnits * sku.unitCost;
      const pipelineStockValue = pipelineStockUnits * sku.unitCost;
      const excessStockValue = excessStockUnits * sku.unitCost;
      const totalWCValue = totalUnits * sku.unitCost;

      // Calculate WCP (Working Capital Productivity)
      // WCP = Annual Gross Margin / Average Working Capital
      const annualGrossMargin = dailyDemand * 365 * sku.grossMargin * 0.85; // 85% sell-through
      const wcp = totalWCValue > 0 ? (annualGrossMargin / totalWCValue) : 0;

      // Calculate DIO (Days Inventory Outstanding)
      // DIO = (Average Inventory Value / Annual COGS) × 365
      const annualCOGS = dailyDemand * 365 * sku.unitCost;
      const dio = annualCOGS > 0 ? Math.round((totalWCValue / annualCOGS) * 365) : 0;

      // Calculate optimal values (what it should be)
      const optimalSafetyStock = Math.round(safetyStockUnits * 0.85); // 15% reduction opportunity
      const optimalCycleStock = Math.round(cycleStockUnits * 0.90); // 10% reduction with better EOQ
      const optimalTotalWC = (optimalCycleStock + optimalSafetyStock + pipelineStockUnits) * sku.unitCost;
      const wcSavingsOpportunity = totalWCValue - optimalTotalWC - excessStockValue; // Exclude excess which should be 0

      // Carrying cost (annual) - typically 20-25% of inventory value
      const carryingRate = 0.22; // 22% annual carrying cost
      const annualCarryingCost = totalWCValue * carryingRate;
      const potentialCarryingSavings = wcSavingsOpportunity * carryingRate;

      // Risk indicator
      const excessRatio = excessStockValue / totalWCValue;
      let healthStatus;
      if (excessRatio > 0.2) {
        healthStatus = 'Critical';
      } else if (excessRatio > 0.1 || wcp < 2) {
        healthStatus = 'At Risk';
      } else if (wcp >= 4) {
        healthStatus = 'Excellent';
      } else {
        healthStatus = 'Good';
      }

      data.push({
        id: `WC${String(idCounter++).padStart(5, '0')}`,
        plant_id: plant.id,
        plant_name: plant.name,
        region: plant.region,
        sku_id: sku.id,
        sku_name: sku.name,
        category: sku.category,
        unit_cost: sku.unitCost,
        gross_margin: sku.grossMargin,
        daily_demand: dailyDemand,
        lead_time_days: leadTimeDays,
        lot_size: lotSize,
        service_level: (serviceLevel * 100).toFixed(1),

        // Inventory decomposition (units)
        cycle_stock_units: cycleStockUnits,
        safety_stock_units: safetyStockUnits,
        pipeline_stock_units: pipelineStockUnits,
        excess_stock_units: excessStockUnits,
        total_units: totalUnits,

        // Working Capital values ($)
        cycle_stock_value: Math.round(cycleStockValue),
        safety_stock_value: Math.round(safetyStockValue),
        pipeline_stock_value: Math.round(pipelineStockValue),
        excess_stock_value: Math.round(excessStockValue),
        total_wc_value: Math.round(totalWCValue),

        // Optimal values
        optimal_safety_stock: Math.round(optimalSafetyStock * sku.unitCost),
        optimal_cycle_stock: Math.round(optimalCycleStock * sku.unitCost),
        optimal_total_wc: Math.round(optimalTotalWC),
        wc_savings_opportunity: Math.round(wcSavingsOpportunity),

        // Key metrics
        wcp: parseFloat(wcp.toFixed(2)), // Working Capital Productivity
        dio: dio, // Days Inventory Outstanding
        annual_carrying_cost: Math.round(annualCarryingCost),
        potential_carrying_savings: Math.round(potentialCarryingSavings),

        // Status
        health_status: healthStatus,

        // Percentages for visualization
        cycle_pct: Math.round((cycleStockValue / totalWCValue) * 100),
        safety_pct: Math.round((safetyStockValue / totalWCValue) * 100),
        pipeline_pct: Math.round((pipelineStockValue / totalWCValue) * 100),
        excess_pct: Math.round((excessStockValue / totalWCValue) * 100),
      });
    });
  });

  return data;
};

/**
 * Generate summary metrics for Working Capital Baseline
 */
export const generateSummaryMetrics = (data) => {
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
    criticalCount: data.filter(d => d.health_status === 'Critical').length,
    atRiskCount: data.filter(d => d.health_status === 'At Risk').length,
  };
};

/**
 * Weekly trend data for WC over 12 weeks
 */
export const generateWCTrendData = () => {
  const weeks = [];
  let baseWC = 2800000; // Starting WC

  for (let i = 0; i < 12; i++) {
    const weekNum = i + 1;
    // Simulate gradual improvement with some noise
    const improvement = i * 0.015; // 1.5% improvement per week
    const noise = (Math.random() - 0.5) * 0.03; // ±1.5% noise
    const wcValue = baseWC * (1 - improvement + noise);

    weeks.push({
      week: `W${weekNum}`,
      weekLabel: `Week ${weekNum}`,
      totalWC: Math.round(wcValue),
      cycleStock: Math.round(wcValue * 0.35),
      safetyStock: Math.round(wcValue * 0.30),
      pipelineStock: Math.round(wcValue * 0.28),
      excessStock: Math.round(wcValue * 0.07 * (1 - i * 0.08)), // Excess decreasing
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
