import { useQuery } from 'react-query';

/**
 * Generic hook factory for STOX.AI data with automatic persistence
 *
 * @param {string} queryKey - Unique identifier for this data set
 * @param {Function} fetchFn - Function that returns the data (can be sync or async)
 * @param {Object} options - Additional React Query options
 * @returns {Object} { data, loading, error, refetch }
 */
export const useStoxData = (queryKey, fetchFn, options = {}) => {
  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery(
    queryKey,
    async () => {
      // Simulate async data fetching with delay
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(fetchFn());
        }, 800);
      });
    },
    {
      // Override defaults if needed
      ...options,
      // Ensure data persists
      cacheTime: options.cacheTime || 1000 * 60 * 60 * 24, // 24 hours
      staleTime: options.staleTime || 1000 * 60 * 5, // 5 minutes
    }
  );

  return {
    data: data || [],
    loading: isLoading || isFetching,
    error,
    refetch,
  };
};

/**
 * Hook for DC Demand Aggregation data
 */
export const useDCDemandData = () => {
  return useStoxData('dc-demand-aggregation', () => {
    const dcs = ['DC-East', 'DC-Midwest', 'DC-West'];
    const products = ['MR_HAIR_101', 'MR_HAIR_102', 'MR_HAIR_103'];
    const currentDate = '2025-01-11';
    const isoWeek = '2025-W02';

    const aggregationData = [];
    let idCounter = 1;

    dcs.forEach((dc) => {
      products.forEach((product) => {
        // Step 1: Individual channel forecasts
        const retailFcst = Math.round(400 + Math.random() * 200);
        const amazonFcst = Math.round(250 + Math.random() * 200);
        const wholesaleFcst = Math.round(100 + Math.random() * 100);
        const d2cFcst = Math.round(80 + Math.random() * 50);

        // Step 2: Daily DC Aggregation
        const dailyForecastDC = retailFcst + amazonFcst + wholesaleFcst + d2cFcst;

        // Channel variances (for statistical calculations)
        const retailStdDev = Math.round(retailFcst * 0.15);
        const amazonStdDev = Math.round(amazonFcst * 0.18);
        const wholesaleStdDev = Math.round(wholesaleFcst * 0.12);
        const d2cStdDev = Math.round(d2cFcst * 0.25);

        // Step 3: Statistical measures
        const rho = 0.3; // correlation coefficient

        // Independent variance
        const independentVar = Math.pow(retailStdDev, 2) + Math.pow(amazonStdDev, 2) +
                              Math.pow(wholesaleStdDev, 2) + Math.pow(d2cStdDev, 2);

        // Correlated variance
        const correlationTerm = 2 * rho * (
          retailStdDev * amazonStdDev + retailStdDev * wholesaleStdDev + retailStdDev * d2cStdDev +
          amazonStdDev * wholesaleStdDev + amazonStdDev * d2cStdDev + wholesaleStdDev * d2cStdDev
        );

        const dailyStdDevDC = Math.round(Math.sqrt(independentVar + correlationTerm));
        const weeklyMeanDC = dailyForecastDC * 7;
        const weeklyStdDevDC = Math.round(dailyStdDevDC * Math.sqrt(7));

        const numLocations = Math.round(15 + Math.random() * 35);
        const variance = Math.round((Math.random() - 0.5) * 100);
        const variancePct = ((Math.abs(variance) / dailyForecastDC) * 100).toFixed(1);

        aggregationData.push({
          id: `DA${String(idCounter++).padStart(4, '0')}`,
          date: currentDate,
          iso_week: isoWeek,
          dc_location: dc,
          product_sku: product,

          // Aggregated DC data
          daily_forecast_dc: dailyForecastDC,
          weekly_mean_dc: weeklyMeanDC,
          weekly_stddev_dc: weeklyStdDevDC,
          num_locations: numLocations,
          variance,
          variance_pct: parseFloat(variancePct),
          status: Math.abs(variance) < 50 ? 'Aligned' : parseFloat(variancePct) < 5 ? 'Good' : 'Review',

          // Retail channel
          retail_fcst: retailFcst,
          retail_stddev: retailStdDev,
          retail_weekly: retailFcst * 7,
          retail_pct: ((retailFcst / dailyForecastDC) * 100).toFixed(1),
          retail_trend: '+5%',
          retail_trend_dir: 'up',

          // Amazon channel
          amazon_fcst: amazonFcst,
          amazon_stddev: amazonStdDev,
          amazon_weekly: amazonFcst * 7,
          amazon_pct: ((amazonFcst / dailyForecastDC) * 100).toFixed(1),
          amazon_trend: '0%',
          amazon_trend_dir: 'flat',

          // Wholesale channel
          wholesale_fcst: wholesaleFcst,
          wholesale_stddev: wholesaleStdDev,
          wholesale_weekly: wholesaleFcst * 7,
          wholesale_pct: ((wholesaleFcst / dailyForecastDC) * 100).toFixed(1),
          wholesale_trend: '-2%',
          wholesale_trend_dir: 'down',

          // D2C channel
          d2c_fcst: d2cFcst,
          d2c_stddev: d2cStdDev,
          d2c_weekly: d2cFcst * 7,
          d2c_pct: ((d2cFcst / dailyForecastDC) * 100).toFixed(1),
          d2c_trend: '+8%',
          d2c_trend_dir: 'up',

          correlation_rho: rho,
        });
      });
    });

    return aggregationData;
  });
};

