import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Avatar,
  Chip,
  Card,
  CardContent,
  Stack,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip,
  alpha,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  AccountBalance as AccountBalanceIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
  Gavel as GavelIcon,
  People as PeopleIcon,
  CreditCard as CreditCardIcon,
  Speed as SpeedIcon,
  Pause as PauseIcon,
  ArrowUpward as EscalateIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  NavigateNext as NavigateNextIcon,
  Assessment as AssessmentIcon,
  Check as CheckIcon,
  Block as BlockIcon,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ordlyTheme from './ordlyTheme';
import InfoDialog from './InfoDialog';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

// Primary blue color for ORDLY.AI
const PRIMARY_BLUE = '#0854a0';
const ACCENT_BLUE = '#1976d2';

// Helper function to build CLV metrics from order data
const getClvMetrics = (order) => {
  if (!order) return [];
  return [
    { label: 'Expected CLV', value: order.clvDisplay || '$0', good: true },
    { label: 'Retention Prob.', value: `${Math.round((order.aliveProbability || 0) * 100)}%`, good: (order.aliveProbability || 0) > 0.7 },
    { label: 'Expected Orders', value: Math.round(order.expectedPurchases || 0).toString() },
    { label: 'Avg. Order Value', value: order.avgOrderDisplay || '$0' },
  ];
};

// Helper function to build credit risk metrics from order data
const getCreditRiskMetrics = (order) => {
  if (!order) return [];
  const riskGrade = order.creditStatus || 'B';
  const riskLabel = riskGrade === 'A' ? 'Excellent' : riskGrade === 'B' ? 'Good' : 'Standard';
  return [
    { label: 'Payment Terms', value: order.paymentTerms || 'Net 30' },
    { label: 'Risk Score', value: `${Math.round(order.riskScore || 50)}/100`, good: (order.riskScore || 50) >= 70 },
    { label: 'Credit Rating', value: `${riskGrade} (${riskLabel})`, good: ['A', 'A+'].includes(riskGrade) },
    { label: 'Approval Level', value: (order.approvalLevel || 'manual').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) },
    { label: 'Review Frequency', value: (order.monitoringFrequency || 'monthly').replace(/\b\w/g, l => l.toUpperCase()) },
  ];
};

// Helper function to build policy rules from order data
const getPolicyRules = (order) => {
  if (!order) return [];
  const margin = order.margin || 25;
  const riskGrade = order.creditStatus || 'B';
  const segment = order.segment || 'MAINTAIN';
  const riskScore = order.riskScore || 50;

  return [
    { status: riskScore >= 70 ? 'pass' : 'warn', text: `Credit risk score: ${Math.round(riskScore)}/100 (${riskGrade} rating)` },
    { status: margin >= 28 ? 'pass' : 'warn', text: `Margin ${margin >= 28 ? 'above' : 'below'} threshold (${margin.toFixed(1)}% vs 28% min)` },
    { status: segment === 'INVEST' ? 'pass' : 'warn', text: `Customer segment = ${segment} (${segment === 'INVEST' ? 'priority' : 'standard'} processing)` },
    { status: 'pass', text: `Approval level: ${(order.approvalLevel || 'manual').replace('_', ' ')}` },
    { status: 'pass', text: `Monitoring frequency: ${order.monitoringFrequency || 'monthly'}` },
  ];
};

// Line status chip styles
const getLineStatusChipProps = (status) => {
  const styles = {
    pending: { bgcolor: alpha('#f59e0b', 0.12), color: '#d97706', label: 'Pending', icon: <PendingIcon sx={{ fontSize: 12 }} /> },
    approved: { bgcolor: alpha('#10b981', 0.12), color: '#059669', label: 'Approved', icon: <CheckCircleIcon sx={{ fontSize: 12 }} /> },
    held: { bgcolor: alpha('#ef4444', 0.12), color: '#dc2626', label: 'Held', icon: <BlockIcon sx={{ fontSize: 12 }} /> },
    rejected: { bgcolor: alpha('#64748b', 0.12), color: '#475569', label: 'Rejected', icon: <BlockIcon sx={{ fontSize: 12 }} /> },
    escalated: { bgcolor: alpha('#8b5cf6', 0.12), color: '#7c3aed', label: 'Escalated', icon: <EscalateIcon sx={{ fontSize: 12 }} /> },
  };
  return styles[status] || styles.pending;
};

