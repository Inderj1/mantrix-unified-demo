import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  Stack,
  Chip,
  Avatar,
  alpha,
  useTheme,
  Zoom,
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Store as StoreIcon,
  LocalShipping as LocalShippingIcon,
  Warning as WarningIcon,
  ViewModule as ViewModuleIcon,
  Warehouse as WarehouseIcon,
  AttachMoney as AttachMoneyIcon,
  FindInPage as FindInPageIcon,
  Business as FactoryIcon,
  ShowChart as ShowChartIcon,
  Engineering as EngineeringIcon,
  Assignment as AssignmentIcon,
  ReportProblem as ReportProblemIcon,
  Category as CategoryIcon,
  Assessment as AssessmentIcon,
  Handshake as HandshakeIcon,
  Casino as CasinoIcon,
  Analytics as AnalyticsIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';

// Module definitions with their Fiori sub-tiles
const moduleDefinitions = {
  'demand-flow': {
    title: 'Sell-Through to Sell-In Bridge',
    subtitle: 'Module 0: Demand Flow',
    color: '#06b6d4',
    bgColor: '#cffafe',
    tiles: [
      {
        id: 'sell-through-bridge',
        title: 'Sell-Through to Sell-In Bridge',
        icon: DashboardIcon,
        description: 'Visualize the complete demand flow from consumer POS to shipment forecasts across all channels with end-to-end traceability',
        sapTables: 'VBRK/VBRP, VBAK/VBAP, TVTWT, MARA',
        status: 'active',
      },
      {
        id: 'partner-pos-monitor',
        title: 'Partner POS Integration Monitor',
        icon: SearchIcon,
        description: 'Track sell-through data feeds from retail partners (ULTA, SEPHORA), validate data quality, flag anomalies, monitor EDI connectivity',
        sapTables: 'Partner EDI, VBRK/VBRP, KNA1',
        status: 'active',
      },
    ],
  },
  'demand-forecasting': {
    title: 'Multi-Channel Demand Forecasting',
    subtitle: 'Module 1: AI Forecasting',
    color: '#10b981',
    bgColor: '#d1fae5',
    tiles: [
      {
        id: 'forecast-dashboard',
        title: 'Demand Forecast Dashboard',
        icon: DashboardIcon,
        description: 'Real-time forecast accuracy metrics, bias tracking, demand patterns across all channels. Includes AI-learned partner ordering cadence and behavior analysis',
        sapTables: 'VBRK/VBRP, MARA/MARC, KONV, T001W',
        status: 'active',
      },
      {
        id: 'demand-analyzer',
        title: 'Multi-Dimensional Demand Analyzer',
        icon: TrendingUpIcon,
        description: 'Drill-down analysis by product, region, store, channel, or customer with AI-driven insights. View store-level, partner-level, or SKU-level demand patterns',
        sapTables: 'VBRK/VBRP, MARA/MARC, T001W, TVTWT',
        status: 'active',
      },
      {
        id: 'forecast-workbench',
        title: 'Forecast Collaboration Workbench',
        icon: SettingsIcon,
        description: 'Override AI forecasts with business intelligence, add promotional events, adjust for market conditions, manage consensus forecasting',
        sapTables: 'KONV (KSCHL), MARC (MMSTA), Custom Forecast',
        status: 'active',
      },
      {
        id: 'demand-alerts',
        title: 'Demand Alerts & Exceptions',
        icon: NotificationsIcon,
        description: 'Anomaly detection, stockout risk warnings, demand spike notifications, forecast accuracy exceptions requiring attention',
        sapTables: 'MARD (LABST), VBRK/VBRP, AI Alerts',
        status: 'active',
      },
    ],
  },
  'outbound-replenishment': {
    title: 'Store Replenishment Cockpit',
    subtitle: 'Module 2: Outbound Planning',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    tiles: [
      {
        id: 'store-replenishment',
        title: 'Store Replenishment Cockpit',
        icon: StoreIcon,
        description: 'Store-by-store replenishment recommendations with priority ranking',
        sapTables: 'MARD (LABST), LIKP/LIPS, MARC, T001W',
        status: 'active',
      },
      {
        id: 'route-optimizer',
        title: 'Delivery Route Optimizer',
        icon: LocalShippingIcon,
        description: 'Optimize truck routes, consolidate shipments, minimize transportation costs',
        sapTables: 'LIKP/LIPS, T001W, Stock Transfers',
        status: 'active',
      },
      {
        id: 'stockout-monitor',
        title: 'Stockout Risk Monitor',
        icon: WarningIcon,
        description: 'Real-time alerts for stores at risk of stockouts, prioritized action list',
        sapTables: 'MARD (LABST), LIKP/LIPS, Forecast',
        status: 'active',
      },
      {
        id: 'channel-allocation',
        title: 'Channel Allocation Manager',
        icon: ViewModuleIcon,
        description: 'Allocate DC inventory across channels based on priority and profitability',
        sapTables: 'MARD, RESB, Forecast by Channel',
        status: 'active',
      },
    ],
  },
  'dc-inventory': {
    title: 'DC Inventory Cockpit',
    subtitle: 'Module 3: DC Optimization',
    color: '#f59e0b',
    bgColor: '#fef3c7',
    tiles: [
      {
        id: 'dc-cockpit',
        title: 'DC Inventory Cockpit',
        icon: WarehouseIcon,
        description: 'Real-time DC inventory visibility, allocation tracking, available-to-promise',
        sapTables: 'MARD, EKKO/EKPO, RESB, Advanced ATP',
        status: 'active',
      },
      {
        id: 'working-capital',
        title: 'Working Capital Dashboard',
        icon: AttachMoneyIcon,
        description: 'Inventory value, turns, DIO metrics, cash flow impact analysis',
        sapTables: 'MBEW, MARD, EKKO/EKPO, VBRK/VBRP',
        status: 'active',
      },
      {
        id: 'excess-obsolete',
        title: 'Excess & Obsolete Manager',
        icon: FindInPageIcon,
        description: 'Identify slow-moving SKUs, liquidation recommendations, markdown strategies',
        sapTables: 'MARD, MBEW, MARC (MMSTA), VBRK/VBRP',
        status: 'active',
      },
    ],
  },
  'supply-planning': {
    title: 'Supply Requirements Dashboard',
    subtitle: 'Module 4: Inbound Planning',
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    tiles: [
      {
        id: 'supply-dashboard',
        title: 'Supply Requirements Dashboard',
        icon: ShowChartIcon,
        description: 'Aggregate demand view, plant supply requirements, MRP exception management',
        sapTables: 'MD04, MARD, EKKO/EKPO, MARC',
        status: 'active',
      },
      {
        id: 'production-optimizer',
        title: 'Production Schedule Optimizer',
        icon: FactoryIcon,
        description: 'Campaign planning, changeover optimization, capacity utilization analysis',
        sapTables: 'AFKO/AFPO, PLAF, CM01, MARC',
        status: 'active',
      },
      {
        id: 'mrp-accelerator',
        title: 'MRP Accelerator',
        icon: ShowChartIcon,
        description: 'Run MRP with AI recommendations, auto-approve planned orders, expedite critical SKUs',
        sapTables: 'MD04, PLAF, EKKO/EKPO, MARC',
        status: 'active',
      },
    ],
  },
  'bom-explosion': {
    title: 'BOM Explosion Analyzer',
    subtitle: 'Module 5: Component Planning',
    color: '#ec4899',
    bgColor: '#fce7f3',
    tiles: [
      {
        id: 'bom-analyzer',
        title: 'BOM Explosion Analyzer',
        icon: EngineeringIcon,
        description: 'Multi-level BOM explosion, component requirements by FG, what-if scenarios',
        sapTables: 'STPO, STKO, MAST, CS15',
        status: 'active',
      },
      {
        id: 'component-tracker',
        title: 'Component Usage Tracker',
        icon: AssignmentIcon,
        description: 'Where-used analysis, common component identification, substitution management',
        sapTables: 'STPO, MAST, MARA, MARC',
        status: 'active',
      },
      {
        id: 'bom-exceptions',
        title: 'BOM Exception Manager',
        icon: ReportProblemIcon,
        description: 'Missing components alerts, phantom BOMs, engineering change orders (ECO)',
        sapTables: 'STPO/STKO, MARD, MARC, ECO',
        status: 'active',
      },
    ],
  },
  'component-consolidation': {
    title: 'Component Consolidation Engine',
    subtitle: 'Module 6: Procurement Optimization',
    color: '#ef4444',
    bgColor: '#fee2e2',
    tiles: [
      {
        id: 'consolidation-engine',
        title: 'Component Consolidation Engine',
        icon: CategoryIcon,
        description: 'Aggregate requirements across FGs, identify consolidation opportunities, volume discount analysis',
        sapTables: 'STPO, EBAN, MARD, EORD, LFA1',
        status: 'active',
      },
      {
        id: 'procurement-dashboard',
        title: 'Procurement Optimization Dashboard',
        icon: AssessmentIcon,
        description: 'Consolidated PO recommendations, cost savings tracking, supplier performance',
        sapTables: 'EKKO/EKPO, EBAN, EORD, ME21N',
        status: 'active',
      },
      {
        id: 'supplier-portal',
        title: 'Supplier Collaboration Portal',
        icon: HandshakeIcon,
        description: 'Share forecasts with suppliers, auto-generate POs, track delivery performance',
        sapTables: 'LFA1, EKKO/EKPO, Forecast Share',
        status: 'active',
      },
    ],
  },
  'analytics-whatif': {
    title: 'Executive KPI Dashboard',
    subtitle: 'Module 7: Analytics & What-If',
    color: '#607D8B',
    bgColor: '#ECEFF1',
    tiles: [
      {
        id: 'scenario-planner',
        title: 'What-If Scenario Planner',
        icon: CasinoIcon,
        description: 'Run multiple demand scenarios, compare inventory strategies, optimize safety stock',
        sapTables: 'VBRK/VBRP, MARD, MARC, Scenarios',
        status: 'active',
      },
      {
        id: 'kpi-dashboard',
        title: 'Executive KPI Dashboard',
        icon: AnalyticsIcon,
        description: 'Real-time supply chain metrics, trend analysis, performance scorecards',
        sapTables: 'VBRK/VBRP, MARD, MBEW, KPIs',
        status: 'active',
      },
      {
        id: 'predictive-analytics',
        title: 'Predictive Analytics',
        icon: TrendingUpIcon,
        description: 'AI-driven insights, anomaly detection, automated recommendations',
        sapTables: 'All Transactional, AI Models',
        status: 'active',
      },
      {
        id: 'working-capital-optimizer',
        title: 'Working Capital Optimizer',
        icon: AccountBalanceIcon,
        description: 'Cash flow forecasting, inventory investment analysis, ROI tracking',
        sapTables: 'MBEW, MARD, EKKO/EKPO, VBRK/VBRP',
        status: 'active',
      },
    ],
  },
};

