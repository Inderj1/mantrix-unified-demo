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
  TextField,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon,
  Psychology as PsychologyIcon,
  Sensors as SensorsIcon,
  Star as StarIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';

// Theme colors
const PRIMARY_BLUE = '#002352';
const ACCENT_BLUE = '#1976d2';
const SUCCESS_GREEN = '#059669';
const WARNING_AMBER = '#d97706';
const CYAN = '#22d3ee';

// Mock data for demand signals - Arizona Beverages
const mockDemandSignals = [
  {
    id: 'EDI-850-78432',
    customer: 'Walmart Distribution',
    material: 'AZ GREEN TEA $1 24PK 20OZ TALLBOY',
    quantity: 15000,
    orderValue: 374850,
    classification: 'PROMO',
    confidence: 91,
    pOnTime: 72,
    slaRemaining: '1h 52m',
    receivedAgo: '8 min ago',
    requestedDate: 'Jan 18, 2025',
    mabd: 'Jan 20, 2025',
    penaltyExposure: 225000,
    extractedFields: {
      customer: { value: 'Walmart #4521', confidence: 98 },
      shipTo: { value: 'Bentonville DC-7', confidence: 96 },
      material: { value: 'AZ-GT-001', confidence: 99 },
      quantity: { value: '15,000 CS', confidence: 97 },
      requestedDate: { value: 'Jan 18, 2025', confidence: 82 },
      mabd: { value: 'Jan 20, 2025', confidence: 94 },
    },
    hiddenConstraints: [
      { icon: 'ship', text: 'Ship Complete Required — No partial shipments accepted' },
      { icon: 'dock', text: 'Dock Appointment — 6:00 AM - 10:00 AM window only' },
      { icon: 'penalty', text: 'OTIF Penalty — $15/case chargeback if late' },
    ],
    volatilityFingerprint: { normal: 12, promo: 78, panic: 6, eoq: 4 },
    historyInsight: 'This Ship-To + SKU + Date combo historically misses 28% of the time. Primary cause: carrier capacity constraints during promo periods.',
    similarOrders: [
      { so: 'SO-782341', date: 'Oct 2024', qty: '12K CS', match: 89 },
      { so: 'SO-756892', date: 'Jul 2024', qty: '14K CS', match: 86 },
    ],
  },
  {
    id: 'PO-COSTCO-991204',
    customer: 'COSTCO DEPOT TRACY',
    material: 'AZ ARNOLD PALMER BLACK 4PK GALLON PECO',
    quantity: 8000,
    orderValue: 159920,
    classification: 'PANIC BUY',
    confidence: 87,
    pOnTime: 65,
    slaRemaining: '38m',
    receivedAgo: '22 min ago',
    requestedDate: 'Jan 16, 2025',
    mabd: 'Jan 17, 2025',
    penaltyExposure: 120000,
    extractedFields: {
      customer: { value: 'COSTCO #4221', confidence: 96 },
      shipTo: { value: 'Tracy DC-3', confidence: 94 },
      material: { value: 'AZ-AP-001', confidence: 98 },
      quantity: { value: '8,000 CS', confidence: 95 },
      requestedDate: { value: 'Jan 16, 2025', confidence: 78 },
      mabd: { value: 'Jan 17, 2025', confidence: 92 },
    },
    hiddenConstraints: [
      { icon: 'urgent', text: 'Emergency Order — Stock-out imminent at retail' },
      { icon: 'ship', text: 'Must Ship Today — 3:00 PM cutoff' },
    ],
    volatilityFingerprint: { normal: 8, promo: 15, panic: 72, eoq: 5 },
    historyInsight: 'Panic buy pattern detected. Similar orders in past 6 months had 35% higher carrier costs due to expedited shipping.',
    similarOrders: [
      { so: 'SO-889234', date: 'Nov 2024', qty: '6K CS', match: 82 },
    ],
  },
  {
    id: 'EDI-850-78429',
    customer: 'PUBLIX JACKSONVILLE WAREHOUSE',
    material: 'AZ LEMON TEA NP 24PK 22OZ CAN',
    quantity: 4200,
    orderValue: 96558,
    classification: 'NORMAL',
    confidence: 94,
    pOnTime: 88,
    slaRemaining: '5h 15m',
    receivedAgo: '45 min ago',
    requestedDate: 'Jan 22, 2025',
    mabd: 'Jan 24, 2025',
    penaltyExposure: 63000,
    extractedFields: {
      customer: { value: 'PUBLIX #2341', confidence: 99 },
      shipTo: { value: 'Jacksonville DC-2', confidence: 97 },
      material: { value: 'AZ-LT-001', confidence: 98 },
      quantity: { value: '4,200 CS', confidence: 99 },
      requestedDate: { value: 'Jan 22, 2025', confidence: 95 },
      mabd: { value: 'Jan 24, 2025', confidence: 96 },
    },
    hiddenConstraints: [
      { icon: 'pallet', text: 'Pallet Configuration — 48 cases per pallet required' },
    ],
    volatilityFingerprint: { normal: 85, promo: 8, panic: 2, eoq: 5 },
    historyInsight: 'Standard replenishment order. This customer has 94% on-time history.',
    similarOrders: [
      { so: 'SO-778123', date: 'Dec 2024', qty: '4K CS', match: 95 },
      { so: 'SO-765432', date: 'Nov 2024', qty: '4.5K CS', match: 92 },
    ],
  },
  {
    id: 'EDI-850-78435',
    customer: 'AMAZON - CMH2',
    material: 'AZ MUCHO MANGO 4PK GALLON',
    quantity: 6500,
    orderValue: 129935,
    classification: 'NORMAL',
    confidence: 96,
    pOnTime: 92,
    slaRemaining: '8h 30m',
    receivedAgo: '15 min ago',
    requestedDate: 'Jan 25, 2025',
    mabd: 'Jan 28, 2025',
    penaltyExposure: 45000,
    extractedFields: {
      customer: { value: 'AMAZON CMH2', confidence: 99 },
      shipTo: { value: 'Columbus FC', confidence: 98 },
      material: { value: 'AZ-MM-001', confidence: 99 },
      quantity: { value: '6,500 CS', confidence: 98 },
      requestedDate: { value: 'Jan 25, 2025', confidence: 97 },
      mabd: { value: 'Jan 28, 2025', confidence: 98 },
    },
    hiddenConstraints: [
      { icon: 'pallet', text: 'Amazon Vendor Flex Requirements' },
    ],
    volatilityFingerprint: { normal: 90, promo: 5, panic: 2, eoq: 3 },
    historyInsight: 'E-commerce fulfillment order. Amazon typically has consistent demand patterns.',
    similarOrders: [
      { so: 'SO-780112', date: 'Dec 2024', qty: '6K CS', match: 94 },
    ],
  },
];

