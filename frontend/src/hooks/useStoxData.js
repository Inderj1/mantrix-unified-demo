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
 * ALIGNED DATA: Aggregates from stores and channels
 * HIERARCHICAL: DC → Channels (Physical Stores, Amazon, Wholesale, D2C)
 */
export const useDCDemandData = () => {
  return useStoxData('dc-demand-aggregation', () => {
    const currentDate = '2025-10-27';
    const isoWeek = '2025-W44';

    // Multiple SKUs with DC demand data
    const skuData = [
      {
        sku: 'MR_HAIR_101',
        name: 'Premium Hair Color Kit',
        dcs: {
          'DC-East': {
            total: 137,
            channels: { 'Retail Stores': 82, 'Amazon': 27, 'Wholesale': 21, 'D2C': 7 },
          },
          'DC-Midwest': {
            total: 107,
            channels: { 'Retail Stores': 64, 'Amazon': 21, 'Wholesale': 16, 'D2C': 6 },
          },
          'DC-West': {
            total: 95,
            channels: { 'Retail Stores': 57, 'Amazon': 19, 'Wholesale': 14, 'D2C': 5 },
          },
        },
      },
      {
        sku: 'MR_HAIR_201',
        name: 'Root Touch-Up Spray',
        dcs: {
          'DC-East': {
            total: 88,
            channels: { 'Retail Stores': 53, 'Amazon': 18, 'Wholesale': 13, 'D2C': 4 },
          },
          'DC-Midwest': {
            total: 72,
            channels: { 'Retail Stores': 43, 'Amazon': 14, 'Wholesale': 11, 'D2C': 4 },
          },
          'DC-West': {
            total: 65,
            channels: { 'Retail Stores': 39, 'Amazon': 13, 'Wholesale': 10, 'D2C': 3 },
          },
        },
      },
      {
        sku: 'MR_CARE_301',
        name: 'Intensive Hair Mask',
        dcs: {
          'DC-East': {
            total: 62,
            channels: { 'Retail Stores': 37, 'Amazon': 12, 'Wholesale': 9, 'D2C': 4 },
          },
          'DC-Midwest': {
            total: 54,
            channels: { 'Retail Stores': 32, 'Amazon': 11, 'Wholesale': 8, 'D2C': 3 },
          },
        },
      },
    ];

    const aggregationData = [];

    // Generate hierarchical data: DC × SKU → Channels
    skuData.forEach((skuInfo) => {
      Object.entries(skuInfo.dcs).forEach(([dcName, dcData]) => {
        // Level 0: DC + SKU Parent Row (aggregated across all channels)
        const dcId = `DC-${dcName}-${skuInfo.sku}`;
        aggregationData.push({
          id: dcId,
          level: 0,
          date: currentDate,
          iso_week: isoWeek,
          dc_location: dcName,
          product_sku: '', // Empty for aggregated view
          product_name: skuInfo.name,
          daily_forecast_dc: dcData.total,
          weekly_mean_dc: dcData.total * 7,
          weekly_stddev_dc: Math.round(dcData.total * 0.15 * Math.sqrt(7)),
          num_channels: Object.keys(dcData.channels).length,
          status: 'Aggregated',
        });

        // Level 1: Channel Child Rows (specific SKU)
        Object.entries(dcData.channels).forEach(([channelName, channelForecast]) => {
          const channelId = `${dcId}-${channelName.replace(/\s+/g, '-')}`;
          aggregationData.push({
            id: channelId,
            parentId: dcId,
            level: 1,
            date: currentDate,
            iso_week: isoWeek,
            dc_location: channelName,
            product_sku: skuInfo.sku,
            product_name: skuInfo.name,
            daily_forecast_dc: channelForecast,
            weekly_mean_dc: channelForecast * 7,
            weekly_stddev_dc: Math.round(channelForecast * 0.15 * Math.sqrt(7)),
            contribution_pct: ((channelForecast / dcData.total) * 100).toFixed(1),
            status: 'Channel',
          });
        });
      });
    });

    return aggregationData;
  });
};

/**
 * Hook for DC Health Monitor data
 * ALIGNED DATA: Aggregates from 12 stores (6 per DC) matching StoreHealthMonitor
 */
