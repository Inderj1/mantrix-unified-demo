import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  Breadcrumbs,
  Link,
  Avatar,
  LinearProgress,
  Paper,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon,
  Psychology as PsychologyIcon,
  Lightbulb as LightbulbIcon,
  AttachMoney as MoneyIcon,
  AccountTree as NetworkIcon,
  GpsFixed as GpsFixedIcon,
  Check as CheckIcon,
} from '@mui/icons-material';

// Theme colors
const PRIMARY_BLUE = '#0854a0';
const ACCENT_BLUE = '#1976d2';
const SUCCESS_GREEN = '#34d399';
const WARNING_AMBER = '#fbbf24';
const CYAN = '#22d3ee';

// Mock fulfillment options
const mockFulfillmentOptions = [
  {
    id: 1,
    title: 'Memphis DC + Dallas DC Split',
    subtitle: 'Multi-node fulfillment with optimal service',
    isRecommended: true,
    isSelected: true,
    isSplit: true,
    margin: 28.4,
    pOnTime: 94,
    freight: 18450,
    shadowCost: 4200,
    co2: 2.1,
    nodes: [
      { name: 'Memphis DC', qty: 9000 },
      { name: 'Dallas DC', qty: 6000 },
    ],
  },
  {
    id: 2,
    title: 'Memphis DC Single Node',
    subtitle: 'Full order from regional hub',
    isRecommended: false,
    isRisky: true,
    margin: 29.1,
    pOnTime: 78,
    freight: 14200,
    shadowCost: 8900,
    co2: 2.8,
    nodes: [{ name: 'Memphis DC', qty: 15000 }],
  },
  {
    id: 3,
    title: 'Chicago Plant Direct',
    subtitle: 'Direct ship from manufacturing',
    isHighestMargin: true,
    margin: 31.2,
    pOnTime: 62,
    freight: 21800,
    shadowCost: 1200,
    co2: 3.4,
    nodes: [{ name: 'Chicago Plant', qty: 15000 }],
  },
  {
    id: 4,
    title: 'Phoenix DC Single Node',
    subtitle: 'West region fulfillment',
    isNotRecommended: true,
    margin: 25.8,
    pOnTime: 54,
    freight: 28400,
    shadowCost: 5600,
    co2: 4.1,
    nodes: [{ name: 'Phoenix DC', qty: 15000 }],
  },
];

// Mock orders for list view
const mockNetworkOrders = [
  {
    id: 'EDI-850-78432',
    customer: 'Walmart Distribution',
    orderValue: 247500,
    nodesEvaluated: 5,
    bestPOnTime: 94,
    bestMargin: 28.4,
    selectedOption: 'Memphis + Dallas Split',
    status: 'OPTIMIZING',
  },
  {
    id: 'PO-KRG-991204',
    customer: 'Kroger Central',
    orderValue: 156000,
    nodesEvaluated: 4,
    bestPOnTime: 88,
    bestMargin: 26.2,
    selectedOption: 'Cincinnati Single',
    status: 'OPTIMIZING',
  },
  {
    id: 'EDI-850-78429',
    customer: 'Target Southwest',
    orderValue: 98000,
    nodesEvaluated: 3,
    bestPOnTime: 92,
    bestMargin: 27.5,
    selectedOption: 'Phoenix Direct',
    status: 'READY',
  },
];