const OrderValueControlTower = ({ onBack, darkMode = false, selectedOrder: initialOrder = null, selectedLineNumber: initialLineNumber = null, onNavigate }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Multi-line order state
  const [lineStatuses, setLineStatuses] = useState({}); // { lineNumber: status }
  const [processingLine, setProcessingLine] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(false); // Loading state for order-level actions

  // Info dialog state (replaces browser alerts)
  const [infoDialog, setInfoDialog] = useState({ open: false, title: '', message: '', type: 'info' });

  // API data state
  const [approvalOrders, setApprovalOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ pending: 0, autoApproved: 0, escalated: 0, avgClv: '$0' });

  // Auto-select order passed from Pipeline navigation
  useEffect(() => {
    if (initialOrder && approvalOrders.length > 0) {
      // Find matching order by ID - normalize both to raw number for comparison
      const rawOrderId = (initialOrder.id || '').replace(/^(PO-|ARB-|INT-|ORD-)/, '');
      const matchingOrder = approvalOrders.find(o => {
        const rawOId = (o.id || '').replace(/^(PO-|ARB-|INT-|ORD-)/, '');
        return rawOId === rawOrderId || o.id?.includes(rawOrderId);
      });
      if (matchingOrder) {
        // Include lineItems from initialOrder if present
        const orderWithLines = {
          ...matchingOrder,
          lineItems: initialOrder.lineItems || matchingOrder.lineItems || [],
          lineCount: initialOrder.lineCount || matchingOrder.lineCount || 1,
        };
        setSelectedOrder(orderWithLines);

        // Initialize line statuses from lineItems
        const initialStatuses = {};
        (orderWithLines.lineItems || []).forEach(line => {
          initialStatuses[line.lineNumber] = line.lineStatus || 'pending';
        });
        setLineStatuses(initialStatuses);
      }
    }
  }, [initialOrder, approvalOrders]);

  // Fetch approval orders from API
  const fetchApprovalOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/approval/orders?limit=50`);
      if (!response.ok) throw new Error('Failed to fetch approval orders');
      const data = await response.json();

      // Transform API data to match DataGrid format
      // Filter to only show orders at stage 2 (Arbitration) or higher
      const allOrders = data.orders.map(order => ({
        id: order.order_id || order.id,
        customer: order.customer,
        sku: order.sku || order.material || 'N/A',
        orderValue: order.order_value || order.orderValue || '$0',
        margin: order.margin || 0,
        segment: order.segment || 'MAINTAIN',
        creditStatus: order.credit_status || order.creditStatus || 'B',
        approvalStatus: order.approval_status || order.approvalStatus || 'pending',
        stage: order.stage ?? 0,
        // Preserve additional CLV and credit fields for detail view
        clvDisplay: order.clvDisplay,
        clv: order.clv,
        aliveProbability: order.aliveProbability,
        expectedPurchases: order.expectedPurchases,
        avgOrderValue: order.avgOrderValue,
        avgOrderDisplay: order.avgOrderDisplay,
        riskScore: order.riskScore,
        paymentTerms: order.paymentTerms,
        approvalLevel: order.approvalLevel,
        monitoringFrequency: order.monitoringFrequency,
      }));

      // Only show orders at Arbitration stage (stage 2)
      const orders = allOrders.filter(order => order.stage >= 2);

      setApprovalOrders(orders);

      // Calculate stats
      const pendingCount = orders.filter(o => o.approvalStatus === 'pending').length;
      const autoApprovedCount = orders.filter(o => ['auto-approved', 'approved'].includes(o.approvalStatus)).length;
      const escalatedCount = orders.filter(o => o.approvalStatus === 'escalated').length;

      setStats({
        pending: pendingCount,
        autoApproved: autoApprovedCount,
        escalated: escalatedCount,
        avgClv: data.stats?.avgClv || '$1.8M',
      });
    } catch (err) {
      console.error('Error fetching approval orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchApprovalOrders();
  }, []);

  // Action handlers for order decisions
  const handleApprove = async () => {
    if (!selectedOrder) return;
    setProcessingOrder(true);
    const orderId = selectedOrder.id;
    try {
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/order/${orderId}/approve`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to approve order');
      const result = await response.json();

      // Show success message
      setInfoDialog({
        open: true,
        title: 'Order Approved',
        message: `Order ${orderId} has been approved and committed to SAP successfully.`,
        type: 'success',
      });
      setSelectedOrder(null);
      fetchApprovalOrders();
    } catch (err) {
      console.error('Error approving order:', err);
      setInfoDialog({ open: true, title: 'Error', message: err.message, type: 'error' });
    } finally {
      setProcessingOrder(false);
    }
  };

  const handleHold = async () => {
    if (!selectedOrder) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/order/${selectedOrder.id}/hold`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to hold order');
      const result = await response.json();
      setInfoDialog({
        open: true,
        title: 'Order On Hold',
        message: `Order ${selectedOrder.id} has been placed on hold.\n\nThe order will remain in the queue until further action is taken.`,
        type: 'warning',
      });
      setSelectedOrder(null);
      fetchApprovalOrders();
    } catch (err) {
      console.error('Error holding order:', err);
      setInfoDialog({ open: true, title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleEscalate = async () => {
    if (!selectedOrder) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/order/${selectedOrder.id}/escalate`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to escalate order');
      const result = await response.json();
      setInfoDialog({
        open: true,
        title: 'Order Escalated',
        message: `Order ${selectedOrder.id} has been escalated for management review.\n\nA notification has been sent to the approval team.`,
        type: 'info',
      });
      setSelectedOrder(null);
      fetchApprovalOrders();
    } catch (err) {
      console.error('Error escalating order:', err);
      setInfoDialog({ open: true, title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleExport = async () => {
    try {
      window.open(`${API_BASE_URL}/api/ordlyai/approval/export`, '_blank');
    } catch (err) {
      console.error('Error exporting:', err);
      setInfoDialog({ open: true, title: 'Error', message: err.message, type: 'error' });
    }
  };

  // Per-line action handlers for multi-line orders
  const handleLineApprove = async (lineNumber) => {
    if (!selectedOrder) return;
    setProcessingLine(lineNumber);
    try {
      const orderId = selectedOrder.id.replace(/^(PO-|INT-|ORD-)/, '');
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/order/${orderId}/line/${lineNumber}/approve`, { method: 'POST' });
      if (!response.ok) throw new Error(`Failed to approve line ${lineNumber}`);

      setLineStatuses(prev => ({ ...prev, [lineNumber]: 'approved' }));
      setInfoDialog({
        open: true,
        title: 'Line Approved',
        message: `Line ${lineNumber} has been approved.`,
        type: 'success',
      });
    } catch (err) {
      console.error('Error approving line:', err);
      setInfoDialog({ open: true, title: 'Error', message: err.message, type: 'error' });
    } finally {
      setProcessingLine(null);
    }
  };

  const handleLineHold = async (lineNumber) => {
    if (!selectedOrder) return;
    setProcessingLine(lineNumber);
    try {
      const orderId = selectedOrder.id.replace(/^(PO-|INT-|ORD-)/, '');
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/order/${orderId}/line/${lineNumber}/hold`, { method: 'POST' });
      if (!response.ok) throw new Error(`Failed to hold line ${lineNumber}`);

      setLineStatuses(prev => ({ ...prev, [lineNumber]: 'held' }));
      setInfoDialog({
        open: true,
        title: 'Line On Hold',
        message: `Line ${lineNumber} has been placed on hold.`,
        type: 'warning',
      });
    } catch (err) {
      console.error('Error holding line:', err);
      setInfoDialog({ open: true, title: 'Error', message: err.message, type: 'error' });
    } finally {
      setProcessingLine(null);
    }
  };

  const handleApproveAllLines = async () => {
    if (!selectedOrder) return;
    try {
      const orderId = selectedOrder.id.replace(/^(PO-|INT-|ORD-)/, '');
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/order/${orderId}/approve-all-lines`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to approve all lines');

      // Mark all lines as approved
      const newStatuses = {};
      (selectedOrder.lineItems || []).forEach(line => {
        newStatuses[line.lineNumber] = 'approved';
      });
      setLineStatuses(newStatuses);

      setInfoDialog({
        open: true,
        title: 'All Lines Approved',
        message: `All ${selectedOrder.lineCount || 1} lines have been approved. Order is ready for SAP commit.`,
        type: 'success',
      });
    } catch (err) {
      console.error('Error approving all lines:', err);
      setInfoDialog({ open: true, title: 'Error', message: err.message, type: 'error' });
    }
  };

  // Check if all lines are approved
  const allLinesApproved = () => {
    const lineItems = selectedOrder?.lineItems || [];
    if (lineItems.length === 0) return true;
    return lineItems.every(line => lineStatuses[line.lineNumber] === 'approved');
  };

  // Get approval progress
  const getApprovalProgress = () => {
    const lineItems = selectedOrder?.lineItems || [];
    if (lineItems.length === 0) return { approved: 0, total: 1, all: true };
    const approved = lineItems.filter(line => lineStatuses[line.lineNumber] === 'approved').length;
    return {
      approved,
      total: lineItems.length,
      all: approved === lineItems.length,
    };
  };

  const columns = [
    {
      field: 'approvalStatus',
      headerName: 'Status',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const colors = {
          'approved': { bg: alpha('#10b981', 0.12), color: '#059669' },
          'auto-approved': { bg: alpha('#10b981', 0.12), color: '#059669' },
          'pending': { bg: alpha('#f59e0b', 0.12), color: '#d97706' },
          'on-hold': { bg: alpha('#64748b', 0.12), color: '#475569' },
          'escalated': { bg: alpha('#ef4444', 0.12), color: '#dc2626' },
        };
        const labels = {
          'approved': 'APPROVED',
          'auto-approved': 'AUTO-APPROVED',
          'pending': 'PENDING',
          'on-hold': 'ON HOLD',
          'escalated': 'ESCALATED'
        };
        const style = colors[params.value] || colors.pending;
        return <Chip label={labels[params.value] || params.value?.toUpperCase() || 'PENDING'} size="small" sx={{ ...style, fontWeight: 600, fontSize: '0.6rem' }} />;
      },
    },
    { field: 'id', headerName: 'Order', width: 140, renderCell: (params) => <Typography sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.8rem' }}>{params.value}</Typography> },
    { field: 'customer', headerName: 'Customer', flex: 1, minWidth: 180, renderCell: (params) => <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{params.value}</Typography> },
    { field: 'sku', headerName: 'SKU', width: 160, renderCell: (params) => <Chip label={params.value} size="small" sx={{ bgcolor: alpha('#0854a0', 0.12), color: '#1565c0', fontWeight: 600, fontSize: '0.65rem', maxWidth: '100%' }} /> },
    { field: 'orderValue', headerName: 'Value', width: 100, align: 'right', headerAlign: 'right', renderCell: (params) => <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{params.value}</Typography> },
    { field: 'margin', headerName: 'Margin', width: 90, align: 'center', headerAlign: 'center', renderCell: (params) => { const color = params.value >= 30 ? '#059669' : params.value >= 25 ? '#d97706' : '#dc2626'; return <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color }}>{params.value}%</Typography>; } },
    { field: 'segment', headerName: 'CLV Segment', width: 120, align: 'center', headerAlign: 'center', renderCell: (params) => { const colors = { 'INVEST': '#10b981', 'MAINTAIN': '#0854a0', 'WATCH': '#f59e0b', 'GROW': '#8b5cf6' }; const color = colors[params.value] || '#64748b'; return <Chip label={params.value || 'N/A'} size="small" sx={{ bgcolor: alpha(color, 0.12), color: color, fontWeight: 600, fontSize: '0.65rem' }} />; } },
    { field: 'creditStatus', headerName: 'Credit', width: 80, align: 'center', headerAlign: 'center', renderCell: (params) => { const value = params.value || 'B'; const color = value.includes('A') ? '#059669' : '#d97706'; return <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color }}>{value}</Typography>; } },
  ];

  const handleRowClick = (params) => setSelectedOrder(params.row);
  const handleBackToList = () => setSelectedOrder(null);

  const getStatusIcon = (status) => {
    if (status === 'pass') return <CheckCircleIcon sx={{ fontSize: 14, color: '#059669' }} />;
    if (status === 'warn') return <WarningIcon sx={{ fontSize: 14, color: '#d97706' }} />;
    return <CheckCircleIcon sx={{ fontSize: 14, color: '#dc2626' }} />;
  };

  // ==================== DETAIL VIEW ====================
  if (selectedOrder) {
    return (
      <Box sx={{ p: 3, minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: darkMode ? '#0d1117' : '#f8fafc', overflow: 'auto' }}>
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>ORDLY.AI</Link>
              <Link component="button" variant="body1" onClick={handleBackToList} sx={{ textDecoration: 'none', color: 'text.primary' }}>Control Tower</Link>
              <Typography color="primary" variant="body1" fontWeight={600}>{selectedOrder.id}</Typography>
            </Breadcrumbs>
            <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList} variant="outlined" size="small">Back to List</Button>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
            <AccountBalanceIcon sx={{ fontSize: 40, color: '#0854a0' }} />
            <Box>
              <Typography variant="h5" fontWeight={600}>{selectedOrder.customer}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedOrder.sku} - {selectedOrder.orderValue}</Typography>
            </Box>
          </Stack>
        </Box>

        <Grid container spacing={2} sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon sx={{ color: '#0854a0', fontSize: 18 }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Customer Economics & Risk</Typography>
              </Box>
              <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
                <Paper variant="outlined" sx={{ p: 3, mb: 2, textAlign: 'center', borderLeft: `3px solid ${['A', 'A+'].includes(selectedOrder.creditStatus) && (selectedOrder.margin || 25) >= 28 ? '#10b981' : '#f59e0b'}`, bgcolor: alpha(['A', 'A+'].includes(selectedOrder.creditStatus) && (selectedOrder.margin || 25) >= 28 ? '#10b981' : '#f59e0b', 0.05) }}>
                  <Typography sx={{ fontSize: '0.7rem', color: ['A', 'A+'].includes(selectedOrder.creditStatus) && (selectedOrder.margin || 25) >= 28 ? '#059669' : '#d97706', textTransform: 'uppercase', letterSpacing: 2 }}>AI Recommendation</Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ my: 1, color: ['A', 'A+'].includes(selectedOrder.creditStatus) && (selectedOrder.margin || 25) >= 28 ? '#059669' : '#d97706' }}>
                    {['A', 'A+'].includes(selectedOrder.creditStatus) && (selectedOrder.margin || 25) >= 28 ? 'APPROVE ORDER' : 'REVIEW REQUIRED'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {selectedOrder.clvDisplay || '$0'} CLV • {(selectedOrder.margin || 25).toFixed(1)}% margin • {selectedOrder.creditStatus || 'B'} credit rating
                  </Typography>
                </Paper>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Customer Lifetime Value</Typography>
                    <Chip label={`${selectedOrder.segment} Segment`} size="small" icon={<SpeedIcon sx={{ fontSize: 14 }} />} sx={{ bgcolor: alpha(selectedOrder.segment === 'INVEST' ? '#10b981' : selectedOrder.segment === 'WATCH' ? '#f59e0b' : '#0854a0', 0.12), color: selectedOrder.segment === 'INVEST' ? '#059669' : selectedOrder.segment === 'WATCH' ? '#d97706' : '#1565c0', fontWeight: 600, fontSize: '0.65rem' }} />
                  </Box>
                  <Grid container spacing={1}>
                    {getClvMetrics(selectedOrder).map((metric) => (
                      <Grid item xs={3} key={metric.label}>
                        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight={700} sx={{ color: metric.good ? '#059669' : 'text.primary' }}>{metric.value}</Typography>
                          <Typography sx={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.6rem' }}>{metric.label}</Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}><CreditCardIcon sx={{ fontSize: 14 }} /> Credit Risk Assessment</Typography>
                  {getCreditRiskMetrics(selectedOrder).map((row, idx, arr) => (
                    <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: idx < arr.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>{row.label}</Typography>
                      <Typography variant="caption" fontWeight={600} sx={{ color: row.good ? '#059669' : 'text.primary', fontSize: '0.7rem' }}>{row.value}</Typography>
                    </Box>
                  ))}
                </Paper>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                <GavelIcon sx={{ color: '#0854a0', fontSize: 18 }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Policy Engine & Approvals</Typography>
              </Box>
              <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}><CheckCircleIcon sx={{ fontSize: 14 }} /> Automated Policy Checks</Typography>
                  {getPolicyRules(selectedOrder).map((rule, idx, arr) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1, borderBottom: idx < arr.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(rule.status === 'pass' ? '#10b981' : '#f59e0b', 0.12) }}>{getStatusIcon(rule.status)}</Box>
                      <Typography variant="caption" sx={{ color: '#64748b', flex: 1, fontSize: '0.75rem' }}>{rule.text}</Typography>
                    </Box>
                  ))}
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, borderLeft: `3px solid ${['A', 'A+'].includes(selectedOrder.creditStatus) && (selectedOrder.margin || 25) >= 28 ? '#10b981' : '#f59e0b'}`, bgcolor: alpha(['A', 'A+'].includes(selectedOrder.creditStatus) && (selectedOrder.margin || 25) >= 28 ? '#10b981' : '#f59e0b', 0.05) }}>
                  <Typography sx={{ fontSize: '0.7rem', color: ['A', 'A+'].includes(selectedOrder.creditStatus) && (selectedOrder.margin || 25) >= 28 ? '#059669' : '#d97706', textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}><LightbulbIcon sx={{ fontSize: 14 }} /> AI Audit Summary</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', lineHeight: 1.8, fontSize: '0.75rem' }}>
                    <strong>Recommendation:</strong> {['A', 'A+'].includes(selectedOrder.creditStatus) && (selectedOrder.margin || 25) >= 28 ? 'Approve with standard terms.' : 'Review recommended before approval.'}<br /><br />
                    <strong>Rationale:</strong> {selectedOrder.customer} is a {selectedOrder.clvDisplay || '$0'} CLV customer in {selectedOrder.segment} segment. Order margin of {(selectedOrder.margin || 25).toFixed(1)}% {(selectedOrder.margin || 25) >= 28 ? 'exceeds' : 'is below'} 28% floor. Credit risk score: {Math.round(selectedOrder.riskScore || 50)}/100 ({selectedOrder.creditStatus || 'B'}).
                  </Typography>
                </Paper>
              </Box>
              {/* Per-Line Approval Table for multi-line orders */}
              {(selectedOrder?.lineCount || 1) > 1 && (
                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ fontSize: 14 }} /> Per-Line Approval
                    </Typography>
                    <Chip
                      label={`${getApprovalProgress().approved} of ${getApprovalProgress().total} approved`}
                      size="small"
                      sx={{
                        bgcolor: getApprovalProgress().all ? alpha('#10b981', 0.15) : alpha('#f59e0b', 0.15),
                        color: getApprovalProgress().all ? '#059669' : '#d97706',
                        fontWeight: 600,
                        fontSize: '0.6rem',
                      }}
                    />
                  </Box>
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 1.5 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: darkMode ? '#1e293b' : '#f1f5f9' }}>
                          <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', width: 50 }}>#</TableCell>
                          <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b' }}>Material / SKU</TableCell>
                          <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', width: 80 }}>Margin</TableCell>
                          <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', width: 90 }}>Status</TableCell>
                          <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', width: 140, textAlign: 'center' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(selectedOrder?.lineItems || []).map((line) => {
                          const status = lineStatuses[line.lineNumber] || line.lineStatus || 'pending';
                          const statusProps = getLineStatusChipProps(status);
                          const isProcessing = processingLine === line.lineNumber;
                          return (
                            <TableRow key={line.lineNumber}>
                              <TableCell>
                                <Chip
                                  label={line.lineNumber}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha('#0854a0', 0.1),
                                    color: '#0854a0',
                                    fontWeight: 700,
                                    fontSize: '0.65rem',
                                    height: 20,
                                    minWidth: 24,
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }} noWrap>
                                  {line.material?.slice(0, 25) || 'N/A'}
                                </Typography>
                                <Typography sx={{ fontSize: '0.6rem', color: '#64748b', fontFamily: 'monospace' }}>
                                  {line.selectedSku || line.materialId || '---'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: (line.marginPct || 25) >= 28 ? '#059669' : '#d97706',
                                }}>
                                  {(line.marginPct || 25).toFixed(1)}%
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={statusProps.icon}
                                  label={statusProps.label}
                                  size="small"
                                  sx={{
                                    bgcolor: statusProps.bgcolor,
                                    color: statusProps.color,
                                    fontWeight: 600,
                                    fontSize: '0.55rem',
                                    height: 20,
                                    '& .MuiChip-icon': { ml: 0.5 },
                                  }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                {status === 'pending' && (
                                  <Stack direction="row" spacing={0.5} justifyContent="center">
                                    <Tooltip title="Approve Line">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleLineApprove(line.lineNumber)}
                                        disabled={isProcessing}
                                        sx={{
                                          bgcolor: alpha('#10b981', 0.1),
                                          color: '#059669',
                                          '&:hover': { bgcolor: alpha('#10b981', 0.2) },
                                        }}
                                      >
                                        {isProcessing ? <CircularProgress size={14} /> : <CheckIcon sx={{ fontSize: 14 }} />}
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Hold Line">
                                      <IconButton
                                        size="small"
                                        onClick={() => handleLineHold(line.lineNumber)}
                                        disabled={isProcessing}
                                        sx={{
                                          bgcolor: alpha('#f59e0b', 0.1),
                                          color: '#d97706',
                                          '&:hover': { bgcolor: alpha('#f59e0b', 0.2) },
                                        }}
                                      >
                                        <PauseIcon sx={{ fontSize: 14 }} />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                )}
                                {status === 'approved' && (
                                  <Typography sx={{ fontSize: '0.6rem', color: '#059669', fontWeight: 600 }}>
                                    Ready
                                  </Typography>
                                )}
                                {status === 'held' && (
                                  <Button
                                    size="small"
                                    onClick={() => handleLineApprove(line.lineNumber)}
                                    sx={{ fontSize: '0.55rem', py: 0.25, px: 1 }}
                                  >
                                    Release
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={handleApproveAllLines}
                    disabled={getApprovalProgress().all}
                    sx={{
                      fontSize: '0.7rem',
                      color: '#059669',
                      borderColor: alpha('#10b981', 0.5),
                      '&:hover': { bgcolor: alpha('#10b981', 0.1) },
                      '&:disabled': { color: '#94a3b8', borderColor: '#e2e8f0' },
                    }}
                  >
                    {getApprovalProgress().all ? 'All Lines Approved' : 'Approve All Pending Lines'}
                  </Button>
                </Box>
              )}

              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" onClick={handleBackToList} sx={{ flex: 1, fontSize: '0.75rem' }}>Back to SKU</Button>
                <Button startIcon={<PauseIcon />} size="small" onClick={handleHold} sx={{ flex: 1, fontSize: '0.75rem', bgcolor: alpha('#f59e0b', 0.12), border: '1px solid', borderColor: alpha('#f59e0b', 0.3), color: '#d97706' }}>Hold</Button>
                <Button startIcon={<EscalateIcon />} size="small" onClick={handleEscalate} sx={{ flex: 1, fontSize: '0.75rem', bgcolor: alpha('#ef4444', 0.12), border: '1px solid', borderColor: alpha('#ef4444', 0.3), color: '#dc2626' }}>Escalate</Button>
                <Tooltip title={!allLinesApproved() && (selectedOrder?.lineCount || 1) > 1 ? 'Approve all lines before committing' : ''}>
                  <span style={{ flex: 1.5 }}>
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      onClick={handleApprove}
                      disabled={processingOrder || ((selectedOrder?.lineCount || 1) > 1 && !allLinesApproved())}
                      startIcon={processingOrder ? <CircularProgress size={14} color="inherit" /> : null}
                      sx={{
                        fontSize: '0.75rem',
                        bgcolor: '#0854a0',
                        '&:hover': { bgcolor: '#1565c0' },
                        '&:disabled': { bgcolor: alpha('#0854a0', 0.3) },
                      }}
                    >
                      {processingOrder ? 'Committing...' : (selectedOrder?.lineCount || 1) > 1 ? 'Commit All to SAP' : 'Approve & Commit'}
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Info Dialog for Detail View */}
        <InfoDialog
          open={infoDialog.open}
          onClose={() => setInfoDialog({ ...infoDialog, open: false })}
          title={infoDialog.title}
          message={infoDialog.message}
          type={infoDialog.type}
          darkMode={darkMode}
        />
      </Box>
    );
  }

  // ==================== LIST VIEW ====================
  return (
    <Box sx={{ p: 3, minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: darkMode ? '#0d1117' : '#f8fafc', overflow: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>ORDLY.AI</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Order Value Control Tower</Typography>
          </Breadcrumbs>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh"><span><IconButton color="primary" onClick={fetchApprovalOrders} disabled={loading}><RefreshIcon /></IconButton></span></Tooltip>
            <Tooltip title="Export"><IconButton color="primary" onClick={handleExport}><DownloadIcon /></IconButton></Tooltip>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back to ORDLY.AI</Button>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <AccountBalanceIcon sx={{ fontSize: 40, color: '#0854a0' }} />
          <Typography variant="h5" fontWeight={600}>Order Value Control Tower</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">Customer economics, credit analysis, and approval workflow - Click a row to view details</Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Pending Approval', value: stats.pending, color: '#f59e0b' },
          { label: 'Auto-Approved', value: stats.autoApproved, color: '#10b981' },
          { label: 'Escalated', value: stats.escalated, color: '#ef4444' },
          { label: 'Avg. CLV', value: stats.avgClv, color: '#0854a0' },
          { label: 'Approval Rate', value: '94%', color: '#10b981' },
        ].map((card) => (
          <Grid item xs={12} sm={6} md={2.4} key={card.label}>
            <Card variant="outlined" sx={{ borderLeft: `3px solid ${card.color}` }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>{card.label}</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: card.color }}>{card.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AssessmentIcon sx={{ color: '#0854a0', fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Orders Pending Approval</Typography>
          </Stack>
          <Chip label={`${stats.pending} pending`} size="small" sx={{ bgcolor: alpha('#f59e0b', 0.12), color: '#d97706', fontWeight: 600, fontSize: '0.7rem' }} />
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              <Button variant="outlined" onClick={fetchApprovalOrders}>Retry</Button>
            </Box>
          ) : (
            <DataGrid
              rows={approvalOrders}
              columns={columns}
              density="compact"
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              pageSizeOptions={[10, 25, 50]}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
              onRowClick={handleRowClick}
              disableRowSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': { fontSize: '0.8rem' },
                '& .MuiDataGrid-columnHeader': { bgcolor: darkMode ? '#1e293b' : '#f1f5f9', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' },
                '& .MuiDataGrid-row:hover': { bgcolor: alpha('#0854a0', 0.08), cursor: 'pointer' },
              }}
            />
          )}
        </Box>
      </Card>

      {/* Info Dialog (replaces browser alerts) */}
      <InfoDialog
        open={infoDialog.open}
        onClose={() => setInfoDialog({ ...infoDialog, open: false })}
        title={infoDialog.title}
        message={infoDialog.message}
        type={infoDialog.type}
        darkMode={darkMode}
      />
    </Box>
  );
};

export default OrderValueControlTower;
