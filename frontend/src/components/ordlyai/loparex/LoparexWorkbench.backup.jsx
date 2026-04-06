import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Chip, Button, TextField, InputAdornment, Tabs, Tab,
  Paper, Stack, Snackbar, Alert, LinearProgress, Breadcrumbs, Link, IconButton, Collapse,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowBack as ArrowBackIcon, NavigateNext as NavigateNextIcon,
  Search as SearchIcon, CheckCircle as CheckCircleIcon,
  Warning as WarningIcon, Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon,
  Edit as EditIcon, Check as CheckIcon, Close as CloseIcon,
  Bolt as BoltIcon, Save as SaveIcon, ReportProblem as ReportProblemIcon,
  FiberManualRecord as DotIcon,
} from '@mui/icons-material';
import { MODULE_COLOR, BRAND, SEMANTIC } from '../../../config/brandColors';

// ─── Color Constants (from platform brand system) ───
const NAVY = BRAND.navy.main;
const NAVY_DARK = BRAND.navy.dark;
const NAVY_LIGHT = BRAND.navy.light;
const GREEN = SEMANTIC.success.main;
const GREEN_DARK = SEMANTIC.success.dark;
const AMBER = '#d97706';
const RED = SEMANTIC.error.main;
const PURPLE = '#6436C8';
const MUTED = '#7A90A8';
const BORDER = 'rgba(0,0,0,0.08)';

// ─── Helpers ───
const fmt = (v) => `$${v.toLocaleString()}`;
const confLevel = (c) => c >= 90 ? 'high' : c >= 70 ? 'mid' : c > 0 ? 'low' : 'zero';
const confColor = (c) => c >= 90 ? GREEN : c >= 70 ? AMBER : c > 0 ? RED : '#94a3b8';
const confBg = (c) => c >= 90 ? alpha(GREEN, 0.1) : c >= 70 ? alpha(AMBER, 0.1) : c > 0 ? alpha(RED, 0.1) : alpha('#94a3b8', 0.08);
const statusColor = { new: NAVY, validating: AMBER, ready: GREEN, exception: RED, reviewing: PURPLE };
const statusBg = { new: alpha(NAVY, 0.1), validating: alpha(AMBER, 0.1), ready: alpha(GREEN, 0.1), exception: alpha(RED, 0.1), reviewing: alpha(PURPLE, 0.1) };
const priorityColor = { high: RED, medium: AMBER, strategic: PURPLE, low: '#94a3b8' };

