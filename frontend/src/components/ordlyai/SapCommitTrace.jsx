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
  AccountTree as AccountTreeIcon,
  CheckCircle as CheckCircleIcon,
  Description as DescriptionIcon,
  History as HistoryIcon,
  Launch as LaunchIcon,
  Print as PrintIcon,
  AttachFile as AttachFileIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  NavigateNext as NavigateNextIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import ordlyTheme from './ordlyTheme';
import InfoDialog from './InfoDialog';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

// Primary blue color for ORDLY.AI
const PRIMARY_BLUE = '#0854a0';
const ACCENT_BLUE = '#1976d2';

// Detail view data
const validationItems = [
  { status: 'pass', text: 'Customer Master Data', detail: 'Sold-to: 1000047 | Ship-to: 1000047-01' },
  { status: 'pass', text: 'Material Master Data', detail: 'RL-PET50-SIL-S active in Plant 2100' },
  { status: 'pass', text: 'Pricing Conditions', detail: 'PR00: $2.44/LM | MWST: 0% | Freight: $0.13/LM' },
  { status: 'pass', text: 'Credit Check (VKM1)', detail: 'Available: $652,766 | Required: $36,600' },
  { status: 'pass', text: 'ATP Check (MD04)', detail: 'Confirmed 15,000 LM for Jan 12, 2025' },
  { status: 'pass', text: 'Plant Determination', detail: 'Plant 2100 (Chicago) selected' },
  { status: 'pass', text: 'Shipping Point', detail: 'SP01 - Chicago Warehouse' },
  { status: 'pass', text: 'Incompletion Log', detail: 'No errors - order complete' },
];

const sapFields = {
  header: [
    { label: 'Order Type', code: 'AUART', value: 'ZOR (Standard Order)' },
    { label: 'Sales Org', code: 'VKORG', value: '1000' },
    { label: 'Dist. Channel', code: 'VTWEG', value: '10' },
    { label: 'Division', code: 'SPART', value: '00' },
    { label: 'PO Number', code: 'BSTKD', value: '4500892341' },
  ],
  partner: [
    { label: 'Sold-to Party', code: 'KUNNR', value: '1000047 (3M Industrial)' },
    { label: 'Ship-to Party', code: 'KUNWE', value: '1000047-01 (Austin TX)' },
  ],
  lineItem: [
    { label: 'Material', code: 'MATNR', value: 'RL-PET50-SIL-S' },
    { label: 'Quantity', code: 'KWMENG', value: '15,000 LM' },
    { label: 'Plant', code: 'WERKS', value: '2100 (Chicago)' },
    { label: 'Req. Delivery', code: 'EDATU', value: '2025-01-12' },
    { label: 'Net Value', code: 'NETWR', value: '$36,600.00' },
  ],
};

const lineageSteps = [
  { stage: 'Source Document', detail: 'Email from orders@3m.com with PO #4500892341 (PDF attachment)', meta: 'Received: Jan 7, 2025 09:23 AM' },
  { stage: 'Intent Extraction', detail: 'Customer: 3M Industrial | Spec: PET 50um Premium Silicone | Qty: 15,000 LM', meta: 'Confidence: 89.2%' },
  { stage: 'SKU Decision', detail: 'Selected: RL-PET50-SIL-S (Standard Silicone alternate)', meta: '+$1,530 margin' },
  { stage: 'Enterprise Arbitration', detail: 'Auto-approved: High-value INVEST customer + Above-threshold margin', meta: 'Policy checks: 6/6 passed' },
  { stage: 'SAP Commit', detail: 'Sales Order SO-0045892341 created successfully via BAPI', meta: 'Committed: Jan 7, 2025 11:47 AM' },
];

const auditLog = [
  { timestamp: '11:47:32.456', action: 'BAPI_SALESORDER_CREATEFROMDAT2', result: 'Success' },
  { timestamp: '11:47:32.421', action: 'BAPI_TRANSACTION_COMMIT', result: 'Committed' },
  { timestamp: '11:47:32.389', action: 'Credit Check (VKM1)', result: 'Passed' },
  { timestamp: '11:47:32.312', action: 'ATP Check (MD04)', result: 'Confirmed' },
  { timestamp: '11:47:32.245', action: 'Pricing Determination', result: 'PR00 + MWST' },
];

