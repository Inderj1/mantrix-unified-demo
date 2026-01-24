// TRAXX.AI Mock Data Generators
// Shared mock data for Loaner and Consignment processes
// Updated with real NexxtSpine financial data

import {
  facilities,
  distributors as nexxtDistributors,
  systems,
  surgeons,
  kitConfigurations,
  getRandomFacility,
  getRandomDistributor,
  getRandomSurgeon,
} from '../../../data/nexxtspineData';

// Real NexxtSpine facilities
const hospitals = facilities.map(f => f.name);

// Real NexxtSpine distributors
const distributors = nexxtDistributors.map(d => d.name);

// Real NexxtSpine kit types based on systems
const kitTypes = [
  'Matrixx Standard Kit', 'Matrixx Deformity Kit', 'Inertia CONNEXX Kit',
  'Struxxure Cervical Kit', 'TrellOss Biologics Kit', 'SAXXONY Interbody Kit',
  'NEXXT MATRIXX Full Kit', 'SILC Cervical Kit', 'NEXXT MATRIXX ALIF Kit',
  'NEXXT MATRIXX Lateral Kit', 'Phalanxx Occiput Kit'
];

const carriers = ['FedEx', 'UPS', 'DHL', 'USPS Priority'];

const statuses = {
  orders: ['Requested', 'Approved', 'Processing', 'Ready', 'Shipped', 'Completed'],
  shipments: ['Pending Pickup', 'In Transit', 'Out for Delivery', 'Delivered', 'Returned'],
  operations: ['In Use', 'Awaiting Return', 'In QC', 'Ready for Restock', 'Restocked'],
  finance: ['Draft', 'Sent', 'Pending Payment', 'Partially Paid', 'Paid', 'Overdue']
};

// Helper to generate random date within range
const randomDate = (startDays, endDays) => {
  const start = new Date();
  start.setDate(start.getDate() - startDays);
  const end = new Date();
  end.setDate(end.getDate() - endDays);
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ============ KIT ORDERS DATA ============
export const generateKitOrderData = (processType = 'loaner', count = 20) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    order_id: `${processType === 'loaner' ? 'LO' : 'CO'}-${String(1000 + i).padStart(4, '0')}`,
    kit_id: `KIT-${String(4500 + i).padStart(4, '0')}`,
    kit_name: randomElement(kitTypes),
    hospital: randomElement(hospitals),
    distributor: randomElement(distributors),
    request_date: randomDate(30, 1),
    transfer_order: `TO-${String(78900 + i).padStart(5, '0')}`,
    status: randomElement(statuses.orders),
    process_type: processType,
    priority: randomElement(['High', 'Medium', 'Low']),
    estimated_value: randomNumber(5000, 50000),
  }));
};

export const generateOrderDetail = (order) => {
  const items = Array.from({ length: randomNumber(5, 12) }, (_, i) => ({
    id: i + 1,
    item_code: `ITM-${String(100 + i).padStart(3, '0')}`,
    description: `${randomElement(['Screw', 'Plate', 'Rod', 'Cage', 'Pin', 'Wire'])} ${randomNumber(10, 50)}mm`,
    quantity: randomNumber(1, 10),
    unit_price: randomNumber(100, 2000),
  }));

  // Use real NexxtSpine surgeon names
  const surgeon = getRandomSurgeon();
  const timeline = [
    { step: 'Requested', date: order.request_date, status: 'completed', user: surgeon.name },
    { step: 'Approved', date: randomDate(25, 20), status: 'completed', user: 'Admin Team' },
    { step: 'Transfer Order Created', date: randomDate(20, 15), status: order.status === 'Requested' ? 'pending' : 'completed', user: 'System' },
    { step: 'Ready for Shipment', date: randomDate(15, 10), status: ['Shipped', 'Completed'].includes(order.status) ? 'completed' : 'pending', user: 'Warehouse' },
    { step: 'Shipped', date: randomDate(10, 5), status: order.status === 'Completed' ? 'completed' : 'pending', user: 'Logistics' },
  ];

  return {
    ...order,
    items,
    timeline,
    total_value: items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
    notes: 'Standard surgical procedure kit request',
    contact_phone: '(555) 123-4567',
    contact_email: 'orders@hospital.com',
    orderTrend: Array.from({ length: 6 }, () => randomNumber(10, 30)),
    avgProcessingDays: randomNumber(2, 7),
  };
};

