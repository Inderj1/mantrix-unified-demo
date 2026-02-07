import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Paper,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  LinearProgress,
  alpha,
  Breadcrumbs,
  Link,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Note as NoteIcon,
  Create as CreateIcon,
  ThumbUp as ThumbUpIcon,
  Snooze as SnoozeIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Assignment as AssignmentIcon,
  SmartToy as SmartToyIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
  Business as BusinessIcon,
  Psychology as PsychologyIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Receipt as ReceiptIcon,
  Speed as SpeedIcon,
  Lightbulb as LightbulbIcon,
  Build as BuildIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  LocalShipping as LocalShippingIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { SEVERITY, STATUS, ALERT_TYPE_LABELS } from './kitAlertMockData';

// Colors - theme aware
const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  secondary: darkMode ? '#2d8ce6' : '#002352',
  success: darkMode ? '#36d068' : '#10b981',
  warning: darkMode ? '#f59e0b' : '#f59e0b',
  error: darkMode ? '#ff6b6b' : '#ef4444',
  info: darkMode ? '#4d9eff' : '#3b82f6',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  grey: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

// Alert type to specific actions mapping
const ALERT_ACTIONS = {
  // ML Model Health Alerts
  spec_low_confidence: [
    { key: 'manual_review', label: 'Manual Review', icon: SearchIcon, color: 'primary', description: 'Review PO/RFQ manually to verify specs' },
    { key: 'contact_customer', label: 'Contact Customer', icon: PhoneIcon, color: 'info', description: 'Call customer to clarify specifications' },
    { key: 'use_template', label: 'Use Template', icon: ReceiptIcon, color: 'secondary', description: 'Apply similar past order template' },
  ],
  material_match_gap: [
    { key: 'suggest_alternatives', label: 'Suggest Alternatives', icon: LightbulbIcon, color: 'primary', description: 'Present top matching materials to customer' },
    { key: 'custom_quote', label: 'Custom Quote', icon: ReceiptIcon, color: 'info', description: 'Create custom specification quote' },
    { key: 'notify_product', label: 'Flag for Product', icon: BuildIcon, color: 'warning', description: 'Flag as new product opportunity' },
  ],
  model_drift_detected: [
    { key: 'retrain_model', label: 'Retrain Model', icon: PsychologyIcon, color: 'primary', description: 'Initiate model retraining process' },
    { key: 'investigate_data', label: 'Investigate Data', icon: SearchIcon, color: 'info', description: 'Check for data quality issues' },
    { key: 'increase_monitoring', label: 'Increase Monitoring', icon: SpeedIcon, color: 'warning', description: 'Temporarily increase monitoring frequency' },
  ],

  // Pricing Intelligence Alerts
  price_below_optimal: [
    { key: 'reprice_quote', label: 'Reprice Quote', icon: AttachMoneyIcon, color: 'success', description: 'Adjust quote to optimal price' },
    { key: 'manager_review', label: 'Manager Review', icon: PersonIcon, color: 'warning', description: 'Request pricing approval from manager' },
    { key: 'accept_strategic', label: 'Accept Strategic', icon: ThumbUpIcon, color: 'info', description: 'Accept lower price for strategic growth' },
  ],
  margin_erosion: [
    { key: 'reset_pricing', label: 'Reset Pricing', icon: AttachMoneyIcon, color: 'primary', description: 'Reset base price to stop discount creep' },
    { key: 'cost_analysis', label: 'Cost Analysis', icon: SearchIcon, color: 'info', description: 'Investigate cost increase drivers' },
    { key: 'customer_discussion', label: 'Value Discussion', icon: PhoneIcon, color: 'warning', description: 'Discuss value proposition with customer' },
  ],
  win_rate_anomaly: [
    { key: 'competitor_analysis', label: 'Competitor Analysis', icon: SearchIcon, color: 'primary', description: 'Research competitor pricing in segment' },
    { key: 'sales_feedback', label: 'Sales Feedback', icon: PeopleIcon, color: 'info', description: 'Gather qualitative feedback from team' },
    { key: 'update_model', label: 'Update Model', icon: PsychologyIcon, color: 'warning', description: 'Update pricing model with new data' },
  ],
  price_elasticity_shift: [
    { key: 'adjust_strategy', label: 'Adjust Strategy', icon: TrendingUpIcon, color: 'primary', description: 'Update pricing strategy for segment' },
    { key: 'segment_review', label: 'Segment Review', icon: PeopleIcon, color: 'info', description: 'Re-evaluate customer classifications' },
    { key: 'test_pricing', label: 'Test Pricing', icon: SpeedIcon, color: 'warning', description: 'Run controlled pricing test' },
  ],

  // Customer Intelligence Alerts
  order_gap_detected: [
    { key: 'proactive_outreach', label: 'Contact Customer', icon: PhoneIcon, color: 'primary', description: 'Reach out before competitor does' },
    { key: 'send_quote', label: 'Send Quote', icon: ReceiptIcon, color: 'success', description: 'Proactively send typical order quote' },
    { key: 'schedule_review', label: 'Schedule QBR', icon: ScheduleIcon, color: 'info', description: 'Schedule quarterly business review' },
  ],
  churn_risk_high: [
    { key: 'executive_call', label: 'Executive Call', icon: PhoneIcon, color: 'error', description: 'Escalate to executive for intervention' },
    { key: 'special_offer', label: 'Special Offer', icon: AttachMoneyIcon, color: 'warning', description: 'Propose loyalty incentive or discount' },
    { key: 'win_back_plan', label: 'Win-back Plan', icon: AssignmentIcon, color: 'info', description: 'Develop structured retention strategy' },
  ],
  reorder_opportunity: [
    { key: 'auto_quote', label: 'Generate Quote', icon: ReceiptIcon, color: 'success', description: 'Auto-generate quote from history' },
    { key: 'check_upsell', label: 'Check Upsell', icon: TrendingUpIcon, color: 'primary', description: 'Review for volume/cross-sell opportunity' },
    { key: 'optimize_timing', label: 'Optimize Timing', icon: ScheduleIcon, color: 'info', description: 'Align with customer production schedule' },
  ],

  // Operations Intelligence Alerts
  lead_time_risk: [
    { key: 'expedite_production', label: 'Expedite', icon: SpeedIcon, color: 'error', description: 'Prioritize in production queue' },
    { key: 'alternative_material', label: 'Suggest Alternative', icon: LightbulbIcon, color: 'warning', description: 'Propose in-stock alternative material' },
    { key: 'split_shipment', label: 'Split Shipment', icon: LocalShippingIcon, color: 'info', description: 'Partial shipment to meet deadline' },
  ],
  upsell_opportunity: [
    { key: 'volume_tier', label: 'Volume Tier Offer', icon: TrendingUpIcon, color: 'success', description: 'Suggest order increase for discount' },
    { key: 'offer_alternative', label: 'Higher-Margin Alt', icon: AttachMoneyIcon, color: 'primary', description: 'Propose higher-margin alternative' },
    { key: 'bundle_products', label: 'Bundle Products', icon: ShoppingCartIcon, color: 'info', description: 'Cross-sell complementary products' },
  ],

  // COPA Profitability Intelligence Actions
  copa_margin_erosion: [
    { key: 'price_adjustment', label: 'Price Adjustment', icon: AttachMoneyIcon, color: 'primary', description: 'Submit price correction to SAP pricing module' },
    { key: 'cost_investigation', label: 'Cost Investigation', icon: SearchIcon, color: 'info', description: 'Investigate raw material cost drivers' },
    { key: 'product_mix', label: 'Product Mix Review', icon: TrendingUpIcon, color: 'warning', description: 'Shift mix toward higher-margin categories' },
  ],
  copa_customer_contribution: [
    { key: 'discount_review', label: 'Review Discounts', icon: AttachMoneyIcon, color: 'primary', description: 'Review customer discount structure in SAP' },
    { key: 'value_discussion', label: 'Value Discussion', icon: PhoneIcon, color: 'info', description: 'Schedule value proposition review with customer' },
    { key: 'tier_reclassify', label: 'Reclassify Tier', icon: PeopleIcon, color: 'warning', description: 'Consider customer pricing tier change' },
  ],
  copa_discount_leakage: [
    { key: 'rebate_recalc', label: 'Recalculate Rebates', icon: AttachMoneyIcon, color: 'error', description: 'Trigger rebate recalculation in SAP' },
    { key: 'condition_audit', label: 'Condition Audit', icon: SearchIcon, color: 'primary', description: 'Audit pricing condition records' },
    { key: 'tighten_approvals', label: 'Tighten Approvals', icon: AssignmentIcon, color: 'warning', description: 'Strengthen discount approval thresholds' },
  ],
  copa_cost_variance: [
    { key: 'variance_investigate', label: 'Investigate Variance', icon: SearchIcon, color: 'primary', description: 'Launch root-cause analysis for variance' },
    { key: 'allocation_review', label: 'Allocation Review', icon: ReceiptIcon, color: 'info', description: 'Review cost allocation methodology' },
    { key: 'budget_adjust', label: 'Budget Adjustment', icon: TrendingUpIcon, color: 'warning', description: 'Propose budget restatement' },
  ],
  copa_supplier_degradation: [
    { key: 'scorecard_update', label: 'Update Scorecard', icon: SpeedIcon, color: 'primary', description: 'Update vendor scorecard in SAP MM' },
    { key: 'alt_sourcing', label: 'Alternative Sourcing', icon: LocalShippingIcon, color: 'warning', description: 'Evaluate alternative suppliers' },
    { key: 'perf_review', label: 'Performance Review', icon: PeopleIcon, color: 'info', description: 'Schedule supplier review meeting' },
  ],
  copa_contract_profitability: [
    { key: 'renegotiate', label: 'Flag Renegotiation', icon: ReceiptIcon, color: 'error', description: 'Flag contract for renegotiation in Command Tower' },
    { key: 'scope_review', label: 'Scope Review', icon: SearchIcon, color: 'primary', description: 'Review scope creep and change orders' },
    { key: 'escalate_commercial', label: 'Escalate', icon: TrendingUpIcon, color: 'warning', description: 'Escalate to commercial leadership' },
  ],
  copa_regional_shift: [
    { key: 'regional_pricing', label: 'Regional Pricing', icon: AttachMoneyIcon, color: 'primary', description: 'Review regional pricing strategy' },
    { key: 'freight_optimize', label: 'Freight Analysis', icon: LocalShippingIcon, color: 'info', description: 'Analyze freight cost drivers by region' },
    { key: 'distribution_review', label: 'Distribution Review', icon: BuildIcon, color: 'warning', description: 'Review regional distribution efficiency' },
  ],
};

