import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Divider,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  Checkbox,
  Tooltip,
  alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import PhoneIcon from '@mui/icons-material/Phone';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SecurityIcon from '@mui/icons-material/Security';
import TuneIcon from '@mui/icons-material/Tune';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SpeedIcon from '@mui/icons-material/Speed';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import StorageIcon from '@mui/icons-material/Storage';
import SyncIcon from '@mui/icons-material/Sync';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GavelIcon from '@mui/icons-material/Gavel';
import TimelineIcon from '@mui/icons-material/Timeline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const DISTRIBUTION_CENTERS = [
  'P1000 Detroit (Midwest)',
  'P2000 Phoenix (West)',
  'P3000 Seattle (West)',
  'P4000 Atlanta (Southeast)',
  'P5000 Houston (Central)',
];

const PRODUCT_LINES = [
  'Hydraulic Pump Assembly',
  'Bearing Assembly 2x4',
  'Gasket Kit Standard',
  'Control Valve Assembly',
  'Electronic Sensor Module',
  'Legacy Connector Type-B',
  'Precision Gear Set',
];

const RETAIL_PARTNERS = [
  'AutoMotion Corp', 'Pacific Equipment', 'Apex Manufacturing', 'TechDrive Systems', 'Precision Parts',
  'Summit Industrial', 'Western Hydraulics', 'Lakeside Engineering', 'Continental Motors', 'Redline Automation',
];

const INVENTORY_METRICS = [
  'Stock Level',
  'Days of Supply',
  'Safety Stock Coverage',
  'Reorder Point',
  'Working Capital',
  'Fill Rate',
  'Stockout Frequency',
];

const AUTOMATED_ACTIONS = [
  { key: 'auto_po', label: 'Auto-Generate Purchase Orders', desc: 'Create POs when reorder point is reached', icon: ShoppingCartIcon },
  { key: 'safety_stock', label: 'Safety Stock Adjustment', desc: 'Dynamically adjust safety stock levels based on demand signals', icon: SecurityIcon },
  { key: 'dc_transfer', label: 'Inter-DC Stock Transfer', desc: 'Trigger rebalancing transfers between distribution centers', icon: SwapHorizIcon },
  { key: 'mrp_tuning', label: 'MRP Parameter Tuning', desc: 'Auto-optimize lot size, lead time, and reorder point', icon: TuneIcon },
  { key: 'forecast_override', label: 'Demand Forecast Override', desc: 'Push AI forecast adjustments to demand planner', icon: TrendingUpIcon },
  { key: 'supplier_escalation', label: 'Supplier Escalation', desc: 'Auto-escalate to supplier on lead time breach', icon: LocalShippingIcon },
];

const ESCALATION_TIERS = [
  { tier: 1, label: 'Tier 1', defaultHours: '0-2', action: 'In-app notification + AI recommendation', icon: NotificationsIcon },
  { tier: 2, label: 'Tier 2', defaultHours: '2-4', action: 'Email/Slack to assigned planner', icon: EmailIcon },
  { tier: 3, label: 'Tier 3', defaultHours: '4-8', action: 'SMS + manager notification', icon: SmsIcon },
  { tier: 4, label: 'Tier 4', defaultHours: '8+', action: 'Voice call + auto-execute if enabled', icon: PhoneIcon },
];

