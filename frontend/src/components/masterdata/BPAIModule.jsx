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
  LinearProgress,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Drawer,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  CloudUpload as UploadIcon,
  Visibility as PreviewIcon,
  RocketLaunch as CreateIcon,
  Link as LinkIcon,
  ContentCopy as DuplicateIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  Assessment as ReportsIcon,
  FiberManualRecord as DotIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  People as PeopleIcon,
  Description as FileIcon,
  ArrowForward as ArrowForwardIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  AutoFixHigh as AIIcon,
  Business as BusinessIcon,
  Store as VendorIcon,
  Person as CustomerIcon,
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Groups as GroupsIcon,
  MergeType as MergeIcon,
  Block as BlockIcon,
  Speed as SpeedIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Visibility as ViewEvidenceIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
} from '@mui/icons-material';

import { MODULE_COLOR, getColors as getBrandColors } from '../../config/brandColors';

// Use consistent navy blue theme
const BP_COLOR = MODULE_COLOR;

// Get consistent colors based on dark mode - same pattern as STOX components
const getColors = (darkMode) => ({
  ...getBrandColors(darkMode),
  // Additional component-specific colors if needed
});

// Sidebar navigation items - Workflow
const workflowNavItems = [
  { id: 'dashboard', label: 'Dashboard', Icon: DashboardIcon, badge: null },
  { id: 'data-upload', label: 'Data Upload & Scope', Icon: UploadIcon, badge: null },
  { id: 'preview-review', label: 'Preview & Review', Icon: PreviewIcon, badge: 47, badgeColor: 'warning' },
  { id: 'create-bps', label: 'Create BPs', Icon: CreateIcon, badge: null },
];

// Sidebar navigation items - Analysis
const analysisNavItems = [
  { id: 'entity-resolution', label: 'Entity Resolution', Icon: LinkIcon, badge: null },
  { id: 'duplicate-clusters', label: 'Duplicate Clusters', Icon: DuplicateIcon, badge: 23, badgeColor: 'success' },
  { id: 'data-quality', label: 'Data Quality Issues', Icon: WarningIcon, badge: 12, badgeColor: 'error' },
];

// Sidebar navigation items - Tools
const toolsNavItems = [
  { id: 'partner-lookup', label: 'Partner Lookup', Icon: SearchIcon },
  { id: 'reports', label: 'Reports', Icon: ReportsIcon },
];

// Upload cards configuration - matching HTML with SAP table names
const customerUploadCards = [
  { id: 'kna1', title: 'Customer General (KNA1)', description: 'Name, address, tax ID, phone', required: true, sapTable: 'KNA1' },
  { id: 'knb1', title: 'Company Code (KNB1)', description: 'Payment terms, reconciliation acct', required: false, sapTable: 'KNB1' },
  { id: 'knvv', title: 'Sales Area (KNVV)', description: 'Sales org, incoterms, currency', required: false, sapTable: 'KNVV' },
];

const vendorUploadCards = [
  { id: 'lfa1', title: 'Vendor General (LFA1)', description: 'Name, address, tax ID, phone', required: true, sapTable: 'LFA1' },
  { id: 'lfb1', title: 'Company Code (LFB1)', description: 'Payment terms, recon account', required: false, sapTable: 'LFB1' },
  { id: 'lfm1', title: 'Purchasing (LFM1)', description: 'Purch org, currency', required: false, sapTable: 'LFM1' },
];

const transactionCards = [
  { id: 'fi-items', title: 'FI Line Items (BSEG/BSID/BSIK)', description: 'AR/AP documents, amounts', required: true, sapTable: 'BSEG' },
  { id: 'payments', title: 'Payments (REGUH)', description: 'Payment runs, bank details', required: false, sapTable: 'REGUH' },
];

// Step indicator data
const workflowSteps = [
  { id: 'data-upload', label: 'Data Upload & Scope', step: 1 },
  { id: 'preview-review', label: 'Preview & Review', step: 2 },
  { id: 'create-bps', label: 'Create BPs', step: 3 },
];

