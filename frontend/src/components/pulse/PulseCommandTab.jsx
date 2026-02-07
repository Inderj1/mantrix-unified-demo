/**
 * PulseCommandTab — Unified Pulse Command Center
 *
 * Three-panel agentic dashboard:
 *   Left:   Module tree + scope filters
 *   Center: KPIs, Live Pulse Feed, AI Agents, Ask Pulse bar
 *   Right:  Event detail, Agent detail, Ask Pulse response
 */
import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Collapse,
  Autocomplete,
  LinearProgress,
  Divider,
  Badge,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogContent,
  MenuItem,
  Select,
  alpha,
} from '@mui/material';
import {
  // Module icons
  Inventory2 as Inventory2Icon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  LocalShipping as LocalShippingIcon,
  AltRoute as AltRouteIcon,
  // UI icons
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Psychology as PsychologyIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  ContentCopy as ContentCopyIcon,
  KeyboardArrowRight as ArrowRightIcon,
  Add as AddIcon,
  // Severity icons
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Lightbulb as LightbulbIcon,
  CheckCircle as CheckCircleIcon,
  // KPI icons
  Notifications as NotificationsIcon,
  AttachMoney as AttachMoneyIcon,
  Settings as SettingsIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Route as RouteIcon,
  Park as EcoIcon,
  PinDrop as PinDropIcon,
  Savings as SavingsIcon,
  ContentCopy as ContentCopyIcon2,
  BugReport as BugReportIcon,
  Gavel as GavelIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  MoneyOff as MoneyOffIcon,
  // Scope icons
  Factory as FactoryIcon,
  Warehouse as WarehouseIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  Public as PublicIcon,
  Assignment as AssignmentIcon,
  // Action icons
  Visibility as VisibilityIcon,
  SwapHoriz as SwapHorizIcon,
  Block as BlockIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CreditCard as CreditCardIcon,
  Speed as SpeedIcon,
  MergeType as MergeTypeIcon,
  Map as MapIcon,
  Assessment as AssessmentIcon,
  Calculate as CalculateIcon,
  Payment as PaymentIcon,
  Compare as CompareIcon,
  TuneOutlined as TuneOutlinedIcon,
  SmartToy as SmartToyIcon,
  Radar as RadarIcon,
  FiberManualRecord as DotIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  SettingsOutlined as ConfigIcon,
} from '@mui/icons-material';
import { getColors } from '../../config/brandColors';
import {
  MODULE_TREE,
  SCOPE_DIMENSIONS,
  PULSE_EVENTS,
  MODULE_KPIS,
  ASK_PULSE_SUGGESTIONS,
  MOCK_AGENTS,
} from './pulseCommandMockData';
import AgentCreationWizard from './AgentCreationWizard';
import { reveqCategoryInfo } from './kitAgentsMockData';

// ============================================
// HELPER FUNCTIONS
// ============================================
const MODULE_ICON_MAP = {
  Inventory2: Inventory2Icon,
  TrendingUp: TrendingUpIcon,
  AccountBalance: AccountBalanceIcon,
  ShoppingCart: ShoppingCartIcon,
  Receipt: ReceiptIcon,
  LocalShipping: LocalShippingIcon,
  AltRoute: AltRouteIcon,
};

const KPI_ICON_MAP = {
  Warning: WarningIcon,
  Inventory2: Inventory2Icon,
  CheckCircle: CheckCircleIcon,
  Settings: SettingsIcon,
  TrendingDown: TrendingDownIcon,
  TrendingUp: TrendingUpIcon,
  MoneyOff: MoneyOffIcon,
  Receipt: ReceiptIcon,
  Savings: SavingsIcon,
  ContentCopy: ContentCopyIcon2,
  Schedule: ScheduleIcon,
  LocalShipping: LocalShippingIcon,
  ShoppingCart: ShoppingCartIcon,
  BugReport: BugReportIcon,
  Gavel: GavelIcon,
  AttachMoney: AttachMoneyIcon,
  Star: StarIcon,
  Route: RouteIcon,
  Eco: EcoIcon,
  PinDrop: PinDropIcon,
  Notifications: NotificationsIcon,
  Psychology: PsychologyIcon,
  PlaylistAddCheck: PlaylistAddCheckIcon,
};

const SCOPE_ICON_MAP = {
  Factory: FactoryIcon,
  Warehouse: WarehouseIcon,
  People: PeopleIcon,
  Business: BusinessIcon,
  Category: CategoryIcon,
  Public: PublicIcon,
  Assignment: AssignmentIcon,
};

const ACTION_ICON_MAP = {
  ShoppingCart: ShoppingCartIcon,
  SwapHoriz: SwapHorizIcon,
  Visibility: VisibilityIcon,
  TuneOutlined: TuneOutlinedIcon,
  AttachMoney: AttachMoneyIcon,
  Assessment: AssessmentIcon,
  Search: SearchIcon,
  Lock: LockIcon,
  Calculate: CalculateIcon,
  Payment: PaymentIcon,
  Block: BlockIcon,
  Compare: CompareIcon,
  Phone: PhoneIcon,
  CheckCircle: CheckCircleIcon,
  People: PeopleIcon,
  Inventory: Inventory2Icon,
  Email: EmailIcon,
  CreditCard: CreditCardIcon,
  Speed: SpeedIcon,
  MergeType: MergeTypeIcon,
  Map: MapIcon,
  Edit: EditIcon,
  LocalShipping: LocalShippingIcon,
  Schedule: ScheduleIcon,
};

const getModuleIcon = (iconName) => {
  const Icon = MODULE_ICON_MAP[iconName];
  return Icon || Inventory2Icon;
};

const getRelativeTime = (timestamp) => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const formatImpact = (value) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

const getSeverityColor = (severity, colors) => {
  switch (severity) {
    case 'critical': return colors.error;
    case 'high': return colors.warning;
    case 'warning': return '#2196f3';
    case 'opportunity': return colors.success;
    case 'info': return colors.textSecondary;
    default: return colors.textSecondary;
  }
};

const getSeverityIcon = (severity) => {
  switch (severity) {
    case 'critical': return <ErrorIcon sx={{ fontSize: 16 }} />;
    case 'high': return <WarningIcon sx={{ fontSize: 16 }} />;
    case 'warning': return <InfoIcon sx={{ fontSize: 16 }} />;
    case 'opportunity': return <LightbulbIcon sx={{ fontSize: 16 }} />;
    case 'info': return <InfoIcon sx={{ fontSize: 16 }} />;
    default: return <InfoIcon sx={{ fontSize: 16 }} />;
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'new': return 'New';
    case 'acknowledged': return 'Ack';
    case 'in_progress': return 'In Progress';
    case 'resolved': return 'Resolved';
    default: return status;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'new': return 'error';
    case 'acknowledged': return 'warning';
    case 'in_progress': return 'info';
    case 'resolved': return 'success';
    default: return 'default';
  }
};

