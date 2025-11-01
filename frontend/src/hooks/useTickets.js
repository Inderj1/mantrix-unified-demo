import { useState, useEffect } from 'react';

// In-memory ticket storage (in production, this would use React Query with API calls)
let ticketStore = [];
let ticketIdCounter = 1;

// Generate unique ticket ID
const generateTicketId = () => {
  const id = `TKT-2025-${String(ticketIdCounter).padStart(6, '0')}`;
  ticketIdCounter++;
  return id;
};

// Ticket creation function
export const createTicket = (ticketData) => {
  const newTicket = {
    ticket_id: generateTicketId(),
    created_date: new Date().toISOString(),
    created_by: 'john.doe@madisonreed.com', // TODO: Get from auth context
    status: 'Open',
    priority: ticketData.priority || 'Normal',
    completion_date: null,
    execution_time_ms: null,
    result: null,
    notes: ticketData.notes || '',
    ...ticketData,
  };

  ticketStore.push(newTicket);

  // Trigger storage event to notify other components
  window.dispatchEvent(new Event('ticketsUpdated'));

  return newTicket;
};

// Update ticket status
export const updateTicketStatus = (ticketId, status, result = null) => {
  const ticket = ticketStore.find(t => t.ticket_id === ticketId);
  if (ticket) {
    ticket.status = status;
    if (result) {
      ticket.result = result;
    }
    if (status === 'Completed' || status === 'Failed') {
      ticket.completion_date = new Date().toISOString();
      if (ticket.created_date) {
        const startTime = new Date(ticket.created_date).getTime();
        const endTime = new Date(ticket.completion_date).getTime();
        ticket.execution_time_ms = endTime - startTime;
      }
    }
    window.dispatchEvent(new Event('ticketsUpdated'));
    return ticket;
  }
  return null;
};

// Add note to ticket
export const addTicketNote = (ticketId, note) => {
  const ticket = ticketStore.find(t => t.ticket_id === ticketId);
  if (ticket) {
    ticket.notes = ticket.notes ? `${ticket.notes}\n\n${note}` : note;
    window.dispatchEvent(new Event('ticketsUpdated'));
    return ticket;
  }
  return null;
};

// Cancel ticket
export const cancelTicket = (ticketId, reason) => {
  const ticket = ticketStore.find(t => t.ticket_id === ticketId);
  if (ticket) {
    ticket.status = 'Cancelled';
    ticket.completion_date = new Date().toISOString();
    ticket.notes = ticket.notes ? `${ticket.notes}\n\nCANCELLED: ${reason}` : `CANCELLED: ${reason}`;
    window.dispatchEvent(new Event('ticketsUpdated'));
    return ticket;
  }
  return null;
};

// Get all tickets
export const getAllTickets = () => {
  return [...ticketStore]; // Return copy to prevent direct mutation
};

// Get ticket by ID
export const getTicketById = (ticketId) => {
  return ticketStore.find(t => t.ticket_id === ticketId);
};

// Hook for using tickets in components
export const useTickets = (filters = {}) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshTickets = () => {
    setLoading(true);
    setTimeout(() => {
      let filtered = getAllTickets();

      // Apply filters
      if (filters.status && filters.status !== 'All') {
        filtered = filtered.filter(t => t.status === filters.status);
      }
      if (filters.type && filters.type !== 'All') {
        filtered = filtered.filter(t => t.ticket_type === filters.type);
      }
      if (filters.priority && filters.priority !== 'All') {
        filtered = filtered.filter(t => t.priority === filters.priority);
      }
      if (filters.source_module_id) {
        filtered = filtered.filter(t => t.source_module_id === filters.source_module_id);
      }
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(t =>
          t.ticket_id.toLowerCase().includes(search) ||
          t.source_tile.toLowerCase().includes(search) ||
          (t.metadata?.store_id && t.metadata.store_id.toLowerCase().includes(search)) ||
          (t.metadata?.product_sku && t.metadata.product_sku.toLowerCase().includes(search))
        );
      }

      // Sort by created date (newest first)
      filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

      setTickets(filtered);
      setLoading(false);
    }, 100);
  };

  useEffect(() => {
    refreshTickets();

    // Listen for ticket updates
    const handleUpdate = () => refreshTickets();
    window.addEventListener('ticketsUpdated', handleUpdate);

    return () => {
      window.removeEventListener('ticketsUpdated', handleUpdate);
    };
  }, [filters.status, filters.type, filters.priority, filters.source_module_id, filters.searchTerm]);

  return {
    tickets,
    loading,
    refresh: refreshTickets,
    createTicket,
    updateTicketStatus,
    addTicketNote,
    cancelTicket,
  };
};