// Mock BP cluster data with field-level recommendations
const mockBPClustersWithFields = [
  {
    id: 'BP-0001',
    name: 'Acme Industries Inc',
    searchTerm: 'ACMEINDUSTR',
    custCount: 2,
    vendCount: 1,
    location: 'New York, NY',
    taxId: '12-3456789',
    confidence: 98,
    status: 'auto',
    docs: 247,
    value: '$1.2M',
    fieldsOverridden: 2,
    fieldsTotal: 5,
    fields: [
      { id: 'BP1-1', table: 'BUT000', field: 'BU_GROUP', fieldName: 'BP Grouping', sourceValue: 'Z001/Z002', aiRecommendation: 'BPGR01', confidence: 96, rationale: 'Large corporate entity with multi-subsidiary structure', evidence: ['Annual revenue: $45M', 'Subsidiary count: 3', 'Industry: Manufacturing'], status: 'approved' },
      { id: 'BP1-2', table: 'BUT000', field: 'BU_SORT1', fieldName: 'Search Term', sourceValue: 'ACME IND/ACME', aiRecommendation: 'ACMEINDUSTR', confidence: 99, rationale: 'Standardized from name patterns across sources', evidence: ['Name variants: 3', 'Most frequent: ACME IND', 'Standardized: ACMEINDUSTR'], status: 'approved' },
      { id: 'BP1-3', table: 'BUT000', field: 'BPKIND', fieldName: 'BP Category', sourceValue: 'Cust/Vend', aiRecommendation: 'DUAL', confidence: 98, rationale: 'Both customer and vendor transactions detected', evidence: ['AR transactions: 187', 'AP transactions: 60', 'Net position: Receivable'], status: 'approved' },
      { id: 'BP1-4', table: 'KNVV', field: 'ZTERM', fieldName: 'Payment Terms', sourceValue: 'NT30/NT45', aiRecommendation: 'NT30', confidence: 87, rationale: 'Dominant payment term in 78% of invoices', evidence: ['NT30 usage: 78%', 'NT45 usage: 22%', 'Avg payment: 28 days'], status: 'proposed' },
      { id: 'BP1-5', table: 'KNVV', field: 'PARVW', fieldName: 'Partner Function', sourceValue: 'AG/WE', aiRecommendation: 'AG', confidence: 92, rationale: 'Sold-to party dominant in sales transactions', evidence: ['Sold-to: 92%', 'Ship-to: 8%', 'Order count: 187'], status: 'proposed' },
    ]
  },
  {
    id: 'BP-0002',
    name: 'Global Manufacturing Corp',
    searchTerm: 'GLOBALMFG',
    custCount: 3,
    vendCount: 0,
    location: 'Chicago, IL',
    taxId: '—',
    confidence: 78,
    status: 'review',
    docs: 89,
    value: '$456k',
    fieldsOverridden: 3,
    fieldsTotal: 5,
    fields: [
      { id: 'BP2-1', table: 'BUT000', field: 'BU_GROUP', fieldName: 'BP Grouping', sourceValue: 'Z003', aiRecommendation: 'BPGR02', confidence: 82, rationale: 'Mid-market manufacturing company', evidence: ['Annual revenue: $12M', 'Entity type: Corporation', 'Industry: Manufacturing'], status: 'review' },
      { id: 'BP2-2', table: 'BUT000', field: 'BU_SORT1', fieldName: 'Search Term', sourceValue: 'GLOBAL MFG/GMC', aiRecommendation: 'GLOBALMFG', confidence: 94, rationale: 'Standardized from most frequent name variant', evidence: ['Name variants: 4', 'Conflicts: 1 (GMC)', 'Resolution: Use full name'], status: 'approved' },
      { id: 'BP2-3', table: 'BUT000', field: 'BPKIND', fieldName: 'BP Category', sourceValue: 'Cust', aiRecommendation: 'CUST', confidence: 99, rationale: 'Customer-only transaction pattern', evidence: ['AR transactions: 89', 'AP transactions: 0', 'Customer master: 3 records'], status: 'approved' },
      { id: 'BP2-4', table: 'KNVV', field: 'ZTERM', fieldName: 'Payment Terms', sourceValue: 'NT60/NT90', aiRecommendation: 'NT60', confidence: 72, rationale: 'Mixed payment terms - recommend dominant', evidence: ['NT60 usage: 55%', 'NT90 usage: 45%', 'Avg payment: 67 days'], status: 'review' },
      { id: 'BP2-5', table: 'KNA1', field: 'AKONT', fieldName: 'Recon Account', sourceValue: '110000/110010', aiRecommendation: '110000', confidence: 88, rationale: 'Primary AR reconciliation account', evidence: ['110000 usage: 85%', '110010 usage: 15%', 'Balance: $456k'], status: 'proposed' },
    ]
  },
  {
    id: 'BP-0003',
    name: 'Premier Supplies LLC',
    searchTerm: 'PREMIERSUP',
    custCount: 0,
    vendCount: 1,
    location: 'Los Angeles, CA',
    taxId: '98-7654321',
    confidence: 95,
    status: 'auto',
    docs: 156,
    value: '$892k',
    fieldsOverridden: 1,
    fieldsTotal: 5,
    fields: [
      { id: 'BP3-1', table: 'BUT000', field: 'BU_GROUP', fieldName: 'BP Grouping', sourceValue: 'ZVEN', aiRecommendation: 'BPGR03', confidence: 94, rationale: 'Vendor/supplier entity classification', evidence: ['Entity type: LLC', 'Industry: Wholesale', 'Vendor only'], status: 'approved' },
      { id: 'BP3-2', table: 'BUT000', field: 'BU_SORT1', fieldName: 'Search Term', sourceValue: 'PREMIER SUP', aiRecommendation: 'PREMIERSUP', confidence: 98, rationale: 'Single source - standardized format', evidence: ['Source count: 1', 'Name: Premier Supplies LLC', 'No conflicts'], status: 'approved' },
      { id: 'BP3-3', table: 'BUT000', field: 'BPKIND', fieldName: 'BP Category', sourceValue: 'Vend', aiRecommendation: 'VEND', confidence: 99, rationale: 'Vendor-only transaction pattern', evidence: ['AR transactions: 0', 'AP transactions: 156', 'Vendor master: 1 record'], status: 'approved' },
      { id: 'BP3-4', table: 'LFB1', field: 'ZTERM', fieldName: 'Payment Terms', sourceValue: 'NT30', aiRecommendation: 'NT30', confidence: 99, rationale: 'Consistent payment terms across all invoices', evidence: ['NT30 usage: 100%', 'Avg payment: 29 days', 'On-time: 94%'], status: 'approved' },
      { id: 'BP3-5', table: 'LFA1', field: 'AKONT', fieldName: 'Recon Account', sourceValue: '200000', aiRecommendation: '200010', confidence: 85, rationale: 'Recommend trade payables sub-account', evidence: ['Current: 200000', 'Recommended: 200010', 'Based on vendor category'], status: 'proposed' },
    ]
  },
  {
    id: 'BP-0004',
    name: 'TechCorp Solutions',
    searchTerm: 'TECHCORP',
    custCount: 1,
    vendCount: 2,
    location: 'Austin, TX',
    taxId: '55-1234567',
    confidence: 92,
    status: 'auto',
    docs: 312,
    value: '$2.1M',
    fieldsOverridden: 2,
    fieldsTotal: 5,
    fields: [
      { id: 'BP4-1', table: 'BUT000', field: 'BU_GROUP', fieldName: 'BP Grouping', sourceValue: 'Z001/ZVEN', aiRecommendation: 'BPGR01', confidence: 91, rationale: 'Technology company with dual relationship', evidence: ['Industry: Technology', 'Customer: Software', 'Vendor: IT Services'], status: 'approved' },
      { id: 'BP4-2', table: 'BUT000', field: 'BU_SORT1', fieldName: 'Search Term', sourceValue: 'TECHCORP/TC SOL', aiRecommendation: 'TECHCORP', confidence: 96, rationale: 'Primary brand name standardized', evidence: ['Name variants: 2', 'Primary: TechCorp', 'Alias: TC Solutions'], status: 'approved' },
      { id: 'BP4-3', table: 'BUT000', field: 'BPKIND', fieldName: 'BP Category', sourceValue: 'Cust/Vend', aiRecommendation: 'DUAL', confidence: 97, rationale: 'Both customer and vendor transactions detected', evidence: ['AR transactions: 98', 'AP transactions: 214', 'Net position: Payable'], status: 'approved' },
      { id: 'BP4-4', table: 'KNVV', field: 'ZTERM', fieldName: 'Payment Terms', sourceValue: 'NT15/NT30', aiRecommendation: 'NT15', confidence: 84, rationale: 'Shorter payment terms dominant', evidence: ['NT15 usage: 72%', 'NT30 usage: 28%', 'Avg payment: 18 days'], status: 'proposed' },
      { id: 'BP4-5', table: 'BUT000', field: 'PARTNEREXT', fieldName: 'External ID', sourceValue: 'TC-001/V-4521', aiRecommendation: 'TC-001', confidence: 89, rationale: 'Customer ID preferred for dual-role BPs', evidence: ['Customer ID: TC-001', 'Vendor ID: V-4521', 'Primary: Customer'], status: 'proposed' },
    ]
  },
  {
    id: 'BP-0005',
    name: 'Regional Distributors Inc',
    searchTerm: 'REGIONDIST',
    custCount: 4,
    vendCount: 0,
    location: 'Miami, FL',
    taxId: '—',
    confidence: 65,
    status: 'must-review',
    docs: 45,
    value: '$123k',
    fieldsOverridden: 4,
    fieldsTotal: 5,
    fields: [
      { id: 'BP5-1', table: 'BUT000', field: 'BU_GROUP', fieldName: 'BP Grouping', sourceValue: 'Z001/Z002/Z003', aiRecommendation: 'BPGR02', confidence: 58, rationale: 'Multiple groupings detected - needs review', evidence: ['Source groups: 3', 'Conflicting assignments', 'Manual review required'], status: 'review' },
      { id: 'BP5-2', table: 'BUT000', field: 'BU_SORT1', fieldName: 'Search Term', sourceValue: 'REG DIST/REGIONAL/RDI', aiRecommendation: 'REGIONDIST', confidence: 72, rationale: 'Multiple name variants - standardized', evidence: ['Name variants: 5', 'Potential duplicates', 'Low confidence match'], status: 'review' },
      { id: 'BP5-3', table: 'BUT000', field: 'BPKIND', fieldName: 'BP Category', sourceValue: 'Cust', aiRecommendation: 'CUST', confidence: 95, rationale: 'Customer-only transactions', evidence: ['AR transactions: 45', 'AP transactions: 0', 'Customer master: 4 records'], status: 'approved' },
      { id: 'BP5-4', table: 'KNVV', field: 'ZTERM', fieldName: 'Payment Terms', sourceValue: 'NT30/NT45/NT60', aiRecommendation: 'NT45', confidence: 62, rationale: 'Median payment term selected', evidence: ['NT30: 25%', 'NT45: 40%', 'NT60: 35%'], status: 'review' },
      { id: 'BP5-5', table: 'KNA1', field: 'STCD1', fieldName: 'Tax Number 1', sourceValue: '—', aiRecommendation: 'MISSING', confidence: 45, rationale: 'Tax ID missing - compliance risk', evidence: ['Tax ID: Not found', 'Required for US entity', 'Action: Request from customer'], status: 'review' },
    ]
  },
  {
    id: 'BP-0006',
    name: 'United Services Group',
    searchTerm: 'UNITEDSVC',
    custCount: 2,
    vendCount: 1,
    location: 'Seattle, WA',
    taxId: '77-9876543',
    confidence: 88,
    status: 'review',
    docs: 178,
    value: '$1.5M',
    fieldsOverridden: 2,
    fieldsTotal: 5,
    fields: [
      { id: 'BP6-1', table: 'BUT000', field: 'BU_GROUP', fieldName: 'BP Grouping', sourceValue: 'Z001/ZVEN', aiRecommendation: 'BPGR01', confidence: 86, rationale: 'Services company with dual relationship', evidence: ['Industry: Services', 'Customer: Consulting', 'Vendor: Outsourcing'], status: 'approved' },
      { id: 'BP6-2', table: 'BUT000', field: 'BU_SORT1', fieldName: 'Search Term', sourceValue: 'UNITED SVC/USG', aiRecommendation: 'UNITEDSVC', confidence: 94, rationale: 'Primary name standardized', evidence: ['Name variants: 2', 'Primary: United Services', 'No conflicts'], status: 'approved' },
      { id: 'BP6-3', table: 'BUT000', field: 'BPKIND', fieldName: 'BP Category', sourceValue: 'Cust/Vend', aiRecommendation: 'DUAL', confidence: 96, rationale: 'Both customer and vendor transactions', evidence: ['AR transactions: 112', 'AP transactions: 66', 'Net position: Receivable'], status: 'approved' },
      { id: 'BP6-4', table: 'KNVV', field: 'ZTERM', fieldName: 'Payment Terms', sourceValue: 'NT30/NT45', aiRecommendation: 'NT30', confidence: 78, rationale: 'NT30 dominant but mixed', evidence: ['NT30 usage: 65%', 'NT45 usage: 35%', 'Avg payment: 34 days'], status: 'review' },
      { id: 'BP6-5', table: 'KNVV', field: 'PARVW', fieldName: 'Partner Function', sourceValue: 'AG/RE/WE', aiRecommendation: 'AG', confidence: 82, rationale: 'Multiple partner functions - sold-to dominant', evidence: ['Sold-to: 70%', 'Payer: 20%', 'Ship-to: 10%'], status: 'proposed' },
    ]
  },
];

