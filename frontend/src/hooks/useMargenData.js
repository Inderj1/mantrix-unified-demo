import { useQuery } from 'react-query';

/**
 * Generic hook factory for MargenAI data with automatic persistence
 */
export const useMargenData = (queryKey, fetchFn, options = {}) => {
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
        }, 500);
      });
    },
    {
      ...options,
      cacheTime: options.cacheTime || 1000 * 60 * 60 * 24, // 24 hours
      staleTime: options.staleTime || 1000 * 60 * 5, // 5 minutes
    }
  );

  return {
    data: data?.data || [],
    loading: isLoading || isFetching,
    error,
    refetch,
  };
};

/**
 * Hook for Segment Analytics data
 */
export const useSegmentAnalytics = () => {
  return useMargenData('segment-analytics', () => {
    return {
      segments: [
        {
          segment_name: 'Champions',
          value_category: 'High Value',
          margin_category: 'High Margin',
          total_customers: 1250,
          total_revenue: 3450000,
          total_margin: 1242000,
          avg_margin_percentage: 36.0,
          avg_customer_lifetime_value: 8500,
          avg_purchase_frequency: 12.5,
          avg_days_since_last_purchase: 15,
          revenue_per_customer: 2760,
        },
        {
          segment_name: 'Loyal Customers',
          value_category: 'High Value',
          margin_category: 'High Margin',
          total_customers: 2100,
          total_revenue: 4830000,
          total_margin: 1690000,
          avg_margin_percentage: 35.0,
          avg_customer_lifetime_value: 6200,
          avg_purchase_frequency: 9.8,
          avg_days_since_last_purchase: 22,
          revenue_per_customer: 2300,
        },
        {
          segment_name: 'Potential Loyalists',
          value_category: 'Medium Value',
          margin_category: 'Medium Margin',
          total_customers: 3400,
          total_revenue: 5780000,
          total_margin: 1850000,
          avg_margin_percentage: 32.0,
          avg_customer_lifetime_value: 3800,
          avg_purchase_frequency: 6.2,
          avg_days_since_last_purchase: 35,
          revenue_per_customer: 1700,
        },
        {
          segment_name: 'Recent Customers',
          value_category: 'Medium Value',
          margin_category: 'Medium Margin',
          total_customers: 4200,
          total_revenue: 4620000,
          total_margin: 1340000,
          avg_margin_percentage: 29.0,
          avg_customer_lifetime_value: 2100,
          avg_purchase_frequency: 3.5,
          avg_days_since_last_purchase: 12,
          revenue_per_customer: 1100,
        },
        {
          segment_name: 'Promising',
          value_category: 'Low Value',
          margin_category: 'Medium Margin',
          total_customers: 5100,
          total_revenue: 3570000,
          total_margin: 1070000,
          avg_margin_percentage: 30.0,
          avg_customer_lifetime_value: 1500,
          avg_purchase_frequency: 2.8,
          avg_days_since_last_purchase: 45,
          revenue_per_customer: 700,
        },
        {
          segment_name: 'Need Attention',
          value_category: 'Medium Value',
          margin_category: 'Low Margin',
          total_customers: 2800,
          total_revenue: 2940000,
          total_margin: 705000,
          avg_margin_percentage: 24.0,
          avg_customer_lifetime_value: 2500,
          avg_purchase_frequency: 4.2,
          avg_days_since_last_purchase: 68,
          revenue_per_customer: 1050,
        },
        {
          segment_name: 'About to Sleep',
          value_category: 'Low Value',
          margin_category: 'Low Margin',
          total_customers: 3600,
          total_revenue: 2160000,
          total_margin: 518000,
          avg_margin_percentage: 24.0,
          avg_customer_lifetime_value: 1200,
          avg_purchase_frequency: 2.1,
          avg_days_since_last_purchase: 95,
          revenue_per_customer: 600,
        },
        {
          segment_name: 'At Risk',
          value_category: 'Medium Value',
          margin_category: 'Low Margin',
          total_customers: 1900,
          total_revenue: 1710000,
          total_margin: 376000,
          avg_margin_percentage: 22.0,
          avg_customer_lifetime_value: 2800,
          avg_purchase_frequency: 5.5,
          avg_days_since_last_purchase: 125,
          revenue_per_customer: 900,
        },
        {
          segment_name: 'Cannot Lose Them',
          value_category: 'High Value',
          margin_category: 'Low Margin',
          total_customers: 800,
          total_revenue: 2400000,
          total_margin: 480000,
          avg_margin_percentage: 20.0,
          avg_customer_lifetime_value: 7500,
          avg_purchase_frequency: 8.5,
          avg_days_since_last_purchase: 180,
          revenue_per_customer: 3000,
        },
        {
          segment_name: 'Hibernating',
          value_category: 'Low Value',
          margin_category: 'Low Margin',
          total_customers: 4500,
          total_revenue: 1800000,
          total_margin: 360000,
          avg_margin_percentage: 20.0,
          avg_customer_lifetime_value: 800,
          avg_purchase_frequency: 1.5,
          avg_days_since_last_purchase: 210,
          revenue_per_customer: 400,
        },
        {
          segment_name: 'Lost',
          value_category: 'Low Value',
          margin_category: 'Low Margin',
          total_customers: 2200,
          total_revenue: 660000,
          total_margin: 119000,
          avg_margin_percentage: 18.0,
          avg_customer_lifetime_value: 600,
          avg_purchase_frequency: 1.2,
          avg_days_since_last_purchase: 365,
          revenue_per_customer: 300,
        },
      ],
    };
  });
};

