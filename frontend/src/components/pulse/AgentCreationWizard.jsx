import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Switch,
  FormControlLabel,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  alpha,
  StepConnector,
  stepConnectorClasses,
  styled,
  Collapse,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Inventory as InventoryIcon,
  ShowChart as ShowChartIcon,
  LocalShipping as LocalShippingIcon,
  AttachMoney as AttachMoneyIcon,
  Psychology as PsychologyIcon,
  ShoppingCart as ShoppingCartIcon,
  Security as SecurityIcon,
  SwapHoriz as SwapHorizIcon,
  Tune as TuneIcon,
  Warehouse as WarehouseIcon,
  Storage as StorageIcon,
  AccountTree as AccountTreeIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Phone as PhoneIcon,
  RocketLaunch as RocketLaunchIcon,
  Bolt as BoltIcon,
  Assessment as AssessmentIcon,
  Insights as InsightsIcon,
  PriceCheck as PriceCheckIcon,
  Groups as GroupsIcon,
  QueryStats as QueryStatsIcon,
  Receipt as ReceiptIcon,
  Sensors as SensorsIcon,
  Hub as HubIcon,
  Route as RouteIcon,
  Description as DescriptionIcon,
  MonitorHeart as MonitorHeartIcon,
  MedicalServices as MedicalServicesIcon,
  Gavel as GavelIcon,
  Assignment as AssignmentIcon,
  Rule as RuleIcon,
  DataObject as DataObjectIcon,
  BugReport as BugReportIcon,
  Replay as ReplayIcon,
  AltRoute as AltRouteIcon,
  FactCheck as FactCheckIcon,
  PersonSearch as PersonSearchIcon,
  ReceiptLong as ReceiptLongIcon,
  CurrencyExchange as CurrencyExchangeIcon,
  Handshake as HandshakeIcon,
  Timer as TimerIcon,
  GpsFixed as GpsFixedIcon,
  EnergySavingsLeaf as EnergySavingsLeafIcon,
  Build as BuildIcon,
  Schema as SchemaIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { getColors } from '../../config/brandColors';
import { PROACTIVE_PATTERNS, PATTERN_SOURCE_LABELS } from './proactivePatternData';

const steps = ['Select Agent', 'Configure', 'Review & Deploy'];

// Category definitions — one per CORE.AI module + Proactive
const categories = [
  { id: 'all', label: 'All Templates', icon: AutoAwesomeIcon, color: '#6366f1' },
  { id: 'proactive', label: 'Proactive', icon: PsychologyIcon, color: '#e11d48', description: 'Proactive Detection Patterns' },
  { id: 'stox', label: 'Stox.AI', icon: InventoryIcon, color: '#00357a', description: 'Inventory & Distribution Intelligence' },
  { id: 'margen', label: 'Margen.AI', icon: ShowChartIcon, color: '#10b981', description: 'Margin & Profitability Intelligence' },
  { id: 'ordly', label: 'Ordly.AI', icon: ShoppingCartIcon, color: '#7c3aed', description: 'Order Intelligence & Automation' },
  { id: 'o2c', label: 'O2C.AI', icon: ReceiptIcon, color: '#e11d48', description: 'Order-to-Cash Process Intelligence' },
  { id: 'traxx', label: 'Traxx.AI', icon: SensorsIcon, color: '#0891b2', description: 'IoT Kit & Asset Tracking' },
  { id: 'route', label: 'Route.AI', icon: RouteIcon, color: '#ea580c', description: 'Fleet & Route Optimization' },
  { id: 'process', label: 'Process.AI', icon: AccountTreeIcon, color: '#4f46e5', description: 'Process Mining & Analytics' },
  { id: 'master', label: 'Master.AI', icon: HubIcon, color: '#0d9488', description: 'Master Data Quality & Governance' },
  { id: 'finance', label: 'Finance.AI', icon: AttachMoneyIcon, color: '#f59e0b', description: 'Financial Planning & Analytics' },
];