// Initialize with some sample tickets for demo
const initializeSampleTickets = () => {
  // Reset ticket store and counter to ensure fresh sample data
  ticketStore = [];
  ticketIdCounter = 1;

  // Sample STO/PR Creation tickets
  createTicket({
      ticket_type: 'STO_CREATION',
      source_tile: 'Tile 4: Stock Transfer Execution',
      source_module_id: 'store-replenishment',
      status: 'Completed',
      priority: 'High',
      metadata: {
        store_id: 'Store-NYC-015',
        store_name: 'NYC Fifth Avenue',
        product_sku: 'MR_HAIR_101',
        product_name: 'Premium Hair Color Kit',
        order_qty: 45,
        order_value: 1125.00,
        source_dc: 'DC-East',
        freight_cost: 22.50,
        expected_arrival: '2025-11-05'
      },
      action_taken: 'Create STO/PR',
      result: 'STO-2025-001234 created successfully in SAP',
      notes: 'Urgent replenishment for high-velocity SKU'
    });

    createTicket({
      ticket_type: 'FORECAST_OVERRIDE',
      source_tile: 'Tile 0: Forecast Simulation',
      source_module_id: 'tile0-forecast-simulation',
      status: 'Completed',
      priority: 'Normal',
      metadata: {
        store_id: 'Store-Chicago-001',
        product_sku: 'MR_HAIR_201',
        model1_arima: 38,
        model2_ets: 41,
        model3_ml_ensemble: 39,
        chosen_model: 'ML Ensemble',
        manual_override: 45,
        override_reason: 'Promotional campaign in Nov',
        confirmed_forecast: 45
      },
      action_taken: 'Confirm Forecast Override',
      result: 'Forecast confirmed and propagated to Tile 1',
      notes: 'Manual override due to planned promotional campaign'
    });

    createTicket({
      ticket_type: 'FINANCIAL_APPROVAL',
      source_tile: 'Tile 3: Financial Impact',
      source_module_id: 'store-financial-impact',
      status: 'Open',
      priority: 'Normal',
      metadata: {
        store_id: 'Store-Boston-022',
        product_sku: 'MR_CARE_301',
        recommended_qty: 24,
        gmroi: 2.1,
        net_value: 856.45,
        avoided_lost_margin: 935.00,
        carrying_cost: 52.80,
        freight_cost: 25.75,
        decision: 'Approve'
      },
      action_taken: 'Financial Approval Decision',
      result: null,
      notes: 'Strong GMROI (2.1) and positive net value - approved for execution'
    });

    createTicket({
      ticket_type: 'STO_CREATION',
      source_tile: 'Tile 4: Stock Transfer Execution',
      source_module_id: 'store-replenishment',
      status: 'In Progress',
      priority: 'Normal',
      metadata: {
        store_id: 'Store-Philly-018',
        store_name: 'Philadelphia Rittenhouse',
        product_sku: 'MR_HAIR_101',
        order_qty: 36,
        order_value: 900.00,
        source_dc: 'DC-East',
        freight_cost: 18.00,
        expected_arrival: '2025-11-06'
      },
      action_taken: 'Create STO/PR',
      result: null,
      notes: 'Awaiting SAP confirmation'
    });

    createTicket({
      ticket_type: 'STO_CREATION',
      source_tile: 'Tile 4: Stock Transfer Execution',
      source_module_id: 'store-replenishment',
      status: 'Failed',
      priority: 'High',
      metadata: {
        store_id: 'Store-Dallas-019',
        store_name: 'Dallas Galleria',
        product_sku: 'MR_CARE_301',
        order_qty: 48,
        order_value: 1344.00,
        source_dc: 'DC-Midwest',
        freight_cost: 36.00,
        expected_arrival: '2025-11-07'
      },
      action_taken: 'Create STO/PR',
      result: 'SAP Error: Insufficient inventory at DC-Midwest',
      notes: 'Failed due to insufficient DC inventory. Need to trigger inter-DC transfer first.'
    });

    // Additional sample tickets covering various modules and scenarios
    createTicket({
      ticket_type: 'SAFETY_STOCK_ADJUSTMENT',
      source_tile: 'Tile 2: Safety Stock Optimization',
      source_module_id: 'store-safety-stock',
      status: 'Completed',
      priority: 'Normal',
      metadata: {
        store_id: 'Store-Miami-025',
        store_name: 'Miami Brickell',
        product_sku: 'MR_HAIR_105',
        product_name: 'Color Gloss Treatment',
        current_safety_stock: 15,
        recommended_safety_stock: 22,
        adjustment_qty: 7,
        reason: 'Demand volatility increase detected',
        service_level_impact: '95% → 98%'
      },
      action_taken: 'Approve Safety Stock Adjustment',
      result: 'Safety stock updated in SAP - New ROP: 28 units',
      notes: 'Adjusted based on Q4 demand volatility analysis'
    });

    createTicket({
      ticket_type: 'HEALTH_ALERT',
      source_tile: 'Tile 1: Store Inventory Health',
      source_module_id: 'store-health-monitor',
      status: 'Completed',
      priority: 'High',
      metadata: {
        store_id: 'Store-LA-010',
        store_name: 'Los Angeles Beverly',
        alert_type: 'Critical Stock-Out Risk',
        affected_skus: 8,
        top_critical_sku: 'MR_CARE_202',
        days_until_stockout: 2,
        estimated_lost_sales: 2450.00
      },
      action_taken: 'Emergency Replenishment Triggered',
      result: 'Express STO created: STO-2025-001567',
      notes: 'Expedited shipping arranged - ETA 24 hours'
    });

    createTicket({
      ticket_type: 'DC_ALLOCATION',
      source_tile: 'DC Module 1: Forecast Layer',
      source_module_id: 'dc-demand-aggregation',
      status: 'Completed',
      priority: 'Normal',
      metadata: {
        dc_id: 'DC-West',
        product_sku: 'MR_HAIR_303',
        aggregated_demand: 1250,
        current_inventory: 890,
        allocation_decision: 'Increase procurement',
        procurement_qty: 500,
        supplier: 'SUP-001',
        lead_time_days: 14
      },
      action_taken: 'Create DC Procurement Order',
      result: 'PO-2025-008934 created successfully',
      notes: 'Aggregate demand from 125 stores for holiday season'
    });

    createTicket({
      ticket_type: 'LOT_SIZE_OPTIMIZATION',
      source_tile: 'DC Module 5: Lot Size Optimization',
      source_module_id: 'dc-lot-size',
      status: 'Completed',
      priority: 'Low',
      metadata: {
        product_sku: 'MR_HAIR_401',
        current_lot_size: 500,
        optimal_lot_size: 750,
        annual_demand: 12000,
        holding_cost_per_unit: 2.50,
        ordering_cost: 125.00,
        eoq_calculation: 748,
        estimated_savings: 3250.00
      },
      action_taken: 'Update Lot Size Parameters',
      result: 'Lot size updated in SAP: 500 → 750 units',
      notes: 'EOQ optimization - projected annual savings: $3,250'
    });

    createTicket({
      ticket_type: 'SUPPLIER_DELIVERY',
      source_tile: 'DC Module 6: Supplier Execution',
      source_module_id: 'dc-supplier-exec',
      status: 'In Progress',
      priority: 'Normal',
      metadata: {
        supplier_id: 'SUP-045',
        supplier_name: 'ColorChem Industries',
        po_number: 'PO-2025-009012',
        expected_delivery: '2025-11-08',
        delivery_status: 'In Transit',
        tracking_number: 'TRK-456789',
        order_value: 45600.00,
        line_items: 15
      },
      action_taken: 'Track Supplier Delivery',
      result: null,
      notes: 'Shipment departed warehouse - estimated arrival Nov 8'
    });

    createTicket({
      ticket_type: 'BOM_UPDATE',
      source_tile: 'DC Module 4: Bill of Materials',
      source_module_id: 'dc-bom',
      status: 'Completed',
      priority: 'Normal',
      metadata: {
        finished_good: 'MR_GIFT_SET_001',
        component_changes: 3,
        updated_components: [
          { sku: 'MR_HAIR_101', qty: 2 },
          { sku: 'MR_CARE_201', qty: 1 },
          { sku: 'PKG_BOX_PREMIUM', qty: 1 }
        ],
        assembly_cost_change: -2.50,
        effective_date: '2025-11-15'
      },
      action_taken: 'Update BOM Structure',
      result: 'BOM updated in SAP - Version 2.3',
      notes: 'Holiday gift set configuration updated - cost reduction achieved'
    });

    createTicket({
      ticket_type: 'FINANCIAL_ANALYSIS',
      source_tile: 'DC Module 7: Financial Impact',
      source_module_id: 'dc-financial-impact',
      status: 'Open',
      priority: 'Normal',
      metadata: {
        analysis_period: 'Q4 2025',
        total_inventory_value: 12500000,
        carrying_cost_annual: 1875000,
        carrying_cost_rate: 0.15,
        optimization_opportunity: 450000,
        recommended_action: 'Reduce slow-moving SKUs',
        affected_skus: 342
      },
      action_taken: 'Review Financial Impact',
      result: null,
      notes: 'Quarterly inventory optimization review - potential $450K savings identified'
    });

    createTicket({
      ticket_type: 'WHAT_IF_SCENARIO',
      source_tile: 'Tile 0: Forecast Simulation',
      source_module_id: 'tile0-forecast-simulation',
      status: 'Completed',
      priority: 'Low',
      metadata: {
        scenario_name: 'Black Friday Demand Surge',
        baseline_forecast: 850,
        scenario_forecast: 1450,
        uplift_percentage: 70,
        simulation_results: {
          required_safety_stock: 145,
          recommended_order_qty: 1200,
          stockout_probability: 0.05
        }
      },
      action_taken: 'Run What-If Scenario',
      result: 'Scenario simulation completed - Results shared with planning team',
      notes: 'Black Friday scenario planning - 70% demand surge modeled'
    });

    createTicket({
      ticket_type: 'INVENTORY_TRANSFER',
      source_tile: 'DC Module 3: Safety Stox Layer',
      source_module_id: 'dc-optimization',
      status: 'Completed',
      priority: 'High',
      metadata: {
        from_dc: 'DC-West',
        to_dc: 'DC-East',
        product_sku: 'MR_HAIR_505',
        transfer_qty: 250,
        transfer_value: 6250.00,
        reason: 'Regional demand imbalance',
        freight_cost: 185.00,
        transit_time_days: 3
      },
      action_taken: 'Inter-DC Transfer',
      result: 'Transfer order created: TRF-2025-000456',
      notes: 'Rebalancing inventory from low-demand West region to high-demand East'
    });

    createTicket({
      ticket_type: 'HEALTH_MONITOR',
      source_tile: 'DC Module 2: Health Monitor',
      source_module_id: 'dc-health-monitor',
      status: 'Open',
      priority: 'High',
      metadata: {
        dc_id: 'DC-Central',
        alert_type: 'Excess Inventory Warning',
        product_sku: 'MR_SEASONAL_101',
        current_stock: 2400,
        optimal_stock: 1200,
        excess_qty: 1200,
        excess_value: 18000.00,
        days_of_supply: 145,
        recommendation: 'Markdown or redistribute'
      },
      action_taken: 'Review Excess Inventory',
      result: null,
      notes: 'Seasonal product - recommend 30% markdown to clear excess before Q1'
    });

    createTicket({
      ticket_type: 'FORECAST_EXCEPTION',
      source_tile: 'Tile 0: Forecast Simulation',
      source_module_id: 'tile0-forecast-simulation',
      status: 'Cancelled',
      priority: 'Normal',
      metadata: {
        store_id: 'Store-Seattle-012',
        product_sku: 'MR_HAIR_201',
        exception_type: 'Model Disagreement >20%',
        arima_forecast: 32,
        ets_forecast: 55,
        ml_forecast: 41,
        variance_percentage: 41.8
      },
      action_taken: 'Investigate Forecast Exception',
      result: null,
      notes: 'CANCELLED: Exception resolved - Recent promotion data not reflected in ARIMA training'
    });

    createTicket({
      ticket_type: 'REPLENISHMENT_BATCH',
      source_tile: 'Tile 4: Stock Transfer Execution',
      source_module_id: 'store-replenishment',
      status: 'Completed',
      priority: 'Normal',
      metadata: {
        batch_id: 'BATCH-2025-1101-001',
        stores_count: 24,
        total_line_items: 156,
        total_order_value: 89450.00,
        total_freight_cost: 4235.00,
        execution_timestamp: '2025-11-01T14:30:00Z'
      },
      action_taken: 'Execute Batch Replenishment',
      result: 'Batch processed: 156/156 STOs created successfully',
      notes: 'Weekly automated replenishment batch for Midwest region stores'
    });

    createTicket({
      ticket_type: 'SUPPLIER_PERFORMANCE',
      source_tile: 'DC Module 6: Supplier Execution',
      source_module_id: 'dc-supplier-exec',
      status: 'Completed',
      priority: 'Low',
      metadata: {
        supplier_id: 'SUP-022',
        supplier_name: 'Premium Packaging Co',
        review_period: 'October 2025',
        on_time_delivery_rate: 0.92,
        quality_acceptance_rate: 0.98,
        total_orders: 25,
        late_deliveries: 2,
        performance_score: 95
      },
      action_taken: 'Monthly Supplier Review',
      result: 'Performance report generated - Supplier rated: Excellent',
      notes: 'Strong performance - eligible for preferred supplier status'
    });
};

// Initialize sample data on module load
initializeSampleTickets();

// Debug log
console.log('✅ useTickets module loaded - Total tickets:', ticketStore.length);

export default useTickets;