// Default actions for unknown types
const DEFAULT_ACTIONS = [
  { key: 'acknowledge', label: 'Acknowledge', icon: CheckCircleIcon, color: 'primary', description: 'Mark as reviewed' },
  { key: 'assign', label: 'Assign', icon: PersonIcon, color: 'info', description: 'Assign to team member' },
  { key: 'snooze', label: 'Snooze', icon: SnoozeIcon, color: 'warning', description: 'Snooze for later' },
];

// Severity helpers
const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical': return 'error';
    case 'high': return 'warning';
    case 'warning': return 'info';
    case 'opportunity': return 'success';
    case 'info': return 'default';
    default: return 'default';
  }
};

const getSeverityIcon = (severity) => {
  switch (severity) {
    case 'critical': return <ErrorIcon />;
    case 'high': return <WarningIcon />;
    case 'warning': return <InfoIcon />;
    case 'opportunity': return <LightbulbIcon />;
    case 'info': return <InfoIcon />;
    default: return <InfoIcon />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'new': return 'error';
    case 'acknowledged': return 'warning';
    case 'in_progress': return 'info';
    case 'snoozed': return 'default';
    case 'resolved': return 'success';
    default: return 'default';
  }
};

const getTimelineIcon = (action) => {
  switch (action) {
    case 'created': return <CreateIcon fontSize="small" />;
    case 'acknowledged': return <CheckCircleIcon fontSize="small" />;
    case 'assigned': return <PersonIcon fontSize="small" />;
    case 'note_added': return <NoteIcon fontSize="small" />;
    case 'action_taken': return <AssignmentTurnedInIcon fontSize="small" />;
    case 'escalated': return <TrendingUpIcon fontSize="small" />;
    case 'snoozed': return <SnoozeIcon fontSize="small" />;
    case 'resolved': return <AssignmentTurnedInIcon fontSize="small" />;
    default: return <InfoIcon fontSize="small" />;
  }
};

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const KitAlertDetail = ({ alert, onBack, onAction, darkMode = false }) => {
  const colors = getColors(darkMode);
  const [noteDialog, setNoteDialog] = useState(false);
  const [snoozeDialog, setSnoozeDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [resolveDialog, setResolveDialog] = useState(false);
  const [actionConfirmDialog, setActionConfirmDialog] = useState(null);

  const [noteText, setNoteText] = useState('');
  const [snoozeDuration, setSnoozeDuration] = useState('1h');
  const [assignee, setAssignee] = useState('');
  const [resolution, setResolution] = useState('');

  // Get actions specific to this alert type
  const alertActions = ALERT_ACTIONS[alert.type] || DEFAULT_ACTIONS;

  // Action handlers
  const handleAction = (actionKey) => {
    onAction(actionKey, { alertId: alert.id, action: actionKey, timestamp: new Date().toISOString() });
    setActionConfirmDialog(null);
  };

  const handleAssign = () => {
    onAction('assign', { alertId: alert.id, assignee });
    setAssignDialog(false);
    setAssignee('');
  };

  const handleSnooze = () => {
    onAction('snooze', { alertId: alert.id, duration: snoozeDuration });
    setSnoozeDialog(false);
  };

  const handleAddNote = () => {
    onAction('note', { alertId: alert.id, note: noteText });
    setNoteDialog(false);
    setNoteText('');
  };

  const handleResolve = () => {
    onAction('resolve', { alertId: alert.id, resolution });
    setResolveDialog(false);
    setResolution('');
  };

  return (
    <Box>
      {/* Breadcrumb Navigation */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: colors.textSecondary }} />}>
          <Link
            component="button"
            variant="body1"
            onClick={onBack}
            sx={{ textDecoration: 'none', color: colors.text, '&:hover': { textDecoration: 'underline' } }}
          >
            ENTERPRISE PULSE
          </Link>
          <Link
            component="button"
            variant="body1"
            onClick={onBack}
            sx={{ textDecoration: 'none', color: colors.text, '&:hover': { textDecoration: 'underline' } }}
          >
            Proactive Alerts
          </Link>
          <Typography variant="body1" fontWeight={600} sx={{ color: colors.primary }}>
            Alert Detail
          </Typography>
        </Breadcrumbs>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          variant="outlined"
          size="small"
          sx={{ color: colors.primary, borderColor: colors.primary }}
        >
          Back
        </Button>
      </Stack>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton sx={{ bgcolor: alpha(colors.primary, 0.1) }}>
            <WarningIcon sx={{ color: colors.primary }} />
          </IconButton>
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Chip
                icon={getSeverityIcon(alert.severity)}
                label={alert.severity === 'opportunity' ? 'OPPORTUNITY' : alert.severity.toUpperCase()}
                size="small"
                color={getSeverityColor(alert.severity)}
              />
              <Chip
                label={ALERT_TYPE_LABELS[alert.type] || alert.type}
                size="small"
                variant="outlined"
              />
              <Chip
                label={alert.status.replace('_', ' ').toUpperCase()}
                size="small"
                color={getStatusColor(alert.status)}
                variant="outlined"
              />
            </Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
              {alert.title}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              {alert.message}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content - 3 Columns */}
      <Grid container spacing={2} mb={3}>
        {/* Column 1: Business Context */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%', bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: colors.text }}>
                <BusinessIcon fontSize="small" sx={{ color: colors.primary }} />
                Business Context
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {alert.customer && (
                  <>
                    <Box>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>Customer</Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>{alert.customer.name}</Typography>
                      <Box display="flex" gap={0.5} mt={0.5}>
                        <Chip label={alert.customer.segment} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                        <Chip label={alert.customer.region} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                      </Box>
                    </Box>
                  </>
                )}
                {alert.quote_id && (
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>Quote ID</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>{alert.quote_id}</Typography>
                  </Box>
                )}
                {alert.material && (
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>Material</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>{alert.material}</Typography>
                  </Box>
                )}
                {alert.ml_model && (
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      <PsychologyIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                      ML Model
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>{alert.ml_model}</Typography>
                  </Box>
                )}
                <Divider />
                <Box display="flex" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      <AttachMoneyIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                      Revenue Impact
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color={alert.severity === 'opportunity' ? 'success.main' : 'error.main'}>
                      ${(alert.revenue_impact || 0).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>Confidence</Typography>
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                      {Math.round((alert.confidence_score || 0) * 100)}%
                    </Typography>
                  </Box>
                </Box>
                {alert.margin_impact > 0 && (
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>Margin Impact</Typography>
                    <Typography variant="body2" fontWeight={600} color="warning.main">
                      ${alert.margin_impact.toLocaleString()}
                    </Typography>
                  </Box>
                )}
                {alert.sales_rep && (
                  <Box>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>Sales Rep</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>{alert.sales_rep.name}</Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>{alert.sales_rep.role}</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Column 2: Timeline */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%', bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: colors.text }}>
                <ScheduleIcon fontSize="small" sx={{ color: colors.primary }} />
                Activity Timeline
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {(alert.action_history || []).map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      gap: 1.5,
                      pb: 2,
                      position: 'relative',
                      '&::before': index < (alert.action_history?.length || 0) - 1 ? {
                        content: '""',
                        position: 'absolute',
                        left: 14,
                        top: 28,
                        bottom: 0,
                        width: 2,
                        bgcolor: 'divider',
                      } : {},
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: alpha(colors.primary, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: colors.primary,
                        flexShrink: 0,
                      }}
                    >
                      {getTimelineIcon(item.action)}
                    </Box>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize', color: colors.text }}>
                        {item.action.replace(/_/g, ' ')}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }} display="block">
                        {item.notes}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textSecondary, opacity: 0.7 }}>
                        {item.by} - {formatDateTime(item.at)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Column 3: Actions Panel */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%', bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: colors.text }}>
                <AssignmentIcon fontSize="small" sx={{ color: colors.primary }} />
                Recommended Actions
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {/* AI Recommendation */}
              {alert.ai_suggestion && (
                <Paper
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: alpha(colors.primary, 0.05),
                    border: '1px solid',
                    borderColor: alpha(colors.primary, 0.2),
                    borderRadius: 2,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <SmartToyIcon sx={{ color: colors.primary, fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight={600} color="primary">
                      AI Recommendation
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 1, color: colors.text }}>
                    <strong>{alert.ai_suggestion.action.replace(/_/g, ' ').toUpperCase()}</strong>: {alert.ai_suggestion.reason}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LinearProgress
                      variant="determinate"
                      value={alert.ai_suggestion.confidence * 100}
                      sx={{ flex: 1, height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      {Math.round(alert.ai_suggestion.confidence * 100)}% confidence
                    </Typography>
                  </Box>
                </Paper>
              )}

              {/* Type-Specific Action Buttons */}
              <Typography variant="caption" sx={{ color: colors.textSecondary }} display="block" mb={1}>
                Actions for {ALERT_TYPE_LABELS[alert.type] || alert.type}
              </Typography>
              <Grid container spacing={1} mb={2}>
                {alertActions.map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <Grid item xs={12} key={action.key}>
                      <Button
                        fullWidth
                        variant={action.color === 'success' || action.color === 'primary' ? 'contained' : 'outlined'}
                        color={action.color}
                        size="small"
                        startIcon={<ActionIcon />}
                        onClick={() => setActionConfirmDialog(action)}
                        sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{action.label}</Typography>
                          <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                            {action.description}
                          </Typography>
                        </Box>
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* General Actions */}
              <Typography variant="caption" sx={{ color: colors.textSecondary }} display="block" mb={1}>
                General Actions
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<PersonIcon />}
                    onClick={() => setAssignDialog(true)}
                  >
                    Assign
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<SnoozeIcon />}
                    onClick={() => setSnoozeDialog(true)}
                  >
                    Snooze
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<NoteIcon />}
                    onClick={() => setNoteDialog(true)}
                  >
                    Add Note
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => setResolveDialog(true)}
                  >
                    Resolve
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alert Metadata */}
      <Card variant="outlined" sx={{ bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
            <Box display="flex" alignItems="center" gap={0.5}>
              <AccessTimeIcon fontSize="small" sx={{ color: colors.grey }} />
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                Triggered: {formatDateTime(alert.triggered_at)}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <ScheduleIcon fontSize="small" sx={{ color: colors.grey }} />
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                Alert ID: {alert.id}
              </Typography>
            </Box>
            {alert.metrics && Object.keys(alert.metrics).length > 0 && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <InfoIcon fontSize="small" sx={{ color: colors.grey }} />
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                  {Object.entries(alert.metrics).slice(0, 3).map(([k, v]) =>
                    `${k.replace(/_/g, ' ')}: ${typeof v === 'number' ? (v < 1 ? `${Math.round(v * 100)}%` : v.toLocaleString()) : v}`
                  ).join(' | ')}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog
        open={!!actionConfirmDialog}
        onClose={() => setActionConfirmDialog(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: colors.cardBg,
            border: `1px solid ${colors.border}`,
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {actionConfirmDialog && React.createElement(actionConfirmDialog.icon, { color: actionConfirmDialog.color })}
            <Typography sx={{ color: colors.text }}>Confirm: {actionConfirmDialog?.label}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
            {actionConfirmDialog?.description}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text }}>
            This action will be recorded in the activity timeline for <strong>{alert.customer?.name || 'this insight'}</strong>.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionConfirmDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            color={actionConfirmDialog?.color || 'primary'}
            onClick={() => handleAction(actionConfirmDialog?.key)}
          >
            Confirm {actionConfirmDialog?.label}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog
        open={noteDialog}
        onClose={() => setNoteDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: colors.cardBg,
            border: `1px solid ${colors.border}`,
          }
        }}
      >
        <DialogTitle sx={{ color: colors.text }}>Add Note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            placeholder="Enter your note..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddNote} disabled={!noteText}>Add Note</Button>
        </DialogActions>
      </Dialog>

      {/* Snooze Dialog */}
      <Dialog
        open={snoozeDialog}
        onClose={() => setSnoozeDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: colors.cardBg,
            border: `1px solid ${colors.border}`,
          }
        }}
      >
        <DialogTitle sx={{ color: colors.text }}>Snooze Insight</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Duration</InputLabel>
            <Select value={snoozeDuration} onChange={(e) => setSnoozeDuration(e.target.value)} label="Duration">
              <MenuItem value="1h">1 Hour</MenuItem>
              <MenuItem value="4h">4 Hours</MenuItem>
              <MenuItem value="8h">8 Hours</MenuItem>
              <MenuItem value="24h">24 Hours</MenuItem>
              <MenuItem value="48h">48 Hours</MenuItem>
              <MenuItem value="1w">1 Week</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSnoozeDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSnooze}>Snooze</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog
        open={assignDialog}
        onClose={() => setAssignDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: colors.cardBg,
            border: `1px solid ${colors.border}`,
          }
        }}
      >
        <DialogTitle sx={{ color: colors.text }}>Assign Insight</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Assign To</InputLabel>
            <Select value={assignee} onChange={(e) => setAssignee(e.target.value)} label="Assign To">
              <MenuItem value="john">John Mitchell - Senior Account Manager</MenuItem>
              <MenuItem value="sarah">Sarah Chen - Account Executive</MenuItem>
              <MenuItem value="michael">Michael Weber - Key Account Manager</MenuItem>
              <MenuItem value="lisa">Lisa Rodriguez - Sales Manager</MenuItem>
              <MenuItem value="david">David Kim - Regional Director</MenuItem>
              <MenuItem value="pricing_team">Pricing Team</MenuItem>
              <MenuItem value="product_team">Product Team</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssign} disabled={!assignee}>Assign</Button>
        </DialogActions>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog
        open={resolveDialog}
        onClose={() => setResolveDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: colors.cardBg,
            border: `1px solid ${colors.border}`,
          }
        }}
      >
        <DialogTitle sx={{ color: colors.text }}>Resolve Insight</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Resolution Type</InputLabel>
            <Select value={resolution} onChange={(e) => setResolution(e.target.value)} label="Resolution Type">
              <MenuItem value="action_taken">Action Taken - Recommendation Applied</MenuItem>
              <MenuItem value="quote_sent">Quote Sent to Customer</MenuItem>
              <MenuItem value="customer_contacted">Customer Contacted</MenuItem>
              <MenuItem value="price_adjusted">Price Adjusted</MenuItem>
              <MenuItem value="not_applicable">Not Applicable - No Action Needed</MenuItem>
              <MenuItem value="declined">Declined - Strategic Decision</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Resolution notes (optional)..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialog(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleResolve} disabled={!resolution}>Resolve</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KitAlertDetail;