// Simulated Ask Pulse responses
const MOCK_ASK_RESPONSES = {
  default: {
    text: 'Based on current data across all active modules, here is a summary of the relevant findings. I identified correlated signals across STOX, MARGEN, and ORDLY that suggest a coordinated supply-demand imbalance in the NA-East region.',
    table: [
      { dimension: 'Materials at Risk', value: '3 (MAT-3001, MAT-3004, MAT-3005)' },
      { dimension: 'Customers Impacted', value: '4 (Acme, Global Electronics, Atlas, Meridian)' },
      { dimension: 'Total $ Impact', value: '$1.24M across modules' },
      { dimension: 'Recommended Priority', value: 'Address stockout risk first (EVT-001)' },
    ],
    followUps: ['Drill into MAT-3001 stockout details', 'Show me customer impact breakdown', 'Create an agent to monitor this pattern'],
  },
};

// ============================================
// VISUAL HELPERS — clean corporate style
// ============================================
const cardSx = (accentColor, darkMode) => ({
  p: 2,
  borderRadius: 2,
  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
  boxShadow: darkMode ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
  cursor: 'pointer',
  transition: 'all 0.15s',
  '&:hover': {
    boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.12)',
    borderColor: accentColor ? `${accentColor}40` : undefined,
  },
});

const sectionHeaderSx = (darkMode, colors) => ({
  p: 1.5,
  mb: 1.5,
  borderRadius: 1.5,
  bgcolor: colors.paper,
  boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
  display: 'flex',
  alignItems: 'center',
  gap: 1,
});

