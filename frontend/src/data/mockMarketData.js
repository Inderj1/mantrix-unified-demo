/**
 * Mock Market Intelligence Data
 * Sample data for all 15 market signal categories
 */

export const mockMarketSignals = {
  weather: [
    {
      id: 'SIG-W001',
      name: 'Hurricane Milton',
      location: 'Florida, USA',
      severity: 'CRITICAL',
      severityScore: 92,
      impact: '$3.2M',
      impactValue: 3200000,
      timeToImpact: '3-5 days',
      affectedSKUs: 234,
      affectedSuppliers: 18,
      affectedCustomers: 145,
      description: 'Category 4 hurricane affecting major supply routes and distribution centers',
      recommendations: [
        'Reroute 47 shipments via alternative ports',
        'Activate backup suppliers in unaffected regions',
        'Increase safety stock for critical items'
      ],
      status: 'active',
      detectedAt: '2025-01-10T08:30:00Z',
    },
    {
      id: 'SIG-W002',
      name: 'California Drought',
      location: 'California, USA',
      severity: 'HIGH',
      severityScore: 75,
      impact: '$1.1M',
      impactValue: 1100000,
      timeToImpact: '2-3 weeks',
      affectedSKUs: 89,
      affectedSuppliers: 12,
      affectedCustomers: 67,
      description: 'Severe drought conditions affecting agricultural suppliers',
      recommendations: [
        'Source from alternative regions',
        'Negotiate volume commitments with backup suppliers'
      ],
      status: 'active',
      detectedAt: '2025-01-09T14:20:00Z',
    },
    {
      id: 'SIG-W003',
      name: 'Midwest Flooding',
      location: 'Illinois, Iowa, USA',
      severity: 'MEDIUM',
      severityScore: 55,
      impact: '$450K',
      impactValue: 450000,
      timeToImpact: '1 week',
      affectedSKUs: 45,
      affectedSuppliers: 6,
      affectedCustomers: 32,
      description: 'Spring flooding affecting transportation routes',
      recommendations: [
        'Monitor road closures',
        'Consider air freight for urgent orders'
      ],
      status: 'monitoring',
      detectedAt: '2025-01-08T10:15:00Z',
    },
  ],

  economic: [
    {
      id: 'SIG-E001',
      name: 'Interest Rate Hike',
      location: 'USA (Federal Reserve)',
      severity: 'HIGH',
      severityScore: 68,
      impact: '$2.1M',
      impactValue: 2100000,
      timeToImpact: 'Immediate',
      description: 'Fed raised rates by 0.5%, impacting borrowing costs',
      recommendations: [
        'Review credit facilities and debt structure',
        'Accelerate planned capital investments before next hike'
      ],
      status: 'active',
      detectedAt: '2025-01-10T14:00:00Z',
    },
    {
      id: 'SIG-E002',
      name: 'USD Strengthening',
      location: 'Global Currency Markets',
      severity: 'MEDIUM',
      severityScore: 52,
      impact: '$890K',
      impactValue: 890000,
      timeToImpact: 'Ongoing',
      description: 'Dollar up 3.2% vs euro, affecting import costs',
      recommendations: [
        'Lock in exchange rates for Q2 purchases',
        'Review pricing for export markets'
      ],
      status: 'monitoring',
      detectedAt: '2025-01-09T09:30:00Z',
    },
  ],

  tariffs: [
    {
      id: 'SIG-T001',
      name: 'Steel Import Tariff',
      location: 'USA',
      severity: 'CRITICAL',
      severityScore: 85,
      impact: '$1.8M',
      impactValue: 1800000,
      timeToImpact: '30 days',
      description: '25% tariff on steel imports from key suppliers',
      recommendations: [
        'Negotiate with domestic suppliers',
        'Explore tariff exemption applications',
        'Pass through costs to customers where possible'
      ],
      status: 'active',
      detectedAt: '2025-01-10T11:00:00Z',
    },
  ],

  competitors: [
    {
      id: 'SIG-C001',
      name: 'Competitor Product Launch',
      location: 'National Market',
      severity: 'HIGH',
      severityScore: 72,
      impact: '$1.5M',
      impactValue: 1500000,
      timeToImpact: '2 weeks',
      description: 'Major competitor launching direct substitute product at 15% lower price',
      recommendations: [
        'Accelerate marketing campaign for differentiation',
        'Consider promotional pricing in key markets',
        'Highlight quality and service advantages'
      ],
      status: 'active',
      detectedAt: '2025-01-09T16:45:00Z',
    },
    {
      id: 'SIG-C002',
      name: 'Market Share Shift',
      location: 'Western Region',
      severity: 'MEDIUM',
      severityScore: 58,
      impact: '$780K',
      impactValue: 780000,
      timeToImpact: 'Q1 2025',
      description: 'Competitor gaining 3% market share in beverage category',
      recommendations: [
        'Increase sales coverage in affected territories',
        'Analyze competitor pricing and promotion strategy'
      ],
      status: 'monitoring',
      detectedAt: '2025-01-08T13:20:00Z',
    },
  ],

  social: [
    {
      id: 'SIG-S001',
      name: 'Viral TikTok Trend',
      location: 'Social Media (TikTok)',
      severity: 'HIGH',
      severityScore: 78,
      impact: '+$2.3M',
      impactValue: 2300000,
      timeToImpact: '1-2 weeks',
      description: 'Product featured in viral trend with 45M views, driving demand surge',
      recommendations: [
        'Increase production immediately for trending SKU',
        'Amplify trend with paid social media',
        'Ensure inventory at key retailers'
      ],
      status: 'active',
      detectedAt: '2025-01-10T07:15:00Z',
    },
    {
      id: 'SIG-S002',
      name: 'Brand Sentiment Decline',
      location: 'Twitter, Reddit',
      severity: 'MEDIUM',
      severityScore: 48,
      impact: '$320K',
      impactValue: -320000,
      timeToImpact: 'Ongoing',
      description: 'Negative sentiment increasing due to packaging concerns',
      recommendations: [
        'Engage with community and address concerns',
        'Highlight sustainability initiatives'
      ],
      status: 'monitoring',
      detectedAt: '2025-01-09T11:30:00Z',
    },
  ],

  news: [
    {
      id: 'SIG-N001',
      name: 'Industry Regulation Announcement',
      location: 'USA (FDA)',
      severity: 'HIGH',
      severityScore: 70,
      impact: '$1.2M',
      impactValue: 1200000,
      timeToImpact: '6 months',
      description: 'New labeling requirements for beverage industry',
      recommendations: [
        'Begin compliance assessment',
        'Update packaging designs',
        'Coordinate with legal and regulatory teams'
      ],
      status: 'active',
      detectedAt: '2025-01-10T09:00:00Z',
    },
  ],

  marketing: [
    {
      id: 'SIG-M001',
      name: 'Search Trend Spike',
      location: 'Google Trends (National)',
      severity: 'MEDIUM',
      severityScore: 62,
      impact: '+$550K',
      impactValue: 550000,
      timeToImpact: '1 week',
      description: 'Search volume for product category up 150% month-over-month',
      recommendations: [
        'Increase Google Ads budget by 30%',
        'Optimize product pages for trending keywords',
        'Launch retargeting campaigns'
      ],
      status: 'active',
      detectedAt: '2025-01-10T06:00:00Z',
    },
  ],

  supplyChain: [
    {
      id: 'SIG-SC001',
      name: 'Port Congestion - LA/Long Beach',
      location: 'California Ports',
      severity: 'CRITICAL',
      severityScore: 88,
      impact: '$2.5M',
      impactValue: 2500000,
      timeToImpact: '1-2 days',
      affectedSKUs: 567,
      affectedSuppliers: 43,
      description: 'Major port congestion causing 7-10 day delays on 120 containers',
      recommendations: [
        'Reroute future shipments to Oakland or Seattle',
        'Expedite customs clearance for arriving containers',
        'Air freight critical SKUs'
      ],
      status: 'active',
      detectedAt: '2025-01-10T12:30:00Z',
    },
    {
      id: 'SIG-SC002',
      name: 'Supplier Financial Distress',
      location: 'Midwest Supplier',
      severity: 'HIGH',
      severityScore: 74,
      impact: '$980K',
      impactValue: 980000,
      timeToImpact: '2-3 weeks',
      description: 'Key supplier showing signs of financial instability',
      recommendations: [
        'Qualify backup suppliers immediately',
        'Secure 90 days inventory from this supplier',
        'Prepare contingency sourcing plan'
      ],
      status: 'active',
      detectedAt: '2025-01-09T15:45:00Z',
    },
  ],

  regulatory: [
    {
      id: 'SIG-R001',
      name: 'Environmental Compliance Mandate',
      location: 'California',
      severity: 'HIGH',
      severityScore: 66,
      impact: '$1.4M',
      impactValue: 1400000,
      timeToImpact: '12 months',
      description: 'New sustainability requirements for packaging by Jan 2026',
      recommendations: [
        'Assess current packaging compliance',
        'Source eco-friendly alternatives',
        'Budget for packaging redesign'
      ],
      status: 'active',
      detectedAt: '2025-01-08T10:00:00Z',
    },
  ],

  technology: [
    {
      id: 'SIG-TE001',
      name: 'AI Supply Chain Tool',
      location: 'Market Innovation',
      severity: 'MEDIUM',
      severityScore: 45,
      impact: '+$680K',
      impactValue: 680000,
      timeToImpact: 'Q2 2025',
      description: 'Competitor adopting AI-powered demand forecasting',
      recommendations: [
        'Evaluate similar AI tools for our operations',
        'Assess ROI and implementation timeline'
      ],
      status: 'monitoring',
      detectedAt: '2025-01-07T14:30:00Z',
    },
  ],

  energy: [
    {
      id: 'SIG-EN001',
      name: 'Natural Gas Price Surge',
      location: 'US Energy Markets',
      severity: 'HIGH',
      severityScore: 71,
      impact: '$1.1M',
      impactValue: 1100000,
      timeToImpact: 'Immediate',
      description: 'Natural gas prices up 28% affecting manufacturing costs',
      recommendations: [
        'Lock in energy contracts for next 6 months',
        'Optimize production schedules for off-peak hours',
        'Evaluate energy efficiency improvements'
      ],
      status: 'active',
      detectedAt: '2025-01-10T08:00:00Z',
    },
  ],

  labor: [
    {
      id: 'SIG-L001',
      name: 'Warehouse Worker Shortage',
      location: 'Southwest Region',
      severity: 'HIGH',
      severityScore: 69,
      impact: '$850K',
      impactValue: 850000,
      timeToImpact: 'Ongoing',
      description: '15% shortage in warehouse staff affecting fulfillment',
      recommendations: [
        'Increase hourly wages by $2-3/hour',
        'Implement sign-on bonuses',
        'Consider automation for repetitive tasks'
      ],
      status: 'active',
      detectedAt: '2025-01-09T07:30:00Z',
    },
  ],

  geopolitical: [
    {
      id: 'SIG-G001',
      name: 'Trade Dispute Escalation',
      location: 'US-China Relations',
      severity: 'HIGH',
      severityScore: 76,
      impact: '$1.9M',
      impactValue: 1900000,
      timeToImpact: '1-2 months',
      description: 'Escalating tensions may lead to additional tariffs',
      recommendations: [
        'Diversify sourcing away from affected regions',
        'Build safety stock of critical imports',
        'Explore nearshoring options'
      ],
      status: 'monitoring',
      detectedAt: '2025-01-08T16:00:00Z',
    },
  ],

  health: [
    {
      id: 'SIG-H001',
      name: 'Regional Health Alert',
      location: 'Northeast USA',
      severity: 'MEDIUM',
      severityScore: 54,
      impact: '$420K',
      impactValue: 420000,
      timeToImpact: '2 weeks',
      description: 'Respiratory illness outbreak affecting workforce availability',
      recommendations: [
        'Implement enhanced health protocols',
        'Cross-train staff for critical roles',
        'Monitor absenteeism trends'
      ],
      status: 'monitoring',
      detectedAt: '2025-01-09T12:00:00Z',
    },
  ],

  realEstate: [
    {
      id: 'SIG-RE001',
      name: 'Warehouse Rent Increase',
      location: 'Major Metro Areas',
      severity: 'MEDIUM',
      severityScore: 51,
      impact: '$670K',
      impactValue: 670000,
      timeToImpact: 'Lease renewal',
      description: 'Industrial real estate rents up 12% year-over-year',
      recommendations: [
        'Negotiate early lease extensions',
        'Evaluate relocation to lower-cost markets',
        'Optimize warehouse space utilization'
      ],
      status: 'monitoring',
      detectedAt: '2025-01-07T11:00:00Z',
    },
  ],
};

/**
 * Get all signals across all categories
 */
export const getAllSignals = () => {
  return Object.values(mockMarketSignals).flat();
};

/**
 * Get signals for specific category
 */
export const getSignalsByCategory = (categoryId) => {
  return mockMarketSignals[categoryId] || [];
};

/**
 * Get signal counts per category
 */
export const getSignalCounts = () => {
  const counts = {};
  Object.keys(mockMarketSignals).forEach(categoryId => {
    counts[categoryId] = mockMarketSignals[categoryId].length;
  });
  return counts;
};

/**
 * Get total impact across all signals
 */
export const getTotalImpact = () => {
  const allSignals = getAllSignals();
  return allSignals.reduce((sum, signal) => {
    return sum + (signal.impactValue || 0);
  }, 0);
};

/**
 * Get critical signals (severity >= 80)
 */
export const getCriticalSignals = () => {
  return getAllSignals().filter(signal => signal.severityScore >= 80);
};

export default mockMarketSignals;
