// NexxtSpine Master Data for TRAXX.AI IoT Tracking
// Surgical kit and asset tracking data

export const regions = [
  { id: 'REG-001', name: 'Central', states: ['TX', 'OK', 'KS', 'NE'] },
  { id: 'REG-002', name: 'Mountain', states: ['CO', 'UT', 'AZ', 'NM'] },
  { id: 'REG-003', name: 'Western', states: ['CA', 'NV', 'OR', 'WA'] },
  { id: 'REG-004', name: 'Southern', states: ['GA', 'FL', 'AL', 'SC', 'NC'] },
  { id: 'REG-005', name: 'Midwest', states: ['OH', 'MI', 'IN', 'IL', 'WI'] },
  { id: 'REG-006', name: 'Eastern', states: ['NY', 'NJ', 'PA', 'MA', 'CT'] },
];

export const facilities = [
  { id: 'FAC-001', name: 'Texas Medical Center', type: 'hospital', region: 'Central', state: 'TX', revenue: 2500000, cases: 150 },
  { id: 'FAC-002', name: 'Dallas Spine Institute', type: 'asc', region: 'Central', state: 'TX', revenue: 1800000, cases: 95 },
  { id: 'FAC-003', name: 'Houston Methodist', type: 'hospital', region: 'Central', state: 'TX', revenue: 3200000, cases: 180 },
  { id: 'FAC-004', name: 'Denver Health', type: 'hospital', region: 'Mountain', state: 'CO', revenue: 2100000, cases: 120 },
  { id: 'FAC-005', name: 'Phoenix Ortho Center', type: 'asc', region: 'Mountain', state: 'AZ', revenue: 1500000, cases: 85 },
  { id: 'FAC-006', name: 'UCLA Medical Center', type: 'hospital', region: 'Western', state: 'CA', revenue: 4500000, cases: 250 },
  { id: 'FAC-007', name: 'Stanford Health', type: 'hospital', region: 'Western', state: 'CA', revenue: 3800000, cases: 200 },
  { id: 'FAC-008', name: 'Cedars-Sinai', type: 'hospital', region: 'Western', state: 'CA', revenue: 4200000, cases: 230 },
  { id: 'FAC-009', name: 'Emory Healthcare', type: 'hospital', region: 'Southern', state: 'GA', revenue: 2800000, cases: 160 },
  { id: 'FAC-010', name: 'Mayo Clinic Florida', type: 'hospital', region: 'Southern', state: 'FL', revenue: 3500000, cases: 190 },
  { id: 'FAC-011', name: 'Cleveland Clinic', type: 'hospital', region: 'Midwest', state: 'OH', revenue: 4000000, cases: 220 },
  { id: 'FAC-012', name: 'Northwestern Memorial', type: 'hospital', region: 'Midwest', state: 'IL', revenue: 3100000, cases: 175 },
  { id: 'FAC-013', name: 'NYU Langone', type: 'hospital', region: 'Eastern', state: 'NY', revenue: 4800000, cases: 280 },
  { id: 'FAC-014', name: 'Mass General', type: 'hospital', region: 'Eastern', state: 'MA', revenue: 4600000, cases: 260 },
  { id: 'FAC-015', name: 'Penn Medicine', type: 'hospital', region: 'Eastern', state: 'PA', revenue: 3900000, cases: 210 },
  { id: 'FAC-016', name: 'Seattle Spine Center', type: 'asc', region: 'Western', state: 'WA', revenue: 1200000, cases: 70 },
  { id: 'FAC-017', name: 'Atlanta Spine Institute', type: 'asc', region: 'Southern', state: 'GA', revenue: 1400000, cases: 80 },
  { id: 'FAC-018', name: 'Chicago Ortho ASC', type: 'asc', region: 'Midwest', state: 'IL', revenue: 1600000, cases: 90 },
  { id: 'FAC-019', name: 'Boston Spine Center', type: 'asc', region: 'Eastern', state: 'MA', revenue: 1300000, cases: 75 },
  { id: 'FAC-020', name: 'Oklahoma City Medical', type: 'hospital', region: 'Central', state: 'OK', revenue: 1900000, cases: 110 },
  { id: 'FAC-021', name: 'Salt Lake Spine', type: 'asc', region: 'Mountain', state: 'UT', revenue: 1100000, cases: 65 },
  { id: 'FAC-022', name: 'San Diego Ortho', type: 'hospital', region: 'Western', state: 'CA', revenue: 2600000, cases: 145 },
  { id: 'FAC-023', name: 'Miami Spine Institute', type: 'hospital', region: 'Southern', state: 'FL', revenue: 2400000, cases: 135 },
  { id: 'FAC-024', name: 'Detroit Medical Center', type: 'hospital', region: 'Midwest', state: 'MI', revenue: 2200000, cases: 125 },
  { id: 'FAC-025', name: 'Newark Spine Surgery', type: 'asc', region: 'Eastern', state: 'NJ', revenue: 1000000, cases: 60 },
];