// Legacy format for backward compatibility
const mockBPClusters = mockBPClustersWithFields.map(bp => ({
  id: bp.id,
  name: bp.name,
  searchTerm: bp.searchTerm,
  custCount: bp.custCount,
  vendCount: bp.vendCount,
  location: bp.location,
  taxId: bp.taxId,
  confidence: bp.confidence,
  status: bp.status,
  docs: bp.docs,
  value: bp.value,
}));

const BPAIModule = ({ onBack, darkMode = false }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploading, setUploading] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedRowIds, setExpandedRowIds] = useState([]);
  const [selectedFieldForInsight, setSelectedFieldForInsight] = useState(null);

  // Get consistent colors based on dark mode
  const colors = getColors(darkMode);

  const toggleRowExpansion = (rowId) => {
    setExpandedRowIds(prev =>
      prev.includes(rowId)
        ? prev.filter(id => id !== rowId)
        : [...prev, rowId]
    );
  };

  const handleFileUpload = (cardId) => {
    setUploading(cardId);
    setTimeout(() => {
      setUploadedFiles(prev => ({
        ...prev,
        [cardId]: {
          name: `${cardId.toUpperCase()}_export.xlsx`,
          rows: Math.floor(Math.random() * 5000) + 2000,
          uploadedAt: new Date().toLocaleTimeString(),
        }
      }));
      setUploading(null);
    }, 1500);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return '#10b981';
    if (confidence >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusChip = (status) => {
    const config = {
      auto: { color: '#10b981', label: 'Auto', bg: 'rgba(16, 185, 129, 0.1)', Icon: CheckIcon },
      review: { color: '#f59e0b', label: 'Review', bg: 'rgba(245, 158, 11, 0.1)', Icon: WarningIcon },
      'must-review': { color: '#ef4444', label: 'Must Review', bg: 'rgba(239, 68, 68, 0.1)', Icon: ErrorIcon },
    };
    const { color, label, bg, Icon } = config[status] || config.review;
    return (
      <Chip
        icon={<Icon sx={{ fontSize: 14, color: `${color} !important` }} />}
        label={label}
        size="small"
        sx={{ bgcolor: bg, color: color, fontWeight: 600, fontSize: '0.7rem' }}
      />
    );
  };

  const getBadgeColor = (colorName) => {
    const colors = {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    };
    return colors[colorName] || colors.warning;
  };

  // Field status chip for field-level recommendations
  const getFieldStatusChip = (status) => {
    const config = {
      approved: { color: '#10b981', label: 'Approved' },
      review: { color: '#f59e0b', label: 'Review' },
      proposed: { color: '#3b82f6', label: 'Proposed' },
      rejected: { color: '#ef4444', label: 'Rejected' },
    };
    const { color, label } = config[status] || config.review;
    return (
      <Chip
        label={label}
        size="small"
        sx={{
          bgcolor: alpha(color, 0.1),
          color: color,
          fontWeight: 600,
          fontSize: '0.65rem',
        }}
      />
    );
  };

  // Field-level expansion panel for BP clusters
  const renderFieldExpansion = (bp) => {
    if (!bp || !bp.fields) return null;

    return (
      <Box sx={{
        p: 2,
        bgcolor: darkMode ? 'rgba(0,53,122,0.08)' : 'rgba(0,53,122,0.03)',
        borderTop: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <AIIcon sx={{ fontSize: 18, color: BP_COLOR }} />
          <Typography variant="subtitle2" fontWeight={600} sx={{ color: colors.text }}>
            Field-Level AI Recommendations for {bp.name}
          </Typography>
          <Chip
            label={`${bp.fields.filter(f => f.status === 'proposed' || f.status === 'review').length} requiring action`}
            size="small"
            sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 600, fontSize: '0.65rem' }}
          />
        </Stack>

        <TableContainer component={Paper} elevation={0} sx={{ bgcolor: colors.paper, border: `1px solid ${colors.border}`, borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: colors.background }}>
                <TableCell sx={{ fontWeight: 600, color: colors.text, fontSize: '0.75rem', py: 1 }}>Table</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.text, fontSize: '0.75rem', py: 1 }}>Field</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.text, fontSize: '0.75rem', py: 1 }}>Field Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.text, fontSize: '0.75rem', py: 1 }}>Source Value(s)</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: colors.text, fontSize: '0.75rem', py: 1 }}>AI Recommendation</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: colors.text, fontSize: '0.75rem', py: 1 }}>Confidence</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.text, fontSize: '0.75rem', py: 1 }}>Rationale</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: colors.text, fontSize: '0.75rem', py: 1 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: colors.text, fontSize: '0.75rem', py: 1 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bp.fields.map((field) => {
                const needsAction = field.status === 'proposed' || field.status === 'review';
                return (
                  <TableRow
                    key={field.id}
                    sx={{
                      bgcolor: needsAction ? alpha('#f59e0b', darkMode ? 0.08 : 0.03) : 'transparent',
                      '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }
                    }}
                  >
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: colors.textSecondary, py: 1 }}>
                      {field.table}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600, color: BP_COLOR, py: 1 }}>
                      {field.field}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', color: colors.text, py: 1 }}>
                      {field.fieldName}
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: colors.textSecondary, fontSize: '0.7rem' }}>
                        {field.sourceValue}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Chip
                        label={field.aiRecommendation}
                        size="small"
                        sx={{
                          minWidth: 50,
                          height: 22,
                          fontSize: '0.7rem',
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          bgcolor: alpha(BP_COLOR, 0.15),
                          color: BP_COLOR,
                          border: `1px solid ${alpha(BP_COLOR, 0.3)}`,
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
                    <TableCell sx={{ fontSize: '0.7rem', color: colors.textSecondary, py: 1, maxWidth: 180 }}>
                      <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.3 }}>
                        {field.rationale}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      {getFieldStatusChip(field.status)}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1 }}>
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="View Evidence">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFieldForInsight(field);
                            }}
                            sx={{ color: BP_COLOR }}
                          >
                            <ViewEvidenceIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        {(field.status === 'proposed' || field.status === 'review') && (
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

  // Dashboard metrics data
  const dashboardMetrics = [
    { label: 'Legacy Customers', value: '5,847', Icon: CustomerIcon, color: '#3b82f6' },
    { label: 'Legacy Vendors', value: '3,256', Icon: VendorIcon, color: '#8b5cf6' },
    { label: 'Proposed BPs', value: '3,847', Icon: GroupsIcon, color: BP_COLOR },
    { label: 'Consolidation Rate', value: '58%', Icon: MergeIcon, color: '#10b981' },
  ];

  const insightsData = [
    { label: 'High Confidence (≥90%)', value: 3124, total: 3847, color: '#10b981' },
    { label: 'Medium (70-89%)', value: 576, total: 3847, color: '#f59e0b' },
    { label: 'Low (<70%)', value: 147, total: 3847, color: '#ef4444' },
  ];

  // Dashboard metrics styled like Inventory Health Check
  const bpDashboardMetrics = [
    { label: 'CUSTOMERS', value: '5,847', color: '#3b82f6' },
    { label: 'VENDORS', value: '3,256', color: '#8b5cf6' },
    { label: 'PROPOSED BPS', value: '3,847', color: '#0ea5a9' },
    { label: 'DUPLICATES', value: '423', color: '#ef4444' },
    { label: 'CONSOLIDATION', value: '58%', color: '#10b981' },
    { label: 'TOTAL VALUE', value: '$142.7M', color: '#00357a' },
  ];

  // Dashboard Section
  const renderDashboard = () => (
    <Box>
      {/* Header with icon - matching Inventory Health Check */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: alpha('#0ea5a9', 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PeopleIcon sx={{ fontSize: 28, color: '#0ea5a9' }} />
        </Box>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
              BP Migration Dashboard
            </Typography>
            <Chip label="Demo Data" size="small" icon={<WarningIcon sx={{ fontSize: 14 }} />} sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 600, fontSize: '0.7rem' }} />
          </Stack>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Overview of Business Partner consolidation and migration readiness metrics
          </Typography>
        </Box>
      </Stack>

      {/* Metrics Row - matching Inventory Health Check style */}
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${colors.border}`,
          bgcolor: colors.paper,
          overflow: 'hidden',
        }}
      >
        <Grid container>
          {bpDashboardMetrics.map((metric, index) => (
            <Grid
              item
              xs={6}
              md={2}
              key={index}
              sx={{
                borderRight: index < bpDashboardMetrics.length - 1 ? `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` : 'none',
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: metric.color, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
                  {metric.label}
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color: metric.color }}>
                  {metric.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Insights Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Consolidation Progress */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${colors.border}`,
              bgcolor: colors.paper,
              height: '100%',
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: colors.text }}>
              Consolidation Progress
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: `conic-gradient(${BP_COLOR} 0deg, ${BP_COLOR} ${58 * 3.6}deg, ${darkMode ? '#1e2d42' : '#e5e7eb'} ${58 * 3.6}deg)`,
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
                      bgcolor: colors.paper,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h4" fontWeight={700} sx={{ color: BP_COLOR }}>
                      58<Typography component="span" variant="body2" sx={{ color: colors.textSecondary }}>%</Typography>
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: colors.textSecondary, textAlign: 'center' }}>
                9,103 legacy records → 3,847 BPs
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Confidence Distribution */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${colors.border}`,
              bgcolor: colors.paper,
              height: '100%',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <BarChartIcon sx={{ color: BP_COLOR, fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text }}>
                Confidence Distribution
              </Typography>
            </Stack>
            <Stack spacing={2}>
              {insightsData.map((item, index) => (
                <Box key={index}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: item.color }}>
                      {item.value.toLocaleString()}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={(item.value / item.total) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: alpha(item.color, 0.15),
                      '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: 1 },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Key Insights */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${colors.border}`,
              bgcolor: colors.paper,
              height: '100%',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <AIIcon sx={{ color: BP_COLOR, fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text }}>
                AI Insights
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: darkMode ? '#0f1724' : '#f8fafc' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <MergeIcon sx={{ fontSize: 18, color: '#10b981' }} />
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    <strong>423</strong> duplicate clusters detected
                  </Typography>
                </Stack>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: darkMode ? '#0f1724' : '#f8fafc' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <BlockIcon sx={{ fontSize: 18, color: '#ef4444' }} />
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    <strong>147</strong> exclusion candidates
                  </Typography>
                </Stack>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: darkMode ? '#0f1724' : '#f8fafc' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SpeedIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    <strong>$142.7M</strong> total transaction value
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${colors.border}`,
          bgcolor: colors.paper,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AIIcon sx={{ color: BP_COLOR, fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text }}>
              Quick Actions
            </Typography>
          </Stack>
        </Box>
        <Box sx={{ p: 2 }}>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" size="small" startIcon={<UploadIcon />} onClick={() => setActiveSection('data-upload')} sx={{ borderColor: 'divider' }}>
              Upload Data
            </Button>
            <Button variant="outlined" size="small" startIcon={<PreviewIcon />} onClick={() => setActiveSection('preview-review')} sx={{ borderColor: 'divider' }}>
              Review Clusters
            </Button>
            <Button variant="outlined" size="small" startIcon={<CreateIcon />} onClick={() => setActiveSection('create-bps')} sx={{ borderColor: 'divider' }}>
              Create BPs
            </Button>
            <Button variant="outlined" size="small" startIcon={<ReportsIcon />} sx={{ borderColor: 'divider' }}>
              Generate Report
            </Button>
            <Button variant="outlined" size="small" startIcon={<DownloadIcon />} sx={{ borderColor: 'divider' }}>
              Export Analysis
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );

  // Upload Card Component
  const UploadCard = ({ card, type }) => {
    const isUploaded = uploadedFiles[card.id];
    const isUploading = uploading === card.id;
    const typeColor = type === 'customer' ? '#3b82f6' : type === 'vendor' ? '#8b5cf6' : '#6b7280';

    return (
      <Paper
        elevation={0}
        onClick={() => !isUploaded && !isUploading && handleFileUpload(card.id)}
        sx={{
          p: 2,
          borderRadius: 2,
          cursor: isUploaded ? 'default' : 'pointer',
          border: `1px solid ${isUploaded ? BP_COLOR : darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
          bgcolor: isUploaded ? alpha(BP_COLOR, darkMode ? 0.1 : 0.05) : darkMode ? '#161b22' : 'white',
          transition: 'all 0.2s ease',
          '&:hover': !isUploaded && {
            borderColor: BP_COLOR,
            bgcolor: alpha(BP_COLOR, 0.05),
          },
        }}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: isUploaded ? alpha(BP_COLOR, 0.15) : alpha(typeColor, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {isUploaded ? (
              <CheckIcon sx={{ fontSize: 22, color: BP_COLOR }} />
            ) : (
              <FileIcon sx={{ fontSize: 22, color: typeColor }} />
            )}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>
                {card.title}
              </Typography>
              {card.required && (
                <Chip label="Required" size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' }} />
              )}
            </Stack>
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              {card.description}
            </Typography>
            {isUploading && (
              <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />
            )}
            {isUploaded && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                <CheckIcon sx={{ fontSize: 14, color: BP_COLOR }} />
                <Typography variant="caption" sx={{ color: BP_COLOR }}>
                  {isUploaded.rows.toLocaleString()} records loaded
                </Typography>
              </Stack>
            )}
          </Box>
        </Stack>
      </Paper>
    );
  };

  // Get current step number based on active section
  const getCurrentStep = () => {
    switch (activeSection) {
      case 'data-upload': return 1;
      case 'preview-review': return 2;
      case 'create-bps': return 3;
      default: return 0;
    }
  };

  // Step Indicator Component
  const StepIndicator = ({ currentStep }) => (
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 3 }}>
      {workflowSteps.map((step, index) => (
        <React.Fragment key={step.id}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 3,
              bgcolor: currentStep === step.step ? alpha(BP_COLOR, 0.12) : 'transparent',
              color: currentStep === step.step ? BP_COLOR : currentStep > step.step ? '#10b981' : darkMode ? '#5d7290' : 'text.disabled',
              transition: 'all 0.2s',
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: currentStep === step.step ? BP_COLOR : currentStep > step.step ? '#10b981' : darkMode ? '#5d7290' : '#cbd5e1',
                animation: currentStep === step.step ? 'pulse 1.5s infinite' : 'none',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                },
              }}
            />
            <Typography variant="body2" fontWeight={currentStep === step.step ? 600 : 500}>
              Step {step.step}: {step.label}
            </Typography>
          </Box>
          {index < workflowSteps.length - 1 && (
            <Box
              sx={{
                width: 32,
                height: 2,
                borderRadius: 1,
                bgcolor: currentStep > step.step ? '#10b981' : darkMode ? '#1e2d42' : '#e5e7eb',
              }}
            />
          )}
        </React.Fragment>
      ))}
    </Stack>
  );

  // Data Upload Section
  const renderDataUpload = () => (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <UploadIcon sx={{ color: BP_COLOR }} />
        <Typography variant="h5" fontWeight={700} sx={{ color: darkMode ? '#e6edf3' : BP_COLOR }}>
          Data Upload & Scope Configuration
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ mb: 3, color: colors.textSecondary }}>
        Upload customer, vendor, and transaction data to begin Business Partner consolidation analysis.
      </Typography>

      {/* Step Indicator */}
      <StepIndicator currentStep={1} />

      <Grid container spacing={3}>
        {/* Left Column - Upload Cards */}
        <Grid item xs={12} md={7}>
          {/* Customer Master Data */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${colors.border}`, bgcolor: colors.paper, mb: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6' }}>
                <CustomerIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={600} sx={{ color: colors.text }}>
                Customer Master Data
              </Typography>
            </Stack>
            <Grid container spacing={1.5}>
              {customerUploadCards.map(card => (
                <Grid item xs={12} md={6} key={card.id}>
                  <UploadCard card={card} type="customer" />
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Vendor Master Data */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${colors.border}`, bgcolor: colors.paper, mb: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: alpha('#8b5cf6', 0.1), color: '#8b5cf6' }}>
                <VendorIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={600} sx={{ color: colors.text }}>
                Vendor Master Data
              </Typography>
            </Stack>
            <Grid container spacing={1.5}>
              {vendorUploadCards.map(card => (
                <Grid item xs={12} md={6} key={card.id}>
                  <UploadCard card={card} type="vendor" />
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Transaction Data */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${colors.border}`, bgcolor: colors.paper }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b' }}>
                <FileIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={600} sx={{ color: colors.text }}>
                Transaction History (12 Months)
              </Typography>
            </Stack>
            <Grid container spacing={1.5}>
              {transactionCards.map(card => (
                <Grid item xs={12} md={6} key={card.id}>
                  <UploadCard card={card} type="transaction" />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Right Column - Configuration */}
        <Grid item xs={12} md={5}>
          {/* Target Scope */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${colors.border}`, bgcolor: colors.paper, mb: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text }}>
                Target Scope
              </Typography>
            </Stack>
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Company Codes</InputLabel>
                <Select defaultValue={['1000', '2000']} multiple label="Company Codes">
                  <MenuItem value="1000">1000 - US Operations</MenuItem>
                  <MenuItem value="2000">2000 - EU Operations</MenuItem>
                  <MenuItem value="3000">3000 - APAC Operations</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Sales Organizations</InputLabel>
                <Select defaultValue={['1000']} multiple label="Sales Organizations">
                  <MenuItem value="1000">1000 - Domestic Sales</MenuItem>
                  <MenuItem value="2000">2000 - International Sales</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Purchasing Organizations</InputLabel>
                <Select defaultValue={['1000']} multiple label="Purchasing Organizations">
                  <MenuItem value="1000">1000 - Central Purchasing</MenuItem>
                  <MenuItem value="2000">2000 - Regional Purchasing</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          {/* Migration Rules */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${colors.border}`, bgcolor: colors.paper, mb: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text }}>
                Migration Rules
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <input type="checkbox" style={{ accentColor: BP_COLOR }} />
                <Typography variant="body2" sx={{ color: darkMode ? '#a0afc4' : 'text.secondary' }}>
                  Include dormant partners (no activity)
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <input type="checkbox" defaultChecked style={{ accentColor: BP_COLOR }} />
                <Typography variant="body2" sx={{ color: darkMode ? '#a0afc4' : 'text.secondary' }}>
                  Exclude one-time partners
                </Typography>
              </Stack>
              <Box sx={{ ml: 3 }}>
                <Typography variant="caption" sx={{ color: darkMode ? '#5d7290' : 'text.disabled' }}>
                  Threshold (documents)
                </Typography>
                <input type="number" defaultValue={2} min={1} max={10} style={{ width: 80, padding: '6px 10px', marginTop: 4, borderRadius: 4, border: `1px solid ${darkMode ? '#1e2d42' : '#e5e7eb'}`, background: 'transparent', color: darkMode ? '#e6edf3' : 'inherit' }} />
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <input type="checkbox" defaultChecked style={{ accentColor: BP_COLOR }} />
                <Typography variant="body2" sx={{ color: darkMode ? '#a0afc4' : 'text.secondary' }}>
                  Auto-approve high confidence matches (≥90%)
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <input type="checkbox" defaultChecked style={{ accentColor: BP_COLOR }} />
                <Typography variant="body2" sx={{ color: darkMode ? '#a0afc4' : 'text.secondary' }}>
                  Merge customer/vendor with same Tax ID
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          {/* Run Button */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<AIIcon />}
            disabled={!uploadedFiles['kna1'] || !uploadedFiles['lfa1']}
            onClick={() => setActiveSection('preview-review')}
            sx={{
              py: 2,
              bgcolor: BP_COLOR,
              '&:hover': { bgcolor: alpha(BP_COLOR, 0.9) },
              '&.Mui-disabled': { bgcolor: alpha(BP_COLOR, 0.3) },
            }}
          >
            Generate BP Preview
          </Button>
          <Typography variant="body2" sx={{ textAlign: 'center', mt: 1.5, color: Object.keys(uploadedFiles).length >= 2 ? '#10b981' : darkMode ? '#5d7290' : 'text.disabled' }}>
            {Object.keys(uploadedFiles).length >= 2 ? '✓ All required files uploaded • Ready for analysis' : 'Upload required files to continue'}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );

  // Preview & Review Section
  const renderPreviewReview = () => (
    <Box>
      {/* Header with icon - matching Inventory Health Check */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: alpha('#0ea5a9', 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PreviewIcon sx={{ fontSize: 28, color: '#0ea5a9' }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
              BP Migration Preview
            </Typography>
            <Chip label="Demo Data" size="small" icon={<WarningIcon sx={{ fontSize: 14 }} />} sx={{ bgcolor: alpha('#f59e0b', 0.1), color: '#f59e0b', fontWeight: 600, fontSize: '0.7rem' }} />
          </Stack>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Review proposed Business Partners before creation • Entity resolution complete
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <IconButton sx={{ border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
            <RefreshIcon />
          </IconButton>
          <IconButton sx={{ border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
            <DownloadIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* Step Indicator */}
      <StepIndicator currentStep={2} />

      {/* Metrics Row - like Inventory Health Check */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${colors.border}`,
          bgcolor: colors.paper,
          overflow: 'hidden',
        }}
      >
        <Grid container>
          {[
            { label: 'TOTAL CLUSTERS', value: '3,847', color: '#0ea5a9' },
            { label: 'HIGH CONF', value: '3,124', color: '#10b981' },
            { label: 'MEDIUM', value: '576', color: '#f59e0b' },
            { label: 'LOW', value: '147', color: '#ef4444' },
            { label: 'DUAL ROLE', value: '892', color: '#8b5cf6' },
            { label: 'TOTAL VALUE', value: '$142.7M', color: '#00357a' },
          ].map((metric, index) => (
            <Grid item xs={6} md={2} key={index} sx={{ borderRight: index < 5 ? `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}` : 'none' }}>
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: metric.color, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
                  {metric.label}
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color: metric.color }}>
                  {metric.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Filters Row - like Inventory Health Check */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <FilterIcon sx={{ color: colors.textSecondary }} />
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Status</InputLabel>
          <Select defaultValue="All" label="Status">
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Auto">Auto</MenuItem>
            <MenuItem value="Review">Review</MenuItem>
            <MenuItem value="Must Review">Must Review</MenuItem>
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
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Type</InputLabel>
          <Select defaultValue="All" label="Type">
            <MenuItem value="All">All Types</MenuItem>
            <MenuItem value="Customer">Customer Only</MenuItem>
            <MenuItem value="Vendor">Vendor Only</MenuItem>
            <MenuItem value="Dual">Dual Role</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ flex: 1 }} />
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          Showing {mockBPClustersWithFields.length} of {mockBPClustersWithFields.length} clusters • Click row to expand field recommendations
        </Typography>
      </Stack>

      {/* BP Clusters Table with Field-Level Expansion */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${colors.border}`,
          bgcolor: colors.paper,
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: colors.background }}>
                <TableCell sx={{ width: 40, p: 1 }} />
                <TableCell sx={{ fontWeight: 600, color: colors.text, fontSize: '0.8rem' }}>BP Cluster ID</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.text, fontSize: '0.8rem' }}>Recommended BP Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.text, fontSize: '0.8rem' }}>Search Term</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.text, fontSize: '0.8rem' }}>Sources</TableCell>
                <TableCell sx={{ fontWeight: 600, color: colors.text, fontSize: '0.8rem' }}>Location</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: colors.text, fontSize: '0.8rem' }}>Confidence</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: colors.text, fontSize: '0.8rem' }}>AI Fields</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: colors.text, fontSize: '0.8rem' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockBPClustersWithFields.map((bp) => {
                const isExpanded = expandedRowIds.includes(bp.id);
                const needsReview = bp.status === 'must-review' || bp.status === 'review';
                return (
                  <React.Fragment key={bp.id}>
                    <TableRow
                      sx={{
                        cursor: 'pointer',
                        bgcolor: isExpanded
                          ? (darkMode ? 'rgba(0,53,122,0.1)' : 'rgba(0,53,122,0.03)')
                          : bp.status === 'must-review'
                          ? 'rgba(239, 68, 68, 0.03)'
                          : bp.status === 'review'
                          ? 'rgba(245, 158, 11, 0.03)'
                          : 'transparent',
                        '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' },
                        borderBottom: isExpanded ? 'none' : undefined,
                      }}
                      onClick={() => toggleRowExpansion(bp.id)}
                    >
                      <TableCell sx={{ p: 1 }}>
                        <IconButton size="small" sx={{ color: BP_COLOR }}>
                          {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', color: BP_COLOR, fontWeight: 600, py: 1.5 }}>
                        {bp.id}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: colors.text, py: 1.5 }}>
                        {bp.name}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', color: colors.textSecondary, fontSize: '0.75rem', py: 1.5 }}>
                        {bp.searchTerm}
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack direction="row" spacing={0.5}>
                          {bp.custCount > 0 && (
                            <Chip icon={<CustomerIcon sx={{ fontSize: 14, color: '#3b82f6 !important' }} />} label={`${bp.custCount}`} size="small" sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha('#3b82f6', 0.1), color: '#3b82f6' }} />
                          )}
                          {bp.vendCount > 0 && (
                            <Chip icon={<VendorIcon sx={{ fontSize: 14, color: '#8b5cf6 !important' }} />} label={`${bp.vendCount}`} size="small" sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha('#8b5cf6', 0.1), color: '#8b5cf6' }} />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ color: colors.textSecondary, fontSize: '0.8rem', py: 1.5 }}>
                        {bp.location}
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        <Chip
                          label={`${bp.confidence}%`}
                          size="small"
                          sx={{
                            bgcolor: alpha(getConfidenceColor(bp.confidence), 0.1),
                            color: getConfidenceColor(bp.confidence),
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        <Chip
                          icon={<AIIcon sx={{ fontSize: 14 }} />}
                          label={`${bp.fieldsOverridden}/${bp.fieldsTotal}`}
                          size="small"
                          sx={{
                            bgcolor: bp.fieldsOverridden > 0 ? alpha('#f59e0b', 0.1) : alpha('#6b7280', 0.1),
                            color: bp.fieldsOverridden > 0 ? '#f59e0b' : '#6b7280',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            '& .MuiChip-icon': { color: 'inherit' }
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        {getStatusChip(bp.status)}
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={9} sx={{ p: 0 }}>
                          {renderFieldExpansion(bp)}
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
          onClick={() => setActiveSection('create-bps')}
          sx={{ bgcolor: BP_COLOR, '&:hover': { bgcolor: alpha(BP_COLOR, 0.9) } }}
        >
          Proceed to Create BPs
        </Button>
      </Stack>
    </Box>
  );

  // Create BPs Section
  const renderCreateBPs = () => (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: alpha(BP_COLOR, 0.15), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CreateIcon sx={{ fontSize: 28, color: BP_COLOR }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
              Create Business Partners
            </Typography>
            <Chip label="Ready" size="small" icon={<CheckIcon sx={{ fontSize: 14, color: '#10b981 !important' }} />} sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 600, fontSize: '0.7rem' }} />
          </Stack>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Execute BP creation in S/4HANA. Review final counts and initiate migration.
          </Typography>
        </Box>
      </Stack>

      {/* Step Indicator */}
      <StepIndicator currentStep={3} />

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: alpha(BP_COLOR, 0.1), textAlign: 'center' }}>
            <Typography variant="h3" fontWeight={700} sx={{ color: BP_COLOR }}>3,124</Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>Ready to Create</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: alpha('#f59e0b', 0.1), textAlign: 'center' }}>
            <Typography variant="h3" fontWeight={700} sx={{ color: '#f59e0b' }}>576</Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>Pending Review</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: alpha('#ef4444', 0.1), textAlign: 'center' }}>
            <Typography variant="h3" fontWeight={700} sx={{ color: '#ef4444' }}>147</Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>Excluded</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: alpha('#3b82f6', 0.1), textAlign: 'center' }}>
            <Typography variant="h3" fontWeight={700} sx={{ color: '#3b82f6' }}>$142.7M</Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>Total Value</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Role Assignment Summary */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${colors.border}`, bgcolor: colors.paper, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: colors.text }}>
          BP Role Assignment Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#3b82f6' }} />
              <Typography variant="body2">Customer FI: 2,847</Typography>
            </Stack>
          </Grid>
          <Grid item xs={6} md={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10b981' }} />
              <Typography variant="body2">Customer Sales: 2,156</Typography>
            </Stack>
          </Grid>
          <Grid item xs={6} md={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#8b5cf6' }} />
              <Typography variant="body2">Vendor FI: 1,892</Typography>
            </Stack>
          </Grid>
          <Grid item xs={6} md={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f59e0b' }} />
              <Typography variant="body2">Vendor Purch: 1,423</Typography>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="center">
        <Button variant="outlined" startIcon={<DownloadIcon />} size="large" sx={{ borderColor: 'divider' }}>
          Export Migration Package
        </Button>
        <Button variant="contained" startIcon={<CreateIcon />} size="large" sx={{ bgcolor: BP_COLOR, '&:hover': { bgcolor: alpha(BP_COLOR, 0.9) } }}>
          Create 3,124 Business Partners
        </Button>
      </Stack>
    </Box>
  );

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'data-upload':
        return renderDataUpload();
      case 'preview-review':
        return renderPreviewReview();
      case 'create-bps':
        return renderCreateBPs();
      default:
        return renderDashboard();
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', bgcolor: colors.background }}>
      {/* Left Sidebar */}
      <Box
        sx={{
          width: sidebarOpen ? 260 : 64,
          flexShrink: 0,
          bgcolor: darkMode ? '#0a1019' : 'white',
          borderRight: `1px solid ${darkMode ? '#1e2d42' : 'rgba(0,0,0,0.08)'}`,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          transition: 'width 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar Header */}
        <Box sx={{ p: sidebarOpen ? 2 : 1, borderBottom: `1px solid ${darkMode ? '#1e2d42' : 'rgba(0,0,0,0.08)'}` }}>
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent={sidebarOpen ? 'flex-start' : 'center'}>
            <IconButton
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{
                width: 40,
                height: 40,
                bgcolor: alpha(BP_COLOR, 0.1),
                color: BP_COLOR,
                '&:hover': { bgcolor: alpha(BP_COLOR, 0.2) },
              }}
            >
              {sidebarOpen ? <MenuOpenIcon /> : <MenuIcon />}
            </IconButton>
            {sidebarOpen && (
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: darkMode ? '#e6edf3' : BP_COLOR, lineHeight: 1.2 }}>
                  BP.AI
                </Typography>
                <Typography variant="caption" sx={{ color: darkMode ? '#5d7290' : 'text.secondary' }}>
                  Business Partner Intelligence
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Navigation */}
        <Box sx={{ flex: 1, overflow: 'auto', p: sidebarOpen ? 1.5 : 1 }}>
          {/* Workflow Section */}
          {sidebarOpen && (
            <Typography variant="caption" sx={{ color: darkMode ? '#5d7290' : 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, px: 1, display: 'block', mb: 1 }}>
              Workflow
            </Typography>
          )}
          <List dense disablePadding>
            {workflowNavItems.map((item) => (
              <Tooltip key={item.id} title={!sidebarOpen ? item.label : ''} placement="right">
                <ListItemButton
                  selected={activeSection === item.id}
                  onClick={() => setActiveSection(item.id)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    px: sidebarOpen ? 1 : 1.5,
                    '&.Mui-selected': {
                      bgcolor: alpha(BP_COLOR, 0.12),
                      color: BP_COLOR,
                      '&:hover': { bgcolor: alpha(BP_COLOR, 0.15) },
                    },
                    '&:hover': {
                      bgcolor: darkMode ? '#151f30' : 'rgba(0,0,0,0.04)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: sidebarOpen ? 32 : 'auto', justifyContent: 'center' }}>
                    <item.Icon sx={{ fontSize: 18, color: activeSection === item.id ? BP_COLOR : darkMode ? '#a0afc4' : 'text.secondary' }} />
                  </ListItemIcon>
                  {sidebarOpen && (
                    <>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.8rem',
                          fontWeight: activeSection === item.id ? 600 : 500,
                          color: activeSection === item.id ? BP_COLOR : darkMode ? '#a0afc4' : 'text.secondary',
                        }}
                      />
                      {item.badge && (
                        <Chip
                          label={item.badge}
                          size="small"
                          sx={{
                            height: 20,
                            minWidth: 28,
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            bgcolor: alpha(getBadgeColor(item.badgeColor), 0.1),
                            color: getBadgeColor(item.badgeColor),
                          }}
                        />
                      )}
                    </>
                  )}
                </ListItemButton>
              </Tooltip>
            ))}
          </List>

          {/* Analysis Section */}
          {sidebarOpen && (
            <Typography variant="caption" sx={{ color: darkMode ? '#5d7290' : 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, px: 1, display: 'block', mb: 1, mt: 2 }}>
              Analysis
            </Typography>
          )}
          {!sidebarOpen && <Divider sx={{ my: 1, borderColor: darkMode ? '#1e2d42' : 'rgba(0,0,0,0.08)' }} />}
          <List dense disablePadding>
            {analysisNavItems.map((item) => (
              <Tooltip key={item.id} title={!sidebarOpen ? item.label : ''} placement="right">
                <ListItemButton
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    px: sidebarOpen ? 1 : 1.5,
                    '&:hover': {
                      bgcolor: darkMode ? '#151f30' : 'rgba(0,0,0,0.04)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: sidebarOpen ? 32 : 'auto', justifyContent: 'center' }}>
                    <item.Icon sx={{ fontSize: 18, color: darkMode ? '#a0afc4' : 'text.secondary' }} />
                  </ListItemIcon>
                  {sidebarOpen && (
                    <>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          color: darkMode ? '#a0afc4' : 'text.secondary',
                        }}
                      />
                      {item.badge && (
                        <Chip
                          label={item.badge}
                          size="small"
                          sx={{
                            height: 20,
                            minWidth: 28,
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            bgcolor: alpha(getBadgeColor(item.badgeColor), 0.1),
                            color: getBadgeColor(item.badgeColor),
                          }}
                        />
                      )}
                    </>
                  )}
                </ListItemButton>
              </Tooltip>
            ))}
          </List>

          {/* Tools Section */}
          {sidebarOpen && (
            <Typography variant="caption" sx={{ color: darkMode ? '#5d7290' : 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, px: 1, display: 'block', mb: 1, mt: 2 }}>
              Tools
            </Typography>
          )}
          {!sidebarOpen && <Divider sx={{ my: 1, borderColor: darkMode ? '#1e2d42' : 'rgba(0,0,0,0.08)' }} />}
          <List dense disablePadding>
            {toolsNavItems.map((item) => (
              <Tooltip key={item.id} title={!sidebarOpen ? item.label : ''} placement="right">
                <ListItemButton
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    px: sidebarOpen ? 1 : 1.5,
                    '&:hover': {
                      bgcolor: darkMode ? '#151f30' : 'rgba(0,0,0,0.04)',
                    },
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
        <Box sx={{ p: sidebarOpen ? 2 : 1, borderTop: `1px solid ${darkMode ? '#1e2d42' : 'rgba(0,0,0,0.08)'}` }}>
          {sidebarOpen ? (
            <Box sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: darkMode ? '#0f1724' : '#f8fafc',
              border: `1px solid ${darkMode ? '#1e2d42' : 'rgba(0,0,0,0.08)'}`,
            }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: BP_COLOR,
                    boxShadow: `0 0 10px ${BP_COLOR}`,
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                    },
                  }}
                />
                <Box>
                  <Typography variant="caption" fontWeight={600} sx={{ color: colors.text, display: 'block' }}>
                    Ready
                  </Typography>
                  <Typography variant="caption" sx={{ color: darkMode ? '#5d7290' : 'text.secondary' }}>
                    S/4HANA Migration Mode
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ) : (
            <Tooltip title="Ready - S/4HANA Migration Mode" placement="right">
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: BP_COLOR,
                    boxShadow: `0 0 10px ${BP_COLOR}`,
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
            borderBottom: `1px solid ${darkMode ? '#1e2d42' : 'rgba(0,0,0,0.08)'}`,
            bgcolor: darkMode ? 'rgba(10, 16, 25, 0.8)' : 'white',
            backdropFilter: 'blur(20px)',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              <Link
                component="button"
                variant="body2"
                onClick={onBack}
                sx={{ textDecoration: 'none', color: colors.textSecondary, '&:hover': { textDecoration: 'underline' } }}
              >
                MASTER.AI
              </Link>
              <Link
                component="button"
                variant="body2"
                onClick={onBack}
                sx={{ textDecoration: 'none', color: colors.textSecondary, '&:hover': { textDecoration: 'underline' } }}
              >
                BP.AI
              </Link>
              <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>
                {workflowNavItems.find(item => item.id === activeSection)?.label || 'Data Upload & Scope'}
              </Typography>
            </Breadcrumbs>

            <Button
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              variant="outlined"
              size="small"
              sx={{ borderColor: 'divider' }}
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
            bgcolor: colors.paper,
            borderLeft: `1px solid ${colors.border}`,
          }
        }}
      >
        {selectedFieldForInsight && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Drawer Header */}
            <Box sx={{
              p: 2.5,
              borderBottom: `1px solid ${colors.border}`,
              bgcolor: darkMode ? 'rgba(0,53,122,0.1)' : 'rgba(0,53,122,0.03)',
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(BP_COLOR, 0.15) }}>
                    <AIIcon sx={{ fontSize: 22, color: BP_COLOR }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: colors.text, lineHeight: 1.2 }}>
                      AI Insight
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      BP Field Recommendation Evidence
                    </Typography>
                  </Box>
                </Stack>
                <IconButton onClick={() => setSelectedFieldForInsight(null)} size="small">
                  <RejectIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Stack>
            </Box>

            {/* Field Info */}
            <Box sx={{ p: 2.5, borderBottom: `1px solid ${colors.border}` }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="overline" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>
                    Table / Field
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={selectedFieldForInsight.table}
                      size="small"
                      sx={{ fontFamily: 'monospace', bgcolor: alpha('#6b7280', 0.1), color: colors.textSecondary }}
                    />
                    <Typography variant="h6" fontWeight={700} sx={{ color: BP_COLOR, fontFamily: 'monospace' }}>
                      {selectedFieldForInsight.field}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: colors.text, mt: 0.5 }}>
                    {selectedFieldForInsight.fieldName}
                  </Typography>
                </Box>

                <Divider />

                {/* Value Comparison */}
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: alpha('#6b7280', 0.05), borderRadius: 2, border: `1px solid ${alpha('#6b7280', 0.1)}` }}>
                      <Typography variant="overline" sx={{ color: colors.textSecondary, fontSize: '0.6rem' }}>
                        Source Value(s)
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ color: colors.textSecondary, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {selectedFieldForInsight.sourceValue || '—'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{
                      p: 1.5,
                      bgcolor: alpha(BP_COLOR, 0.08),
                      borderRadius: 2,
                      border: `1px solid ${alpha(BP_COLOR, 0.2)}`
                    }}>
                      <Typography variant="overline" sx={{ color: colors.textSecondary, fontSize: '0.6rem' }}>
                        AI Recommendation
                      </Typography>
                      <Typography variant="body2" fontWeight={700} sx={{
                        color: BP_COLOR,
                        fontFamily: 'monospace',
                        fontSize: '0.9rem'
                      }}>
                        {selectedFieldForInsight.aiRecommendation || '—'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Confidence */}
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="overline" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>
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
            <Box sx={{ p: 2.5, borderBottom: `1px solid ${colors.border}` }}>
              <Typography variant="overline" sx={{ color: colors.textSecondary, fontSize: '0.65rem', display: 'block', mb: 1 }}>
                AI Rationale
              </Typography>
              <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(BP_COLOR, 0.05), borderRadius: 2, border: `1px solid ${alpha(BP_COLOR, 0.1)}` }}>
                <Typography variant="body2" sx={{ color: colors.text, lineHeight: 1.6 }}>
                  {selectedFieldForInsight.rationale}
                </Typography>
              </Paper>
            </Box>

            {/* Evidence Breakdown */}
            <Box sx={{ p: 2.5, flex: 1 }}>
              <Typography variant="overline" sx={{ color: colors.textSecondary, fontSize: '0.65rem', display: 'block', mb: 1.5 }}>
                Evidence Signals ({selectedFieldForInsight.evidence?.length || 0})
              </Typography>
              <Stack spacing={1}>
                {selectedFieldForInsight.evidence?.map((item, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      bgcolor: colors.background,
                      borderRadius: 2,
                      border: `1px solid ${colors.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: alpha(BP_COLOR, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Typography variant="caption" fontWeight={700} sx={{ color: BP_COLOR }}>
                        {index + 1}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: colors.text }}>
                      {item}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Box>

            {/* Governance Status Footer */}
            <Box sx={{
              p: 2,
              borderTop: `1px solid ${colors.border}`,
              bgcolor: colors.background,
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                    Status:
                  </Typography>
                  {getFieldStatusChip(selectedFieldForInsight.status)}
                </Stack>
                {(selectedFieldForInsight.status === 'proposed' || selectedFieldForInsight.status === 'review') && (
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<RejectIcon />}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Reject
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<ApproveIcon />}
                      sx={{
                        fontSize: '0.75rem',
                        bgcolor: '#10b981',
                        '&:hover': { bgcolor: '#059669' }
                      }}
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

export default BPAIModule;
