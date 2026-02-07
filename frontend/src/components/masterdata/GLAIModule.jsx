import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
  Breadcrumbs,
  Link,
  Avatar,
  Chip,
  alpha,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Drawer,
  Card,
  CardContent,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Dashboard as DashboardIcon,
  CloudUpload as UploadIcon,
  Link as LinkIcon,
  TableChart as TableChartIcon,
  Search as SearchIcon,
  Assessment as ReportsIcon,
  FiberManualRecord as DotIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Description as FileIcon,
  ArrowForward as ArrowForwardIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  AutoFixHigh as AIIcon,
  BarChart as BarChartIcon,
  PendingActions as PendingIcon,
  Cancel as CancelIcon,
  Storage as StorageIcon,
  Hub as HubIcon,
  Hexagon as HexagonIcon,
  Circle as CircleIcon,
  ChangeHistory as ChangeHistoryIcon,
  Square as SquareIcon,
  Sync as SyncIcon,
  Security as SecurityIcon,
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  FilterList as FilterIcon,
  Check as ApproveIcon,
  Edit as EditIcon,
  Close as RejectIcon,
  Settings as SettingsIcon,
  PlayArrow as RunIcon,
  Build as RemediationIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Visibility as ViewEvidenceIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

import { masterDataTheme, MODULE_NAVY, NAVY_DARK, NAVY_BLUE, NAVY_DEEP } from './masterDataTheme';

// Sidebar navigation items with mode-specific labels
const sidebarNavItems = [
  { id: 'dashboard', label: 'Dashboard', governanceLabel: 'Dashboard', Icon: DashboardIcon, badge: null, govBadge: null },
  { id: 'data-ingestion', label: 'Data Ingestion', governanceLabel: 'System Connection', Icon: UploadIcon, badge: null, govBadge: null },
  { id: 'account-matching', label: 'Account Matching', governanceLabel: 'Issue Detection', Icon: LinkIcon, badge: null, govBadge: 47 },
  { id: 'output-table', label: 'Output Table', governanceLabel: 'Remediation', Icon: TableChartIcon, badge: null, govBadge: 12 },
];

const toolsNavItems = [
  { id: 'account-lookup', label: 'Account Lookup', Icon: SearchIcon },
  { id: 'reports', label: 'Reports', Icon: ReportsIcon },
];

// Mock data for dashboard metrics - styled like Inventory Health Check
const dashboardMetrics = [
  { label: 'HEALTHY', value: '2,891', color: NAVY_BLUE },
  { label: 'MODERATE', value: '287', color: '#f59e0b' },
  { label: 'CRITICAL', value: '69', color: '#ef4444' },
  { label: 'UNMAPPED $', value: '$1.2M', color: '#ef4444' },
  { label: 'MAP RATE', value: '89%', color: '#10b981' },
  { label: 'AVG CONF', value: '94%', color: MODULE_NAVY },
];

// Mock data for account matching with field-level recommendations
const mockAccountsWithFields = [
  {
    id: 1,
    sourceAccount: '100000',
    sourceDesc: 'Cash - Operating',
    targetAccount: 'YCOA100000',
    targetDesc: 'Cash and Cash Equivalents',
    mappingConfidence: 98,
    mappingMethod: 'Exact Match',
    status: 'approved',
    fieldsOverridden: 2,
    fieldsTotal: 5,
    fields: [
      { id: '1-1', table: 'SKA1', field: 'XBILK', fieldName: 'Balance Sheet Indicator', ycoaDefault: 'X', aiRecommendation: 'X', confidence: 99, rationale: 'Year-end balance persists; no P&L reset pattern', evidence: ['Year-end balance: $2.4M', 'No annual reset', 'Asset behavior confirmed'], status: 'approved' },
      { id: '1-2', table: 'SKB1', field: 'XOPVW', fieldName: 'Open Item Management', ycoaDefault: '', aiRecommendation: '', confidence: 95, rationale: 'Cash account - no clearing required', evidence: ['No clearing docs', 'Direct postings only', 'No offsetting pattern'], status: 'approved' },
      { id: '1-3', table: 'SKB1', field: 'XKRES', fieldName: 'Line Item Display', ycoaDefault: 'X', aiRecommendation: 'X', confidence: 99, rationale: 'Standard for cash accounts', evidence: ['12,847 postings/year', 'Below 50k threshold', 'No performance risk'], status: 'approved' },
      { id: '1-4', table: 'SKB1', field: 'ZUAWA', fieldName: 'Sort Key', ycoaDefault: '000', aiRecommendation: '000', confidence: 90, rationale: 'No dominant reference field for cash', evidence: ['Mixed references', 'No PO linkage', 'Manual postings: 34%'], status: 'approved' },
      { id: '1-5', table: 'SKA1', field: 'KTOKS', fieldName: 'Account Group', ycoaDefault: 'CASH', aiRecommendation: 'CASH', confidence: 99, rationale: 'Behavior matches cash account cluster', evidence: ['High liquidity', 'Daily movement', 'Bank reconciliation pattern'], status: 'approved' },
    ]
  },
  {
    id: 2,
    sourceAccount: '110000',
    sourceDesc: 'Accounts Receivable',
    targetAccount: 'YCOA110000',
    targetDesc: 'Trade Receivables',
    mappingConfidence: 95,
    mappingMethod: 'Semantic Match',
    status: 'approved',
    fieldsOverridden: 3,
    fieldsTotal: 5,
    fields: [
      { id: '2-1', table: 'SKA1', field: 'XBILK', fieldName: 'Balance Sheet Indicator', ycoaDefault: 'X', aiRecommendation: 'X', confidence: 99, rationale: 'Receivable balance persists across periods', evidence: ['Avg balance: $1.8M', 'No year-end reset', 'Asset classification'], status: 'approved' },
      { id: '2-2', table: 'SKB1', field: 'XOPVW', fieldName: 'Open Item Management', ycoaDefault: '', aiRecommendation: 'X', confidence: 94, rationale: 'Clearing rate 89%, median open age 42 days', evidence: ['Clearing rate: 89%', 'Median open days: 42', 'Clearing docs: 3,847'], status: 'proposed' },
      { id: '2-3', table: 'SKB1', field: 'XKRES', fieldName: 'Line Item Display', ycoaDefault: 'X', aiRecommendation: 'X', confidence: 99, rationale: 'Required when Open Item = X; 28k postings OK', evidence: ['28,472 postings/year', 'Below 50k threshold', 'OIM dependency'], status: 'approved' },
      { id: '2-4', table: 'SKB1', field: 'ZUAWA', fieldName: 'Sort Key', ycoaDefault: '000', aiRecommendation: '018', confidence: 87, rationale: 'Customer + Invoice dominant in 84% of postings', evidence: ['Customer ref: 84%', 'Invoice doc: 12%', 'Other: 4%'], status: 'proposed' },
      { id: '2-5', table: 'SKB1', field: 'XNKON', fieldName: 'Recon Account Indicator', ycoaDefault: '', aiRecommendation: 'X', confidence: 96, rationale: 'Only sub-ledger postings detected; no manual', evidence: ['Manual postings: 0', 'Sub-ledger only', 'FI-AR integration'], status: 'proposed' },
    ]
  },
  {
    id: 3,
    sourceAccount: '120000',
    sourceDesc: 'Inventory - Raw Materials',
    targetAccount: 'YCOA120100',
    targetDesc: 'Raw Materials Inventory',
    mappingConfidence: 87,
    mappingMethod: 'Behavioral Cluster',
    status: 'review',
    fieldsOverridden: 4,
    fieldsTotal: 5,
    fields: [
      { id: '3-1', table: 'SKA1', field: 'XBILK', fieldName: 'Balance Sheet Indicator', ycoaDefault: 'X', aiRecommendation: 'X', confidence: 99, rationale: 'Inventory balance pattern confirmed', evidence: ['Avg balance: $4.2M', 'MM-FI integration', 'Asset behavior'], status: 'approved' },
      { id: '3-2', table: 'SKB1', field: 'XOPVW', fieldName: 'Open Item Management', ycoaDefault: '', aiRecommendation: '', confidence: 92, rationale: 'Inventory accounts do not use open item', evidence: ['No clearing pattern', 'MM movement-based', 'Quantity-driven'], status: 'approved' },
      { id: '3-3', table: 'SKB1', field: 'XKRES', fieldName: 'Line Item Display', ycoaDefault: 'X', aiRecommendation: 'X', confidence: 85, rationale: '67k postings/year - flag for archiving review', evidence: ['67,284 postings/year', 'Above 50k threshold', 'Archiving recommended'], status: 'review' },
      { id: '3-4', table: 'SKB1', field: 'ZUAWA', fieldName: 'Sort Key', ycoaDefault: '000', aiRecommendation: '001', confidence: 91, rationale: 'PO reference dominant in 94% of inventory postings', evidence: ['PO reference: 94%', 'Material doc: 5%', 'Other: 1%'], status: 'proposed' },
      { id: '3-5', table: 'SKA1', field: 'KTOKS', fieldName: 'Account Group', ycoaDefault: 'INVT', aiRecommendation: 'INVT', confidence: 96, rationale: 'MM posting patterns match inventory cluster', evidence: ['GR/GI postings', 'MM integration', 'Qty-based valuation'], status: 'approved' },
    ]
  },
  {
    id: 4,
    sourceAccount: '140000',
    sourceDesc: 'GR/IR Clearing',
    targetAccount: 'YCOA140000',
    targetDesc: 'GR/IR Clearing Account',
    mappingConfidence: 96,
    mappingMethod: 'Exact Match',
    status: 'approved',
    fieldsOverridden: 3,
    fieldsTotal: 5,
    fields: [
      { id: '4-1', table: 'SKA1', field: 'XBILK', fieldName: 'Balance Sheet Indicator', ycoaDefault: 'X', aiRecommendation: 'X', confidence: 99, rationale: 'Clearing account - balance sheet treatment', evidence: ['Transient balance', 'GR/IR pattern', 'BS classification'], status: 'approved' },
      { id: '4-2', table: 'SKB1', field: 'XOPVW', fieldName: 'Open Item Management', ycoaDefault: 'X', aiRecommendation: 'X', confidence: 97, rationale: 'GR/IR requires open item for matching', evidence: ['Clearing rate: 92%', 'Median open days: 18', 'Auto-clearing: 87%'], status: 'approved' },
      { id: '4-3', table: 'SKB1', field: 'XKRES', fieldName: 'Line Item Display', ycoaDefault: 'X', aiRecommendation: 'X', confidence: 99, rationale: 'Required for OIM; line item mandatory', evidence: ['OIM dependency', '45,892 postings/year', 'Below threshold'], status: 'approved' },
      { id: '4-4', table: 'SKB1', field: 'ZUAWA', fieldName: 'Sort Key', ycoaDefault: '001', aiRecommendation: '014', confidence: 93, rationale: 'PO + Material Doc dominant for GR/IR matching', evidence: ['PO + MBLNR: 91%', 'PO only: 7%', 'Other: 2%'], status: 'proposed' },
      { id: '4-5', table: 'SKA1', field: 'KTOKS', fieldName: 'Account Group', ycoaDefault: 'GRIR', aiRecommendation: 'GRIR', confidence: 99, rationale: 'Classic GR/IR clearing behavior', evidence: ['MM-FI bridge', 'Three-way match', 'Auto-clear pattern'], status: 'approved' },
    ]
  },
  {
    id: 5,
    sourceAccount: '200000',
    sourceDesc: 'Accounts Payable',
    targetAccount: 'YCOA200000',
    targetDesc: 'Trade Payables',
    mappingConfidence: 96,
    mappingMethod: 'Semantic Match',
    status: 'approved',
    fieldsOverridden: 2,
    fieldsTotal: 5,
    fields: [
      { id: '5-1', table: 'SKA1', field: 'XBILK', fieldName: 'Balance Sheet Indicator', ycoaDefault: 'X', aiRecommendation: 'X', confidence: 99, rationale: 'Liability account - balance persists', evidence: ['Avg balance: $2.1M', 'Liability pattern', 'No annual reset'], status: 'approved' },
      { id: '5-2', table: 'SKB1', field: 'XOPVW', fieldName: 'Open Item Management', ycoaDefault: '', aiRecommendation: 'X', confidence: 91, rationale: 'Clearing rate 78%, payment clearing pattern detected', evidence: ['Clearing rate: 78%', 'Median open days: 34', 'Payment clearing: 2,847'], status: 'proposed' },
      { id: '5-3', table: 'SKB1', field: 'XKRES', fieldName: 'Line Item Display', ycoaDefault: 'X', aiRecommendation: 'X', confidence: 99, rationale: 'Required for OIM; 31k postings acceptable', evidence: ['31,284 postings/year', 'Below 50k threshold', 'OIM dependency'], status: 'approved' },
      { id: '5-4', table: 'SKB1', field: 'ZUAWA', fieldName: 'Sort Key', ycoaDefault: '000', aiRecommendation: '019', confidence: 88, rationale: 'Vendor + Invoice dominant in 82% of postings', evidence: ['Vendor ref: 82%', 'Invoice doc: 14%', 'Other: 4%'], status: 'proposed' },
      { id: '5-5', table: 'SKB1', field: 'XNKON', fieldName: 'Recon Account Indicator', ycoaDefault: '', aiRecommendation: 'X', confidence: 94, rationale: 'Only sub-ledger postings; manual blocked recommended', evidence: ['Manual postings: 3', 'Sub-ledger: 99.9%', 'FI-AP integration'], status: 'proposed' },
    ]
  },
  {
    id: 6,
    sourceAccount: '510000',
    sourceDesc: 'Cost of Goods Sold',
    targetAccount: 'YCOA510000',
    targetDesc: 'Cost of Sales',
    mappingConfidence: 94,
    mappingMethod: 'Semantic Match',
    status: 'approved',
    fieldsOverridden: 1,
    fieldsTotal: 5,
    fields: [
      { id: '6-1', table: 'SKA1', field: 'XBILK', fieldName: 'Balance Sheet Indicator', ycoaDefault: '', aiRecommendation: '', confidence: 99, rationale: 'P&L account - resets annually', evidence: ['Year-end reset: Yes', 'P&L classification', 'No carry-forward'], status: 'approved' },
      { id: '6-2', table: 'SKB1', field: 'XOPVW', fieldName: 'Open Item Management', ycoaDefault: '', aiRecommendation: '', confidence: 99, rationale: 'P&L accounts do not use open item management', evidence: ['No clearing pattern', 'Expense recognition', 'Period-based'], status: 'approved' },
      { id: '6-3', table: 'SKB1', field: 'XKRES', fieldName: 'Line Item Display', ycoaDefault: 'X', aiRecommendation: 'X', confidence: 92, rationale: '89k postings/year - high volume warning', evidence: ['89,472 postings/year', 'Above 50k threshold', 'Archiving critical'], status: 'review' },
      { id: '6-4', table: 'SKB1', field: 'ZUAWA', fieldName: 'Sort Key', ycoaDefault: '000', aiRecommendation: '001', confidence: 86, rationale: 'PO reference in 71% of COGS postings', evidence: ['PO reference: 71%', 'Cost center: 22%', 'Other: 7%'], status: 'proposed' },
      { id: '6-5', table: 'SKA1', field: 'KTOKS', fieldName: 'Account Group', ycoaDefault: 'COGS', aiRecommendation: 'COGS', confidence: 97, rationale: 'Cost of sales behavior cluster match', evidence: ['MM-CO integration', 'Product costing', 'Variance pattern'], status: 'approved' },
    ]
  },
];