export const distributors = [
  { id: 'DIST-001', name: 'MedTech Distribution Central', region: 'Central', contact: 'John Smith', phone: '214-555-0100' },
  { id: 'DIST-002', name: 'Rocky Mountain Med Supply', region: 'Mountain', contact: 'Sarah Johnson', phone: '303-555-0200' },
  { id: 'DIST-003', name: 'Pacific Coast Medical', region: 'Western', contact: 'Michael Chen', phone: '415-555-0300' },
  { id: 'DIST-004', name: 'Southeast Surgical Supply', region: 'Southern', contact: 'Emily Davis', phone: '404-555-0400' },
  { id: 'DIST-005', name: 'Great Lakes Distribution', region: 'Midwest', contact: 'Robert Wilson', phone: '312-555-0500' },
  { id: 'DIST-006', name: 'Atlantic Med Partners', region: 'Eastern', contact: 'Jennifer Brown', phone: '212-555-0600' },
  { id: 'DIST-007', name: 'Texas Spine Logistics', region: 'Central', contact: 'David Martinez', phone: '713-555-0700' },
  { id: 'DIST-008', name: 'Arizona Surgical Supply', region: 'Mountain', contact: 'Lisa Anderson', phone: '602-555-0800' },
  { id: 'DIST-009', name: 'California Med Solutions', region: 'Western', contact: 'James Taylor', phone: '310-555-0900' },
  { id: 'DIST-010', name: 'Florida Ortho Supply', region: 'Southern', contact: 'Amanda White', phone: '305-555-1000' },
];

export const kitConfigurations = [
  { id: 'KIT-001', name: 'Cervical Fusion Set', system: 'Cervical Spine', items: 45, value: 125000 },
  { id: 'KIT-002', name: 'Lumbar Interbody Set', system: 'Lumbar Spine', items: 52, value: 145000 },
  { id: 'KIT-003', name: 'Pedicle Screw System', system: 'Spinal Fixation', items: 68, value: 185000 },
  { id: 'KIT-004', name: 'TLIF Instrument Set', system: 'Lumbar Spine', items: 38, value: 95000 },
  { id: 'KIT-005', name: 'ACDF Complete Kit', system: 'Cervical Spine', items: 42, value: 115000 },
  { id: 'KIT-006', name: 'Minimally Invasive Set', system: 'MIS Surgery', items: 35, value: 165000 },
  { id: 'KIT-007', name: 'Deformity Correction Set', system: 'Spinal Deformity', items: 85, value: 245000 },
  { id: 'KIT-008', name: 'Revision Surgery Kit', system: 'Revision', items: 60, value: 175000 },
  { id: 'KIT-009', name: 'Thoracic Fixation Set', system: 'Thoracic Spine', items: 55, value: 155000 },
  { id: 'KIT-010', name: 'Sacral Fixation System', system: 'Sacral', items: 40, value: 105000 },
  { id: 'KIT-011', name: 'Expandable Cage Set', system: 'Interbody', items: 28, value: 135000 },
  { id: 'KIT-012', name: 'Navigation Instruments', system: 'Navigation', items: 25, value: 195000 },
];

export const surgeons = [
  { id: 'SURG-001', name: 'Dr. James Mitchell', specialty: 'Spine Surgery', facility: 'FAC-001' },
  { id: 'SURG-002', name: 'Dr. Sarah Chen', specialty: 'Orthopedic Spine', facility: 'FAC-006' },
  { id: 'SURG-003', name: 'Dr. Michael Roberts', specialty: 'Neurosurgery', facility: 'FAC-011' },
  { id: 'SURG-004', name: 'Dr. Emily Watson', specialty: 'Minimally Invasive', facility: 'FAC-013' },
  { id: 'SURG-005', name: 'Dr. David Kim', specialty: 'Spine Surgery', facility: 'FAC-007' },
  { id: 'SURG-006', name: 'Dr. Jennifer Lee', specialty: 'Orthopedic Spine', facility: 'FAC-009' },
  { id: 'SURG-007', name: 'Dr. Robert Garcia', specialty: 'Deformity Correction', facility: 'FAC-014' },
  { id: 'SURG-008', name: 'Dr. Amanda Taylor', specialty: 'Spine Surgery', facility: 'FAC-003' },
  { id: 'SURG-009', name: 'Dr. Christopher Brown', specialty: 'Neurosurgery', facility: 'FAC-012' },
  { id: 'SURG-010', name: 'Dr. Michelle Davis', specialty: 'Minimally Invasive', facility: 'FAC-010' },
  { id: 'SURG-011', name: 'Dr. William Johnson', specialty: 'Spine Surgery', facility: 'FAC-004' },
  { id: 'SURG-012', name: 'Dr. Lisa Anderson', specialty: 'Orthopedic Spine', facility: 'FAC-015' },
];

export default {
  regions,
  facilities,
  distributors,
  kitConfigurations,
  surgeons,
};