// AI Chat messages
const initialChatMessages = [
  {
    type: 'ai',
    text: "I've analyzed EDI-850-78432 from Walmart. This is a **PROMO order** for 15,000 cases of AZ Green Tea 24-Pack, 3.2x their normal order volume.",
  },
];

const DemandSignal = ({ onBack }) => {
  const [signals, setSignals] = useState(mockDemandSignals);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState(initialChatMessages);
  const [chatInput, setChatInput] = useState('');
  const darkMode = false;

  // Flow steps for the 5-stage MTS pipeline
  const flowSteps = [
    { id: 0, label: 'Demand Signal', status: 'active' },
    { id: 1, label: 'Network Optimizer', status: 'pending' },
    { id: 2, label: 'Arbitration', status: 'pending' },
    { id: 3, label: 'SAP Commit', status: 'pending' },
    { id: 4, label: 'Learning Loop', status: 'pending' },
  ];

  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'PROMO': return '#a855f7';
      case 'PANIC BUY': return '#f87171';
      case 'NORMAL': return CYAN;
      case 'EOQ': return '#64748b';
      default: return '#64748b';
    }
  };

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
      field: 'material',
      headerName: 'Material',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }} noWrap>{params.value}</Typography>
      )
    },
    {
      field: 'classification',
      headerName: 'Type',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const color = getClassificationColor(params.value);
        return (
          <Chip
            label={params.value}
            size="small"
            sx={{
              bgcolor: alpha(color, 0.15),
              color: color,
              fontWeight: 600,
              fontSize: '0.65rem',
            }}
          />
        );
      }
    },
    {
      field: 'confidence',
      headerName: 'Confidence',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const value = params.value || 0;
        const color = value >= 90 ? SUCCESS_GREEN : value >= 75 ? WARNING_AMBER : '#dc2626';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 40, height: 6, bgcolor: alpha('#64748b', 0.2), borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ width: `${value}%`, height: '100%', bgcolor: color, borderRadius: 3 }} />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.75rem', color }}>{value}%</Typography>
          </Box>
        );
      }
    },
    {
      field: 'pOnTime',
      headerName: 'P(On-Time)',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const value = params.value || 0;
        const color = value >= 85 ? SUCCESS_GREEN : value >= 70 ? WARNING_AMBER : '#dc2626';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 40, height: 6, bgcolor: alpha('#64748b', 0.2), borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ width: `${value}%`, height: '100%', bgcolor: color, borderRadius: 3 }} />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.75rem', color }}>{value}%</Typography>
          </Box>
        );
      }
    },
    {
      field: 'slaRemaining',
      headerName: 'SLA',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const isUrgent = params.value?.includes('m') && !params.value?.includes('h');
        return (
          <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: isUrgent ? '#dc2626' : WARNING_AMBER }}>
            {params.value}
          </Typography>
        );
      }
    },
  ];

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    setChatMessages(prev => [
      ...prev,
      { type: 'user', text: chatInput },
      { type: 'ai', text: `Based on my analysis of ${selectedSignal?.id}, the penalty exposure is **$${selectedSignal?.penaltyExposure?.toLocaleString()}** if we miss the MABD. I recommend multi-node fulfillment to maximize P(On-Time).` }
    ]);
    setChatInput('');
  };

  // Detail View
  const renderDetailView = () => {
    if (!selectedSignal) return null;

    const signal = selectedSignal;

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: darkMode ? '#0d1117' : '#f8fafc' }}>
        {/* Order Context Bar */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 1.5,
          bgcolor: alpha(CYAN, 0.05),
          borderBottom: `1px solid ${alpha(CYAN, 0.2)}`,
          flexShrink: 0,
        }}>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => setSelectedSignal(null)}
              size="small"
              variant="outlined"
              sx={{ borderColor: 'divider' }}
            >
              Back to Queue
            </Button>
            <Box>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: CYAN }}>{signal.id}</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography sx={{ fontSize: '0.85rem', color: 'text.primary' }}>{signal.customer}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{signal.material} • {signal.quantity?.toLocaleString()} cases</Typography>
              </Stack>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: SUCCESS_GREEN }}>${signal.orderValue?.toLocaleString()}</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', textTransform: 'uppercase' }}>Order Value</Typography>
            </Box>
            <Chip
              label={signal.classification}
              sx={{
                bgcolor: alpha(getClassificationColor(signal.classification), 0.15),
                color: getClassificationColor(signal.classification),
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          </Stack>
        </Box>

        {/* Flow Indicator */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1,
          py: 1.5,
          px: 3,
          bgcolor: alpha('#f1f5f9', 0.8),
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}>
          {flowSteps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <Chip
                label={<Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600 }}>{step.id}</Typography>
                  <Typography sx={{ fontSize: '0.7rem' }}>{step.label}</Typography>
                </Stack>}
                size="small"
                sx={{
                  bgcolor: step.status === 'active' ? alpha(CYAN, 0.15) : alpha('#64748b', 0.08),
                  color: step.status === 'active' ? CYAN : 'text.secondary',
                  border: step.status === 'active' ? `1px solid ${alpha(CYAN, 0.3)}` : 'none',
                }}
              />
              {idx < flowSteps.length - 1 && (
                <Typography sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>→</Typography>
              )}
            </React.Fragment>
          ))}
        </Box>

        {/* 3-Column Layout */}
        <Grid container sx={{ flex: 1, minHeight: 500, overflow: 'visible' }}>
          {/* Left Panel - Demand Inbox */}
          <Grid item xs={12} md={3} sx={{ borderRight: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha('#000', 0.02) }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>Demand Inbox</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Multi-source order ingestion</Typography>
            </Box>
            <Box sx={{ p: 1.5 }}>
              {signals.map((s) => (
                <Paper
                  key={s.id}
                  onClick={() => setSelectedSignal(s)}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    cursor: 'pointer',
                    borderLeft: `3px solid ${getClassificationColor(s.classification)}`,
                    bgcolor: s.id === signal.id ? alpha(CYAN, 0.08) : 'background.paper',
                    '&:hover': { bgcolor: alpha(CYAN, 0.05) },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{s.customer}</Typography>
                    <Chip label={s.classification} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: alpha(getClassificationColor(s.classification), 0.15), color: getClassificationColor(s.classification) }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.7rem', color: CYAN, mb: 0.5 }}>{s.id}</Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', mb: 1 }}>{s.material}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled' }}>{s.receivedAgo}</Typography>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: s.slaRemaining?.includes('m') && !s.slaRemaining?.includes('h') ? '#dc2626' : SUCCESS_GREEN }}>
                      SLA: {s.slaRemaining}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
            {/* Signal Metadata */}
            <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: alpha('#f1f5f9', 0.5) }}>
              <Stack spacing={0.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>Source:</Typography>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 600 }}>EDI 850</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>Received:</Typography>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 600 }}>{signal.receivedAgo}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>SLA:</Typography>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: WARNING_AMBER }}>{signal.slaRemaining}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>Penalty:</Typography>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: '#dc2626' }}>${signal.penaltyExposure?.toLocaleString()}</Typography>
                </Stack>
              </Stack>
            </Box>
          </Grid>

          {/* Center Panel - Demand Intent Object */}
          <Grid item xs={12} md={5} sx={{ borderRight: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha('#000', 0.02) }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>Demand Intent Object</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Probabilistic demand signal with risk fingerprint</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              {/* Extracted Fields */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Extracted Fields</Typography>
                  <Chip label={`${signal.confidence}% Confidence`} size="small" sx={{ bgcolor: alpha(SUCCESS_GREEN, 0.1), color: SUCCESS_GREEN, fontSize: '0.65rem' }} />
                </Box>
                <Grid container spacing={1.5}>
                  {Object.entries(signal.extractedFields || {}).map(([key, field]) => (
                    <Grid item xs={6} key={key}>
                      <Paper sx={{ p: 1.5, bgcolor: alpha('#000', 0.02) }}>
                        <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', textTransform: 'uppercase', mb: 0.5 }}>{key}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: key.includes('Date') || key === 'mabd' ? WARNING_AMBER : 'text.primary', mb: 0.5 }}>{field.value}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={field.confidence}
                            sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: alpha('#64748b', 0.2), '& .MuiLinearProgress-bar': { bgcolor: field.confidence >= 90 ? SUCCESS_GREEN : WARNING_AMBER } }}
                          />
                          <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', minWidth: 28 }}>{field.confidence}%</Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* Hidden Constraints */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: alpha('#f87171', 0.03), borderColor: alpha('#f87171', 0.2) }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#dc2626', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon sx={{ fontSize: 16 }} /> Hidden Constraints Detected
                </Typography>
                <Stack spacing={1}>
                  {signal.hiddenConstraints?.map((c, idx) => (
                    <Paper key={idx} sx={{ p: 1.5, bgcolor: alpha('#000', 0.02), display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <ShippingIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{c.text}</Typography>
                    </Paper>
                  ))}
                </Stack>
              </Paper>

              {/* Volatility Fingerprint */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: alpha('#a855f7', 0.03), borderColor: alpha('#a855f7', 0.2) }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#a855f7', mb: 1.5 }}>
                  Demand Volatility Fingerprint
                </Typography>
                <Grid container spacing={1}>
                  {Object.entries(signal.volatilityFingerprint || {}).map(([key, value]) => {
                    const isActive = value === Math.max(...Object.values(signal.volatilityFingerprint || {}));
                    return (
                      <Grid item xs={3} key={key}>
                        <Paper sx={{
                          p: 1.5,
                          textAlign: 'center',
                          bgcolor: isActive ? alpha('#a855f7', 0.1) : alpha('#000', 0.02),
                          border: isActive ? `1px solid ${alpha('#a855f7', 0.3)}` : 'none',
                        }}>
                          <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', textTransform: 'capitalize' }}>{key}</Typography>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: isActive ? '#a855f7' : 'text.primary' }}>{value}%</Typography>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>

              {/* Service Risk Preview */}
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 1.5 }}>Service Risk Preview</Typography>
                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>P(On-Time) for this Ship-To + SKU + Date</Typography>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: signal.pOnTime >= 85 ? SUCCESS_GREEN : WARNING_AMBER }}>{signal.pOnTime}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={signal.pOnTime}
                    sx={{ height: 8, borderRadius: 4, bgcolor: alpha('#64748b', 0.2), '& .MuiLinearProgress-bar': { bgcolor: signal.pOnTime >= 85 ? SUCCESS_GREEN : WARNING_AMBER } }}
                  />
                </Box>
                <Paper sx={{ p: 1.5, bgcolor: alpha(WARNING_AMBER, 0.05), border: `1px solid ${alpha(WARNING_AMBER, 0.2)}` }}>
                  <Typography sx={{ fontSize: '0.7rem', color: WARNING_AMBER, lineHeight: 1.5 }}>
                    {signal.historyInsight}
                  </Typography>
                </Paper>
              </Paper>
            </Box>
          </Grid>

          {/* Right Panel - Axis AI Chat */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha('#000', 0.02) }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>Axis AI - Demand Intelligence</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Query demand patterns, history, constraints</Typography>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {chatMessages.map((msg, idx) => (
                <Paper
                  key={idx}
                  sx={{
                    p: 1.5,
                    mb: 1.5,
                    borderLeft: `2px solid ${msg.type === 'ai' ? CYAN : '#64748b'}`,
                    bgcolor: msg.type === 'ai' ? alpha(CYAN, 0.05) : alpha('#64748b', 0.05),
                  }}
                >
                  <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled', textTransform: 'uppercase', mb: 0.5 }}>
                    {msg.type === 'ai' ? 'Axis AI' : 'You'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.primary', lineHeight: 1.5 }}>{msg.text}</Typography>
                </Paper>
              ))}
            </Box>
            {/* Similar Orders */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.secondary', mb: 1 }}>Similar Past Orders</Typography>
              {signal.similarOrders?.map((order, idx) => (
                <Paper key={idx} sx={{ display: 'flex', justifyContent: 'space-between', p: 1, mb: 0.5, bgcolor: alpha('#000', 0.02) }}>
                  <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>{order.so} • {order.date} • {order.qty}</Typography>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: SUCCESS_GREEN }}>{order.match}% match</Typography>
                </Paper>
              ))}
            </Box>
            {/* Chat Input */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ask about demand patterns, history..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  sx={{ bgcolor: CYAN, '&:hover': { bgcolor: alpha(CYAN, 0.8) }, minWidth: 'auto', px: 2 }}
                >
                  <SendIcon sx={{ fontSize: 18 }} />
                </Button>
              </Stack>
            </Box>
          </Grid>
        </Grid>

      </Box>
    );
  };

  // Calculate stats for summary cards
  const stats = {
    totalSignals: signals.length,
    avgConfidence: signals.length > 0 ? Math.round(signals.reduce((sum, s) => sum + (s.confidence || 0), 0) / signals.length) : 0,
    highPriority: signals.filter(s => s.classification === 'PROMO' || s.classification === 'PANIC BUY').length,
    totalValue: signals.reduce((sum, s) => sum + (s.orderValue || 0), 0),
  };

  // List View
  const renderListView = () => (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack}
              sx={{ textDecoration: 'none', color: 'text.primary' }}>
              ORDLY.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              Demand Signal
            </Typography>
          </Breadcrumbs>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh">
              <IconButton color="primary"><RefreshIcon /></IconButton>
            </Tooltip>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
              Back to ORDLY.AI
            </Button>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <SensorsIcon sx={{ fontSize: 40, color: ACCENT_BLUE }} />
          <Typography variant="h5" fontWeight={600}>Demand Signal</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          AI-powered demand capture with volatility fingerprinting - Click a row to view signal details
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Active Signals', value: stats.totalSignals, color: ACCENT_BLUE },
          { label: 'Avg. Confidence', value: `${stats.avgConfidence}%`, color: CYAN },
          { label: 'High Priority', value: stats.highPriority, color: PRIMARY_BLUE },
          { label: 'Total Value', value: `$${(stats.totalValue / 1000).toFixed(0)}K`, color: '#1a5a9e' },
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
            <SensorsIcon sx={{ color: CYAN, fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
              Demand Signals Inbox
            </Typography>
          </Stack>
          <Chip label={`${signals.length} signals`} size="small" sx={{ bgcolor: alpha(CYAN, 0.12), color: CYAN, fontWeight: 600, fontSize: '0.7rem' }} />
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden', minHeight: 400 }}>
          <DataGrid
            rows={signals}
            columns={columns}
            density="compact"
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
              sorting: { sortModel: [{ field: 'slaRemaining', sort: 'asc' }] }
            }}
            pageSizeOptions={[10, 25, 50]}
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
            onRowClick={(params) => setSelectedSignal(params.row)}
            disableRowSelectionOnClick
            sx={{
              border: '1px solid rgba(0,0,0,0.08)',
              height: '100%',
              '& .MuiDataGrid-cell': { fontSize: '0.8rem', borderColor: alpha('#000', 0.08) },
              '& .MuiDataGrid-columnHeader': { bgcolor: '#f1f5f9', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' },
              '& .MuiDataGrid-row:hover': { bgcolor: alpha(CYAN, 0.08), cursor: 'pointer' },
              '& .MuiDataGrid-toolbarContainer': { p: 1.5, gap: 1, borderBottom: '1px solid', borderColor: 'divider' },
            }}
          />
        </Box>
      </Card>
    </Box>
  );

  return (
    <Box sx={{ height: '100%', overflow: 'auto', bgcolor: '#f8fafc' }}>
      {selectedSignal ? renderDetailView() : renderListView()}
    </Box>
  );
};

export default DemandSignal;