const SapCommitTrace = ({ onBack, darkMode = false, selectedOrder: initialOrder = null, selectedLineNumber: initialLineNumber = null }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedLines, setExpandedLines] = useState({}); // For multi-line accordion

  // Info dialog state (replaces browser alerts)
  const [infoDialog, setInfoDialog] = useState({ open: false, title: '', message: '', type: 'info' });

  // API data state
  const [committedOrders, setCommittedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ success: 0, pending: 0, failed: 0, total: 0, rate: '0%' });

  // Fetch SAP commit orders from API
  const fetchCommittedOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/sap-commit/orders?limit=50`);
      if (!response.ok) throw new Error('Failed to fetch SAP commit orders');
      const data = await response.json();

      // Transform API data to match DataGrid format
      // API returns camelCase: sapOrderId, orderValue, commitStatus, committedAt
      const orders = data.orders.map(order => ({
        id: order.sapOrderId || order.sap_order_id || order.id,
        intentId: order.id || order.intent_id || order.intentId || 'N/A',  // PO number is now in 'id' field
        customer: order.customer,
        orderValue: order.orderValue || order.order_value || '$0',
        commitStatus: order.commitStatus || order.commit_status || 'pending',
        committedAt: order.committedAt || order.committed_at || 'N/A',
        user: order.user || 'ORDLY_SYSTEM',
      }));

      setCommittedOrders(orders);

      // Calculate stats
      const successCount = orders.filter(o => o.commitStatus === 'success').length;
      const pendingCount = orders.filter(o => o.commitStatus === 'pending').length;
      const failedCount = orders.filter(o => o.commitStatus === 'failed').length;
      const rate = orders.length > 0 ? `${Math.round(successCount / orders.length * 100)}%` : '0%';

      setStats({
        success: successCount,
        pending: pendingCount,
        failed: failedCount,
        total: orders.length,
        rate: data.stats?.rate || rate,
      });
    } catch (err) {
      console.error('Error fetching SAP commit orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchCommittedOrders();
  }, []);

  // Handle initial order passed from Pipeline navigation
  useEffect(() => {
    if (initialOrder && committedOrders.length > 0) {
      const rawOrderId = (initialOrder.id || '').replace(/^(PO-|INT-|ORD-)/, '');
      const matchingOrder = committedOrders.find(o => {
        const rawOId = (o.id || o.intentId || '').replace(/^(PO-|INT-|ORD-)/, '');
        return rawOId === rawOrderId || o.id?.includes(rawOrderId) || o.intentId?.includes(rawOrderId);
      });
      if (matchingOrder) {
        const orderWithLines = {
          ...matchingOrder,
          lineItems: initialOrder.lineItems || matchingOrder.lineItems || [],
          lineCount: initialOrder.lineCount || matchingOrder.lineCount || 1,
        };
        setSelectedOrder(orderWithLines);
        // Expand all lines by default for multi-line orders
        if ((orderWithLines.lineCount || 1) > 1) {
          const expanded = {};
          (orderWithLines.lineItems || []).forEach(line => {
            expanded[line.lineNumber] = true;
          });
          setExpandedLines(expanded);
        }
      }
    }
  }, [initialOrder, committedOrders]);

  // Export handler
  const handleExport = () => {
    window.open(`${API_BASE_URL}/api/ordlyai/pipeline/export`, '_blank');
  };

  // Print Confirmation handler
  const handlePrintConfirmation = () => {
    setInfoDialog({
      open: true,
      title: 'Print Confirmation',
      message: 'Preparing SAP Order Confirmation for printing...\n\nThe order confirmation document will open in a new window.',
      type: 'info',
    });
  };

  // Open in SAP handler
  const handleOpenInSap = () => {
    if (selectedOrder) {
      setInfoDialog({
        open: true,
        title: 'Opening in SAP',
        message: `Launching SAP GUI with Order ${selectedOrder.id}...\n\nTransaction VA03 will display the sales order details.`,
        type: 'info',
      });
    }
  };

  // Process Another handler
  const handleProcessAnother = () => {
    setSelectedOrder(null);
  };

  // Complete handler
  const handleComplete = () => {
    setInfoDialog({
      open: true,
      title: 'Processing Complete',
      message: 'Order processing has been completed successfully.\n\nReturning to the order list.',
      type: 'success',
    });
    setSelectedOrder(null);
    fetchCommittedOrders();
  };

  const columns = [
    {
      field: 'commitStatus',
      headerName: 'Status',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const colors = {
          'success': { bg: alpha('#10b981', 0.12), color: '#059669' },
          'pending': { bg: alpha('#f59e0b', 0.12), color: '#d97706' },
          'failed': { bg: alpha('#ef4444', 0.12), color: '#dc2626' },
        };
        const style = colors[params.value] || colors.pending;
        return <Chip label={params.value.toUpperCase()} size="small" sx={{ ...style, fontWeight: 600, fontSize: '0.65rem' }} />;
      },
    },
    { field: 'id', headerName: 'SAP SO#', width: 150, renderCell: (params) => <Typography sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.8rem' }}>{params.value}</Typography> },
    { field: 'intentId', headerName: 'Purchase Order', width: 140, renderCell: (params) => <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>{params.value}</Typography> },
    { field: 'customer', headerName: 'Customer', flex: 1, minWidth: 180, renderCell: (params) => <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{params.value}</Typography> },
    { field: 'orderValue', headerName: 'Value', width: 100, align: 'right', headerAlign: 'right', renderCell: (params) => <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{params.value}</Typography> },
    { field: 'committedAt', headerName: 'Committed', width: 160, renderCell: (params) => <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{params.value}</Typography> },
    { field: 'user', headerName: 'User', width: 130, renderCell: (params) => <Chip label={params.value} size="small" sx={{ bgcolor: params.value === 'ORDLY_SYSTEM' ? alpha('#0854a0', 0.12) : alpha('#8b5cf6', 0.12), color: params.value === 'ORDLY_SYSTEM' ? '#1565c0' : '#7c3aed', fontWeight: 600, fontSize: '0.65rem' }} /> },
  ];

  const handleRowClick = (params) => setSelectedOrder(params.row);
  const handleBackToList = () => setSelectedOrder(null);

  // ==================== DETAIL VIEW ====================
  if (selectedOrder) {
    return (
      <Box sx={{ p: 3, minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: darkMode ? '#0d1117' : '#f8fafc', overflow: 'auto' }}>
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>ORDLY.AI</Link>
              <Link component="button" variant="body1" onClick={handleBackToList} sx={{ textDecoration: 'none', color: 'text.primary' }}>SAP Commit</Link>
              <Typography color="primary" variant="body1" fontWeight={600}>{selectedOrder.id}</Typography>
            </Breadcrumbs>
            <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList} variant="outlined" size="small">Back to List</Button>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
            <AccountTreeIcon sx={{ fontSize: 40, color: '#0854a0' }} />
            <Box>
              <Typography variant="h5" fontWeight={600}>{selectedOrder.customer}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedOrder.id} - {selectedOrder.orderValue}</Typography>
            </Box>
          </Stack>
        </Box>

        {/* Success Banner */}
        <Card variant="outlined" sx={{ mb: 3, borderLeft: `3px solid ${selectedOrder.commitStatus === 'success' ? '#10b981' : selectedOrder.commitStatus === 'pending' ? '#f59e0b' : '#ef4444'}`, bgcolor: alpha(selectedOrder.commitStatus === 'success' ? '#10b981' : selectedOrder.commitStatus === 'pending' ? '#f59e0b' : '#ef4444', 0.05) }}>
          <CardContent sx={{ py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: alpha(selectedOrder.commitStatus === 'success' ? '#10b981' : '#f59e0b', 0.12), color: selectedOrder.commitStatus === 'success' ? '#059669' : '#d97706', fontSize: 28 }}>
                <CheckCircleIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: selectedOrder.commitStatus === 'success' ? '#059669' : '#d97706' }}>
                  {selectedOrder.commitStatus === 'success' ? 'Order Successfully Committed to SAP' : 'Order Pending SAP Commit'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                  {selectedOrder.commitStatus === 'success' ? 'All validations passed - Sales Order created in SAP S/4HANA' : 'Awaiting manual confirmation'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>SAP Sales Order</Typography>
              <Typography variant="h4" fontWeight={700} sx={{ color: '#1565c0' }}>{selectedOrder.id}</Typography>
            </Box>
          </CardContent>
        </Card>

        <Grid container spacing={2} sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CheckCircleIcon sx={{ color: '#0854a0', fontSize: 18 }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Pre-Commit Validation</Typography>
                </Stack>
                <Chip label="SAP S/4HANA 2023" size="small" sx={{ bgcolor: alpha('#0854a0', 0.12), color: '#1565c0', fontWeight: 600, fontSize: '0.65rem' }} />
              </Box>
              <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
                {validationItems.map((item, idx) => (
                  <Paper key={idx} variant="outlined" sx={{ p: 1.5, mb: 1, borderLeft: '3px solid #10b981', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 20, height: 20, bgcolor: alpha('#10b981', 0.12), fontSize: 10 }}><CheckCircleIcon sx={{ fontSize: 14, color: '#059669' }} /></Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.8rem' }}>{item.text}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>{item.detail}</Typography>
                  </Paper>
                ))}

                <Paper variant="outlined" sx={{ overflow: 'hidden', mt: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: alpha('#0854a0', 0.08), borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#1565c0', textTransform: 'uppercase', letterSpacing: 1 }}>SAP Order Preview</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {(selectedOrder?.lineCount || 1) > 1 && (
                        <Chip
                          label={`${selectedOrder?.lineCount || 1} Line Items`}
                          size="small"
                          sx={{ bgcolor: alpha('#0854a0', 0.15), color: '#1565c0', fontWeight: 600, fontSize: '0.6rem' }}
                        />
                      )}
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>VA01 → VA03</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    {/* Header and Partner Data */}
                    {Object.entries(sapFields).filter(([section]) => section !== 'lineItem').map(([section, fields]) => (
                      <Box key={section} sx={{ mb: 2 }}>
                        <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, pb: 0.5, mb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                          {section === 'header' ? 'Header Data' : 'Partner Data'}
                        </Typography>
                        {fields.map((field) => (
                          <Box key={field.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>{field.label}</Typography>
                              <Chip label={field.code} size="small" sx={{ bgcolor: alpha('#0854a0', 0.08), color: '#1565c0', fontSize: '0.55rem', height: 16, '& .MuiChip-label': { px: 0.5 } }} />
                            </Box>
                            <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>{field.value}</Typography>
                          </Box>
                        ))}
                      </Box>
                    ))}

                    {/* Line Items - Multi-line accordion or single line */}
                    {(selectedOrder?.lineCount || 1) > 1 ? (
                      <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, pb: 0.5, mb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                          Line Items ({selectedOrder?.lineCount || 1})
                        </Typography>
                        {(selectedOrder?.lineItems || []).map((line) => (
                          <Paper
                            key={line.lineNumber}
                            variant="outlined"
                            sx={{
                              mb: 1,
                              overflow: 'hidden',
                              border: expandedLines[line.lineNumber] ? `1px solid ${alpha('#0854a0', 0.3)}` : undefined,
                            }}
                          >
                            <Box
                              sx={{
                                p: 1,
                                bgcolor: expandedLines[line.lineNumber] ? alpha('#0854a0', 0.06) : alpha('#64748b', 0.04),
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                '&:hover': { bgcolor: alpha('#0854a0', 0.08) },
                              }}
                              onClick={() => setExpandedLines(prev => ({ ...prev, [line.lineNumber]: !prev[line.lineNumber] }))}
                            >
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Chip
                                  label={`Line ${line.lineNumber}`}
                                  size="small"
                                  sx={{ bgcolor: alpha('#0854a0', 0.15), color: '#0854a0', fontWeight: 700, fontSize: '0.6rem', height: 18 }}
                                />
                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                                  {line.selectedSku || line.materialId || 'N/A'}
                                </Typography>
                              </Stack>
                              <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                                {expandedLines[line.lineNumber] ? '▼' : '▶'}
                              </Typography>
                            </Box>
                            {expandedLines[line.lineNumber] && (
                              <Box sx={{ p: 1.5, bgcolor: 'background.paper' }}>
                                {[
                                  { label: 'Material', code: 'MATNR', value: line.selectedSku || line.materialId || 'N/A' },
                                  { label: 'Quantity', code: 'KWMENG', value: `${line.quantity?.toLocaleString() || 0} ${line.unit || 'LM'}` },
                                  { label: 'Plant', code: 'WERKS', value: line.selectedPlant || '2100' },
                                  { label: 'Net Value', code: 'NETWR', value: `$${(line.extendedPrice || 0).toLocaleString()}` },
                                ].map((field) => (
                                  <Box key={field.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.25 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>{field.label}</Typography>
                                      <Chip label={field.code} size="small" sx={{ bgcolor: alpha('#0854a0', 0.08), color: '#1565c0', fontSize: '0.5rem', height: 14, '& .MuiChip-label': { px: 0.5 } }} />
                                    </Box>
                                    <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem' }}>{field.value}</Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}
                          </Paper>
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, pb: 0.5, mb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                          Line Item
                        </Typography>
                        {sapFields.lineItem.map((field) => (
                          <Box key={field.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>{field.label}</Typography>
                              <Chip label={field.code} size="small" sx={{ bgcolor: alpha('#0854a0', 0.08), color: '#1565c0', fontSize: '0.55rem', height: 16, '& .MuiChip-label': { px: 0.5 } }} />
                            </Box>
                            <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>{field.value}</Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Box>
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                <Button startIcon={<PrintIcon />} variant="outlined" size="small" onClick={handlePrintConfirmation} sx={{ flex: 1, fontSize: '0.75rem' }}>Print Confirmation</Button>
                <Button startIcon={<LaunchIcon />} size="small" onClick={handleOpenInSap} sx={{ flex: 1, fontSize: '0.75rem', bgcolor: alpha('#0854a0', 0.12), border: '1px solid', borderColor: alpha('#0854a0', 0.3), color: '#1565c0' }}>Open in SAP</Button>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon sx={{ color: '#0854a0', fontSize: 18 }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Decision Lineage & Audit</Typography>
              </Box>
              <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>Full Decision Trace</Typography>
                  <Box sx={{ position: 'relative', pl: 3 }}>
                    <Box sx={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, bgcolor: '#0854a0' }} />
                    {lineageSteps.map((step, idx) => (
                      <Box key={idx} sx={{ position: 'relative', pb: 2, mb: 2, borderBottom: idx < lineageSteps.length - 1 ? '1px dashed' : 'none', borderColor: 'divider' }}>
                        <Box sx={{ position: 'absolute', left: -20, top: 4, width: 12, height: 12, borderRadius: '50%', bgcolor: '#0854a0', border: '2px solid white' }} />
                        <Typography sx={{ fontSize: '0.7rem', color: '#1565c0', textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}>{step.stage}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', lineHeight: 1.5, display: 'block', fontSize: '0.75rem' }}>{step.detail}</Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.65rem', mt: 0.5, display: 'block' }}>{step.meta}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, borderLeft: '3px solid #0854a0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <DescriptionIcon sx={{ color: '#0854a0', fontSize: 14 }} />
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>BAPI Execution Log</Typography>
                    </Stack>
                    <Chip label="RFC Active" size="small" sx={{ bgcolor: alpha('#10b981', 0.12), color: '#059669', fontWeight: 600, fontSize: '0.6rem', height: 20 }} />
                  </Box>
                  <Box sx={{ maxHeight: 140, overflow: 'auto', fontFamily: 'monospace' }}>
                    {auditLog.map((entry, idx) => (
                      <Box key={idx} sx={{ display: 'flex', gap: 1.5, py: 0.5, borderBottom: idx < auditLog.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                        <Typography variant="caption" sx={{ color: '#64748b', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.7rem' }}>[{entry.timestamp}]</Typography>
                        <Typography variant="caption" sx={{ color: '#1565c0', fontFamily: 'monospace', fontSize: '0.7rem' }}>{entry.action}</Typography>
                        <Typography variant="caption" sx={{ color: '#059669', fontFamily: 'monospace', fontSize: '0.7rem' }}>{entry.result}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Box>
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" onClick={handleProcessAnother} sx={{ flex: 1, fontSize: '0.75rem' }}>Process Another</Button>
                <Button variant="contained" size="small" onClick={handleComplete} sx={{ flex: 1, fontSize: '0.75rem', bgcolor: '#0854a0', '&:hover': { bgcolor: '#1565c0' } }}>Complete - Return to Inbox</Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
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
            <Typography color="primary" variant="body1" fontWeight={600}>SAP Commit & Trace</Typography>
          </Breadcrumbs>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh"><IconButton color="primary" onClick={fetchCommittedOrders} disabled={loading}><RefreshIcon /></IconButton></Tooltip>
            <Tooltip title="Export"><IconButton color="primary" onClick={handleExport}><DownloadIcon /></IconButton></Tooltip>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back to ORDLY.AI</Button>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <AccountTreeIcon sx={{ fontSize: 40, color: '#0854a0' }} />
          <Typography variant="h5" fontWeight={600}>SAP Commit & Trace</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">Pre-commit validation, SAP integration, and full decision lineage - Click a row to view details</Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Success Rate', value: stats.rate, color: '#10b981' },
          { label: 'Total Committed', value: stats.success, color: '#0854a0' },
          { label: 'Pending', value: stats.pending, color: '#f59e0b' },
          { label: 'Failed', value: stats.failed, color: '#ef4444' },
          { label: 'Total Orders', value: stats.total, color: '#8b5cf6' },
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
            <HistoryIcon sx={{ color: '#0854a0', fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>Committed Orders</Typography>
          </Stack>
          <Chip label={`${stats.total} orders`} size="small" sx={{ bgcolor: alpha('#0854a0', 0.12), color: '#1565c0', fontWeight: 600, fontSize: '0.7rem' }} />
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              <Button variant="outlined" onClick={fetchCommittedOrders}>Retry</Button>
            </Box>
          ) : (
            <DataGrid
              rows={committedOrders}
              columns={columns}
              density="compact"
              initialState={{ pagination: { paginationModel: { pageSize: 25 } }, sorting: { sortModel: [{ field: 'committedAt', sort: 'desc' }] } }}
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

export default SapCommitTrace;