// ============ SHIPMENT DATA ============
export const generateShipmentData = (processType = 'loaner', count = 15) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    shipment_id: `SH-${String(5000 + i).padStart(4, '0')}`,
    kit_id: `KIT-${String(4500 + i).padStart(4, '0')}`,
    kit_name: randomElement(kitTypes),
    direction: processType === 'loaner' ? randomElement(['Outbound', 'Return']) : randomElement(['Initial', 'Replacement']),
    carrier: randomElement(carriers),
    tracking_number: `${randomNumber(1000000000, 9999999999)}`,
    origin: randomElement(['DC Atlanta', 'DC Chicago', 'DC Dallas', 'DC LA']),
    destination: randomElement(hospitals),
    status: randomElement(statuses.shipments),
    ship_date: randomDate(14, 1),
    eta: randomDate(0, -3),
    process_type: processType,
  }));
};

export const generateShipmentDetail = (shipment) => {
  const trackingEvents = [
    { timestamp: `${shipment.ship_date} 08:00`, event: 'Package picked up', location: shipment.origin },
    { timestamp: `${shipment.ship_date} 14:30`, event: 'Departed facility', location: shipment.origin },
    { timestamp: `${randomDate(10, 5)} 09:15`, event: 'In transit', location: 'Regional Hub' },
    { timestamp: `${randomDate(5, 2)} 11:45`, event: 'Arrived at destination facility', location: shipment.destination },
    { timestamp: `${shipment.eta} 10:00`, event: shipment.status === 'Delivered' ? 'Delivered' : 'Out for delivery', location: shipment.destination },
  ];

  return {
    ...shipment,
    trackingEvents,
    package_weight: `${randomNumber(5, 25)} lbs`,
    package_dimensions: `${randomNumber(12, 24)}x${randomNumber(12, 24)}x${randomNumber(8, 16)} in`,
    special_instructions: 'Handle with care - Medical Equipment',
    signature_required: true,
    insurance_value: randomNumber(10000, 50000),
    transitHistory: Array.from({ length: 12 }, () => randomNumber(1, 5)),
    onTimeRate: randomNumber(85, 99),
  };
};

// ============ OPERATIONS DATA ============
export const generateOperationsData = (processType = 'loaner', count = 25) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    kit_id: `KIT-${String(4500 + i).padStart(4, '0')}`,
    kit_name: randomElement(kitTypes),
    hospital: randomElement(hospitals),
    distributor: randomElement(distributors),
    procedure_date: randomDate(30, 1),
    items_used: randomNumber(3, 15),
    po_number: `PO-${String(90000 + i).padStart(5, '0')}`,
    return_status: processType === 'loaner' ? randomElement(['Pending', 'In Transit', 'Received']) : 'N/A',
    qc_status: randomElement(['Pending', 'In Progress', 'Passed', 'Failed']),
    restock_status: randomElement(['Pending', 'In Progress', 'Completed']),
    stock_level: processType === 'consignment' ? randomNumber(5, 50) : null,
    pending_replacements: processType === 'consignment' ? randomNumber(0, 5) : null,
    process_type: processType,
  }));
};

export const generateOperationsDetail = (operation) => {
  const itemsConsumed = Array.from({ length: operation.items_used }, (_, i) => ({
    id: i + 1,
    item_code: `ITM-${String(100 + i).padStart(3, '0')}`,
    description: `${randomElement(['Screw', 'Plate', 'Rod', 'Cage', 'Pin'])} ${randomNumber(10, 50)}mm`,
    quantity_used: randomNumber(1, 3),
    lot_number: `LOT-${randomNumber(100000, 999999)}`,
  }));

  const qcChecklist = [
    { item: 'Visual Inspection', status: randomElement(['Pass', 'Pass', 'Pass', 'Fail']), notes: '' },
    { item: 'Sterilization Check', status: randomElement(['Pass', 'Pass', 'Pass', 'Pending']), notes: '' },
    { item: 'Inventory Count', status: randomElement(['Pass', 'Pass', 'Discrepancy']), notes: '' },
    { item: 'Damage Assessment', status: randomElement(['Pass', 'Pass', 'Pass', 'Minor Issue']), notes: '' },
    { item: 'Documentation Review', status: randomElement(['Pass', 'Pass', 'Incomplete']), notes: '' },
  ];

  const usageHistory = Array.from({ length: 6 }, (_, i) => ({
    month: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    procedures: randomNumber(5, 20),
    items_used: randomNumber(20, 100),
  }));

  return {
    ...operation,
    itemsConsumed,
    qcChecklist,
    usageHistory,
    procedure_type: randomElement(['Spinal Fusion', 'Cervical Decompression', 'Lumbar Interbody Fusion', 'Pedicle Screw Fixation', 'ALIF Procedure']),
    surgeon: getRandomSurgeon().name,
    procedure_duration: `${randomNumber(1, 4)}h ${randomNumber(0, 59)}m`,
    kit_health_score: randomNumber(70, 100),
    utilizationTrend: Array.from({ length: 12 }, () => randomNumber(60, 95)),
  };
};