// ============================================
// MAIN COMPONENT
// ============================================
const PulseCommandTab = ({ darkMode = false }) => {
  const colors = getColors(darkMode);

  // --- Module & feature selection ---
  const [selectedModules, setSelectedModules] = useState(['stox', 'margen']);
  const [expandedModules, setExpandedModules] = useState(['stox']);
  const [selectedFeatures, setSelectedFeatures] = useState({});

  // --- Scope filters ---
  const [activeScopes, setActiveScopes] = useState({});

  // --- Center panel ---
  const [eventFilter, setEventFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchText, setSearchText] = useState('');

  // --- Ask Pulse ---
  const [askPulseQuery, setAskPulseQuery] = useState('');
  const [askPulseResponse, setAskPulseResponse] = useState(null);
  const [askPulseLoading, setAskPulseLoading] = useState(false);

  // --- Right panel ---
  const [erpFieldsExpanded, setErpFieldsExpanded] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);

  // --- Section collapse ---
  const [sectionsCollapsed, setSectionsCollapsed] = useState({
    feed: false, agents: false,
  });

  // --- AI Agents ---
  const [agentSearch, setAgentSearch] = useState('');
  const [agentStatusFilter, setAgentStatusFilter] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showAgentWizard, setShowAgentWizard] = useState(false);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const activeKpis = useMemo(() => {
    if (selectedModules.length === 1) {
      return MODULE_KPIS[selectedModules[0]] || MODULE_KPIS._global;
    }
    return MODULE_KPIS._global;
  }, [selectedModules]);

  const filteredEvents = useMemo(() => {
    let events = PULSE_EVENTS;
    if (selectedModules.length > 0) {
      events = events.filter(e => selectedModules.includes(e.moduleId));
    }
    const allSelectedFeatures = Object.values(selectedFeatures).flat();
    if (allSelectedFeatures.length > 0) {
      events = events.filter(e => allSelectedFeatures.includes(e.featureId));
    }
    Object.entries(activeScopes).forEach(([dimId, values]) => {
      if (values && values.length > 0) {
        const valueIds = values.map(v => v.id);
        events = events.filter(e => {
          const scopeVal = e.scope[dimId];
          return !scopeVal || valueIds.includes(scopeVal);
        });
      }
    });
    if (eventFilter !== 'all') {
      events = events.filter(e => e.severity === eventFilter);
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      events = events.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.moduleLabel.toLowerCase().includes(q)
      );
    }
    return events;
  }, [selectedModules, selectedFeatures, activeScopes, eventFilter, searchText]);

  const severityCounts = useMemo(() => {
    const baseEvents = PULSE_EVENTS.filter(e => selectedModules.includes(e.moduleId));
    return {
      all: baseEvents.length,
      critical: baseEvents.filter(e => e.severity === 'critical').length,
      high: baseEvents.filter(e => e.severity === 'high').length,
      warning: baseEvents.filter(e => e.severity === 'warning').length,
      opportunity: baseEvents.filter(e => e.severity === 'opportunity').length,
      info: baseEvents.filter(e => e.severity === 'info').length,
    };
  }, [selectedModules]);

  const applicableScopes = useMemo(() => {
    return SCOPE_DIMENSIONS.filter(dim =>
      dim.applicableModules.some(m => selectedModules.includes(m))
    );
  }, [selectedModules]);

  const watchCounts = useMemo(() => {
    const featCount = Object.values(selectedFeatures).flat().length;
    return { modules: selectedModules.length, features: featCount };
  }, [selectedModules, selectedFeatures]);


  // Filtered agents
  const filteredAgents = useMemo(() => {
    let agents = MOCK_AGENTS;
    if (agentStatusFilter !== 'all') {
      agents = agents.filter(a => agentStatusFilter === 'active' ? a.enabled : !a.enabled);
    }
    if (agentSearch.trim()) {
      const q = agentSearch.toLowerCase();
      agents = agents.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    }
    return agents;
  }, [agentStatusFilter, agentSearch]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleToggleModule = (moduleId) => {
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(m => m !== moduleId)
        : [...prev, moduleId]
    );
    if (selectedModules.includes(moduleId)) {
      setSelectedFeatures(prev => {
        const next = { ...prev };
        delete next[moduleId];
        return next;
      });
    }
  };

  const handleExpandModule = (moduleId) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(m => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleToggleFeature = (moduleId, featureId) => {
    setSelectedFeatures(prev => {
      const current = prev[moduleId] || [];
      const next = current.includes(featureId)
        ? current.filter(f => f !== featureId)
        : [...current, featureId];
      return { ...prev, [moduleId]: next };
    });
  };

  const handleScopeChange = (dimId, values) => {
    setActiveScopes(prev => ({ ...prev, [dimId]: values }));
  };

  const handleClearAll = () => {
    setSelectedModules([]);
    setExpandedModules([]);
    setSelectedFeatures({});
    setActiveScopes({});
    setEventFilter('all');
    setSelectedEvent(null);
    setSearchText('');
  };

  const handleAskPulse = (query) => {
    if (!query.trim()) return;
    setAskPulseLoading(true);
    setSelectedEvent(null);
    setSelectedAgent(null);
    setTimeout(() => {
      setAskPulseResponse({ query, ...MOCK_ASK_RESPONSES.default });
      setAskPulseLoading(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion) => {
    setAskPulseQuery(suggestion);
    handleAskPulse(suggestion);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setSelectedAgent(null);
    setAskPulseResponse(null);
  };

  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
    setSelectedEvent(null);
    setAskPulseResponse(null);
  };

  const toggleSection = (section) => {
    setSectionsCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // ============================================
  // RENDER: LEFT PANEL
  // ============================================
  const renderLeftPanel = () => (
    <Paper
      elevation={0}
      sx={{
        width: leftPanelCollapsed ? 48 : 250,
        minWidth: leftPanelCollapsed ? 48 : 250,
        transition: 'width 0.3s, min-width 0.3s',
        borderRight: `1px solid ${colors.border}`,
        bgcolor: colors.paper,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: leftPanelCollapsed ? 0.5 : 1.5, pb: 1, display: 'flex', alignItems: 'center', justifyContent: leftPanelCollapsed ? 'center' : 'space-between', borderBottom: `1px solid ${colors.border}` }}>
        {!leftPanelCollapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RadarIcon sx={{ fontSize: 18, color: colors.primary }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: colors.text, fontSize: '0.8rem' }}>
              Pulse Command
            </Typography>
          </Box>
        )}
        <IconButton size="small" onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)} sx={{ color: colors.textSecondary }}>
          {leftPanelCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
        </IconButton>
      </Box>

      {leftPanelCollapsed ? null : (
        <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {/* Module tree */}
          <Box sx={{ p: 1.5, pt: 1 }}>
            <Typography variant="caption" fontWeight={600} sx={{ color: colors.textSecondary, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5 }}>
              Modules
            </Typography>

            {MODULE_TREE.map((mod) => {
              const isSelected = selectedModules.includes(mod.id);
              const isExpanded = expandedModules.includes(mod.id);
              const ModIcon = getModuleIcon(mod.icon);
              const modFeatures = selectedFeatures[mod.id] || [];

              return (
                <Box key={mod.id} sx={{ mb: 0.5 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      py: 0.5,
                      px: 0.5,
                      borderRadius: 1,
                      borderLeft: isSelected ? `3px solid ${mod.color}` : '3px solid transparent',
                      bgcolor: isSelected ? alpha(mod.color, 0.06) : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      '&:hover': { bgcolor: alpha(mod.color, 0.1) },
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      onChange={() => handleToggleModule(mod.id)}
                      sx={{
                        p: 0.3,
                        color: colors.textSecondary,
                        '&.Mui-checked': { color: mod.color },
                      }}
                    />
                    <Avatar
                      sx={{
                        width: 24, height: 24,
                        bgcolor: isSelected ? mod.color : alpha(mod.color, 0.15),
                        color: isSelected ? '#fff' : mod.color,
                        fontSize: '0.6rem',
                        fontWeight: 700,
                      }}
                    >
                      <ModIcon sx={{ fontSize: 14 }} />
                    </Avatar>
                    <Typography
                      variant="body2"
                      fontWeight={isSelected ? 600 : 400}
                      sx={{ flex: 1, fontSize: '0.78rem', color: isSelected ? colors.text : colors.textSecondary, cursor: 'pointer' }}
                      onClick={() => handleExpandModule(mod.id)}
                    >
                      {mod.label}
                    </Typography>
                    <IconButton size="small" onClick={() => handleExpandModule(mod.id)} sx={{ p: 0.2, color: colors.textSecondary }}>
                      {isExpanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                    </IconButton>
                  </Box>

                  <Collapse in={isExpanded} timeout="auto">
                    <Box sx={{ pl: 4.5, pr: 0.5, pb: 0.5 }}>
                      {mod.features.map(feat => (
                        <FormControlLabel
                          key={feat.id}
                          control={
                            <Checkbox
                              size="small"
                              checked={modFeatures.includes(feat.id)}
                              onChange={() => handleToggleFeature(mod.id, feat.id)}
                              sx={{ p: 0.2, color: colors.textSecondary, '&.Mui-checked': { color: mod.color } }}
                            />
                          }
                          label={
                            <Typography variant="caption" sx={{ color: modFeatures.includes(feat.id) ? colors.text : colors.textSecondary, fontSize: '0.72rem' }}>
                              {feat.label}
                            </Typography>
                          }
                          sx={{ ml: 0, mr: 0, mb: -0.5, display: 'flex' }}
                        />
                      ))}
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Box>

          {/* Scope filters */}
          {applicableScopes.length > 0 && (
            <Box sx={{ px: 1.5, pb: 1.5 }}>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="caption" fontWeight={600} sx={{ color: colors.textSecondary, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 0.5, mb: 0.5, display: 'block' }}>
                Scope
              </Typography>
              {applicableScopes.map(dim => {
                const DimIcon = SCOPE_ICON_MAP[dim.icon] || PublicIcon;
                return (
                  <Box key={dim.id} sx={{ mb: 1 }}>
                    <Autocomplete
                      multiple
                      size="small"
                      options={dim.items}
                      getOptionLabel={(o) => o.label}
                      value={activeScopes[dim.id] || []}
                      onChange={(_, val) => handleScopeChange(dim.id, val)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          placeholder={dim.label}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <DimIcon sx={{ fontSize: 14, color: colors.textSecondary, mr: 0.5 }} />
                                {params.InputProps.startAdornment}
                              </>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontSize: '0.72rem',
                              bgcolor: darkMode ? alpha('#fff', 0.04) : alpha('#000', 0.02),
                            },
                          }}
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                          const { key, ...tagProps } = getTagProps({ index });
                          return (
                            <Chip
                              key={key}
                              label={option.id}
                              size="small"
                              {...tagProps}
                              sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(colors.primary, 0.1), color: colors.primary }}
                            />
                          );
                        })
                      }
                    />
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Watch summary footer */}
          <Box sx={{ px: 1.5, pb: 1.5, mt: 'auto' }}>
            <Divider sx={{ mb: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.7rem' }}>
                Watching <strong>{watchCounts.modules}</strong> modules{watchCounts.features > 0 && <>, <strong>{watchCounts.features}</strong> features</>}
              </Typography>
              <Button size="small" onClick={handleClearAll} sx={{ fontSize: '0.65rem', textTransform: 'none', color: colors.textSecondary, minWidth: 'auto', p: '2px 6px' }}>
                Clear
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );

  // ============================================
  // RENDER: CENTER PANEL
  // ============================================
  const renderCenterPanel = () => (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
      {/* Scrollable content area */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>

        {/* Center panel header */}
        <Box sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: colors.text, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.78rem' }}>
            Command Center
          </Typography>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAgentWizard(true)}
            sx={{
              bgcolor: colors.primary, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 2,
              fontSize: '0.75rem', boxShadow: 'none',
              '&:hover': { bgcolor: alpha(colors.primary, 0.85), boxShadow: 'none' },
            }}
          >
            Create Agent
          </Button>
        </Box>

        {/* Section 1: Dynamic KPI Row */}
        <Box sx={{ px: 2, pt: 1, pb: 1 }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {activeKpis.map(kpi => {
              const KpiIcon = KPI_ICON_MAP[kpi.icon] || NotificationsIcon;
              const isUp = kpi.trendDirection === 'up';
              return (
                <Paper
                  key={kpi.id}
                  elevation={0}
                  sx={{
                    flex: 1,
                    p: 1.5,
                    bgcolor: colors.paper,
                    borderRadius: 2,
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    boxShadow: darkMode ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <KpiIcon sx={{ fontSize: 14, color: kpi.color }} />
                    <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.3 }}>
                      {kpi.label}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: colors.text, fontSize: '1.35rem', lineHeight: 1.2 }}>
                    {kpi.value}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.3 }}>
                    {isUp ? (
                      <ArrowUpwardIcon sx={{ fontSize: 12, color: kpi.color === '#10b981' ? colors.success : colors.warning }} />
                    ) : (
                      <ArrowDownwardIcon sx={{ fontSize: 12, color: kpi.color === '#ef4444' ? colors.success : colors.textSecondary }} />
                    )}
                    <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>
                      {kpi.trend}
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Box>

        {/* Section 2: Live Pulse Feed */}
        <Box sx={{ px: 2, pb: 1, mt: 1 }}>
          <Paper elevation={0} sx={sectionHeaderSx(darkMode, colors)}>
            <RadarIcon sx={{ fontSize: 18, color: colors.primary }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: colors.text, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Live Pulse Feed
            </Typography>
            <Badge badgeContent={filteredEvents.length} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}>
              <Box sx={{ width: 8 }} />
            </Badge>
            <Box sx={{ flex: 1 }} />
            <IconButton size="small" onClick={() => toggleSection('feed')} sx={{ color: colors.textSecondary, p: 0.3 }}>
              {sectionsCollapsed.feed ? <ExpandMoreIcon sx={{ fontSize: 18 }} /> : <ExpandLessIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Paper>

          <Collapse in={!sectionsCollapsed.feed}>
            {/* Severity filter chips + search */}
            <Box sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'All', color: colors.primary },
                { key: 'critical', label: 'Critical', color: colors.error },
                { key: 'high', label: 'High', color: colors.warning },
                { key: 'warning', label: 'Warning', color: '#2196f3' },
                { key: 'opportunity', label: 'Opportunity', color: colors.success },
                { key: 'info', label: 'Info', color: colors.textSecondary },
              ].map(sev => {
                const count = severityCounts[sev.key] || 0;
                const isActive = eventFilter === sev.key;
                return (
                  <Chip
                    key={sev.key}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <span>{sev.label}</span>
                        {count > 0 && (
                          <Box component="span" sx={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            minWidth: 16, height: 16, borderRadius: 8, px: 0.5,
                            bgcolor: isActive ? sev.color : alpha(sev.color, 0.12),
                            color: isActive ? '#fff' : sev.color,
                            fontSize: '0.6rem', fontWeight: 700, lineHeight: 1,
                          }}>
                            {count}
                          </Box>
                        )}
                      </Box>
                    }
                    size="small"
                    onClick={() => setEventFilter(sev.key)}
                    sx={{
                      fontSize: '0.68rem',
                      height: 26,
                      fontWeight: isActive ? 600 : 400,
                      bgcolor: isActive ? alpha(sev.color, 0.12) : 'transparent',
                      color: isActive ? sev.color : colors.textSecondary,
                      border: `1px solid ${isActive ? alpha(sev.color, 0.3) : colors.border}`,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: alpha(sev.color, 0.08) },
                      '& .MuiChip-label': { px: 1 },
                    }}
                  />
                );
              })}
              <Box sx={{ flex: 1 }} />
              <TextField
                size="small"
                placeholder="Search events..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ fontSize: 16, color: colors.textSecondary, mr: 0.5 }} />,
                }}
                sx={{
                  width: 180,
                  '& .MuiOutlinedInput-root': {
                    fontSize: '0.75rem',
                    height: 30,
                    bgcolor: darkMode ? alpha('#fff', 0.04) : alpha('#000', 0.02),
                  },
                }}
              />
            </Box>

            {/* Event cards with own scroll */}
            <Box sx={{ maxHeight: 400, overflowY: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: colors.border, borderRadius: 2 } }}>
              {filteredEvents.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <RadarIcon sx={{ fontSize: 36, color: alpha(colors.textSecondary, 0.3), mb: 1 }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.78rem' }}>
                    No events match current filters
                  </Typography>
                  <Button size="small" onClick={() => { setEventFilter('all'); setSearchText(''); }} sx={{ mt: 0.5, textTransform: 'none', fontSize: '0.72rem' }}>
                    Reset filters
                  </Button>
                </Box>
              ) : (
                filteredEvents.map(event => {
                  const isActive = selectedEvent?.id === event.id;
                  const sevColor = getSeverityColor(event.severity, colors);

                  return (
                    <Paper
                      key={event.id}
                      elevation={0}
                      onClick={() => handleSelectEvent(event)}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        cursor: 'pointer',
                        border: `1px solid ${alpha(event.moduleColor, 0.15)}`,
                        bgcolor: isActive ? alpha(colors.primary, 0.08) : colors.paper,
                        borderRadius: 2,
                        boxShadow: isActive
                          ? (darkMode ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.12)')
                          : (darkMode ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)'),
                        transition: 'all 0.15s',
                        '&:hover': {
                          boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.12)',
                        },
                      }}
                    >
                      {/* Row 1: module badge + severity + time */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                        <Avatar sx={{ width: 20, height: 20, bgcolor: event.moduleColor, fontSize: '0.5rem', fontWeight: 700 }}>
                          {event.moduleLabel.substring(0, 2)}
                        </Avatar>
                        <Typography variant="caption" fontWeight={600} sx={{ color: event.moduleColor, fontSize: '0.68rem' }}>
                          {event.moduleLabel}
                        </Typography>
                        <Chip
                          icon={getSeverityIcon(event.severity)}
                          label={event.severity.toUpperCase()}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.58rem',
                            fontWeight: 600,
                            bgcolor: alpha(sevColor, 0.1),
                            color: sevColor,
                            '& .MuiChip-icon': { color: sevColor, fontSize: 12 },
                          }}
                        />
                        {event.status !== 'new' && (
                          <Chip
                            label={getStatusLabel(event.status)}
                            size="small"
                            color={getStatusColor(event.status)}
                            variant="outlined"
                            sx={{ height: 16, fontSize: '0.55rem' }}
                          />
                        )}
                        <Box sx={{ flex: 1 }} />
                        <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>
                          {getRelativeTime(event.timestamp)}
                        </Typography>
                      </Box>

                      {/* Row 2: Title */}
                      <Typography variant="body2" fontWeight={600} sx={{ color: colors.text, fontSize: '0.82rem', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {event.title}
                      </Typography>

                      {/* Row 3: Summary */}
                      <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.72rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {event.summary}
                      </Typography>

                      {/* Row 4: Feature tag + impact */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
                        <Chip
                          label={event.featureLabel}
                          size="small"
                          sx={{ height: 18, fontSize: '0.6rem', bgcolor: alpha(event.moduleColor, 0.08), color: event.moduleColor }}
                        />
                        <Chip
                          label={formatImpact(event.impactValue)}
                          size="small"
                          sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, bgcolor: alpha(colors.warning, 0.1), color: colors.warning }}
                        />
                        <Box sx={{ flex: 1 }} />
                        <ArrowRightIcon sx={{ fontSize: 16, color: colors.textSecondary }} />
                      </Box>
                    </Paper>
                  );
                })
              )}
            </Box>
          </Collapse>
        </Box>

        {/* Section 4: AI Agents */}
        <Box sx={{ px: 2, pb: 2, mt: 1 }}>
          <Paper elevation={0} sx={sectionHeaderSx(darkMode, colors)}>
            <SmartToyIcon sx={{ fontSize: 18, color: colors.primary }} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: colors.text, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              AI Agents
            </Typography>
            <Badge badgeContent={MOCK_AGENTS.filter(a => a.enabled).length} color="success" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}>
              <Box sx={{ width: 8 }} />
            </Badge>
            <Box sx={{ flex: 1 }} />
            <TextField
              size="small"
              placeholder="Search agents..."
              value={agentSearch}
              onChange={e => setAgentSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ fontSize: 14, color: colors.textSecondary, mr: 0.5 }} />,
              }}
              sx={{
                width: 140,
                '& .MuiOutlinedInput-root': { fontSize: '0.7rem', height: 28, bgcolor: darkMode ? alpha('#fff', 0.04) : alpha('#000', 0.02) },
              }}
            />
            <Select
              size="small"
              value={agentStatusFilter}
              onChange={e => setAgentStatusFilter(e.target.value)}
              sx={{ fontSize: '0.7rem', height: 28, minWidth: 80, bgcolor: darkMode ? alpha('#fff', 0.04) : alpha('#000', 0.02) }}
            >
              <MenuItem value="all" sx={{ fontSize: '0.72rem' }}>All</MenuItem>
              <MenuItem value="active" sx={{ fontSize: '0.72rem' }}>Active</MenuItem>
              <MenuItem value="paused" sx={{ fontSize: '0.72rem' }}>Paused</MenuItem>
            </Select>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon sx={{ fontSize: 14 }} />}
              onClick={() => setShowAgentWizard(true)}
              sx={{
                fontSize: '0.68rem',
                textTransform: 'none',
                fontWeight: 600,
                height: 28,
                borderColor: alpha(colors.primary, 0.3),
                color: colors.primary,
              }}
            >
              Create
            </Button>
            <IconButton size="small" onClick={() => toggleSection('agents')} sx={{ color: colors.textSecondary, p: 0.3 }}>
              {sectionsCollapsed.agents ? <ExpandMoreIcon sx={{ fontSize: 18 }} /> : <ExpandLessIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Paper>

          <Collapse in={!sectionsCollapsed.agents}>
            <Box sx={{ maxHeight: 320, overflowY: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: colors.border, borderRadius: 2 } }}>
              {filteredAgents.map(agent => {
                const catInfo = reveqCategoryInfo[agent.category] || {};
                const isActive = selectedAgent?.id === agent.id;
                return (
                  <Paper
                    key={agent.id}
                    elevation={0}
                    onClick={() => handleSelectAgent(agent)}
                    sx={{
                      ...cardSx(catInfo.color || colors.primary, darkMode),
                      mb: 1,
                      bgcolor: isActive ? alpha(colors.primary, 0.08) : colors.paper,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <DotIcon sx={{ fontSize: 10, color: agent.enabled ? '#10b981' : colors.textSecondary }} />
                      <Typography variant="body2" fontWeight={600} sx={{ color: colors.text, fontSize: '0.8rem', flex: 1 }}>
                        {agent.name}
                      </Typography>
                      <Chip
                        label={catInfo.name || agent.category}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.58rem',
                          bgcolor: alpha(catInfo.color || colors.primary, 0.1),
                          color: catInfo.color || colors.primary,
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 0.5 }}>
                      {agent.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      {agent.accuracy != null && (
                        <Chip label={`${agent.accuracy}%`} size="small" sx={{ height: 18, fontSize: '0.58rem', fontWeight: 600, bgcolor: alpha('#10b981', 0.1), color: '#10b981' }} />
                      )}
                      <Chip label={agent.frequency} size="small" sx={{ height: 18, fontSize: '0.58rem', bgcolor: alpha(colors.primary, 0.08), color: colors.primary }} />
                      <Chip
                        label={agent.severity}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.58rem',
                          bgcolor: alpha(getSeverityColor(agent.severity, colors), 0.1),
                          color: getSeverityColor(agent.severity, colors),
                        }}
                      />
                      <Box sx={{ flex: 1 }} />
                      <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.62rem' }}>
                        {agent.business_value}
                      </Typography>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Collapse>
        </Box>
      </Box>

      {/* Ask Pulse Bar — sticky bottom */}
      <Box sx={{ px: 2, pb: 2, pt: 1, borderTop: `1px solid ${colors.border}`, flexShrink: 0 }}>
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1,
            borderRadius: 3,
            bgcolor: darkMode ? alpha('#fff', 0.05) : alpha('#000', 0.03),
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            boxShadow: darkMode ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          <PsychologyIcon sx={{ fontSize: 20, color: colors.primary }} />
          <TextField
            fullWidth
            variant="standard"
            placeholder="Ask Pulse anything..."
            value={askPulseQuery}
            onChange={e => setAskPulseQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAskPulse(askPulseQuery); }}
            InputProps={{ disableUnderline: true }}
            sx={{ '& .MuiInputBase-input': { fontSize: '0.82rem', color: colors.text } }}
          />
          <IconButton
            size="small"
            onClick={() => handleAskPulse(askPulseQuery)}
            disabled={!askPulseQuery.trim() || askPulseLoading}
            sx={{ color: colors.primary }}
          >
            {askPulseLoading ? <CircularProgress size={18} /> : <SendIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        </Paper>
        <Box sx={{ display: 'flex', gap: 0.75, mt: 1, overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { height: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: colors.border, borderRadius: 2 } }}>
          {ASK_PULSE_SUGGESTIONS.slice(0, 4).map((s, i) => (
            <Chip
              key={i}
              label={s}
              size="small"
              onClick={() => handleSuggestionClick(s)}
              sx={{
                fontSize: '0.65rem',
                height: 24,
                whiteSpace: 'nowrap',
                bgcolor: alpha(colors.primary, 0.06),
                color: colors.primary,
                cursor: 'pointer',
                border: `1px solid ${alpha(colors.primary, 0.12)}`,
                '&:hover': { bgcolor: alpha(colors.primary, 0.12) },
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );

  // ============================================
  // RENDER: RIGHT PANEL — Empty (Mode A)
  // ============================================
  const renderRightEmpty = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 3 }}>
      <PsychologyIcon sx={{ fontSize: 48, color: alpha(colors.textSecondary, 0.25), mb: 1 }} />
      <Typography variant="body2" sx={{ color: colors.textSecondary, textAlign: 'center', fontSize: '0.8rem' }}>
        Select an event, pattern, or agent — or ask Pulse
      </Typography>
    </Box>
  );

  // ============================================
  // RENDER: RIGHT PANEL — Event Detail (Mode B)
  // ============================================
  const renderEventDetail = () => {
    if (!selectedEvent) return null;
    const ev = selectedEvent;
    const sevColor = getSeverityColor(ev.severity, colors);

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${colors.border}` }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Avatar sx={{ width: 24, height: 24, bgcolor: ev.moduleColor, fontSize: '0.55rem', fontWeight: 700 }}>
                {ev.moduleLabel.substring(0, 2)}
              </Avatar>
              <Chip
                icon={getSeverityIcon(ev.severity)}
                label={ev.severity.toUpperCase()}
                size="small"
                sx={{ height: 22, fontSize: '0.65rem', fontWeight: 600, bgcolor: alpha(sevColor, 0.1), color: sevColor, '& .MuiChip-icon': { color: sevColor } }}
              />
            </Box>
            <IconButton size="small" onClick={() => setSelectedEvent(null)} sx={{ color: colors.textSecondary }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: colors.text, fontSize: '0.85rem', lineHeight: 1.3 }}>
            {ev.title}
          </Typography>
          <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.68rem' }}>
            {getRelativeTime(ev.timestamp)} &middot; {ev.featureLabel} &middot; {ev.id}
          </Typography>
        </Box>

        {/* AI Analysis card */}
        <Box sx={{ p: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(colors.primary, 0.04),
              border: `1px solid ${alpha(colors.primary, 0.15)}`,
              boxShadow: darkMode ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <PsychologyIcon sx={{ fontSize: 16, color: colors.primary }} />
              <Typography variant="caption" fontWeight={700} sx={{ color: colors.primary, fontSize: '0.72rem', textTransform: 'uppercase' }}>
                AI Analysis
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: colors.text, fontSize: '0.78rem', lineHeight: 1.5, mb: 1.5 }}>
              {ev.summary}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinearProgress
                variant="determinate"
                value={ev.aiConfidence * 100}
                sx={{
                  flex: 1, height: 6, borderRadius: 3,
                  bgcolor: alpha(colors.primary, 0.1),
                  '& .MuiLinearProgress-bar': { bgcolor: colors.primary, borderRadius: 3 },
                }}
              />
              <Typography variant="caption" fontWeight={600} sx={{ color: colors.primary, fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                {Math.round(ev.aiConfidence * 100)}% confidence
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Impact summary */}
        <Box sx={{ px: 2, pb: 1.5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(colors.warning, 0.06),
              boxShadow: darkMode ? '0 1px 4px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>Impact</Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: colors.text, fontSize: '1.1rem' }}>
                {formatImpact(ev.impactValue)}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>
                {ev.impactLabel}
              </Typography>
              {ev.relatedAlerts.length > 0 && (
                <Typography variant="caption" display="block" sx={{ color: colors.primary, fontSize: '0.65rem' }}>
                  {ev.relatedAlerts.length} related event{ev.relatedAlerts.length > 1 ? 's' : ''}
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Quick ERP Actions */}
        <Box sx={{ px: 2, pb: 1.5 }}>
          <Typography variant="caption" fontWeight={600} sx={{ color: colors.textSecondary, fontSize: '0.68rem', textTransform: 'uppercase', mb: 0.75, display: 'block' }}>
            ERP Actions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {ev.erpActions.map(action => {
              const ActionIcon = ACTION_ICON_MAP[action.icon] || VisibilityIcon;
              const isWrite = action.risk === 'write';
              return (
                <Button
                  key={action.id}
                  variant="outlined"
                  size="small"
                  fullWidth
                  startIcon={<ActionIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    py: 0.75,
                    borderColor: isWrite ? alpha(colors.warning, 0.4) : alpha(colors.primary, 0.3),
                    color: isWrite ? colors.warning : colors.primary,
                    bgcolor: isWrite ? alpha(colors.warning, 0.04) : alpha(colors.primary, 0.03),
                    '&:hover': {
                      borderColor: isWrite ? colors.warning : colors.primary,
                      bgcolor: isWrite ? alpha(colors.warning, 0.1) : alpha(colors.primary, 0.08),
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1 }}>
                    <span>{action.label}</span>
                    <Box sx={{ flex: 1 }} />
                    <Chip
                      label={action.target}
                      size="small"
                      sx={{
                        height: 18, fontSize: '0.58rem', fontWeight: 600,
                        bgcolor: isWrite ? alpha(colors.warning, 0.12) : alpha(colors.primary, 0.1),
                        color: isWrite ? colors.warning : colors.primary,
                      }}
                    />
                  </Box>
                </Button>
              );
            })}
          </Box>
        </Box>

        {/* ERP Field Drill-down */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Box
            onClick={() => setErpFieldsExpanded(!erpFieldsExpanded)}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', py: 0.5,
            }}
          >
            <Typography variant="caption" fontWeight={600} sx={{ color: colors.textSecondary, fontSize: '0.68rem', textTransform: 'uppercase' }}>
              Field-Level Detail
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {erpFieldsExpanded && (
                <Tooltip title="Copy all fields">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      const text = ev.erpFields.map(f => `${f.label}: ${f.value} (${f.table}.${f.field})`).join('\n');
                      navigator.clipboard.writeText(text);
                    }}
                    sx={{ color: colors.textSecondary, p: 0.3 }}
                  >
                    <ContentCopyIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              )}
              {erpFieldsExpanded ? <ExpandLessIcon sx={{ fontSize: 16, color: colors.textSecondary }} /> : <ExpandMoreIcon sx={{ fontSize: 16, color: colors.textSecondary }} />}
            </Box>
          </Box>

          <Collapse in={erpFieldsExpanded}>
            <Box sx={{ mt: 0.5 }}>
              {ev.erpFields.map((field, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    py: 0.6,
                    px: 1,
                    borderBottom: idx < ev.erpFields.length - 1 ? `1px solid ${colors.border}` : 'none',
                    bgcolor: idx % 2 === 0 ? alpha(colors.primary, 0.02) : 'transparent',
                    borderRadius: idx === 0 ? '4px 4px 0 0' : idx === ev.erpFields.length - 1 ? '0 0 4px 4px' : 0,
                  }}
                >
                  <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.68rem', width: 90, flexShrink: 0 }}>
                    {field.label}
                  </Typography>
                  <Typography variant="caption" fontWeight={600} sx={{ color: colors.text, fontSize: '0.72rem', flex: 1 }}>
                    {field.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha(colors.textSecondary, 0.6), fontSize: '0.6rem', fontFamily: 'monospace' }}>
                    {field.table}.{field.field}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Box>

        {/* Status timeline mini */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Divider sx={{ mb: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={getStatusLabel(ev.status)}
              size="small"
              color={getStatusColor(ev.status)}
              sx={{ height: 22, fontSize: '0.68rem', fontWeight: 600 }}
            />
            {ev.type === 'action_complete' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SmartToyIcon sx={{ fontSize: 14, color: colors.success }} />
                <Typography variant="caption" sx={{ color: colors.success, fontSize: '0.68rem', fontWeight: 600 }}>
                  Auto-resolved by AI Agent
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  // ============================================
  // RENDER: RIGHT PANEL — Ask Pulse Response (Mode C)
  // ============================================
  const renderAskPulseResponse = () => {
    if (!askPulseResponse) return null;
    const resp = askPulseResponse;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', p: 2 }}>
        {/* Query bubble */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(colors.primary, 0.1),
              maxWidth: '90%',
            }}
          >
            <Typography variant="body2" sx={{ color: colors.primary, fontSize: '0.78rem', fontWeight: 500 }}>
              {resp.query}
            </Typography>
          </Paper>
        </Box>

        {/* AI response */}
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
          <Avatar sx={{ width: 24, height: 24, bgcolor: colors.primary }}>
            <PsychologyIcon sx={{ fontSize: 14 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ color: colors.text, fontSize: '0.78rem', lineHeight: 1.5, mb: 1.5 }}>
              {resp.text}
            </Typography>

            {resp.table && (
              <Paper elevation={0} sx={{ borderRadius: 1.5, overflow: 'hidden', mb: 1.5, border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, boxShadow: darkMode ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)' }}>
                {resp.table.map((row, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      py: 0.75,
                      px: 1.5,
                      borderBottom: idx < resp.table.length - 1 ? `1px solid ${colors.border}` : 'none',
                      bgcolor: idx % 2 === 0 ? alpha(colors.primary, 0.03) : 'transparent',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.7rem', width: '45%', flexShrink: 0 }}>
                      {row.dimension}
                    </Typography>
                    <Typography variant="caption" fontWeight={600} sx={{ color: colors.text, fontSize: '0.72rem' }}>
                      {row.value}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            )}

            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem', mb: 0.5, display: 'block' }}>
              Follow-up questions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {resp.followUps.map((fu, idx) => (
                <Chip
                  key={idx}
                  label={fu}
                  size="small"
                  onClick={() => handleSuggestionClick(fu)}
                  sx={{
                    fontSize: '0.65rem',
                    height: 'auto',
                    py: 0.3,
                    justifyContent: 'flex-start',
                    bgcolor: alpha(colors.primary, 0.06),
                    color: colors.primary,
                    cursor: 'pointer',
                    border: `1px solid ${alpha(colors.primary, 0.12)}`,
                    '& .MuiChip-label': { whiteSpace: 'normal' },
                    '&:hover': { bgcolor: alpha(colors.primary, 0.12) },
                  }}
                />
              ))}
            </Box>

            <Button
              variant="outlined"
              size="small"
              startIcon={<SmartToyIcon sx={{ fontSize: 16 }} />}
              sx={{
                mt: 1.5,
                textTransform: 'none',
                fontSize: '0.72rem',
                fontWeight: 600,
                borderColor: alpha(colors.primary, 0.3),
                color: colors.primary,
              }}
            >
              Create Agent from this query
            </Button>
          </Box>
        </Box>
      </Box>
    );
  };

  // ============================================
  // RENDER: RIGHT PANEL — Agent Detail (Mode D)
  // ============================================
  const renderAgentDetail = () => {
    if (!selectedAgent) return null;
    const a = selectedAgent;
    const catInfo = reveqCategoryInfo[a.category] || {};

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${colors.border}` }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <DotIcon sx={{ fontSize: 12, color: a.enabled ? '#10b981' : colors.textSecondary }} />
              <Chip
                label={a.enabled ? 'Active' : 'Paused'}
                size="small"
                sx={{
                  height: 22, fontSize: '0.65rem', fontWeight: 600,
                  bgcolor: a.enabled ? alpha('#10b981', 0.1) : alpha(colors.textSecondary, 0.1),
                  color: a.enabled ? '#10b981' : colors.textSecondary,
                }}
              />
              <Chip
                label={a.severity}
                size="small"
                sx={{
                  height: 22, fontSize: '0.65rem', fontWeight: 600,
                  bgcolor: alpha(getSeverityColor(a.severity, colors), 0.1),
                  color: getSeverityColor(a.severity, colors),
                }}
              />
            </Box>
            <IconButton size="small" onClick={() => setSelectedAgent(null)} sx={{ color: colors.textSecondary }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: colors.text, fontSize: '0.88rem', lineHeight: 1.3, mb: 0.5 }}>
            {a.name}
          </Typography>
          <Chip
            label={catInfo.name || a.category}
            size="small"
            sx={{ height: 20, fontSize: '0.6rem', bgcolor: alpha(catInfo.color || colors.primary, 0.1), color: catInfo.color || colors.primary }}
          />
        </Box>

        {/* Description */}
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ color: colors.text, fontSize: '0.78rem', lineHeight: 1.5, mb: 1.5 }}>
            {a.description}
          </Typography>

          {/* NL Query */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(colors.primary, 0.04),
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              boxShadow: darkMode ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
              mb: 1.5,
            }}
          >
            <Typography variant="caption" fontWeight={600} sx={{ color: colors.primary, fontSize: '0.65rem', textTransform: 'uppercase', mb: 0.5, display: 'block' }}>
              Natural Language Query
            </Typography>
            <Typography variant="caption" sx={{ color: colors.text, fontSize: '0.72rem', lineHeight: 1.4, fontStyle: 'italic' }}>
              "{a.natural_language_query}"
            </Typography>
          </Paper>
        </Box>

        {/* Metrics */}
        <Box sx={{ px: 2, pb: 1.5 }}>
          <Typography variant="caption" fontWeight={600} sx={{ color: colors.textSecondary, fontSize: '0.68rem', textTransform: 'uppercase', mb: 0.75, display: 'block' }}>
            Performance
          </Typography>

          {/* Accuracy bar */}
          {a.accuracy != null && (
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.68rem' }}>Accuracy</Typography>
                <Typography variant="caption" fontWeight={600} sx={{ color: '#10b981', fontSize: '0.72rem' }}>{a.accuracy}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={a.accuracy}
                sx={{
                  height: 6, borderRadius: 3,
                  bgcolor: alpha('#10b981', 0.1),
                  '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 3 },
                }}
              />
            </Box>
          )}

          {/* Stats grid */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Paper elevation={0} sx={{ flex: 1, p: 1, borderRadius: 1.5, bgcolor: alpha(colors.primary, 0.03), boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.6rem' }}>Frequency</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: colors.text, fontSize: '0.75rem' }}>{a.frequency}</Typography>
            </Paper>
            <Paper elevation={0} sx={{ flex: 1, p: 1, borderRadius: 1.5, bgcolor: alpha(colors.primary, 0.03), boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.6rem' }}>Scope</Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: colors.text, fontSize: '0.75rem' }}>{a.scope}</Typography>
            </Paper>
          </Box>

          {/* True/False positives */}
          {(a.true_positives || a.false_positives) && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip label={`TP: ${a.true_positives}`} size="small" sx={{ height: 20, fontSize: '0.6rem', bgcolor: alpha('#10b981', 0.1), color: '#10b981' }} />
              <Chip label={`FP: ${a.false_positives}`} size="small" sx={{ height: 20, fontSize: '0.6rem', bgcolor: alpha(colors.error, 0.1), color: colors.error }} />
            </Box>
          )}
        </Box>

        {/* Business value */}
        <Box sx={{ px: 2, pb: 1.5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha('#10b981', 0.06),
              boxShadow: darkMode ? '0 1px 3px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.06)',
            }}
          >
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>Business Value</Typography>
            <Typography variant="body2" fontWeight={600} sx={{ color: colors.text, fontSize: '0.78rem', mt: 0.25 }}>
              {a.business_value}
            </Typography>
          </Paper>
        </Box>

        {/* Last run + ML model */}
        <Box sx={{ px: 2, pb: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>
              Last run: {a.last_run ? getRelativeTime(a.last_run) : 'Never'}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>
              Model: <strong>{a.ml_model}</strong>
            </Typography>
          </Box>
        </Box>

        {/* Action buttons */}
        <Box sx={{ px: 2, pb: 2, mt: 'auto', display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ConfigIcon sx={{ fontSize: 16 }} />}
            onClick={() => setShowAgentWizard(true)}
            sx={{
              flex: 1,
              textTransform: 'none',
              fontSize: '0.72rem',
              fontWeight: 600,
              borderColor: alpha(colors.primary, 0.3),
              color: colors.primary,
            }}
          >
            Configure
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<PlayArrowIcon sx={{ fontSize: 16 }} />}
            sx={{
              flex: 1,
              textTransform: 'none',
              fontSize: '0.72rem',
              fontWeight: 600,
              bgcolor: colors.primary,
            }}
          >
            Execute
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={a.enabled ? <PauseIcon sx={{ fontSize: 16 }} /> : <PlayArrowIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: 'none',
              fontSize: '0.72rem',
              fontWeight: 600,
              borderColor: alpha(a.enabled ? colors.warning : '#10b981', 0.4),
              color: a.enabled ? colors.warning : '#10b981',
            }}
          >
            {a.enabled ? 'Pause' : 'Resume'}
          </Button>
        </Box>
      </Box>
    );
  };

  // ============================================
  // RENDER: RIGHT PANEL — 4-mode switch
  // ============================================
  const renderRightPanel = () => (
    <Paper
      elevation={0}
      sx={{
        width: 360,
        minWidth: 360,
        borderLeft: `1px solid ${colors.border}`,
        bgcolor: colors.paper,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {selectedEvent ? renderEventDetail()
        : selectedAgent ? renderAgentDetail()
        : askPulseResponse ? renderAskPulseResponse()
        : renderRightEmpty()}
    </Paper>
  );

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          height: 'calc(100vh - 160px)',
          bgcolor: darkMode ? '#0d1117' : '#f5f5f5',
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${colors.border}`,
        }}
      >
        {renderLeftPanel()}
        {renderCenterPanel()}
        {renderRightPanel()}
      </Box>

      {/* Agent Creation Wizard Dialog */}
      <Dialog
        open={showAgentWizard}
        onClose={() => setShowAgentWizard(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 3 }}>
          <AgentCreationWizard
            userId="persona"
            onClose={() => setShowAgentWizard(false)}
            onSave={() => setShowAgentWizard(false)}
            darkMode={darkMode}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PulseCommandTab;