// ─── Mock Data: 5 Orders ───
const ORDERS = [
  {
    id: 'ORD-001', poNumber: 'PO-2024-8821', customer: 'Honeywell Industrial', soldTo: 'CUST-10045',
    amount: 142800, channel: 'Email', channelIcon: '✉', status: 'new', priority: 'high', received: '09:15 AM', lines: 3,
    hdr: [
      { lbl: 'Sold-To Customer', val: 'Honeywell Industrial LLC', conf: 98, sap: 'VBAK-KUNNR' },
      { lbl: 'Customer PO Number', val: 'PO-2024-8821', conf: 99, sap: 'VBKD-BSTKD' },
      { lbl: 'PO Date', val: 'March 8, 2024', conf: 99, sap: 'VBKD-BSTDK' },
      { lbl: 'Ship-To Address', val: '300 S Tryon St, Charlotte NC', conf: 91, sap: 'VBPA-WE' },
      { lbl: 'Incoterms', val: 'CIP Charlotte, NC', conf: 85, sap: 'VBKD-INCO1' },
      { lbl: 'Delivery Instructions', val: 'No substitutes. Standard packaging.', conf: 96, sap: 'VBKD-BSTK2' },
    ],
    items: [
      { line: 10, custSku: 'HON-MECH-4455', sapMat: 'MECH-4455', qty: '300', uom: 'EA', price: '285.00', cur: 'USD', reqDate: 'April 15, 2024', confMat: 94, confQty: 99, confPrice: 88, confDate: 97, lineGM: '31.4%', confirmDate: 'April 12, 2024',
        plantOptions: [
          { code: 'PL01', name: 'Chicago, IL', dist: '788 mi', atp: 340, freightCost: 840, freightPerUnit: 1.68, arrivalDate: 'Apr 12', onTime: true, lateDays: 0, score: 89, selected: true },
          { code: 'PL02', name: 'Atlanta, GA', dist: '415 mi', atp: 500, freightCost: 2400, freightPerUnit: 4.80, arrivalDate: 'Apr 8', onTime: true, lateDays: 0, score: 71 },
          { code: 'PL03', name: 'Detroit, MI', dist: '640 mi', atp: 0, freightCost: 1900, freightPerUnit: 3.80, arrivalDate: 'Apr 27', onTime: false, lateDays: 12, score: 18 },
        ],
        insight: 'PL01 selected: replenishment closes the 160-unit gap by Apr 8, delivering 3 days early. Freight $1,560 cheaper than PL02.',
      },
      { line: 20, custSku: 'HON-SEAL-8821', sapMat: 'SEAL-8821', qty: '200', uom: 'EA', price: '149.50', cur: 'USD', reqDate: 'April 15, 2024', confMat: 91, confQty: 95, confPrice: 92, confDate: 97, lineGM: '28.7%', confirmDate: 'April 11, 2024',
        plantOptions: [
          { code: 'PL01', name: 'Chicago, IL', dist: '788 mi', atp: 250, freightCost: 520, freightPerUnit: 2.60, arrivalDate: 'Apr 11', onTime: true, lateDays: 0, score: 84, selected: true },
          { code: 'PL02', name: 'Atlanta, GA', dist: '415 mi', atp: 200, freightCost: 1800, freightPerUnit: 9.00, arrivalDate: 'Apr 8', onTime: true, lateDays: 0, score: 62 },
        ],
        insight: 'PL01 covers full 200-unit requirement. Freight $1,280 cheaper than PL02. Consolidated shipment with Line 10.',
      },
      { line: 30, custSku: 'HON-CTRL-2244', sapMat: 'CTRL-2244', qty: '50', uom: 'EA', price: '548.00', cur: 'USD', reqDate: 'April 20, 2024', confMat: 87, confQty: 99, confPrice: 0, confDate: 85, lineGM: 'Unknown — price not confirmed', confirmDate: 'April 17, 2024',
        plantOptions: [
          { code: 'PL01', name: 'Chicago, IL', dist: '788 mi', atp: 80, freightCost: 310, freightPerUnit: 6.20, arrivalDate: 'Apr 17', onTime: true, lateDays: 0, score: 76, selected: true },
        ],
        insight: 'Price not stated in PO — contract price $548.00 applied from ZK100245. CSR should confirm with customer.',
      },
    ],
    validations: [
      { lbl: 'Customer Master', st: 'ok', msg: 'CUST-10045 active in KNA1. Credit class: A.', src: 'KNA1/KNVV' },
      { lbl: 'Material Mapping', st: 'ok', msg: 'MECH-4455 / SEAL-8821 validated. CTRL-2244 pending price confirm.', src: 'MARA/MVKE' },
      { lbl: 'Pricing Record', st: 'warn', msg: 'CTRL-2244 price not in PO — contract ZK100245 $548.00/EA applied. Confirm needed.', src: 'PRCD_ELEMENTS' },
      { lbl: 'Credit / FSCM', st: 'ok', msg: 'Limit $2M. Exposure $380K. Clear.', src: 'UKM_* / FSCM' },
      { lbl: 'Inventory / ATP', st: 'warn', msg: 'MECH-4455: 340 EA + 160 replenish by Apr 8. SEAL-8821: 250 EA available.', src: 'MARD/MATDOC' },
      { lbl: 'Contracts / Agreements', st: 'ok', msg: 'Framework ZK100245 active through Dec 2024.', src: 'VBAK/VBKD' },
      { lbl: 'Open AR / Payment Risk', st: 'ok', msg: 'No overdue. DSO: 28 days. Clean.', src: 'BSID/ACDOCA' },
      { lbl: 'Order Blocking Reasons', st: 'ok', msg: 'No blocks active.', src: 'VBUK' },
    ],
    decision: {
      score: 84, rec: 'Auto-Create Sales Order', autoOk: true,
      plant: 'PL01 — Chicago, IL', plantReason: 'Highest margin + nearest to ship-to for all 3 lines',
      confirmedQty: '300 + 200 + 50 EA (3 lines)', confirmedDate: 'Apr 12 / Apr 11 / Apr 17',
      mode: 'Partial Stock + Replenishment', gm: '31.4% blended', marginVsAlt: '+$4,200 vs alternate routing',
      ibpSignal: 'MECH-4455 replenishment PO confirmed. IBP receipt signal: Apr 8. SEAL-8821 and CTRL-2244 fully in stock.',
      ibpLead: 'IBP Lead Time: 18 days from PL01',
      scores: { 'Service Level': 88, 'Margin Impact': 82, 'Customer Value': 91, 'Lead Time': 85, 'Inventory Health': 74, 'AR / Credit Risk': 95 },
    },
    soHeader: [
      { lbl: 'Order Type', val: 'ZOR', sap: 'VBAK-AUART' }, { lbl: 'Sales Org', val: '1000', sap: 'VBAK-VKORG' },
      { lbl: 'Dist. Channel', val: '10', sap: 'VBAK-VTWEG' }, { lbl: 'Division', val: '00', sap: 'VBAK-SPART' },
      { lbl: 'Sold-To', val: '10045', sap: 'KNVP AG' }, { lbl: 'Ship-To', val: '10045-01', sap: 'KNVP WE' },
      { lbl: 'Customer PO', val: 'PO-2024-8821', sap: 'VBKD-BSTKD' }, { lbl: 'Req. Date', val: 'Multi-line', sap: 'VBKD-BSTDK' },
    ],
    soItems: [
      { line: 10, mat: 'MECH-4455', qty: 300, plant: 'PL01', date: '2024-04-12', price: 284.50 },
      { line: 20, mat: 'SEAL-8821', qty: 200, plant: 'PL01', date: '2024-04-11', price: 149.50 },
      { line: 30, mat: 'CTRL-2244', qty: 50, plant: 'PL01', date: '2024-04-17', price: 548.00 },
    ],
  },
  {
    id: 'ORD-002', poNumber: 'PO-2024-8822', customer: 'Siemens Energy AG', soldTo: 'CUST-20031',
    amount: 88700, channel: 'EDI', channelIcon: '⇌', status: 'validating', priority: 'medium', received: '08:42 AM', lines: 2,
    hdr: [
      { lbl: 'Sold-To Customer', val: 'Siemens Energy AG', conf: 99, sap: 'VBAK-KUNNR' },
      { lbl: 'Customer PO Number', val: 'PO-2024-8822', conf: 99, sap: 'VBKD-BSTKD' },
      { lbl: 'PO Date', val: 'March 9, 2024', conf: 99, sap: 'VBKD-BSTDK' },
      { lbl: 'Ship-To Address', val: '4400 Alafaya Trail, Orlando FL 32826', conf: 99, sap: 'VBPA-WE' },
      { lbl: 'Incoterms', val: 'DDP Orlando', conf: 98, sap: 'VBKD-INCO1' },
      { lbl: 'Delivery Instructions', val: 'EDI 850. Auto-accept if price matched.', conf: 99, sap: 'VBKD-BSTK2' },
    ],
    items: [
      { line: 10, custSku: 'SIE-ELEC-7890', sapMat: 'ELEC-7890', qty: '100', uom: 'EA', price: '446.00', cur: 'USD', reqDate: 'April 20, 2024', confMat: 97, confQty: 99, confPrice: 99, confDate: 99, lineGM: '28.1%', confirmDate: 'April 9, 2024',
        plantOptions: [
          { code: 'PL02', name: 'Atlanta, GA', dist: '441 mi', atp: 320, freightCost: 960, freightPerUnit: 4.80, arrivalDate: 'Apr 9', onTime: true, lateDays: 0, score: 88, selected: true },
          { code: 'PL01', name: 'Chicago, IL', dist: '1,144 mi', atp: 280, freightCost: 2050, freightPerUnit: 10.25, arrivalDate: 'Apr 10', onTime: true, lateDays: 0, score: 62 },
        ],
        insight: 'PL02 selected: full ATP, nearest plant, cheapest freight. PL01 on-time but $1,090 more expensive.',
      },
      { line: 20, custSku: 'SIE-CTRL-4421', sapMat: 'CTRL-4421', qty: '50', uom: 'EA', price: '882.00', cur: 'USD', reqDate: 'April 20, 2024', confMat: 93, confQty: 99, confPrice: 76, confDate: 99, lineGM: '24.3%', confirmDate: 'April 11, 2024',
        plantOptions: [
          { code: 'PL02', name: 'Atlanta, GA', dist: '441 mi', atp: 75, freightCost: 620, freightPerUnit: 12.40, arrivalDate: 'Apr 11', onTime: true, lateDays: 0, score: 82, selected: true },
        ],
        insight: 'Price confidence 76% — OCR read $882 but contract shows $874/EA. Delta $8/EA ($400 total). CSR approval required.',
      },
    ],
    validations: [
      { lbl: 'Customer Master', st: 'ok', msg: 'CUST-20031 active. Credit class: B.', src: 'KNA1/KNVV' },
      { lbl: 'Material Mapping', st: 'ok', msg: 'ELEC-7890 and CTRL-4421 validated and active.', src: 'MARA/MVKE' },
      { lbl: 'Pricing Record', st: 'warn', msg: 'Contract expired Mar 31. Spot price applied on ELEC-7890. CTRL-4421 delta $8/EA.', src: 'PRCD_ELEMENTS' },
      { lbl: 'Credit / FSCM', st: 'ok', msg: 'Limit $1.5M. Exposure $240K. Clear.', src: 'UKM_* / FSCM' },
      { lbl: 'Inventory / ATP', st: 'ok', msg: 'ELEC-7890: 320 EA. CTRL-4421: 75 EA available.', src: 'MARD/MATDOC' },
      { lbl: 'Contracts / Agreements', st: 'warn', msg: 'Framework expired. Renewal in progress — no signed doc.', src: 'VBAK/VBKD' },
      { lbl: 'Open AR / Payment Risk', st: 'ok', msg: 'Clean. DSO 32 days.', src: 'BSID/ACDOCA' },
      { lbl: 'Order Blocking Reasons', st: 'ok', msg: 'No blocks.', src: 'VBUK' },
    ],
    decision: {
      score: 72, rec: 'Human Review — Pricing Mismatch', autoOk: false,
      plant: 'PL02 — Atlanta, GA', plantReason: 'Full stock. Nearest plant for both lines.',
      confirmedQty: '100 + 50 EA (2 lines)', confirmedDate: 'Apr 9 / Apr 11',
      mode: 'Full Stock Available', gm: '27.2% blended', marginVsAlt: '−$2,800 if spot price accepted without approval',
      ibpSignal: 'No replenishment needed. PL02 fully stocked. IBP confirms zero supply risk through May.',
      ibpLead: 'IBP Lead Time: 12 days from PL02',
      scores: { 'Service Level': 92, 'Margin Impact': 58, 'Customer Value': 78, 'Lead Time': 90, 'Inventory Health': 88, 'AR / Credit Risk': 91 },
    },
    soHeader: [
      { lbl: 'Order Type', val: 'ZOR', sap: 'VBAK-AUART' }, { lbl: 'Sales Org', val: '1000', sap: 'VBAK-VKORG' },
      { lbl: 'Dist. Channel', val: '10', sap: 'VBAK-VTWEG' }, { lbl: 'Division', val: '00', sap: 'VBAK-SPART' },
      { lbl: 'Sold-To', val: '20031', sap: 'KNVP AG' }, { lbl: 'Ship-To', val: '20031-01', sap: 'KNVP WE' },
      { lbl: 'Customer PO', val: 'PO-2024-8822', sap: 'VBKD-BSTKD' }, { lbl: 'Req. Date', val: '2024-04-20', sap: 'VBKD-BSTDK' },
    ],
    soItems: [
      { line: 10, mat: 'ELEC-7890', qty: 100, plant: 'PL02', date: '2024-04-09', price: 446.00 },
      { line: 20, mat: 'CTRL-4421', qty: 50, plant: 'PL02', date: '2024-04-11', price: 882.00 },
    ],
  },
  {
    id: 'ORD-003', poNumber: 'PO-2024-8823', customer: 'Bosch Manufacturing', soldTo: 'CUST-30112',
    amount: 203400, channel: 'Portal', channelIcon: '🌐', status: 'ready', priority: 'strategic', received: '07:58 AM', lines: 3,
    hdr: [
      { lbl: 'Sold-To Customer', val: 'Robert Bosch GmbH', conf: 99, sap: 'VBAK-KUNNR' },
      { lbl: 'Customer PO Number', val: 'PO-2024-8823', conf: 99, sap: 'VBKD-BSTKD' },
      { lbl: 'PO Date', val: 'March 9, 2024', conf: 99, sap: 'VBKD-BSTDK' },
      { lbl: 'Ship-To Address', val: 'Auburn Hills, MI 48326', conf: 99, sap: 'VBPA-WE' },
      { lbl: 'Incoterms', val: 'FCA Detroit', conf: 97, sap: 'VBKD-INCO1' },
      { lbl: 'Delivery Instructions', val: 'JIT delivery. Split 3 lots of 400 EA.', conf: 92, sap: 'VBKD-BSTK2' },
    ],
    items: [
      { line: 10, custSku: 'BOS-COMP-3312', sapMat: 'COMP-3312', qty: '400', uom: 'EA', price: '169.50', cur: 'USD', reqDate: 'April 10, 2024', confMat: 96, confQty: 99, confPrice: 99, confDate: 99, lineGM: '34.2%', confirmDate: 'April 7, 2024',
        plantOptions: [
          { code: 'PL03', name: 'Detroit, MI', dist: '22 mi', atp: 1400, freightCost: 280, freightPerUnit: 0.70, arrivalDate: 'Apr 7', onTime: true, lateDays: 0, score: 98, selected: true },
          { code: 'PL01', name: 'Chicago, IL', dist: '282 mi', atp: 0, freightCost: 960, freightPerUnit: 2.40, arrivalDate: 'Apr 16', onTime: false, lateDays: 6, score: 9 },
        ],
        insight: 'PL03 selected: JIT proximity (22 mi). 1,400 units available. $840 total freight on $203K order = 0.41%.',
      },
      { line: 20, custSku: 'BOS-COMP-3312', sapMat: 'COMP-3312', qty: '400', uom: 'EA', price: '169.50', cur: 'USD', reqDate: 'April 20, 2024', confMat: 96, confQty: 99, confPrice: 99, confDate: 99, lineGM: '34.2%', confirmDate: 'April 17, 2024',
        plantOptions: [{ code: 'PL03', name: 'Detroit, MI', dist: '22 mi', atp: 1400, freightCost: 280, freightPerUnit: 0.70, arrivalDate: 'Apr 17', onTime: true, lateDays: 0, score: 98, selected: true }],
        insight: 'JIT Lot 2. Same PL03 allocation. Delivery cadence on schedule.',
      },
      { line: 30, custSku: 'BOS-COMP-3312', sapMat: 'COMP-3312', qty: '400', uom: 'EA', price: '169.50', cur: 'USD', reqDate: 'April 30, 2024', confMat: 96, confQty: 99, confPrice: 99, confDate: 99, lineGM: '34.2%', confirmDate: 'April 27, 2024',
        plantOptions: [{ code: 'PL03', name: 'Detroit, MI', dist: '22 mi', atp: 1400, freightCost: 280, freightPerUnit: 0.70, arrivalDate: 'Apr 27', onTime: true, lateDays: 0, score: 98, selected: true }],
        insight: 'JIT Lot 3. Full coverage. Q2 allocation locked in IBP.',
      },
    ],
    validations: [
      { lbl: 'Customer Master', st: 'ok', msg: 'CUST-30112 — Strategic Account (Tier 1). MSA active.', src: 'KNA1/KNVV' },
      { lbl: 'Material Mapping', st: 'ok', msg: 'COMP-3312 active. JIT-enabled.', src: 'MARA/MVKE' },
      { lbl: 'Pricing Record', st: 'ok', msg: 'Contract ZK200100 — $168.80/EA (delta $0.70, within tolerance).', src: 'PRCD_ELEMENTS' },
      { lbl: 'Credit / FSCM', st: 'ok', msg: '$5M limit. $620K exposure. Clear.', src: 'UKM_* / FSCM' },
      { lbl: 'Inventory / ATP', st: 'ok', msg: '1,400 unrestricted. Full coverage all 3 lots.', src: 'MARD/MATDOC' },
      { lbl: 'Contracts / Agreements', st: 'ok', msg: 'MSA active. Auto-accept flag configured.', src: 'VBAK/VBKD' },
      { lbl: 'Open AR / Payment Risk', st: 'ok', msg: 'Excellent. DSO: 18 days. No overdue.', src: 'BSID/ACDOCA' },
      { lbl: 'Order Blocking Reasons', st: 'ok', msg: 'No blocks.', src: 'VBUK' },
    ],
    decision: {
      score: 96, rec: 'Auto-Create Sales Order', autoOk: true,
      plant: 'PL03 — Detroit, MI', plantReason: 'JIT proximity + Tier 1 allocation priority',
      confirmedQty: '1,200 EA (3 x 400)', confirmedDate: 'Apr 7 / Apr 17 / Apr 27',
      mode: 'JIT Split Shipment', gm: '34.2%', marginVsAlt: '+$8,640 vs non-strategic routing',
      ibpSignal: 'PL03 capacity committed for Bosch JIT cadence. IBP locks Q2 allocation. Zero supply risk.',
      ibpLead: 'IBP Lead Time: 8 days from PL03',
      scores: { 'Service Level': 98, 'Margin Impact': 94, 'Customer Value': 99, 'Lead Time': 96, 'Inventory Health': 97, 'AR / Credit Risk': 99 },
    },
    soHeader: [
      { lbl: 'Order Type', val: 'ZOR', sap: 'VBAK-AUART' }, { lbl: 'Sales Org', val: '1000', sap: 'VBAK-VKORG' },
      { lbl: 'Dist. Channel', val: '10', sap: 'VBAK-VTWEG' }, { lbl: 'Division', val: '00', sap: 'VBAK-SPART' },
      { lbl: 'Sold-To', val: '30112', sap: 'KNVP AG' }, { lbl: 'Ship-To', val: '30112-01', sap: 'KNVP WE' },
      { lbl: 'Customer PO', val: 'PO-2024-8823', sap: 'VBKD-BSTKD' }, { lbl: 'Req. Date', val: 'JIT — 3 Lines', sap: 'VBKD-BSTDK' },
    ],
    soItems: [
      { line: 10, mat: 'COMP-3312', qty: 400, plant: 'PL03', date: '2024-04-07', price: 168.80 },
      { line: 20, mat: 'COMP-3312', qty: 400, plant: 'PL03', date: '2024-04-17', price: 168.80 },
      { line: 30, mat: 'COMP-3312', qty: 400, plant: 'PL03', date: '2024-04-27', price: 168.80 },
    ],
  },
  {
    id: 'ORD-004', poNumber: 'PO-2024-8824', customer: 'Parker Hannifin Corp.', soldTo: 'CUST-40088',
    amount: 67800, channel: 'PDF', channelIcon: '📄', status: 'exception', priority: 'medium', received: '11:20 AM', lines: 3,
    hdr: [
      { lbl: 'Sold-To Customer', val: 'Parker Hannifin Corp.', conf: 97, sap: 'VBAK-KUNNR' },
      { lbl: 'Customer PO Number', val: 'PO-2024-8824', conf: 94, sap: 'VBKD-BSTKD' },
      { lbl: 'PO Date', val: 'March 7, 2024', conf: 88, sap: 'VBKD-BSTDK' },
      { lbl: 'Ship-To Address', val: 'Cleveland OH — street not detected', conf: 58, sap: 'VBPA-WE' },
      { lbl: 'Incoterms', val: 'Not detected', conf: 0, sap: 'VBKD-INCO1' },
      { lbl: 'Delivery Instructions', val: 'Urgent. Expedite required.', conf: 87, sap: 'VBKD-BSTK2' },
    ],
    items: [
      { line: 10, custSku: 'PHC-HOSE-??-2201', sapMat: 'Ambiguous — 3 candidates in MARA', qty: '350', uom: 'EA', price: 'Not stated', cur: 'USD', reqDate: 'March 28, 2024', confMat: 44, confQty: 91, confPrice: 0, confDate: 82, lineGM: 'Unknown', confirmDate: 'Cannot confirm',
        plantOptions: null,
        insight: '3 candidates: HOSE-2201A, HOSE-2201B, HOSE-2201C. CSR must resolve before ATP check.',
      },
      { line: 20, custSku: 'PHC-VALVE-??-3390', sapMat: 'Ambiguous — 2 candidates in MARA', qty: '120', uom: 'EA', price: 'Not stated', cur: 'USD', reqDate: 'March 28, 2024', confMat: 38, confQty: 88, confPrice: 0, confDate: 76, lineGM: 'Unknown', confirmDate: 'Cannot confirm',
        plantOptions: null,
        insight: '2 candidates: VALVE-3390A, VALVE-3390B. No pricing record for either.',
      },
      { line: 30, custSku: 'PHC-FITT-1102', sapMat: 'FITT-1102 (72% confidence)', qty: '80', uom: 'EA', price: '$42.50', cur: 'USD', reqDate: 'March 28, 2024', confMat: 72, confQty: 91, confPrice: 0, confDate: 85, lineGM: 'Unknown', confirmDate: 'Cannot confirm',
        plantOptions: null,
        insight: 'Below threshold. Date already passed. Requires full manual review.',
      },
    ],
    validations: [
      { lbl: 'Customer Master', st: 'ok', msg: 'CUST-40088 active.', src: 'KNA1/KNVV' },
      { lbl: 'Material Mapping', st: 'err', msg: 'Lines 10 & 20: ambiguous SKUs. Line 30: low-confidence match.', src: 'MARA/MVKE' },
      { lbl: 'Pricing Record', st: 'err', msg: 'No pricing — all 3 materials unresolved.', src: 'PRCD_ELEMENTS' },
      { lbl: 'Credit / FSCM', st: 'warn', msg: '$500K limit. $490K exposure. Near credit limit.', src: 'UKM_* / FSCM' },
      { lbl: 'Inventory / ATP', st: 'warn', msg: 'Cannot run ATP — materials unresolved.', src: 'MARD/MATDOC' },
      { lbl: 'Contracts / Agreements', st: 'warn', msg: 'No active contract for HOSE or VALVE family.', src: 'VBAK/VBKD' },
      { lbl: 'Open AR / Payment Risk', st: 'warn', msg: '$14K overdue >60 days. Monitor closely.', src: 'BSID/ACDOCA' },
      { lbl: 'Order Blocking Reasons', st: 'err', msg: 'Credit near-limit block will trigger on SO creation.', src: 'VBUK' },
    ],
    decision: {
      score: 29, rec: 'Exception — Human Review Required', autoOk: false,
      plant: 'Undetermined', plantReason: 'Cannot determine until materials resolved',
      confirmedQty: 'Pending', confirmedDate: 'Pending (requested date already past)',
      mode: 'Unknown', gm: 'Unknown', marginVsAlt: 'N/A',
      ibpSignal: 'IBP check blocked — 3 materials unresolved. Expedite cost will be significant.',
      ibpLead: 'IBP Lead: Cannot calculate',
      scores: { 'Service Level': 20, 'Margin Impact': 12, 'Customer Value': 55, 'Lead Time': 15, 'Inventory Health': 28, 'AR / Credit Risk': 38 },
    },
    soHeader: [], soItems: [],
  },
  {
    id: 'ORD-005', poNumber: 'PO-2024-8825', customer: 'GE Aviation Systems', soldTo: 'CUST-50201',
    amount: 415025, channel: 'Email', channelIcon: '✉', status: 'reviewing', priority: 'strategic', received: '06:30 AM', lines: 3,
    hdr: [
      { lbl: 'Sold-To Customer', val: 'GE Aviation Systems LLC', conf: 99, sap: 'VBAK-KUNNR' },
      { lbl: 'Customer PO Number', val: 'PO-2024-8825', conf: 99, sap: 'VBKD-BSTKD' },
      { lbl: 'PO Date', val: 'March 9, 2024', conf: 99, sap: 'VBKD-BSTDK' },
      { lbl: 'Ship-To Address', val: '1 Neumann Way, Cincinnati OH 45215', conf: 99, sap: 'VBPA-WE' },
      { lbl: 'Incoterms', val: 'DAP Cincinnati', conf: 96, sap: 'VBKD-INCO1' },
      { lbl: 'Delivery Instructions', val: 'AS9100 certs required. No split shipment.', conf: 94, sap: 'VBKD-BSTK2' },
    ],
    items: [
      { line: 10, custSku: 'GEA-SEAL-5567', sapMat: 'SEAL-5567', qty: '500', uom: 'EA', price: '518.75', cur: 'USD', reqDate: 'April 25, 2024', confMat: 95, confQty: 99, confPrice: 99, confDate: 99, lineGM: '29.6%', confirmDate: 'April 22, 2024',
        plantOptions: [
          { code: 'PL01', name: 'Chicago, IL', dist: '302 mi', atp: 620, freightCost: 3200, freightPerUnit: 6.40, arrivalDate: 'Apr 22', onTime: true, lateDays: 0, score: 92, selected: true },
          { code: 'PL02', name: 'Atlanta, GA', dist: '460 mi', atp: 800, freightCost: 2800, freightPerUnit: 5.60, arrivalDate: 'Apr 9', onTime: true, lateDays: 0, score: 0, disq: 'Not AS9100 Rev D certified for SEAL-5567' },
        ],
        insight: 'Quality constraint decisive: PL02 disqualified — not AS9100 Rev D certified. PL01 is only eligible plant.',
      },
      { line: 20, custSku: 'GEA-BEAR-3310', sapMat: 'BEAR-3310', qty: '200', uom: 'EA', price: '287.50', cur: 'USD', reqDate: 'April 25, 2024', confMat: 93, confQty: 99, confPrice: 97, confDate: 99, lineGM: '27.3%', confirmDate: 'April 20, 2024',
        plantOptions: [
          { code: 'PL01', name: 'Chicago, IL', dist: '302 mi', atp: 280, freightCost: 1200, freightPerUnit: 6.00, arrivalDate: 'Apr 20', onTime: true, lateDays: 0, score: 88, selected: true },
          { code: 'PL02', name: 'Atlanta, GA', dist: '460 mi', atp: 300, freightCost: 900, freightPerUnit: 4.50, arrivalDate: 'Apr 12', onTime: true, lateDays: 0, score: 0, disq: 'Not AS9100 Rev D certified for BEAR-3310' },
        ],
        insight: 'PL02 disqualified (AS9100). PL01 only eligible. Full ATP 280 units.',
      },
      { line: 30, custSku: 'GEA-GASK-771', sapMat: 'GASK-771', qty: '1200', uom: 'EA', price: '38.50', cur: 'USD', reqDate: 'April 30, 2024', confMat: 89, confQty: 96, confPrice: 91, confDate: 99, lineGM: '31.8%', confirmDate: 'April 26, 2024',
        plantOptions: [
          { code: 'PL01', name: 'Chicago, IL', dist: '302 mi', atp: 1500, freightCost: 800, freightPerUnit: 0.67, arrivalDate: 'Apr 26', onTime: true, lateDays: 0, score: 94, selected: true },
        ],
        insight: '1,500 EA available at PL01. Full coverage with 300 units spare. Consolidated freight with Lines 10 & 20.',
      },
    ],
    validations: [
      { lbl: 'Customer Master', st: 'ok', msg: 'CUST-50201 — Strategic. AS9100 flag active in KNA1.', src: 'KNA1/KNVV' },
      { lbl: 'Material Mapping', st: 'ok', msg: 'SEAL-5567, BEAR-3310, GASK-771 all validated. AS9100 certified.', src: 'MARA/MVKE' },
      { lbl: 'Pricing Record', st: 'ok', msg: 'Aerospace LTA ZK300200 active. All 3 lines within tolerance.', src: 'PRCD_ELEMENTS' },
      { lbl: 'Credit / FSCM', st: 'ok', msg: '$5M limit. $1.1M exposure. Clear.', src: 'UKM_* / FSCM' },
      { lbl: 'Inventory / ATP', st: 'warn', msg: 'SEAL-5567: short 180 units — IBP expedite active. BEAR-3310 and GASK-771 fully covered.', src: 'MARD/MATDOC' },
      { lbl: 'Contracts / Agreements', st: 'ok', msg: 'LTA active through Dec 2025.', src: 'VBAK/VBKD' },
      { lbl: 'Open AR / Payment Risk', st: 'ok', msg: 'Excellent. Net 45. No overdue. DSO 22 days.', src: 'BSID/ACDOCA' },
      { lbl: 'Order Blocking Reasons', st: 'ok', msg: 'No blocks. AS9100 cert auto-attached.', src: 'VBUK' },
    ],
    decision: {
      score: 79, rec: 'Review & Approve — Short 180 Units on SEAL-5567', autoOk: false,
      plant: 'PL01 — Chicago, IL', plantReason: 'Only AS9100-certified plant for all 3 lines.',
      confirmedQty: '500 + 200 + 1,200 EA (3 lines)', confirmedDate: 'Apr 22 / Apr 20 / Apr 26',
      mode: 'Partial + Expedited on Line 10', gm: '29.7% blended', marginVsAlt: 'No alternate — AS9100 locked to PL01',
      ibpSignal: 'IBP expedite: SEAL-5567 short 180 units. Supplier confirms by Apr 19. Expedite surcharge ~$8,500.',
      ibpLead: 'IBP Expedited Lead: 14 days (normal: 22 days)',
      scores: { 'Service Level': 82, 'Margin Impact': 71, 'Customer Value': 96, 'Lead Time': 88, 'Inventory Health': 74, 'AR / Credit Risk': 99 },
    },
    soHeader: [
      { lbl: 'Order Type', val: 'ZOR', sap: 'VBAK-AUART' }, { lbl: 'Sales Org', val: '1000', sap: 'VBAK-VKORG' },
      { lbl: 'Dist. Channel', val: '10', sap: 'VBAK-VTWEG' }, { lbl: 'Division', val: '00', sap: 'VBAK-SPART' },
      { lbl: 'Sold-To', val: '50201', sap: 'KNVP AG' }, { lbl: 'Ship-To', val: '50201-01', sap: 'KNVP WE' },
      { lbl: 'Customer PO', val: 'PO-2024-8825', sap: 'VBKD-BSTKD' }, { lbl: 'Req. Date', val: 'Multi-line', sap: 'VBKD-BSTDK' },
    ],
    soItems: [
      { line: 10, mat: 'SEAL-5567', qty: 500, plant: 'PL01', date: '2024-04-22', price: 518.75 },
      { line: 20, mat: 'BEAR-3310', qty: 200, plant: 'PL01', date: '2024-04-20', price: 287.50 },
      { line: 30, mat: 'GASK-771', qty: 1200, plant: 'PL01', date: '2024-04-26', price: 38.50 },
    ],
  },
];

