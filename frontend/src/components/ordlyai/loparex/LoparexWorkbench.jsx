import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Chip, Button, TextField, InputAdornment, Tabs, Tab,
  Paper, Stack, Snackbar, Alert, LinearProgress, Breadcrumbs, Link, IconButton, Collapse, Tooltip as MuiTooltip,
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
  PictureAsPdf as PdfIcon, OpenInNew as OpenInNewIcon,
  DocumentScanner as DocumentScannerIcon,
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

// ─── Real PO Data: 5 Loparex Orders ───
const ORDERS = [
  {
    id: 'ORD-001', poNumber: '24581', customer: 'DermaMed Coatings Co. LLC', soldTo: 'CUST-10045',
    amount: 52402.26, channel: 'Email', channelIcon: '✉', status: 'ready', priority: 'high', received: '09:15 AM', lines: 1,
    pdfFile: '/po-docs/PO-24581.pdf',
    hdr: [
      { lbl: 'Sold-To Customer', val: 'DermaMed Coatings Co. LLC', conf: 97, sap: 'VBAK-KUNNR' },
      { lbl: 'Customer PO Number', val: '24581', conf: 99, sap: 'VBKD-BSTKD' },
      { lbl: 'PO Date', val: 'October 31, 2025', conf: 98, sap: 'VBKD-BSTDK' },
      { lbl: 'Ship-To Address', val: '271 Progress Blvd, Kent OH 44240', conf: 95, sap: 'VBPA-WE' },
      { lbl: 'Terms', val: 'NET 30', conf: 99, sap: 'VBKD-INCO1' },
      { lbl: 'Delivery Instructions', val: 'Expected Ship: 1/14/2026. Ship Via: Worldwide Express.', conf: 92, sap: 'VBKD-BSTK2' },
    ],
    items: [
      { line: 10, custSku: '30227-61.000', sapMat: '2004228', qty: '190,623', uom: 'LF', price: '0.27490', cur: 'USD', reqDate: 'January 14, 2026', confMat: 96, confQty: 97, confPrice: 95, confDate: 93, lineGM: '26.8%', confirmDate: 'January 10, 2026',
        plantOptions: [
          { code: 'PL01', name: 'Iowa City, IA', dist: '620 mi', atp: 200000, freightCost: 1450, freightPerUnit: 0.0076, arrivalDate: 'Jan 10', onTime: true, lateDays: 0, score: 91, selected: true },
          { code: 'PL02', name: 'Willowbrook, IL', dist: '380 mi', atp: 180000, freightCost: 980, freightPerUnit: 0.0051, arrivalDate: 'Jan 8', onTime: true, lateDays: 0, score: 84 },
          { code: 'PL03', name: 'Eden, NC', dist: '490 mi', atp: 0, freightCost: 2100, freightPerUnit: 0.011, arrivalDate: 'Jan 22', onTime: false, lateDays: 8, score: 15 },
        ],
        insight: 'PL01 selected: full ATP for 190,623 LF. Grade SCK_BL_90g matched to SAP 2004228. Freight $470 cheaper than PL03.',
      },
    ],
    validations: [
      { lbl: 'Customer Master', st: 'ok', msg: 'CUST-10045 active in KNA1. Credit class: B+.', src: 'KNA1/KNVV' },
      { lbl: 'Material Mapping', st: 'ok', msg: '2004228 — LINER S 3.2 BL SCK 7000/000 R validated and active.', src: 'MARA/MVKE' },
      { lbl: 'Pricing Record', st: 'ok', msg: 'Contract price $0.27490/LF matches PO. Within tolerance.', src: 'PRCD_ELEMENTS' },
      { lbl: 'Credit / FSCM', st: 'ok', msg: 'Limit $500K. Exposure $68K. Clear.', src: 'UKM_* / FSCM' },
      { lbl: 'Inventory / ATP', st: 'ok', msg: '2004228: 200,000 LF unrestricted at PL01. Full coverage.', src: 'MARD/MATDOC' },
      { lbl: 'Contracts / Agreements', st: 'ok', msg: 'Framework active through Mar 2026.', src: 'VBAK/VBKD' },
      { lbl: 'Open AR / Payment Risk', st: 'ok', msg: 'No overdue. DSO: 26 days. Clean.', src: 'BSID/ACDOCA' },
      { lbl: 'Order Blocking Reasons', st: 'ok', msg: 'No blocks active.', src: 'VBUK' },
    ],
    decision: {
      score: 91, rec: 'Auto-Create Sales Order', autoOk: true,
      plant: 'PL01 — Iowa City, IA', plantReason: 'Full ATP + grade match for SCK liner. Nearest qualified plant.',
      confirmedQty: '190,623 LF (1 line)', confirmedDate: 'Jan 10, 2026',
      mode: 'Full Stock Available', gm: '26.8%', marginVsAlt: '+$1,240 vs alternate routing via PL02',
      ibpSignal: 'PL01 fully stocked. No replenishment needed. IBP confirms zero supply risk.',
      ibpLead: 'IBP Lead Time: 14 days from PL01',
      scores: { 'Service Level': 94, 'Margin Impact': 86, 'Customer Value': 82, 'Lead Time': 90, 'Inventory Health': 92, 'AR / Credit Risk': 95 },
    },
    soHeader: [
      { lbl: 'Order Type', val: 'ZOR', sap: 'VBAK-AUART' }, { lbl: 'Sales Org', val: '1000', sap: 'VBAK-VKORG' },
      { lbl: 'Dist. Channel', val: '10', sap: 'VBAK-VTWEG' }, { lbl: 'Division', val: '00', sap: 'VBAK-SPART' },
      { lbl: 'Sold-To', val: '10045', sap: 'KNVP AG' }, { lbl: 'Ship-To', val: '10045-01', sap: 'KNVP WE' },
      { lbl: 'Customer PO', val: '24581', sap: 'VBKD-BSTKD' }, { lbl: 'Req. Date', val: '2026-01-14', sap: 'VBKD-BSTDK' },
    ],
    soItems: [
      { line: 10, mat: '2004228', qty: 190623, plant: 'PL01', date: '2026-01-10', price: 0.2749 },
    ],
  },
  {
    id: 'ORD-002', poNumber: 'OP-22271', customer: 'Mactac (A LINTEC Company)', soldTo: 'CUST-20031',
    amount: 58488.00, channel: 'EDI', channelIcon: '⇌', status: 'new', priority: 'medium', received: '08:42 AM', lines: 1,
    pdfFile: '/po-docs/OP-22271.pdf',
    hdr: [
      { lbl: 'Sold-To Customer', val: 'Mactac (A LINTEC Company)', conf: 99, sap: 'VBAK-KUNNR' },
      { lbl: 'Customer PO Number', val: 'OP-22271', conf: 99, sap: 'VBKD-BSTKD' },
      { lbl: 'PO Date', val: 'October 30, 2025', conf: 99, sap: 'VBKD-BSTDK' },
      { lbl: 'Ship-To Address', val: 'Morgan Adhesives Company LLC, 800 Kasota SE, Minneapolis MN 55414', conf: 97, sap: 'VBPA-WE' },
      { lbl: 'Terms', val: '1%10 NET 30', conf: 98, sap: 'VBKD-INCO1' },
      { lbl: 'Delivery Instructions', val: 'Freight: PREPAID (ALLOW). Branch Plant: 94. Buyer: DEROSIER, ADAM.', conf: 94, sap: 'VBKD-BSTK2' },
    ],
    items: [
      { line: 10, custSku: '0784W55', sapMat: '2004535', qty: '240,000', uom: 'FT', price: '0.2437', cur: 'USD', reqDate: 'November 15, 2025', confMat: 93, confQty: 99, confPrice: 97, confDate: 96, lineGM: '24.1%', confirmDate: 'November 10, 2025',
        plantOptions: [
          { code: 'PL01', name: 'Iowa City, IA', dist: '264 mi', atp: 260000, freightCost: 780, freightPerUnit: 0.0033, arrivalDate: 'Nov 10', onTime: true, lateDays: 0, score: 92, selected: true },
          { code: 'PL02', name: 'Willowbrook, IL', dist: '410 mi', atp: 240000, freightCost: 1100, freightPerUnit: 0.0046, arrivalDate: 'Nov 8', onTime: true, lateDays: 0, score: 82 },
        ],
        insight: 'PL01 selected: full ATP 260K FT, nearest to Minneapolis ship-to. 55" PCK 88# BLEACH 6350 matched to SAP 2004535.',
      },
    ],
    validations: [
      { lbl: 'Customer Master', st: 'ok', msg: 'CUST-20031 active. Mactac/LINTEC key account. Credit class: A.', src: 'KNA1/KNVV' },
      { lbl: 'Material Mapping', st: 'ok', msg: '2004535 — 55" PCK 88# BLEACH 6350 / BLEACH KFT M/HP6350X/000 validated.', src: 'MARA/MVKE' },
      { lbl: 'Pricing Record', st: 'ok', msg: 'EDI price $0.2437/FT matches contract. Within tolerance.', src: 'PRCD_ELEMENTS' },
      { lbl: 'Credit / FSCM', st: 'ok', msg: 'Limit $3M. Exposure $420K. Clear.', src: 'UKM_* / FSCM' },
      { lbl: 'Inventory / ATP', st: 'ok', msg: '2004535: 260,000 FT unrestricted at PL01. Full coverage.', src: 'MARD/MATDOC' },
      { lbl: 'Contracts / Agreements', st: 'ok', msg: 'LINTEC master agreement active. EDI auto-accept configured.', src: 'VBAK/VBKD' },
      { lbl: 'Open AR / Payment Risk', st: 'ok', msg: 'Clean. DSO 24 days. No overdue.', src: 'BSID/ACDOCA' },
      { lbl: 'Order Blocking Reasons', st: 'ok', msg: 'No blocks.', src: 'VBUK' },
    ],
    decision: {
      score: 94, rec: 'Auto-Create Sales Order', autoOk: true,
      plant: 'PL01 — Iowa City, IA', plantReason: 'Nearest plant to Minneapolis ship-to. Full ATP.',
      confirmedQty: '240,000 FT (1 line)', confirmedDate: 'Nov 10, 2025',
      mode: 'Full Stock Available', gm: '24.1%', marginVsAlt: '+$320 vs PL02 routing',
      ibpSignal: 'PL01 fully stocked. EDI auto-matched. IBP confirms zero supply risk through Dec.',
      ibpLead: 'IBP Lead Time: 10 days from PL01',
      scores: { 'Service Level': 96, 'Margin Impact': 80, 'Customer Value': 88, 'Lead Time': 94, 'Inventory Health': 93, 'AR / Credit Risk': 97 },
    },
    soHeader: [
      { lbl: 'Order Type', val: 'ZOR', sap: 'VBAK-AUART' }, { lbl: 'Sales Org', val: '1000', sap: 'VBAK-VKORG' },
      { lbl: 'Dist. Channel', val: '10', sap: 'VBAK-VTWEG' }, { lbl: 'Division', val: '00', sap: 'VBAK-SPART' },
      { lbl: 'Sold-To', val: '20031', sap: 'KNVP AG' }, { lbl: 'Ship-To', val: '20031-01', sap: 'KNVP WE' },
      { lbl: 'Customer PO', val: 'OP-22271', sap: 'VBKD-BSTKD' }, { lbl: 'Req. Date', val: '2025-11-15', sap: 'VBKD-BSTDK' },
    ],
    soItems: [
      { line: 10, mat: '2004535', qty: 240000, plant: 'PL01', date: '2025-11-10', price: 0.2437 },
    ],
  },
  {
    id: 'ORD-003', poNumber: '57503', customer: 'Sun Process Converting, Inc.', soldTo: 'CUST-30112',
    amount: 30487.88, channel: 'PDF', channelIcon: '📄', status: 'validating', priority: 'medium', received: '07:58 AM', lines: 1,
    pdfFile: '/po-docs/PO-57503.pdf',
    hdr: [
      { lbl: 'Sold-To Customer', val: 'Sun Process Converting, Inc.', conf: 96, sap: 'VBAK-KUNNR' },
      { lbl: 'Customer PO Number', val: '57503', conf: 99, sap: 'VBKD-BSTKD' },
      { lbl: 'PO Date', val: 'May 30, 2025', conf: 98, sap: 'VBKD-BSTDK' },
      { lbl: 'Ship-To Address', val: 'Loparex, 2000 Industrial Park, Iowa City IA 52240', conf: 94, sap: 'VBPA-WE' },
      { lbl: 'Terms', val: '1% 10 / NET 30, FOB: Iowa City', conf: 92, sap: 'VBKD-INCO1' },
      { lbl: 'Delivery Instructions', val: 'Buyer: 05 — Jessica Alvarez. Del Date: 08/13/2025.', conf: 88, sap: 'VBKD-BSTK2' },
    ],
    items: [
      { line: 10, custSku: 'RM821143', sapMat: '2002507', qty: '128,262', uom: 'LF', price: '0.23770', cur: 'USD', reqDate: 'August 13, 2025', confMat: 91, confQty: 96, confPrice: 94, confDate: 90, lineGM: '22.5%', confirmDate: 'August 8, 2025',
        plantOptions: [
          { code: 'PL01', name: 'Iowa City, IA', dist: '0 mi (on-site)', atp: 150000, freightCost: 0, freightPerUnit: 0, arrivalDate: 'Aug 8', onTime: true, lateDays: 0, score: 99, selected: true },
          { code: 'PL02', name: 'Willowbrook, IL', dist: '220 mi', atp: 130000, freightCost: 640, freightPerUnit: 0.005, arrivalDate: 'Aug 6', onTime: true, lateDays: 0, score: 72 },
        ],
        insight: 'PL01 selected: ship-to IS Iowa City plant — zero freight. 92# BL KFT L/L Polycoated Grade 51304 matched to SAP 2002507. Full ATP.',
      },
    ],
    validations: [
      { lbl: 'Customer Master', st: 'ok', msg: 'CUST-30112 active. Sun Process Converting regular account.', src: 'KNA1/KNVV' },
      { lbl: 'Material Mapping', st: 'ok', msg: '2002507 — 92# BL KFT L/L Polycoated Grade 51304 Liner 61" validated.', src: 'MARA/MVKE' },
      { lbl: 'Pricing Record', st: 'warn', msg: 'PO price $0.23770/LF. Contract shows $0.2395/LF. Delta $0.0018/LF ($230.87 total). Within 1% tolerance.', src: 'PRCD_ELEMENTS' },
      { lbl: 'Credit / FSCM', st: 'ok', msg: 'Limit $400K. Exposure $52K. Clear.', src: 'UKM_* / FSCM' },
      { lbl: 'Inventory / ATP', st: 'ok', msg: '2002507: 150,000 LF unrestricted at PL01. Full coverage.', src: 'MARD/MATDOC' },
      { lbl: 'Contracts / Agreements', st: 'ok', msg: 'Framework active. Price within tolerance.', src: 'VBAK/VBKD' },
      { lbl: 'Open AR / Payment Risk', st: 'ok', msg: 'No overdue. DSO: 30 days. Clean.', src: 'BSID/ACDOCA' },
      { lbl: 'Order Blocking Reasons', st: 'ok', msg: 'No blocks active.', src: 'VBUK' },
    ],
    decision: {
      score: 82, rec: 'Auto-Create — Minor Price Delta Within Tolerance', autoOk: true,
      plant: 'PL01 — Iowa City, IA', plantReason: 'Ship-to is Iowa City plant. Zero freight cost.',
      confirmedQty: '128,262 LF (1 line)', confirmedDate: 'Aug 8, 2025',
      mode: 'Full Stock Available', gm: '22.5%', marginVsAlt: '+$640 vs PL02 (freight savings)',
      ibpSignal: 'PL01 fully stocked. On-site delivery. IBP confirms zero supply risk.',
      ibpLead: 'IBP Lead Time: 5 days from PL01 (on-site)',
      scores: { 'Service Level': 96, 'Margin Impact': 72, 'Customer Value': 75, 'Lead Time': 98, 'Inventory Health': 90, 'AR / Credit Risk': 93 },
    },
    soHeader: [
      { lbl: 'Order Type', val: 'ZOR', sap: 'VBAK-AUART' }, { lbl: 'Sales Org', val: '1000', sap: 'VBAK-VKORG' },
      { lbl: 'Dist. Channel', val: '10', sap: 'VBAK-VTWEG' }, { lbl: 'Division', val: '00', sap: 'VBAK-SPART' },
      { lbl: 'Sold-To', val: '30112', sap: 'KNVP AG' }, { lbl: 'Ship-To', val: '30112-01', sap: 'KNVP WE' },
      { lbl: 'Customer PO', val: '57503', sap: 'VBKD-BSTKD' }, { lbl: 'Req. Date', val: '2025-08-13', sap: 'VBKD-BSTDK' },
    ],
    soItems: [
      { line: 10, mat: '2002507', qty: 128262, plant: 'PL01', date: '2025-08-08', price: 0.2377 },
    ],
  },
  {
    id: 'ORD-004', poNumber: '57669', customer: 'Sun Process Converting, Inc.', soldTo: 'CUST-30112',
    amount: 31255.00, channel: 'PDF', channelIcon: '📄', status: 'exception', priority: 'medium', received: '11:20 AM', lines: 1,
    pdfFile: '/po-docs/PO-57669.pdf',
    hdr: [
      { lbl: 'Sold-To Customer', val: 'Sun Process Converting, Inc.', conf: 96, sap: 'VBAK-KUNNR' },
      { lbl: 'Customer PO Number', val: '57669', conf: 99, sap: 'VBKD-BSTKD' },
      { lbl: 'PO Date', val: 'August 21, 2025', conf: 97, sap: 'VBKD-BSTDK' },
      { lbl: 'Ship-To Address', val: 'Loparex, 816 Fieldcrest Road, Eden NC 27288', conf: 93, sap: 'VBPA-WE' },
      { lbl: 'Terms', val: '1% 10 / NET 30, FOB: Eden, NC', conf: 91, sap: 'VBKD-INCO1' },
      { lbl: 'Delivery Instructions', val: 'Buyer: 05 — Jessica Alvarez. Platinum Release, Target 37.5, Silicone wound in, 6" Cores 32" Max Dia.', conf: 78, sap: 'VBKD-BSTK2' },
    ],
    items: [
      { line: 10, custSku: 'RM821149', sapMat: 'Ambiguous — 2 candidates for Grade 32519', qty: '175,000', uom: 'LF', price: '0.17860', cur: 'USD', reqDate: 'October 23, 2025', confMat: 68, confQty: 95, confPrice: 88, confDate: 92, lineGM: 'Unknown — material unresolved', confirmDate: 'Cannot confirm',
        plantOptions: [
          { code: 'PL03', name: 'Eden, NC', dist: '0 mi (on-site)', atp: 160000, freightCost: 0, freightPerUnit: 0, arrivalDate: 'Oct 18', onTime: true, lateDays: 0, score: 78 },
          { code: 'PL01', name: 'Iowa City, IA', dist: '940 mi', atp: 200000, freightCost: 2800, freightPerUnit: 0.016, arrivalDate: 'Oct 15', onTime: true, lateDays: 0, score: 52 },
        ],
        insight: 'Material ambiguity: 57# BL SCK CIS 6020/000R Grade 32519 maps to 2 SAP materials. Platinum release spec (Target 37.5) needs CSR confirmation. PL03 (Eden) is ship-to plant but ATP short 15K LF.',
      },
    ],
    validations: [
      { lbl: 'Customer Master', st: 'ok', msg: 'CUST-30112 active. Sun Process Converting.', src: 'KNA1/KNVV' },
      { lbl: 'Material Mapping', st: 'err', msg: 'Grade 32519 Liner 62" — 2 candidates in MARA. Platinum release spec requires manual resolution.', src: 'MARA/MVKE' },
      { lbl: 'Pricing Record', st: 'warn', msg: 'PO price $0.17860/LF. Cannot validate until material resolved.', src: 'PRCD_ELEMENTS' },
      { lbl: 'Credit / FSCM', st: 'ok', msg: 'Limit $400K. Exposure $83K. Clear.', src: 'UKM_* / FSCM' },
      { lbl: 'Inventory / ATP', st: 'warn', msg: 'PL03 (Eden): 160,000 LF — short 15,000 LF vs 175K requirement. PL01 has 200K but high freight.', src: 'MARD/MATDOC' },
      { lbl: 'Contracts / Agreements', st: 'warn', msg: 'No active contract for Grade 32519 Platinum release variant.', src: 'VBAK/VBKD' },
      { lbl: 'Open AR / Payment Risk', st: 'ok', msg: 'No overdue. DSO: 30 days. Clean.', src: 'BSID/ACDOCA' },
      { lbl: 'Order Blocking Reasons', st: 'err', msg: 'Material unresolved — SO creation blocked until CSR confirms SAP material.', src: 'VBUK' },
    ],
    decision: {
      score: 38, rec: 'Exception — Material Ambiguity + ATP Shortfall', autoOk: false,
      plant: 'PL03 — Eden, NC (pending)', plantReason: 'Ship-to is Eden plant, but ATP short 15K LF. Material must be resolved first.',
      confirmedQty: 'Pending', confirmedDate: 'Pending — material unresolved',
      mode: 'Unknown', gm: 'Unknown — material unresolved', marginVsAlt: 'N/A',
      ibpSignal: 'IBP check blocked — material ambiguity. PL03 short 15K LF. Replenishment available from PL01 in 12 days.',
      ibpLead: 'IBP Lead: Cannot calculate until material resolved',
      scores: { 'Service Level': 35, 'Margin Impact': 28, 'Customer Value': 75, 'Lead Time': 42, 'Inventory Health': 38, 'AR / Credit Risk': 93 },
    },
    soHeader: [], soItems: [],
  },
  {
    id: 'ORD-005', poNumber: 'OP-22274', customer: 'Mactac (A LINTEC Company)', soldTo: 'CUST-20031',
    amount: 13635.00, channel: 'EDI', channelIcon: '⇌', status: 'reviewing', priority: 'strategic', received: '06:30 AM', lines: 1,
    pdfFile: '/po-docs/OP-22274.pdf',
    hdr: [
      { lbl: 'Sold-To Customer', val: 'Mactac (A LINTEC Company)', conf: 99, sap: 'VBAK-KUNNR' },
      { lbl: 'Customer PO Number', val: 'OP-22274', conf: 99, sap: 'VBKD-BSTKD' },
      { lbl: 'PO Date', val: 'October 30, 2025', conf: 99, sap: 'VBKD-BSTDK' },
      { lbl: 'Ship-To Address', val: 'Morgan Adhesives Company LLC, 800 Kasota SE, Minneapolis MN 55414', conf: 97, sap: 'VBPA-WE' },
      { lbl: 'Terms', val: '1%10 NET 30', conf: 98, sap: 'VBKD-INCO1' },
      { lbl: 'Delivery Instructions', val: 'Freight: PREPAID (ALLOW). Branch Plant: 94. Buyer: DEROSIER, ADAM. Easy Release.', conf: 93, sap: 'VBKD-BSTK2' },
    ],
    items: [
      { line: 10, custSku: '0903W55', sapMat: '2004583', qty: '90,000', uom: 'FT', price: '0.1515', cur: 'USD', reqDate: 'November 20, 2025', confMat: 94, confQty: 99, confPrice: 96, confDate: 95, lineGM: '21.3%', confirmDate: 'November 16, 2025',
        plantOptions: [
          { code: 'PL01', name: 'Iowa City, IA', dist: '264 mi', atp: 95000, freightCost: 520, freightPerUnit: 0.0058, arrivalDate: 'Nov 16', onTime: true, lateDays: 0, score: 90, selected: true },
          { code: 'PL02', name: 'Willowbrook, IL', dist: '410 mi', atp: 60000, freightCost: 880, freightPerUnit: 0.0098, arrivalDate: 'Nov 14', onTime: true, lateDays: 0, score: 68 },
          { code: 'PL03', name: 'Eden, NC', dist: '1,120 mi', atp: 100000, freightCost: 2400, freightPerUnit: 0.0267, arrivalDate: 'Nov 22', onTime: false, lateDays: 2, score: 32 },
        ],
        insight: 'PL01 selected: full ATP 95K FT. 55" GLAS 55# BLEACH 6000M Easy Release matched to SAP 2004583. Strategic account — Mactac second EDI order today.',
      },
    ],
    validations: [
      { lbl: 'Customer Master', st: 'ok', msg: 'CUST-20031 active. Mactac/LINTEC strategic account. Credit class: A.', src: 'KNA1/KNVV' },
      { lbl: 'Material Mapping', st: 'ok', msg: '2004583 — 55" GLAS 55# BLEACH 6000M/000R EASY RELEASE validated.', src: 'MARA/MVKE' },
      { lbl: 'Pricing Record', st: 'warn', msg: 'EDI price $0.1515/FT. Contract shows $0.1528/FT. Delta −$0.0013/FT (−$117). Customer paying less — CSR review.', src: 'PRCD_ELEMENTS' },
      { lbl: 'Credit / FSCM', st: 'ok', msg: 'Limit $3M. Exposure $434K (incl OP-22271). Clear.', src: 'UKM_* / FSCM' },
      { lbl: 'Inventory / ATP', st: 'ok', msg: '2004583: 95,000 FT unrestricted at PL01. Full coverage.', src: 'MARD/MATDOC' },
      { lbl: 'Contracts / Agreements', st: 'warn', msg: 'Price delta — PO below contract. May indicate updated pricing not yet reflected in SAP.', src: 'VBAK/VBKD' },
      { lbl: 'Open AR / Payment Risk', st: 'ok', msg: 'Clean. DSO 24 days. No overdue.', src: 'BSID/ACDOCA' },
      { lbl: 'Order Blocking Reasons', st: 'ok', msg: 'No blocks. Note: OP-22271 also in today\'s queue for same ship-to.', src: 'VBUK' },
    ],
    decision: {
      score: 76, rec: 'Review & Approve — Price Below Contract', autoOk: false,
      plant: 'PL01 — Iowa City, IA', plantReason: 'Nearest plant to Minneapolis ship-to. Full ATP for Easy Release grade.',
      confirmedQty: '90,000 FT (1 line)', confirmedDate: 'Nov 16, 2025',
      mode: 'Full Stock Available', gm: '21.3%', marginVsAlt: '+$360 vs PL02 routing',
      ibpSignal: 'PL01 stocked. Combined with OP-22271 shipment possible for freight consolidation. IBP confirms supply through Dec.',
      ibpLead: 'IBP Lead Time: 10 days from PL01',
      scores: { 'Service Level': 90, 'Margin Impact': 62, 'Customer Value': 92, 'Lead Time': 88, 'Inventory Health': 91, 'AR / Credit Risk': 97 },
    },
    soHeader: [
      { lbl: 'Order Type', val: 'ZOR', sap: 'VBAK-AUART' }, { lbl: 'Sales Org', val: '1000', sap: 'VBAK-VKORG' },
      { lbl: 'Dist. Channel', val: '10', sap: 'VBAK-VTWEG' }, { lbl: 'Division', val: '00', sap: 'VBAK-SPART' },
      { lbl: 'Sold-To', val: '20031', sap: 'KNVP AG' }, { lbl: 'Ship-To', val: '20031-01', sap: 'KNVP WE' },
      { lbl: 'Customer PO', val: 'OP-22274', sap: 'VBKD-BSTKD' }, { lbl: 'Req. Date', val: '2025-11-20', sap: 'VBKD-BSTDK' },
    ],
    soItems: [
      { line: 10, mat: '2004583', qty: 90000, plant: 'PL01', date: '2025-11-16', price: 0.1515 },
    ],
  },
  {
    id: 'ORD-006', poNumber: 'PO-0026602/03/04', customer: 'Coating & Converting Technologies', soldTo: 'CUST-CCT01',
    amount: 183934, channel: 'Email', channelIcon: '✉', status: 'new', priority: 'high', received: '07:45 AM', lines: 3,
    pdfFile: '/po-docs/PO-0026602.pdf',
    pdfFiles: [
      { label: 'PO 0026602', path: '/po-docs/PO-0026602.pdf' },
      { label: 'PO 0026603', path: '/po-docs/PO-0026603.pdf' },
      { label: 'PO 0026604', path: '/po-docs/PO-0026604.pdf' },
    ],
    hdr: [
      { lbl: 'Sold-To Customer', val: 'Coating and Converting Technologies, LLC', conf: 97, sap: 'VBAK-KUNNR' },
      { lbl: 'Customer PO Number', val: '0026602 / 0026603 / 0026604', conf: 96, sap: 'VBKD-BSTKD' },
      { lbl: 'PO Date', val: 'September 22, 2025', conf: 99, sap: 'VBKD-BSTDK' },
      { lbl: 'Ship-To Address', val: 'C/O Betty Inc, 1801 S Swanson St, Philadelphia PA 19148', conf: 95, sap: 'VBPA-WE' },
      { lbl: 'Incoterms', val: 'FOB CCT', conf: 92, sap: 'VBKD-INCO1' },
      { lbl: 'Payment Terms', val: '1% 10 Days, Net 30', conf: 99, sap: 'VBKD-ZTERM' },
    ],
    items: [
      { line: 10, custSku: 'RL61C2-6100-411', sapMat: '22990-61.000', qty: '200,000', uom: 'LF', price: '0.2612', cur: 'USD', reqDate: 'November 3, 2025', confMat: 96, confQty: 99, confPrice: 97, confDate: 99, lineGM: '29.8%', confirmDate: 'October 30, 2025',
        plantOptions: [
          { code: 'PL02', name: 'Willowbrook, IL', dist: '790 mi', atp: 220000, freightCost: 2800, freightPerUnit: 0.014, arrivalDate: 'Oct 30', onTime: true, lateDays: 0, score: 91, selected: true },
          { code: 'PL03', name: 'Eden, NC', dist: '540 mi', atp: 180000, freightCost: 2100, freightPerUnit: 0.0105, arrivalDate: 'Oct 31', onTime: true, lateDays: 0, score: 78 },
        ],
        insight: 'PL02 selected: full ATP 220K LF, 3 days early. 61# BL KFT H/HP 2420/7500 — VMI item, WHSE: ST3.',
      },
      { line: 20, custSku: 'RL74C1-6300-001', sapMat: '29809-63.000', qty: '260,000', uom: 'LF', price: '0.2749', cur: 'USD', reqDate: 'November 3, 2025', confMat: 94, confQty: 99, confPrice: 95, confDate: 99, lineGM: '31.2%', confirmDate: 'October 30, 2025',
        plantOptions: [
          { code: 'PL02', name: 'Willowbrook, IL', dist: '790 mi', atp: 300000, freightCost: 3200, freightPerUnit: 0.0123, arrivalDate: 'Oct 30', onTime: true, lateDays: 0, score: 89, selected: true },
        ],
        insight: 'PL02 selected: full ATP 300K LF. 74# BL KFT H/HP 4000D/000 — VMI item, consolidated with Line 10.',
      },
      { line: 30, custSku: 'RL76C2-5550-005', sapMat: '23022-55.500', qty: '200,000', uom: 'LF', price: '0.3011', cur: 'USD', reqDate: 'November 3, 2025', confMat: 93, confQty: 99, confPrice: 96, confDate: 99, lineGM: '28.4%', confirmDate: 'October 31, 2025',
        plantOptions: [
          { code: 'PL02', name: 'Willowbrook, IL', dist: '790 mi', atp: 250000, freightCost: 2600, freightPerUnit: 0.013, arrivalDate: 'Oct 31', onTime: true, lateDays: 0, score: 87, selected: true },
        ],
        insight: 'PL02 selected: full ATP. 76# BL KFT H/HP 2420/7500 — VMI item. Consolidated freight with Lines 10 & 20.',
      },
    ],
    validations: [
      { lbl: 'Customer Master', st: 'ok', msg: 'CUST-CCT01 active. VMI agreement in place.', src: 'KNA1/KNVV' },
      { lbl: 'Material Mapping', st: 'ok', msg: 'All 3 materials validated — 22990-61, 29809-63, 23022-55.5.', src: 'MARA/MVKE' },
      { lbl: 'Pricing Record', st: 'ok', msg: 'All prices within VMI contract tolerance.', src: 'PRCD_ELEMENTS' },
      { lbl: 'Credit / FSCM', st: 'ok', msg: 'Limit $500K. Exposure $210K. Clear.', src: 'UKM_* / FSCM' },
      { lbl: 'Inventory / ATP', st: 'ok', msg: 'All 3 items fully covered at PL02.', src: 'MARD/MATDOC' },
      { lbl: 'Contracts / Agreements', st: 'ok', msg: 'VMI framework active through Dec 2025.', src: 'VBAK/VBKD' },
      { lbl: 'Open AR / Payment Risk', st: 'ok', msg: 'Clean. DSO: 25 days.', src: 'BSID/ACDOCA' },
      { lbl: 'Order Blocking Reasons', st: 'ok', msg: 'No blocks active.', src: 'VBUK' },
    ],
    decision: {
      score: 92, rec: 'Auto-Create Sales Order', autoOk: true,
      plant: 'PL02 — Willowbrook, IL', plantReason: 'Full stock, consolidated freight for all 3 lines',
      confirmedQty: '200K + 260K + 200K LF (3 lines)', confirmedDate: 'Oct 30 / Oct 30 / Oct 31',
      mode: 'Full Stock — VMI Replenishment', gm: '29.8% blended', marginVsAlt: '+$3,600 vs split-plant routing',
      ibpSignal: 'VMI replenishment cycle on track. PL02 inventory covers all 3 POs. Next VMI review: Nov 15.',
      ibpLead: 'IBP Lead Time: 10 days from PL02',
      scores: { 'Service Level': 94, 'Margin Impact': 88, 'Customer Value': 85, 'Lead Time': 93, 'Inventory Health': 91, 'AR / Credit Risk': 96 },
    },
    soHeader: [
      { lbl: 'Order Type', val: 'ZOR', sap: 'VBAK-AUART' }, { lbl: 'Sales Org', val: '1000', sap: 'VBAK-VKORG' },
      { lbl: 'Dist. Channel', val: '10', sap: 'VBAK-VTWEG' }, { lbl: 'Division', val: '00', sap: 'VBAK-SPART' },
      { lbl: 'Sold-To', val: 'CCT01', sap: 'KNVP AG' }, { lbl: 'Ship-To', val: 'CCT01-01', sap: 'KNVP WE' },
      { lbl: 'Customer PO', val: '0026602/03/04', sap: 'VBKD-BSTKD' }, { lbl: 'Req. Date', val: '2025-11-03', sap: 'VBKD-BSTDK' },
    ],
    soItems: [
      { line: 10, mat: '22990-61.000', qty: 200000, plant: 'PL02', date: '2025-10-30', price: 0.2612 },
      { line: 20, mat: '29809-63.000', qty: 260000, plant: 'PL02', date: '2025-10-30', price: 0.2749 },
      { line: 30, mat: '23022-55.500', qty: 200000, plant: 'PL02', date: '2025-10-31', price: 0.3011 },
    ],
  },
  {
    id: 'ORD-007', poNumber: 'Berry Consolidated', customer: 'Berry Specialty Tapes (Berry Global)', soldTo: 'CUST-BERRY01',
    amount: 44557.50, channel: 'Portal', channelIcon: '🌐', status: 'ready', priority: 'strategic', received: '06:20 AM', lines: 2,
    pdfFile: '/po-docs/BERRY-5053181.pdf',
    pdfFiles: [
      { label: 'PO 5053181', path: '/po-docs/BERRY-5053181.pdf' },
      { label: 'PO 5113137', path: '/po-docs/BERRY-5113137.pdf' },
    ],
    hdr: [
      { lbl: 'Sold-To Customer', val: 'Berry Specialty Tapes, LLC (Sub Berry Global Inc.)', conf: 99, sap: 'VBAK-KUNNR' },
      { lbl: 'Customer PO Number', val: '5053181 / 5113137', conf: 98, sap: 'VBKD-BSTKD' },
      { lbl: 'PO Date', val: 'September 18, 2025 / December 9, 2025', conf: 97, sap: 'VBKD-BSTDK' },
      { lbl: 'Ship-To Address', val: '1852 Old Country Rd, Riverhead NY 11901', conf: 99, sap: 'VBPA-WE' },
      { lbl: 'Incoterms', val: 'Not specified', conf: 0, sap: 'VBKD-INCO1' },
      { lbl: 'Payment Terms', val: '3% 10, NET 30', conf: 99, sap: 'VBKD-ZTERM' },
    ],
    items: [
      { line: 10, custSku: '2076905', sapMat: 'REL_2102626 S928440_S48440', qty: '20,000', uom: 'LY', price: '0.8860', cur: 'USD', reqDate: 'January 8, 2026', confMat: 91, confQty: 99, confPrice: 97, confDate: 99, lineGM: '32.1%', confirmDate: 'January 5, 2026',
        plantOptions: [
          { code: 'PL02', name: 'Willowbrook, IL', dist: '820 mi', atp: 25000, freightCost: 1800, freightPerUnit: 0.09, arrivalDate: 'Jan 5', onTime: true, lateDays: 0, score: 88, selected: true },
          { code: 'PL03', name: 'Eden, NC', dist: '620 mi', atp: 18000, freightCost: 1400, freightPerUnit: 0.07, arrivalDate: 'Jan 4', onTime: true, lateDays: 0, score: 82 },
        ],
        insight: 'PL02 selected: full ATP 25K LY. KFT_BL_96G_H_HP_1574, 62" wide. Berry RINY plant requires delivery appointment.',
      },
      { line: 20, custSku: '2076793', sapMat: 'REL_2102585 4000D_000 56"', qty: '25,000', uom: 'LY', price: '1.0735', cur: 'USD', reqDate: 'March 13, 2026', confMat: 89, confQty: 99, confPrice: 94, confDate: 99, lineGM: '28.7%', confirmDate: 'March 10, 2026',
        plantOptions: [
          { code: 'PL02', name: 'Willowbrook, IL', dist: '820 mi', atp: 30000, freightCost: 2100, freightPerUnit: 0.084, arrivalDate: 'Mar 10', onTime: true, lateDays: 0, score: 86, selected: true },
        ],
        insight: 'PL02 selected: full ATP 30K LY. KFT_BL_139G_L_LP_1422, 56" wide. COA and COC required with every shipment.',
      },
    ],
    validations: [
      { lbl: 'Customer Master', st: 'ok', msg: 'CUST-BERRY01 — Strategic Account. Vendor Code 124826.', src: 'KNA1/KNVV' },
      { lbl: 'Material Mapping', st: 'ok', msg: 'Both materials validated — REL_2102626, REL_2102585.', src: 'MARA/MVKE' },
      { lbl: 'Pricing Record', st: 'ok', msg: 'Prices match Berry contract. Within tolerance.', src: 'PRCD_ELEMENTS' },
      { lbl: 'Credit / FSCM', st: 'ok', msg: 'Limit $2M. Exposure $480K. Clear.', src: 'UKM_* / FSCM' },
      { lbl: 'Inventory / ATP', st: 'ok', msg: 'Both items fully covered at PL02.', src: 'MARD/MATDOC' },
      { lbl: 'Contracts / Agreements', st: 'ok', msg: 'Berry framework agreement active.', src: 'VBAK/VBKD' },
      { lbl: 'Open AR / Payment Risk', st: 'ok', msg: 'Excellent. DSO: 19 days. No overdue.', src: 'BSID/ACDOCA' },
      { lbl: 'Order Blocking Reasons', st: 'ok', msg: 'No blocks active.', src: 'VBUK' },
    ],
    decision: {
      score: 90, rec: 'Auto-Create Sales Order', autoOk: true,
      plant: 'PL02 — Willowbrook, IL', plantReason: 'Full stock for both lines. Nearest plant to Loparex HQ for staging.',
      confirmedQty: '20K + 25K LY (2 lines)', confirmedDate: 'Jan 5 / Mar 10',
      mode: 'Full Stock Available', gm: '30.2% blended', marginVsAlt: '+$2,100 vs Eden NC routing',
      ibpSignal: 'PL02 stock sufficient. Berry RINY requires delivery appointments — schedule via RINYReceiving@berryglobal.com.',
      ibpLead: 'IBP Lead Time: 14 days from PL02',
      scores: { 'Service Level': 92, 'Margin Impact': 86, 'Customer Value': 94, 'Lead Time': 89, 'Inventory Health': 90, 'AR / Credit Risk': 97 },
    },
    soHeader: [
      { lbl: 'Order Type', val: 'ZOR', sap: 'VBAK-AUART' }, { lbl: 'Sales Org', val: '1000', sap: 'VBAK-VKORG' },
      { lbl: 'Dist. Channel', val: '10', sap: 'VBAK-VTWEG' }, { lbl: 'Division', val: '00', sap: 'VBAK-SPART' },
      { lbl: 'Sold-To', val: 'BERRY01', sap: 'KNVP AG' }, { lbl: 'Ship-To', val: 'BPC00000414', sap: 'KNVP WE' },
      { lbl: 'Customer PO', val: '5053181 / 5113137', sap: 'VBKD-BSTKD' }, { lbl: 'Req. Date', val: 'Multi-line', sap: 'VBKD-BSTDK' },
    ],
    soItems: [
      { line: 10, mat: 'REL_2102626', qty: 20000, plant: 'PL02', date: '2026-01-05', price: 0.886 },
      { line: 20, mat: 'REL_2102585', qty: 25000, plant: 'PL02', date: '2026-03-10', price: 1.0735 },
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
  const [activePdfIdx, setActivePdfIdx] = useState(0);

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
    setActivePdfIdx(0);
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
          <Link component="button" onClick={onBack} sx={{ fontSize: '0.75rem', textDecoration: 'none', color: 'text.secondary' }}>ORDER SYNC</Link>
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
              /* ═══ TAB 0: PO Extraction (AP-style) ═══ */
              <Box>
                {/* ── PO Document Viewer (collapsible) ── */}
                {(() => {
                  const pdfs = o.pdfFiles || [{ label: o.poNumber, path: o.pdfFile }];
                  const currentPdf = pdfs[activePdfIdx] || pdfs[0];
                  return (
                    <Paper elevation={0} sx={{ mb: 2, borderRadius: 2.5, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                      {/* PDF Header bar — click to toggle */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 0.75, bgcolor: '#e2e8f0', cursor: 'pointer', '&:hover': { bgcolor: '#dbe2ea' } }}
                        onClick={() => toggleItem('pdf-viewer')}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PdfIcon sx={{ fontSize: 16, color: '#dc2626' }} />
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#334155' }}>
                            {o.poNumber} — {o.customer}
                          </Typography>
                          <Chip label={`${pdfs.length} doc${pdfs.length > 1 ? 's' : ''}`} size="small" sx={{ fontSize: '0.55rem', fontWeight: 600, height: 18, bgcolor: alpha(NAVY, 0.1), color: NAVY }} />
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <MuiTooltip title="Open in new tab">
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); window.open(currentPdf.path, '_blank'); }}
                              sx={{ color: '#64748b', '&:hover': { color: NAVY } }}>
                              <OpenInNewIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </MuiTooltip>
                          {expandedItems['pdf-viewer'] ? <ExpandLessIcon sx={{ fontSize: 16, color: MUTED }} /> : <ExpandMoreIcon sx={{ fontSize: 16, color: MUTED }} />}
                        </Stack>
                      </Box>
                      <Collapse in={!!expandedItems['pdf-viewer']}>
                        {/* PDF tab selector (when multiple docs) */}
                        {pdfs.length > 1 && (
                          <Box sx={{ display: 'flex', gap: 0.5, px: 1.5, py: 0.75, bgcolor: '#f1f5f9', borderBottom: `1px solid ${BORDER}`, overflowX: 'auto' }}>
                            {pdfs.map((pdf, idx) => (
                              <Chip key={idx} label={pdf.label} size="small"
                                onClick={() => setActivePdfIdx(idx)}
                                sx={{
                                  fontSize: '0.58rem', fontWeight: activePdfIdx === idx ? 700 : 500, height: 22, cursor: 'pointer', flexShrink: 0,
                                  bgcolor: activePdfIdx === idx ? alpha(NAVY, 0.15) : 'transparent',
                                  color: activePdfIdx === idx ? NAVY : MUTED,
                                  border: activePdfIdx === idx ? `1px solid ${alpha(NAVY, 0.3)}` : '1px solid transparent',
                                  '&:hover': { bgcolor: alpha(NAVY, 0.08) },
                                }} />
                            ))}
                          </Box>
                        )}
                        {/* PDF Preview */}
                        <Box sx={{ position: 'relative', height: 280, cursor: 'pointer' }} onClick={() => window.open(currentPdf.path, '_blank')}>
                          <iframe
                            src={`${currentPdf.path}#toolbar=0&navpanes=0&scrollbar=0`}
                            title={`${currentPdf.label} preview`}
                            style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
                          />
                          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 0.75, bgcolor: 'rgba(255,255,255,0.92)', borderTop: `1px solid ${BORDER}` }}>
                            <Typography sx={{ fontSize: '0.6rem', color: MUTED }}>
                              {currentPdf.label}.pdf · {o.channel} channel · Click to open
                            </Typography>
                            <Chip label="AI Extracted" size="small" sx={{ height: 18, fontSize: '0.55rem', bgcolor: alpha(GREEN, 0.1), color: GREEN, fontWeight: 600 }} />
                          </Box>
                        </Box>
                      </Collapse>
                    </Paper>
                  );
                })()}

                {/* ── Overall Confidence Summary ── */}
                {(() => {
                  const allConfs = [...o.hdr.map(h => h.conf), ...o.items.flatMap(it => [it.confMat, it.confQty, it.confPrice, it.confDate])];
                  const validConfs = allConfs.filter(c => c > 0);
                  const overallConf = validConfs.length ? (validConfs.reduce((a, b) => a + b, 0) / validConfs.length).toFixed(1) : 0;
                  const highCount = validConfs.filter(c => c >= 90).length;
                  const medCount = validConfs.filter(c => c >= 70 && c < 90).length;
                  const lowCount = validConfs.filter(c => c < 70).length;
                  const zeroCount = allConfs.filter(c => c === 0).length;
                  const oColor = confColor(parseFloat(overallConf));
                  // Source counts
                  const srcCounts = { 'OCR': 0, 'SAP Master Data': 0, 'Contract Lookup': 0, 'Not Detected': 0 };
                  o.hdr.forEach(h => { if (h.conf === 0) srcCounts['Not Detected']++; else if (h.conf >= 95) srcCounts['SAP Master Data']++; else srcCounts['OCR']++; });
                  o.items.forEach(it => { [it.confMat, it.confQty, it.confPrice, it.confDate].forEach(c => { if (c === 0) srcCounts['Not Detected']++; else if (c >= 95) srcCounts['SAP Master Data']++; else if (c >= 85) srcCounts['Contract Lookup']++; else srcCounts['OCR']++; }); });
                  const srcColors = { 'OCR': GREEN, 'SAP Master Data': NAVY, 'Contract Lookup': PURPLE, 'Not Detected': '#94a3b8' };
                  return (
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, mb: 2, border: `1px solid ${BORDER}`, bgcolor: 'white' }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr', gap: 3, alignItems: 'center' }}>
                        {/* Big score */}
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: oColor, lineHeight: 1, mb: 0.5 }}>{overallConf}%</Typography>
                          <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overall Confidence</Typography>
                          <Typography sx={{ fontSize: '0.55rem', color: MUTED, mt: 0.5 }}>{validConfs.length} fields extracted</Typography>
                        </Box>
                        {/* Confidence breakdown */}
                        <Box>
                          <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1.5 }}>Confidence Breakdown</Typography>
                          <Stack spacing={0.75}>
                            {[
                              { label: 'HIGH', count: highCount, color: GREEN, threshold: '≥90%' },
                              { label: 'MED', count: medCount, color: AMBER, threshold: '70–89%' },
                              { label: 'LOW', count: lowCount, color: RED, threshold: '<70%' },
                            ].map(band => (
                              <Box key={band.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Chip label={band.label} size="small" sx={{ fontSize: '0.55rem', fontWeight: 700, height: 20, minWidth: 46, bgcolor: alpha(band.color, 0.1), color: band.color, textTransform: 'uppercase', letterSpacing: '0.5px' }} />
                                <Box sx={{ flex: 1 }}>
                                  <LinearProgress variant="determinate" value={validConfs.length ? (band.count / validConfs.length) * 100 : 0}
                                    sx={{ height: 5, borderRadius: 3, bgcolor: alpha(band.color, 0.08), '& .MuiLinearProgress-bar': { bgcolor: band.color, borderRadius: 3 } }} />
                                </Box>
                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: band.color, minWidth: 20, textAlign: 'right' }}>{band.count}</Typography>
                              </Box>
                            ))}
                            {zeroCount > 0 && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Chip label="N/A" size="small" sx={{ fontSize: '0.55rem', fontWeight: 700, height: 20, minWidth: 46, bgcolor: alpha('#94a3b8', 0.1), color: '#94a3b8' }} />
                                <Box sx={{ flex: 1 }}><LinearProgress variant="determinate" value={(zeroCount / allConfs.length) * 100} sx={{ height: 5, borderRadius: 3, bgcolor: alpha('#94a3b8', 0.08), '& .MuiLinearProgress-bar': { bgcolor: '#94a3b8', borderRadius: 3 } }} /></Box>
                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', minWidth: 20, textAlign: 'right' }}>{zeroCount}</Typography>
                              </Box>
                            )}
                          </Stack>
                        </Box>
                        {/* Extraction sources */}
                        <Box>
                          <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 1.5 }}>Extraction Sources</Typography>
                          <Stack spacing={0.5}>
                            {Object.entries(srcCounts).filter(([, c]) => c > 0).map(([src, count]) => (
                              <Box key={src} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: srcColors[src], flexShrink: 0 }} />
                                <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', flex: 1 }}>{src}</Typography>
                                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700 }}>{count}</Typography>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })()}

                {/* ── Per-Field Extraction Table (AP-style) ── */}
                <Paper elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${BORDER}`, overflow: 'hidden', mb: 2 }}>
                  {/* Terminal-style header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.2, bgcolor: '#f1f5f9', borderBottom: `1px solid ${BORDER}` }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#f87171' }} />
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#fbbf24' }} />
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#34d399' }} />
                    <Typography sx={{ fontSize: '0.6rem', color: MUTED, ml: 1 }}>AI Extraction — Per-Field Confidence · {o.channel} Channel</Typography>
                  </Box>
                  {/* Column headers */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr 160px 70px 100px', px: 2, py: 1, bgcolor: '#f0f4f8', borderBottom: `2px solid ${NAVY}` }}>
                    {['Field', 'Extracted Value', 'Confidence', 'Level', 'SAP Ref'].map(h => (
                      <Typography key={h} sx={{ fontSize: '0.65rem', fontWeight: 700, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</Typography>
                    ))}
                  </Box>
                  {/* Header field rows */}
                  {o.hdr.map((f, i) => {
                    const cl = confLevel(f.conf);
                    const cc = confColor(f.conf);
                    return (
                      <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '150px 1fr 160px 70px 100px', px: 2, py: 1.1, alignItems: 'center', borderBottom: `1px solid ${BORDER}`, bgcolor: i % 2 === 0 ? 'transparent' : alpha(NAVY, 0.015), '&:hover': { bgcolor: alpha(NAVY, 0.04) } }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.secondary' }}>{f.lbl}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: f.conf === 0 ? MUTED : 'text.primary' }}>{f.val}</Typography>
                          {f.conf < 70 && f.conf > 0 && (
                            <Chip label="Accept" size="small" onClick={() => showToast(`Field accepted: ${f.lbl}`, 'success')}
                              sx={{ fontSize: '0.5rem', fontWeight: 700, height: 16, cursor: 'pointer', bgcolor: alpha(GREEN, 0.08), color: GREEN, '&:hover': { bgcolor: GREEN, color: 'white' } }} />
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: alpha(cc, 0.12), overflow: 'hidden' }}>
                            <Box sx={{ width: `${f.conf}%`, height: '100%', borderRadius: 2, bgcolor: cc }} />
                          </Box>
                          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: cc, minWidth: 30 }}>{f.conf > 0 ? `${f.conf}%` : '—'}</Typography>
                        </Box>
                        <Chip label={f.conf === 0 ? 'N/A' : cl.toUpperCase()} size="small"
                          sx={{ fontSize: '0.5rem', fontWeight: 700, height: 18, bgcolor: confBg(f.conf), color: cc, textTransform: 'uppercase', letterSpacing: '0.3px' }} />
                        <Typography sx={{ fontSize: '0.55rem', color: MUTED, bgcolor: '#f8fafc', border: `1px solid ${BORDER}`, px: 0.5, py: 0.15, borderRadius: 0.5, textAlign: 'center' }}>{f.sap}</Typography>
                      </Box>
                    );
                  })}
                </Paper>

                {/* ── Line Items (keep existing expandable pattern) ── */}
                <Typography sx={sectionTitle}>Line Items</Typography>
                {o.items.map((item, idx) => {
                  const key = `${o.id}-${idx}`;
                  const expanded = expandedItems[key];
                  const avgConf = Math.round([item.confMat, item.confQty, item.confPrice, item.confDate].filter(v => v > 0).reduce((a, b) => a + b, 0) / [item.confMat, item.confQty, item.confPrice, item.confDate].filter(v => v > 0).length || 1);
                  const hasLow = [item.confMat, item.confQty, item.confPrice, item.confDate].some(c => c < 70);
                  return (
                    <Paper key={key} variant="outlined" sx={{ mb: 1, borderRadius: 1, overflow: 'hidden', border: `1px solid ${hasLow ? alpha(AMBER, 0.3) : BORDER}` }}>
                      <Box onClick={() => toggleItem(key)} sx={{ px: 1.5, py: 1, cursor: 'pointer', '&:hover': { bgcolor: alpha(NAVY, 0.02) } }}>
                        {/* Row 1: Line chip + material + confidence */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Chip label={`Line ${item.line}`} size="small" sx={{ fontSize: '0.6rem', fontWeight: 700, height: 20, bgcolor: alpha(NAVY, 0.1), color: NAVY }} />
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.primary' }}>{item.custSku}</Typography>
                          <Typography sx={{ fontSize: '0.65rem', color: MUTED }}>→ {item.sapMat}</Typography>
                          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <ConfRing value={avgConf} />
                            {hasLow && <WarningIcon sx={{ fontSize: 14, color: AMBER }} />}
                            {expanded ? <ExpandLessIcon sx={{ fontSize: 16, color: MUTED }} /> : <ExpandMoreIcon sx={{ fontSize: 16, color: MUTED }} />}
                          </Box>
                        </Box>
                        {/* Row 2: Material, Qty, Unit, Price details */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pl: 0.5 }}>
                          {[
                            { lbl: 'Material', val: item.sapMat },
                            { lbl: 'Quantity', val: item.qty },
                            { lbl: 'Unit', val: item.uom },
                            { lbl: 'Price', val: `$${item.price}/${item.uom}` },
                          ].map(d => (
                            <Box key={d.lbl} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography sx={{ fontSize: '0.55rem', fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{d.lbl}:</Typography>
                              <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.primary' }}>{d.val}</Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                      <Collapse in={expanded}>
                        <Box sx={{ bgcolor: '#fafbfc', borderTop: `1px solid ${BORDER}` }}>
                          {/* AP-style field rows for line item */}
                          {[
                            { lbl: 'SAP Material', val: item.sapMat, conf: item.confMat, sap: 'VBAP-MATNR' },
                            { lbl: 'Qty / UOM', val: `${item.qty} ${item.uom}`, conf: item.confQty, sap: 'VBAP-KWMENG' },
                            { lbl: 'Unit Price', val: `$${item.price}`, conf: item.confPrice, sap: 'PRCD_ELEMENTS' },
                            { lbl: 'Req. Delivery Date', val: item.reqDate, conf: item.confDate, sap: 'VBEP-EDATU' },
                          ].map((f, fi) => {
                            const cc = confColor(f.conf);
                            return (
                              <Box key={fi} sx={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 55px 90px', px: 1.5, py: 0.8, alignItems: 'center', borderBottom: `1px solid ${BORDER}`, '&:hover': { bgcolor: alpha(NAVY, 0.03) } }}>
                                <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: 'text.secondary' }}>{f.lbl}</Typography>
                                <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: f.conf === 0 ? MUTED : 'text.primary' }}>{f.val}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                  <Box sx={{ flex: 1, height: 3, borderRadius: 2, bgcolor: alpha(cc, 0.12), overflow: 'hidden' }}>
                                    <Box sx={{ width: `${f.conf}%`, height: '100%', borderRadius: 2, bgcolor: cc }} />
                                  </Box>
                                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: cc }}>{f.conf > 0 ? `${f.conf}%` : '—'}</Typography>
                                </Box>
                                <Chip label={f.conf === 0 ? 'N/A' : confLevel(f.conf).toUpperCase()} size="small"
                                  sx={{ fontSize: '0.45rem', fontWeight: 700, height: 16, bgcolor: confBg(f.conf), color: cc }} />
                                <Typography sx={{ fontSize: '0.5rem', color: MUTED, bgcolor: '#f0f4f8', border: `1px solid ${BORDER}`, px: 0.5, py: 0.1, borderRadius: 0.5, textAlign: 'center' }}>{f.sap}</Typography>
                              </Box>
                            );
                          })}
                          <Box sx={{ p: 1.5 }}>
                            {item.insight && (
                              <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha(NAVY, 0.04), border: `1px solid ${alpha(NAVY, 0.1)}` }}>
                                <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: NAVY, mb: 0.3 }}>Ordly AI Insight</Typography>
                                <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', lineHeight: 1.5 }}>{item.insight}</Typography>
                              </Box>
                            )}
                          </Box>
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