export const useDCHealthData = () => {
  return useStoxData('dc-health-monitor', () => {
    // Aggregated data from StoreHealthMonitor (12 stores → 3 DCs, 3 SKUs)
    const healthData = [
      // MR_HAIR_101 - Premium Hair Color Kit
      {
        id: 'DH0001',
        dc_location: 'DC-East',
        product_sku: 'MR_HAIR_101',
        product_name: 'Premium Hair Color Kit',
        channels: 'All Channels',
        weekly_mu: 959,
        sigma: 13.7,
        safety_stock: 147,
        rop: 2065,
        target: 1022,
        on_hand: 920,
        on_order: 115,
        allocated: 45,
        available: 990,
        health_pct: 0.97,
        status: '🟢 Normal - Well Stocked',
        requirement_qty: 0,
        freight_util: 0.78,
        action: 'Monitor - inventory healthy across network',
      },
      {
        id: 'DH0002',
        dc_location: 'DC-Midwest',
        product_sku: 'MR_HAIR_101',
        product_name: 'Premium Hair Color Kit',
        channels: 'All Channels',
        weekly_mu: 749,
        sigma: 11.2,
        safety_stock: 120,
        rop: 1618,
        target: 835,
        on_hand: 820,
        on_order: 115,
        allocated: 48,
        available: 887,
        health_pct: 1.06,
        status: '🟢 Normal - Overstocked',
        requirement_qty: 0,
        freight_util: 0.82,
        action: 'Reduce inbound orders - inventory above target',
      },
      {
        id: 'DH0003',
        dc_location: 'DC-West',
        product_sku: 'MR_HAIR_101',
        product_name: 'Premium Hair Color Kit',
        channels: 'All Channels',
        weekly_mu: 665,
        sigma: 10.1,
        safety_stock: 98,
        rop: 1428,
        target: 720,
        on_hand: 680,
        on_order: 85,
        allocated: 38,
        available: 727,
        health_pct: 1.01,
        status: '🟢 Normal - Well Stocked',
        requirement_qty: 0,
        freight_util: 0.75,
        action: 'Monitor - inventory adequate',
      },
      // MR_HAIR_201 - Root Touch-Up Spray
      {
        id: 'DH0004',
        dc_location: 'DC-East',
        product_sku: 'MR_HAIR_201',
        product_name: 'Root Touch-Up Spray',
        channels: 'All Channels',
        weekly_mu: 616,
        sigma: 9.8,
        safety_stock: 95,
        rop: 1327,
        target: 680,
        on_hand: 520,
        on_order: 200,
        allocated: 32,
        available: 688,
        health_pct: 1.01,
        status: '🟢 Normal - Well Stocked',
        requirement_qty: 0,
        freight_util: 0.81,
        action: 'Monitor - strong inbound pipeline',
      },
      {
        id: 'DH0005',
        dc_location: 'DC-Midwest',
        product_sku: 'MR_HAIR_201',
        product_name: 'Root Touch-Up Spray',
        channels: 'All Channels',
        weekly_mu: 504,
        sigma: 8.2,
        safety_stock: 78,
        rop: 1086,
        target: 560,
        on_hand: 445,
        on_order: 150,
        allocated: 28,
        available: 567,
        health_pct: 1.01,
        status: '🟢 Normal - Well Stocked',
        requirement_qty: 0,
        freight_util: 0.79,
        action: 'Monitor - inventory adequate',
      },
      {
        id: 'DH0006',
        dc_location: 'DC-West',
        product_sku: 'MR_HAIR_201',
        product_name: 'Root Touch-Up Spray',
        channels: 'All Channels',
        weekly_mu: 455,
        sigma: 7.5,
        safety_stock: 68,
        rop: 978,
        target: 495,
        on_hand: 420,
        on_order: 120,
        allocated: 24,
        available: 516,
        health_pct: 1.04,
        status: '🟢 Normal - Well Stocked',
        requirement_qty: 0,
        freight_util: 0.77,
        action: 'Monitor - inventory adequate',
      },
      // MR_CARE_301 - Intensive Hair Mask
      {
        id: 'DH0007',
        dc_location: 'DC-East',
        product_sku: 'MR_CARE_301',
        product_name: 'Intensive Hair Mask',
        channels: 'All Channels',
        weekly_mu: 434,
        sigma: 7.2,
        safety_stock: 65,
        rop: 933,
        target: 465,
        on_hand: 380,
        on_order: 150,
        allocated: 22,
        available: 508,
        health_pct: 1.09,
        status: '🟢 Normal - Well Stocked',
        requirement_qty: 0,
        freight_util: 0.83,
        action: 'Monitor - strong position',
      },
      {
        id: 'DH0008',
        dc_location: 'DC-Midwest',
        product_sku: 'MR_CARE_301',
        product_name: 'Intensive Hair Mask',
        channels: 'All Channels',
        weekly_mu: 378,
        sigma: 6.4,
        safety_stock: 55,
        rop: 811,
        target: 410,
        on_hand: 320,
        on_order: 100,
        allocated: 18,
        available: 402,
        health_pct: 0.98,
        status: '🟢 Normal - Well Stocked',
        requirement_qty: 0,
        freight_util: 0.76,
        action: 'Monitor - inventory adequate',
      },
    ];

    return healthData;
  });
};

/**
 * Hook for DC Supplier Execution data
 * HIERARCHICAL: Supplier → Source Type → Components
 */