// ─── Confidence Ring SVG ───
const ConfRing = ({ value, size = 28 }) => {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  const color = confColor(value);
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={alpha(color, 0.15)} strokeWidth={2.5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={2.5}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      <text x={size/2} y={size/2 + 3.5} textAnchor="middle" fontSize={8} fontWeight={700} fill={color}>{value}</text>
    </svg>
  );
};

// ─── Score Ring SVG (larger, for AI decision) ───
const ScoreRing = ({ value, size = 90 }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  const color = value >= 80 ? GREEN : value >= 60 ? AMBER : RED;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: 'stroke-dashoffset 1s ease' }} />
      <text x={size/2} y={size/2 + 10} textAnchor="middle" fontSize={26} fontWeight={800} fill="white">{value}</text>
      <text x={size/2} y={size/2 - 12} textAnchor="middle" fontSize={8} fontWeight={600} fill="rgba(255,255,255,0.6)" letterSpacing="1">SCORE</text>
    </svg>
  );
};

// ─── Validation Icon ───
const ValIcon = ({ st }) => {
  if (st === 'ok') return <CheckCircleIcon sx={{ fontSize: 18, color: GREEN }} />;
  if (st === 'warn') return <WarningIcon sx={{ fontSize: 18, color: AMBER }} />;
  return <ErrorIcon sx={{ fontSize: 18, color: RED }} />;
};