const AgentConfigForm = ({ agent, onClose, isNew = false, darkMode = false }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const isReadOnly = !isNew && agent?.id;

  const getColors = (dm) => ({
    primary: dm ? '#4d9eff' : '#00357a',
    secondary: dm ? '#2d8ce6' : '#002352',
    success: dm ? '#36d068' : '#10b981',
    warning: dm ? '#f59e0b' : '#f59e0b',
    error: dm ? '#ff6b6b' : '#ef4444',
    text: dm ? '#e6edf3' : '#1e293b',
    textSecondary: dm ? '#8b949e' : '#64748b',
    background: dm ? '#0d1117' : '#f8fbfd',
    paper: dm ? '#161b22' : '#ffffff',
    cardBg: dm ? '#21262d' : '#ffffff',
    border: dm ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  });

  const colors = getColors(darkMode);

  const [config, setConfig] = useState({
    name: '',
    description: '',
    severity: 'medium',
    frequency: 'daily',
    enabled: true,
    alert_condition: '',
    // Automation
    automation_level: 'recommend',
    automated_actions: {
      auto_po: false,
      safety_stock: false,
      dc_transfer: false,
      mrp_tuning: false,
      forecast_override: false,
      supplier_escalation: false,
    },
    // Monitoring Scope
    monitored_dcs: [],
    monitored_products: [],
    monitored_partners: [],
    monitored_metrics: ['Stock Level', 'Days of Supply'],
    // ERP Integration
    erp_system: 'sap_s4hana',
    writeback_mode: 'read_only',
    erp_target_module: 'MM',
    erp_approval_required: true,
    command_tower_sync: true,
    // AI Analysis
    confidence_threshold: 85,
    analysis_depth: 'standard',
    ml_model: '',
    lookback_window: '13_weeks',
    forecast_horizon: '4_weeks',
    // Escalation
    escalation_rules: [
      { tier: 1, enabled: true, hours: '0-2' },
      { tier: 2, enabled: true, hours: '2-4' },
      { tier: 3, enabled: true, hours: '4-8' },
      { tier: 4, enabled: false, hours: '8+' },
    ],
    // Notifications (existing)
    notification_config: {
      email: false,
      sms: false,
      voice_call: false,
      slack: false,
      teams: false,
      ai_agent: false,
    },
    notification_recipients: [],
  });

  const [newRecipient, setNewRecipient] = useState({ type: 'email', value: '' });

  useEffect(() => {
    if (agent) {
      setConfig(prev => ({
        ...prev,
        name: agent.name || '',
        description: agent.description || '',
        severity: agent.severity || 'medium',
        frequency: agent.frequency || 'daily',
        enabled: agent.enabled !== false,
        alert_condition: agent.alert_condition || '',
        ml_model: agent.ml_model || '',
        notification_config: agent.notification_config || prev.notification_config,
        notification_recipients: agent.notification_recipients || [],
        // Populate scope defaults from agent data
        monitored_dcs: agent.monitored_dcs || DISTRIBUTION_CENTERS.slice(0, 3),
        monitored_products: agent.monitored_products || PRODUCT_LINES.slice(0, 4),
        monitored_partners: agent.monitored_partners || RETAIL_PARTNERS.slice(0, 5),
        automation_level: agent.automation_level || 'recommend',
        automated_actions: agent.automated_actions || prev.automated_actions,
      }));
    }
  }, [agent]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`/api/v1/pulse/monitors/${agent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => { onClose(); }, 1500);
      } else {
        setError(data.detail || 'Failed to update configuration');
      }
    } catch (err) {
      setError(`Error saving configuration: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = (channel) => {
    setConfig({
      ...config,
      notification_config: {
        ...config.notification_config,
        [channel]: !config.notification_config[channel],
      },
    });
  };

  const handleActionToggle = (actionKey) => {
    setConfig({
      ...config,
      automated_actions: {
        ...config.automated_actions,
        [actionKey]: !config.automated_actions[actionKey],
      },
    });
  };

  const handleChipToggle = (field, value) => {
    const current = config[field];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setConfig({ ...config, [field]: updated });
  };

  const handleEscalationToggle = (tierIndex) => {
    const updated = [...config.escalation_rules];
    updated[tierIndex] = { ...updated[tierIndex], enabled: !updated[tierIndex].enabled };
    setConfig({ ...config, escalation_rules: updated });
  };

  const handleAddRecipient = () => {
    if (newRecipient.value.trim()) {
      setConfig({
        ...config,
        notification_recipients: [...config.notification_recipients, { ...newRecipient }],
      });
      setNewRecipient({ type: 'email', value: '' });
    }
  };

  const handleRemoveRecipient = (index) => {
    setConfig({
      ...config,
      notification_recipients: config.notification_recipients.filter((_, i) => i !== index),
    });
  };

  const sectionHeaderSx = { color: colors.text, display: 'flex', alignItems: 'center', gap: 1 };
  const cardSx = { bgcolor: colors.cardBg, border: `1px solid ${colors.border}` };
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: darkMode ? colors.paper : undefined,
      color: colors.text,
      '& fieldset': { borderColor: colors.border },
      '&:hover fieldset': { borderColor: colors.primary },
    },
    '& .MuiInputLabel-root': { color: colors.textSecondary },
    '& .MuiInputBase-input': { color: colors.text },
    '& .MuiSelect-icon': { color: colors.textSecondary },
  };
  const menuProps = {
    PaperProps: {
      sx: {
        bgcolor: darkMode ? colors.cardBg : undefined,
        border: darkMode ? `1px solid ${colors.border}` : undefined,
        '& .MuiMenuItem-root': {
          color: colors.text,
          '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : undefined },
          '&.Mui-selected': { bgcolor: darkMode ? 'rgba(77,166,255,0.15)' : undefined },
        },
      },
    },
  };

  const automationLevelColors = {
    recommend: colors.primary,
    simulate: colors.warning,
    execute: colors.success,
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Configuration saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* ─── SECTION 1: Basic Settings ─── */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={sectionHeaderSx}>
            <VisibilityIcon sx={{ fontSize: 20, color: colors.primary }} />
            Basic Settings
          </Typography>
          <Divider sx={{ mb: 2, borderColor: colors.border }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth label="Agent Name" value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                disabled={isReadOnly} InputProps={{ readOnly: isReadOnly }}
                helperText={isReadOnly ? 'Agent name cannot be modified' : ''}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth multiline rows={2} label="Description" value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                disabled={isReadOnly} InputProps={{ readOnly: isReadOnly }}
                helperText={isReadOnly ? 'Description cannot be modified' : ''}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={inputSx}>
                <InputLabel>Severity</InputLabel>
                <Select value={config.severity} label="Severity" onChange={(e) => setConfig({ ...config, severity: e.target.value })} MenuProps={menuProps}>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={inputSx}>
                <InputLabel>Frequency</InputLabel>
                <Select value={config.frequency} label="Frequency" onChange={(e) => setConfig({ ...config, frequency: e.target.value })} MenuProps={menuProps}>
                  <MenuItem value="real-time">Real-time</MenuItem>
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth label="Alert Condition" value={config.alert_condition}
                onChange={(e) => setConfig({ ...config, alert_condition: e.target.value })}
                disabled={isReadOnly} InputProps={{ readOnly: isReadOnly }}
                helperText={isReadOnly ? 'Alert condition cannot be modified' : 'SQL condition to trigger alert'}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={config.enabled} onChange={(e) => setConfig({ ...config, enabled: e.target.checked })} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: colors.primary }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.primary } }} />}
                label={<Typography variant="body2" sx={{ color: colors.text }}>Enable Agent</Typography>}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* ─── SECTION 2: Automated Actions ─── */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={sectionHeaderSx}>
            <SpeedIcon sx={{ fontSize: 20, color: colors.primary }} />
            Automated Actions
          </Typography>
          <Divider sx={{ mb: 2, borderColor: colors.border }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1.5 }}>
              Automation Level
            </Typography>
            <ToggleButtonGroup
              value={config.automation_level}
              exclusive
              onChange={(e, val) => val && setConfig({ ...config, automation_level: val })}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  color: colors.textSecondary,
                  borderColor: colors.border,
                  textTransform: 'none',
                  px: 3,
                  '&.Mui-selected': {
                    bgcolor: alpha(automationLevelColors[config.automation_level], 0.15),
                    color: automationLevelColors[config.automation_level],
                    borderColor: automationLevelColors[config.automation_level],
                    fontWeight: 600,
                    '&:hover': { bgcolor: alpha(automationLevelColors[config.automation_level], 0.25) },
                  },
                },
              }}
            >
              <ToggleButton value="recommend">
                <PsychologyIcon sx={{ fontSize: 18, mr: 0.5 }} /> Recommend
              </ToggleButton>
              <ToggleButton value="simulate">
                <TimelineIcon sx={{ fontSize: 18, mr: 0.5 }} /> Simulate
              </ToggleButton>
              <ToggleButton value="execute">
                <CheckCircleIcon sx={{ fontSize: 18, mr: 0.5 }} /> Execute
              </ToggleButton>
            </ToggleButtonGroup>
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: colors.textSecondary }}>
              {config.automation_level === 'recommend' && 'AI analyzes data and suggests actions for human review'}
              {config.automation_level === 'simulate' && 'AI runs what-if scenarios before proposing actions'}
              {config.automation_level === 'execute' && 'AI auto-executes approved actions in ERP system'}
            </Typography>
          </Box>

          <Grid container spacing={1.5}>
            {AUTOMATED_ACTIONS.map(({ key, label, desc, icon: Icon }) => (
              <Grid item xs={12} sm={6} key={key}>
                <Card variant="outlined" sx={{
                  ...cardSx,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderColor: config.automated_actions[key] ? alpha(colors.primary, 0.5) : colors.border,
                  bgcolor: config.automated_actions[key] ? alpha(colors.primary, darkMode ? 0.1 : 0.03) : colors.cardBg,
                  '&:hover': { borderColor: colors.primary, transform: 'translateY(-1px)' },
                }}
                  onClick={() => handleActionToggle(key)}
                >
                  <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                        <Icon sx={{ fontSize: 20, color: config.automated_actions[key] ? colors.primary : colors.textSecondary }} />
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ color: colors.text, lineHeight: 1.3 }}>
                            {label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: colors.textSecondary, lineHeight: 1.2 }}>
                            {desc}
                          </Typography>
                        </Box>
                      </Box>
                      <Switch
                        size="small"
                        checked={config.automated_actions[key]}
                        onChange={() => handleActionToggle(key)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: colors.primary }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.primary } }}
                      />
                    </Box>
                    {config.automated_actions[key] && (
                      <Chip
                        label={config.automation_level.charAt(0).toUpperCase() + config.automation_level.slice(1)}
                        size="small"
                        sx={{
                          mt: 0.5, ml: 3.5, height: 20, fontSize: '0.65rem', fontWeight: 600,
                          bgcolor: alpha(automationLevelColors[config.automation_level], 0.15),
                          color: automationLevelColors[config.automation_level],
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* ─── SECTION 3: Monitoring Scope ─── */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={sectionHeaderSx}>
            <WarehouseIcon sx={{ fontSize: 20, color: colors.primary }} />
            Monitoring Scope
          </Typography>
          <Divider sx={{ mb: 2, borderColor: colors.border }} />

          <Box sx={{ mb: 2.5 }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: colors.text, mb: 1 }}>
              Distribution Centers
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {DISTRIBUTION_CENTERS.map(dc => (
                <Chip
                  key={dc}
                  label={dc}
                  size="small"
                  onClick={() => handleChipToggle('monitored_dcs', dc)}
                  variant={config.monitored_dcs.includes(dc) ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: 500, fontSize: '0.75rem', height: 30, borderRadius: '8px',
                    ...(config.monitored_dcs.includes(dc) ? {
                      bgcolor: colors.primary,
                      color: '#fff',
                      border: `1px solid ${colors.primary}`,
                      '&:hover': { bgcolor: alpha(colors.primary, 0.85) },
                    } : {
                      bgcolor: darkMode ? alpha(colors.textSecondary, 0.08) : '#f1f5f9',
                      color: colors.textSecondary,
                      border: `1px solid ${darkMode ? alpha(colors.textSecondary, 0.15) : '#e2e8f0'}`,
                      '&:hover': { bgcolor: alpha(colors.primary, 0.1), borderColor: alpha(colors.primary, 0.3), color: colors.primary },
                    }),
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 2.5 }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: colors.text, mb: 1 }}>
              Product Lines
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {PRODUCT_LINES.map(p => (
                <Chip
                  key={p}
                  label={p}
                  size="small"
                  onClick={() => handleChipToggle('monitored_products', p)}
                  variant={config.monitored_products.includes(p) ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: 500, fontSize: '0.75rem', height: 30, borderRadius: '8px',
                    ...(config.monitored_products.includes(p) ? {
                      bgcolor: '#10b981',
                      color: '#fff',
                      border: '1px solid #10b981',
                      '&:hover': { bgcolor: alpha('#10b981', 0.85) },
                    } : {
                      bgcolor: darkMode ? alpha(colors.textSecondary, 0.08) : '#f1f5f9',
                      color: colors.textSecondary,
                      border: `1px solid ${darkMode ? alpha(colors.textSecondary, 0.15) : '#e2e8f0'}`,
                      '&:hover': { bgcolor: alpha('#10b981', 0.1), borderColor: alpha('#10b981', 0.3), color: '#10b981' },
                    }),
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ mb: 2.5 }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: colors.text, mb: 1 }}>
              Retail Partners
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {RETAIL_PARTNERS.map(rp => (
                <Chip
                  key={rp}
                  label={rp}
                  size="small"
                  onClick={() => handleChipToggle('monitored_partners', rp)}
                  variant={config.monitored_partners.includes(rp) ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: 500, fontSize: '0.75rem', height: 30, borderRadius: '8px',
                    ...(config.monitored_partners.includes(rp) ? {
                      bgcolor: '#8b5cf6',
                      color: '#fff',
                      border: '1px solid #8b5cf6',
                      '&:hover': { bgcolor: alpha('#8b5cf6', 0.85) },
                    } : {
                      bgcolor: darkMode ? alpha(colors.textSecondary, 0.08) : '#f1f5f9',
                      color: colors.textSecondary,
                      border: `1px solid ${darkMode ? alpha(colors.textSecondary, 0.15) : '#e2e8f0'}`,
                      '&:hover': { bgcolor: alpha('#8b5cf6', 0.1), borderColor: alpha('#8b5cf6', 0.3), color: '#8b5cf6' },
                    }),
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ color: colors.text, mb: 1 }}>
              Inventory Metrics to Monitor
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {INVENTORY_METRICS.map(m => (
                <FormControlLabel
                  key={m}
                  control={
                    <Checkbox
                      size="small"
                      checked={config.monitored_metrics.includes(m)}
                      onChange={() => handleChipToggle('monitored_metrics', m)}
                      sx={{ '&.Mui-checked': { color: colors.primary }, color: colors.textSecondary }}
                    />
                  }
                  label={<Typography variant="caption" sx={{ color: colors.text }}>{m}</Typography>}
                  sx={{ mr: 2 }}
                />
              ))}
            </Box>
          </Box>
        </Grid>

        {/* ─── SECTION 4: ERP Integration ─── */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={sectionHeaderSx}>
            <StorageIcon sx={{ fontSize: 20, color: colors.primary }} />
            ERP Integration
          </Typography>
          <Divider sx={{ mb: 2, borderColor: colors.border }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small" sx={inputSx}>
                <InputLabel>ERP System</InputLabel>
                <Select value={config.erp_system} label="ERP System" onChange={(e) => setConfig({ ...config, erp_system: e.target.value })} MenuProps={menuProps}>
                  <MenuItem value="sap_s4hana">SAP S/4HANA</MenuItem>
                  <MenuItem value="sap_ibp">SAP IBP</MenuItem>
                  <MenuItem value="oracle_erp">Oracle ERP Cloud</MenuItem>
                  <MenuItem value="manual">Manual / Excel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small" sx={inputSx}>
                <InputLabel>Target Module</InputLabel>
                <Select value={config.erp_target_module} label="Target Module" onChange={(e) => setConfig({ ...config, erp_target_module: e.target.value })} MenuProps={menuProps}>
                  <MenuItem value="MM">MM - Materials Management</MenuItem>
                  <MenuItem value="PP">PP - Production Planning</MenuItem>
                  <MenuItem value="SD">SD - Sales & Distribution</MenuItem>
                  <MenuItem value="CO">CO - Controlling</MenuItem>
                  <MenuItem value="WM">WM - Warehouse Management</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small" sx={inputSx}>
                <InputLabel>Writeback Mode</InputLabel>
                <Select value={config.writeback_mode} label="Writeback Mode" onChange={(e) => setConfig({ ...config, writeback_mode: e.target.value })} MenuProps={menuProps}>
                  <MenuItem value="read_only">Read-Only</MenuItem>
                  <MenuItem value="bidirectional">Bidirectional</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined" sx={{ ...cardSx, p: 0 }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <GavelIcon sx={{ fontSize: 18, color: colors.warning }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>Approval Required</Typography>
                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>Human approval before ERP writes</Typography>
                      </Box>
                    </Box>
                    <Switch
                      size="small"
                      checked={config.erp_approval_required}
                      onChange={(e) => setConfig({ ...config, erp_approval_required: e.target.checked })}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: colors.warning }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.warning } }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined" sx={{ ...cardSx, p: 0 }}>
                <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SyncIcon sx={{ fontSize: 18, color: colors.success }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>Command Tower Sync</Typography>
                        <Typography variant="caption" sx={{ color: colors.textSecondary }}>Send actions to Command Tower dashboard</Typography>
                      </Box>
                    </Box>
                    <Switch
                      size="small"
                      checked={config.command_tower_sync}
                      onChange={(e) => setConfig({ ...config, command_tower_sync: e.target.checked })}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: colors.success }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.success } }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* ─── SECTION 5: AI Analysis Settings ─── */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={sectionHeaderSx}>
            <PsychologyIcon sx={{ fontSize: 20, color: colors.primary }} />
            AI Analysis Settings
          </Typography>
          <Divider sx={{ mb: 2, borderColor: colors.border }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight={600} sx={{ color: colors.text, mb: 0.5 }}>
                Confidence Threshold: {config.confidence_threshold}%
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mb: 1 }}>
                Minimum confidence score to trigger an action
              </Typography>
              <Slider
                value={config.confidence_threshold}
                onChange={(e, val) => setConfig({ ...config, confidence_threshold: val })}
                min={50} max={99} step={1}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v}%`}
                sx={{
                  color: config.confidence_threshold >= 90 ? colors.success : config.confidence_threshold >= 75 ? colors.primary : colors.warning,
                  '& .MuiSlider-thumb': { width: 16, height: 16 },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small" sx={inputSx}>
                <InputLabel>Analysis Depth</InputLabel>
                <Select value={config.analysis_depth} label="Analysis Depth" onChange={(e) => setConfig({ ...config, analysis_depth: e.target.value })} MenuProps={menuProps}>
                  <MenuItem value="quick">Quick Scan - Fast surface-level check</MenuItem>
                  <MenuItem value="standard">Standard - Balanced analysis</MenuItem>
                  <MenuItem value="deep">Deep Analysis - Comprehensive with root cause</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              {config.ml_model && (
                <Box>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>ML Model</Typography>
                  <Chip
                    label={config.ml_model}
                    size="small"
                    sx={{
                      display: 'flex', width: 'fit-content', mt: 0.5,
                      bgcolor: alpha('#8b5cf6', darkMode ? 0.2 : 0.1),
                      color: darkMode ? '#a78bfa' : '#8b5cf6',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small" sx={inputSx}>
                <InputLabel>Lookback Window</InputLabel>
                <Select value={config.lookback_window} label="Lookback Window" onChange={(e) => setConfig({ ...config, lookback_window: e.target.value })} MenuProps={menuProps}>
                  <MenuItem value="4_weeks">4 Weeks</MenuItem>
                  <MenuItem value="8_weeks">8 Weeks</MenuItem>
                  <MenuItem value="13_weeks">13 Weeks</MenuItem>
                  <MenuItem value="26_weeks">26 Weeks</MenuItem>
                  <MenuItem value="52_weeks">52 Weeks</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small" sx={inputSx}>
                <InputLabel>Forecast Horizon</InputLabel>
                <Select value={config.forecast_horizon} label="Forecast Horizon" onChange={(e) => setConfig({ ...config, forecast_horizon: e.target.value })} MenuProps={menuProps}>
                  <MenuItem value="1_week">1 Week</MenuItem>
                  <MenuItem value="2_weeks">2 Weeks</MenuItem>
                  <MenuItem value="4_weeks">4 Weeks</MenuItem>
                  <MenuItem value="8_weeks">8 Weeks</MenuItem>
                  <MenuItem value="13_weeks">13 Weeks</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>

        {/* ─── SECTION 6: Escalation Rules ─── */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={sectionHeaderSx}>
            <AccountTreeIcon sx={{ fontSize: 20, color: colors.primary }} />
            Escalation Rules
          </Typography>
          <Divider sx={{ mb: 2, borderColor: colors.border }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {ESCALATION_TIERS.map((tier, idx) => {
              const rule = config.escalation_rules[idx];
              const TierIcon = tier.icon;
              const tierColors = [colors.primary, '#f59e0b', '#f97316', colors.error];
              return (
                <Card
                  key={tier.tier}
                  variant="outlined"
                  sx={{
                    ...cardSx,
                    borderColor: rule.enabled ? alpha(tierColors[idx], 0.4) : colors.border,
                    bgcolor: rule.enabled ? alpha(tierColors[idx], darkMode ? 0.08 : 0.02) : colors.cardBg,
                    opacity: rule.enabled ? 1 : 0.6,
                  }}
                >
                  <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                        <Box sx={{
                          width: 32, height: 32, borderRadius: 1,
                          bgcolor: alpha(tierColors[idx], 0.15),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <TierIcon sx={{ fontSize: 18, color: tierColors[idx] }} />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>
                              {tier.label}
                            </Typography>
                            <Chip
                              label={rule.hours + ' hrs'}
                              size="small"
                              sx={{
                                height: 18, fontSize: '0.65rem', fontWeight: 600,
                                bgcolor: alpha(tierColors[idx], 0.15),
                                color: tierColors[idx],
                              }}
                            />
                          </Box>
                          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                            {tier.action}
                          </Typography>
                        </Box>
                      </Box>
                      <Switch
                        size="small"
                        checked={rule.enabled}
                        onChange={() => handleEscalationToggle(idx)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': { color: tierColors[idx] },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: tierColors[idx] },
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Grid>

        {/* ─── SECTION 7: Notification Channels (existing) ─── */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={sectionHeaderSx}>
            <NotificationsIcon sx={{ fontSize: 20, color: colors.primary }} />
            Notification Channels
          </Typography>
          <Divider sx={{ mb: 2, borderColor: colors.border }} />

          <Grid container spacing={2}>
            {[
              { key: 'email', label: 'Email', icon: EmailIcon },
              { key: 'sms', label: 'SMS', icon: SmsIcon },
              { key: 'voice_call', label: 'Voice Call', icon: PhoneIcon },
              { key: 'slack', label: 'Slack', icon: NotificationsIcon },
              { key: 'teams', label: 'Teams', icon: NotificationsIcon },
            ].map(ch => (
              <Grid item xs={6} sm={4} key={ch.key}>
                <Card variant="outlined" sx={{ height: '100%', ...cardSx }}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ch.icon sx={{ mr: 1, color: colors.primary }} fontSize="small" />
                      <Typography variant="body2" sx={{ color: colors.text }}>{ch.label}</Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={config.notification_config[ch.key]}
                          onChange={() => handleNotificationToggle(ch.key)}
                          sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: colors.primary }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.primary } }}
                        />
                      }
                      label={<Typography variant="caption" sx={{ color: colors.textSecondary }}>{config.notification_config[ch.key] ? 'On' : 'Off'}</Typography>}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}

            <Grid item xs={12} sm={8}>
              <Card variant="outlined" sx={{ ...cardSx, height: '100%' }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PsychologyIcon sx={{ mr: 1, color: '#8b5cf6' }} fontSize="small" />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                      AI Agent Analysis
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={config.notification_config.ai_agent}
                        onChange={() => handleNotificationToggle('ai_agent')}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#8b5cf6' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#8b5cf6' } }}
                      />
                    }
                    label={
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        {config.notification_config.ai_agent ? 'AI analysis enabled' : 'Enable AI analysis'}
                      </Typography>
                    }
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* ─── Notification Recipients ─── */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={sectionHeaderSx}>
            Notification Recipients
          </Typography>
          <Divider sx={{ mb: 2, borderColor: colors.border }} />

          <Box sx={{ mb: 2 }}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small" sx={inputSx}>
                  <InputLabel>Type</InputLabel>
                  <Select value={newRecipient.type} label="Type" onChange={(e) => setNewRecipient({ ...newRecipient, type: e.target.value })} MenuProps={menuProps}>
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="phone">Phone</MenuItem>
                    <MenuItem value="slack_channel">Slack</MenuItem>
                    <MenuItem value="teams_webhook">Teams</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={7}>
                <TextField
                  fullWidth size="small" label="Value"
                  value={newRecipient.value}
                  onChange={(e) => setNewRecipient({ ...newRecipient, value: e.target.value })}
                  placeholder={
                    newRecipient.type === 'email' ? 'user@example.com'
                      : newRecipient.type === 'phone' ? '+1234567890'
                      : newRecipient.type === 'slack_channel' ? '#alerts'
                      : 'https://...'
                  }
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button fullWidth variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleAddRecipient}
                  sx={{ borderColor: colors.primary, color: colors.primary }}>
                  Add
                </Button>
              </Grid>
            </Grid>
          </Box>

          {config.notification_recipients.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {config.notification_recipients.map((recipient, index) => (
                <Chip
                  key={index}
                  label={`${recipient.type}: ${recipient.value}`}
                  onDelete={() => handleRemoveRecipient(index)}
                  size="small"
                  sx={{ color: colors.primary, borderColor: colors.primary }}
                  variant="outlined"
                />
              ))}
            </Box>
          ) : (
            <Alert severity="info" sx={{ bgcolor: darkMode ? alpha(colors.primary, 0.1) : undefined }}>
              No recipients configured. Add recipients above to receive notifications.
            </Alert>
          )}
        </Grid>

        {/* ─── Save / Cancel ─── */}
        <Grid item xs={12}>
          <Divider sx={{ mb: 2, borderColor: colors.border }} />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={onClose} sx={{ borderColor: colors.border, color: colors.text }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{ bgcolor: colors.primary, '&:hover': { bgcolor: colors.secondary } }}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AgentConfigForm;
