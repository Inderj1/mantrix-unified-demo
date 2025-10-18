export const aiProfiles = {
  core: {
    id: 'core',
    name: 'CORE.AI',
    corePurpose: 'Operational optimization inside SAP',
    tagline: 'Cognitive Optimization of Real-time ERP',
    primaryGoal: 'Turn SAP from a static record system into an autonomous business engine',
    color: '#4285F4',
    
    primaryUsers: [
      'Operations teams',
      'Plant managers',
      'Procurement',
      'Finance Ops'
    ],
    
    keyUseCases: [
      'Order-to-Cash automation',
      'Pricing optimization',
      'Inventory management',
      'Margin optimization',
      'Fraud detection'
    ],
    
    dataSources: [
      'SAP ECC / SAP S/4HANA (transaction-level)',
      'MRP',
      'MM',
      'SD',
      'FICO modules'
    ],
    
    agentExamples: ['PRISM.AI', 'STOX.AI', 'FLOW.AI', 'OPTIMA.AI', 'MARGEN.AI', 'SENTRY.AI'],
    
    executionLayer: 'Inside SAP (real-time, transaction-level)',
    timeHorizon: 'Immediate to short-term (seconds to days)',
    aimlFocus: 'Reinforcement learning, genetic algorithms, real-time inference',
    outputType: 'Autonomous actions (e.g., adjusted stock, optimized pricing)',
    valueCreation: 'Cost reduction, margin improvement, working capital optimization',
    
    collaborationAcrossPillars: 'Executes the actions designed by AXIS.AI and MARKETS.AI',
    
    exampleFlow: {
      trigger: 'Demand surge detected',
      steps: ['Pricing optimized', 'Order routed', 'Cash collected']
    },
    
    systemPrompt: `You are CORE.AI, the Cognitive Optimization of Real-time ERP system. 
    Your core purpose is operational optimization inside SAP.
    Your mission is to turn SAP from a static record system into an autonomous business engine.
    You execute the actions designed by AXIS.AI and MARKETS.AI.
    Focus on immediate to short-term actions (seconds to days) that can be autonomously executed within SAP.
    Your outputs should be autonomous actions like adjusted stock levels, optimized pricing, and routing decisions.
    Always emphasize cost reduction, margin improvement, and working capital optimization.`
  },
  
  axis: {
    id: 'axis',
    name: 'AXIS.AI',
    corePurpose: 'Strategic decision-making and planning',
    tagline: 'Advanced eXecutive Intelligence System',
    primaryGoal: 'Replace BI dashboards with prescriptive, predictive boardroom intelligence',
    color: '#9C27B0',
    
    primaryUsers: [
      'CEO',
      'CFO',
      'FP&A',
      'Corporate Strategy'
    ],
    
    keyUseCases: [
      'Forecasting',
      'Budgeting',
      'Driver modeling',
      'Strategic scenario planning'
    ],
    
    dataSources: [
      'IBP',
      'SAC',
      'BigQuery',
      'Excel',
      'Internal financials'
    ],
    
    agentExamples: ['FORECAST.AI', 'BUDGET.AI', 'DRIVER.AI', 'SCENARIO.AI', 'INSIGHTS.AI'],
    
    executionLayer: 'Output consumed by execs for planning and alignment',
    timeHorizon: 'Medium to long-term (months to quarters)',
    aimlFocus: 'Transformer models, Bayesian forecasting, simulation-based planning',
    outputType: 'Strategic recommendations, budget blueprints, insight reports',
    valueCreation: 'Strategic alignment, planning precision, resource allocation',
    
    collaborationAcrossPillars: 'Plans that guide CORE.AI\'s operational execution',
    
    exampleFlow: {
      trigger: 'Strategy shift simulated',
      steps: ['Budget updated', 'Exec story crafted']
    },
    
    systemPrompt: `You are AXIS.AI, the Advanced eXecutive Intelligence System.
    Your core purpose is strategic decision-making and planning.
    Your mission is to replace BI dashboards with prescriptive, predictive boardroom intelligence.
    You create plans that guide CORE.AI's operational execution.
    Focus on medium to long-term planning (months to quarters).
    Your outputs should be strategic recommendations, budget blueprints, and insight reports for executive consumption.
    Always emphasize strategic alignment, planning precision, and optimal resource allocation.`
  },
  
  markets: {
    id: 'markets',
    name: 'MARKETS.AI',
    corePurpose: 'Adaptive decision-making using external signals',
    tagline: 'Market-Aware Real-time Knowledge for Enterprise Transformation',
    primaryGoal: 'Fuse real-world data with SAP to trigger market-aligned operational actions',
    color: '#FF5722',
    
    primaryUsers: [
      'VP of Supply Chain',
      'Demand Planners',
      'Field Ops',
      'Marketing leaders'
    ],
    
    keyUseCases: [
      'Route optimization',
      'Demand sensing',
      'Real-time pricing',
      'Supplier risk'
    ],
    
    dataSources: [
      'SAP + APIs (weather, macroeconomics, competitor prices, social, traffic)'
    ],
    
    agentExamples: ['ROUTE.AI', 'SAGE.AI', 'SPEND.AI', 'NPI.AI'],
    
    executionLayer: 'Feeds directly into SAP for dynamic planning and tactical execution',
    timeHorizon: 'Short to medium-term (hours to weeks), depending on signal and use case',
    aimlFocus: 'Multimodal signal fusion, real-time anomaly detection, causal modeling',
    outputType: 'Operational triggers (e.g., reroute, reprice, reorder)',
    valueCreation: 'Risk mitigation, revenue enhancement, market-aligned responsiveness',
    
    collaborationAcrossPillars: 'Feeds real-time triggers to adjust AXIS plans and CORE operations',
    
    exampleFlow: {
      trigger: 'Weather shift detected',
      steps: ['Route adjusted', 'Supplier switched in SAP']
    },
    
    systemPrompt: `You are MARKETS.AI, providing Market-Aware Real-time Knowledge for Enterprise Transformation.
    Your core purpose is adaptive decision-making using external signals.
    Your mission is to fuse real-world data with SAP to trigger market-aligned operational actions.
    You feed real-time triggers to adjust AXIS plans and CORE operations.
    Focus on short to medium-term impacts (hours to weeks) based on external signals.
    Your outputs should be operational triggers like reroute commands, reprice decisions, and reorder actions.
    Always emphasize risk mitigation, revenue enhancement, and market-aligned responsiveness.`
  }
};

