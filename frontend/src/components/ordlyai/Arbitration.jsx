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
  LinearProgress,
  Grid,
  alpha,
  Tooltip,
  Breadcrumbs,
  Link,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
  Balance as BalanceIcon,
  Shield as ShieldIcon,
  Inventory as InventoryIcon,
  Lightbulb as LightbulbIcon,
  Group as GroupIcon,
  AttachMoney as MoneyIcon,
  GpsFixed as GpsFixedIcon,
  CreditCard as CreditCardIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  SmartToy as SmartToyIcon,
  Check as CheckIcon,
  Factory as FactoryIcon,
  Refresh as RefreshIcon,
  NavigateNext as NavigateNextIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

// Theme colors
const PRIMARY_BLUE = '#0854a0';
const ACCENT_BLUE = '#1976d2';
const WARNING_AMBER = '#d97706';
const SUCCESS_GREEN = '#059669';
const ERROR_RED = '#dc2626';
const CYAN = '#22d3ee';

// Sample data for the list view
const arbitrationData = [
  {
    id: 1,
    orderPo: 'EDI-850-78432',
    customer: 'Walmart Distribution',
    material: 'SKU-7742 Energy Drink 12-Pack',
    orderValue: 247500,
    margin: 28.4,
    pOnTime: 94,
    policiesPassed: '5/6',
    status: 'Review Required',
    flaggedPolicy: 'Inventory Protection',
    assignee: 'Maria Santos',
  },
  {
    id: 2,
    orderPo: 'EDI-850-78456',
    customer: 'Target Corp',
    material: 'SKU-4421 Sports Drink 6-Pack',
    orderValue: 156800,
    margin: 24.2,
    pOnTime: 91,
    policiesPassed: '6/6',
    status: 'Auto Approved',
    flaggedPolicy: 'None',
    assignee: 'System',
  },
  {
    id: 3,
    orderPo: 'EDI-850-78412',
    customer: 'Costco Wholesale',
    material: 'SKU-8812 Protein Shake 24-Pack',
    orderValue: 312400,
    margin: 19.8,
    pOnTime: 88,
    policiesPassed: '4/6',
    status: 'Blocked',
    flaggedPolicy: 'Margin + Credit',
    assignee: 'John Davis',
  },
  {
    id: 4,
    orderPo: 'EDI-850-78489',
    customer: 'Kroger Co',
    material: 'SKU-2234 Vitamin Water 12-Pack',
    orderValue: 89200,
    margin: 31.5,
    pOnTime: 97,
    policiesPassed: '6/6',
    status: 'Auto Approved',
    flaggedPolicy: 'None',
    assignee: 'System',
  },
  {
    id: 5,
    orderPo: 'EDI-850-78501',
    customer: 'Safeway Inc',
    material: 'SKU-5567 Electrolyte Mix 18-Pack',
    orderValue: 178300,
    margin: 26.1,
    pOnTime: 92,
    policiesPassed: '5/6',
    status: 'Review Required',
    flaggedPolicy: 'Service Level',
    assignee: 'Sarah Chen',
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

const Arbitration = ({ onBack }) => {
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
      minWidth: 160,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{params.value}</Typography>
      ),
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
      field: 'margin',
      headerName: 'Margin',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const value = params.value || 0;
        const color = value >= 25 ? SUCCESS_GREEN : value >= 18 ? WARNING_AMBER : ERROR_RED;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 30, height: 6, bgcolor: alpha('#64748b', 0.2), borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ width: `${Math.min(value * 3, 100)}%`, height: '100%', bgcolor: color, borderRadius: 3 }} />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.75rem', color }}>{value}%</Typography>
          </Box>
        );
      },
    },
    {
      field: 'pOnTime',
      headerName: 'P(OT)',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const value = params.value || 0;
        const color = value >= 90 ? SUCCESS_GREEN : value >= 85 ? WARNING_AMBER : ERROR_RED;
        return (
          <Typography sx={{ fontWeight: 600, fontSize: '0.75rem', color }}>{value}%</Typography>
        );
      },
    },
    {
      field: 'policiesPassed',
      headerName: 'Policies',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const [passed, total] = params.value.split('/');
        const color = passed === total ? SUCCESS_GREEN : parseInt(passed) >= 5 ? WARNING_AMBER : ERROR_RED;
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.7rem',
              fontWeight: 600,
              bgcolor: alpha(color, 0.1),
              color: color,
            }}
          />
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        let color = WARNING_AMBER;
        let icon = <WarningIcon sx={{ fontSize: 14 }} />;
        if (params.value === 'Auto Approved') {
          color = SUCCESS_GREEN;
          icon = <CheckCircleIcon sx={{ fontSize: 14 }} />;
        } else if (params.value === 'Blocked') {
          color = ERROR_RED;
          icon = <CancelIcon sx={{ fontSize: 14 }} />;
        }
        return (
          <Chip
            icon={icon}
            label={params.value}
            size="small"
            sx={{
              height: 24,
              fontSize: '0.7rem',
              fontWeight: 600,
              bgcolor: alpha(color, 0.1),
              color: color,
              '& .MuiChip-icon': { color: color },
            }}
          />
        );
      },
    },
    {
      field: 'assignee',
      headerName: 'Assignee',
      width: 120,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{params.value}</Typography>
      ),
    },
  ];

  // Detail view
  if (selectedRow) {
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
                icon={<BalanceIcon sx={{ fontSize: 14 }} />}
                label="ARBITRATING"
                sx={{
                  bgcolor: alpha(WARNING_AMBER, 0.15),
                  color: WARNING_AMBER,
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
                  icon={stage.step < 2 ? <CheckIcon sx={{ fontSize: '14px !important' }} /> : undefined}
                  label={stage.label}
                  size="small"
                  sx={{
                    bgcolor: stage.step < 2 ? alpha(SUCCESS_GREEN, 0.1) : stage.step === 2 ? alpha(WARNING_AMBER, 0.15) : alpha('#64748b', 0.1),
                    color: stage.step < 2 ? SUCCESS_GREEN : stage.step === 2 ? WARNING_AMBER : 'text.secondary',
                    fontWeight: stage.step === 2 ? 600 : 400,
                    border: stage.step === 2 ? `1px solid ${alpha(WARNING_AMBER, 0.3)}` : 'none',
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

        {/* Summary Strip */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {[
            { label: 'Expected Margin', value: `${selectedRow.margin}%`, color: SUCCESS_GREEN },
            { label: 'P(On-Time)', value: `${selectedRow.pOnTime}%`, color: SUCCESS_GREEN },
            { label: 'Customer CLV', value: '$18.2M', color: CYAN },
            { label: 'Segment', value: 'INVEST', color: SUCCESS_GREEN },
            { label: 'Credit OK', value: 'OK', icon: CheckIcon, color: SUCCESS_GREEN },
            { label: 'Policies Passed', value: selectedRow.policiesPassed, color: WARNING_AMBER },
          ].map((item, index) => (
            <Grid item xs={2} key={index}>
              <Card variant="outlined" sx={{ textAlign: 'center', py: 1.5 }}>
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                  {item.icon && <item.icon sx={{ fontSize: 18 }} />}
                  {!item.icon && item.value}
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
          {/* Left Panel - Policy Evaluation */}
          <Grid item xs={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <ShieldIcon sx={{ color: PRIMARY_BLUE }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Policy Evaluation & Guardrails</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                      Human-defined constraints on AI-optimized decisions
                    </Typography>
                  </Box>
                </Stack>

                {/* Verdict Card */}
                <Paper
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: alpha(WARNING_AMBER, 0.05),
                    border: `1px solid ${alpha(WARNING_AMBER, 0.3)}`,
                    borderRadius: 2,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography sx={{ fontWeight: 700, color: WARNING_AMBER, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <WarningIcon sx={{ fontSize: 18 }} /> CONDITIONAL APPROVAL
                    </Typography>
                    <Chip label="REVIEW REQUIRED" size="small" sx={{ bgcolor: alpha(WARNING_AMBER, 0.2), color: WARNING_AMBER, fontSize: '0.65rem', fontWeight: 600 }} />
                  </Stack>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.6 }}>
                    Fulfillment plan passes {selectedRow.policiesPassed} policies. Inventory protection flag triggered for Memphis DC — promo allocation would bring SKU-7742 below 3-day safety stock. Requires ops manager approval to proceed.
                  </Typography>
                </Paper>

                {/* Margin Guardrails */}
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoneyIcon sx={{ fontSize: 16, color: SUCCESS_GREEN }} /> Margin Guardrails
                </Typography>
                <Stack spacing={1} sx={{ mb: 2 }}>
                  {[
                    { label: 'Minimum Margin %', actual: '28.4%', threshold: 'min: 18%', pass: true },
                    { label: 'Minimum Margin $', actual: '$70,230', threshold: 'min: $25,000', pass: true },
                    { label: 'Expected Margin (after penalties)', actual: '$68,880', threshold: 'min: $20,000', pass: true },
                  ].map((item, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{item.label}</Typography>
                        <Stack direction="row" spacing={2} alignItems="baseline">
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: SUCCESS_GREEN }}>{item.actual}</Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{item.threshold}</Typography>
                        </Stack>
                      </Box>
                      <Chip icon={<CheckIcon sx={{ fontSize: '14px !important' }} />} label="PASS" size="small" sx={{ bgcolor: alpha(SUCCESS_GREEN, 0.1), color: SUCCESS_GREEN, fontWeight: 600, fontSize: '0.65rem', '& .MuiChip-icon': { color: 'inherit' } }} />
                    </Paper>
                  ))}
                </Stack>

                {/* Service Guardrails */}
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GpsFixedIcon sx={{ fontSize: 16, color: ACCENT_BLUE }} /> Service Guardrails
                </Typography>
                <Stack spacing={1} sx={{ mb: 2 }}>
                  {[
                    { label: 'Minimum P(On-Time)', actual: '94%', threshold: 'min: 85%', pass: true },
                    { label: 'Max Acceptable Delay', actual: '0 days', threshold: 'max: 2 days', pass: true },
                  ].map((item, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{item.label}</Typography>
                        <Stack direction="row" spacing={2} alignItems="baseline">
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: SUCCESS_GREEN }}>{item.actual}</Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{item.threshold}</Typography>
                        </Stack>
                      </Box>
                      <Chip icon={<CheckIcon sx={{ fontSize: '14px !important' }} />} label="PASS" size="small" sx={{ bgcolor: alpha(SUCCESS_GREEN, 0.1), color: SUCCESS_GREEN, fontWeight: 600, fontSize: '0.65rem', '& .MuiChip-icon': { color: 'inherit' } }} />
                    </Paper>
                  ))}
                </Stack>

                {/* Inventory Protection */}
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InventoryIcon sx={{ fontSize: 16 }} /> Inventory Protection
                </Typography>
                {[
                  { node: 'Memphis DC', status: 'CAUTION', statusColor: WARNING_AMBER, safetyStock: 4000, current: 12400, orderQty: 9000, remaining: 3400 },
                  { node: 'Dallas DC', status: 'SAFE', statusColor: SUCCESS_GREEN, safetyStock: 3000, current: 18200, orderQty: 6000, remaining: 12200 },
                ].map((inv, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <FactoryIcon sx={{ fontSize: 16 }} /> {inv.node} — SKU-7742
                      </Typography>
                      <Chip
                        icon={inv.status === 'CAUTION' ? <WarningIcon sx={{ fontSize: '14px !important' }} /> : <CheckIcon sx={{ fontSize: '14px !important' }} />}
                        label={inv.status === 'CAUTION' ? 'CAUTION' : 'SAFE'}
                        size="small"
                        sx={{
                          bgcolor: alpha(inv.statusColor, 0.1),
                          color: inv.statusColor,
                          fontWeight: 600,
                          fontSize: '0.65rem',
                          '& .MuiChip-icon': { color: 'inherit' },
                        }}
                      />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>Safety Stock (3-day): {inv.safetyStock.toLocaleString()} CS</Typography>
                      <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>Current: {inv.current.toLocaleString()} CS</Typography>
                    </Stack>
                    <Box sx={{ height: 10, bgcolor: alpha('#64748b', 0.2), borderRadius: 1, position: 'relative', overflow: 'hidden', mb: 1 }}>
                      <Box sx={{ position: 'absolute', height: '100%', width: `${(inv.safetyStock / inv.current) * 100}%`, bgcolor: alpha(ERROR_RED, 0.3), borderRadius: 1 }} />
                      <Box sx={{ position: 'absolute', height: '100%', width: '100%', background: `linear-gradient(90deg, ${SUCCESS_GREEN}, ${CYAN})`, borderRadius: 1 }} />
                    </Box>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>{inv.current.toLocaleString()}</Typography>
                        <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', textAlign: 'center' }}>On Hand</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, textAlign: 'center', color: ERROR_RED }}>-{inv.orderQty.toLocaleString()}</Typography>
                        <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', textAlign: 'center' }}>This Order</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, textAlign: 'center', color: inv.remaining < inv.safetyStock ? WARNING_AMBER : SUCCESS_GREEN }}>
                          {inv.remaining.toLocaleString()}
                        </Typography>
                        <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', textAlign: 'center' }}>Remaining</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Panel - Approval Workflow */}
          <Grid item xs={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <GroupIcon sx={{ color: PRIMARY_BLUE }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Approval Workflow & Exception Handling</Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                      Policy engine recommendations and escalation
                    </Typography>
                  </Box>
                </Stack>

                {/* Policy Checks */}
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: SUCCESS_GREEN }} /> Policy Checks ({selectedRow.policiesPassed} Passed)
                </Typography>
                <Stack spacing={0.5} sx={{ mb: 2 }}>
                  {[
                    { icon: MoneyIcon, color: SUCCESS_GREEN, name: 'Margin Threshold (> 18%)', passed: true },
                    { icon: GpsFixedIcon, color: ACCENT_BLUE, name: 'Service Level (> 85% P(OT))', passed: true },
                    { icon: CreditCardIcon, color: CYAN, name: 'Credit Exposure Check', passed: true },
                    { icon: PersonIcon, color: PRIMARY_BLUE, name: 'Customer Segment (INVEST tier)', passed: true },
                    { icon: AssignmentIcon, color: '#64748b', name: 'MABD Compliance Check', passed: true },
                    { icon: InventoryIcon, color: WARNING_AMBER, name: 'Inventory Safety Floor (3-day)', passed: false },
                  ].map((policy, index) => (
                    <Paper key={index} variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <policy.icon sx={{ fontSize: 16, color: policy.color }} />
                      <Typography sx={{ flex: 1, fontSize: '0.75rem' }}>{policy.name}</Typography>
                      <Chip
                        icon={policy.passed ? <CheckIcon sx={{ fontSize: '14px !important' }} /> : <WarningIcon sx={{ fontSize: '14px !important' }} />}
                        label={policy.passed ? 'PASSED' : 'WARNING'}
                        size="small"
                        sx={{
                          bgcolor: alpha(policy.passed ? SUCCESS_GREEN : WARNING_AMBER, 0.1),
                          color: policy.passed ? SUCCESS_GREEN : WARNING_AMBER,
                          fontWeight: 600,
                          fontSize: '0.6rem',
                          '& .MuiChip-icon': { color: 'inherit' },
                        }}
                      />
                    </Paper>
                  ))}
                </Stack>

                {/* Exception Proposals */}
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LightbulbIcon sx={{ fontSize: 16 }} /> Exception Proposals
                </Typography>
                <Stack spacing={1} sx={{ mb: 2 }}>
                  {[
                    { option: 'Option A: Shift Split Ratio', impact: '+$1,200 freight', detail: 'Reduce Memphis allocation from 9,000 → 7,000 CS, increase Dallas from 6,000 → 8,000 CS. Keeps Memphis above safety floor. P(On-Time) remains 93%.' },
                    { option: 'Option B: Accept Risk with Override', impact: 'No cost impact', detail: 'Proceed with original split. Memphis replenishment arrives in 4 days. Risk: potential stockout for 1 day if emergency order arrives.' },
                    { option: 'Option C: Negotiate Delivery Date', impact: 'Customer approval needed', detail: 'Request 2-day extension from Walmart (Jan 20 → Jan 22). Allows Memphis replenishment before allocation. Historical acceptance: 34%.' },
                  ].map((exc, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 1.5,
                        bgcolor: alpha('#a855f7', 0.03),
                        border: `1px solid ${alpha('#a855f7', 0.2)}`,
                        borderRadius: 1,
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#a855f7' }}>{exc.option}</Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{exc.impact}</Typography>
                      </Stack>
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', lineHeight: 1.5 }}>{exc.detail}</Typography>
                    </Paper>
                  ))}
                </Stack>

                {/* Approval Workflow */}
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <GroupIcon sx={{ fontSize: 16 }} /> Approval Workflow
                </Typography>
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  {[
                    { icon: SmartToyIcon, title: 'ORDLY.AI Auto-Evaluation', detail: '5/6 policies passed, 1 warning flagged', status: 'COMPLETE', statusColor: SUCCESS_GREEN },
                    { icon: PersonIcon, title: 'Ops Manager Review', detail: 'Maria Santos • Inventory override authority', status: 'PENDING', statusColor: WARNING_AMBER },
                    { icon: CheckIcon, title: 'Final Commit Authorization', detail: 'Auto-approve after ops sign-off', status: 'AWAITING', statusColor: '#64748b' },
                  ].map((step, index) => (
                    <Stack key={index} direction="row" alignItems="center" spacing={1.5} sx={{ py: 1, borderBottom: index < 2 ? '1px solid' : 'none', borderColor: 'divider' }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: alpha(step.statusColor, 0.15),
                        }}
                      >
                        <step.icon sx={{ fontSize: 18, color: step.statusColor }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{step.title}</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>{step.detail}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: step.statusColor }}>{step.status}</Typography>
                    </Stack>
                  ))}
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Footer */}
        <Paper variant="outlined" sx={{ mt: 2, p: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={3} sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              <span>Flagged: <span style={{ color: WARNING_AMBER }}>{selectedRow.flaggedPolicy}</span></span>
              <span>Assigned: <span style={{ color: 'inherit' }}>{selectedRow.assignee}</span></span>
              <span>SLA: <span style={{ color: WARNING_AMBER }}>1h 12m remaining</span></span>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small" onClick={handleBackToList}>← Back to Optimizer</Button>
              <Button variant="outlined" size="small" sx={{ borderColor: WARNING_AMBER, color: WARNING_AMBER }}>Apply Option A</Button>
              <Button variant="outlined" size="small">Request Date Extension</Button>
              <Button variant="contained" size="small" sx={{ bgcolor: WARNING_AMBER, '&:hover': { bgcolor: alpha(WARNING_AMBER, 0.8) } }}>
                Override & Approve →
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Calculate stats for summary cards
  const listStats = {
    pendingReview: arbitrationData.filter(o => o.status === 'Review Required').length,
    autoApproved: arbitrationData.filter(o => o.status === 'Auto-Approved').length,
    avgMargin: arbitrationData.length > 0 ? (arbitrationData.reduce((sum, o) => sum + (o.margin || 0), 0) / arbitrationData.length).toFixed(1) : 0,
    policiesPass: arbitrationData.length > 0 ? Math.round(arbitrationData.filter(o => o.policiesPassed === '6/6').length / arbitrationData.length * 100) : 0,
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
            <Typography color="primary" variant="body1" fontWeight={600}>Economic Arbitration</Typography>
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
        <BalanceIcon sx={{ fontSize: 40, color: ACCENT_BLUE }} />
        <Typography variant="h5" fontWeight={600}>Economic Arbitration</Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Policy guardrails, inventory protection, and approval workflows - Click a row to review
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Pending Review', value: listStats.pendingReview, color: ACCENT_BLUE },
          { label: 'Auto-Approved', value: listStats.autoApproved, color: CYAN },
          { label: 'Avg. Margin', value: `${listStats.avgMargin}%`, color: PRIMARY_BLUE },
          { label: 'Policy Pass Rate', value: `${listStats.policiesPass}%`, color: '#3b82f6' },
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
            <BalanceIcon sx={{ color: WARNING_AMBER, fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
              Arbitration Queue
            </Typography>
          </Stack>
          <Chip label={`${arbitrationData.length} orders`} size="small" sx={{ bgcolor: alpha(WARNING_AMBER, 0.12), color: WARNING_AMBER, fontWeight: 600, fontSize: '0.7rem' }} />
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden', minHeight: 400 }}>
          <DataGrid
            rows={arbitrationData}
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
              '& .MuiDataGrid-row:hover': { bgcolor: alpha(WARNING_AMBER, 0.08), cursor: 'pointer' },
              '& .MuiDataGrid-toolbarContainer': { p: 1.5, gap: 1, borderBottom: '1px solid', borderColor: 'divider' },
            }}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default Arbitration;
