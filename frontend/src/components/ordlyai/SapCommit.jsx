import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Avatar,
  Chip,
  Paper,
  Grid,
  alpha,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Verified as VerifiedIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon,
  Terminal as TerminalIcon,
  HelpOutline as HelpIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  LocalShipping as ShippingIcon,
  Route as RouteIcon,
  CreditCard as CreditCardIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  Check as CheckIcon,
  Factory as FactoryIcon,
  Flag as FlagIcon,
  Refresh as RefreshIcon,
  NavigateNext as NavigateNextIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

// Theme colors
const PRIMARY_BLUE = '#0854a0';
const ACCENT_BLUE = '#1976d2';
const SAP_BLUE = '#3b82f6';
const SUCCESS_GREEN = '#059669';
const WARNING_AMBER = '#d97706';
const ERROR_RED = '#dc2626';
const CYAN = '#22d3ee';
const PURPLE = '#a855f7';

// Sample data for the list view
const sapCommitData = [
  {
    id: 1,
    orderPo: 'EDI-850-78432',
    customer: 'Walmart Distribution',
    material: 'SKU-7742 Energy Drink 12-Pack',
    orderValue: 247500,
    salesOrders: ['SO-78234501', 'SO-78234502'],
    confirmedDate: 'Jan 18',
    quantity: '15,000 CS',
    cycleTime: '8 min',
    validationPass: '100%',
    status: 'Committed',
  },
  {
    id: 2,
    orderPo: 'EDI-850-78456',
    customer: 'Target Corp',
    material: 'SKU-4421 Sports Drink 6-Pack',
    orderValue: 156800,
    salesOrders: ['SO-78234510'],
    confirmedDate: 'Jan 19',
    quantity: '8,500 CS',
    cycleTime: '5 min',
    validationPass: '100%',
    status: 'Committed',
  },
  {
    id: 3,
    orderPo: 'EDI-850-78489',
    customer: 'Kroger Co',
    material: 'SKU-2234 Vitamin Water 12-Pack',
    orderValue: 89200,
    salesOrders: ['SO-78234515'],
    confirmedDate: 'Jan 20',
    quantity: '4,200 CS',
    cycleTime: '4 min',
    validationPass: '100%',
    status: 'Committed',
  },
  {
    id: 4,
    orderPo: 'EDI-850-78501',
    customer: 'Safeway Inc',
    material: 'SKU-5567 Electrolyte Mix 18-Pack',
    orderValue: 178300,
    salesOrders: ['SO-78234520', 'SO-78234521'],
    confirmedDate: 'Jan 21',
    quantity: '9,800 CS',
    cycleTime: '7 min',
    validationPass: '100%',
    status: 'Committed',
  },
  {
    id: 5,
    orderPo: 'EDI-850-78412',
    customer: 'Costco Wholesale',
    material: 'SKU-8812 Protein Shake 24-Pack',
    orderValue: 312400,
    salesOrders: [],
    confirmedDate: '-',
    quantity: '12,500 CS',
    cycleTime: '-',
    validationPass: '87%',
    status: 'Validation Failed',
  },
];

// Flow stages
const flowStages = [
  { label: 'Demand Signal', step: 0 },
  { label: 'Network Optimizer', step: 1 },
  { label: 'Arbitration', step: 2 },
  { label: 'SAP Commit', step: 3 },
  { label: 'Learning Loop', step: 4 },
];

