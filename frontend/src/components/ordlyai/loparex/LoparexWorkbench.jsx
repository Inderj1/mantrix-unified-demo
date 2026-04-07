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
  ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
  ViewSidebar as ViewSidebarIcon, UploadFile as UploadFileIcon,
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
    id: 'ORD-003', poNumber: '3588457', customer: 'Shurtape Technologies, LLC', soldTo: 'CUST-SHUR01',
    amount: 27511.60, channel: 'PDF', channelIcon: '📄', status: 'validating', priority: 'medium', received: '07:58 AM', lines: 1,
    pdfFile: '/po-docs/SHURTAPE-3588457.pdf',
    hdr: [
      { lbl: 'Sold-To Customer', val: 'Shurtape Technologies, LLC', conf: 97, sap: 'VBAK-KUNNR' },
      { lbl: 'Customer PO Number', val: '3588457', conf: 99, sap: 'VBKD-BSTKD' },
      { lbl: 'PO Date', val: 'September 23, 2025', conf: 99, sap: 'VBKD-BSTDK' },
      { lbl: 'Ship-To Address', val: 'Springfield Sulco Warehouse, Shurtape Technologies LLC, 311 Industry Avenue, Springfield MA 01104', conf: 96, sap: 'VBPA-WE' },
      { lbl: 'Terms', val: '2J 1% 10 Days NET 30', conf: 95, sap: 'VBKD-INCO1' },
      { lbl: 'Delivery Instructions', val: 'Delivery date: 03/05/2026. Incoterms: COL. Contact: Amy Robinson 828-315-7724. Attn: Brian Granata.', conf: 91, sap: 'VBKD-BSTK2' },
    ],
    items: [
      { line: 10, custSku: '330797', sapMat: '2002596', qty: '450,000', uom: '1K sq ft', price: '57.84', cur: 'USD', reqDate: 'March 5, 2026', confMat: 94, confQty: 97, confPrice: 96, confDate: 98, lineGM: '28.3%', confirmDate: 'March 1, 2026',
        plantOptions: [
          { code: 'PL01', name: 'Iowa City, IA', dist: '1,150 mi', atp: 500000, freightCost: 3200, freightPerUnit: 7.11, arrivalDate: 'Mar 1', onTime: true, lateDays: 0, score: 85, selected: true },
          { code: 'PL03', name: 'Eden, NC', dist: '680 mi', atp: 420000, freightCost: 2100, freightPerUnit: 4.67, arrivalDate: 'Mar 2', onTime: true, lateDays: 0, score: 79 },
        ],
        insight: 'PL01 selected: full ATP 500K. Loparex 51827 3.2 BL SCK 6000/6010 56in matched to SAP 2002596. Vendor# 112368, Plant# 89. Certs required with each shipment.',
      },
    ],
    validations: [
      { lbl: 'Customer Master', st: 'ok', msg: 'CUST-SHUR01 active. Shurtape Technologies key account. Vendor# 112368.', src: 'KNA1/KNVV' },
      { lbl: 'Material Mapping', st: 'ok', msg: '2002596 — Loparex 51827 3.2 BL SCK 6000/6010 56in validated.', src: 'MARA/MVKE' },
      { lbl: 'Pricing Record', st: 'warn', msg: 'Gross price $57.84/MSF. Contract shows $56.90/MSF. Delta $0.94/MSF ($423 total). Within 2% tolerance.', src: 'PRCD_ELEMENTS' },
      { lbl: 'Credit / FSCM', st: 'ok', msg: 'Limit $800K. Exposure $120K. Clear.', src: 'UKM_* / FSCM' },
      { lbl: 'Inventory / ATP', st: 'ok', msg: '2002596: 500,000 1K sq ft unrestricted at PL01. Full coverage.', src: 'MARD/MATDOC' },
      { lbl: 'Contracts / Agreements', st: 'ok', msg: 'Framework active. Price within tolerance.', src: 'VBAK/VBKD' },
      { lbl: 'Open AR / Payment Risk', st: 'ok', msg: 'No overdue. DSO: 28 days. Clean.', src: 'BSID/ACDOCA' },
      { lbl: 'Order Blocking Reasons', st: 'ok', msg: 'No blocks active.', src: 'VBUK' },
    ],
    decision: {
      score: 84, rec: 'Auto-Create — Minor Price Delta Within Tolerance', autoOk: true,
      plant: 'PL01 — Iowa City, IA', plantReason: 'Full ATP. Loparex primary plant for Shurtape account.',
      confirmedQty: '450,000 1K sq ft (1 line)', confirmedDate: 'Mar 1, 2026',
      mode: 'Full Stock Available', gm: '28.3%', marginVsAlt: '+$1,100 vs Eden routing',
      ibpSignal: 'PL01 fully stocked. Long lead delivery (Mar 2026). IBP confirms zero supply risk.',
      ibpLead: 'IBP Lead Time: 14 days from PL01',
      scores: { 'Service Level': 92, 'Margin Impact': 78, 'Customer Value': 80, 'Lead Time': 94, 'Inventory Health': 90, 'AR / Credit Risk': 95 },
    },
    soHeader: [
      { lbl: 'Order Type', val: 'ZOR', sap: 'VBAK-AUART' }, { lbl: 'Sales Org', val: '1000', sap: 'VBAK-VKORG' },
      { lbl: 'Dist. Channel', val: '10', sap: 'VBAK-VTWEG' }, { lbl: 'Division', val: '00', sap: 'VBAK-SPART' },
      { lbl: 'Sold-To', val: 'SHUR01', sap: 'KNVP AG' }, { lbl: 'Ship-To', val: 'SHUR01-01', sap: 'KNVP WE' },
      { lbl: 'Customer PO', val: '3588457', sap: 'VBKD-BSTKD' }, { lbl: 'Req. Date', val: '2026-03-05', sap: 'VBKD-BSTDK' },
    ],
    soItems: [
      { line: 10, mat: '2002596', qty: 450, plant: 'PL01', date: '2026-03-01', price: 57.84 },
    ],
  },
  {
    id: 'ORD-004', poNumber: '2025-0981', customer: 'Bizerba Tekno Label Inc.', soldTo: 'CUST-BIZ01',
    amount: 16284.00, channel: 'PDF', channelIcon: '📄', status: 'exception', priority: 'medium', received: '11:20 AM', lines: 1,
    pdfFile: '/po-docs/BIZERBA-2025-0981.pdf',
    hdr: [
      { lbl: 'Sold-To Customer', val: 'Bizerba Tekno Label Inc.', conf: 96, sap: 'VBAK-KUNNR' },
      { lbl: 'Customer PO Number', val: '2025-0981', conf: 99, sap: 'VBKD-BSTKD' },
      { lbl: 'PO Date', val: 'July 28, 2025', conf: 99, sap: 'VBKD-BSTDK' },
      { lbl: 'Ship-To Address', val: 'Bizerba Tekno Label, 1450 rue Nobel porte 13, Boucherville QC J4B 5H3, Canada', conf: 93, sap: 'VBPA-WE' },
      { lbl: 'Terms', val: 'Net 30 days', conf: 98, sap: 'VBKD-INCO1' },
      { lbl: 'Delivery Instructions', val: 'Requested: September 22, 2025. Project# 1100-5020. Attn: Ruby Melendez. Send docs to customs@agotrans.com & ca.btlshipping@bizerba.com.', conf: 82, sap: 'VBKD-BSTK2' },
    ],
    items: [
      { line: 10, custSku: '2100882-13"', sapMat: 'Ambiguous — Loparex 2100882 width variant', qty: '20', uom: 'Roll', price: '814.20', cur: 'USD', reqDate: 'September 22, 2025', confMat: 72, confQty: 95, confPrice: 88, confDate: 96, lineGM: 'Unknown — material width variant unresolved', confirmDate: 'Cannot confirm',
        plantOptions: [
          { code: 'PL01', name: 'Iowa City, IA', dist: '980 mi', atp: 50, freightCost: 1200, freightPerUnit: 60.00, arrivalDate: 'Sep 18', onTime: true, lateDays: 0, score: 68 },
          { code: 'PL03', name: 'Eden, NC', dist: '820 mi', atp: 35, freightCost: 900, freightPerUnit: 45.00, arrivalDate: 'Sep 19', onTime: true, lateDays: 0, score: 62 },
        ],
        insight: 'Material ambiguity: Loparex 2100882-13" — 3.2 BL SCK 6000/000R, 13" wide, 20,000 ft/roll (6667 LY/rl). Unit $0.04071/ft. International ship-to (Canada) — customs broker required.',
      },
    ],
    validations: [
      { lbl: 'Customer Master', st: 'ok', msg: 'CUST-BIZ01 active. Bizerba Tekno Label, Boucherville QC.', src: 'KNA1/KNVV' },
      { lbl: 'Material Mapping', st: 'err', msg: 'Loparex 2100882 — width variant 13" not uniquely matched. Multiple SAP materials for different widths.', src: 'MARA/MVKE' },
      { lbl: 'Pricing Record', st: 'warn', msg: 'PO price $814.20/Roll. Cannot fully validate until material width variant resolved.', src: 'PRCD_ELEMENTS' },
      { lbl: 'Credit / FSCM', st: 'ok', msg: 'Limit $200K. Exposure $32K. Clear.', src: 'UKM_* / FSCM' },
      { lbl: 'Inventory / ATP', st: 'warn', msg: 'Cannot confirm ATP — material variant unresolved. PL01 has ~50 rolls of base material.', src: 'MARD/MATDOC' },
      { lbl: 'Contracts / Agreements', st: 'warn', msg: 'No active contract for Bizerba. Spot pricing assumed.', src: 'VBAK/VBKD' },
      { lbl: 'Open AR / Payment Risk', st: 'ok', msg: 'Clean. DSO: 34 days. No overdue.', src: 'BSID/ACDOCA' },
      { lbl: 'Order Blocking Reasons', st: 'err', msg: 'Material unresolved + international ship-to requires export compliance check.', src: 'VBUK' },
    ],
    decision: {
      score: 35, rec: 'Exception — Material Ambiguity + International Compliance', autoOk: false,
      plant: 'Undetermined', plantReason: 'Cannot determine until material width variant resolved. Export compliance pending.',
      confirmedQty: 'Pending', confirmedDate: 'Pending — material unresolved',
      mode: 'Unknown', gm: 'Unknown — material unresolved', marginVsAlt: 'N/A',
      ibpSignal: 'IBP check blocked — material ambiguity. Canada ship-to requires customs documentation. Contact customs@agotrans.com.',
      ibpLead: 'IBP Lead: Cannot calculate until material resolved',
      scores: { 'Service Level': 32, 'Margin Impact': 25, 'Customer Value': 60, 'Lead Time': 40, 'Inventory Health': 35, 'AR / Credit Risk': 90 },
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
      { line: 10, custSku: '0903W55', sapMat: '2004583', qty: '90,000', uom: 'FT', price: '0.1515', cur: 'USD', reqDate: 'November 3, 2025', confMat: 94, confQty: 99, confPrice: 96, confDate: 95, lineGM: '21.3%', confirmDate: 'October 30, 2025',
        plantOptions: [
          { code: 'PL01', name: 'Iowa City, IA', dist: '264 mi', atp: 95000, freightCost: 520, freightPerUnit: 0.0058, arrivalDate: 'Oct 30', onTime: true, lateDays: 0, score: 90, selected: true },
          { code: 'PL02', name: 'Willowbrook, IL', dist: '410 mi', atp: 60000, freightCost: 880, freightPerUnit: 0.0098, arrivalDate: 'Oct 28', onTime: true, lateDays: 0, score: 68 },
          { code: 'PL03', name: 'Eden, NC', dist: '1,120 mi', atp: 100000, freightCost: 2400, freightPerUnit: 0.0267, arrivalDate: 'Nov 6', onTime: false, lateDays: 3, score: 32 },
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
      confirmedQty: '90,000 FT (1 line)', confirmedDate: 'Oct 30, 2025',
      mode: 'Full Stock Available', gm: '21.3%', marginVsAlt: '+$360 vs PL02 routing',
      ibpSignal: 'PL01 stocked. Combined with OP-22271 shipment possible for freight consolidation. IBP confirms supply through Dec.',
      ibpLead: 'IBP Lead Time: 10 days from PL01',
      scores: { 'Service Level': 90, 'Margin Impact': 62, 'Customer Value': 92, 'Lead Time': 88, 'Inventory Health': 91, 'AR / Credit Risk': 97 },
    },
    soHeader: [
      { lbl: 'Order Type', val: 'ZOR', sap: 'VBAK-AUART' }, { lbl: 'Sales Org', val: '1000', sap: 'VBAK-VKORG' },
      { lbl: 'Dist. Channel', val: '10', sap: 'VBAK-VTWEG' }, { lbl: 'Division', val: '00', sap: 'VBAK-SPART' },
      { lbl: 'Sold-To', val: '20031', sap: 'KNVP AG' }, { lbl: 'Ship-To', val: '20031-01', sap: 'KNVP WE' },
      { lbl: 'Customer PO', val: 'OP-22274', sap: 'VBKD-BSTKD' }, { lbl: 'Req. Date', val: '2025-11-03', sap: 'VBKD-BSTDK' },
    ],
    soItems: [
      { line: 10, mat: '2004583', qty: 90000, plant: 'PL01', date: '2025-10-30', price: 0.1515 },
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
  const [channelFilter, setChannelFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState(() => {
    const init = {};
    ORDERS[0].items.forEach((_, idx) => { init[`${ORDERS[0].id}-${idx}`] = true; });
    return init;
  });
  const [overrideCount, setOverrideCount] = useState(0);
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'info' });
  const [soCreating, setSoCreating] = useState(false);
  const [soCreated, setSoCreated] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  // Track user plant selections per line: { 'ORD-001-0': 'PL02', ... }
  const [plantSelections, setPlantSelections] = useState({});
  // Track SO preview edits: { 'hdr-0': 'newVal', 'item-0-qty': '500', ... }
  const [soEdits, setSoEdits] = useState({});
  const [editingField, setEditingField] = useState(null);
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
      if (filterMode === 'reviewing' && o.status !== 'reviewing' && o.status !== 'validating') return false;
    }
    if (channelFilter !== 'all' && o.channel !== channelFilter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return o.customer.toLowerCase().includes(s) || o.poNumber.toLowerCase().includes(s);
    }
    return true;
  });

  const selectOrder = (order) => {
    setSelectedOrder(order);
    setActiveTab(0);
    // Auto-expand all line items by default
    const expanded = {};
    order.items.forEach((_, idx) => { expanded[`${order.id}-${idx}`] = true; });
    setExpandedItems(expanded);
    setOverrideCount(0);
    setSoCreating(false);
    setSoCreated(false);
    setPlantSelections({});
    setSoEdits({});
    setEditingField(null);
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

  // ─── Pipeline summary stats ───
  const totalOrders = ORDERS.length;
  const readyCount = ORDERS.filter(o => o.status === 'ready').length;
  const reviewCount = ORDERS.filter(o => o.status === 'reviewing' || o.status === 'validating').length;
  const exceptionCount = ORDERS.filter(o => o.status === 'exception').length;
  const newCount = ORDERS.filter(o => o.status === 'new').length;
  const totalValue = ORDERS.reduce((s, o) => s + o.amount, 0);

  const statusSummary = [
    { label: 'TOTAL TODAY', count: totalOrders, color: NAVY },
    { label: 'READY', count: readyCount, color: GREEN },
    { label: 'REVIEW', count: reviewCount, color: AMBER },
    { label: 'EXCEPTION', count: exceptionCount, color: RED },
    { label: 'NEW', count: newCount, color: NAVY_LIGHT },
  ];

  // Channel breakdown
  const channels = ['Email', 'EDI', 'PDF', 'Portal'];
  const channelData = channels.map(ch => {
    const orders = ORDERS.filter(o => o.channel === ch);
    const count = orders.length;
    const value = orders.reduce((s, o) => s + o.amount, 0);
    const ready = orders.filter(o => o.status === 'ready').length;
    const review = orders.filter(o => o.status === 'reviewing' || o.status === 'validating').length;
    const exc = orders.filter(o => o.status === 'exception').length;
    return { label: ch === 'Email' ? 'EMAIL / OCR' : ch === 'EDI' ? 'EDI / IDOC' : ch === 'PDF' ? 'SCANNED PDF' : 'SUPPLIER PORTAL', channel: ch, count, value, ready, review, exc, pct: totalOrders > 0 ? Math.round(count / totalOrders * 100) : 0 };
  });
  const allChannelData = { label: 'ALL CHANNELS', count: totalOrders, value: totalValue, ready: readyCount, review: reviewCount, exc: exceptionCount, pct: 100 };

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
        <Stack direction="row" spacing={1} alignItems="center">
          <input type="file" accept=".pdf" id="po-upload-input" hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                showToast(`"${file.name}" uploaded — AI extraction in progress...`, 'success');
                e.target.value = '';
              }
            }}
          />
          <Button startIcon={<UploadFileIcon />} size="small" variant="contained"
            onClick={() => document.getElementById('po-upload-input')?.click()}
            sx={{ textTransform: 'none', fontSize: '0.7rem', fontWeight: 600, bgcolor: NAVY, '&:hover': { bgcolor: NAVY_DARK } }}>
            Upload PO
          </Button>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} size="small" variant="outlined" sx={{ textTransform: 'none', fontSize: '0.7rem' }}>Back</Button>
        </Stack>
      </Box>

      {/* ─── Status Summary Row (compact) ─── */}
      <Box sx={{ px: 1.5, py: 0.5, borderBottom: `1px solid ${BORDER}`, bgcolor: 'white' }}>
        {/* Row 1: Status counts */}
        <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${statusSummary.length}, 1fr)`, gap: 0.75, mb: 0.5 }}>
          {statusSummary.map((s, i) => {
            const filterKey = s.label === 'TOTAL TODAY' ? 'all' : s.label === 'READY' ? 'ready' : s.label === 'NEW' ? 'new' : s.label === 'EXCEPTION' ? 'exception' : s.label === 'REVIEW' ? 'reviewing' : 'all';
            const isActive = filterMode === filterKey;
            return (
              <Box key={i} onClick={() => { setFilterMode(filterKey); setChannelFilter('all'); }}
                sx={{ textAlign: 'center', py: 0.4, borderRadius: 1, cursor: 'pointer', transition: 'all 0.15s',
                  border: isActive ? `2px solid ${s.color}` : `1px solid ${BORDER}`,
                  bgcolor: isActive ? alpha(s.color, 0.06) : 'transparent',
                  '&:hover': { borderColor: alpha(s.color, 0.4), bgcolor: alpha(s.color, 0.03) } }}>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: s.color, lineHeight: 1.2 }}>{s.count}</Typography>
                <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: isActive ? s.color : MUTED }}>{s.label}</Typography>
              </Box>
            );
          })}
        </Box>
        {/* Row 2: Channel cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${channelData.length + 1}, 1fr)`, gap: 0.75 }}>
          {[allChannelData, ...channelData].map((ch, i) => {
            const isAll = i === 0;
            const chKey = isAll ? 'all' : ch.channel;
            const isActive = channelFilter === chKey;
            return (
              <Box key={i} onClick={() => { setChannelFilter(chKey); setFilterMode('all'); }}
                sx={{ px: 0.75, py: 0.5, borderRadius: 1, cursor: 'pointer', transition: 'all 0.15s',
                  border: isActive ? `2px solid ${NAVY}` : `1.5px solid ${isAll ? alpha(NAVY, 0.3) : alpha(NAVY, 0.15)}`,
                  bgcolor: isActive ? alpha(NAVY, 0.05) : isAll ? alpha(NAVY, 0.02) : 'white',
                  '&:hover': { borderColor: alpha(NAVY, 0.5), bgcolor: alpha(NAVY, 0.03) } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: NAVY }}>
                    {isAll ? '📊' : ch.channel === 'Email' ? '✉' : ch.channel === 'EDI' ? '⚡' : ch.channel === 'PDF' ? '📄' : '🌐'}{' '}{ch.count}
                  </Typography>
                  <Chip label={ch.label} size="small" sx={{ fontSize: '0.45rem', fontWeight: 700, height: 16, bgcolor: alpha(NAVY, 0.08), color: NAVY }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: 'text.secondary' }}>
                    ${ch.value >= 1000000 ? `${(ch.value / 1000000).toFixed(1)}M` : ch.value >= 1000 ? `${(ch.value / 1000).toFixed(0)}K` : ch.value.toFixed(0)}
                  </Typography>
                  {!isAll && <Typography sx={{ fontSize: '0.5rem', color: MUTED }}>({ch.pct}%)</Typography>}
                </Box>
                {/* Progress bar */}
                <Box sx={{ height: 3, borderRadius: 2, bgcolor: alpha(NAVY, 0.06), overflow: 'hidden', mb: 0.25 }}>
                  <Box sx={{ display: 'flex', height: '100%' }}>
                    <Box sx={{ width: `${ch.count > 0 ? (ch.ready / ch.count * 100) : 0}%`, bgcolor: GREEN }} />
                    <Box sx={{ width: `${ch.count > 0 ? (ch.review / ch.count * 100) : 0}%`, bgcolor: AMBER }} />
                    <Box sx={{ width: `${ch.count > 0 ? (ch.exc / ch.count * 100) : 0}%`, bgcolor: RED }} />
                  </Box>
                </Box>
                {/* Status dots */}
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                  <Typography sx={{ fontSize: '0.45rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.2, color: GREEN }}>
                    <Box component="span" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: GREEN, display: 'inline-block' }} />{ch.ready}READY
                  </Typography>
                  <Typography sx={{ fontSize: '0.45rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.2, color: AMBER }}>
                    <Box component="span" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: AMBER, display: 'inline-block' }} />{ch.review}REVIEW
                  </Typography>
                  <Typography sx={{ fontSize: '0.45rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.2, color: RED }}>
                    <Box component="span" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: RED, display: 'inline-block' }} />{ch.exc}EXC
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* ─── 3-Panel Layout ─── */}
      <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: `${leftCollapsed ? '40px' : '272px'} 1fr ${rightCollapsed ? '40px' : '312px'}`, overflow: 'hidden', transition: 'grid-template-columns 0.25s ease' }}>

        {/* ════════ LEFT: Order Queue ════════ */}
        <Box sx={{ borderRight: `1px solid ${BORDER}`, bgcolor: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {leftCollapsed ? (
            /* Collapsed: just a thin vertical bar with expand button */
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 1 }}>
              <MuiTooltip title="Expand order queue" placement="right">
                <IconButton size="small" onClick={() => setLeftCollapsed(false)} sx={{ color: NAVY, '&:hover': { bgcolor: alpha(NAVY, 0.08) } }}>
                  <ChevronRightIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </MuiTooltip>
              <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color: MUTED, writingMode: 'vertical-rl', mt: 1, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Orders</Typography>
            </Box>
          ) : (
          <>
          <Box sx={{ p: 1.5, borderBottom: `1px solid ${BORDER}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED }}>Incoming Orders</Typography>
              <MuiTooltip title="Collapse queue">
                <IconButton size="small" onClick={() => setLeftCollapsed(true)} sx={{ color: MUTED, p: 0.25, '&:hover': { color: NAVY } }}>
                  <ChevronLeftIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </MuiTooltip>
            </Box>
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
          </>
          )}
        </Box>

        {/* ════════ CENTER: Tabs Content ════════ */}
        <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#f8fafc' }}>
          {/* Order bar — compact single line */}
          {o && (
            <Box sx={{ bgcolor: 'white', borderBottom: `1px solid ${BORDER}`, px: 2, py: 0.5, display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>{o.customer}</Typography>
              <Typography sx={{ fontSize: '0.6rem', color: MUTED }}>{o.soldTo} · {o.lines} lines</Typography>
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label={o.poNumber} size="small" sx={{ fontSize: '0.55rem', fontWeight: 600, height: 18, bgcolor: '#f1f5f9', border: `1px solid ${BORDER}` }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: NAVY }}>{fmt(o.amount)}</Typography>
                <Chip label={o.status} size="small" sx={{ fontSize: '0.5rem', fontWeight: 700, height: 18, textTransform: 'uppercase', bgcolor: statusBg[o.status], color: statusColor[o.status] }} />
              </Box>
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
              /* ═══ TAB 0: PO Extraction — Side-by-Side (PDF | Extracted Fields) ═══ */
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, height: '100%' }}>
                {/* ── LEFT: PDF Preview ── */}
                <Box sx={{ borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  {(() => {
                    const pdfs = o.pdfFiles || [{ label: o.poNumber, path: o.pdfFile }];
                    const currentPdf = pdfs[activePdfIdx] || pdfs[0];
                    return (
                      <>
                        {/* PDF header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 0.75, bgcolor: '#e2e8f0', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PdfIcon sx={{ fontSize: 16, color: '#dc2626' }} />
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#334155' }}>{o.poNumber} — {o.customer}</Typography>
                            <Chip label={`${pdfs.length} doc`} size="small" sx={{ fontSize: '0.5rem', fontWeight: 600, height: 18, bgcolor: alpha(NAVY, 0.1), color: NAVY }} />
                          </Stack>
                          <MuiTooltip title="Open in new tab">
                            <IconButton size="small" onClick={() => window.open(currentPdf.path, '_blank')} sx={{ color: '#64748b' }}>
                              <OpenInNewIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </MuiTooltip>
                        </Box>
                        {/* PDF tab selector */}
                        {pdfs.length > 1 && (
                          <Box sx={{ display: 'flex', gap: 0.5, px: 1.5, py: 0.5, bgcolor: '#f1f5f9', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
                            {pdfs.map((pdf, idx) => (
                              <Chip key={idx} label={pdf.label} size="small" onClick={() => setActivePdfIdx(idx)}
                                sx={{ fontSize: '0.55rem', fontWeight: activePdfIdx === idx ? 700 : 500, height: 20, cursor: 'pointer',
                                  bgcolor: activePdfIdx === idx ? alpha(NAVY, 0.15) : 'transparent', color: activePdfIdx === idx ? NAVY : MUTED,
                                  border: activePdfIdx === idx ? `1px solid ${alpha(NAVY, 0.3)}` : '1px solid transparent', '&:hover': { bgcolor: alpha(NAVY, 0.08) },
                                }} />
                            ))}
                          </Box>
                        )}
                        {/* PDF iframe — fills remaining height */}
                        <Box sx={{ flex: 1, position: 'relative', minHeight: 0 }}>
                          <iframe src={`${currentPdf.path}#toolbar=0&navpanes=0&scrollbar=0`} title={`${currentPdf.label} preview`}
                            style={{ width: '100%', height: '100%', border: 'none' }} />
                        </Box>
                      </>
                    );
                  })()}
                </Box>

                {/* ── RIGHT: Extracted Fields ── */}
                <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  {/* Scrollable extraction table */}
                  <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    {/* Combined sticky header: terminal dots + column headers */}
                    <Box sx={{ position: 'sticky', top: 0, zIndex: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.5, bgcolor: '#f1f5f9', borderBottom: `1px solid ${BORDER}` }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f87171' }} />
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#fbbf24' }} />
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#34d399' }} />
                        <Typography sx={{ fontSize: '0.55rem', color: MUTED, ml: 0.5 }}>AI Extraction · {o.channel} Channel</Typography>
                      </Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '140px 1fr', px: 1.5, py: 0.5, bgcolor: '#f0f4f8', borderBottom: `2px solid ${NAVY}` }}>
                        {['Field', 'Extracted Value'].map(h => (
                          <Typography key={h} sx={{ fontSize: '0.6rem', fontWeight: 700, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{h}</Typography>
                        ))}
                      </Box>
                    </Box>

                    {/* Header field rows */}
                    {o.hdr.map((f, i) => (
                      <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '140px 1fr', px: 1.5, py: 0.9, alignItems: 'center', borderBottom: `1px solid ${BORDER}`, bgcolor: i % 2 === 0 ? 'transparent' : alpha(NAVY, 0.015), '&:hover': { bgcolor: alpha(NAVY, 0.04) } }}>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary' }}>{f.lbl}</Typography>
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: f.conf === 0 ? MUTED : 'text.primary' }}>{f.val}</Typography>
                      </Box>
                    ))}

                    {/* Line Items section */}
                    <Box sx={{ px: 1.5, py: 1, bgcolor: alpha(NAVY, 0.03), borderBottom: `1px solid ${BORDER}` }}>
                      <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: NAVY }}>Line Items</Typography>
                    </Box>
                    {o.items.map((item, idx) => {
                      const key = `${o.id}-${idx}`;
                      const expanded = expandedItems[key];
                      const avgConf = Math.round([item.confMat, item.confQty, item.confPrice, item.confDate].filter(v => v > 0).reduce((a, b) => a + b, 0) / [item.confMat, item.confQty, item.confPrice, item.confDate].filter(v => v > 0).length || 1);
                      const hasLow = [item.confMat, item.confQty, item.confPrice, item.confDate].some(c => c < 70);
                      return (
                        <Box key={key}>
                          <Box onClick={() => toggleItem(key)} sx={{ px: 1.5, py: 0.8, cursor: 'pointer', bgcolor: alpha(NAVY, 0.02), borderBottom: `1px solid ${BORDER}`, '&:hover': { bgcolor: alpha(NAVY, 0.05) } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip label={`Line ${item.line}`} size="small" sx={{ fontSize: '0.55rem', fontWeight: 700, height: 18, bgcolor: alpha(NAVY, 0.1), color: NAVY }} />
                              <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>{item.custSku}</Typography>
                              <Typography sx={{ fontSize: '0.6rem', color: MUTED }}>→ {item.sapMat}</Typography>
                              <Typography sx={{ fontSize: '0.6rem', color: MUTED, ml: 'auto' }}>{item.qty} {item.uom} · ${item.price}</Typography>
                              {hasLow && <WarningIcon sx={{ fontSize: 12, color: AMBER }} />}
                              {expanded ? <ExpandLessIcon sx={{ fontSize: 14, color: MUTED }} /> : <ExpandMoreIcon sx={{ fontSize: 14, color: MUTED }} />}
                            </Box>
                          </Box>
                          <Collapse in={expanded}>
                            {[
                              { lbl: 'SAP Material', val: item.sapMat },
                              { lbl: 'Qty / UOM', val: `${item.qty} ${item.uom}` },
                              { lbl: 'Unit Price', val: `$${item.price}` },
                              { lbl: 'Req. Delivery', val: item.reqDate },
                            ].map((f, fi) => (
                              <Box key={fi} sx={{ display: 'grid', gridTemplateColumns: '140px 1fr', px: 1.5, py: 0.7, alignItems: 'center', borderBottom: `1px solid ${BORDER}`, bgcolor: '#fafbfc', '&:hover': { bgcolor: alpha(NAVY, 0.03) } }}>
                                <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: 'text.secondary' }}>{f.lbl}</Typography>
                                <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.primary' }}>{f.val}</Typography>
                              </Box>
                            ))}
                            {item.insight && (
                              <Box sx={{ px: 1.5, py: 1 }}>
                                <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha(NAVY, 0.04), border: `1px solid ${alpha(NAVY, 0.1)}` }}>
                                  <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, color: NAVY, mb: 0.2 }}>Ordly AI Insight</Typography>
                                  <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', lineHeight: 1.5 }}>{item.insight}</Typography>
                                </Box>
                              </Box>
                            )}
                          </Collapse>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
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
              (() => {
                // Compute effective decision based on user plant selections
                // Check if user actually selected a DIFFERENT plant from AI's recommendation
                const hasOverrides = o.items.some((item, idx) => {
                  const key = `${o.id}-${idx}`;
                  const userPick = plantSelections[key];
                  if (!userPick) return false;
                  const aiRec = item.plantOptions?.find(p => p.selected);
                  return aiRec && userPick !== aiRec.code;
                });
                const getSelectedPlant = (item, idx) => {
                  const key = `${o.id}-${idx}`;
                  const overrideCode = plantSelections[key];
                  if (overrideCode && item.plantOptions) {
                    return item.plantOptions.find(p => p.code === overrideCode) || item.plantOptions.find(p => p.selected);
                  }
                  return item.plantOptions ? item.plantOptions.find(p => p.selected) : null;
                };

                // Recalculate scores from selected plants
                let effScores = { ...o.decision.scores };
                let effScore = o.decision.score;
                let effPlant = o.decision.plant;
                let effRec = o.decision.rec;
                let effMode = o.decision.mode;
                let effQty = o.decision.confirmedQty;
                let effDate = o.decision.confirmedDate;
                let effGM = o.decision.gm;

                if (hasOverrides) {
                  const selectedPlants = o.items.map((item, idx) => getSelectedPlant(item, idx)).filter(Boolean);
                  if (selectedPlants.length > 0) {
                    const avgPlantScore = Math.round(selectedPlants.reduce((s, p) => s + (p.score || 0), 0) / selectedPlants.length);
                    const allOnTime = selectedPlants.every(p => p.onTime);
                    const hasDisq = selectedPlants.some(p => p.disq);
                    const totalFreight = selectedPlants.reduce((s, p) => s + (p.freightCost || 0), 0);
                    const plantCodes = [...new Set(selectedPlants.map(p => p.code))];
                    const plantNames = [...new Set(selectedPlants.map(p => `${p.code} — ${p.name}`))];

                    effPlant = plantNames.join(' + ');
                    effScore = hasDisq ? Math.min(avgPlantScore, 25) : avgPlantScore;
                    effMode = plantCodes.length > 1 ? 'Multi-Plant Split' : 'Single Plant';
                    effDate = selectedPlants.map(p => p.arrivalDate).join(' / ');
                    effRec = hasDisq ? 'Exception — Disqualified Plant Selected' : effScore >= 80 ? 'Auto-Create Sales Order' : effScore >= 60 ? 'Human Review Required' : 'Exception — Manual Review';

                    // Adjust component scores based on selection
                    effScores = {
                      'Service Level': Math.min(100, Math.round(allOnTime ? avgPlantScore + 5 : avgPlantScore - 15)),
                      'Margin Impact': Math.min(100, Math.round(avgPlantScore - (totalFreight > 5000 ? 15 : totalFreight > 2000 ? 8 : 0))),
                      'Customer Value': o.decision.scores['Customer Value'],
                      'Lead Time': Math.min(100, Math.round(allOnTime ? avgPlantScore + 3 : avgPlantScore - 20)),
                      'Inventory Health': Math.min(100, Math.round(selectedPlants.every(p => p.atp > 0) ? avgPlantScore + 5 : avgPlantScore - 25)),
                      'AR / Credit Risk': o.decision.scores['AR / Credit Risk'],
                    };
                  }
                }

                const isUserOverride = hasOverrides;

                return (
                <Box>
                  {/* ── AI Recommendation Hero ── */}
                  <Paper sx={{ p: 2, mb: 2, borderRadius: 2, background: `linear-gradient(135deg, ${NAVY_DARK} 0%, ${NAVY} 50%, ${NAVY_LIGHT} 100%)`, color: 'white' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ScoreRing value={effScore} />
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.5 }}>
                          <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>
                            {isUserOverride ? 'Updated Recommendation' : 'AI Recommendation'}
                          </Typography>
                          {isUserOverride && (
                            <Chip label="USER OVERRIDE" size="small"
                              sx={{ fontSize: '0.45rem', fontWeight: 700, height: 16, bgcolor: alpha(AMBER, 0.25), color: '#fbbf24', border: '1px solid rgba(251,191,36,0.4)' }} />
                          )}
                          {!isUserOverride && (
                            <Chip label="ORDLY AI" size="small"
                              sx={{ fontSize: '0.45rem', fontWeight: 700, height: 16, bgcolor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }} />
                          )}
                        </Stack>
                        <Typography sx={{ fontSize: '1rem', fontWeight: 700, mb: 0.5 }}>{effRec}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', opacity: 0.7, mb: 1 }}>{effPlant} · {effMode}</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {[
                            { lbl: 'Confirmed Qty', val: effQty },
                            { lbl: 'Confirm Date', val: effDate },
                            { lbl: 'Gross Margin', val: effGM },
                          ].map(b => (
                            <Chip key={b.lbl} label={`${b.lbl}: ${b.val}`} size="small"
                              sx={{ fontSize: '0.6rem', fontWeight: 600, height: 22, bgcolor: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} />
                          ))}
                        </Stack>
                      </Box>
                    </Box>
                    {/* Show original AI rec when user has overridden */}
                    {isUserOverride && (
                      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ fontSize: '0.55rem', opacity: 0.5, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>AI Original:</Typography>
                        <Typography sx={{ fontSize: '0.6rem', opacity: 0.6 }}>Score {o.decision.score} · {o.decision.rec} · {o.decision.plant}</Typography>
                        <Button size="small" onClick={() => setPlantSelections({})}
                          sx={{ fontSize: '0.5rem', fontWeight: 700, color: '#fbbf24', textTransform: 'none', minWidth: 0, ml: 'auto', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}>
                          Reset to AI
                        </Button>
                      </Box>
                    )}
                  </Paper>

                  {/* IBP Intelligence */}
                  <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: 1, bgcolor: alpha(PURPLE, 0.04), borderColor: alpha(PURPLE, 0.15) }}>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', color: PURPLE, mb: 0.5 }}>IBP Intelligence</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', lineHeight: 1.5 }}>{o.decision.ibpSignal}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: PURPLE, mt: 0.5 }}>{o.decision.ibpLead}</Typography>
                  </Paper>

                  {/* ── Plant Selection ── */}
                  <Box sx={{ p: 1.2, mb: 1.5, borderRadius: 1, bgcolor: alpha(NAVY, 0.03), border: `1px solid ${alpha(NAVY, 0.1)}` }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: NAVY, mb: 0.3 }}>Fulfillment — Plant Selection</Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: MUTED, lineHeight: 1.4 }}>
                      Ordly AI recommends the optimal plant per line (marked <span style={{ color: NAVY, fontWeight: 700 }}>AI REC</span>). You can override by clicking an alternate plant — scores and recommendation will update automatically.
                    </Typography>
                  </Box>
                  {o.items.map((item, idx) => {
                    const key = `${o.id}-${idx}`;
                    const currentSelection = plantSelections[key];
                    return (
                      <Box key={idx} sx={{ mb: 2 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: NAVY, mb: 1 }}>Line {item.line}: {item.custSku}</Typography>
                        {item.plantOptions ? item.plantOptions.map((p, pi) => {
                          const isAiRec = p.selected; // original AI recommendation
                          const isSelected = currentSelection ? currentSelection === p.code : p.selected;
                          const isUserPick = currentSelection && currentSelection === p.code && !p.selected; // user chose differently from AI
                          const isClickable = !p.disq;
                          return (
                            <Box key={pi}
                              onClick={() => {
                                if (!isClickable) return;
                                setPlantSelections(prev => ({ ...prev, [key]: p.code }));
                              }}
                              sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, mb: 0.5, borderRadius: 1,
                                cursor: isClickable ? 'pointer' : 'not-allowed',
                                border: `1.5px solid ${isSelected ? alpha(GREEN, 0.5) : p.disq ? alpha(RED, 0.2) : BORDER}`,
                                bgcolor: isSelected ? alpha(GREEN, 0.04) : p.disq ? alpha(RED, 0.02) : 'white',
                                borderStyle: p.disq ? 'dashed' : 'solid',
                                transition: 'all 0.2s',
                                '&:hover': isClickable ? { borderColor: alpha(GREEN, 0.6), bgcolor: alpha(GREEN, 0.06), transform: 'translateX(2px)' } : {},
                              }}>
                              <Box sx={{ flex: 1 }}>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700 }}>{p.code} — {p.name}</Typography>
                                  {isAiRec && (
                                    <Chip label="AI REC" size="small"
                                      sx={{ fontSize: '0.4rem', fontWeight: 800, height: 14, bgcolor: alpha(NAVY, 0.12), color: NAVY, letterSpacing: '0.05em' }} />
                                  )}
                                  {isUserPick && (
                                    <Chip label="YOUR PICK" size="small"
                                      sx={{ fontSize: '0.4rem', fontWeight: 800, height: 14, bgcolor: alpha(AMBER, 0.15), color: AMBER, letterSpacing: '0.05em' }} />
                                  )}
                                </Stack>
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
                              {isSelected && <CheckCircleIcon sx={{ fontSize: 16, color: GREEN }} />}
                            </Box>
                          );
                        }) : (
                          <Typography sx={{ fontSize: '0.65rem', color: MUTED, fontStyle: 'italic' }}>No plant options — material unresolved</Typography>
                        )}
                      </Box>
                    );
                  })}

                  {/* Score Components */}
                  <Typography sx={sectionTitle}>Score Components {isUserOverride ? '(recalculated)' : ''}</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                    {Object.entries(effScores).map(([label, val]) => (
                      <Box key={label} sx={{ p: 1, borderRadius: 1, border: `1px solid ${BORDER}`, bgcolor: 'white' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary' }}>{label}</Typography>
                          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: confColor(val) }}>{val}</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={val} sx={{ height: 4, borderRadius: 2,
                          bgcolor: alpha(confColor(val), 0.1), '& .MuiLinearProgress-bar': { bgcolor: confColor(val), borderRadius: 2, transition: 'transform 0.5s ease' } }} />
                      </Box>
                    ))}
                  </Box>
                </Box>
                );
              })()
            )}
          </Box>
        </Box>

        {/* ════════ RIGHT: Sales Order Preview ════════ */}
        <Box sx={{ borderLeft: `1px solid ${BORDER}`, bgcolor: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {rightCollapsed ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 1 }}>
              <MuiTooltip title="Expand SO preview" placement="left">
                <IconButton size="small" onClick={() => setRightCollapsed(false)} sx={{ color: NAVY, '&:hover': { bgcolor: alpha(NAVY, 0.08) } }}>
                  <ChevronLeftIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </MuiTooltip>
              <Typography sx={{ fontSize: '0.5rem', fontWeight: 700, color: MUTED, writingMode: 'vertical-rl', mt: 1, letterSpacing: '0.1em', textTransform: 'uppercase' }}>SO Preview</Typography>
            </Box>
          ) : (
          <>
          <Box sx={{ p: 1.5, borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Sales Order Preview</Typography>
              <Typography sx={{ fontSize: '0.6rem', color: MUTED }}>BAPI_SALESORDER_CREATEFROMDAT2</Typography>
            </Box>
            <MuiTooltip title="Collapse preview">
              <IconButton size="small" onClick={() => setRightCollapsed(true)} sx={{ color: MUTED, p: 0.25, '&:hover': { color: NAVY } }}>
                <ChevronRightIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </MuiTooltip>
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
                {Object.keys(soEdits).length > 0 && (
                  <Chip label={`${Object.keys(soEdits).length} field(s) edited`} size="small" icon={<EditIcon sx={{ fontSize: 12 }} />}
                    sx={{ mb: 1, fontSize: '0.55rem', fontWeight: 600, height: 20, bgcolor: alpha(AMBER, 0.1), color: AMBER, border: `1px solid ${alpha(AMBER, 0.3)}` }} />
                )}
                <Typography sx={sectionTitle}>VBAK — Order Header</Typography>
                {(() => {
                  // Build friendly sub-labels from order data
                  const shipToAddr = o.hdr.find(h => h.lbl === 'Ship-To Address')?.val || '';
                  const friendlyMap = {
                    'Order Type': 'Standard Order',
                    'Sales Org': 'Loparex LLC',
                    'Dist. Channel': 'Direct Sales',
                    'Division': 'Cross-Division',
                    'Sold-To': o.customer,
                    'Ship-To': shipToAddr.length > 40 ? shipToAddr.substring(0, 40) + '...' : shipToAddr,
                    'Customer PO': o.hdr.find(h => h.lbl === 'PO Date')?.val || '',
                    'Req. Date': o.hdr.find(h => h.lbl === 'Delivery Instructions')?.val?.substring(0, 45) || '',
                  };
                  return (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, mb: 2 }}>
                  {o.soHeader.map((f, i) => {
                    const editKey = `hdr-${i}`;
                    const isEditing = editingField === editKey;
                    const editedVal = soEdits[editKey];
                    const displayVal = editedVal !== undefined ? editedVal : f.val;
                    const wasEdited = editedVal !== undefined;
                    const friendlyLabel = friendlyMap[f.lbl] || '';
                    return (
                      <Box key={i} sx={{ py: 0.5, px: 0.5, borderRadius: 0.5, cursor: 'pointer', transition: 'all 0.15s',
                        bgcolor: wasEdited ? alpha(AMBER, 0.04) : 'transparent',
                        '&:hover': { bgcolor: alpha(NAVY, 0.04) },
                      }}
                        onClick={() => { if (!isEditing) setEditingField(editKey); }}>
                        <Typography sx={{ fontSize: '0.5rem', color: MUTED, textTransform: 'uppercase' }}>{f.lbl}</Typography>
                        {isEditing ? (
                          <TextField size="small" autoFocus fullWidth defaultValue={displayVal}
                            onBlur={(e) => {
                              const newVal = e.target.value.trim();
                              if (newVal && newVal !== f.val) {
                                setSoEdits(prev => ({ ...prev, [editKey]: newVal }));
                                showToast(`${f.lbl} updated to "${newVal}"`, 'info');
                              } else if (newVal === f.val) {
                                setSoEdits(prev => { const n = { ...prev }; delete n[editKey]; return n; });
                              }
                              setEditingField(null);
                            }}
                            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditingField(null); }}
                            sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.7rem', fontWeight: 600, height: 24 } }}
                          />
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: wasEdited ? AMBER : 'text.primary' }}>{displayVal}</Typography>
                            {wasEdited && <EditIcon sx={{ fontSize: 10, color: AMBER }} />}
                          </Box>
                        )}
                        {friendlyLabel && <Typography sx={{ fontSize: '0.45rem', color: 'text.secondary', lineHeight: 1.3, mt: 0.2 }}>{friendlyLabel}</Typography>}
                      </Box>
                    );
                  })}
                </Box>
                  );
                })()}

                <Typography sx={sectionTitle}>VBAP / VBEP — Line Items</Typography>
                {o.soItems.map((item, i) => {
                  const qtyKey = `item-${i}-qty`;
                  const priceKey = `item-${i}-price`;
                  const dateKey = `item-${i}-date`;
                  const plantKey = `item-${i}-plant`;
                  const effQty = soEdits[qtyKey] !== undefined ? parseFloat(soEdits[qtyKey]) : item.qty;
                  const effPrice = soEdits[priceKey] !== undefined ? parseFloat(soEdits[priceKey]) : item.price;
                  const effDate = soEdits[dateKey] !== undefined ? soEdits[dateKey] : item.date;
                  const effPlant = soEdits[plantKey] !== undefined ? soEdits[plantKey] : item.plant;

                  const renderEditableField = (key, label, value, width = 60) => {
                    const isEditing = editingField === key;
                    const wasEdited = soEdits[key] !== undefined;
                    return isEditing ? (
                      <TextField size="small" autoFocus defaultValue={value}
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          if (v && v !== String(value)) { setSoEdits(prev => ({ ...prev, [key]: v })); showToast(`${label} updated`, 'info'); }
                          setEditingField(null);
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditingField(null); }}
                        sx={{ width, '& .MuiOutlinedInput-root': { fontSize: '0.6rem', fontWeight: 600, height: 20 } }}
                      />
                    ) : (
                      <Typography component="span" onClick={(e) => { e.stopPropagation(); setEditingField(key); }}
                        sx={{ fontSize: '0.6rem', color: wasEdited ? AMBER : MUTED, cursor: 'pointer', borderBottom: `1px dashed ${wasEdited ? AMBER : 'transparent'}`,
                          '&:hover': { borderBottomColor: NAVY, color: NAVY } }}>
                        {value}{wasEdited && <EditIcon sx={{ fontSize: 8, ml: 0.3, verticalAlign: 'middle', color: AMBER }} />}
                      </Typography>
                    );
                  };

                  return (
                    <Box key={i} sx={{ pl: 1.5, py: 1, mb: 0.5, bgcolor: alpha(NAVY, 0.02), borderRadius: 1, borderLeft: `3px solid ${alpha(NAVY, 0.3)}` }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: NAVY }}>Line {item.line}: {item.mat}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 600 }}>{fmt(effQty * effPrice)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 0.3 }}>
                        {renderEditableField(plantKey, 'Plant', effPlant, 50)}
                        <Typography sx={{ fontSize: '0.6rem', color: MUTED }}>·</Typography>
                        {renderEditableField(dateKey, 'Date', effDate, 80)}
                        <Typography sx={{ fontSize: '0.6rem', color: MUTED }}>·</Typography>
                        {renderEditableField(qtyKey, 'Qty', effQty, 60)}
                        <Typography sx={{ fontSize: '0.6rem', color: MUTED }}>EA ·</Typography>
                        <Typography sx={{ fontSize: '0.6rem', color: MUTED }}>$</Typography>
                        {renderEditableField(priceKey, 'Price', effPrice, 60)}
                        <Typography sx={{ fontSize: '0.6rem', color: MUTED }}>/EA</Typography>
                      </Box>
                    </Box>
                  );
                })}

                <Box sx={{ mt: 2, p: 1.2, bgcolor: alpha(NAVY, 0.04), borderRadius: 1, border: `1px solid ${alpha(NAVY, 0.1)}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700 }}>Order Total</Typography>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: NAVY }}>{fmt(o.soItems.reduce((s, item, i) => {
                      const q = soEdits[`item-${i}-qty`] !== undefined ? parseFloat(soEdits[`item-${i}-qty`]) : item.qty;
                      const p = soEdits[`item-${i}-price`] !== undefined ? parseFloat(soEdits[`item-${i}-price`]) : item.price;
                      return s + q * p;
                    }, 0))}</Typography>
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
                  sx={{ textTransform: 'none', fontSize: '0.7rem', color: RED, border: `1px solid ${alpha(RED, 0.3)}` }}>Route to Exception</Button>
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
          </>
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