const ModuleTilesView = ({ moduleId, onBack, onTileClick }) => {
  const theme = useTheme();
  const moduleData = moduleDefinitions[moduleId];

  if (!moduleData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          Module not found: {moduleId}
        </Typography>
        <Button onClick={onBack} startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
          Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, height: '100vh', overflowY: 'auto' }}>
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link
              component="button"
              variant="body1"
              onClick={() => onBack('core')}
              sx={{
                textDecoration: 'none',
                color: 'text.primary',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              CORE.AI
            </Link>
            <Link
              component="button"
              variant="body1"
              onClick={() => onBack('stox')}
              sx={{
                textDecoration: 'none',
                color: 'text.primary',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              STOX.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              {moduleData.title}
            </Typography>
          </Breadcrumbs>

          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => onBack('stox')}
            variant="outlined"
            size="small"
            sx={{ borderColor: 'divider' }}
          >
            Back to STOX.AI
          </Button>
        </Stack>

        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.5px' }}>
            {moduleData.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {moduleData.subtitle}
          </Typography>
        </Box>
      </Box>

      {/* Fiori Tiles Grid */}
      <Grid container spacing={2}>
        {moduleData.tiles.map((tile, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={tile.id}>
            <Zoom in timeout={300 + index * 100}>
              <Card
                sx={{
                  height: '100vh',
                  cursor: tile.status === 'active' ? 'pointer' : 'default',
                  opacity: tile.status === 'coming-soon' ? 0.7 : 1,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  pointerEvents: 'auto',
                  userSelect: 'none',
                  '&:hover': tile.status === 'active'
                    ? {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.shadows[8],
                        borderColor: moduleData.color,
                        '& .tile-header': {
                          background: `linear-gradient(135deg, ${moduleData.color} 0%, ${alpha(
                            moduleData.color,
                            0.8
                          )} 100%)`,
                        },
                        '& .tile-icon': {
                          transform: 'scale(1.1) rotate(5deg)',
                        },
                        '& .arrow-icon': {
                          transform: 'translateX(4px)',
                        },
                      }
                    : {},
                }}
                onClick={() => {
                  console.log('Tile clicked:', tile.id, 'Status:', tile.status, 'Has onTileClick:', !!onTileClick);
                  if (tile.status === 'active' && onTileClick) {
                    console.log('Calling onTileClick with:', tile.id);
                    onTileClick(tile.id);
                  }
                }}
              >
                <Box
                  className="tile-header"
                  sx={{
                    height: 70,
                    background: `linear-gradient(135deg, ${moduleData.bgColor} 0%, ${alpha(
                      moduleData.color,
                      0.1
                    )} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Avatar
                    className="tile-icon"
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: 'white',
                      color: moduleData.color,
                      transition: 'transform 0.3s ease',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  >
                    <tile.icon sx={{ fontSize: 24 }} />
                  </Avatar>
                  {tile.status === 'coming-soon' && (
                    <Chip
                      label="Coming Soon"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>

                <CardContent sx={{ p: 1.5 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: moduleData.color,
                      mb: 0.5,
                      fontSize: '0.875rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {tile.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mb: 1.5,
                      minHeight: 48,
                      lineHeight: 1.4,
                      fontSize: '0.75rem',
                    }}
                  >
                    {tile.description}
                  </Typography>

                  <Box
                    sx={{
                      pt: 1.5,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 600,
                        display: 'block',
                        mb: 0.25,
                        fontSize: '0.65rem',
                      }}
                    >
                      SAP Integration:
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.65rem',
                        display: 'block',
                        fontFamily: 'monospace',
                        lineHeight: 1.3,
                      }}
                    >
                      {tile.sapTables}
                    </Typography>
                  </Box>

                  {tile.status === 'active' && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                      <ArrowForwardIcon
                        className="arrow-icon"
                        sx={{
                          color: moduleData.color,
                          transition: 'transform 0.3s ease',
                          fontSize: '1.2rem',
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* Module Info */}
      <Box sx={{ mt: 3, p: 2, bgcolor: alpha(moduleData.color, 0.05), borderRadius: 2 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ color: moduleData.color, fontWeight: 700, fontSize: '0.9rem' }}>
          About This Module
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.8rem' }}>
          {moduleData.subtitle} provides comprehensive functionality for managing and optimizing supply chain
          operations. All tiles integrate directly with SAP S/4HANA tables and provide real-time visibility into
          your operations.
        </Typography>
      </Box>
    </Box>
  );
};

export default ModuleTilesView;