// Built-in template library — organized by CORE.AI module
const BUILT_IN_TEMPLATES = [

  // ━━━━━━━━━━━━━━━━ STOX.AI ━━━━━━━━━━━━━━━━
  {
    id: 'stox-stockout-risk', name: 'Stockout Risk Monitor', category: 'stox', icon: WarningIcon,
    description: 'Monitor inventory levels across all DCs and alert when stock drops below safety threshold',
    capabilities: ['Real-time DC monitoring', 'Auto-reorder triggers', 'Supplier escalation'],
    default_frequency: 'real-time', default_severity: 'critical', automation_level: 'execute',
    business_value: 'Prevents $125K+ lost sales', ml_model: 'InventoryOptimizer',
    natural_language_template: 'Monitor inventory levels across all distribution centers and alert when any SKU drops below safety stock threshold',
  },
  {
    id: 'stox-smart-reorder', name: 'Smart Reorder Agent', category: 'stox', icon: ShoppingCartIcon,
    description: 'Auto-generate purchase orders based on demand forecast, lead time, and current stock',
    capabilities: ['PO auto-generation', 'Lead time optimization', 'Demand-aware ordering'],
    default_frequency: 'hourly', default_severity: 'high', automation_level: 'simulate',
    business_value: 'Reduces rush orders by 40%', ml_model: 'DemandForecaster',
    natural_language_template: 'Generate reorder recommendations when inventory approaches reorder point factoring in supplier lead time and demand forecast',
  },
  {
    id: 'stox-working-capital', name: 'Working Capital Optimizer', category: 'stox', icon: AttachMoneyIcon,
    description: 'Identify excess inventory and slow-moving SKUs tying up working capital',
    capabilities: ['Excess detection', 'SKU rationalization', 'Capital release'],
    default_frequency: 'daily', default_severity: 'medium', automation_level: 'recommend',
    business_value: 'Releases $85K+ working capital', ml_model: 'InventoryOptimizer',
    natural_language_template: 'Identify excess inventory and slow-moving SKUs across all DCs with working capital impact analysis',
  },
  {
    id: 'stox-dc-rebalance', name: 'DC Rebalancing Agent', category: 'stox', icon: SwapHorizIcon,
    description: 'Recommend inter-DC transfers to optimize network inventory and prevent regional stockouts',
    capabilities: ['Network optimization', 'Transfer routing', 'Freight cost analysis'],
    default_frequency: 'daily', default_severity: 'high', automation_level: 'simulate',
    business_value: 'Prevents regional stockouts', ml_model: 'NetworkOptimizer',
    natural_language_template: 'Analyze inventory imbalances across distribution centers and recommend optimal inter-DC transfers',
  },
  {
    id: 'stox-seasonal-demand', name: 'Seasonal Demand Agent', category: 'stox', icon: TrendingUpIcon,
    description: 'Detect seasonal demand shifts and auto-adjust safety stock and forecasts',
    capabilities: ['Season detection', 'Safety stock adjustment', 'Forecast override'],
    default_frequency: 'weekly', default_severity: 'medium', automation_level: 'simulate',
    business_value: 'Captures 15% demand uplift', ml_model: 'SeasonalForecaster',
    natural_language_template: 'Monitor seasonal demand patterns and adjust safety stock levels for upcoming seasonal shifts',
  },
  {
    id: 'stox-mrp-optimizer', name: 'MRP Parameter Optimizer', category: 'stox', icon: TuneIcon,
    description: 'Continuously tune MRP parameters (lot size, lead time, ROP) based on actual performance',
    capabilities: ['Parameter tuning', 'SAP writeback', 'Performance tracking'],
    default_frequency: 'weekly', default_severity: 'medium', automation_level: 'simulate',
    business_value: 'Improves plan accuracy 20%', ml_model: 'InventoryOptimizer',
    natural_language_template: 'Analyze MRP parameter effectiveness and recommend optimized lot sizes, lead times, and reorder points',
  },

  // ━━━━━━━━━━━━━━━━ MARGEN.AI ━━━━━━━━━━━━━━━━
  {
    id: 'margen-margin-erosion', name: 'Margin Erosion Detector', category: 'margen', icon: TrendingUpIcon,
    description: 'Detect when product or customer margins fall below target thresholds from COPA data',
    capabilities: ['COPA margin tracking', 'Root cause analysis', 'Customer-SKU drill-down'],
    default_frequency: 'daily', default_severity: 'high', automation_level: 'recommend',
    business_value: 'Protects 2-3% margin', ml_model: 'MarginAnalyzer',
    natural_language_template: 'Alert when gross margin falls below target threshold for any product-customer combination in COPA data',
  },
  {
    id: 'margen-price-optimizer', name: 'Price Optimization Agent', category: 'margen', icon: PriceCheckIcon,
    description: 'Identify pricing opportunities based on competitive data, demand elasticity, and cost changes',
    capabilities: ['Competitive pricing', 'Elasticity modeling', 'Revenue optimization'],
    default_frequency: 'daily', default_severity: 'high', automation_level: 'recommend',
    business_value: '3-5% revenue uplift', ml_model: 'PriceOptimizer',
    natural_language_template: 'Analyze pricing across SKU-customer segments and recommend optimal price points based on elasticity and competition',
  },
  {
    id: 'margen-discount-leakage', name: 'Discount Leakage Monitor', category: 'margen', icon: AssessmentIcon,
    description: 'Track unauthorized discounts and rebate overages across sales channels',
    capabilities: ['Discount compliance', 'Rebate tracking', 'Leakage quantification'],
    default_frequency: 'daily', default_severity: 'medium', automation_level: 'recommend',
    business_value: 'Recovers $50K+ leakage', ml_model: 'MarginAnalyzer',
    natural_language_template: 'Monitor discount and rebate patterns to detect unauthorized discounts or rebate overages by sales rep and customer',
  },
  {
    id: 'margen-customer-contribution', name: 'Customer Contribution Monitor', category: 'margen', icon: GroupsIcon,
    description: 'Track customer profitability trends and alert on declining contribution margins',
    capabilities: ['Customer segmentation', 'Contribution tracking', 'Churn risk scoring'],
    default_frequency: 'weekly', default_severity: 'medium', automation_level: 'recommend',
    business_value: 'Identifies at-risk accounts', ml_model: 'CustomerValueScore',
    natural_language_template: 'Monitor customer contribution margins over time and alert when key accounts show declining profitability trends',
  },
  {
    id: 'margen-working-capital-cash', name: 'Cash & Working Capital Agent', category: 'margen', icon: CurrencyExchangeIcon,
    description: 'Monitor DSO, DPO, DIO and cash conversion cycle across distributor portfolio',
    capabilities: ['DSO/DPO/DIO tracking', 'Cash cycle alerts', 'AR aging analysis'],
    default_frequency: 'daily', default_severity: 'high', automation_level: 'recommend',
    business_value: 'Reduces DSO by 5+ days', ml_model: 'MarginAnalyzer',
    natural_language_template: 'Track DSO, DPO, and cash conversion cycle metrics and alert when working capital KPIs exceed target thresholds',
  },

  // ━━━━━━━━━━━━━━━━ ORDLY.AI ━━━━━━━━━━━━━━━━
  {
    id: 'ordly-order-pipeline', name: 'Order Pipeline Monitor', category: 'ordly', icon: AssignmentIcon,
    description: 'Track end-to-end sales order pipeline and alert on stalled or at-risk orders',
    capabilities: ['Pipeline visibility', 'Bottleneck detection', 'SLA tracking'],
    default_frequency: 'real-time', default_severity: 'high', automation_level: 'recommend',
    business_value: 'Reduces order cycle time 25%', ml_model: 'OrderFlowOptimizer',
    natural_language_template: 'Monitor sales order pipeline across all stages and alert on orders at risk of missing SLA or stuck in processing',
  },
  {
    id: 'ordly-customer-intent', name: 'Customer Intent Detector', category: 'ordly', icon: PersonSearchIcon,
    description: 'AI-powered customer intent extraction from emails, calls, and documents to auto-generate orders',
    capabilities: ['Intent extraction', 'Email/call parsing', 'Auto order creation'],
    default_frequency: 'real-time', default_severity: 'high', automation_level: 'simulate',
    business_value: 'Captures 30% more orders', ml_model: 'IntentExtractor',
    natural_language_template: 'Analyze incoming customer communications for purchase intent and auto-generate draft sales orders from extracted SKUs and quantities',
  },
  {
    id: 'ordly-sku-decisioning', name: 'SKU Decisioning Agent', category: 'ordly', icon: FactCheckIcon,
    description: 'Intelligent SKU selection and substitution when requested items are unavailable',
    capabilities: ['SKU matching', 'Substitution logic', 'Availability check'],
    default_frequency: 'real-time', default_severity: 'medium', automation_level: 'simulate',
    business_value: 'Reduces lost orders by 20%', ml_model: 'SKUDecisionEngine',
    natural_language_template: 'When ordered SKU is unavailable, recommend optimal substitute based on customer preferences, margin, and stock availability',
  },
  {
    id: 'ordly-order-value-control', name: 'Order Value Control Tower', category: 'ordly', icon: MonitorHeartIcon,
    description: 'Real-time pipeline value tracking with AI anomaly detection on order patterns',
    capabilities: ['Value tracking', 'Anomaly detection', 'Revenue forecasting'],
    default_frequency: 'hourly', default_severity: 'medium', automation_level: 'recommend',
    business_value: 'Improves forecast accuracy 15%', ml_model: 'OrderFlowOptimizer',
    natural_language_template: 'Track total order pipeline value in real-time and alert on unusual drops, spikes, or pattern shifts in order volume',
  },

  // ━━━━━━━━━━━━━━━━ O2C.AI ━━━━━━━━━━━━━━━━
  {
    id: 'o2c-dso-monitor', name: 'DSO & Collections Agent', category: 'o2c', icon: TimerIcon,
    description: 'Monitor Days Sales Outstanding and proactively manage AR aging across customer segments',
    capabilities: ['DSO tracking', 'AR aging alerts', 'Collection prioritization'],
    default_frequency: 'daily', default_severity: 'high', automation_level: 'recommend',
    business_value: 'Reduces DSO by 8 days', ml_model: 'CashFlowPredictor',
    natural_language_template: 'Track DSO by customer segment and alert when AR aging exceeds thresholds with prioritized collection recommendations',
  },
  {
    id: 'o2c-document-flow', name: 'Document Flow Watchdog', category: 'o2c', icon: DescriptionIcon,
    description: 'Track order-to-invoice document flow and alert on missing, blocked, or delayed documents',
    capabilities: ['Document flow tracking', 'Gap detection', 'Bottleneck alerts'],
    default_frequency: 'hourly', default_severity: 'high', automation_level: 'recommend',
    business_value: 'Eliminates billing delays', ml_model: 'ProcessMiner',
    natural_language_template: 'Monitor end-to-end document flow from sales order to invoice and alert on gaps, blocks, or delays in the O2C chain',
  },
  {
    id: 'o2c-churn-risk', name: 'Customer Churn Risk Agent', category: 'o2c', icon: PersonSearchIcon,
    description: 'Detect customers at risk of churning based on order patterns, payment behavior, and engagement',
    capabilities: ['Churn prediction', 'Behavioral scoring', 'Win-back triggers'],
    default_frequency: 'weekly', default_severity: 'high', automation_level: 'recommend',
    business_value: 'Retains 15% at-risk accounts', ml_model: 'CustomerValueScore',
    natural_language_template: 'Analyze customer order frequency, payment timeliness, and engagement signals to identify high-value accounts at risk of churning',
  },
  {
    id: 'o2c-revenue-leakage', name: 'Revenue Leakage Detector', category: 'o2c', icon: ReceiptLongIcon,
    description: 'Identify unbilled deliveries, pricing errors, and missing charges in the O2C process',
    capabilities: ['Billing accuracy', 'Price validation', 'Unbilled detection'],
    default_frequency: 'daily', default_severity: 'medium', automation_level: 'recommend',
    business_value: 'Recovers $200K+ annually', ml_model: 'MarginAnalyzer',
    natural_language_template: 'Scan all deliveries against invoices and pricing agreements to detect unbilled items, pricing errors, or missing surcharges',
  },

  // ━━━━━━━━━━━━━━━━ TRAXX.AI ━━━━━━━━━━━━━━━━
  {
    id: 'traxx-kit-control', name: 'Kit Control Tower Agent', category: 'traxx', icon: SensorsIcon,
    description: 'Real-time IoT monitoring of surgical kits with location, temperature, and completeness tracking',
    capabilities: ['GPS tracking', 'Sensor telemetry', 'Kit completeness alerts'],
    default_frequency: 'real-time', default_severity: 'critical', automation_level: 'execute',
    business_value: 'Prevents surgery cancellations', ml_model: 'IoTTelemetryEngine',
    natural_language_template: 'Monitor all surgical kit locations and sensor data in real-time and alert when kits are missing, incomplete, or out of temperature range',
  },
  {
    id: 'traxx-surgery-readiness', name: 'Surgery Readiness Agent', category: 'traxx', icon: MedicalServicesIcon,
    description: 'Predict whether scheduled surgeries will have complete kits delivered on time',
    capabilities: ['Readiness scoring', 'Kit ETA prediction', 'Escalation to logistics'],
    default_frequency: 'hourly', default_severity: 'critical', automation_level: 'recommend',
    business_value: '99%+ surgery readiness', ml_model: 'ReadinessPredictor',
    natural_language_template: 'Score surgery readiness for all scheduled procedures and alert when kit delivery risk threatens scheduled surgery times',
  },
  {
    id: 'traxx-loaner-utilization', name: 'Loaner Utilization Agent', category: 'traxx', icon: ReplayIcon,
    description: 'Track loaner kit utilization and flag underutilized or overdue assets for recovery',
    capabilities: ['Utilization tracking', 'Overdue alerts', 'Idle asset detection'],
    default_frequency: 'daily', default_severity: 'medium', automation_level: 'recommend',
    business_value: 'Improves utilization to 90%+', ml_model: 'AssetOptimizer',
    natural_language_template: 'Monitor loaner kit utilization rates and flag kits that are overdue for return, idle, or underutilized across facilities',
  },
  {
    id: 'traxx-logistics-economics', name: 'Logistics Cost Agent', category: 'traxx', icon: LocalShippingIcon,
    description: 'Compare planned vs actual freight costs and identify cost variance patterns',
    capabilities: ['Freight cost tracking', 'Variance analysis', 'Carrier performance'],
    default_frequency: 'daily', default_severity: 'medium', automation_level: 'recommend',
    business_value: 'Reduces freight costs 12%', ml_model: 'LogisticsOptimizer',
    natural_language_template: 'Track planned vs actual freight costs for kit shipments and alert on cost variances exceeding thresholds by carrier and route',
  },

  // ━━━━━━━━━━━━━━━━ ROUTE.AI ━━━━━━━━━━━━━━━━
  {
    id: 'route-fleet-monitor', name: 'Fleet Health Monitor', category: 'route', icon: GpsFixedIcon,
    description: 'Real-time vehicle tracking with predictive maintenance and driver performance alerts',
    capabilities: ['GPS tracking', 'Predictive maintenance', 'Driver scoring'],
    default_frequency: 'real-time', default_severity: 'high', automation_level: 'recommend',
    business_value: 'Reduces breakdowns 40%', ml_model: 'FleetTelemetryEngine',
    natural_language_template: 'Monitor fleet vehicle health, driver behavior, and maintenance schedules in real-time and alert on risks',
  },
  {
    id: 'route-delivery-eta', name: 'Delivery ETA Agent', category: 'route', icon: LocalShippingIcon,
    description: 'Predict delivery delays using traffic, weather, and historical route performance data',
    capabilities: ['ETA prediction', 'Traffic-aware routing', 'Customer notification'],
    default_frequency: 'real-time', default_severity: 'high', automation_level: 'execute',
    business_value: '98%+ on-time delivery', ml_model: 'RouteOptimizer',
    natural_language_template: 'Continuously predict delivery ETAs using real-time traffic and weather data and proactively notify customers of delays',
  },
  {
    id: 'route-optimization', name: 'Route Optimization Agent', category: 'route', icon: AltRouteIcon,
    description: 'Optimize delivery routes for cost, time, and carbon footprint across the fleet',
    capabilities: ['Multi-stop optimization', 'Fuel savings', 'Carbon tracking'],
    default_frequency: 'daily', default_severity: 'medium', automation_level: 'simulate',
    business_value: 'Saves 18% fuel costs', ml_model: 'RouteOptimizer',
    natural_language_template: 'Optimize daily delivery routes across the fleet to minimize total distance, fuel consumption, and carbon emissions',
  },
  {
    id: 'route-fuel-anomaly', name: 'Fuel & Efficiency Agent', category: 'route', icon: EnergySavingsLeafIcon,
    description: 'Detect fuel consumption anomalies and inefficient driving patterns across the fleet',
    capabilities: ['Fuel tracking', 'Anomaly detection', 'Eco-driving scoring'],
    default_frequency: 'daily', default_severity: 'medium', automation_level: 'recommend',
    business_value: 'Identifies fuel theft/waste', ml_model: 'FleetTelemetryEngine',
    natural_language_template: 'Track fuel consumption per vehicle and route, flag anomalies suggesting theft, leaks, or inefficient driving behavior',
  },

  // ━━━━━━━━━━━━━━━━ PROCESS.AI ━━━━━━━━━━━━━━━━
  {
    id: 'process-bottleneck', name: 'Process Bottleneck Detector', category: 'process', icon: BugReportIcon,
    description: 'Mine event logs to detect bottlenecks and throughput degradation in business processes',
    capabilities: ['Event log mining', 'Bottleneck detection', 'Throughput alerts'],
    default_frequency: 'daily', default_severity: 'high', automation_level: 'recommend',
    business_value: 'Reduces cycle time 30%', ml_model: 'ProcessMiner',
    natural_language_template: 'Analyze process event logs to detect bottlenecks where cycle time exceeds SLA and recommend process improvements',
  },
  {
    id: 'process-variant-drift', name: 'Process Variant Drift Agent', category: 'process', icon: AccountTreeIcon,
    description: 'Detect when process execution drifts from the standard path into costly variants',
    capabilities: ['Variant analysis', 'Conformance checking', 'Drift alerts'],
    default_frequency: 'daily', default_severity: 'medium', automation_level: 'recommend',
    business_value: 'Improves conformance 25%', ml_model: 'ProcessMiner',
    natural_language_template: 'Monitor process execution paths and alert when deviation from standard flow exceeds threshold or new costly variants emerge',
  },
  {
    id: 'process-automation-opportunity', name: 'Automation Opportunity Scanner', category: 'process', icon: BoltIcon,
    description: 'Identify repetitive, high-volume process steps that are candidates for RPA or automation',
    capabilities: ['Task mining', 'Automation scoring', 'ROI estimation'],
    default_frequency: 'weekly', default_severity: 'medium', automation_level: 'recommend',
    business_value: 'Identifies 40% automatable tasks', ml_model: 'ProcessMiner',
    natural_language_template: 'Scan process event logs to identify high-volume repetitive tasks suitable for automation with estimated ROI',
  },

  // ━━━━━━━━━━━━━━━━ MASTER.AI ━━━━━━━━━━━━━━━━
  {
    id: 'master-data-quality', name: 'Data Quality Watchdog', category: 'master', icon: FactCheckIcon,
    description: 'Continuously monitor master data quality across material, customer, and vendor records',
    capabilities: ['Quality scoring', 'Completeness checks', 'Duplicate detection'],
    default_frequency: 'daily', default_severity: 'high', automation_level: 'recommend',
    business_value: 'Maintains 98%+ quality score', ml_model: 'DataQualityEngine',
    natural_language_template: 'Score master data quality across all records and alert on completeness gaps, duplicates, or data decay patterns',
  },
  {
    id: 'master-gl-migration', name: 'GL Migration Intelligence Agent', category: 'master', icon: SchemaIcon,
    description: 'Monitor GL master data migration accuracy with AI semantic matching to YCOA target',
    capabilities: ['Semantic account matching', 'Field validation', 'Migration readiness'],
    default_frequency: 'daily', default_severity: 'high', automation_level: 'simulate',
    business_value: '95%+ migration accuracy', ml_model: 'SemanticMatcher',
    natural_language_template: 'Validate GL account mapping accuracy against YCOA target chart of accounts and flag mismatches or unmapped accounts',
  },
  {
    id: 'master-bp-resolution', name: 'Business Partner Resolution Agent', category: 'master', icon: HandshakeIcon,
    description: 'Detect and resolve duplicate business partners across customer and vendor masters',
    capabilities: ['Entity resolution', 'Fuzzy matching', 'Merge recommendations'],
    default_frequency: 'weekly', default_severity: 'medium', automation_level: 'simulate',
    business_value: 'Eliminates 90%+ duplicates', ml_model: 'EntityResolver',
    natural_language_template: 'Scan customer and vendor master records for potential duplicates using fuzzy matching and recommend merge actions',
  },
  {
    id: 'master-governance-compliance', name: 'Governance Compliance Agent', category: 'master', icon: GavelIcon,
    description: 'Ensure master data changes follow governance rules and approval workflows',
    capabilities: ['Change tracking', 'Policy compliance', 'Approval monitoring'],
    default_frequency: 'real-time', default_severity: 'high', automation_level: 'execute',
    business_value: '100% governed changes', ml_model: 'DataQualityEngine',
    natural_language_template: 'Monitor all master data changes in real-time and enforce governance policies, blocking unauthorized modifications',
  },

  // ━━━━━━━━━━━━━━━━ FINANCE.AI ━━━━━━━━━━━━━━━━
  {
    id: 'fin-revenue-anomaly', name: 'Revenue Anomaly Detector', category: 'finance', icon: InsightsIcon,
    description: 'Detect unexpected revenue drops or spikes across regions, channels, and product lines',
    capabilities: ['Anomaly detection', 'Root cause drill-down', 'Trend analysis'],
    default_frequency: 'daily', default_severity: 'high', automation_level: 'recommend',
    business_value: 'Early revenue risk detection', ml_model: 'AnomalyDetector',
    natural_language_template: 'Alert when revenue drops more than 10% compared to trailing average by region or product line',
  },
  {
    id: 'fin-cost-variance', name: 'Cost Variance Monitor', category: 'finance', icon: QueryStatsIcon,
    description: 'Monitor actual vs. planned costs and flag significant variances for investigation',
    capabilities: ['Budget tracking', 'Variance analysis', 'Cost center alerts'],
    default_frequency: 'weekly', default_severity: 'medium', automation_level: 'recommend',
    business_value: 'Controls cost overruns', ml_model: 'MarginAnalyzer',
    natural_language_template: 'Track actual costs against budget and alert when variance exceeds threshold by cost center',
  },
  {
    id: 'fin-forecast-accuracy', name: 'Forecast Accuracy Agent', category: 'finance', icon: TimelineIcon,
    description: 'Track forecast vs actuals and alert when prediction accuracy degrades',
    capabilities: ['MAPE tracking', 'Bias detection', 'Model drift alerts'],
    default_frequency: 'weekly', default_severity: 'medium', automation_level: 'recommend',
    business_value: 'Maintains <10% MAPE', ml_model: 'ForecastValidator',
    natural_language_template: 'Compare revenue and demand forecasts against actuals and alert when forecast accuracy drops below acceptable thresholds',
  },
  {
    id: 'fin-scenario-monitor', name: 'Scenario Impact Agent', category: 'finance', icon: RuleIcon,
    description: 'Continuously evaluate active what-if scenarios against real-time data and alert on trigger conditions',
    capabilities: ['Scenario evaluation', 'Trigger monitoring', 'Monte Carlo updates'],
    default_frequency: 'daily', default_severity: 'medium', automation_level: 'simulate',
    business_value: 'Proactive risk management', ml_model: 'ScenarioEngine',
    natural_language_template: 'Evaluate all active financial scenarios against incoming data and alert when scenario trigger conditions are met',
  },
];