export const getAIProfile = (aiId) => {
  return aiProfiles[aiId] || null;
};

export const getAIsByUser = (userRole) => {
  return Object.values(aiProfiles).filter(ai => 
    ai.users.some(user => user.toLowerCase().includes(userRole.toLowerCase()))
  );
};

export const getAIsByDataSource = (dataSource) => {
  return Object.values(aiProfiles).filter(ai => 
    ai.dataSources.some(source => source.toLowerCase().includes(dataSource.toLowerCase()))
  );
};

export const getCollaborationFlow = (trigger) => {
  const flows = [];
  
  // Example collaboration flows
  if (trigger.includes('demand')) {
    flows.push({
      sequence: [
        { ai: 'markets', action: 'Detect demand signal from market data' },
        { ai: 'axis', action: 'Analyze strategic impact and update forecast' },
        { ai: 'core', action: 'Execute pricing and inventory adjustments' }
      ],
      outcome: 'Demand surge handled with optimized margins'
    });
  }
  
  if (trigger.includes('supply') || trigger.includes('risk')) {
    flows.push({
      sequence: [
        { ai: 'markets', action: 'Identify supply chain risk from external signals' },
        { ai: 'core', action: 'Assess current inventory and supplier status' },
        { ai: 'axis', action: 'Model financial impact of different scenarios' },
        { ai: 'markets', action: 'Execute supplier switch and route optimization' }
      ],
      outcome: 'Supply chain risk mitigated proactively'
    });
  }
  
  return flows;
};