// ═════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════
const LoparexWorkbench = ({ onBack, darkMode = false }) => {
  const [selectedOrder, setSelectedOrder] = useState(ORDERS[0]);
  const [activeTab, setActiveTab] = useState(0);
  const [filterMode, setFilterMode] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState({});
  const [overrideCount, setOverrideCount] = useState(0);
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'info' });
  const [soCreating, setSoCreating] = useState(false);
  const [soCreated, setSoCreated] = useState(false);

  const showToast = useCallback((msg, severity = 'info') => {
    setToast({ open: true, msg, severity });
  }, []);

  // Filter orders
  const filteredOrders = ORDERS.filter(o => {
    if (filterMode !== 'all') {
      if (filterMode === 'new' && o.status !== 'new') return false;
      if (filterMode === 'ready' && o.status !== 'ready') return false;
      if (filterMode === 'exception' && o.status !== 'exception') return false;
    }
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return o.customer.toLowerCase().includes(s) || o.poNumber.toLowerCase().includes(s);
    }
    return true;
  });

  const selectOrder = (order) => {
    setSelectedOrder(order);
    setActiveTab(0);
    setExpandedItems({});
    setOverrideCount(0);
    setSoCreating(false);
    setSoCreated(false);
  };

  const toggleItem = (key) => {
    setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCreateSO = () => {
    setSoCreating(true);
    setTimeout(() => {
      setSoCreating(false);
      setSoCreated(true);
      showToast(`Sales Order 450${Math.floor(1000000 + Math.random() * 9000000)} created in SAP S/4HANA`, 'success');
      setTimeout(() => setSoCreated(false), 3500);
    }, 2200);
  };

  const o = selectedOrder;
  const valCounts = o ? { ok: o.validations.filter(v => v.st === 'ok').length, warn: o.validations.filter(v => v.st === 'warn').length, err: o.validations.filter(v => v.st === 'err').length } : {};

  // ─── Shared styles ───
  const sectionTitle = { fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: MUTED, mb: 1.5, pb: 1, borderBottom: `1px solid ${BORDER}` };
  const fieldCard = (conf) => ({
    p: 1.2, borderRadius: 1, border: `1.5px solid ${conf < 70 && conf > 0 ? alpha(RED, 0.5) : conf === 0 ? alpha(RED, 0.5) : BORDER}`,
    bgcolor: conf < 70 && conf > 0 ? alpha(RED, 0.03) : conf === 0 ? alpha('#94a3b8', 0.03) : 'white',
    transition: 'all 0.2s', cursor: 'default',
    '&:hover': { borderColor: alpha(NAVY, 0.3), boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* ─── Breadcrumb Bar ─── */}
      <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${BORDER}`, bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ fontSize: '0.75rem' }}>
          <Link component="button" onClick={onBack} sx={{ fontSize: '0.75rem', textDecoration: 'none', color: 'text.secondary' }}>ORDLY.AI</Link>
          <Link component="button" onClick={onBack} sx={{ fontSize: '0.75rem', textDecoration: 'none', color: 'text.secondary' }}>Loparex</Link>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: NAVY }}>Workbench</Typography>
        </Breadcrumbs>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} size="small" variant="outlined" sx={{ textTransform: 'none', fontSize: '0.7rem' }}>Back</Button>
      </Box>

      {/* ─── 3-Panel Layout ─── */}
      <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: '272px 1fr 312px', overflow: 'hidden' }}>

        {/* ════════ LEFT: Order Queue ════════ */}
        <Box sx={{ borderRight: `1px solid ${BORDER}`, bgcolor: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ p: 1.5, borderBottom: `1px solid ${BORDER}` }}>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED, mb: 1 }}>Incoming Orders</Typography>
            <TextField size="small" fullWidth placeholder="Search orders..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: MUTED }} /></InputAdornment> }}
              sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.75rem', height: 32, bgcolor: '#f8fafc' } }}
            />
            <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap' }}>
              {['all', 'new', 'ready', 'exception'].map(f => (
                <Chip key={f} label={f.toUpperCase()} size="small" onClick={() => setFilterMode(f)}
                  sx={{ fontSize: '0.6rem', fontWeight: 600, height: 22, cursor: 'pointer',
                    bgcolor: filterMode === f ? NAVY : 'transparent', color: filterMode === f ? 'white' : MUTED,
                    border: filterMode === f ? 'none' : `1px solid ${BORDER}`,
                  }}
                />
              ))}
            </Stack>
          </Box>

          {/* Queue list */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
            {filteredOrders.map(order => (
              <Box key={order.id} onClick={() => selectOrder(order)}
                sx={{
                  p: 1.2, pl: 2.5, borderRadius: 1, mb: 0.5, cursor: 'pointer', position: 'relative',
                  border: `1.5px solid ${selectedOrder?.id === order.id ? alpha(NAVY, 0.5) : 'transparent'}`,
                  bgcolor: selectedOrder?.id === order.id ? alpha(NAVY, 0.05) : 'transparent',
                  '&:hover': { bgcolor: alpha(NAVY, 0.03) },
                  transition: 'all 0.15s',
                }}
              >
                <DotIcon sx={{ fontSize: 8, position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: priorityColor[order.priority] }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.3 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: selectedOrder?.id === order.id ? NAVY : 'text.primary', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.customer}</Typography>
                  <Chip label={order.status} size="small" sx={{ fontSize: '0.55rem', fontWeight: 700, height: 18, textTransform: 'uppercase', bgcolor: statusBg[order.status], color: statusColor[order.status] }} />
                </Box>
                <Typography sx={{ fontSize: '0.65rem', color: MUTED, mb: 0.5 }}>{order.poNumber} · {order.lines} lines</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: 'text.secondary' }}>{fmt(order.amount)}</Typography>
                  <Typography sx={{ fontSize: '0.6rem', color: MUTED }}>{order.channelIcon} {order.channel}</Typography>
                </Box>
              </Box>
            ))}
          </Box>

          <Box sx={{ p: 1.2, borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: MUTED }}>
            <span>{filteredOrders.length} orders</span><span>2 min ago</span>
          </Box>
        </Box>

        {/* ════════ CENTER: Tabs Content ════════ */}
        <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#f8fafc' }}>
          {/* Order bar */}
          {o && (
            <Box sx={{ bgcolor: 'white', borderBottom: `1px solid ${BORDER}`, px: 2, py: 1.2, display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>{o.customer}</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: MUTED }}>{o.soldTo} · {o.lines} lines · {o.received}</Typography>
              </Box>
              <Chip label={o.poNumber} size="small" sx={{ fontSize: '0.65rem', fontWeight: 600, bgcolor: '#f1f5f9', border: `1px solid ${BORDER}` }} />
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: NAVY }}>{fmt(o.amount)}</Typography>
              <Chip label={o.status} size="small" sx={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', bgcolor: statusBg[o.status], color: statusColor[o.status] }} />
              {overrideCount > 0 && (
                <Chip icon={<EditIcon sx={{ fontSize: 12 }} />} label={`${overrideCount} overrides`} size="small"
                  sx={{ fontSize: '0.6rem', fontWeight: 700, bgcolor: alpha(AMBER, 0.12), color: AMBER, border: `1px solid ${alpha(AMBER, 0.3)}` }} />
              )}
            </Box>
          )}

          {/* Tabs */}
          {o && (
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}
              sx={{ bgcolor: 'white', borderBottom: `1px solid ${BORDER}`, minHeight: 38, px: 2,
                '& .MuiTab-root': { minHeight: 38, fontSize: '0.75rem', fontWeight: 500, textTransform: 'none', py: 0 },
                '& .Mui-selected': { fontWeight: 700, color: NAVY },
                '& .MuiTabs-indicator': { bgcolor: NAVY },
              }}
            >
              <Tab label={<Stack direction="row" spacing={0.5} alignItems="center"><span>PO Extraction</span><Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: alpha(GREEN, 0.12), color: GREEN, fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</Box></Stack>} />
              <Tab label={<Stack direction="row" spacing={0.5} alignItems="center"><span>SAP Validation</span><Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: valCounts.err > 0 ? alpha(RED, 0.12) : valCounts.warn > 0 ? alpha(AMBER, 0.12) : alpha(GREEN, 0.12), color: valCounts.err > 0 ? RED : valCounts.warn > 0 ? AMBER : GREEN, fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{valCounts.err > 0 ? '!' : valCounts.warn > 0 ? '?' : '✓'}</Box></Stack>} />
              <Tab label={<Stack direction="row" spacing={0.5} alignItems="center"><span>AI Decision</span><Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: alpha(NAVY, 0.12), color: NAVY, fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</Box></Stack>} />
            </Tabs>
          )}

          {/* Tab content */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            {!o ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: MUTED }}>
                <Typography sx={{ fontSize: '2rem', mb: 1, opacity: 0.3 }}>📋</Typography>
                <Typography sx={{ fontWeight: 600 }}>No order selected</Typography>
                <Typography sx={{ fontSize: '0.75rem' }}>Choose an incoming purchase order from the queue</Typography>
              </Box>
            ) : activeTab === 0 ? (
              /* ═══ TAB 0: PO Extraction ═══ */
              <Box>
                {o.hdr.some(h => h.conf < 70) && (
                  <Alert severity="warning" sx={{ mb: 2, fontSize: '0.7rem', py: 0.5 }}>
                    {o.hdr.filter(h => h.conf < 70).length} header field(s) below confidence threshold — review required
                  </Alert>
                )}
                <Typography sx={sectionTitle}>Header Fields (OCR)</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                  {o.hdr.map((f, i) => (
                    <Box key={i} sx={fieldCard(f.conf)}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: MUTED }}>{f.lbl}</Typography>
                        <Chip label={f.conf > 0 ? `OCR ${f.conf}%` : 'Not detected'} size="small"
                          sx={{ fontSize: '0.55rem', fontWeight: 600, height: 18, bgcolor: confBg(f.conf), color: confColor(f.conf) }} />
                      </Box>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: f.conf < 70 && f.conf > 0 ? RED : f.conf === 0 ? MUTED : 'text.primary', mb: 0.5 }}>{f.val}</Typography>
                      <LinearProgress variant="determinate" value={f.conf} sx={{ height: 3, borderRadius: 2, mb: 0.5,
                        bgcolor: alpha(confColor(f.conf), 0.1), '& .MuiLinearProgress-bar': { bgcolor: confColor(f.conf), borderRadius: 2 } }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.5rem', color: MUTED, bgcolor: '#f8fafc', border: `1px solid ${BORDER}`, px: 0.5, borderRadius: 0.5 }}>{f.sap}</Typography>
                        {f.conf < 70 && f.conf > 0 && (
                          <Chip label="Accept" size="small" onClick={() => showToast(`Field accepted: ${f.lbl}`, 'success')}
                            sx={{ fontSize: '0.55rem', fontWeight: 700, height: 18, cursor: 'pointer', bgcolor: alpha(GREEN, 0.08), color: GREEN, border: `1px solid ${alpha(GREEN, 0.3)}`,
                              '&:hover': { bgcolor: GREEN, color: 'white' } }} />
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Typography sx={sectionTitle}>Line Items</Typography>
                {o.items.map((item, idx) => {
                  const key = `${o.id}-${idx}`;
                  const expanded = expandedItems[key];
                  const avgConf = Math.round([item.confMat, item.confQty, item.confPrice, item.confDate].filter(v => v > 0).reduce((a, b) => a + b, 0) / [item.confMat, item.confQty, item.confPrice, item.confDate].filter(v => v > 0).length || 1);
                  const hasLow = [item.confMat, item.confQty, item.confPrice, item.confDate].some(c => c < 70);
                  return (
                    <Paper key={key} variant="outlined" sx={{ mb: 1, borderRadius: 1, overflow: 'hidden', border: `1px solid ${hasLow ? alpha(AMBER, 0.3) : BORDER}` }}>
                      <Box onClick={() => toggleItem(key)} sx={{ px: 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', '&:hover': { bgcolor: alpha(NAVY, 0.02) } }}>
                        <Chip label={`Line ${item.line}`} size="small" sx={{ fontSize: '0.6rem', fontWeight: 700, height: 20, bgcolor: alpha(NAVY, 0.1), color: NAVY }} />
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.primary' }}>{item.custSku}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: MUTED }}>→ {item.sapMat}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: MUTED, ml: 'auto' }}>{item.qty} {item.uom}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>${item.price}/{item.uom}</Typography>
                        <ConfRing value={avgConf} />
                        {hasLow && <WarningIcon sx={{ fontSize: 14, color: AMBER }} />}
                        {expanded ? <ExpandLessIcon sx={{ fontSize: 16, color: MUTED }} /> : <ExpandMoreIcon sx={{ fontSize: 16, color: MUTED }} />}
                      </Box>
                      <Collapse in={expanded}>
                        <Box sx={{ px: 1.5, py: 1.5, bgcolor: '#fafbfc', borderTop: `1px solid ${BORDER}` }}>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5 }}>
                            {[
                              { lbl: 'SAP Material', val: item.sapMat, conf: item.confMat, sap: 'VBAP-MATNR' },
                              { lbl: 'Qty / UOM', val: `${item.qty} ${item.uom}`, conf: item.confQty, sap: 'VBAP-KWMENG' },
                              { lbl: 'Unit Price', val: `$${item.price}`, conf: item.confPrice, sap: 'PRCD_ELEMENTS' },
                              { lbl: 'Req. Delivery Date', val: item.reqDate, conf: item.confDate, sap: 'VBEP-EDATU' },
                            ].map((f, fi) => (
                              <Box key={fi} sx={fieldCard(f.conf)}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                                  <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', color: MUTED }}>{f.lbl}</Typography>
                                  <Chip label={f.conf > 0 ? `${f.conf}%` : 'N/A'} size="small"
                                    sx={{ fontSize: '0.5rem', fontWeight: 600, height: 16, bgcolor: confBg(f.conf), color: confColor(f.conf) }} />
                                </Box>
                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: f.conf < 70 && f.conf > 0 ? RED : f.conf === 0 ? MUTED : 'text.primary' }}>{f.val}</Typography>
                                <LinearProgress variant="determinate" value={f.conf} sx={{ height: 2, borderRadius: 1, mt: 0.5,
                                  bgcolor: alpha(confColor(f.conf), 0.1), '& .MuiLinearProgress-bar': { bgcolor: confColor(f.conf) } }} />
                                <Typography sx={{ fontSize: '0.45rem', color: MUTED, mt: 0.3 }}>{f.sap}</Typography>
                              </Box>
                            ))}
                          </Box>
                          {item.insight && (
                            <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha(NAVY, 0.04), border: `1px solid ${alpha(NAVY, 0.1)}` }}>
                              <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: NAVY, mb: 0.3 }}>Ordly AI Insight</Typography>
                              <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', lineHeight: 1.5 }}>{item.insight}</Typography>
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </Paper>
                  );
                })}
              </Box>
            ) : activeTab === 1 ? (
              /* ═══ TAB 1: SAP Validation ═══ */
              <Box>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  {[
                    { label: 'Passed', count: valCounts.ok, color: GREEN },
                    { label: 'Warnings', count: valCounts.warn, color: AMBER },
                    { label: 'Errors', count: valCounts.err, color: RED },
                  ].map(s => (
                    <Paper key={s.label} variant="outlined" sx={{ flex: 1, p: 1.2, textAlign: 'center', borderColor: alpha(s.color, 0.3), borderRadius: 1 }}>
                      <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: s.color }}>{s.count}</Typography>
                      <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', color: MUTED }}>{s.label}</Typography>
                    </Paper>
                  ))}
                </Stack>

                <Typography sx={sectionTitle}>Validation Checks</Typography>
                {o.validations.map((v, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1.2, borderBottom: `1px solid ${BORDER}` }}>
                    <ValIcon st={v.st} />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{v.lbl}</Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', lineHeight: 1.5 }}>{v.msg}</Typography>
                    </Box>
                    <Chip label={v.src} size="small" sx={{ fontSize: '0.5rem', fontWeight: 600, height: 18, bgcolor: '#f1f5f9', color: MUTED, border: `1px solid ${BORDER}` }} />
                  </Box>
                ))}
              </Box>
            ) : (
              /* ═══ TAB 2: AI Decision ═══ */
              <Box>
                {/* Hero card */}
                <Paper sx={{ p: 2, mb: 2, borderRadius: 2, background: `linear-gradient(135deg, ${NAVY_DARK} 0%, ${NAVY} 50%, ${NAVY_LIGHT} 100%)`, color: 'white' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ScoreRing value={o.decision.score} />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, mb: 0.5 }}>Recommendation</Typography>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700, mb: 0.5 }}>{o.decision.rec}</Typography>
                      <Typography sx={{ fontSize: '0.7rem', opacity: 0.7, mb: 1 }}>{o.decision.plant} · {o.decision.mode}</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {[
                          { lbl: 'Confirmed Qty', val: o.decision.confirmedQty },
                          { lbl: 'Confirm Date', val: o.decision.confirmedDate },
                          { lbl: 'Gross Margin', val: o.decision.gm },
                        ].map(b => (
                          <Chip key={b.lbl} label={`${b.lbl}: ${b.val}`} size="small"
                            sx={{ fontSize: '0.6rem', fontWeight: 600, height: 22, bgcolor: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                </Paper>

                {/* IBP Intelligence */}
                <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: 1, bgcolor: alpha(PURPLE, 0.04), borderColor: alpha(PURPLE, 0.15) }}>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', color: PURPLE, mb: 0.5 }}>IBP Intelligence</Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', lineHeight: 1.5 }}>{o.decision.ibpSignal}</Typography>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: PURPLE, mt: 0.5 }}>{o.decision.ibpLead}</Typography>
                </Paper>

                {/* Score Components */}
                <Typography sx={sectionTitle}>Score Components</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                  {Object.entries(o.decision.scores).map(([label, val]) => (
                    <Box key={label} sx={{ p: 1, borderRadius: 1, border: `1px solid ${BORDER}`, bgcolor: 'white' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary' }}>{label}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: confColor(val) }}>{val}</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={val} sx={{ height: 4, borderRadius: 2,
                        bgcolor: alpha(confColor(val), 0.1), '& .MuiLinearProgress-bar': { bgcolor: confColor(val), borderRadius: 2 } }} />
                    </Box>
                  ))}
                </Box>

                {/* Plant Analysis per line */}
                <Typography sx={sectionTitle}>Fulfillment — Plant Analysis</Typography>
                {o.items.map((item, idx) => (
                  <Box key={idx} sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: NAVY, mb: 1 }}>Line {item.line}: {item.custSku}</Typography>
                    {item.plantOptions ? item.plantOptions.map((p, pi) => (
                      <Box key={pi} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, mb: 0.5, borderRadius: 1,
                        border: `1.5px solid ${p.selected ? alpha(GREEN, 0.4) : p.disq ? alpha(RED, 0.2) : BORDER}`,
                        bgcolor: p.selected ? alpha(GREEN, 0.03) : p.disq ? alpha(RED, 0.02) : 'white',
                        borderStyle: p.disq ? 'dashed' : 'solid',
                      }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700 }}>{p.code} — {p.name}</Typography>
                          <Typography sx={{ fontSize: '0.6rem', color: MUTED }}>{p.dist} · ATP: {p.atp} · Freight: ${p.freightPerUnit}/EA · {p.arrivalDate}</Typography>
                          {p.disq && <Typography sx={{ fontSize: '0.6rem', color: RED, fontWeight: 600, mt: 0.3 }}>{p.disq}</Typography>}
                        </Box>
                        {p.onTime !== undefined && !p.disq && (
                          <Chip label={p.onTime ? 'On Time' : `Late ${p.lateDays}d`} size="small"
                            sx={{ fontSize: '0.55rem', fontWeight: 600, height: 18, bgcolor: p.onTime ? alpha(GREEN, 0.1) : alpha(RED, 0.1), color: p.onTime ? GREEN : RED }} />
                        )}
                        <Chip label={p.disq ? 'DISQ' : p.score} size="small"
                          sx={{ fontSize: '0.6rem', fontWeight: 700, height: 20, minWidth: 32,
                            bgcolor: p.disq ? alpha(RED, 0.1) : alpha(confColor(p.score), 0.12), color: p.disq ? RED : confColor(p.score) }} />
                        {p.selected && <CheckCircleIcon sx={{ fontSize: 16, color: GREEN }} />}
                      </Box>
                    )) : (
                      <Typography sx={{ fontSize: '0.65rem', color: MUTED, fontStyle: 'italic' }}>No plant options — material unresolved</Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* ════════ RIGHT: Sales Order Preview ════════ */}
        <Box sx={{ borderLeft: `1px solid ${BORDER}`, bgcolor: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ p: 1.5, borderBottom: `1px solid ${BORDER}` }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Sales Order Preview</Typography>
            <Typography sx={{ fontSize: '0.6rem', color: MUTED }}>BAPI_SALESORDER_CREATEFROMDAT2</Typography>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
            {!o ? (
              <Typography sx={{ fontSize: '0.7rem', color: MUTED, textAlign: 'center', mt: 4 }}>VA01 preview appears after order selection</Typography>
            ) : o.status === 'exception' ? (
              <Box>
                <Alert severity="error" sx={{ mb: 2, fontSize: '0.7rem' }}>Cannot Create SO — resolve exceptions first</Alert>
                {o.validations.filter(v => v.st !== 'ok').map((v, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                    <ValIcon st={v.st} />
                    <Box>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600 }}>{v.lbl}</Typography>
                      <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>{v.msg}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box>
                <Typography sx={sectionTitle}>VBAK — Order Header</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, mb: 2 }}>
                  {o.soHeader.map((f, i) => (
                    <Box key={i} sx={{ py: 0.5 }}>
                      <Typography sx={{ fontSize: '0.5rem', color: MUTED, textTransform: 'uppercase' }}>{f.lbl}</Typography>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600 }}>{f.val}</Typography>
                      <Typography sx={{ fontSize: '0.45rem', color: MUTED }}>{f.sap}</Typography>
                    </Box>
                  ))}
                </Box>

                <Typography sx={sectionTitle}>VBAP / VBEP — Line Items</Typography>
                {o.soItems.map((item, i) => (
                  <Box key={i} sx={{ pl: 1.5, py: 1, mb: 0.5, bgcolor: alpha(NAVY, 0.02), borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: NAVY }}>Line {item.line}: {item.mat}</Typography>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>{fmt(item.qty * item.price)}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.6rem', color: MUTED }}>{item.plant} · {item.date} · {item.qty} EA · ${item.price}/EA</Typography>
                  </Box>
                ))}

                <Box sx={{ mt: 2, p: 1.2, bgcolor: alpha(NAVY, 0.04), borderRadius: 1, border: `1px solid ${alpha(NAVY, 0.1)}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700 }}>Order Total</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: NAVY }}>{fmt(o.soItems.reduce((s, i) => s + i.qty * i.price, 0))}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.65rem', color: MUTED }}>Gross Margin</Typography>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: GREEN }}>{o.decision.gm}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.65rem', color: MUTED }}>Decision Score</Typography>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: confColor(o.decision.score) }}>{o.decision.score}/100</Typography>
                  </Box>
                </Box>

                <Typography sx={{ fontSize: '0.55rem', color: MUTED, mt: 1.5, lineHeight: 1.4 }}>
                  BAPI: BAPI_SALESORDER_CREATEFROMDAT2 · Doc Type: ZOR · Plant: {o.decision.plant?.split('—')[0]?.trim()} · {o.soItems.length} schedule line(s)
                </Typography>
              </Box>
            )}
          </Box>

          {/* Action buttons */}
          {o && o.status !== 'exception' && (
            <Box sx={{ p: 1.5, borderTop: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Button fullWidth variant="contained" startIcon={<BoltIcon />} onClick={handleCreateSO}
                disabled={soCreating || soCreated}
                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', bgcolor: soCreated ? GREEN : NAVY, py: 1,
                  '&:hover': { bgcolor: soCreated ? GREEN_DARK : NAVY_DARK } }}>
                {soCreating ? 'Creating in SAP S/4HANA...' : soCreated ? 'Created — SO 450XXXXXXX' : 'Create Sales Order in SAP'}
              </Button>
              <Stack direction="row" spacing={0.5}>
                <Button fullWidth variant="outlined" startIcon={<SaveIcon sx={{ fontSize: 14 }} />} size="small"
                  onClick={() => showToast('Draft saved', 'info')}
                  sx={{ textTransform: 'none', fontSize: '0.7rem', borderColor: BORDER, color: 'text.secondary' }}>Save Draft</Button>
                <Button fullWidth size="small" startIcon={<ReportProblemIcon sx={{ fontSize: 14 }} />}
                  onClick={() => showToast('Routed to Exception Queue. CSR team notified.', 'warning')}
                  sx={{ textTransform: 'none', fontSize: '0.7rem', color: RED }}>Route to Exception</Button>
              </Stack>
            </Box>
          )}
          {o && o.status === 'exception' && (
            <Box sx={{ p: 1.5, borderTop: `1px solid ${BORDER}` }}>
              <Button fullWidth variant="outlined" startIcon={<ReportProblemIcon />} size="small"
                onClick={() => showToast('Routed to Exception Queue. CSR team notified.', 'warning')}
                sx={{ textTransform: 'none', fontSize: '0.75rem', borderColor: alpha(RED, 0.3), color: RED }}>Route to Exception Queue</Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast(t => ({ ...t, open: false }))} sx={{ fontSize: '0.75rem' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoparexWorkbench;