// Legacy format for backward compatibility
const mockMappings = mockAccountsWithFields.map(acc => ({
  id: acc.id,
  sourceAccount: acc.sourceAccount,
  sourceDesc: acc.sourceDesc,
  targetAccount: acc.targetAccount,
  targetDesc: acc.targetDesc,
  confidence: acc.mappingConfidence,
  status: acc.status,
}));

// Field-level export data - one row per account+field (migration-ready format)
const mockFieldLevelExport = mockAccountsWithFields.flatMap(acc =>
  acc.fields.map((field, idx) => ({
    id: `${acc.id}-${idx}`,
    sourceAccount: acc.sourceAccount,
    sourceDesc: acc.sourceDesc,
    targetAccount: acc.targetAccount,
    table: field.table,
    field: field.field,
    fieldName: field.fieldName,
    ycoaDefault: field.ycoaDefault,
    aiRecommendation: field.aiRecommendation,
    confidence: field.confidence,
    rationale: field.rationale,
    status: field.status,
  }))
);

// Source systems for data ingestion - using actual logos
const sourceSystems = [
  { id: 'sap-ecc', name: 'SAP ECC', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/59/SAP_2011_logo.svg' },
  { id: 'oracle', name: 'Oracle EBS', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg' },
  { id: 'jde', name: 'JD Edwards', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg' },
  { id: 'dynamics', name: 'MS Dynamics', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg' },
  { id: 'sage', name: 'Sage', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Sage_logo.svg' },
  { id: 'other', name: 'Other/Custom', logo: null, Icon: SettingsIcon },
];

// Upload cards configuration
const uploadCards = [
  {
    id: 'source-coa',
    title: 'Source Chart of Accounts',
    description: 'Upload your legacy GL account master data',
    required: true,
    formats: ['CSV', 'XLSX', 'TXT'],
    sapTables: ['SKA1', 'SKB1', 'SKAT'],
  },
  {
    id: 'target-ycoa',
    title: 'Target YCOA Structure',
    description: 'S/4HANA YCOA mapping template',
    required: true,
    formats: ['CSV', 'XLSX'],
    sapTables: ['S/4 Best Practice', 'YCOA'],
  },
  {
    id: 'gl-balances',
    title: 'Historical Transaction Data',
    description: '1 year of posting history (BKPF/BSEG)',
    required: false,
    formats: ['CSV', 'XLSX'],
    sapTables: ['BKPF', 'BSEG', '1.2M+ rows'],
  },
];

// Issue detection data for Governance mode
const issueStats = [
  { label: 'CRITICAL', value: 12, color: '#ef4444' },
  { label: 'HIGH', value: 47, color: '#f59e0b' },
  { label: 'MEDIUM', value: 156, color: '#1565c0' },
  { label: 'LOW', value: 284, color: '#6b7280' },
  { label: 'RESOLVED', value: 89, color: '#10b981' },
];

// Mock issue data for Governance mode
const mockIssues = [
  { id: 1, account: '100000', description: 'Manual Postings to Recon Account', severity: 'critical', category: 'Posting Control', affected: 8, lastDetected: '2024-01-15' },
  { id: 2, account: '110000', description: 'BS/P&L Misclassification', severity: 'critical', category: 'Account Type', affected: 3, lastDetected: '2024-01-14' },
  { id: 3, account: '120000', description: 'Missing Open Item Flag', severity: 'critical', category: 'Settings', affected: 1, lastDetected: '2024-01-12' },
  { id: 4, account: '130000', description: 'Dormant Account - No Activity 12+ Months', severity: 'high', category: 'Activity', affected: 847, lastDetected: '2024-01-10' },
  { id: 5, account: '140000', description: 'Duplicate Account Cluster', severity: 'high', category: 'Duplicates', affected: 12, lastDetected: '2024-01-08' },
  { id: 6, account: '150000', description: 'Sort Key Misalignment', severity: 'medium', category: 'Settings', affected: 23, lastDetected: '2024-01-05' },
];

const GLAIModule = ({ onBack, darkMode = false }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [operatingMode, setOperatingMode] = useState('migration');
  const [selectedSystem, setSelectedSystem] = useState('sap-ecc');
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploading, setUploading] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedRowIds, setExpandedRowIds] = useState([]);
  const [selectedFieldForInsight, setSelectedFieldForInsight] = useState(null);
  const [outputViewMode, setOutputViewMode] = useState('account'); // 'account' or 'field'

  const toggleRowExpansion = (rowId) => {
    setExpandedRowIds(prev =>
      prev.includes(rowId)
        ? prev.filter(id => id !== rowId)
        : [...prev, rowId]
    );
  };

  // Local color variables matching ORDLY.AI pattern
  const bgColor = darkMode ? '#0d1117' : '#f8fafc';
  const cardBg = darkMode ? '#161b22' : '#fff';
  const textColor = darkMode ? '#e6edf3' : '#1e293b';
  const textSecondary = darkMode ? '#8b949e' : '#64748b';
  const borderColor = darkMode ? '#30363d' : '#e2e8f0';

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setOperatingMode(newMode);
    }
  };

  const handleFileUpload = (cardId) => {
    setUploading(cardId);
    setTimeout(() => {
      setUploadedFiles(prev => ({
        ...prev,
        [cardId]: {
          name: `${cardId.replace('-', '_')}_data.xlsx`,
          rows: Math.floor(Math.random() * 3000) + 1000,
          uploadedAt: new Date().toLocaleTimeString(),
        }
      }));
      setUploading(null);
    }, 1500);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return '#10b981';
    if (confidence >= 80) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusChip = (status) => {
    const chipStyle = masterDataTheme.chips.status[status] || masterDataTheme.chips.status.review;
    const labelMap = { approved: 'Approved', review: 'Review', rejected: 'Rejected', proposed: 'Proposed' };
    return (
      <Chip
        label={labelMap[status] || 'Review'}
        size="small"
        sx={{
          ...chipStyle,
          fontSize: '0.7rem',
        }}
      />
    );
  };

  // Field-level detail panel content for row expansion
  const renderFieldExpansion = (account) => {
    if (!account || !account.fields) return null;

    return (
      <Box sx={{
        p: 2,
        bgcolor: darkMode ? alpha(MODULE_NAVY, 0.08) : alpha(MODULE_NAVY, 0.03),
        borderTop: `1px solid ${borderColor}`,
        borderBottom: `1px solid ${borderColor}`,
      }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <AIIcon sx={{ fontSize: 18, color: MODULE_NAVY }} />
          <Typography variant="subtitle2" fontWeight={600} sx={{ color: textColor }}>
            Field-Level AI Recommendations for {account.sourceAccount}
          </Typography>
          <Chip
            label={`${account.fields.filter(f => f.status === 'proposed').length} proposed overrides`}
            size="small"
            sx={{ bgcolor: alpha(NAVY_BLUE, 0.1), color: '#1565c0', fontWeight: 600, fontSize: '0.65rem' }}
          />
        </Stack>

        <TableContainer component={Paper} elevation={0} sx={{ bgcolor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: bgColor }}>
                <TableCell sx={{ fontWeight: 600, color: textColor, fontSize: '0.75rem', py: 1 }}>Table</TableCell>
                <TableCell sx={{ fontWeight: 600, color: textColor, fontSize: '0.75rem', py: 1 }}>Field</TableCell>
                <TableCell sx={{ fontWeight: 600, color: textColor, fontSize: '0.75rem', py: 1 }}>Field Name</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: textColor, fontSize: '0.75rem', py: 1 }}>YCOA Default</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: textColor, fontSize: '0.75rem', py: 1 }}>AI Recommendation</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: textColor, fontSize: '0.75rem', py: 1 }}>Confidence</TableCell>
                <TableCell sx={{ fontWeight: 600, color: textColor, fontSize: '0.75rem', py: 1 }}>Rationale</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: textColor, fontSize: '0.75rem', py: 1 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: textColor, fontSize: '0.75rem', py: 1 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {account.fields.map((field) => {
                const isOverride = field.ycoaDefault !== field.aiRecommendation;
                return (
                  <TableRow
                    key={field.id}
                    sx={{
                      bgcolor: isOverride ? alpha(NAVY_BLUE, darkMode ? 0.08 : 0.03) : 'transparent',
                      '&:hover': { bgcolor: darkMode ? alpha('#fff', 0.03) : alpha('#000', 0.02) }
                    }}
                  >
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: textSecondary, py: 1 }}>
                      {field.table}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600, color: MODULE_NAVY, py: 1 }}>
                      {field.field}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', color: textColor, py: 1 }}>
                      {field.fieldName}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Chip
                        label={field.ycoaDefault || '—'}
                        size="small"
                        sx={{
                          minWidth: 40,
                          height: 22,
                          fontSize: '0.7rem',
                          fontFamily: 'monospace',
                          bgcolor: alpha('#6b7280', 0.1),
                          color: textSecondary,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Chip
                        label={field.aiRecommendation || '—'}
                        size="small"
                        sx={{
                          minWidth: 40,
                          height: 22,
                          fontSize: '0.7rem',
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          bgcolor: isOverride ? alpha(NAVY_BLUE, 0.15) : alpha('#10b981', 0.1),
                          color: isOverride ? NAVY_BLUE : '#10b981',
                          border: isOverride ? `1px solid ${alpha(NAVY_BLUE, 0.3)}` : 'none',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Chip
                        label={`${field.confidence}%`}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          bgcolor: alpha(getConfidenceColor(field.confidence), 0.1),
                          color: getConfidenceColor(field.confidence),
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.7rem', color: textSecondary, py: 1, maxWidth: 200 }}>
                      <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.3 }}>
                        {field.rationale}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      {getStatusChip(field.status)}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="View Evidence">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedFieldForInsight(field)}
                            sx={{ color: MODULE_NAVY }}
                          >
                            <ViewEvidenceIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        {field.status === 'proposed' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton size="small" sx={{ color: '#10b981' }}>
                                <ApproveIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton size="small" sx={{ color: '#ef4444' }}>
                                <RejectIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  // Critical issues data
  const criticalIssues = [
    { severity: 'critical', title: 'Manual Postings to Recon Accounts', description: '8 reconciliation accounts have unauthorized manual entries', count: 8 },
    { severity: 'critical', title: 'BS/P&L Misclassification', description: '3 accounts have incorrect balance sheet vs P&L indicator', count: 3 },
    { severity: 'critical', title: 'Missing Open Item Flag', description: '1 clearing account missing required open item management', count: 1 },
  ];

  const issueDistribution = [
    { severity: 'high', title: 'Dormant Accounts', description: 'Accounts with no activity in 12+ months', count: 847 },
    { severity: 'high', title: 'Duplicate Account Clusters', description: 'Accounts with identical posting behavior', count: 12 },
    { severity: 'medium', title: 'Sort Key Misalignment', description: "Sort key doesn't match dominant reference field", count: 23 },
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return NAVY_BLUE;
      default: return '#6b7280';
    }
  };

  // Dashboard Section Content
  const renderDashboard = () => (
    <Box>
      {/* Header with icon - matching Inventory Health Check */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5, borderRadius: 2, mb: 0,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
                  }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(NAVY_BLUE, 0.1), color: NAVY_BLUE }}>
            <AccountBalanceIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Chip label="GL.AI" size="small" sx={{ bgcolor: MODULE_NAVY, color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />
              <Typography variant="caption" sx={{ color: MODULE_NAVY, textTransform: 'uppercase', letterSpacing: 1 }}>
                Health Dashboard
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="h5" fontWeight={700} sx={{ color: textColor }}>
                GL Account Health Check
              </Typography>
              <Chip label="Demo Data" size="small" icon={<WarningIcon sx={{ fontSize: 14 }} />} sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 600, fontSize: '0.7rem' }} />
            </Stack>
            <Typography variant="body2" sx={{ color: textSecondary }}>
              Monitor GL account health scores, mapping coverage, and data quality metrics
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Metrics Row - matching AP.AI stat cards */}
      <Grid container spacing={2} sx={{ mt: 1, mb: 3 }}>
        {dashboardMetrics.map((metric, index) => (
          <Grid item xs={6} md={2} key={index}>
            <Card variant="outlined" sx={{ borderLeft: `3px solid ${metric.color}` }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography sx={{ fontSize: '0.7rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                  {metric.label}
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: metric.color }}>
                  {metric.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Health Score and Issues Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Health Score Card */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${borderColor}`,
              bgcolor: cardBg,
              height: '100%',
                          }}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: textColor }}>
              Overall GL Health Score
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: `conic-gradient(${MODULE_NAVY} 0deg, ${MODULE_NAVY} ${72 * 3.6}deg, ${darkMode ? '#1e2d42' : '#e5e7eb'} ${72 * 3.6}deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      bgcolor: cardBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h4" fontWeight={700} sx={{ color: MODULE_NAVY }}>
                      72<Typography component="span" variant="body2" sx={{ color: textSecondary }}>/100</Typography>
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Chip icon={<TrendingUpIcon sx={{ fontSize: 16 }} />} label="+5 from last quarter" size="small" sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981' }} />
            </Box>
          </Paper>
        </Grid>

        {/* Critical Issues */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: `1px solid ${borderColor}`,
              bgcolor: cardBg,
              height: '100%',
              overflow: 'hidden',
                          }}
          >
            <Box sx={{ p: 2, borderBottom: `1px solid ${borderColor}` }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <ErrorIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                  <Typography variant="subtitle1" fontWeight={600} sx={{ color: textColor }}>
                    Critical Issues
                  </Typography>
                </Stack>
                <Button size="small" sx={{ fontSize: '0.7rem' }}>View All</Button>
              </Stack>
            </Box>
            <Box sx={{ p: 2 }}>
              {criticalIssues.map((issue, index) => (
                <Box
                  key={index}
                  onClick={() => setActiveSection('output-table')}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    mb: 1,
                    borderRadius: 2,
                    bgcolor: darkMode ? '#0f1724' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateX(4px)', bgcolor: darkMode ? '#151f30' : '#f1f5f9' },
                  }}
                >
                  <Box sx={{ width: 4, height: 36, borderRadius: 1, bgcolor: getSeverityColor(issue.severity) }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ color: textColor, fontSize: '0.8rem' }}>
                      {issue.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: textSecondary }}>
                      {issue.description}
                    </Typography>
                  </Box>
                  <Chip label={issue.count} size="small" sx={{ bgcolor: alpha(getSeverityColor(issue.severity), 0.1), color: getSeverityColor(issue.severity), fontWeight: 700, minWidth: 32 }} />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Issue Distribution */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: `1px solid ${borderColor}`,
              bgcolor: cardBg,
              height: '100%',
              overflow: 'hidden',
                          }}
          >
            <Box sx={{ p: 2, borderBottom: `1px solid ${borderColor}` }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <BarChartIcon sx={{ color: MODULE_NAVY, fontSize: 20 }} />
                <Typography variant="subtitle1" fontWeight={600} sx={{ color: textColor }}>
                  Issue Distribution
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ p: 2 }}>
              {issueDistribution.map((issue, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    mb: 1,
                    borderRadius: 2,
                    bgcolor: darkMode ? '#0f1724' : '#f8fafc',
                  }}
                >
                  <Box sx={{ width: 4, height: 36, borderRadius: 1, bgcolor: getSeverityColor(issue.severity) }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ color: textColor, fontSize: '0.8rem' }}>
                      {issue.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: textSecondary }}>
                      {issue.description}
                    </Typography>
                  </Box>
                  <Chip label={issue.count} size="small" sx={{ bgcolor: alpha(getSeverityColor(issue.severity), 0.1), color: getSeverityColor(issue.severity), fontWeight: 700, minWidth: 40 }} />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: `1px solid ${borderColor}`,
          bgcolor: cardBg,
          overflow: 'hidden',
                  }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${borderColor}` }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AIIcon sx={{ color: MODULE_NAVY, fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: textColor }}>
              Quick Actions
            </Typography>
          </Stack>
        </Box>
        <Box sx={{ p: 2 }}>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" size="small" startIcon={<UploadIcon />} onClick={() => setActiveSection('data-ingestion')} sx={masterDataTheme.buttons.secondary}>
              New Analysis
            </Button>
            <Button variant="outlined" size="small" startIcon={<LinkIcon />} onClick={() => setActiveSection('account-matching')} sx={masterDataTheme.buttons.secondary}>
              Review Mappings
            </Button>
            <Button variant="outlined" size="small" startIcon={<TableChartIcon />} onClick={() => setActiveSection('output-table')} sx={masterDataTheme.buttons.secondary}>
              Remediation Workbench
            </Button>
            <Button variant="outlined" size="small" startIcon={<ReportsIcon />} sx={masterDataTheme.buttons.secondary}>
              Generate Report
            </Button>
            <Button variant="outlined" size="small" startIcon={<DownloadIcon />} sx={masterDataTheme.buttons.secondary}>
              Export All Issues
            </Button>
            <Button variant="outlined" size="small" startIcon={<SyncIcon />} sx={masterDataTheme.buttons.secondary}>
              Sync with S/4HANA
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );

  // Data Ingestion Section Content (Migration Mode)
  const renderDataIngestion = () => {
    // If in Governance mode, show System Connection instead
    if (operatingMode === 'governance') {
      return renderSystemConnection();
    }

    return (
      <Box>
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, mb: 3, bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Chip label="GL.AI" size="small" sx={{ bgcolor: MODULE_NAVY, color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />
            <Typography variant="caption" sx={{ color: MODULE_NAVY, textTransform: 'uppercase', letterSpacing: 1 }}>
              Data Ingestion
            </Typography>
          </Stack>
          <Typography variant="h5" fontWeight={700} sx={{ color: darkMode ? '#e6edf3' : MODULE_NAVY }}>
            Data Ingestion
          </Typography>
          <Typography variant="body2" sx={{ color: textSecondary }}>
            Upload source Chart of Accounts and target YCOA structure for AI-powered mapping
          </Typography>
        </Paper>

        {/* Source System Selection */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            mb: 2,
            border: `1px solid ${borderColor}`,
            bgcolor: cardBg,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: textColor }}>
            Select Source System
          </Typography>
          <Grid container spacing={1.5}>
            {sourceSystems.map((system) => (
              <Grid item xs={6} sm={4} md={2} key={system.id}>
                <Paper
                  elevation={0}
                  onClick={() => setSelectedSystem(system.id)}
                  sx={{
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                    borderRadius: 2,
                    border: `2px solid ${selectedSystem === system.id ? MODULE_NAVY : borderColor}`,
                    bgcolor: selectedSystem === system.id ? alpha(MODULE_NAVY, darkMode ? 0.15 : 0.05) : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: MODULE_NAVY,
                      bgcolor: alpha(MODULE_NAVY, darkMode ? 0.1 : 0.03),
                    },
                  }}
                >
                  {system.logo ? (
                    <Box
                      component="img"
                      src={system.logo}
                      alt={system.name}
                      sx={{
                        width: 28,
                        height: 28,
                        objectFit: 'contain',
                        filter: darkMode ? 'brightness(1.2)' : 'none',
                      }}
                    />
                  ) : (
                    <system.Icon sx={{ fontSize: 24, color: textSecondary }} />
                  )}
                  <Typography variant="caption" fontWeight={600} sx={{ color: textColor }}>
                    {system.name}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Upload Cards */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {uploadCards.map((card) => {
            const isUploaded = uploadedFiles[card.id];
            const isUploading = uploading === card.id;

            return (
              <Grid item xs={12} md={4} key={card.id}>
                <Paper
                  elevation={0}
                  onClick={() => !isUploaded && !isUploading && handleFileUpload(card.id)}
                  sx={{
                    p: 2.5,
                    height: '100%',
                    borderRadius: 2,
                    cursor: isUploaded ? 'default' : 'pointer',
                    border: `2px dashed ${isUploaded ? '#10b981' : borderColor}`,
                    bgcolor: isUploaded ? alpha('#10b981', darkMode ? 0.1 : 0.05) : cardBg,
                    transition: 'all 0.3s ease',
                    '&:hover': !isUploaded && {
                      borderColor: MODULE_NAVY,
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Box sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: isUploaded ? alpha('#10b981', 0.15) : alpha(MODULE_NAVY, darkMode ? 0.15 : 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}>
                    {isUploaded ? (
                      <CheckIcon sx={{ fontSize: 28, color: '#10b981' }} />
                    ) : (
                      <UploadIcon sx={{ fontSize: 28, color: MODULE_NAVY }} />
                    )}
                  </Box>

                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: textColor }}>
                      {card.title}
                    </Typography>
                    {card.required && (
                      <Chip label="Required" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' }} />
                    )}
                  </Stack>

                  <Typography variant="body2" sx={{ color: textSecondary, mb: 2 }}>
                    {card.description}
                  </Typography>

                  {/* SAP Table Tags */}
                  <Stack direction="row" spacing={0.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
                    {card.sapTables?.map((table) => (
                      <Chip key={table} label={table} size="small" sx={{
                        height: 22,
                        fontSize: '0.65rem',
                        fontFamily: 'monospace',
                        bgcolor: darkMode ? alpha('#fff', 0.08) : alpha('#000', 0.05),
                        color: textSecondary,
                      }} />
                    ))}
                  </Stack>

                  {isUploading && (
                    <Box>
                      <LinearProgress sx={{ borderRadius: 1, mb: 1 }} />
                      <Typography variant="caption" sx={{ color: textSecondary }}>
                        Uploading...
                      </Typography>
                    </Box>
                  )}

                  {isUploaded && (
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#10b981', darkMode ? 0.15 : 0.08) }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FileIcon sx={{ fontSize: 18, color: '#10b981' }} />
                        <Box>
                          <Typography variant="caption" fontWeight={600} sx={{ color: '#10b981', display: 'block' }}>
                            {isUploaded.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: textSecondary }}>
                            {isUploaded.rows.toLocaleString()} rows • {isUploaded.uploadedAt}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        {/* Configuration Panel */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            mb: 2,
            border: `1px solid ${borderColor}`,
            bgcolor: cardBg,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <SettingsIcon sx={{ color: MODULE_NAVY, fontSize: 18 }} />
            <Typography variant="body1" fontWeight={600} sx={{ color: textColor }}>
              Analysis Configuration
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Target Company Code</InputLabel>
                <Select defaultValue="1000" label="Target Company Code">
                  <MenuItem value="1000">1000 - US Operations</MenuItem>
                  <MenuItem value="2000">2000 - EU Operations</MenuItem>
                  <MenuItem value="3000">3000 - APAC Operations</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Confidence Threshold</InputLabel>
                <Select defaultValue="80" label="Confidence Threshold">
                  <MenuItem value="90">≥ 90% (Strict)</MenuItem>
                  <MenuItem value="80">≥ 80% (Recommended)</MenuItem>
                  <MenuItem value="70">≥ 70% (Relaxed)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>AI Mode</InputLabel>
                <Select defaultValue="full" label="AI Mode">
                  <MenuItem value="full">Full (All Fields)</MenuItem>
                  <MenuItem value="conservative">Conservative (Key Fields)</MenuItem>
                  <MenuItem value="validate">Validate Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Fiscal Year</InputLabel>
                <Select defaultValue="2024" label="Fiscal Year">
                  <MenuItem value="2024">2024</MenuItem>
                  <MenuItem value="2023">2023</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Footer Bar */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckIcon sx={{ fontSize: 16, color: '#10b981' }} />
            <Typography variant="body2" sx={{ color: textSecondary }}>
              {Object.keys(uploadedFiles).length} of 3 files uploaded
            </Typography>
          </Stack>
          <Button
            variant="contained"
            startIcon={<RunIcon />}
            disabled={!uploadedFiles['source-coa'] || !uploadedFiles['target-ycoa']}
            onClick={() => setActiveSection('account-matching')}
            sx={{
              ...masterDataTheme.buttons.primary,
              '&.Mui-disabled': { bgcolor: alpha(MODULE_NAVY, 0.3) },
            }}
          >
            Run AI Analysis
          </Button>
        </Stack>
      </Box>
    );
  };

  // System Connection Section (Governance Mode)
  const renderSystemConnection = () => (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <LinkIcon sx={{ color: MODULE_NAVY }} />
        <Typography variant="h5" fontWeight={700} sx={{ color: darkMode ? '#e6edf3' : MODULE_NAVY }}>
          System Connection
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ mb: 3, color: textSecondary }}>
        Connect to your S/4HANA system to analyze GL master data health and identify optimization opportunities.
      </Typography>

      <Grid container spacing={3}>
        {/* Connection Form */}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${borderColor}`,
              bgcolor: cardBg,
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3, color: textColor }}>
              S/4HANA Connection Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth size="small" label="System ID" defaultValue="S4D" placeholder="e.g., PRD, QAS, DEV" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth size="small" label="Client" defaultValue="100" placeholder="e.g., 100, 200" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth size="small" label="Host" defaultValue="s4hana.company.com" placeholder="e.g., s4hana.company.com" />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Connection Type</InputLabel>
                  <Select defaultValue="rfc" label="Connection Type">
                    <MenuItem value="rfc">RFC/BAPI</MenuItem>
                    <MenuItem value="odata">OData API</MenuItem>
                    <MenuItem value="file">File Extract</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Analysis Period</InputLabel>
                  <Select defaultValue="12" label="Analysis Period">
                    <MenuItem value="12">Last 12 months</MenuItem>
                    <MenuItem value="24">Last 24 months</MenuItem>
                    <MenuItem value="6">Last 6 months</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Connection Status */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: `2px solid #10b981`,
              bgcolor: alpha('#10b981', darkMode ? 0.1 : 0.05),
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <CheckIcon sx={{ color: '#10b981' }} />
              <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#10b981' }}>
                Connected to S4D/100
              </Typography>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                • 3,247 GL accounts found
              </Typography>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                • ACDOCA access confirmed
              </Typography>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                • 18 months of data available
              </Typography>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                • All company codes accessible
              </Typography>
            </Stack>
          </Paper>
        </Grid>

        {/* Scope Selection */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${borderColor}`,
              bgcolor: cardBg,
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: textColor }}>
              Scope Selection
            </Typography>
            <Stack direction="row" spacing={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <input type="checkbox" defaultChecked style={{ accentColor: MODULE_NAVY }} />
                <Typography variant="body2">1000 - US Operations</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <input type="checkbox" defaultChecked style={{ accentColor: MODULE_NAVY }} />
                <Typography variant="body2">2000 - EU Operations</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <input type="checkbox" style={{ accentColor: MODULE_NAVY }} />
                <Typography variant="body2">3000 - APAC Operations</Typography>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Footer Bar */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CheckIcon sx={{ fontSize: 18, color: '#10b981' }} />
          <Typography variant="body2" sx={{ color: '#10b981' }}>
            Connection verified • Ready for health analysis
          </Typography>
        </Stack>
        <Button
          variant="contained"
          size="large"
          startIcon={<RunIcon />}
          onClick={() => setActiveSection('account-matching')}
          sx={masterDataTheme.buttons.primary}
        >
          Run Health Analysis
        </Button>
      </Stack>
    </Box>
  );

  // Account Matching Section Content
  const renderAccountMatching = () => {
    // If in Governance mode, show Issue Detection instead
    if (operatingMode === 'governance') {
      return renderIssueDetection();
    }

    return (
      <Box>
        {/* Header with icon - matching AP.AI drilldown pattern */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, mb: 3, bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <Chip label="GL.AI" size="small" sx={{ bgcolor: MODULE_NAVY, color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />
                <Typography variant="caption" sx={{ color: MODULE_NAVY, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Account Matching
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <Typography variant="h5" fontWeight={700} sx={{ color: textColor }}>
                  Account Matching
                </Typography>
                <Chip label="Demo Data" size="small" icon={<WarningIcon sx={{ fontSize: 14 }} />} sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 600, fontSize: '0.7rem' }} />
              </Stack>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                AI-powered mapping of source GL accounts to target S/4HANA YCOA with confidence scoring
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <IconButton sx={{ border: `1px solid ${borderColor}` }}>
                <RefreshIcon />
              </IconButton>
              <IconButton sx={{ border: `1px solid ${borderColor}` }}>
                <DownloadIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Paper>

      {/* Metrics Row - matching AP.AI stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'MAPPED', value: '2,891', color: '#10b981' },
          { label: 'PENDING', value: '287', color: '#f59e0b' },
          { label: 'UNMAPPED', value: '69', color: '#ef4444' },
          { label: 'HIGH CONF', value: '2,456', color: NAVY_BLUE },
          { label: 'AVG CONF', value: '94%', color: '#10b981' },
          { label: 'AI SUGGESTIONS', value: '142', color: MODULE_NAVY },
        ].map((metric, index) => (
          <Grid item xs={6} md={2} key={index}>
            <Card variant="outlined" sx={{ borderLeft: `3px solid ${metric.color}` }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography sx={{ fontSize: '0.7rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                  {metric.label}
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: metric.color }}>
                  {metric.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters Row - like Inventory Health Check */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <FilterIcon sx={{ color: textSecondary }} />
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Status</InputLabel>
          <Select defaultValue="All" label="Status">
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Review">Review</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Confidence</InputLabel>
          <Select defaultValue="All" label="Confidence">
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="High">High (≥90%)</MenuItem>
            <MenuItem value="Medium">Medium (70-89%)</MenuItem>
            <MenuItem value="Low">Low (&lt;70%)</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Account Type</InputLabel>
          <Select defaultValue="All" label="Account Type">
            <MenuItem value="All">All Types</MenuItem>
            <MenuItem value="Asset">Asset</MenuItem>
            <MenuItem value="Liability">Liability</MenuItem>
            <MenuItem value="Equity">Equity</MenuItem>
            <MenuItem value="Revenue">Revenue</MenuItem>
            <MenuItem value="Expense">Expense</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ flex: 1 }} />
        <Typography variant="body2" sx={{ color: textSecondary }}>
          Showing {mockAccountsWithFields.length} of {mockAccountsWithFields.length} accounts
        </Typography>
      </Stack>

      {/* Account Mapping Table with Field-Level Expansion */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: `1px solid ${borderColor}`,
          bgcolor: cardBg,
          overflow: 'hidden',
                  }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, bgcolor: darkMode ? '#21262d' : '#f1f5f9', borderBottom: `1px solid ${borderColor}` }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f87171' }} />
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#fbbf24' }} />
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#34d399' }} />
          <Typography variant="caption" sx={{ color: textSecondary, ml: 1 }}>Account Mapping Results — Feb 6, 2026</Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: bgColor }}>
                <TableCell sx={{ width: 40, p: 1 }} />
                <TableCell sx={{ fontWeight: 600, color: textColor, fontSize: '0.8rem' }}>Source Account</TableCell>
                <TableCell sx={{ fontWeight: 600, color: textColor, fontSize: '0.8rem' }}>Source Description</TableCell>
                <TableCell sx={{ fontWeight: 600, color: textColor, fontSize: '0.8rem' }}>Target YCOA</TableCell>
                <TableCell sx={{ fontWeight: 600, color: textColor, fontSize: '0.8rem' }}>Target Description</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: textColor, fontSize: '0.8rem' }}>Map Conf</TableCell>
                <TableCell sx={{ fontWeight: 600, color: textColor, fontSize: '0.8rem' }}>Method</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: textColor, fontSize: '0.8rem' }}>AI Overrides</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: textColor, fontSize: '0.8rem' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockAccountsWithFields.map((account) => {
                const isExpanded = expandedRowIds.includes(account.id);
                const hasOverrides = account.fieldsOverridden > 0;
                return (
                  <React.Fragment key={account.id}>
                    <TableRow
                      sx={{
                        cursor: 'pointer',
                        bgcolor: isExpanded ? (darkMode ? alpha(MODULE_NAVY, 0.1) : alpha(MODULE_NAVY, 0.03)) : 'transparent',
                        '&:hover': { bgcolor: darkMode ? alpha('#fff', 0.03) : alpha('#000', 0.02) },
                        borderBottom: isExpanded ? 'none' : undefined,
                      }}
                      onClick={() => toggleRowExpansion(account.id)}
                    >
                      <TableCell sx={{ p: 1 }}>
                        <IconButton size="small" sx={{ color: MODULE_NAVY }}>
                          {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', color: textColor, py: 1.5 }}>
                        {account.sourceAccount}
                      </TableCell>
                      <TableCell sx={{ color: textSecondary, fontSize: '0.85rem', py: 1.5 }}>
                        {account.sourceDesc}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: MODULE_NAVY, py: 1.5 }}>
                        {account.targetAccount}
                      </TableCell>
                      <TableCell sx={{ color: textSecondary, fontSize: '0.85rem', py: 1.5 }}>
                        {account.targetDesc}
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        <Chip
                          label={`${account.mappingConfidence}%`}
                          size="small"
                          sx={{
                            bgcolor: alpha(getConfidenceColor(account.mappingConfidence), 0.1),
                            color: getConfidenceColor(account.mappingConfidence),
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: textSecondary, fontSize: '0.75rem', py: 1.5 }}>
                        {account.mappingMethod}
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        <Chip
                          icon={<AIIcon sx={{ fontSize: 14 }} />}
                          label={`${account.fieldsOverridden}/${account.fieldsTotal}`}
                          size="small"
                          sx={{
                            bgcolor: hasOverrides ? alpha(NAVY_BLUE, 0.1) : alpha('#6b7280', 0.1),
                            color: hasOverrides ? NAVY_BLUE : '#6b7280',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            '& .MuiChip-icon': { color: 'inherit' }
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        {getStatusChip(account.status)}
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={9} sx={{ p: 0 }}>
                          {renderFieldExpansion(account)}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Proceed Button */}
      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={() => setActiveSection('output-table')}
          sx={masterDataTheme.buttons.primary}
        >
          Proceed to Output Table
        </Button>
      </Stack>
    </Box>
    );
  };

  // Issue Detection Section (Governance Mode)
  const renderIssueDetection = () => (
    <Box>
      {/* Header with icon - matching AP.AI drilldown pattern */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, mb: 3, bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Chip label="GL.AI" size="small" sx={{ bgcolor: MODULE_NAVY, color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />
              <Typography variant="caption" sx={{ color: MODULE_NAVY, textTransform: 'uppercase', letterSpacing: 1 }}>
                Issue Detection
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="h5" fontWeight={700} sx={{ color: textColor }}>
                Issue Detection
              </Typography>
              <Chip label="Demo Data" size="small" icon={<WarningIcon sx={{ fontSize: 14 }} />} sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 600, fontSize: '0.7rem' }} />
            </Stack>
            <Typography variant="body2" sx={{ color: textSecondary }}>
              AI-detected issues in GL master data requiring attention and remediation
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" startIcon={<RefreshIcon />} sx={masterDataTheme.buttons.secondary}>
              Re-scan
            </Button>
            <IconButton sx={{ border: `1px solid ${borderColor}` }}>
              <DownloadIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>

      {/* Issue Stats Row - matching AP.AI stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {issueStats.map((stat, index) => (
          <Grid item xs={6} md key={index}>
            <Card variant="outlined" sx={{ borderLeft: `3px solid ${stat.color}` }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography sx={{ fontSize: '0.7rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                  {stat.label}
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: stat.color }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters Row */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <FilterIcon sx={{ color: textSecondary }} />
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Severity</InputLabel>
          <Select defaultValue="All" label="Severity">
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Critical">Critical</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Category</InputLabel>
          <Select defaultValue="All" label="Category">
            <MenuItem value="All">All Categories</MenuItem>
            <MenuItem value="Posting">Posting Control</MenuItem>
            <MenuItem value="Settings">Settings</MenuItem>
            <MenuItem value="Activity">Activity</MenuItem>
            <MenuItem value="Duplicates">Duplicates</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Status</InputLabel>
          <Select defaultValue="Open" label="Status">
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Resolved">Resolved</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ flex: 1 }} />
        <Typography variant="body2" sx={{ color: textSecondary }}>
          Showing {mockIssues.length} issues
        </Typography>
      </Stack>

      {/* Issues DataGrid */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: `1px solid ${borderColor}`,
          bgcolor: cardBg,
          overflow: 'hidden',
                  }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, bgcolor: darkMode ? '#21262d' : '#f1f5f9', borderBottom: `1px solid ${borderColor}` }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f87171' }} />
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#fbbf24' }} />
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#34d399' }} />
          <Typography variant="caption" sx={{ color: textSecondary, ml: 1 }}>Issue Detection Results — Feb 6, 2026</Typography>
        </Box>
        <DataGrid
          rows={mockIssues}
          columns={[
            {
              field: 'severity',
              headerName: '',
              width: 8,
              sortable: false,
              renderCell: (params) => (
                <Box sx={{
                  width: 4,
                  height: 32,
                  borderRadius: 1,
                  bgcolor: params.value === 'critical' ? '#ef4444' : params.value === 'high' ? '#f59e0b' : NAVY_BLUE,
                }}/>
              ),
            },
            {
              field: 'account',
              headerName: 'Account',
              width: 100,
              renderCell: (params) => (
                <Typography sx={{ fontFamily: 'monospace', color: MODULE_NAVY, fontWeight: 600 }}>
                  {params.value}
                </Typography>
              ),
            },
            {
              field: 'description',
              headerName: 'Issue Description',
              flex: 1,
              minWidth: 250,
              renderCell: (params) => (
                <Typography variant="body2" fontWeight={500} sx={{ color: textColor }}>
                  {params.value}
                </Typography>
              ),
            },
            {
              field: 'category',
              headerName: 'Category',
              width: 130,
              renderCell: (params) => (
                <Chip label={params.value} size="small" sx={{ bgcolor: alpha(MODULE_NAVY, 0.1), color: MODULE_NAVY, fontSize: '0.7rem' }} />
              ),
            },
            {
              field: 'affected',
              headerName: 'Affected',
              width: 90,
              align: 'center',
              headerAlign: 'center',
              renderCell: (params) => (
                <Chip
                  label={params.value}
                  size="small"
                  sx={{
                    bgcolor: params.value > 100 ? alpha('#ef4444', 0.1) : params.value > 10 ? alpha('#f59e0b', 0.1) : alpha('#6b7280', 0.1),
                    color: params.value > 100 ? '#ef4444' : params.value > 10 ? '#f59e0b' : '#6b7280',
                    fontWeight: 700,
                  }}
                />
              ),
            },
            {
              field: 'lastDetected',
              headerName: 'Last Detected',
              width: 120,
              renderCell: (params) => (
                <Typography variant="body2" sx={{ color: textSecondary, fontSize: '0.8rem' }}>
                  {params.value}
                </Typography>
              ),
            },
            {
              field: 'actions',
              headerName: 'Actions',
              width: 140,
              sortable: false,
              renderCell: () => (
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Remediate">
                    <IconButton size="small" sx={{ color: MODULE_NAVY }}>
                      <RemediationIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Suppress">
                    <IconButton size="small" sx={{ color: '#6b7280' }}>
                      <RejectIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Mark Resolved">
                    <IconButton size="small" sx={{ color: '#10b981' }}>
                      <ApproveIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ),
            },
          ]}
          autoHeight
          density="compact"
          checkboxSelection
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          getRowClassName={(params) =>
            params.row.severity === 'critical' ? 'row-critical' : params.row.severity === 'high' ? 'row-high' : ''
          }
          sx={{
            ...masterDataTheme.getDataGridSx({ darkMode }),
            '& .MuiDataGrid-toolbarContainer': {
              padding: 2,
              gap: 2,
              borderBottom: masterDataTheme.borders.subtle(darkMode),
            },
            '& .row-critical': {
              borderLeft: '3px solid #ef4444',
              bgcolor: alpha('#ef4444', 0.03),
            },
            '& .row-high': {
              borderLeft: '3px solid #f59e0b',
              bgcolor: alpha('#f59e0b', 0.03),
            },
          }}
        />
      </Paper>

      {/* Proceed Button */}
      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={() => setActiveSection('output-table')}
          sx={masterDataTheme.buttons.primary}
        >
          Proceed to Remediation
        </Button>
      </Stack>
    </Box>
  );

  // Output Table Section Content
  const renderOutputTable = () => {
    // If in Governance mode, show Remediation instead
    if (operatingMode === 'governance') {
      return renderRemediation();
    }

    return (
      <Box>
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, mb: 3, bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <Chip label="GL.AI" size="small" sx={{ bgcolor: MODULE_NAVY, color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />
                <Typography variant="caption" sx={{ color: MODULE_NAVY, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Output Table
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <Typography variant="h5" fontWeight={700} sx={{ color: textColor }}>
                  Output Table
                </Typography>
                <Chip
                  label={outputViewMode === 'account' ? 'Account View' : 'Field View'}
                  size="small"
                  sx={{ bgcolor: alpha(MODULE_NAVY, 0.1), color: MODULE_NAVY, fontWeight: 600, fontSize: '0.7rem' }}
                />
              </Stack>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                Review final mappings and export to CSV, Excel, or SAP LSMW format for migration
              </Typography>
            </Box>
            <ToggleButtonGroup
              value={outputViewMode}
              exclusive
              onChange={(e, newMode) => newMode && setOutputViewMode(newMode)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  textTransform: 'none',
                  px: 2,
                  '&.Mui-selected': {
                    bgcolor: alpha(MODULE_NAVY, 0.1),
                    color: MODULE_NAVY,
                    '&:hover': { bgcolor: alpha(MODULE_NAVY, 0.15) }
                  }
                }
              }}
            >
              <ToggleButton value="account">Account View</ToggleButton>
              <ToggleButton value="field">Field View</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Paper>

      {/* Export Options */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 2,
          mb: 3,
          border: `1px solid ${borderColor}`,
          bgcolor: cardBg,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ color: textColor }}>
              Export {outputViewMode === 'account' ? 'Account Mappings' : 'Field-Level Data'}
            </Typography>
            <Typography variant="caption" sx={{ color: textSecondary }}>
              {outputViewMode === 'account'
                ? `${mockAccountsWithFields.filter(m => m.status === 'approved').length} accounts ready for export`
                : `${mockFieldLevelExport.filter(m => m.status === 'approved').length} field-level records ready for export`
              }
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" startIcon={<DownloadIcon />} sx={{ ...masterDataTheme.buttons.ghost, fontSize: '0.8rem' }}>
              CSV
            </Button>
            <Button variant="outlined" size="small" startIcon={<DownloadIcon />} sx={{ ...masterDataTheme.buttons.ghost, fontSize: '0.8rem' }}>
              Excel
            </Button>
            <Button variant="outlined" size="small" startIcon={<DownloadIcon />} sx={{ ...masterDataTheme.buttons.ghost, fontSize: '0.8rem' }}>
              LSMW
            </Button>
            <Button variant="contained" size="small" startIcon={<DownloadIcon />} sx={{ ...masterDataTheme.buttons.primary, fontSize: '0.8rem' }}>
              All Formats
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Summary Stats - matching AP.AI Card pattern */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: cardBg, textAlign: 'center', border: `1px solid ${borderColor}` }}>
            <Typography sx={{ fontWeight: 700, color: '#10b981', fontSize: '2rem', lineHeight: 1.1, mb: 0.5 }}>
              {outputViewMode === 'account' ? mockAccountsWithFields.filter(a => a.status === 'approved').length : mockFieldLevelExport.filter(f => f.status === 'approved').length}
            </Typography>
            <Typography variant="caption" sx={{ color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, fontSize: '0.65rem' }}>
              {outputViewMode === 'account' ? 'Approved Accounts' : 'Approved Fields'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: cardBg, textAlign: 'center', border: `1px solid ${borderColor}` }}>
            <Typography sx={{ fontWeight: 700, color: '#1565c0', fontSize: '2rem', lineHeight: 1.1, mb: 0.5 }}>
              {outputViewMode === 'account'
                ? mockAccountsWithFields.reduce((sum, a) => sum + a.fieldsOverridden, 0)
                : mockFieldLevelExport.filter(f => f.ycoaDefault !== f.aiRecommendation).length
              }
            </Typography>
            <Typography variant="caption" sx={{ color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, fontSize: '0.65rem' }}>AI Overrides</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: cardBg, textAlign: 'center', border: `1px solid ${borderColor}` }}>
            <Typography sx={{ fontWeight: 700, color: '#f59e0b', fontSize: '2rem', lineHeight: 1.1, mb: 0.5 }}>
              {outputViewMode === 'account'
                ? mockAccountsWithFields.filter(a => a.status === 'review').length
                : mockFieldLevelExport.filter(f => f.status === 'proposed' || f.status === 'review').length
              }
            </Typography>
            <Typography variant="caption" sx={{ color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, fontSize: '0.65rem' }}>Pending Review</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: cardBg, textAlign: 'center', border: `1px solid ${borderColor}` }}>
            <Typography sx={{ fontWeight: 700, color: MODULE_NAVY, fontSize: '2rem', lineHeight: 1.1, mb: 0.5 }}>
              {outputViewMode === 'account'
                ? `${Math.round((mockAccountsWithFields.filter(a => a.status === 'approved').length / mockAccountsWithFields.length) * 100)}%`
                : `${Math.round((mockFieldLevelExport.filter(f => f.status === 'approved').length / mockFieldLevelExport.length) * 100)}%`
              }
            </Typography>
            <Typography variant="caption" sx={{ color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, fontSize: '0.65rem' }}>Coverage Rate</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Output Table - Account View */}
      {outputViewMode === 'account' && (
        <TableContainer component={Paper} elevation={0} sx={{
          borderRadius: 2,
          border: `1px solid ${borderColor}`,
          bgcolor: cardBg,
        }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: bgColor }}>
                <TableCell sx={{ fontWeight: 600, color: textColor, fontSize: '0.8rem' }}>Source Account</TableCell>
                <TableCell sx={{ fontWeight: 600, color: textColor, fontSize: '0.8rem' }}>Source Description</TableCell>
                <TableCell sx={{ fontWeight: 600, color: textColor, fontSize: '0.8rem' }}>Target YCOA</TableCell>
                <TableCell sx={{ fontWeight: 600, color: textColor, fontSize: '0.8rem' }}>Target Description</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: textColor, fontSize: '0.8rem' }}>Map Conf</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: textColor, fontSize: '0.8rem' }}>AI Overrides</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: textColor, fontSize: '0.8rem' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockAccountsWithFields.map((row) => (
                <TableRow key={row.id} sx={{ '&:hover': { bgcolor: darkMode ? alpha('#fff', 0.02) : alpha('#000', 0.02) } }}>
                  <TableCell sx={{ fontFamily: 'monospace', color: textColor }}>{row.sourceAccount}</TableCell>
                  <TableCell sx={{ color: textSecondary, fontSize: '0.85rem' }}>{row.sourceDesc}</TableCell>
                  <TableCell sx={{ color: MODULE_NAVY, fontFamily: 'monospace', fontWeight: 600 }}>{row.targetAccount}</TableCell>
                  <TableCell sx={{ color: textSecondary, fontSize: '0.85rem' }}>{row.targetDesc}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${row.mappingConfidence}%`}
                      size="small"
                      sx={{
                        bgcolor: alpha(getConfidenceColor(row.mappingConfidence), 0.1),
                        color: getConfidenceColor(row.mappingConfidence),
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={<AIIcon sx={{ fontSize: 12 }} />}
                      label={`${row.fieldsOverridden}/${row.fieldsTotal}`}
                      size="small"
                      sx={{
                        bgcolor: row.fieldsOverridden > 0 ? alpha(NAVY_BLUE, 0.1) : alpha('#6b7280', 0.1),
                        color: row.fieldsOverridden > 0 ? NAVY_BLUE : '#6b7280',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        '& .MuiChip-icon': { color: 'inherit' }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {getStatusChip(row.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Output Table - Field View */}
      {outputViewMode === 'field' && (
        <TableContainer component={Paper} elevation={0} sx={{
          borderRadius: 2,
          border: `1px solid ${borderColor}`,
          bgcolor: cardBg,
        }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: bgColor }}>
                <TableCell sx={{ fontWeight: 600, color: textColor, fontSize: '0.75rem' }}>Source GL</TableCell>
                <TableCell sx={{ fontWeight: 600, color: textColor, fontSize: '0.75rem' }}>Target YCOA</TableCell>
                <TableCell sx={{ fontWeight: 600, color: textColor, fontSize: '0.75rem' }}>Table</TableCell>
                <TableCell sx={{ fontWeight: 600, color: textColor, fontSize: '0.75rem' }}>Field</TableCell>
                <TableCell sx={{ fontWeight: 600, color: textColor, fontSize: '0.75rem' }}>Field Name</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: textColor, fontSize: '0.75rem' }}>YCOA Default</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: textColor, fontSize: '0.75rem' }}>AI Rec</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: textColor, fontSize: '0.75rem' }}>Conf</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: textColor, fontSize: '0.75rem' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockFieldLevelExport.map((row) => {
                const isOverride = row.ycoaDefault !== row.aiRecommendation;
                return (
                  <TableRow
                    key={row.id}
                    sx={{
                      bgcolor: isOverride ? alpha(NAVY_BLUE, darkMode ? 0.08 : 0.03) : 'transparent',
                      '&:hover': { bgcolor: darkMode ? alpha('#fff', 0.03) : alpha('#000', 0.02) }
                    }}
                  >
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: textColor }}>{row.sourceAccount}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, color: MODULE_NAVY }}>{row.targetAccount}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: textSecondary }}>{row.table}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600, color: MODULE_NAVY }}>{row.field}</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', color: textColor }}>{row.fieldName}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.ycoaDefault || '—'}
                        size="small"
                        sx={{
                          minWidth: 32,
                          height: 20,
                          fontSize: '0.65rem',
                          fontFamily: 'monospace',
                          bgcolor: alpha('#6b7280', 0.1),
                          color: textSecondary,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.aiRecommendation || '—'}
                        size="small"
                        sx={{
                          minWidth: 32,
                          height: 20,
                          fontSize: '0.65rem',
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          bgcolor: isOverride ? alpha(NAVY_BLUE, 0.15) : alpha('#10b981', 0.1),
                          color: isOverride ? NAVY_BLUE : '#10b981',
                          border: isOverride ? `1px solid ${alpha(NAVY_BLUE, 0.3)}` : 'none',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${row.confidence}%`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          bgcolor: alpha(getConfidenceColor(row.confidence), 0.1),
                          color: getConfidenceColor(row.confidence),
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {getStatusChip(row.status)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
    );
  };

  // Remediation Section (Governance Mode)
  const renderRemediation = () => (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: alpha(MODULE_NAVY, 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RemediationIcon sx={{ fontSize: 28, color: MODULE_NAVY }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h5" fontWeight={700} sx={{ color: textColor }}>
              Remediation Workbench
            </Typography>
            <Chip label="12 pending" size="small" sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 600, fontSize: '0.7rem' }} />
          </Stack>
          <Typography variant="body2" sx={{ color: textSecondary }}>
            Apply fixes to identified GL master data issues. Changes can be exported or pushed directly to S/4HANA.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" startIcon={<DownloadIcon />} sx={masterDataTheme.buttons.secondary}>
            Export Changes
          </Button>
          <Button variant="contained" size="small" startIcon={<SyncIcon />} sx={masterDataTheme.buttons.primary}>
            Push to S/4HANA
          </Button>
        </Stack>
      </Stack>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha('#ef4444', 0.1), textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={700} sx={{ color: '#ef4444' }}>12</Typography>
            <Typography variant="body2" sx={{ color: textSecondary }}>Critical Pending</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha('#f59e0b', 0.1), textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={700} sx={{ color: '#f59e0b' }}>47</Typography>
            <Typography variant="body2" sx={{ color: textSecondary }}>High Priority</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha('#10b981', 0.1), textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={700} sx={{ color: '#10b981' }}>89</Typography>
            <Typography variant="body2" sx={{ color: textSecondary }}>Resolved This Week</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(MODULE_NAVY, 0.1), textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={700} sx={{ color: MODULE_NAVY }}>72%</Typography>
            <Typography variant="body2" sx={{ color: textSecondary }}>Health Score</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Remediation Actions */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          mb: 3,
          border: `1px solid ${borderColor}`,
          bgcolor: cardBg,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: textColor }}>
          Quick Remediation Actions
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Button variant="outlined" size="small" startIcon={<AIIcon />} sx={masterDataTheme.buttons.secondary}>
            Auto-fix Settings Issues (23)
          </Button>
          <Button variant="outlined" size="small" startIcon={<AIIcon />} sx={masterDataTheme.buttons.secondary}>
            Mark Dormant Accounts (847)
          </Button>
          <Button variant="outlined" size="small" startIcon={<AIIcon />} sx={masterDataTheme.buttons.secondary}>
            Merge Duplicate Clusters (12)
          </Button>
          <Button variant="outlined" size="small" startIcon={<ReportsIcon />} sx={masterDataTheme.buttons.secondary}>
            Generate Remediation Report
          </Button>
        </Stack>
      </Paper>

      {/* Pending Remediation Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: `1px solid ${borderColor}`,
          bgcolor: cardBg,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${borderColor}` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: textColor }}>
              Pending Remediation Items
            </Typography>
            <Button size="small" sx={{ fontSize: '0.75rem' }}>View All</Button>
          </Stack>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: bgColor }}>
                <TableCell sx={{ fontWeight: 600, width: 8 }}></TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Account</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Issue</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Recommended Fix</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { account: '100000', issue: 'Manual Postings to Recon Account', fix: 'Block manual posting (XOPVW = X)', severity: 'critical' },
                { account: '110000', issue: 'BS/P&L Misclassification', fix: 'Change XBILK from blank to X', severity: 'critical' },
                { account: '120000', issue: 'Missing Open Item Flag', fix: 'Set XOPVW = X for clearing account', severity: 'critical' },
              ].map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Box sx={{ width: 4, height: 32, borderRadius: 1, bgcolor: item.severity === 'critical' ? '#ef4444' : '#f59e0b' }} />
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', color: MODULE_NAVY, fontWeight: 600 }}>{item.account}</TableCell>
                  <TableCell>{item.issue}</TableCell>
                  <TableCell>
                    <Chip label={item.fix} size="small" sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Apply Fix">
                        <IconButton size="small" sx={{ color: '#10b981' }}>
                          <ApproveIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" sx={{ color: MODULE_NAVY }}>
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Dismiss">
                        <IconButton size="small" sx={{ color: '#6b7280' }}>
                          <RejectIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'data-ingestion':
        return renderDataIngestion();
      case 'account-matching':
        return renderAccountMatching();
      case 'output-table':
        return renderOutputTable();
      default:
        return renderDashboard();
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', bgcolor: bgColor }}>
      {/* Left Sidebar */}
      <Box
        sx={{
          width: sidebarOpen ? 260 : 64,
          flexShrink: 0,
          bgcolor: darkMode ? '#0a1019' : 'white',
          borderRight: `1px solid ${borderColor}`,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          transition: 'width 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar Header */}
        <Box sx={{ p: sidebarOpen ? 2 : 1, borderBottom: `1px solid ${borderColor}` }}>
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent={sidebarOpen ? 'flex-start' : 'center'}>
            <IconButton
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{
                width: 40,
                height: 40,
                bgcolor: alpha(MODULE_NAVY, 0.1),
                color: MODULE_NAVY,
                '&:hover': { bgcolor: alpha(MODULE_NAVY, 0.2) },
              }}
            >
              {sidebarOpen ? <MenuOpenIcon /> : <MenuIcon />}
            </IconButton>
            {sidebarOpen && (
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: darkMode ? '#e6edf3' : MODULE_NAVY, lineHeight: 1.2 }}>
                  GL.AI
                </Typography>
                <Typography variant="caption" sx={{ color: textSecondary }}>
                  General Ledger Intelligence
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Mode Toggle */}
        {sidebarOpen ? (
          <Box sx={{ p: 2, borderBottom: `1px solid ${borderColor}` }}>
            <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 1 }}>
              Operating Mode
            </Typography>
            <ToggleButtonGroup
              value={operatingMode}
              exclusive
              onChange={handleModeChange}
              size="small"
              fullWidth
              sx={{
                bgcolor: darkMode ? '#0f1724' : '#f1f5f9',
                borderRadius: 2,
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: '8px !important',
                  py: 1,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: textSecondary,
                  '&.Mui-selected': {
                    bgcolor: MODULE_NAVY,
                    color: 'white',
                    '&:hover': { bgcolor: MODULE_NAVY },
                  },
                },
              }}
            >
              <ToggleButton value="migration"><SyncIcon sx={{ fontSize: 16, mr: 0.5 }} /> Migration</ToggleButton>
              <ToggleButton value="governance"><SecurityIcon sx={{ fontSize: 16, mr: 0.5 }} /> Governance</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        ) : (
          <Box sx={{ p: 1, borderBottom: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Migration Mode" placement="right">
              <IconButton
                onClick={() => setOperatingMode('migration')}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: operatingMode === 'migration' ? MODULE_NAVY : 'transparent',
                  color: operatingMode === 'migration' ? 'white' : darkMode ? '#5d7290' : 'text.secondary',
                  '&:hover': { bgcolor: operatingMode === 'migration' ? MODULE_NAVY : alpha(MODULE_NAVY, 0.1) },
                }}
              >
                <SyncIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Governance Mode" placement="right">
              <IconButton
                onClick={() => setOperatingMode('governance')}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: operatingMode === 'governance' ? MODULE_NAVY : 'transparent',
                  color: operatingMode === 'governance' ? 'white' : darkMode ? '#5d7290' : 'text.secondary',
                  '&:hover': { bgcolor: operatingMode === 'governance' ? MODULE_NAVY : alpha(MODULE_NAVY, 0.1) },
                }}
              >
                <SecurityIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Navigation */}
        <Box sx={{ flex: 1, overflow: 'auto', p: sidebarOpen ? 1.5 : 1 }}>
          {sidebarOpen && (
            <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, px: 1, display: 'block', mb: 1 }}>
              Workflow
            </Typography>
          )}
          <List dense disablePadding>
            {sidebarNavItems.map((item) => {
              const displayLabel = operatingMode === 'governance' ? item.governanceLabel : item.label;
              const badgeValue = operatingMode === 'governance' ? item.govBadge : item.badge;
              return (
                <Tooltip key={item.id} title={!sidebarOpen ? displayLabel : ''} placement="right">
                  <ListItemButton
                    selected={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)}
                    sx={{
                      ...masterDataTheme.tabs.sidebarItem(activeSection === item.id, darkMode),
                      mb: 0.5,
                      justifyContent: sidebarOpen ? 'flex-start' : 'center',
                      px: sidebarOpen ? 1 : 1.5,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: sidebarOpen ? 32 : 'auto', justifyContent: 'center' }}>
                      <item.Icon sx={{ fontSize: 18, color: activeSection === item.id ? MODULE_NAVY : darkMode ? '#a0afc4' : 'text.secondary' }} />
                    </ListItemIcon>
                    {sidebarOpen && (
                      <>
                        <ListItemText
                          primary={displayLabel}
                          primaryTypographyProps={{
                            fontSize: '0.8rem',
                            fontWeight: activeSection === item.id ? 600 : 500,
                            color: activeSection === item.id ? MODULE_NAVY : darkMode ? '#a0afc4' : 'text.secondary',
                          }}
                        />
                        {badgeValue && (
                          <Chip
                            label={badgeValue}
                            size="small"
                            sx={{
                              height: 20,
                              minWidth: 28,
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              bgcolor: alpha(badgeValue > 20 ? '#f59e0b' : '#ef4444', 0.1),
                              color: badgeValue > 20 ? '#f59e0b' : '#ef4444',
                            }}
                          />
                        )}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>
              );
            })}
          </List>

          {sidebarOpen && (
            <Typography variant="caption" sx={{ color: textSecondary, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, px: 1, display: 'block', mb: 1, mt: 2 }}>
              Tools
            </Typography>
          )}
          {!sidebarOpen && <Divider sx={{ my: 1, borderColor: borderColor }} />}
          <List dense disablePadding>
            {toolsNavItems.map((item) => (
              <Tooltip key={item.id} title={!sidebarOpen ? item.label : ''} placement="right">
                <ListItemButton
                  sx={{
                    ...masterDataTheme.tabs.sidebarItem(false, darkMode),
                    mb: 0.5,
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    px: sidebarOpen ? 1 : 1.5,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: sidebarOpen ? 32 : 'auto', justifyContent: 'center' }}>
                    <item.Icon sx={{ fontSize: 18, color: darkMode ? '#a0afc4' : 'text.secondary' }} />
                  </ListItemIcon>
                  {sidebarOpen && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color: darkMode ? '#a0afc4' : 'text.secondary',
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            ))}
          </List>
        </Box>

        {/* Sidebar Footer - System Status */}
        <Box sx={{ p: sidebarOpen ? 2 : 1, borderTop: `1px solid ${borderColor}` }}>
          {sidebarOpen ? (
            <Box sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: darkMode ? '#0f1724' : '#f8fafc',
              border: `1px solid ${borderColor}`,
            }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: '#10b981',
                    boxShadow: '0 0 10px #10b981',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                    },
                  }}
                />
                <Box>
                  <Typography variant="caption" fontWeight={600} sx={{ color: textColor, display: 'block' }}>
                    Connected
                  </Typography>
                  <Typography variant="caption" sx={{ color: textSecondary }}>
                    S4D/100 • PRD
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ) : (
            <Tooltip title="Connected - S4D/100 • PRD" placement="right">
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: '#10b981',
                    boxShadow: '0 0 10px #10b981',
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                    },
                  }}
                />
              </Box>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Bar */}
        <Paper
          elevation={0}
          sx={{
            px: 3,
            py: 1.5,
            borderBottom: `1px solid ${borderColor}`,
            bgcolor: darkMode ? '#0d1117' : 'white',
            backdropFilter: 'blur(20px)',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              <Link
                component="button"
                underline="hover"
                color="inherit"
                onClick={onBack}
                sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}
              >
                MASTER.AI
              </Link>
              <Link
                component="button"
                underline="hover"
                color="inherit"
                onClick={onBack}
                sx={{ cursor: 'pointer', fontSize: '0.85rem', color: textSecondary }}
              >
                GL.AI
              </Link>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: textColor }}>
                {sidebarNavItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </Typography>
            </Breadcrumbs>

            <Button
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              sx={{ color: textSecondary }}
            >
              Back
            </Button>
          </Stack>
        </Paper>

        {/* Page Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {renderContent()}
        </Box>
      </Box>

      {/* AI Insight Drawer - Evidence Breakdown */}
      <Drawer
        anchor="right"
        open={Boolean(selectedFieldForInsight)}
        onClose={() => setSelectedFieldForInsight(null)}
        PaperProps={{
          sx: {
            width: 420,
            bgcolor: cardBg,
            borderLeft: `1px solid ${borderColor}`,
          }
        }}
      >
        {selectedFieldForInsight && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Drawer Header */}
            <Box sx={{
              p: 2.5,
              borderBottom: `1px solid ${borderColor}`,
              bgcolor: darkMode ? alpha(MODULE_NAVY, 0.1) : alpha(MODULE_NAVY, 0.03),
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(MODULE_NAVY, 0.15) }}>
                    <AIIcon sx={{ fontSize: 22, color: MODULE_NAVY }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: textColor, lineHeight: 1.2 }}>
                      AI Insight
                    </Typography>
                    <Typography variant="caption" sx={{ color: textSecondary }}>
                      Field Recommendation Evidence
                    </Typography>
                  </Box>
                </Stack>
                <IconButton onClick={() => setSelectedFieldForInsight(null)} size="small">
                  <RejectIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Stack>
            </Box>

            {/* Field Info */}
            <Box sx={{ p: 2.5, borderBottom: `1px solid ${borderColor}` }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="overline" sx={{ color: textSecondary, fontSize: '0.65rem' }}>
                    Table / Field
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={selectedFieldForInsight.table}
                      size="small"
                      sx={{ fontFamily: 'monospace', bgcolor: alpha('#6b7280', 0.1), color: textSecondary }}
                    />
                    <Typography variant="h6" fontWeight={700} sx={{ color: MODULE_NAVY, fontFamily: 'monospace' }}>
                      {selectedFieldForInsight.field}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: textColor, mt: 0.5 }}>
                    {selectedFieldForInsight.fieldName}
                  </Typography>
                </Box>

                <Divider />

                {/* Value Comparison */}
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: alpha('#6b7280', 0.05), borderRadius: 2, border: `1px solid ${alpha('#6b7280', 0.1)}` }}>
                      <Typography variant="overline" sx={{ color: textSecondary, fontSize: '0.6rem' }}>
                        YCOA Default
                      </Typography>
                      <Typography variant="h5" fontWeight={700} sx={{ color: textSecondary, fontFamily: 'monospace' }}>
                        {selectedFieldForInsight.ycoaDefault || '—'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{
                      p: 1.5,
                      bgcolor: selectedFieldForInsight.ycoaDefault !== selectedFieldForInsight.aiRecommendation
                        ? alpha(NAVY_BLUE, 0.08)
                        : alpha('#10b981', 0.08),
                      borderRadius: 2,
                      border: `1px solid ${selectedFieldForInsight.ycoaDefault !== selectedFieldForInsight.aiRecommendation
                        ? alpha(NAVY_BLUE, 0.2)
                        : alpha('#10b981', 0.2)}`
                    }}>
                      <Typography variant="overline" sx={{ color: textSecondary, fontSize: '0.6rem' }}>
                        AI Recommendation
                      </Typography>
                      <Typography variant="h5" fontWeight={700} sx={{
                        color: selectedFieldForInsight.ycoaDefault !== selectedFieldForInsight.aiRecommendation ? NAVY_BLUE : '#10b981',
                        fontFamily: 'monospace'
                      }}>
                        {selectedFieldForInsight.aiRecommendation || '—'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Confidence */}
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="overline" sx={{ color: textSecondary, fontSize: '0.65rem' }}>
                      Confidence Score
                    </Typography>
                    <Chip
                      label={`${selectedFieldForInsight.confidence}%`}
                      size="small"
                      sx={{
                        bgcolor: alpha(getConfidenceColor(selectedFieldForInsight.confidence), 0.15),
                        color: getConfidenceColor(selectedFieldForInsight.confidence),
                        fontWeight: 700,
                      }}
                    />
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={selectedFieldForInsight.confidence}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(getConfidenceColor(selectedFieldForInsight.confidence), 0.1),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getConfidenceColor(selectedFieldForInsight.confidence),
                        borderRadius: 4,
                      }
                    }}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Rationale */}
            <Box sx={{ p: 2.5, borderBottom: `1px solid ${borderColor}` }}>
              <Typography variant="overline" sx={{ color: textSecondary, fontSize: '0.65rem', display: 'block', mb: 1 }}>
                AI Rationale
              </Typography>
              <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(MODULE_NAVY, 0.05), borderRadius: 2, border: `1px solid ${alpha(MODULE_NAVY, 0.1)}`, ...masterDataTheme.borders.cardAccent(NAVY_BLUE) }}>
                <Typography variant="body2" sx={{ color: textColor, lineHeight: 1.6 }}>
                  {selectedFieldForInsight.rationale}
                </Typography>
              </Paper>
            </Box>

            {/* Evidence Breakdown */}
            <Box sx={{ p: 2.5, flex: 1 }}>
              <Typography variant="overline" sx={{ color: textSecondary, fontSize: '0.65rem', display: 'block', mb: 1.5 }}>
                Evidence Signals ({selectedFieldForInsight.evidence?.length || 0})
              </Typography>
              <Stack spacing={1}>
                {selectedFieldForInsight.evidence?.map((item, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      bgcolor: bgColor,
                      borderRadius: 2,
                      border: `1px solid ${borderColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: alpha(MODULE_NAVY, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Typography variant="caption" fontWeight={700} sx={{ color: MODULE_NAVY }}>
                        {index + 1}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: textColor }}>
                      {item}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Box>

            {/* Governance Status Footer */}
            <Box sx={{
              p: 2,
              borderTop: `1px solid ${borderColor}`,
              bgcolor: bgColor,
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" sx={{ color: textSecondary }}>
                    Status:
                  </Typography>
                  {getStatusChip(selectedFieldForInsight.status)}
                </Stack>
                {selectedFieldForInsight.status === 'proposed' && (
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<RejectIcon />}
                      sx={{ ...masterDataTheme.buttons.danger, fontSize: '0.75rem' }}
                    >
                      Reject
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<ApproveIcon />}
                      sx={{ ...masterDataTheme.buttons.success, fontSize: '0.75rem' }}
                    >
                      Approve
                    </Button>
                  </Stack>
                )}
              </Stack>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default GLAIModule;