const NetworkOptimizer = ({ onBack }) => {
  const [orders, setOrders] = useState(mockNetworkOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOption, setSelectedOption] = useState(1);
  const darkMode = false;

  const flowSteps = [
    { id: 0, label: 'Demand Signal', status: 'complete' },
    { id: 1, label: 'Network Optimizer', status: 'active' },
    { id: 2, label: 'Arbitration', status: 'pending' },
    { id: 3, label: 'SAP Commit', status: 'pending' },
    { id: 4, label: 'Learning Loop', status: 'pending' },
  ];

  const columns = [
    {
      field: 'id',
      headerName: 'Order PO',
      width: 140,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, color: ACCENT_BLUE, fontSize: '0.8rem' }}>{params.value}</Typography>
      )
    },
    {
      field: 'customer',
      headerName: 'Customer',
      flex: 1,
      minWidth: 160,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{params.value}</Typography>
      )
    },
    {
      field: 'orderValue',
      headerName: 'Order Value',
      width: 110,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, fontSize: '0.8rem' }}>${params.value?.toLocaleString()}</Typography>
      )
    },
    {
      field: 'nodesEvaluated',
      headerName: 'Nodes',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip label={params.value} size="small" sx={{ bgcolor: alpha(CYAN, 0.1), color: CYAN, fontWeight: 600, fontSize: '0.75rem' }} />
      )
    },
    {
      field: 'bestPOnTime',
      headerName: 'Best P(OT)',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const value = params.value || 0;
        const color = value >= 90 ? SUCCESS_GREEN : value >= 80 ? WARNING_AMBER : '#f87171';
        return <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color }}>{value}%</Typography>;
      }
    },
    {
      field: 'bestMargin',
      headerName: 'Best Margin',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: SUCCESS_GREEN }}>{params.value}%</Typography>
      )
    },
    {
      field: 'selectedOption',
      headerName: 'Selected Option',
      width: 160,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{params.value}</Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          icon={<PsychologyIcon sx={{ fontSize: 14 }} />}
          sx={{
            bgcolor: alpha(SUCCESS_GREEN, 0.12),
            color: SUCCESS_GREEN,
            fontWeight: 600,
            fontSize: '0.65rem',
            '& .MuiChip-icon': { color: SUCCESS_GREEN }
          }}
        />
      )
    },
  ];

  const renderDetailView = () => {
    const order = selectedOrder || mockNetworkOrders[0];
    const selected = mockFulfillmentOptions.find(o => o.id === selectedOption);

    return (
      <Box sx={{ height: '100%', overflow: 'auto', bgcolor: '#f8fafc' }}>
        {/* Order Context Bar */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 1.5,
          bgcolor: alpha(SUCCESS_GREEN, 0.05),
          borderBottom: `1px solid ${alpha(SUCCESS_GREEN, 0.2)}`,
        }}>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => setSelectedOrder(null)} size="small" variant="outlined" sx={{ borderColor: 'divider' }}>
              Back to Demand Signal
            </Button>
            <Box>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: CYAN }}>{order.id}</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: 'text.primary' }}>{order.customer}</Typography>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: SUCCESS_GREEN }}>${order.orderValue?.toLocaleString()}</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', textTransform: 'uppercase' }}>Order Value</Typography>
            </Box>
            <Chip label="OPTIMIZING" icon={<PsychologyIcon sx={{ fontSize: 14 }} />} sx={{ bgcolor: alpha(ACCENT_BLUE, 0.15), color: ACCENT_BLUE, fontWeight: 600, fontSize: '0.7rem' }} />
          </Stack>
        </Box>

        {/* Flow Indicator */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, py: 1.5, bgcolor: alpha('#f1f5f9', 0.8), borderBottom: '1px solid', borderColor: 'divider' }}>
          {flowSteps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <Chip
                label={<Stack direction="row" spacing={0.5} alignItems="center">
                  {step.status === 'complete' ? (
                    <CheckIcon sx={{ fontSize: 14 }} />
                  ) : (
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600 }}>{step.id}</Typography>
                  )}
                  <Typography sx={{ fontSize: '0.7rem' }}>{step.label}</Typography>
                </Stack>}
                size="small"
                sx={{
                  bgcolor: step.status === 'active' ? alpha(SUCCESS_GREEN, 0.15) : step.status === 'complete' ? alpha(SUCCESS_GREEN, 0.1) : alpha('#64748b', 0.08),
                  color: step.status === 'active' ? SUCCESS_GREEN : step.status === 'complete' ? SUCCESS_GREEN : 'text.secondary',
                  border: step.status === 'active' ? `1px solid ${alpha(SUCCESS_GREEN, 0.3)}` : 'none',
                }}
              />
              {idx < flowSteps.length - 1 && <Typography sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>→</Typography>}
            </React.Fragment>
          ))}
        </Box>

        {/* Summary Strip */}
        <Grid container spacing={1.5} sx={{ px: 3, py: 2, bgcolor: alpha('#f1f5f9', 0.5) }}>
          {[
            { label: 'Nodes Evaluated', value: '5', color: CYAN },
            { label: 'Best P(On-Time)', value: '94%', color: SUCCESS_GREEN },
            { label: 'Best Margin', value: '28.4%', color: SUCCESS_GREEN },
            { label: 'Shadow Cost Δ', value: '$4,200', color: WARNING_AMBER },
            { label: 'Freight Cost', value: '$18,450', color: CYAN },
            { label: 'Perfect Order Risk', value: 'LOW', color: SUCCESS_GREEN },
          ].map((card) => (
            <Grid item xs={6} sm={4} md={2} key={card.label}>
              <Card variant="outlined" sx={{ textAlign: 'center' }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: card.color }}>{card.value}</Typography>
                  <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', textTransform: 'uppercase', mt: 0.5 }}>{card.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Main Content */}
        <Grid container spacing={2.5} sx={{ p: 3 }}>
          {/* Left Panel - Fulfillment Options */}
          <Grid item xs={12} md={7}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha(SUCCESS_GREEN, 0.03) }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>Network Fulfillment Options</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Multi-objective optimization across margin, service, inventory, and carbon</Typography>
              </Box>
              <CardContent sx={{ p: 2 }}>
                {mockFulfillmentOptions.map((option) => (
                  <Paper
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    sx={{
                      p: 2,
                      mb: 1.5,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: option.id === selectedOption ? SUCCESS_GREEN : 'divider',
                      borderRadius: 2,
                      bgcolor: option.id === selectedOption ? alpha(SUCCESS_GREEN, 0.03) : option.isRecommended ? alpha(SUCCESS_GREEN, 0.02) : 'background.paper',
                      opacity: option.isNotRecommended ? 0.6 : 1,
                      boxShadow: option.id === selectedOption ? `0 0 20px ${alpha(SUCCESS_GREEN, 0.15)}` : 'none',
                      '&:hover': { borderColor: alpha(SUCCESS_GREEN, 0.5) },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 28, height: 28, bgcolor: option.isRecommended ? alpha(SUCCESS_GREEN, 0.2) : alpha('#64748b', 0.1), color: option.isRecommended ? SUCCESS_GREEN : '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>
                          {option.id}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{option.title}</Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{option.subtitle}</Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={0.5}>
                        {option.isRecommended && <Chip icon={<CheckIcon sx={{ fontSize: '14px !important' }} />} label="RECOMMENDED" size="small" sx={{ bgcolor: alpha(SUCCESS_GREEN, 0.15), color: SUCCESS_GREEN, fontSize: '0.6rem', fontWeight: 600, '& .MuiChip-icon': { color: 'inherit' } }} />}
                        {option.isSplit && <Chip label="SPLIT SHIP" size="small" sx={{ bgcolor: alpha('#a855f7', 0.15), color: '#a855f7', fontSize: '0.6rem', fontWeight: 600 }} />}
                        {option.isRisky && <Chip label="SERVICE RISK" size="small" sx={{ bgcolor: alpha('#f87171', 0.15), color: '#f87171', fontSize: '0.6rem', fontWeight: 600 }} />}
                        {option.isHighestMargin && <Chip label="HIGHEST MARGIN" size="small" sx={{ bgcolor: alpha(CYAN, 0.15), color: CYAN, fontSize: '0.6rem', fontWeight: 600 }} />}
                        {option.isNotRecommended && <Chip label="NOT RECOMMENDED" size="small" sx={{ bgcolor: alpha('#f87171', 0.15), color: '#f87171', fontSize: '0.6rem', fontWeight: 600 }} />}
                      </Stack>
                    </Box>
                    <Grid container spacing={1} sx={{ mb: 1.5 }}>
                      {[
                        { label: 'Margin', value: `${option.margin}%`, color: option.margin >= 28 ? SUCCESS_GREEN : option.margin >= 26 ? WARNING_AMBER : '#f87171' },
                        { label: 'P(On-Time)', value: `${option.pOnTime}%`, color: option.pOnTime >= 90 ? SUCCESS_GREEN : option.pOnTime >= 75 ? WARNING_AMBER : '#f87171' },
                        { label: 'Freight', value: `$${option.freight.toLocaleString()}`, color: CYAN },
                        { label: 'Shadow Cost', value: `$${option.shadowCost.toLocaleString()}`, color: option.shadowCost <= 4500 ? SUCCESS_GREEN : option.shadowCost <= 6000 ? WARNING_AMBER : '#f87171' },
                        { label: 'CO₂/Case', value: `${option.co2} kg`, color: option.co2 <= 2.5 ? SUCCESS_GREEN : option.co2 <= 3 ? WARNING_AMBER : '#f87171' },
                      ].map((metric) => (
                        <Grid item xs key={metric.label}>
                          <Box sx={{ textAlign: 'center', p: 1, bgcolor: alpha('#000', 0.02), borderRadius: 1 }}>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: metric.color }}>{metric.value}</Typography>
                            <Typography sx={{ fontSize: '0.55rem', color: 'text.secondary', textTransform: 'uppercase' }}>{metric.label}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', bgcolor: alpha('#000', 0.02), borderRadius: 1, p: 1 }}>
                      {option.nodes.map((node) => (
                        <Chip key={node.name} icon={<InventoryIcon sx={{ fontSize: 14 }} />} label={`${node.name} • ${node.qty.toLocaleString()} CS`} size="small" sx={{ bgcolor: alpha('#fff', 0.5), fontSize: '0.65rem' }} />
                      ))}
                    </Box>
                  </Paper>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Panel - AI Decision Explainability */}
          <Grid item xs={12} md={5}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha(SUCCESS_GREEN, 0.03) }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>AI Decision Explainability</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Why Memphis + Dallas split is optimal</Typography>
              </Box>
              <CardContent sx={{ p: 2 }}>
                {/* Optimization Rationale */}
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LightbulbIcon sx={{ fontSize: 16, color: WARNING_AMBER }} /> Optimization Rationale
                </Typography>
                <Stack spacing={1} sx={{ mb: 3 }}>
                  {[
                    { icon: GpsFixedIcon, color: ACCENT_BLUE, text: '+16% service probability vs single-node Memphis (94% vs 78%)' },
                    { icon: MoneyIcon, color: SUCCESS_GREEN, text: 'Penalty-adjusted margin wins — 28.4% realized vs 29.1% nominal with 22% miss risk' },
                    { icon: InventoryIcon, color: CYAN, text: 'Inventory protection — Avoids draining Memphis below safety stock during promo' },
                    { icon: ShippingIcon, color: WARNING_AMBER, text: 'Carrier capacity secured — Dallas has confirmed trailer availability' },
                  ].map((reason, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <reason.icon sx={{ fontSize: 16, color: reason.color, mt: 0.25 }} />
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', lineHeight: 1.5 }}>{reason.text}</Typography>
                    </Paper>
                  ))}
                </Stack>

                {/* True Landed Cost */}
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoneyIcon sx={{ fontSize: 16, color: SUCCESS_GREEN }} /> True Landed Cost
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                  {[
                    { label: 'Product Cost (Blended)', value: '$148,500' },
                    { label: 'Freight (Memphis 9K + Dallas 6K)', value: '$18,450' },
                    { label: 'Accessorial Probability', value: '$820' },
                    { label: 'Shadow Inventory Cost', value: '$4,200', negative: true },
                    { label: 'Expected Chargeback', value: '$1,350', positive: true },
                  ].map((row, idx) => (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: idx < 4 ? '1px solid' : 'none', borderColor: 'divider' }}>
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{row.label}</Typography>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: row.negative ? '#f87171' : row.positive ? SUCCESS_GREEN : 'text.primary' }}>{row.value}</Typography>
                    </Box>
                  ))}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1.5, mt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Net Landed Margin</Typography>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: SUCCESS_GREEN }}>$70,230 (28.4%)</Typography>
                  </Box>
                </Paper>

                {/* Risk Matrix */}
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon sx={{ fontSize: 16, color: WARNING_AMBER }} /> Risk Matrix
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  {[
                    { label: 'Chargeback Probability', value: 6, color: SUCCESS_GREEN },
                    { label: 'Deduction Likelihood', value: 4, color: SUCCESS_GREEN },
                    { label: 'Damage/Claim Risk', value: 2, color: SUCCESS_GREEN },
                    { label: 'Future Stockout Impact', value: 18, color: WARNING_AMBER },
                  ].map((risk) => (
                    <Box key={risk.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                      <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', flex: 1 }}>{risk.label}</Typography>
                      <Box sx={{ width: 100, height: 6, bgcolor: alpha('#64748b', 0.2), borderRadius: 3, overflow: 'hidden' }}>
                        <Box sx={{ width: `${risk.value}%`, height: '100%', bgcolor: risk.color, borderRadius: 3 }} />
                      </Box>
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: risk.color, minWidth: 30, textAlign: 'right' }}>{risk.value}%</Typography>
                    </Box>
                  ))}
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Footer */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: alpha('#f1f5f9', 0.8) }}>
          <Stack direction="row" spacing={3}>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Selected: <Typography component="span" sx={{ color: SUCCESS_GREEN, fontWeight: 600 }}>Memphis + Dallas Split</Typography></Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Service Uplift: <Typography component="span" sx={{ color: SUCCESS_GREEN, fontWeight: 600 }}>+16%</Typography></Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Expected Margin: <Typography component="span" sx={{ color: SUCCESS_GREEN, fontWeight: 600 }}>$70,230</Typography></Typography>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" size="small" sx={{ fontSize: '0.75rem', borderColor: 'divider' }}>← Back to Demand</Button>
            <Button variant="outlined" size="small" sx={{ fontSize: '0.75rem', borderColor: 'divider' }}>Override Selection</Button>
            <Button variant="contained" size="small" sx={{ bgcolor: SUCCESS_GREEN, '&:hover': { bgcolor: alpha(SUCCESS_GREEN, 0.8) }, fontWeight: 600, fontSize: '0.75rem' }}>
              Accept & Send to Arbitration →
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  };

  // Calculate stats for summary cards
  const listStats = {
    totalOrders: orders.length,
    avgPOnTime: orders.length > 0 ? Math.round(orders.reduce((sum, o) => sum + (o.pOnTime || 0), 0) / orders.length) : 0,
    splitShip: orders.filter(o => o.nodes > 1).length,
    avgMargin: orders.length > 0 ? (orders.reduce((sum, o) => sum + (o.bestMargin || 0), 0) / orders.length).toFixed(1) : 0,
  };

  const renderListView = () => (
    <Box sx={{ p: 3, minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.secondary' }}>
              ORDLY.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Network Optimizer</Typography>
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
        <NetworkIcon sx={{ fontSize: 40, color: ACCENT_BLUE }} />
        <Typography variant="h5" fontWeight={600}>Network Optimizer</Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Multi-node fulfillment optimization with AI explainability - Click a row to view options
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Pending Optimization', value: listStats.totalOrders, color: ACCENT_BLUE },
          { label: 'Avg. P(On-Time)', value: `${listStats.avgPOnTime}%`, color: CYAN },
          { label: 'Split Shipments', value: listStats.splitShip, color: PRIMARY_BLUE },
          { label: 'Avg. Margin', value: `${listStats.avgMargin}%`, color: '#2b88d8' },
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
            <NetworkIcon sx={{ color: SUCCESS_GREEN, fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
              Optimization Queue
            </Typography>
          </Stack>
          <Chip label={`${orders.length} orders`} size="small" sx={{ bgcolor: alpha(SUCCESS_GREEN, 0.12), color: SUCCESS_GREEN, fontWeight: 600, fontSize: '0.7rem' }} />
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden', minHeight: 400 }}>
          <DataGrid
            rows={orders}
            columns={columns}
            density="compact"
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            pageSizeOptions={[10, 25, 50]}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
            onRowClick={(params) => setSelectedOrder(params.row)}
            disableRowSelectionOnClick
            sx={{
              border: '1px solid rgba(0,0,0,0.08)',
              height: '100%',
              '& .MuiDataGrid-cell': { fontSize: '0.8rem', borderColor: alpha('#000', 0.08) },
              '& .MuiDataGrid-columnHeader': { bgcolor: '#f1f5f9', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' },
              '& .MuiDataGrid-row:hover': { bgcolor: alpha(SUCCESS_GREEN, 0.08), cursor: 'pointer' },
              '& .MuiDataGrid-toolbarContainer': { p: 1.5, gap: 1, borderBottom: '1px solid', borderColor: 'divider' },
            }}
          />
        </Box>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ height: '100%', overflow: 'auto', bgcolor: '#f8fafc' }}>
      {selectedOrder ? renderDetailView() : renderListView()}
    </Box>
  );
};

export default NetworkOptimizer;