// ============ FINANCE DATA ============
export const generateFinanceData = (processType = 'loaner', count = 30) => {
  return Array.from({ length: count }, (_, i) => {
    // Use real NexxtSpine distributor data for commission rates
    const distributor = getRandomDistributor();
    return {
      id: i + 1,
      invoice_id: `INV-${String(40000 + i).padStart(5, '0')}`,
      kit_id: `KIT-${String(4500 + i).padStart(4, '0')}`,
      kit_name: randomElement(kitTypes),
      hospital: randomElement(hospitals),
      distributor: distributor.name,
      amount: randomNumber(15000, 125000), // Realistic NexxtSpine case values
      invoice_date: randomDate(60, 1),
      due_date: randomDate(30, -30),
      status: randomElement(statuses.finance),
      payment_date: randomElement([randomDate(15, 1), null, null]),
      commission_rate: Math.round(distributor.commission * 100), // 18-20%
      process_type: processType,
      gross_margin_pct: randomNumber(82, 95), // Based on CGS data
    };
  });
};

export const generateFinanceDetail = (invoice) => {
  const lineItems = Array.from({ length: randomNumber(5, 12) }, (_, i) => ({
    id: i + 1,
    item_code: `ITM-${String(100 + i).padStart(3, '0')}`,
    description: `${randomElement(['Screw', 'Plate', 'Rod', 'Cage', 'Pin', 'Wire'])} ${randomNumber(10, 50)}mm`,
    quantity: randomNumber(1, 5),
    unit_price: randomNumber(200, 5000),
    total: 0,
  }));
  lineItems.forEach(item => item.total = item.quantity * item.unit_price);

  const paymentHistory = invoice.status === 'Paid' ? [
    { date: invoice.payment_date, amount: invoice.amount, method: 'Wire Transfer', reference: `PAY-${randomNumber(100000, 999999)}` },
  ] : invoice.status === 'Partially Paid' ? [
    { date: randomDate(20, 10), amount: Math.floor(invoice.amount * 0.5), method: 'Check', reference: `PAY-${randomNumber(100000, 999999)}` },
  ] : [];

  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => ({
    month: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    revenue: randomNumber(50000, 200000),
  }));

  return {
    ...invoice,
    lineItems,
    paymentHistory,
    monthlyRevenue,
    subtotal: lineItems.reduce((sum, item) => sum + item.total, 0),
    tax: Math.floor(invoice.amount * 0.08),
    commission_amount: Math.floor(invoice.amount * (invoice.commission_rate / 100)),
    revenue_recognized: invoice.status === 'Paid',
    dso: randomNumber(25, 60),
    billing_address: `${randomNumber(100, 999)} Medical Center Dr, ${randomElement(['Boston', 'Chicago', 'LA', 'NYC'])}, ${randomElement(['MA', 'IL', 'CA', 'NY'])}`,
  };
};

// ============ SUMMARY METRICS ============
export const calculateKitOrderMetrics = (data) => ({
  totalOrders: data.length,
  pendingApprovals: data.filter(d => d.status === 'Requested').length,
  inProcess: data.filter(d => ['Approved', 'Processing', 'Ready'].includes(d.status)).length,
  avgProcessingDays: Math.floor(Math.random() * 3) + 2,
});

export const calculateShipmentMetrics = (data) => ({
  activeShipments: data.length,
  inTransit: data.filter(d => d.status === 'In Transit').length,
  awaitingPickup: data.filter(d => d.status === 'Pending Pickup').length,
  avgTransitDays: Math.floor(Math.random() * 2) + 2,
});

export const calculateOperationsMetrics = (data) => ({
  kitsInUse: data.filter(d => d.qc_status !== 'Passed').length,
  pendingReturns: data.filter(d => d.return_status === 'Pending').length,
  inQC: data.filter(d => d.qc_status === 'In Progress').length,
  readyForRestock: data.filter(d => d.restock_status === 'Pending').length,
});

export const calculateFinanceMetrics = (data) => ({
  totalRevenue: data.reduce((sum, d) => sum + d.amount, 0),
  outstanding: data.filter(d => !['Paid'].includes(d.status)).reduce((sum, d) => sum + d.amount, 0),
  commissionsDue: data.reduce((sum, d) => sum + Math.floor(d.amount * (d.commission_rate / 100)), 0),
  avgDSO: Math.floor(Math.random() * 15) + 30,
});