export const useDCSupplierData = () => {
  return useStoxData('dc-supplier-execution', () => {
    const executionData = [];

    // Define suppliers with source types and components
    const supplierData = {
      'XYZ Corp': {
        sourceTypes: {
          'Buy': [
            { name: 'Conditioner 250 ml', sku: 'MR_HAIR_101', unitCost: 3, netReq: 2500, leadTime: 14 },
            { name: 'Shampoo 500 ml', sku: 'MR_HAIR_201', unitCost: 4, netReq: 3200, leadTime: 12 },
          ],
          'Make': [
            { name: 'Hair Serum 100 ml', sku: 'MR_HAIR_301', unitCost: 8, netReq: 1800, leadTime: 10 },
          ],
        },
      },
      'ABC Industries': {
        sourceTypes: {
          'Buy': [
            { name: 'Leave-In Treatment', sku: 'MR_HAIR_401', unitCost: 6, netReq: 2100, leadTime: 15 },
            { name: 'Root Touch-Up Kit', sku: 'MR_COLOR_501', unitCost: 12, netReq: 1500, leadTime: 18 },
          ],
          'Transfer': [
            { name: 'Box Packaging', sku: 'MR_PKG_001', unitCost: 2, netReq: 4500, leadTime: 7 },
          ],
        },
      },
      'Global Chem Co': {
        sourceTypes: {
          'Buy': [
            { name: 'Color Base Formula', sku: 'MR_CHEM_001', unitCost: 15, netReq: 1200, leadTime: 20 },
            { name: 'Developer Solution', sku: 'MR_CHEM_002', unitCost: 10, netReq: 1800, leadTime: 16 },
          ],
        },
      },
    };

    // Generate hierarchical data
    Object.entries(supplierData).forEach(([supplierName, supplierInfo]) => {
      // Calculate supplier-level aggregates
      let supplierNetReq = 0;
      let supplierOrderValue = 0;
      let supplierAvgLeadTime = 0;
      let componentCount = 0;

      Object.entries(supplierInfo.sourceTypes).forEach(([sourceType, components]) => {
        components.forEach(comp => {
          supplierNetReq += comp.netReq;
          supplierOrderValue += comp.netReq * comp.unitCost;
          supplierAvgLeadTime += comp.leadTime;
          componentCount++;
        });
      });

      supplierAvgLeadTime = Math.round(supplierAvgLeadTime / componentCount);

      // Level 0: Supplier Parent Row
      const supplierId = `SUPP-${supplierName.replace(/\s+/g, '-')}`;
      executionData.push({
        id: supplierId,
        level: 0,
        component: supplierName,
        supplier: supplierName,
        net_req: supplierNetReq,
        lot_size: supplierNetReq,
        lead_time_days: supplierAvgLeadTime,
        release_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        need_date: new Date(Date.now() + (5 + supplierAvgLeadTime) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        order_value: supplierOrderValue,
        freight_util: 0.85,
        status: `${Object.keys(supplierInfo.sourceTypes).length} types`,
        action: `${componentCount} components`,
      });

      // Level 1: Source Type Child Rows
      Object.entries(supplierInfo.sourceTypes).forEach(([sourceType, components]) => {
        const sourceTypeId = `${supplierId}-${sourceType}`;
        const sourceNetReq = components.reduce((sum, c) => sum + c.netReq, 0);
        const sourceOrderValue = components.reduce((sum, c) => sum + (c.netReq * c.unitCost), 0);
        const sourceAvgLeadTime = Math.round(components.reduce((sum, c) => sum + c.leadTime, 0) / components.length);

        executionData.push({
          id: sourceTypeId,
          parentId: supplierId,
          level: 1,
          component: `${sourceType} Orders`,
          supplier: supplierName,
          net_req: sourceNetReq,
          lot_size: sourceNetReq,
          lead_time_days: sourceAvgLeadTime,
          release_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          need_date: new Date(Date.now() + (3 + sourceAvgLeadTime) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          order_value: sourceOrderValue,
          freight_util: 0.80,
          status: sourceType,
          action: `${components.length} items`,
        });

        // Level 2: Component Grandchild Rows
        components.forEach((component) => {
          const lotSize = Math.ceil(component.netReq / 100) * 100;
          const orderValue = lotSize * component.unitCost;

          executionData.push({
            id: `${sourceTypeId}-${component.sku}`,
            parentId: sourceTypeId,
            level: 2,
            component: component.name,
            supplier: supplierName,
            net_req: component.netReq,
            lot_size: lotSize,
            lead_time_days: component.leadTime,
            release_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            need_date: new Date(Date.now() + (2 + component.leadTime) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            order_value: orderValue,
            freight_util: 0.75 + Math.random() * 0.2,
            status: '🟢 Ready',
            action: 'Generate PO',
          });
        });
      });
    });

    return executionData;
  });
};

export default useStoxData;