// Convert PROACTIVE_PATTERNS to template format
const PATTERN_TEMPLATES = PROACTIVE_PATTERNS.map(p => ({
  id: `pattern-${p.id}`,
  name: p.name,
  category: 'proactive',
  icon: PsychologyIcon,
  description: p.description,
  capabilities: [
    `Source: ${PATTERN_SOURCE_LABELS[p.source]}`,
    `ERP: ${p.erpAction}`,
    p.status === 'detected' ? `${p.detectionCount} detections` : 'Clear',
  ],
  default_frequency: 'daily',
  default_severity: p.detectionCount >= 5 ? 'critical' : p.detectionCount >= 3 ? 'high' : 'medium',
  automation_level: p.defaultLevel,
  business_value: p.erpAction,
  ml_model: 'ProactiveDetector',
  natural_language_template: p.description,
  _patternSource: p.source,
  _patternActions: p.actions,
  _detectionTables: p.detectionTables,
}));

// ── Module-specific configuration context ──
const MODULE_CONFIG = {
  stox: {
    scopeLabel: 'Distribution Scope',
    scopeSections: [
      { label: 'Plants', field: 'scope_primary', color: '#00357a', items: ['P1000 Detroit (Midwest)', 'P2000 Phoenix (West)', 'P3000 Seattle (West)', 'P4000 Atlanta (Southeast)', 'P5000 Houston (Central)'] },
      { label: 'Product Lines', field: 'scope_secondary', color: '#10b981', items: ['Hydraulic Pump Assembly', 'Bearing Assembly 2x4', 'Gasket Kit Standard', 'Control Valve Assembly', 'Electronic Sensor Module', 'Legacy Connector Type-B', 'Precision Gear Set'] },
      { label: 'Customer Accounts', field: 'scope_tertiary', color: '#8b5cf6', items: ['AutoMotion Corp', 'Pacific Equipment', 'Apex Manufacturing', 'TechDrive Systems', 'Precision Parts', 'Summit Industrial', 'Western Hydraulics', 'Lakeside Engineering', 'Continental Motors', 'Redline Automation'] },
    ],
    actions: [
      { key: 'auto_po', label: 'Auto-Generate Purchase Orders', desc: 'Create POs at reorder point', icon: ShoppingCartIcon },
      { key: 'safety_stock', label: 'Safety Stock Adjustment', desc: 'Dynamic safety stock levels', icon: SecurityIcon },
      { key: 'dc_transfer', label: 'Inter-DC Stock Transfer', desc: 'Rebalancing between DCs', icon: SwapHorizIcon },
      { key: 'mrp_tuning', label: 'MRP Parameter Tuning', desc: 'Optimize lot size & lead time', icon: TuneIcon },
      { key: 'forecast_override', label: 'Demand Forecast Override', desc: 'Push AI forecast adjustments', icon: TrendingUpIcon },
      { key: 'supplier_escalation', label: 'Supplier Escalation', desc: 'Auto-escalate on breach', icon: LocalShippingIcon },
    ],
    erpModules: ['MM', 'PP', 'WM'],
  },
  margen: {
    scopeLabel: 'Revenue Scope',
    scopeSections: [
      { label: 'Customer Segments', field: 'scope_primary', color: '#10b981', items: ['Enterprise', 'Mid-Market', 'SMB', 'Channel Partners', 'Direct-to-Consumer'] },
      { label: 'Product Categories', field: 'scope_secondary', color: '#8b5cf6', items: ['Hydraulics', 'Bearings & Seals', 'Valves & Controls', 'Electronics', 'Drivetrain'] },
      { label: 'Regions', field: 'scope_tertiary', color: '#0ea5e9', items: ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West Coast', 'Pacific Northwest'] },
    ],
    actions: [
      { key: 'price_adjustment', label: 'Price Adjustment', desc: 'Auto-adjust pricing recommendations', icon: PriceCheckIcon },
      { key: 'discount_approval', label: 'Discount Approval Gate', desc: 'Flag unauthorized discounts', icon: GavelIcon },
      { key: 'margin_alert', label: 'Margin Alert Escalation', desc: 'Escalate low-margin deals', icon: WarningIcon },
      { key: 'customer_review', label: 'Customer Review Trigger', desc: 'Auto-flag declining accounts', icon: GroupsIcon },
      { key: 'copa_report', label: 'COPA Report Generation', desc: 'Auto-generate profitability reports', icon: AssessmentIcon },
    ],
    erpModules: ['CO', 'SD', 'FI'],
  },
  ordly: {
    scopeLabel: 'Order Scope',
    scopeSections: [
      { label: 'Order Channels', field: 'scope_primary', color: '#7c3aed', items: ['EDI', 'Email', 'Portal', 'Phone', 'API/Integration', 'Marketplace'] },
      { label: 'Customer Tiers', field: 'scope_secondary', color: '#10b981', items: ['Tier 1 - Strategic', 'Tier 2 - Key Accounts', 'Tier 3 - Standard', 'Tier 4 - Emerging'] },
      { label: 'Product Groups', field: 'scope_tertiary', color: '#0ea5e9', items: ['Made-to-Stock', 'Made-to-Order', 'Configured Products', 'Services', 'Spare Parts'] },
    ],
    actions: [
      { key: 'auto_order', label: 'Auto-Create Sales Order', desc: 'Generate SO from customer intent', icon: ShoppingCartIcon },
      { key: 'sku_substitution', label: 'SKU Auto-Substitution', desc: 'Substitute unavailable items', icon: SwapHorizIcon },
      { key: 'order_validation', label: 'Order Validation Check', desc: 'Pre-validate before SAP commit', icon: FactCheckIcon },
      { key: 'intent_extraction', label: 'Intent Auto-Extraction', desc: 'Parse emails/calls for orders', icon: PersonSearchIcon },
      { key: 'pipeline_escalation', label: 'Pipeline Escalation', desc: 'Escalate stalled orders', icon: WarningIcon },
    ],
    erpModules: ['SD', 'MM'],
  },
  o2c: {
    scopeLabel: 'O2C Process Scope',
    scopeSections: [
      { label: 'Process Stages', field: 'scope_primary', color: '#e11d48', items: ['Order Entry', 'Credit Check', 'Fulfillment', 'Shipping', 'Invoicing', 'Payment', 'Collections'] },
      { label: 'Sales Organizations', field: 'scope_secondary', color: '#0ea5e9', items: ['US East - 1000', 'US West - 2000', 'Canada - 3000', 'LATAM - 4000'] },
      { label: 'Document Types', field: 'scope_tertiary', color: '#10b981', items: ['Sales Orders', 'Deliveries', 'Invoices', 'Credit Memos', 'Returns'] },
    ],
    actions: [
      { key: 'collection_trigger', label: 'Collection Trigger', desc: 'Auto-initiate collection calls', icon: PhoneIcon },
      { key: 'credit_hold', label: 'Credit Hold Management', desc: 'Auto-release or escalate holds', icon: SecurityIcon },
      { key: 'invoice_validation', label: 'Invoice Validation', desc: 'Validate invoices before sending', icon: FactCheckIcon },
      { key: 'dispute_routing', label: 'Dispute Auto-Routing', desc: 'Route disputes to right team', icon: AccountTreeIcon },
      { key: 'payment_reminder', label: 'Payment Reminder', desc: 'Auto-send payment reminders', icon: EmailIcon },
    ],
    erpModules: ['SD', 'FI', 'CO'],
  },
  traxx: {
    scopeLabel: 'Asset Tracking Scope',
    scopeSections: [
      { label: 'Kit Types', field: 'scope_primary', color: '#0891b2', items: ['Trauma Kits', 'Spine Kits', 'Joint Replacement', 'Arthroscopy', 'Custom Procedure Trays'] },
      { label: 'Facilities', field: 'scope_secondary', color: '#10b981', items: ['Memorial Hospital', 'St. Luke\'s Medical', 'City General', 'Valley Surgical Center', 'University Medical'] },
      { label: 'Sensor Types', field: 'scope_tertiary', color: '#f59e0b', items: ['GPS Location', 'Temperature', 'Humidity', 'Shock/Impact', 'Tamper Detection'] },
    ],
    actions: [
      { key: 'kit_recall', label: 'Kit Recall Alert', desc: 'Trigger recall on integrity breach', icon: WarningIcon },
      { key: 'logistics_dispatch', label: 'Logistics Dispatch', desc: 'Auto-dispatch replacement kits', icon: LocalShippingIcon },
      { key: 'surgery_notify', label: 'Surgery Team Notification', desc: 'Alert surgical team on delays', icon: MedicalServicesIcon },
      { key: 'temp_escalation', label: 'Temperature Escalation', desc: 'Escalate cold chain breaches', icon: MonitorHeartIcon },
      { key: 'loaner_return', label: 'Loaner Return Reminder', desc: 'Auto-remind overdue returns', icon: ReplayIcon },
    ],
    erpModules: ['MM', 'PM'],
  },
  route: {
    scopeLabel: 'Fleet Scope',
    scopeSections: [
      { label: 'Vehicle Types', field: 'scope_primary', color: '#ea580c', items: ['Box Trucks', 'Refrigerated', 'Vans', 'Flatbed', 'Last-Mile EVs'] },
      { label: 'Regions / Zones', field: 'scope_secondary', color: '#0ea5e9', items: ['Northeast Corridor', 'Southeast Hub', 'Midwest Loop', 'Texas Triangle', 'West Coast', 'Pacific NW'] },
      { label: 'Delivery Types', field: 'scope_tertiary', color: '#10b981', items: ['Same-Day', 'Next-Day', 'Standard 3-5 Day', 'Scheduled Weekly', 'LTL Consolidation'] },
    ],
    actions: [
      { key: 'route_reroute', label: 'Dynamic Re-Routing', desc: 'Auto-reroute on traffic/weather', icon: AltRouteIcon },
      { key: 'maintenance_alert', label: 'Maintenance Dispatch', desc: 'Schedule preventive service', icon: BuildIcon },
      { key: 'driver_alert', label: 'Driver Safety Alert', desc: 'Alert on unsafe driving patterns', icon: WarningIcon },
      { key: 'customer_eta', label: 'Customer ETA Update', desc: 'Auto-send ETA notifications', icon: NotificationsIcon },
      { key: 'fuel_alert', label: 'Fuel Anomaly Alert', desc: 'Flag unusual fuel consumption', icon: EnergySavingsLeafIcon },
    ],
    erpModules: ['MM', 'PM', 'SD'],
  },
  process: {
    scopeLabel: 'Process Scope',
    scopeSections: [
      { label: 'Business Processes', field: 'scope_primary', color: '#4f46e5', items: ['Order-to-Cash', 'Procure-to-Pay', 'Record-to-Report', 'Plan-to-Produce', 'Hire-to-Retire'] },
      { label: 'Systems', field: 'scope_secondary', color: '#0ea5e9', items: ['SAP ECC', 'SAP S/4HANA', 'Salesforce', 'ServiceNow', 'Ariba'] },
      { label: 'Metrics', field: 'scope_tertiary', color: '#10b981', items: ['Cycle Time', 'Throughput', 'Conformance Rate', 'Rework Rate', 'Automation Rate'] },
    ],
    actions: [
      { key: 'bottleneck_alert', label: 'Bottleneck Alert', desc: 'Flag process bottlenecks', icon: BugReportIcon },
      { key: 'variant_flag', label: 'Variant Drift Flag', desc: 'Alert on non-standard paths', icon: AccountTreeIcon },
      { key: 'automation_recommend', label: 'Automation Recommendation', desc: 'Suggest RPA candidates', icon: BoltIcon },
      { key: 'sla_breach', label: 'SLA Breach Alert', desc: 'Alert before SLA violation', icon: TimerIcon },
    ],
    erpModules: ['BC', 'ALL'],
  },
  master: {
    scopeLabel: 'Data Domain Scope',
    scopeSections: [
      { label: 'Data Domains', field: 'scope_primary', color: '#0d9488', items: ['Material Master', 'Customer Master', 'Vendor Master', 'GL Accounts', 'Cost Centers', 'Profit Centers'] },
      { label: 'Source Systems', field: 'scope_secondary', color: '#4f46e5', items: ['SAP ECC', 'SAP S/4HANA', 'Legacy ERP', 'CRM', 'MDM Hub'] },
      { label: 'Quality Dimensions', field: 'scope_tertiary', color: '#f59e0b', items: ['Completeness', 'Accuracy', 'Consistency', 'Timeliness', 'Uniqueness'] },
    ],
    actions: [
      { key: 'duplicate_merge', label: 'Auto-Merge Duplicates', desc: 'Merge confirmed duplicate records', icon: HandshakeIcon },
      { key: 'quality_fix', label: 'Data Quality Fix', desc: 'Auto-correct known patterns', icon: BuildIcon },
      { key: 'governance_block', label: 'Governance Block', desc: 'Block unauthorized changes', icon: GavelIcon },
      { key: 'migration_validate', label: 'Migration Validation', desc: 'Validate migrated records', icon: FactCheckIcon },
      { key: 'enrichment_trigger', label: 'Data Enrichment', desc: 'Trigger external data enrichment', icon: DataObjectIcon },
    ],
    erpModules: ['BC', 'MM', 'FI'],
  },
  finance: {
    scopeLabel: 'Financial Scope',
    scopeSections: [
      { label: 'Financial Areas', field: 'scope_primary', color: '#f59e0b', items: ['Revenue', 'COGS', 'Operating Expenses', 'Working Capital', 'Cash Flow', 'EBITDA'] },
      { label: 'Cost Centers', field: 'scope_secondary', color: '#e11d48', items: ['Sales & Marketing', 'Operations', 'R&D', 'G&A', 'Supply Chain', 'IT'] },
      { label: 'Reporting Periods', field: 'scope_tertiary', color: '#4f46e5', items: ['Monthly Close', 'Quarterly Review', 'Annual Budget', 'Rolling Forecast', 'Ad-hoc Analysis'] },
    ],
    actions: [
      { key: 'variance_alert', label: 'Budget Variance Alert', desc: 'Flag budget overruns', icon: QueryStatsIcon },
      { key: 'forecast_update', label: 'Forecast Auto-Update', desc: 'Adjust forecast with actuals', icon: TimelineIcon },
      { key: 'close_task', label: 'Close Task Automation', desc: 'Auto-trigger close activities', icon: AssignmentIcon },
      { key: 'scenario_alert', label: 'Scenario Trigger Alert', desc: 'Alert on scenario conditions', icon: RuleIcon },
    ],
    erpModules: ['FI', 'CO', 'EC'],
  },
  proactive: {
    scopeLabel: 'Detection Scope',
    scopeSections: [
      { label: 'Detection Sources', field: 'scope_primary', color: '#e11d48', items: ['COPA Profitability', 'STOX Supply Chain', 'SAP Tables', 'BigQuery Views'] },
      { label: 'Business Areas', field: 'scope_secondary', color: '#0ea5e9', items: ['Revenue Protection', 'Cost Control', 'Inventory', 'Procurement', 'Planning'] },
      { label: 'Action Types', field: 'scope_tertiary', color: '#10b981', items: ['Price Adjustment', 'PO Creation', 'Parameter Update', 'Vendor Review', 'Stock Transfer'] },
    ],
    actions: [
      { key: 'auto_detect', label: 'Auto-Detection', desc: 'Run pattern detection', icon: PsychologyIcon },
      { key: 'erp_action', label: 'ERP Action', desc: 'Execute via Command Tower', icon: StorageIcon },
      { key: 'escalation', label: 'Auto-Escalation', desc: 'Escalate on threshold breach', icon: WarningIcon },
      { key: 'simulation', label: 'What-If Simulation', desc: 'Run scenario analysis', icon: TimelineIcon },
    ],
    erpModules: ['MM', 'CO', 'SD'],
  },
};

const DEFAULT_MODULE_CONFIG = MODULE_CONFIG.stox;

const ESCALATION_TIERS = [
  { tier: 1, label: 'Tier 1', hours: '0-2', action: 'In-app notification + AI recommendation', icon: NotificationsIcon },
  { tier: 2, label: 'Tier 2', hours: '2-4', action: 'Email/Slack to assigned planner', icon: EmailIcon },
  { tier: 3, label: 'Tier 3', hours: '4-8', action: 'SMS + manager notification', icon: SmsIcon },
  { tier: 4, label: 'Tier 4', hours: '8+', action: 'Voice call + auto-execute if enabled', icon: PhoneIcon },
];

// Custom stepper connector
const StepperConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 18 },
  [`& .${stepConnectorClasses.line}`]: {
    height: 2,
    border: 0,
    backgroundColor: '#e0e0e0',
    borderRadius: 1,
  },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: { backgroundColor: '#00357a' },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: { backgroundColor: '#00357a' },
}));