/**
 * Hook for Trends & Insights data
 */
export const useTrendsInsights = (monthsBack = 12) => {
  return useMargenData(['trends-insights', monthsBack], () => {
    // Generate monthly trends for the specified period
    const trends = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    for (let i = 0; i < monthsBack; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);

      const baseRevenue = 2500000 + Math.random() * 500000;
      const marginPct = 28 + Math.random() * 8;
      const margin = baseRevenue * (marginPct / 100);

      trends.push({
        period: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        revenue: Math.round(baseRevenue),
        margin: Math.round(margin),
        margin_percentage: parseFloat(marginPct.toFixed(1)),
        customers: Math.round(2000 + Math.random() * 1000),
        products: Math.round(150 + Math.random() * 50),
        avg_order_value: parseFloat((baseRevenue / (2000 + Math.random() * 1000)).toFixed(2)),
      });
    }

    return {
      trends_data: {
        monthly_trends: trends,
      },
      insights: {
        top_performing_segment: {
          segment_name: 'Champions',
          total_revenue: 3450000,
          avg_margin_percentage: 36.0,
        },
        highest_margin_segment: {
          segment_name: 'Champions',
          total_customers: 1250,
          avg_margin_percentage: 36.0,
        },
        segment_health_summary: {
          healthy: 4,
          stable: 3,
          at_risk: 2,
          declining: 2,
        },
        at_risk_segments: [
          {
            rfm_segment: 'At Risk',
            segment_health: 'Declining',
            growth_rate_pct: -8.5,
          },
          {
            rfm_segment: 'Cannot Lose Them',
            segment_health: 'At Risk',
            growth_rate_pct: -5.2,
          },
        ],
      },
    };
  });
};

/**
 * Hook for Product Overview data
 */