const SapCommit = ({ onBack }) => {
  const [selectedRow, setSelectedRow] = useState(null);

  const handleRowClick = (params) => {
    setSelectedRow(params.row);
  };

  const handleBackToList = () => {
    setSelectedRow(null);
  };

  const columns = [
    {
      field: 'orderPo',
      headerName: 'Order PO',
      width: 140,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, color: ACCENT_BLUE, fontSize: '0.8rem' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'customer',
      headerName: 'Customer',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{params.value}</Typography>
      ),
    },
    {
      field: 'salesOrders',
      headerName: 'SAP Sales Orders',
      width: 180,
      renderCell: (params) => {
        const orders = params.value || [];
        if (orders.length === 0) return <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>-</Typography>;
        return (
          <Stack direction="row" spacing={0.5}>
            {orders.map((so, idx) => (
              <Chip
                key={idx}
                label={so}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  bgcolor: alpha(SAP_BLUE, 0.1),
                  color: SAP_BLUE,
                }}
              />
            ))}
          </Stack>
        );
      },
    },
    {
      field: 'orderValue',
      headerName: 'Value',
      width: 100,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: SUCCESS_GREEN, fontSize: '0.8rem' }}>
          ${(params.value / 1000).toFixed(0)}K
        </Typography>
      ),
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.75rem', color: CYAN, fontWeight: 600 }}>{params.value}</Typography>
      ),
    },
    {
      field: 'confirmedDate',
      headerName: 'Confirmed',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.75rem', color: params.value === '-' ? 'text.secondary' : SUCCESS_GREEN, fontWeight: 600 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'cycleTime',
      headerName: 'Cycle',
      width: 70,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{params.value}</Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const isCommitted = params.value === 'Committed';
        return (
          <Chip
            icon={isCommitted ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : undefined}
            label={params.value}
            size="small"
            sx={{
              height: 24,
              fontSize: '0.7rem',
              fontWeight: 600,
              bgcolor: alpha(isCommitted ? SUCCESS_GREEN : ERROR_RED, 0.1),
              color: isCommitted ? SUCCESS_GREEN : ERROR_RED,
              '& .MuiChip-icon': { color: isCommitted ? SUCCESS_GREEN : ERROR_RED },
            }}
          />
        );
      },
    },
  ];

  // Detail view
  if (selectedRow && selectedRow.status === 'Committed') {
    return (
      <Box sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
        {/* Header Bar */}
        <Paper variant="outlined" sx={{ mb: 2, p: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBackToList}
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                Back
              </Button>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: CYAN }}>
                {selectedRow.orderPo}
              </Typography>
              <Typography sx={{ color: 'text.primary', fontSize: '0.9rem' }}>
                {selectedRow.customer}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                {selectedRow.material}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontWeight: 700, color: SUCCESS_GREEN, fontSize: '1.1rem' }}>
                  ${selectedRow.orderValue.toLocaleString()}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Order Value</Typography>
              </Box>
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                label="COMMITTED"
                sx={{
                  bgcolor: alpha(SUCCESS_GREEN, 0.15),
                  color: SUCCESS_GREEN,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              />
            </Stack>
          </Stack>
        </Paper>

        {/* Flow Indicator */}
        <Paper variant="outlined" sx={{ mb: 2, p: 1.5 }}>
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            {flowStages.map((stage, index) => (
              <React.Fragment key={stage.step}>
                <Chip
                  icon={stage.step < 3 ? <CheckIcon sx={{ fontSize: '14px !important' }} /> : undefined}
                  label={stage.label}
                  size="small"
                  sx={{
                    bgcolor: stage.step < 3 ? alpha(SUCCESS_GREEN, 0.1) : stage.step === 3 ? alpha(SAP_BLUE, 0.15) : alpha('#64748b', 0.1),
                    color: stage.step < 3 ? SUCCESS_GREEN : stage.step === 3 ? SAP_BLUE : 'text.secondary',
                    fontWeight: stage.step === 3 ? 600 : 400,
                    border: stage.step === 3 ? `1px solid ${alpha(SAP_BLUE, 0.3)}` : 'none',
                    fontSize: '0.7rem',
                    '& .MuiChip-icon': { color: 'inherit' },
                  }}
                />
                {index < flowStages.length - 1 && (
                  <ArrowForwardIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                )}
              </React.Fragment>
            ))}
          </Stack>
        </Paper>

        {/* Success Banner */}
        <Paper
          sx={{
            mb: 2,
            p: 2,
            bgcolor: alpha(SUCCESS_GREEN, 0.05),
            border: `1px solid ${alpha(SUCCESS_GREEN, 0.3)}`,
            borderRadius: 2,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
            <CheckCircleIcon sx={{ fontSize: 28, color: SUCCESS_GREEN }} />
            <Typography sx={{ fontWeight: 600, color: SUCCESS_GREEN, fontSize: '0.95rem' }}>
              SAP Commit Successful — {selectedRow.salesOrders.length > 1 ? 'Split Shipment Created' : 'Order Created'}
            </Typography>
            <Stack direction="row" spacing={1}>
              {selectedRow.salesOrders.map((so, idx) => (
                <Chip
                  key={idx}
                  label={so}
                  sx={{
                    bgcolor: alpha(SAP_BLUE, 0.1),
                    color: SAP_BLUE,
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                />
              ))}
            </Stack>
          </Stack>
        </Paper>

        {/* Summary Strip */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {[
            { label: 'Sales Orders', value: selectedRow.salesOrders.length.toString(), color: SAP_BLUE },
            { label: 'Confirmed Date', value: selectedRow.confirmedDate, color: SUCCESS_GREEN },
            { label: 'Total Quantity', value: selectedRow.quantity, color: CYAN },
            { label: 'Cycle Time', value: selectedRow.cycleTime, color: SUCCESS_GREEN },
            { label: 'Validation Pass', value: selectedRow.validationPass, color: SUCCESS_GREEN },
          ].map((item, index) => (
            <Grid item xs={2.4} key={index}>
              <Card variant="outlined" sx={{ textAlign: 'center', py: 1.5 }}>
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: item.color }}>
                  {item.value}
                </Typography>
                <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', textTransform: 'uppercase' }}>
                  {item.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Main Content - Two Panels */}
        <Grid container spacing={2}>
          {/* Left Panel - Pre-Commit Validation & SAP Documents */}
          <Grid item xs={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <VerifiedIcon sx={{ color: PRIMARY_BLUE }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Pre-Commit Validation & SAP Documents</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                      Deterministic execution with zero ambiguity
                    </Typography>
                  </Box>
                </Stack>

                {/* Validation Items */}
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: SUCCESS_GREEN }} /> Pre-Commit Validation (8/8 Passed)
                </Typography>
                <Stack spacing={0.5} sx={{ mb: 2 }}>
                  {[
                    { icon: PersonIcon, color: PRIMARY_BLUE, name: 'Customer Master - WMT-4521', status: 'VERIFIED' },
                    { icon: InventoryIcon, color: CYAN, name: 'Material Master - SKU-7742', status: 'VERIFIED' },
                    { icon: MoneyIcon, color: SUCCESS_GREEN, name: 'Pricing Condition - ZPR0', status: 'VERIFIED' },
                    { icon: AssessmentIcon, color: SAP_BLUE, name: 'ATP Check - Memphis 9K + Dallas 6K', status: 'CONFIRMED' },
                    { icon: ShippingIcon, color: WARNING_AMBER, name: 'Shipping Point - MEM-01, DAL-01', status: 'ASSIGNED' },
                    { icon: RouteIcon, color: PURPLE, name: 'Route Determination', status: 'CALCULATED' },
                    { icon: CreditCardIcon, color: ACCENT_BLUE, name: 'Credit Check - $4.2M Available', status: 'PASSED' },
                    { icon: AssignmentIcon, color: '#64748b', name: 'Incompletion Log', status: 'CLEAR' },
                  ].map((item, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <item.icon sx={{ fontSize: 16, color: item.color }} />
                      <Typography sx={{ flex: 1, fontSize: '0.75rem' }}>{item.name}</Typography>
                      <Chip
                        icon={<CheckIcon sx={{ fontSize: '14px !important' }} />}
                        label={item.status}
                        size="small"
                        sx={{
                          bgcolor: alpha(SUCCESS_GREEN, 0.1),
                          color: SUCCESS_GREEN,
                          fontWeight: 600,
                          fontSize: '0.6rem',
                          '& .MuiChip-icon': { color: 'inherit' },
                        }}
                      />
                    </Paper>
                  ))}
                </Stack>

                {/* SAP Sales Order Preview */}
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon sx={{ fontSize: 16, color: SAP_BLUE }} /> SAP Sales Order - Split Shipment
                </Typography>

                {[
                  {
                    so: 'SO-78234501',
                    node: 'Memphis DC',
                    fields: [
                      { code: 'AUART (Order Type)', value: 'ZOR - Standard' },
                      { code: 'VKORG (Sales Org)', value: '1000 - US Sales' },
                      { code: 'KUNNR (Sold-to)', value: 'WMT-4521' },
                      { code: 'KUNWE (Ship-to)', value: 'WMT-DC7-BEN' },
                      { code: 'MATNR (Material)', value: 'SKU-7742' },
                      { code: 'KWMENG (Quantity)', value: '9,000 CS' },
                      { code: 'WERKS (Plant)', value: 'MEM1 - Memphis' },
                      { code: 'NETWR (Net Value)', value: '$148,500.00' },
                    ],
                  },
                  {
                    so: 'SO-78234502',
                    node: 'Dallas DC',
                    fields: [
                      { code: 'AUART (Order Type)', value: 'ZOR - Standard' },
                      { code: 'VKORG (Sales Org)', value: '1000 - US Sales' },
                      { code: 'KUNNR (Sold-to)', value: 'WMT-4521' },
                      { code: 'KUNWE (Ship-to)', value: 'WMT-DC7-BEN' },
                      { code: 'MATNR (Material)', value: 'SKU-7742' },
                      { code: 'KWMENG (Quantity)', value: '6,000 CS' },
                      { code: 'WERKS (Plant)', value: 'DAL1 - Dallas' },
                      { code: 'NETWR (Net Value)', value: '$99,000.00' },
                    ],
                  },
                ].map((order, idx) => (
                  <Paper
                    key={idx}
                    sx={{
                      p: 1.5,
                      mb: 1.5,
                      bgcolor: alpha('#004785', 0.05),
                      border: `1px solid ${alpha('#004785', 0.2)}`,
                      borderRadius: 1,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Chip
                        label="SAP"
                        size="small"
                        sx={{
                          bgcolor: 'linear-gradient(135deg, #004785 0%, #003366 100%)',
                          background: 'linear-gradient(135deg, #004785 0%, #003366 100%)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          height: 20,
                        }}
                      />
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{order.so} — {order.node} Fulfillment</Typography>
                    </Stack>
                    <Chip
                      icon={<FactoryIcon sx={{ fontSize: '14px !important' }} />}
                      label={`Node ${idx + 1}: ${order.node}`}
                      size="small"
                      sx={{
                        mb: 1,
                        bgcolor: alpha(PURPLE, 0.1),
                        color: PURPLE,
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        '& .MuiChip-icon': { color: 'inherit' },
                      }}
                    />
                    <Grid container spacing={1}>
                      {order.fields.map((field, fIdx) => (
                        <Grid item xs={6} key={fIdx}>
                          <Paper variant="outlined" sx={{ p: 0.75 }}>
                            <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', fontFamily: 'monospace' }}>{field.code}</Typography>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{field.value}</Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Panel - Decision Lineage & Audit Trail */}
          <Grid item xs={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <TimelineIcon sx={{ color: PRIMARY_BLUE }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Decision Lineage & Audit Trail</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                      Complete traceability from EDI to SAP commit
                    </Typography>
                  </Box>
                </Stack>

                {/* Decision Timeline */}
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <FlagIcon sx={{ fontSize: 16, color: SAP_BLUE }} /> Decision Trace
                </Typography>
                <Box sx={{ position: 'relative', pl: 3, mb: 2 }}>
                  <Box sx={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, bgcolor: alpha(SAP_BLUE, 0.3) }} />
                  {[
                    { title: '1. Demand Signal Received', detail: 'EDI 850 from Walmart Distribution\n15,000 CS SKU-7742 • MABD: Jan 20', time: 'Jan 12, 2025 09:42:18 CST' },
                    { title: '2. Volatility Classified: PROMO (78%)', detail: '3.2x normal volume • $225K penalty exposure\nHidden constraints: Ship complete, dock window', time: 'Jan 12, 2025 09:42:34 CST' },
                    { title: '3. Network Optimization: Split Selected', detail: 'Memphis 9K + Dallas 6K beats single-node\nP(On-Time): 94% vs 78% • Shadow cost: $4,200', time: 'Jan 12, 2025 09:43:02 CST' },
                    { title: '4. Arbitration: Override Approved', detail: '5/6 policies passed • Inventory flag overridden\nApprover: Maria Santos (Ops Manager)', time: 'Jan 12, 2025 09:45:41 CST' },
                    { title: '5. SAP Commit Success', detail: 'SO-78234501 + SO-78234502 created\nBAPI_SALESORDER_CREATEFROMDAT2 x 2', time: 'Jan 12, 2025 09:50:22 CST' },
                  ].map((item, index) => (
                    <Box key={index} sx={{ position: 'relative', pb: 2 }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          left: -20,
                          top: 4,
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: SUCCESS_GREEN,
                          border: '2px solid',
                          borderColor: 'background.paper',
                        }}
                      />
                      <Paper variant="outlined" sx={{ p: 1.5 }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 0.5 }}>{item.title}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                          {item.detail}
                        </Typography>
                        <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', mt: 0.5 }}>{item.time}</Typography>
                      </Paper>
                    </Box>
                  ))}
                </Box>

                {/* Decision Lineage Q&A */}
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HelpIcon sx={{ fontSize: 16 }} /> Decision Lineage Q&A
                </Typography>
                <Stack spacing={1} sx={{ mb: 2 }}>
                  {[
                    { q: 'Why split shipment instead of single node?', a: 'Single-node Memphis would drain inventory below safety stock and yield only 78% P(On-Time). Split achieves 94% P(On-Time) with $4,200 additional freight — justified by $225K penalty exposure.' },
                    { q: 'Why not Chicago direct (highest margin)?', a: 'Chicago direct yields 31.2% margin but only 62% P(On-Time) due to carrier constraints. Expected penalty cost of $85K exceeds $7K margin gain.' },
                    { q: 'What risks were accepted?', a: 'Memphis inventory protection override accepted. Risk: 1-day potential stockout if emergency order arrives before Jan 16 replenishment.' },
                  ].map((item, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 1.5 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 0.5 }}>{item.q}</Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', lineHeight: 1.5 }}>{item.a}</Typography>
                    </Paper>
                  ))}
                </Stack>

                {/* BAPI Execution Log */}
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TerminalIcon sx={{ fontSize: 16 }} /> BAPI Execution Log
                </Typography>
                <Paper
                  sx={{
                    p: 1.5,
                    bgcolor: '#0d1117',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.65rem',
                    maxHeight: 180,
                    overflowY: 'auto',
                  }}
                >
                  {[
                    { time: '09:50:12.102', msg: 'RFC connection opened to S4H-PRD-800', type: 'info' },
                    { time: '09:50:12.245', msg: 'BAPI_CUSTOMER_GETDETAIL2 - WMT-4521 verified', type: 'normal' },
                    { time: '09:50:12.312', msg: 'BAPI_MATERIAL_GET_DETAIL - SKU-7742 verified', type: 'normal' },
                    { time: '09:50:12.456', msg: 'Split shipment mode: 2 orders', type: 'split' },
                    { time: '09:50:13.102', msg: '[Order 1] Memphis - 9,000 CS preparing...', type: 'info' },
                    { time: '09:50:14.234', msg: '[Order 1] ATP confirmed - MEM1', type: 'success' },
                    { time: '09:50:15.567', msg: '[Order 1] SO-78234501 created', type: 'success' },
                    { time: '09:50:16.102', msg: '[Order 2] Dallas - 6,000 CS preparing...', type: 'info' },
                    { time: '09:50:17.234', msg: '[Order 2] ATP confirmed - DAL1', type: 'success' },
                    { time: '09:50:18.567', msg: '[Order 2] SO-78234502 created', type: 'success' },
                    { time: '09:50:19.890', msg: 'BAPI_TRANSACTION_COMMIT - Both orders committed', type: 'success' },
                  ].map((log, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1.5, py: 0.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <Typography sx={{ color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.65rem' }}>{log.time}</Typography>
                      <Typography
                        sx={{
                          fontSize: '0.65rem',
                          color: log.type === 'success' ? SUCCESS_GREEN : log.type === 'info' ? SAP_BLUE : log.type === 'split' ? PURPLE : '#94a3b8',
                        }}
                      >
                        {log.msg}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Footer */}
        <Paper variant="outlined" sx={{ mt: 2, p: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              <span>Total Cycle: <span style={{ color: SUCCESS_GREEN }}>{selectedRow.cycleTime} end-to-end</span></span>
              <Chip
                label="SAP"
                size="small"
                sx={{
                  bgcolor: 'linear-gradient(135deg, #004785 0%, #003366 100%)',
                  background: 'linear-gradient(135deg, #004785 0%, #003366 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.6rem',
                  height: 18,
                }}
              />
              <span>{selectedRow.salesOrders.join(', ')}</span>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small">View in VA03</Button>
              <Button variant="outlined" size="small">Download Audit</Button>
              <Button variant="outlined" size="small">Print ASN</Button>
              <Button variant="contained" size="small" sx={{ bgcolor: SAP_BLUE }}>
                Track in Learning Loop →
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Calculate stats for summary cards
  const listStats = {
    committed: sapCommitData.filter(d => d.status === 'Committed').length,
    pending: sapCommitData.filter(d => d.status === 'Pending').length,
    avgCycleTime: sapCommitData.length > 0 ? Math.round(sapCommitData.reduce((sum, d) => sum + parseInt(d.cycleTime) || 0, 0) / sapCommitData.length) : 0,
    totalValue: sapCommitData.reduce((sum, d) => sum + (d.orderValue || 0), 0),
  };

  // List view
  return (
    <Box sx={{ p: 3, minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.secondary' }}>
              ORDLY.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>SAP Commit & Trace</Typography>
          </Breadcrumbs>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh"><IconButton sx={{ color: 'text.secondary' }}><RefreshIcon /></IconButton></Tooltip>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small" sx={{ borderColor: alpha(PRIMARY_BLUE, 0.2), color: 'text.secondary' }}>
              Back to ORDLY.AI
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Section Title */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        <StorageIcon sx={{ fontSize: 40, color: ACCENT_BLUE }} />
        <Typography variant="h5" fontWeight={600}>SAP Commit & Trace</Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Pre-commit validation, SAP document preview, and BAPI execution log - Click a row to view trace
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Committed', value: listStats.committed, color: ACCENT_BLUE },
          { label: 'Pending', value: listStats.pending, color: CYAN },
          { label: 'Avg. Cycle Time', value: `${listStats.avgCycleTime} min`, color: PRIMARY_BLUE },
          { label: 'Total Value', value: `$${(listStats.totalValue / 1000).toFixed(0)}K`, color: SAP_BLUE },
        ].map((card) => (
          <Grid item xs={6} sm={4} md={3} key={card.label}>
            <Card variant="outlined" sx={{ borderLeft: `3px solid ${card.color}` }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                  {card.label}
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: card.color }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* DataGrid */}
      <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#ffffff' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <StorageIcon sx={{ color: SAP_BLUE, fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
              SAP Commit Queue
            </Typography>
          </Stack>
          <Chip label={`${sapCommitData.length} orders`} size="small" sx={{ bgcolor: alpha(SAP_BLUE, 0.12), color: SAP_BLUE, fontWeight: 600, fontSize: '0.7rem' }} />
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden', minHeight: 400 }}>
          <DataGrid
            rows={sapCommitData}
            columns={columns}
            density="compact"
            onRowClick={handleRowClick}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
            }}
            pageSizeOptions={[10, 25, 50]}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            sx={{
              border: 'none',
              height: '100%',
              '& .MuiDataGrid-cell': { fontSize: '0.8rem', borderColor: alpha('#000', 0.08) },
              '& .MuiDataGrid-columnHeader': { bgcolor: '#f1f5f9', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' },
              '& .MuiDataGrid-row:hover': { bgcolor: alpha(SAP_BLUE, 0.08), cursor: 'pointer' },
              '& .MuiDataGrid-toolbarContainer': { p: 1.5, gap: 1, borderBottom: '1px solid', borderColor: 'divider' },
            }}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default SapCommit;