// Custom stepper icon
const STEP_ICONS = {
  1: AutoAwesomeIcon,
  2: TuneIcon,
  3: RocketLaunchIcon,
};

const StepIconRoot = styled(Box)(({ ownerState }) => ({
  width: 36,
  height: 36,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
  ...(ownerState.active && {
    backgroundColor: '#00357a',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(0,53,122,0.3)',
  }),
  ...(ownerState.completed && {
    backgroundColor: '#00357a',
    color: '#fff',
  }),
  ...(!ownerState.active && !ownerState.completed && {
    backgroundColor: 'rgba(0,53,122,0.08)',
    color: '#64748b',
  }),
}));

function CustomStepIcon(props) {
  const { active, completed, icon } = props;
  const IconComp = STEP_ICONS[icon];
  return (
    <StepIconRoot ownerState={{ active, completed }}>
      {completed ? <CheckCircleIcon sx={{ fontSize: 20 }} /> : <IconComp sx={{ fontSize: 20 }} />}
    </StepIconRoot>
  );
}

// Helper: wizard card style
const wizardCardSx = (accentColor, isActive, dm, colors) => ({
  p: 1.5,
  borderRadius: 2,
  border: `1px solid ${isActive ? alpha(accentColor, 0.3) : dm ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
  bgcolor: isActive ? alpha(accentColor, dm ? 0.12 : 0.04) : colors.cardBg,
  boxShadow: dm ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
  cursor: 'pointer',
  transition: 'all 0.15s',
  '&:hover': {
    boxShadow: dm ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.12)',
    borderColor: alpha(accentColor, 0.35),
    transform: 'translateY(-1px)',
  },
});

// Helper: section header style
const wizardSectionSx = (dm, colors) => ({
  p: 1.5,
  mb: 2,
  borderRadius: 1.5,
  bgcolor: colors.paper,
  border: `1px solid ${dm ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
  boxShadow: dm ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  cursor: 'pointer',
  userSelect: 'none',
});

// ── Featured categories for the "All" view ──
const FEATURED_CATEGORIES = ['proactive', 'stox', 'margen', 'ordly'];

// ── Execution plan builder: maps template + config into a multi-step pipeline ──
const EXECUTION_STEP_TYPES = {
  detect:    { label: 'Detect',    icon: 'search',  desc: 'Pattern detection & anomaly scan' },
  query:     { label: 'Query',     icon: 'data',    desc: 'Data retrieval from source systems' },
  analyze:   { label: 'Analyze',   icon: 'brain',   desc: 'AI/ML analysis & scoring' },
  decide:    { label: 'Decide',    icon: 'rule',    desc: 'Apply business rules & thresholds' },
  simulate:  { label: 'Simulate',  icon: 'play',    desc: 'Run what-if scenarios' },
  approve:   { label: 'Approve',   icon: 'shield',  desc: 'Human-in-the-loop approval gate' },
  execute:   { label: 'Execute',   icon: 'bolt',    desc: 'Execute action in target system' },
  notify:    { label: 'Notify',    icon: 'bell',    desc: 'Send alerts & notifications' },
  learn:     { label: 'Learn',     icon: 'refresh', desc: 'Feedback loop & model improvement' },
};

const buildExecutionPlan = (template, cfg) => {
  const steps = [];
  const cat = template?.category || 'stox';
  const level = cfg?.automation_level || template?.automation_level || 'recommend';
  const modCfg = MODULE_CONFIG[cat] || DEFAULT_MODULE_CONFIG;
  const source = template?._patternSource;

  // Step 1: Detection / data query
  if (source) {
    steps.push({
      type: 'detect',
      title: `Run ${source.toUpperCase()} pattern detection`,
      detail: `Scan ${(template?._detectionTables || []).join(', ') || 'source tables'} for anomalies`,
      integration: `BigQuery · SAP ${modCfg.erpModules.join('/')}`,
    });
  } else {
    steps.push({
      type: 'query',
      title: `Query ${modCfg.erpModules.join(', ')} data`,
      detail: template?.description || 'Retrieve data from configured source systems',
      integration: `SAP S/4HANA · BigQuery · API`,
    });
  }

  // Step 2: AI analysis
  steps.push({
    type: 'analyze',
    title: `AI analysis via ${template?.ml_model || 'ML Engine'}`,
    detail: `Confidence threshold: ${cfg?.confidence_threshold || 85}% · Lookback: ${cfg?.lookback_window || '13 weeks'}`,
    integration: `Vertex AI · ${template?.ml_model || 'Custom Model'}`,
  });

  // Step 3: Business rules & decisioning
  steps.push({
    type: 'decide',
    title: 'Apply business rules & thresholds',
    detail: `Severity: ${cfg?.severity || 'medium'} · Frequency: ${cfg?.frequency || 'daily'}`,
    integration: 'Rules Engine · Threshold Config',
  });

  // Step 4: Simulate (if level is simulate or execute)
  if (level === 'simulate' || level === 'execute') {
    steps.push({
      type: 'simulate',
      title: 'Run what-if simulation',
      detail: source
        ? (template?._patternActions?.simulate || 'Simulate impact scenarios')
        : `Model impact of recommended actions across ${modCfg.scopeSections[0]?.label?.toLowerCase() || 'scope'}`,
      integration: 'Simulation Engine · Monte Carlo',
    });
  }

  // Step 5: Approval gate (if ERP approval required or level != execute)
  if (cfg?.erp_approval_required !== false || level !== 'execute') {
    steps.push({
      type: 'approve',
      title: 'Human approval gate',
      detail: level === 'execute'
        ? 'Auto-execute with audit trail (bypass available for authorized users)'
        : 'Review recommendations before execution · Approve, modify, or reject',
      integration: 'Command Tower · Approval Workflow',
    });
  }

  // Step 6: Execute (if level is simulate or execute)
  if (level === 'simulate' || level === 'execute') {
    const enabledActions = cfg?.automated_actions
      ? Object.entries(cfg.automated_actions).filter(([, v]) => v).map(([k]) => k)
      : [];
    const actionLabels = enabledActions.length > 0
      ? enabledActions.map(k => {
          const a = modCfg.actions.find(a => a.key === k);
          return a?.label || k;
        }).join(', ')
      : (source ? (template?._patternActions?.execute || 'Execute ERP action') : 'Execute configured actions');
    steps.push({
      type: 'execute',
      title: `Execute via ${cfg?.erp_system === 'sap_s4hana' ? 'SAP S/4HANA' : 'ERP'}`,
      detail: actionLabels,
      integration: `Command Tower · SAP ${modCfg.erpModules[0]} · API Gateway`,
    });
  }

  // Step 7: Notify
  steps.push({
    type: 'notify',
    title: 'Alert & escalation',
    detail: `${(cfg?.escalation_rules || []).filter(r => r.enabled).length} escalation tiers active`,
    integration: 'Email · Slack · SMS · In-app',
  });

  // Step 8: Learn
  steps.push({
    type: 'learn',
    title: 'Continuous learning',
    detail: 'Incorporate feedback to improve accuracy · Track precision & recall over time',
    integration: 'Feedback Loop · Model Registry',
  });

  return steps;
};

const AgentCreationWizard = ({ onClose, onSave, userId = 'demo_user', darkMode = false }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const colors = getColors(darkMode);

  // Step 1 state
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [naturalLanguage, setNaturalLanguage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [apiTemplates, setApiTemplates] = useState([]);
  const [templateSearch, setTemplateSearch] = useState('');
  const [showAllTemplates, setShowAllTemplates] = useState(false);

  // Step 2 state — collapsible sections
  const [expandedSections, setExpandedSections] = useState({ basic: true });

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Step 2 state — full configuration
  const [config, setConfig] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    severity: 'medium',
    enabled: true,
    alertCondition: '',
    automation_level: 'recommend',
    automated_actions: {
      auto_po: false, safety_stock: false, dc_transfer: false,
      mrp_tuning: false, forecast_override: false, supplier_escalation: false,
    },
    scope_primary: [],
    scope_secondary: [],
    scope_tertiary: [],
    erp_system: 'sap_s4hana',
    writeback_mode: 'read_only',
    erp_target_module: 'MM',
    erp_approval_required: true,
    command_tower_sync: true,
    confidence_threshold: 85,
    analysis_depth: 'standard',
    ml_model: '',
    lookback_window: '13_weeks',
    forecast_horizon: '4_weeks',
    escalation_rules: [
      { tier: 1, enabled: true, hours: '0-2' },
      { tier: 2, enabled: true, hours: '2-4' },
      { tier: 3, enabled: true, hours: '4-8' },
      { tier: 4, enabled: false, hours: '8+' },
    ],
    notification_config: {
      email: false, sms: false, voice_call: false,
      slack: false, teams: false, ai_agent: false,
    },
  });

  const [agentData, setAgentData] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/v1/pulse/templates');
      if (!response.ok) return;
      const data = await response.json();
      if (data.success && data.templates) setApiTemplates(data.templates);
    } catch (err) {
      // Silently ignore — built-in templates are always available
    }
  };

  // Merge all templates: built-in + proactive patterns + API
  const allTemplates = [...BUILT_IN_TEMPLATES, ...PATTERN_TEMPLATES, ...apiTemplates.filter(t => !BUILT_IN_TEMPLATES.some(b => b.name === t.name))];

  // Filter by category + search
  const getFilteredTemplates = () => {
    let templates = selectedCategory === 'all'
      ? allTemplates
      : allTemplates.filter(t => t.category === selectedCategory);

    if (templateSearch.trim()) {
      const q = templateSearch.toLowerCase();
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return templates;
  };

  const filteredTemplates = getFilteredTemplates();

  // Featured templates: first 2 from each of the top 4 categories
  const getFeaturedTemplates = () => {
    const featured = [];
    for (const catId of FEATURED_CATEGORIES) {
      const catTemplates = allTemplates.filter(t => t.category === catId);
      featured.push(...catTemplates.slice(0, 2));
    }
    return featured;
  };

  const getCategoryInfo = (categoryId) => categories.find(c => c.id === categoryId) || categories[0];

  const getModuleConfig = () => {
    const cat = selectedTemplate?.category || 'stox';
    return MODULE_CONFIG[cat] || DEFAULT_MODULE_CONFIG;
  };

  const selectTemplate = (template) => {
    setSelectedTemplate(template);
    setNaturalLanguage('');
    const modCfg = MODULE_CONFIG[template.category] || DEFAULT_MODULE_CONFIG;
    const scopeDefaults = {};
    modCfg.scopeSections.forEach(s => {
      scopeDefaults[s.field] = s.items.slice(0, Math.min(3, s.items.length));
    });
    const actionDefaults = {};
    modCfg.actions.forEach((a, i) => { actionDefaults[a.key] = i < 2; });
    setConfig(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      frequency: template.default_frequency || 'daily',
      severity: template.default_severity || 'medium',
      automation_level: template.automation_level || 'recommend',
      ml_model: template.ml_model || '',
      erp_target_module: modCfg.erpModules[0] || 'MM',
      automated_actions: actionDefaults,
      ...scopeDefaults,
    }));
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!naturalLanguage && !selectedTemplate) {
        setError('Please select a template or describe what you want the agent to do');
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const query = selectedTemplate?.natural_language_template || naturalLanguage;
        const response = await fetch('/api/v1/pulse/monitors/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            natural_language: query,
            name: selectedTemplate?.name || null,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAgentData(data.data);
            if (!selectedTemplate) {
              setConfig(prev => ({
                ...prev,
                name: data.data.name || 'Custom Agent',
                frequency: data.data.suggested_frequency || prev.frequency,
                severity: data.data.suggested_severity || prev.severity,
                alertCondition: data.data.suggested_conditions?.condition || '',
              }));
            }
            setActiveStep(1);
            return;
          }
        }
        setAgentData({
          natural_language_query: selectedTemplate?.natural_language_template || naturalLanguage,
          execution_steps: buildExecutionPlan(selectedTemplate, config),
        });
        if (!selectedTemplate) {
          setConfig(prev => ({ ...prev, name: naturalLanguage.slice(0, 50) || 'Custom Agent' }));
        }
        setActiveStep(1);
      } catch (err) {
        setAgentData({
          natural_language_query: selectedTemplate?.natural_language_template || naturalLanguage,
          execution_steps: buildExecutionPlan(selectedTemplate, config),
        });
        if (!selectedTemplate) {
          setConfig(prev => ({ ...prev, name: naturalLanguage.slice(0, 50) || 'Custom Agent' }));
        }
        setActiveStep(1);
      } finally {
        setLoading(false);
      }
    } else if (activeStep === 1) {
      if (!config.name) { setError('Please enter an agent name'); return; }
      setActiveStep(2);
    } else if (activeStep === 2) {
      await handleSave();
    }
  };

  const handleBack = () => { setActiveStep(prev => prev - 1); setError(null); };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/pulse/monitors/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          ...config,
          natural_language_query: agentData?.natural_language_query,
          execution_steps: agentData?.execution_steps,
          data_source: agentData?.data_source,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          if (onSave) onSave(data.monitor_id);
          if (onClose) onClose();
          return;
        }
      }
      if (onSave) onSave('demo-agent-' + Date.now());
      if (onClose) onClose();
    } catch (err) {
      if (onSave) onSave('demo-agent-' + Date.now());
      if (onClose) onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleChipToggle = (field, value) => {
    const current = config[field];
    const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    setConfig({ ...config, [field]: updated });
  };

  const handleSelectAll = (field, items) => {
    setConfig({ ...config, [field]: [...items] });
  };

  const handleClearAll = (field) => {
    setConfig({ ...config, [field]: [] });
  };

  const handleActionToggle = (key) => {
    setConfig({ ...config, automated_actions: { ...config.automated_actions, [key]: !config.automated_actions[key] } });
  };

  const handleEscalationToggle = (idx) => {
    const updated = [...config.escalation_rules];
    updated[idx] = { ...updated[idx], enabled: !updated[idx].enabled };
    setConfig({ ...config, escalation_rules: updated });
  };

  // Shared styles
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: darkMode ? colors.paper : undefined, color: colors.text,
      '& fieldset': { borderColor: colors.border }, '&:hover fieldset': { borderColor: colors.primary },
    },
    '& .MuiInputLabel-root': { color: colors.textSecondary },
    '& .MuiInputBase-input': { color: colors.text },
    '& .MuiSelect-icon': { color: colors.textSecondary },
  };
  const menuProps = {
    PaperProps: { sx: {
      bgcolor: darkMode ? colors.cardBg : undefined, border: darkMode ? `1px solid ${colors.border}` : undefined,
      '& .MuiMenuItem-root': { color: colors.text, '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : undefined } },
    }},
  };
  const automationColors = { recommend: colors.primary, simulate: colors.warning, execute: colors.success };

  // ──────────── STEP 1: Select Agent ────────────
  const renderStep1 = () => {
    const showFeatured = selectedCategory === 'all' && !templateSearch.trim() && !showAllTemplates;
    const displayTemplates = showFeatured ? getFeaturedTemplates() : filteredTemplates;

    return (
      <Box>
        {/* Hero NL Input */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            mb: 3,
            bgcolor: alpha(colors.primary, darkMode ? 0.06 : 0.02),
            boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.06)',
            border: `1px solid ${alpha(colors.primary, 0.1)}`,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: colors.text, mb: 1 }}>
            Describe what you want the agent to do
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Example: Alert me when any DC's inventory drops below 3 days of supply for top-selling SKUs..."
            value={naturalLanguage}
            onChange={(e) => { setNaturalLanguage(e.target.value); setSelectedTemplate(null); }}
            sx={{
              ...inputSx,
              '& .MuiOutlinedInput-root': {
                ...inputSx['& .MuiOutlinedInput-root'],
                bgcolor: colors.paper,
                '&.Mui-focused fieldset': { borderColor: colors.primary, borderWidth: 2 },
              },
            }}
          />
          <Box sx={{ display: 'flex', gap: 0.5, mt: 1.5, flexWrap: 'wrap' }}>
            {[
              'Show inventory levels below safety stock',
              'Track gross margin by region monthly',
              'Monitor late deliveries over 3 days',
              'Detect stalled sales orders in pipeline',
              'Alert when surgical kit readiness drops',
              'Flag master data quality issues',
            ].map(suggestion => (
              <Chip
                key={suggestion}
                label={suggestion}
                size="small"
                variant="outlined"
                onClick={() => { setNaturalLanguage(suggestion); setSelectedTemplate(null); }}
                sx={{ cursor: 'pointer', fontSize: '0.68rem', height: 24, borderColor: colors.border, color: colors.textSecondary, '&:hover': { bgcolor: alpha(colors.primary, 0.08), borderColor: colors.primary } }}
              />
            ))}
          </Box>
        </Paper>

        <Divider sx={{ my: 2.5, borderColor: colors.border }}>
          <Typography variant="caption" sx={{ color: colors.textSecondary, px: 2 }}>OR CHOOSE A TEMPLATE</Typography>
        </Divider>

        {/* Category Tabs */}
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
          {categories.map((cat) => {
            const IconComp = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <Chip
                key={cat.id}
                icon={<IconComp sx={{ fontSize: 16, color: isSelected ? 'white' : cat.color + ' !important' }} />}
                label={cat.label}
                size="small"
                onClick={() => { setSelectedCategory(cat.id); setShowAllTemplates(false); }}
                sx={{
                  height: 28,
                  fontSize: '0.7rem',
                  bgcolor: isSelected ? cat.color : 'transparent',
                  color: isSelected ? 'white' : colors.text,
                  border: `1px solid ${isSelected ? cat.color : colors.border}`,
                  fontWeight: isSelected ? 600 : 400,
                  '&:hover': { bgcolor: isSelected ? cat.color : alpha(cat.color, 0.1) },
                }}
              />
            );
          })}
        </Box>

        {/* Template search bar */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search templates by name or description..."
          value={templateSearch}
          onChange={(e) => setTemplateSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: colors.textSecondary }} />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              fontSize: '0.8rem',
              height: 36,
              bgcolor: darkMode ? alpha('#fff', 0.04) : alpha('#000', 0.02),
              '& fieldset': { borderColor: colors.border },
              '&:hover fieldset': { borderColor: colors.primary },
            },
          }}
        />

        {/* Template count header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ color: colors.text }}>
            {showFeatured ? 'Featured Templates' : selectedCategory === 'all' ? 'All Agent Templates' : `${getCategoryInfo(selectedCategory).label} Templates`}
            <Chip label={showFeatured ? displayTemplates.length : filteredTemplates.length} size="small" sx={{ ml: 1, height: 18, fontSize: '0.6rem', bgcolor: alpha(colors.primary, 0.1), color: colors.primary }} />
          </Typography>
          {showFeatured && (
            <Button
              size="small"
              onClick={() => setShowAllTemplates(true)}
              sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 600, color: colors.primary }}
            >
              Show all {allTemplates.length} templates
            </Button>
          )}
          {!showFeatured && selectedCategory === 'all' && !templateSearch.trim() && (
            <Button
              size="small"
              onClick={() => setShowAllTemplates(false)}
              sx={{ textTransform: 'none', fontSize: '0.72rem', fontWeight: 600, color: colors.primary }}
            >
              Show featured only
            </Button>
          )}
        </Box>

        {/* Template Grid — 4-col */}
        <Grid container spacing={1}>
          {displayTemplates.map((template) => {
            const catInfo = getCategoryInfo(template.category);
            const isSelected = selectedTemplate?.id === template.id;
            const TplIcon = template.icon || catInfo.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={template.id}>
                <Tooltip
                  title={
                    <Box>
                      {template.capabilities?.map((cap, i) => (
                        <Typography key={i} variant="caption" sx={{ display: 'block', fontSize: '0.65rem' }}>{cap}</Typography>
                      ))}
                    </Box>
                  }
                  arrow
                  placement="top"
                >
                  <Paper
                    elevation={0}
                    sx={wizardCardSx(catInfo.color, isSelected, darkMode, colors)}
                    onClick={() => selectTemplate(template)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.75 }}>
                      <Box sx={{
                        width: 30, height: 30, borderRadius: 1, flexShrink: 0,
                        bgcolor: alpha(catInfo.color, 0.12),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <TplIcon sx={{ fontSize: 16, color: catInfo.color }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" fontWeight={700} sx={{ color: colors.text, lineHeight: 1.3, display: 'block', fontSize: '0.72rem' }}>
                          {template.name}
                        </Typography>
                        <Chip
                          label={catInfo.label}
                          size="small"
                          sx={{ height: 16, fontSize: '0.55rem', mt: 0.25, bgcolor: alpha(catInfo.color, 0.1), color: catInfo.color }}
                        />
                      </Box>
                      {isSelected && <CheckCircleIcon sx={{ fontSize: 16, color: catInfo.color, flexShrink: 0 }} />}
                    </Box>

                    {/* Business value + freq/severity */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {template.business_value && (
                        <Typography variant="caption" fontWeight={600} sx={{ color: colors.success, fontSize: '0.6rem' }}>
                          {template.business_value}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 0.3 }}>
                        <Chip label={template.default_frequency} size="small"
                          sx={{ height: 16, fontSize: '0.55rem', bgcolor: alpha(colors.primary, 0.1), color: colors.primary }}
                        />
                        <Chip label={template.default_severity} size="small"
                          sx={{
                            height: 16, fontSize: '0.55rem',
                            bgcolor: alpha(template.default_severity === 'critical' ? colors.error : template.default_severity === 'high' ? colors.warning : colors.primary, 0.1),
                            color: template.default_severity === 'critical' ? colors.error : template.default_severity === 'high' ? colors.warning : colors.primary,
                          }}
                        />
                      </Box>
                    </Box>
                  </Paper>
                </Tooltip>
              </Grid>
            );
          })}
        </Grid>

        {/* Selected template preview */}
        {selectedTemplate && (
          <Paper
            elevation={0}
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(getCategoryInfo(selectedTemplate.category).color, darkMode ? 0.08 : 0.03),
              boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CheckCircleIcon sx={{ fontSize: 18, color: getCategoryInfo(selectedTemplate.category).color }} />
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: colors.text }}>
                {selectedTemplate.name}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mb: 1, lineHeight: 1.5 }}>
              {selectedTemplate.description}
            </Typography>
            {selectedTemplate.capabilities && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {selectedTemplate.capabilities.map((cap, i) => (
                  <Chip key={i} label={cap} size="small"
                    sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(colors.primary, 0.08), color: colors.primary }}
                  />
                ))}
              </Box>
            )}
            {selectedTemplate.natural_language_template && (
              <Typography variant="caption" sx={{ color: colors.text, fontStyle: 'italic', fontSize: '0.7rem' }}>
                "{selectedTemplate.natural_language_template}"
              </Typography>
            )}
          </Paper>
        )}
      </Box>
    );
  };

  // ──────────── STEP 2: Configure ────────────
  const renderStep2 = () => {
    const modCfg = getModuleConfig();

    // Section header renderer
    const SectionHeader = ({ sectionKey, icon: Icon, label, children }) => (
      <>
        <Paper
          elevation={0}
          sx={wizardSectionSx(darkMode, colors)}
          onClick={() => toggleSection(sectionKey)}
        >
          <Icon sx={{ fontSize: 20, color: colors.primary }} />
          <Typography variant="subtitle2" fontWeight={600} sx={{ flex: 1, color: colors.text }}>
            {label}
          </Typography>
          {!expandedSections[sectionKey] && children}
          <ExpandMoreIcon sx={{
            fontSize: 20, color: colors.textSecondary,
            transform: expandedSections[sectionKey] ? 'rotate(180deg)' : 'none',
            transition: '0.2s',
          }} />
        </Paper>
      </>
    );

    return (
      <Box>
        {/* Section A: Basic Settings */}
        <SectionHeader sectionKey="basic" icon={SpeedIcon} label="Basic Settings">
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Chip label={config.name || 'Unnamed'} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(colors.primary, 0.1), color: colors.primary }} />
            <Chip label={config.frequency} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(colors.primary, 0.08), color: colors.primary }} />
            <Chip label={config.severity} size="small" sx={{ height: 20, fontSize: '0.65rem',
              bgcolor: alpha(config.severity === 'critical' ? colors.error : config.severity === 'high' ? colors.warning : colors.primary, 0.1),
              color: config.severity === 'critical' ? colors.error : config.severity === 'high' ? colors.warning : colors.primary,
            }} />
          </Box>
        </SectionHeader>
        <Collapse in={expandedSections.basic}>
          <Box sx={{ mb: 3, px: 0.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Agent Name" value={config.name} onChange={(e) => setConfig({ ...config, name: e.target.value })} required sx={inputSx} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Description" value={config.description} onChange={(e) => setConfig({ ...config, description: e.target.value })} sx={inputSx} />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth size="small" sx={inputSx}>
                  <InputLabel>Frequency</InputLabel>
                  <Select value={config.frequency} label="Frequency" onChange={(e) => setConfig({ ...config, frequency: e.target.value })} MenuProps={menuProps}>
                    <MenuItem value="real-time">Real-time</MenuItem>
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth size="small" sx={inputSx}>
                  <InputLabel>Severity</InputLabel>
                  <Select value={config.severity} label="Severity" onChange={(e) => setConfig({ ...config, severity: e.target.value })} MenuProps={menuProps}>
                    <MenuItem value="critical">Critical</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth size="small" sx={inputSx}>
                  <InputLabel>Status</InputLabel>
                  <Select value={config.enabled} label="Status" onChange={(e) => setConfig({ ...config, enabled: e.target.value })} MenuProps={menuProps}>
                    <MenuItem value={true}>Enabled</MenuItem>
                    <MenuItem value={false}>Disabled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        {/* Section B: Automated Actions */}
        <SectionHeader sectionKey="actions" icon={BoltIcon} label="Automated Actions">
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Chip label={config.automation_level} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(automationColors[config.automation_level], 0.12), color: automationColors[config.automation_level] }} />
            <Chip label={`${Object.values(config.automated_actions).filter(Boolean).length} actions`} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(colors.primary, 0.08), color: colors.primary }} />
          </Box>
        </SectionHeader>
        <Collapse in={expandedSections.actions}>
          <Box sx={{ mb: 3, px: 0.5 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>Automation Level</Typography>
              <ToggleButtonGroup
                value={config.automation_level} exclusive size="small"
                onChange={(e, val) => val && setConfig({ ...config, automation_level: val })}
                sx={{ '& .MuiToggleButton-root': { color: colors.textSecondary, borderColor: colors.border, textTransform: 'none', px: 2.5, '&.Mui-selected': { bgcolor: alpha(automationColors[config.automation_level], 0.15), color: automationColors[config.automation_level], borderColor: automationColors[config.automation_level], fontWeight: 600 } } }}
              >
                <ToggleButton value="recommend"><PsychologyIcon sx={{ fontSize: 16, mr: 0.5 }} /> Recommend</ToggleButton>
                <ToggleButton value="simulate"><TimelineIcon sx={{ fontSize: 16, mr: 0.5 }} /> Simulate</ToggleButton>
                <ToggleButton value="execute"><CheckCircleIcon sx={{ fontSize: 16, mr: 0.5 }} /> Execute</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Grid container spacing={1}>
              {modCfg.actions.map(({ key, label, desc, icon: Icon }) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Paper
                    elevation={0}
                    sx={{
                      ...wizardCardSx(
                        config.automated_actions[key] ? colors.primary : colors.border,
                        config.automated_actions[key],
                        darkMode,
                        colors
                      ),
                      border: `1px solid ${config.automated_actions[key] ? alpha(colors.primary, 0.2) : colors.border}`,
                    }}
                    onClick={() => handleActionToggle(key)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon sx={{ fontSize: 18, color: config.automated_actions[key] ? colors.primary : colors.textSecondary }} />
                        <Box>
                          <Typography variant="caption" fontWeight={600} sx={{ color: colors.text }}>{label}</Typography>
                          <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', lineHeight: 1.2, fontSize: '0.65rem' }}>{desc}</Typography>
                        </Box>
                      </Box>
                      <Switch size="small" checked={config.automated_actions[key]} onChange={() => handleActionToggle(key)} onClick={(e) => e.stopPropagation()}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: colors.primary }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.primary } }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Collapse>

        {/* Section C: Monitoring Scope */}
        <SectionHeader sectionKey="scope" icon={WarehouseIcon} label={modCfg.scopeLabel || 'Monitoring Scope'}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {modCfg.scopeSections.map(s => (
              <Chip key={s.field} label={`${config[s.field]?.length || 0} ${s.label.toLowerCase()}`} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(s.color, 0.1), color: s.color }} />
            ))}
          </Box>
        </SectionHeader>
        <Collapse in={expandedSections.scope}>
          <Box sx={{ mb: 3, px: 0.5 }}>
            {modCfg.scopeSections.map(({ label, field, items, color }) => (
              <Box key={field} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>{label}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Button size="small" onClick={() => handleSelectAll(field, items)} sx={{ minWidth: 0, textTransform: 'none', fontSize: '0.65rem', color: colors.primary, p: 0 }}>All</Button>
                    <Button size="small" onClick={() => handleClearAll(field)} sx={{ minWidth: 0, textTransform: 'none', fontSize: '0.65rem', color: colors.textSecondary, p: 0 }}>Clear</Button>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {items.map(item => (
                    <Chip key={item} label={item} size="small"
                      onClick={() => handleChipToggle(field, item)}
                      variant={config[field].includes(item) ? 'filled' : 'outlined'}
                      sx={{
                        fontWeight: 500, fontSize: '0.7rem', height: 26, borderRadius: '8px',
                        ...(config[field].includes(item) ? {
                          bgcolor: color,
                          color: '#fff',
                          border: `1px solid ${color}`,
                          '&:hover': { bgcolor: alpha(color, 0.85) },
                        } : {
                          bgcolor: darkMode ? alpha(colors.textSecondary, 0.08) : '#f1f5f9',
                          color: colors.textSecondary,
                          border: `1px solid ${darkMode ? alpha(colors.textSecondary, 0.15) : '#e2e8f0'}`,
                          '&:hover': { bgcolor: alpha(color, 0.1), borderColor: alpha(color, 0.3), color: color },
                        }),
                      }}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Collapse>

        {/* Section D: ERP Integration */}
        <SectionHeader sectionKey="erp" icon={StorageIcon} label="ERP Integration">
          <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>
            {config.erp_system === 'sap_s4hana' ? 'SAP S/4HANA' : config.erp_system} &middot; {config.erp_target_module} &middot; {config.writeback_mode === 'bidirectional' ? 'Bidirectional' : 'Read-only'}
          </Typography>
        </SectionHeader>
        <Collapse in={expandedSections.erp}>
          <Box sx={{ mb: 3, px: 0.5 }}>
            <Grid container spacing={1.5}>
              <Grid item xs={12}>
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
              <Grid item xs={6}>
                <FormControl fullWidth size="small" sx={inputSx}>
                  <InputLabel>Target Module</InputLabel>
                  <Select value={config.erp_target_module} label="Target Module" onChange={(e) => setConfig({ ...config, erp_target_module: e.target.value })} MenuProps={menuProps}>
                    {modCfg.erpModules.map(m => {
                      const labels = { MM: 'Materials Mgmt', PP: 'Production', SD: 'Sales & Dist', CO: 'Controlling', WM: 'Warehouse', FI: 'Finance', PM: 'Plant Maintenance', BC: 'Basis/Cross-App', EC: 'Enterprise Ctrl', ALL: 'All Modules' };
                      return <MenuItem key={m} value={m}>{m} - {labels[m] || m}</MenuItem>;
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small" sx={inputSx}>
                  <InputLabel>Writeback</InputLabel>
                  <Select value={config.writeback_mode} label="Writeback" onChange={(e) => setConfig({ ...config, writeback_mode: e.target.value })} MenuProps={menuProps}>
                    <MenuItem value="read_only">Read-Only</MenuItem>
                    <MenuItem value="bidirectional">Bidirectional</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <FormControlLabel
                    control={<Switch size="small" checked={config.erp_approval_required} onChange={(e) => setConfig({ ...config, erp_approval_required: e.target.checked })}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: colors.warning }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.warning } }} />}
                    label={<Typography variant="caption" sx={{ color: colors.text }}>Require approval before ERP writes</Typography>}
                  />
                  <FormControlLabel
                    control={<Switch size="small" checked={config.command_tower_sync} onChange={(e) => setConfig({ ...config, command_tower_sync: e.target.checked })}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: colors.success }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: colors.success } }} />}
                    label={<Typography variant="caption" sx={{ color: colors.text }}>Sync to Command Tower</Typography>}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Collapse>

        {/* Section E: AI Analysis */}
        <SectionHeader sectionKey="ai" icon={PsychologyIcon} label="AI Analysis">
          <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>
            {config.confidence_threshold}% confidence &middot; {config.analysis_depth} &middot; {config.lookback_window.replace('_', ' ')}
          </Typography>
        </SectionHeader>
        <Collapse in={expandedSections.ai}>
          <Box sx={{ mb: 3, px: 0.5 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" fontWeight={600} sx={{ color: colors.text }}>
                Confidence Threshold: {config.confidence_threshold}%
              </Typography>
              <Slider value={config.confidence_threshold} onChange={(e, val) => setConfig({ ...config, confidence_threshold: val })}
                min={50} max={99} step={1} valueLabelDisplay="auto" valueLabelFormat={(v) => `${v}%`}
                sx={{ color: config.confidence_threshold >= 90 ? colors.success : colors.primary, '& .MuiSlider-thumb': { width: 14, height: 14 } }}
              />
            </Box>
            <Grid container spacing={1.5}>
              <Grid item xs={12}>
                <FormControl fullWidth size="small" sx={inputSx}>
                  <InputLabel>Analysis Depth</InputLabel>
                  <Select value={config.analysis_depth} label="Analysis Depth" onChange={(e) => setConfig({ ...config, analysis_depth: e.target.value })} MenuProps={menuProps}>
                    <MenuItem value="quick">Quick Scan</MenuItem>
                    <MenuItem value="standard">Standard</MenuItem>
                    <MenuItem value="deep">Deep Analysis</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small" sx={inputSx}>
                  <InputLabel>Lookback</InputLabel>
                  <Select value={config.lookback_window} label="Lookback" onChange={(e) => setConfig({ ...config, lookback_window: e.target.value })} MenuProps={menuProps}>
                    <MenuItem value="4_weeks">4 Weeks</MenuItem>
                    <MenuItem value="8_weeks">8 Weeks</MenuItem>
                    <MenuItem value="13_weeks">13 Weeks</MenuItem>
                    <MenuItem value="26_weeks">26 Weeks</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small" sx={inputSx}>
                  <InputLabel>Forecast</InputLabel>
                  <Select value={config.forecast_horizon} label="Forecast" onChange={(e) => setConfig({ ...config, forecast_horizon: e.target.value })} MenuProps={menuProps}>
                    <MenuItem value="1_week">1 Week</MenuItem>
                    <MenuItem value="4_weeks">4 Weeks</MenuItem>
                    <MenuItem value="8_weeks">8 Weeks</MenuItem>
                    <MenuItem value="13_weeks">13 Weeks</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            {config.ml_model && (
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>ML Model</Typography>
                <Chip label={config.ml_model} size="small" sx={{ display: 'flex', width: 'fit-content', mt: 0.3, bgcolor: alpha('#8b5cf6', 0.1), color: '#8b5cf6', fontWeight: 600 }} />
              </Box>
            )}
          </Box>
        </Collapse>

        {/* Section F: Escalation Rules */}
        <SectionHeader sectionKey="escalation" icon={AccountTreeIcon} label="Escalation Rules">
          <Chip label={`${config.escalation_rules.filter(r => r.enabled).length} tiers active`} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(colors.primary, 0.1), color: colors.primary }} />
        </SectionHeader>
        <Collapse in={expandedSections.escalation}>
          <Box sx={{ mb: 3, px: 0.5 }}>
            <Grid container spacing={1}>
              {ESCALATION_TIERS.map((tier, idx) => {
                const rule = config.escalation_rules[idx];
                const TierIcon = tier.icon;
                const tierColors = [colors.primary, '#f59e0b', '#f97316', colors.error];
                return (
                  <Grid item xs={12} sm={6} md={3} key={tier.tier}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: `1px solid ${rule.enabled ? alpha(tierColors[idx], 0.25) : colors.border}`,
                        bgcolor: rule.enabled ? alpha(tierColors[idx], darkMode ? 0.08 : 0.02) : colors.cardBg,
                        boxShadow: darkMode ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
                        opacity: rule.enabled ? 1 : 0.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TierIcon sx={{ fontSize: 16, color: tierColors[idx] }} />
                          <Typography variant="caption" fontWeight={700} sx={{ color: colors.text }}>{tier.label}</Typography>
                          <Chip label={tier.hours + 'h'} size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: alpha(tierColors[idx], 0.15), color: tierColors[idx] }} />
                        </Box>
                        <Switch size="small" checked={rule.enabled} onChange={() => handleEscalationToggle(idx)}
                          sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: tierColors[idx] }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: tierColors[idx] } }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>{tier.action}</Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Collapse>
      </Box>
    );
  };

  // ──────────── STEP 3: Review & Deploy ────────────
  const renderStep3 = () => {
    const catInfo = selectedTemplate ? getCategoryInfo(selectedTemplate.category) : getCategoryInfo('all');
    const modCfg = getModuleConfig();
    const enabledActions = modCfg.actions.filter(a => config.automated_actions[a.key]);
    const enabledEscalations = config.escalation_rules.filter(r => r.enabled);

    return (
      <Box>
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: colors.text }}>
          Review & Deploy Agent
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 3 }}>
          Review your agent configuration before deploying.
        </Typography>

        <Grid container spacing={2}>
          {/* Agent Summary Card */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                bgcolor: alpha(catInfo.color, darkMode ? 0.1 : 0.03),
                boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: alpha(catInfo.color, 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RocketLaunchIcon sx={{ fontSize: 24, color: catInfo.color }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: colors.text }}>{config.name}</Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>{config.description}</Typography>
                </Box>
              </Box>
              <Grid container spacing={2}>
                {[
                  { label: 'Frequency', value: config.frequency, color: colors.primary },
                  { label: 'Severity', value: config.severity, color: config.severity === 'critical' ? colors.error : config.severity === 'high' ? colors.warning : colors.primary },
                  { label: 'Automation', value: config.automation_level, color: automationColors[config.automation_level] },
                  { label: 'ERP', value: config.erp_system === 'sap_s4hana' ? 'SAP S/4HANA' : config.erp_system, color: colors.primary },
                  { label: 'Confidence', value: `${config.confidence_threshold}%`, color: colors.success },
                  { label: 'Analysis', value: config.analysis_depth, color: colors.primary },
                ].map(item => (
                  <Grid item xs={4} sm={2} key={item.label}>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>{item.label}</Typography>
                    <Chip label={item.value} size="small" sx={{ display: 'flex', width: 'fit-content', mt: 0.3, bgcolor: alpha(item.color, 0.12), color: item.color, fontWeight: 600, fontSize: '0.65rem', height: 20 }} />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Monitoring Scope Summary */}
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: colors.cardBg,
                boxShadow: darkMode ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
                height: '100%',
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: colors.primary, mb: 1.5 }}>
                <WarehouseIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                {modCfg.scopeLabel || 'Monitoring Scope'}
              </Typography>
              {modCfg.scopeSections.map(s => ({ label: s.label, items: config[s.field] || [], color: s.color })).map(({ label, items, color }) => (
                <Box key={label} sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>{label}: </Typography>
                  {items.length > 0 ? (
                    <Box sx={{ display: 'inline-flex', flexWrap: 'wrap', gap: 0.3 }}>
                      {items.map(i => <Chip key={i} label={i} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: alpha(color, 0.1), color }} />)}
                    </Box>
                  ) : (
                    <Typography variant="caption" sx={{ color: colors.textSecondary, fontStyle: 'italic' }}>All</Typography>
                  )}
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Actions & Escalation Summary */}
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: colors.cardBg,
                boxShadow: darkMode ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
                height: '100%',
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: colors.primary, mb: 1.5 }}>
                <BoltIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                Actions & Escalation
              </Typography>
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" fontWeight={600} sx={{ color: colors.text }}>Enabled Actions ({enabledActions.length})</Typography>
                {enabledActions.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3, mt: 0.3 }}>
                    {enabledActions.map(a => <Chip key={a.key} label={a.label} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: alpha(colors.primary, 0.1), color: colors.primary }} />)}
                  </Box>
                ) : (
                  <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>No automated actions enabled</Typography>
                )}
              </Box>
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" fontWeight={600} sx={{ color: colors.text }}>Escalation ({enabledEscalations.length} tiers)</Typography>
                <Box sx={{ display: 'flex', gap: 0.3, mt: 0.3 }}>
                  {config.escalation_rules.map((r, idx) => (
                    <Chip
                      key={idx}
                      label={`T${r.tier}: ${r.hours}h`}
                      size="small"
                      sx={{
                        height: 18, fontSize: '0.6rem',
                        bgcolor: r.enabled ? alpha(colors.primary, 0.1) : 'transparent',
                        color: r.enabled ? colors.primary : colors.textSecondary,
                        borderColor: colors.border,
                        textDecoration: r.enabled ? 'none' : 'line-through',
                      }}
                      variant={r.enabled ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" fontWeight={600} sx={{ color: colors.text }}>ERP Integration</Typography>
                <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                  {config.erp_system === 'sap_s4hana' ? 'SAP S/4HANA' : config.erp_system} &middot; Module {config.erp_target_module} &middot; {config.writeback_mode === 'bidirectional' ? 'Bidirectional' : 'Read-only'}
                  {config.erp_approval_required ? ' · Approval required' : ''}
                  {config.command_tower_sync ? ' · Command Tower sync' : ''}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Agent Execution Plan */}
          {agentData?.natural_language_query && (
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: colors.cardBg,
                  boxShadow: darkMode ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
                }}
              >
                <Typography variant="subtitle2" fontWeight={600} sx={{ color: colors.primary, mb: 0.5 }}>Agent Objective</Typography>
                <Typography variant="body2" sx={{ color: colors.text, mb: 2, fontStyle: 'italic' }}>
                  "{agentData.natural_language_query}"
                </Typography>

                <Typography variant="subtitle2" fontWeight={600} sx={{ color: colors.primary, mb: 1.5 }}>Execution Pipeline</Typography>
                <Box sx={{ position: 'relative' }}>
                  {(agentData.execution_steps || []).map((step, idx) => {
                    const stepMeta = EXECUTION_STEP_TYPES[step.type] || EXECUTION_STEP_TYPES.query;
                    const isLast = idx === (agentData.execution_steps || []).length - 1;
                    const stepColors = {
                      detect: colors.warning,
                      query: colors.primary,
                      analyze: '#8b5cf6',
                      decide: colors.primary,
                      simulate: colors.warning,
                      approve: '#e11d48',
                      execute: colors.success,
                      notify: '#0891b2',
                      learn: '#6366f1',
                    };
                    const sColor = stepColors[step.type] || colors.primary;

                    return (
                      <Box key={idx} sx={{ display: 'flex', gap: 1.5, mb: isLast ? 0 : 0.5 }}>
                        {/* Left: step number + connector line */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 28, flexShrink: 0 }}>
                          <Box sx={{
                            width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: alpha(sColor, 0.15), border: `2px solid ${sColor}`,
                          }}>
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: sColor }}>{idx + 1}</Typography>
                          </Box>
                          {!isLast && (
                            <Box sx={{ width: 2, flex: 1, minHeight: 16, bgcolor: alpha(sColor, 0.2), my: 0.25 }} />
                          )}
                        </Box>
                        {/* Right: step detail */}
                        <Box sx={{ flex: 1, pb: isLast ? 0 : 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                            <Chip
                              label={stepMeta.label}
                              size="small"
                              sx={{
                                height: 18, fontSize: '0.6rem', fontWeight: 700,
                                bgcolor: alpha(sColor, 0.12), color: sColor, border: `1px solid ${alpha(sColor, 0.25)}`,
                              }}
                            />
                            <Typography variant="caption" fontWeight={600} sx={{ color: colors.text, fontSize: '0.72rem' }}>
                              {step.title}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', lineHeight: 1.4, fontSize: '0.65rem', mb: 0.25 }}>
                            {step.detail}
                          </Typography>
                          <Typography variant="caption" sx={{ color: alpha(sColor, 0.7), fontSize: '0.6rem' }}>
                            {step.integration}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>

                {/* Security & guardrails footer */}
                <Box sx={{
                  mt: 2, pt: 1.5, borderTop: `1px solid ${colors.border}`,
                  display: 'flex', flexWrap: 'wrap', gap: 0.5,
                }}>
                  {[
                    { label: 'Audit Trail', color: colors.primary },
                    { label: 'Role-Based Access', color: colors.primary },
                    { label: config.erp_approval_required ? 'Approval Required' : 'Auto-Approved', color: config.erp_approval_required ? '#e11d48' : colors.success },
                    { label: `${config.writeback_mode === 'read_only' ? 'Read-Only' : config.writeback_mode === 'write_with_approval' ? 'Write w/ Approval' : 'Full Write'}`, color: config.writeback_mode === 'read_only' ? colors.primary : colors.warning },
                    { label: 'Encrypted', color: colors.primary },
                  ].map((badge) => (
                    <Chip
                      key={badge.label}
                      label={badge.label}
                      size="small"
                      variant="outlined"
                      sx={{
                        height: 20, fontSize: '0.6rem', fontWeight: 600,
                        borderColor: alpha(badge.color, 0.3), color: badge.color,
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Deploy Info */}
          <Grid item xs={12}>
            <Alert severity="info" icon={<RocketLaunchIcon />} sx={{ bgcolor: darkMode ? alpha(colors.primary, 0.1) : undefined }}>
              This agent runs <strong>{config.frequency}</strong> with <strong>{config.automation_level}</strong> automation
              across <strong>{(agentData?.execution_steps || []).length} pipeline steps</strong>.
              {config.erp_approval_required && ' Human approval required before any system writes.'}
              {' '}All actions are logged with full audit trail. The agent continuously learns from your feedback.
            </Alert>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} alternativeLabel connector={<StepperConnector />} sx={{ mb: 4 }}>
        {steps.map((label, idx) => (
          <Step key={label}>
            <StepLabel StepIconComponent={CustomStepIcon}>
              <Typography variant="caption" fontWeight={idx === activeStep ? 700 : 400} sx={{ color: idx <= activeStep ? colors.text : colors.textSecondary }}>
                {label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>
      )}

      <Box sx={{ minHeight: 400 }}>
        {activeStep === 0 && renderStep1()}
        {activeStep === 1 && renderStep2()}
        {activeStep === 2 && renderStep3()}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 2, borderTop: `1px solid ${colors.border}` }}>
        <Button
          disabled={activeStep === 0 || loading}
          onClick={handleBack}
          variant="text"
          sx={{ color: colors.textSecondary, textTransform: 'none' }}
        >
          Back
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            variant="outlined"
            sx={{ borderColor: colors.border, color: colors.primary, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : activeStep === 2 ? <RocketLaunchIcon /> : null}
            sx={{
              bgcolor: activeStep === 2 ? colors.success : colors.primary,
              '&:hover': { bgcolor: activeStep === 2 ? alpha(colors.success, 0.85) : colors.secondary },
              px: 4,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {loading ? 'Processing...' : activeStep === 2 ? 'Deploy Agent' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AgentCreationWizard;