export const useProductOverview = (limit = 100, offset = 0) => {
  return useMargenData(['product-overview', limit, offset], () => {
    const products = [];
    const productBases = [
      'Premium Hair Color Kit',
      'Root Touch-Up Spray',
      'Intensive Hair Mask',
      'Volumizing Shampoo',
      'Color Protecting Conditioner',
      'Heat Styling Spray',
      'Hair Repair Serum',
      'Scalp Treatment',
      'Leave-In Conditioner',
      'Detangling Spray',
    ];

    for (let i = 0; i < Math.min(limit, 100); i++) {
      const productId = `MR_${String(i + 1).padStart(3, '0')}`;
      const revenue = 50000 + Math.random() * 200000;
      const marginPct = 15 + Math.random() * 25;
      const margin = revenue * (marginPct / 100);

      const profitabilityStatus =
        marginPct > 30 ? 'High Profit' :
        marginPct > 20 ? 'Good Profit' :
        marginPct > 10 ? 'Low Profit' :
        marginPct > 0 ? 'Minimal Profit' : 'Loss Making';

      products.push({
        product_id: productId,
        total_revenue: Math.round(revenue),
        total_margin: Math.round(margin),
        margin_percentage: parseFloat(marginPct.toFixed(1)),
        profitability_status: profitabilityStatus,
        unique_customers: Math.round(100 + Math.random() * 500),
        total_orders: Math.round(200 + Math.random() * 1000),
        premium_customer_pct: parseFloat((20 + Math.random() * 30).toFixed(1)),
        last_sale_date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    return {
      products,
      pagination: {
        total: 100,
        limit,
        offset,
        hasNext: offset + limit < 100,
        hasPrev: offset > 0,
      },
    };
  });
};

/**
 * Hook for MargenAI Summary data
 */
export const useMargenSummary = () => {
  return useMargenData('margen-summary', () => {
    return {
      summary: {
        total_products: 247,
        total_revenue: 33450000,
        total_margin: 10160000,
        overall_margin_pct: 30.4,
        total_customers: 31850,
        total_orders: 128450,
        high_profit_pct: 35.2,
        loss_making_pct: 8.5,
        data_start_date: '2024-01-01',
        data_end_date: '2024-10-31',
      },
    };
  });
};

/**
 * Hook for Revenue & Growth Analytics data
 */
export const useRevenueGrowth = () => {
  return useMargenData('revenue-growth', () => {
    const data = [];
    const products = ['Premium Hair Color', 'Root Touch-Up', 'Hair Mask', 'Shampoo', 'Conditioner'];
    const channels = ['Retail Stores', 'E-Commerce', 'Wholesale', 'D2C'];
    const regions = ['East', 'West', 'Central', 'South'];

    // Generate 50 rows of revenue data
    for (let i = 0; i < 50; i++) {
      const month = Math.floor(i / 10);
      const baseRevenue = 500000 + Math.random() * 300000;
      const units = Math.floor(baseRevenue / (35 + Math.random() * 20));
      const avgPrice = baseRevenue / units;
      const growth = -10 + Math.random() * 30;

      data.push({
        id: `REV${String(i + 1).padStart(4, '0')}`,
        period: `2024-${String(month + 6).padStart(2, '0')}`,
        product: products[i % products.length],
        channel: channels[i % channels.length],
        region: regions[i % regions.length],
        revenue: Math.round(baseRevenue),
        units: units,
        avg_price: parseFloat(avgPrice.toFixed(2)),
        growth_pct: parseFloat(growth.toFixed(1)),
        trend: growth > 10 ? 'Growing' : growth > 0 ? 'Stable' : 'Declining',
      });
    }

    return { data };
  });
};

/**
 * Hook for Cost & COGS Analytics data
 */
export const useCostCOGS = () => {
  return useMargenData('cost-cogs', () => {
    const data = [];
    const categories = [
      { name: 'Direct Materials', glRange: '5100-5199' },
      { name: 'Direct Labor', glRange: '5200-5299' },
      { name: 'Manufacturing Overhead', glRange: '5300-5399' },
      { name: 'Sales & Marketing', glRange: '6100-6199' },
      { name: 'General & Admin', glRange: '6200-6299' },
      { name: 'R&D', glRange: '6300-6399' },
    ];

    const subcategories = {
      'Direct Materials': ['Raw Materials', 'Packaging', 'Components'],
      'Direct Labor': ['Production Wages', 'Benefits', 'Overtime'],
      'Manufacturing Overhead': ['Factory Rent', 'Utilities', 'Depreciation'],
      'Sales & Marketing': ['Advertising', 'Promotions', 'Sales Commissions'],
      'General & Admin': ['Office Rent', 'IT', 'HR'],
      'R&D': ['Product Development', 'Testing', 'Patents'],
    };

    let id = 1;
    for (let month = 1; month <= 10; month++) {
      categories.forEach((cat) => {
        const subs = subcategories[cat.name];
        subs.forEach((sub) => {
          const amount = 50000 + Math.random() * 200000;
          const budget = amount * (0.95 + Math.random() * 0.15);
          const variance = ((amount - budget) / budget) * 100;

          data.push({
            id: `COST${String(id++).padStart(4, '0')}`,
            period: `2024-${String(month).padStart(2, '0')}`,
            cost_category: cat.name,
            gl_account: `${cat.glRange.split('-')[0]}-${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`,
            subcategory: sub,
            amount: Math.round(amount),
            pct_of_total: parseFloat((Math.random() * 15 + 5).toFixed(1)),
            vs_budget: Math.round(budget),
            variance: parseFloat(variance.toFixed(1)),
            trend: variance > 5 ? 'Over Budget' : variance < -5 ? 'Under Budget' : 'On Track',
          });
        });
      });
    }

    return { data: data.slice(0, 60) };
  });
};

/**
 * Hook for Margin & Profitability Analytics data
 */
export const useMarginProfitability = () => {
  return useMargenData('margin-profitability', () => {
    const data = [];
    const items = [
      { type: 'Product', name: 'Premium Hair Color Kit' },
      { type: 'Product', name: 'Root Touch-Up Spray' },
      { type: 'Product', name: 'Intensive Hair Mask' },
      { type: 'Product', name: 'Volumizing Shampoo' },
      { type: 'Segment', name: 'Champions' },
      { type: 'Segment', name: 'Loyal Customers' },
      { type: 'Segment', name: 'Potential Loyalists' },
      { type: 'Segment', name: 'Recent Customers' },
    ];

    items.forEach((item, idx) => {
      for (let month = 1; month <= 5; month++) {
        const revenue = 500000 + Math.random() * 1000000;
        const cogs = revenue * (0.5 + Math.random() * 0.2);
        const grossMargin = revenue - cogs;
        const opex = revenue * (0.15 + Math.random() * 0.1);
        const operatingMargin = grossMargin - opex;
        const netMargin = operatingMargin * 0.85; // After tax

        data.push({
          id: `MAR${String((idx * 5 + month)).padStart(4, '0')}`,
          type: item.type,
          name: item.name,
          period: `2024-${String(month + 5).padStart(2, '0')}`,
          revenue: Math.round(revenue),
          cogs: Math.round(cogs),
          gross_margin: Math.round(grossMargin),
          gross_margin_pct: parseFloat(((grossMargin / revenue) * 100).toFixed(1)),
          opex: Math.round(opex),
          operating_margin: Math.round(operatingMargin),
          operating_margin_pct: parseFloat(((operatingMargin / revenue) * 100).toFixed(1)),
          net_margin: Math.round(netMargin),
          net_margin_pct: parseFloat(((netMargin / revenue) * 100).toFixed(1)),
          contribution: Math.round(grossMargin),
          trend: operatingMargin > revenue * 0.2 ? 'Healthy' : 'Monitor',
        });
      }
    });

    return { data };
  });
};

/**
 * Hook for P&L & GL Explorer data
 */
export const usePLGLData = () => {
  return useMargenData('pl-gl-data', () => {
    const data = [];

    // Revenue accounts (4000-4999)
    const revenueAccounts = [
      { account: '4100-01', name: 'Product Sales - Hair Color', category: 'Revenue', subcategory: 'Product Revenue', amount: 12500000 },
      { account: '4100-02', name: 'Product Sales - Hair Care', category: 'Revenue', subcategory: 'Product Revenue', amount: 8900000 },
      { account: '4200-01', name: 'Service Revenue', category: 'Revenue', subcategory: 'Service Revenue', amount: 2100000 },
      { account: '4300-01', name: 'Other Income', category: 'Revenue', subcategory: 'Other', amount: 450000 },
    ];

    // COGS accounts (5000-5999)
    const cogsAccounts = [
      { account: '5100-01', name: 'Direct Materials', category: 'COGS', subcategory: 'Materials', amount: 8200000 },
      { account: '5200-01', name: 'Direct Labor', category: 'COGS', subcategory: 'Labor', amount: 4500000 },
      { account: '5300-01', name: 'Manufacturing Overhead', category: 'COGS', subcategory: 'Overhead', amount: 3100000 },
    ];

    // OpEx accounts (6000-7999)
    const opexAccounts = [
      { account: '6100-01', name: 'Sales & Marketing', category: 'Operating Expenses', subcategory: 'Sales & Marketing', amount: 2800000 },
      { account: '6200-01', name: 'General & Admin', category: 'Operating Expenses', subcategory: 'G&A', amount: 1900000 },
      { account: '6300-01', name: 'R&D', category: 'Operating Expenses', subcategory: 'Research', amount: 1200000 },
      { account: '7100-01', name: 'Depreciation', category: 'Operating Expenses', subcategory: 'Depreciation', amount: 650000 },
      { account: '7200-01', name: 'Interest Expense', category: 'Operating Expenses', subcategory: 'Finance', amount: 320000 },
    ];

    const allAccounts = [...revenueAccounts, ...cogsAccounts, ...opexAccounts];

    allAccounts.forEach((acc, idx) => {
      const budget = acc.amount * (0.95 + Math.random() * 0.15);
      const variance = acc.amount - budget;
      const variancePct = (variance / budget) * 100;

      data.push({
        id: `GL${String(idx + 1).padStart(4, '0')}`,
        gl_account: acc.account,
        account_name: acc.name,
        category: acc.category,
        subcategory: acc.subcategory,
        period: '2024-10',
        amount: Math.round(acc.amount),
        budget: Math.round(budget),
        variance: Math.round(variance),
        variance_pct: parseFloat(variancePct.toFixed(1)),
      });
    });

    return { data };
  });
};

/**
 * Hook for Financial Drivers & What-If data
 */
export const useFinancialDrivers = () => {
  return useMargenData('financial-drivers', () => {
    const drivers = [
      { driver: 'Product Price', category: 'Pricing', current: 45.00, scenario: 48.00, probability: 'Medium' },
      { driver: 'Sales Volume', category: 'Volume', current: 750000, scenario: 825000, probability: 'High' },
      { driver: 'Material Cost', category: 'Cost', current: 18.50, scenario: 17.20, probability: 'Low' },
      { driver: 'Labor Cost per Unit', category: 'Cost', current: 12.00, scenario: 12.60, probability: 'High' },
      { driver: 'Marketing Spend', category: 'Revenue', current: 2500000, scenario: 3000000, probability: 'Medium' },
      { driver: 'Conversion Rate %', category: 'Revenue', current: 3.2, scenario: 3.8, probability: 'Medium' },
      { driver: 'Customer Acquisition Cost', category: 'Cost', current: 125, scenario: 110, probability: 'Low' },
      { driver: 'Average Order Value', category: 'Revenue', current: 180, scenario: 195, probability: 'High' },
      { driver: 'Inventory Turnover', category: 'Volume', current: 8.5, scenario: 10.0, probability: 'Medium' },
      { driver: 'Operating Expense Ratio', category: 'Cost', current: 22.0, scenario: 20.5, probability: 'Low' },
    ];

    const data = drivers.map((d, idx) => {
      const changeRate = (d.scenario - d.current) / d.current;
      const changePct = changeRate * 100;
      const revenueImpact = changeRate * 33450000 * (Math.random() * 0.3 + 0.1);
      const costImpact = changeRate * 23290000 * (Math.random() * 0.2 + 0.05);
      const marginImpact = revenueImpact - costImpact;
      const marginImpactPct = parseFloat((marginImpact / 10160000 * 100).toFixed(2));
      const sensitivity = Math.abs(changePct) * (0.5 + Math.random() * 0.8);

      return {
        id: `DRV${String(idx + 1).padStart(4, '0')}`,
        driver_name: d.driver,
        category: d.category,
        current_value: typeof d.current === 'number' && d.current > 100 ? d.current.toLocaleString() : d.current.toString(),
        scenario_value: typeof d.scenario === 'number' && d.scenario > 100 ? d.scenario.toLocaleString() : d.scenario.toString(),
        change_pct: parseFloat(changePct.toFixed(1)),
        revenue_impact: Math.round(revenueImpact),
        margin_impact: marginImpactPct,
        sensitivity: parseFloat(sensitivity.toFixed(1)),
        probability: d.probability,
      };
    });

    return { data };
  });
};