/**
 * Hook for DC Health Monitor data
 */
export const useDCHealthData = () => {
  return useStoxData('dc-health-monitor', () => {
    const healthData = [];
    const products = [
      { name: 'Conditioner 250 ml', sku: 'MR_HAIR_101' },
      { name: 'Shampoo 500 ml', sku: 'MR_HAIR_201' },
      { name: 'Hair Serum 100 ml', sku: 'MR_HAIR_301' },
      { name: 'Leave-In Treatment', sku: 'MR_HAIR_401' },
      { name: 'Root Touch-Up Kit', sku: 'MR_COLOR_501' },
    ];

    const dcs = ['DC-East', 'DC-West', 'DC-Central', 'DC-South'];
    let idCounter = 1;

    products.forEach((product) => {
      dcs.forEach((dc) => {
        const weeklyMU = Math.floor(Math.random() * 800) + 200;
        const safetyStock = Math.floor(weeklyMU * 0.15);
        const rop = Math.floor(weeklyMU * 2 + safetyStock);
        const target = Math.floor(weeklyMU * 1.1);
        const onHand = Math.floor(Math.random() * 1500) + 500;
        const available = onHand - Math.floor(Math.random() * 200);
        const healthPct = Math.min(1, available / target);
        const channels = `Retail Stores (${Math.floor(Math.random() * 10) + 3} stores)`;

        healthData.push({
          id: `DH${String(idCounter++).padStart(4, '0')}`,
          dc_location: dc,
          product_sku: product.sku,
          product_name: product.name,
          channels: channels,
          weekly_mu: weeklyMU,
          safety_stock: safetyStock,
          rop: rop,
          target: target,
          on_hand: onHand,
          available: available,
          health_pct: healthPct,
          status: healthPct >= 0.9 ? '🟢 Healthy' : healthPct >= 0.7 ? '🟡 Monitor' : '🔴 Critical',
        });
      });
    });

    return healthData;
  });
};

/**
 * Hook for DC Supplier Execution data
 */
export const useDCSupplierData = () => {
  return useStoxData('dc-supplier-execution', () => {
    const executionData = [];
    const components = [
      { name: 'Conditioner 250 ml', sku: 'MR_HAIR_101', unitCost: 3 },
      { name: 'Shampoo 500 ml', sku: 'MR_HAIR_201', unitCost: 4 },
      { name: 'Hair Serum 100 ml', sku: 'MR_HAIR_301', unitCost: 8 },
      { name: 'Leave-In Treatment', sku: 'MR_HAIR_401', unitCost: 6 },
      { name: 'Root Touch-Up Kit', sku: 'MR_COLOR_501', unitCost: 12 },
    ];

    const dcs = ['DC-East', 'DC-West', 'DC-Central', 'DC-South'];
    const suppliers = ['Vendor A', 'Vendor B', 'Vendor C'];
    const modes = ['Sea', 'Air', 'Ground'];
    let idCounter = 1;

    components.forEach((component) => {
      dcs.forEach((dc) => {
        const netReq = Math.floor(Math.random() * 3000) + 1000;
        const lotSize = Math.ceil(netReq / 100) * 100 + Math.floor(Math.random() * 500);
        const leadTimeDays = Math.floor(Math.random() * 10) + 7;
        const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
        const onTimePct = 0.7 + Math.random() * 0.3;
        const mode = modes[Math.floor(Math.random() * modes.length)];
        const orderValue = lotSize * component.unitCost;
        const freightUtil = 0.7 + Math.random() * 0.3;

        const releaseDate = new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000);
        const needDate = new Date(releaseDate.getTime() + leadTimeDays * 24 * 60 * 60 * 1000);

        const status = onTimePct >= 0.9 ? '🟢 Normal' : onTimePct >= 0.8 ? '🟡 Watch' : '🔴 Risk';

        executionData.push({
          id: `SE${String(idCounter++).padStart(4, '0')}`,
          component: component.name,
          sku: component.sku,
          dc: dc,
          net_req: netReq,
          lot_size: lotSize,
          lead_time_days: leadTimeDays,
          source_type: 'Buy',
          supplier: supplier,
          on_time_pct: onTimePct,
          mode: mode,
          release_date: releaseDate.toISOString().split('T')[0],
          need_date: needDate.toISOString().split('T')[0],
          unit_cost: component.unitCost,
          order_value: orderValue,
          freight_util: freightUtil,
          status: status,
          action: 'Generate Purchase Requirement',
        });
      });
    });

    return executionData;
  });
};

export default useStoxData;
