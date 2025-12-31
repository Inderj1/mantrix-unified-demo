import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  TextField,
  Card,
  CardContent,
  Stack,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip,
  alpha,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Inbox as InboxIcon,
  Description as DescriptionIcon,
  SmartToy as SmartToyIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
  NavigateNext as NavigateNextIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  LocalShipping as LocalShippingIcon,
  Receipt as ReceiptIcon,
  Inventory as InventoryIcon,
  EventNote as EventNoteIcon,
  Info as InfoIcon,
  AttachMoney as AttachMoneyIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  PictureAsPdf as PdfIcon,
  Close as CloseIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { Dialog, DialogContent } from '@mui/material';
import ordlyTheme from './ordlyTheme';
import ConfirmationDialog from './ConfirmationDialog';
import InfoDialog from './InfoDialog';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

// Primary blue color for ORDLY.AI
const PRIMARY_BLUE = '#0854a0';
const ACCENT_BLUE = '#1976d2';

// Helper to generate extracted fields from selected order (dynamic from PO extraction)
const getExtractedFields = (order) => {
  if (!order) return [];
  const conf = order.confidence || 90;
  const getLevel = (c) => c >= 90 ? 'high' : c >= 70 ? 'med' : 'low';

  // Build comprehensive list of extracted fields grouped by category
  const fields = [];

  // Order Identification
  fields.push({ label: 'PO Number', value: order.poNumber || order.id?.replace(/^(PO-|ORD-|INT-)/, '') || 'N/A', confidence: 99, level: 'high', category: 'order' });

  // Buyer Information
  fields.push({ label: 'Customer', value: order.customer || 'Unknown', confidence: Math.min(conf + 3, 99), level: 'high', category: 'buyer' });
  if (order.buyerName) fields.push({ label: 'Buyer Name', value: order.buyerName, confidence: conf, level: getLevel(conf), category: 'buyer' });
  if (order.buyerEmail) fields.push({ label: 'Buyer Email', value: order.buyerEmail, confidence: Math.min(conf + 5, 99), level: 'high', category: 'buyer' });
  if (order.buyerPhone) fields.push({ label: 'Buyer Phone', value: order.buyerPhone, confidence: Math.max(conf - 5, 70), level: getLevel(conf - 5), category: 'buyer' });

  // Ship-To Information
  if (order.shipToName) fields.push({ label: 'Ship-To Name', value: order.shipToName, confidence: Math.min(conf + 2, 99), level: 'high', category: 'shipto' });
  if (order.shipToAddress) fields.push({ label: 'Ship-To Address', value: order.shipToAddress, confidence: conf, level: getLevel(conf), category: 'shipto' });
  const shipToLocation = [order.shipToCity, order.shipToState, order.shipToZip].filter(Boolean).join(', ');
  if (shipToLocation) fields.push({ label: 'Ship-To Location', value: shipToLocation, confidence: Math.min(conf + 1, 99), level: 'high', category: 'shipto' });

  // Bill-To Information
  if (order.billToName) fields.push({ label: 'Bill-To Name', value: order.billToName, confidence: conf, level: getLevel(conf), category: 'billto' });
  if (order.billTo && order.billTo !== order.billToName) fields.push({ label: 'Bill-To Address', value: order.billTo, confidence: Math.max(conf - 3, 75), level: getLevel(conf - 3), category: 'billto' });

  // Item Data (VBAP) - show all items for multi-position orders
  const lineItems = order.lineItems || [];
  if (lineItems.length > 0) {
    // Add item count summary
    fields.push({ label: 'Total Items (POSNR)', value: `${lineItems.length} position${lineItems.length > 1 ? 's' : ''}`, confidence: 99, level: 'high', category: 'lineitem' });

    // For multi-item orders, add each item as a structured block
    lineItems.forEach((li, idx) => {
      const lineNum = li.lineNumber || (idx + 1);

      // Create a structured item entry with all fields grouped
      const itemFields = [];
      if (li.material) itemFields.push({ key: 'Material', value: li.material });
      if (li.materialId) itemFields.push({ key: 'SAP Item #', value: li.materialId });
      if (li.quantity) itemFields.push({ key: 'Quantity', value: `${li.quantity.toLocaleString()} ${li.unit || ''}`.trim() });
      if (li.unitPrice) itemFields.push({ key: 'Unit Price', value: `$${li.unitPrice.toFixed(4)}` });
      if (li.extendedPrice) itemFields.push({ key: 'Line Value', value: `$${li.extendedPrice.toLocaleString()}` });

      // Add as a single structured item entry
      fields.push({
        label: `Item ${lineNum}`,
        value: itemFields,
        confidence: conf,
        level: getLevel(conf),
        category: 'lineitem',
        isStructuredItem: true,
        lineNumber: lineNum,
      });
    });
  } else {
    // Fallback to header-level fields for single line items
    if (order.materialDescription) fields.push({ label: 'Material Description', value: order.materialDescription, confidence: Math.max(conf - 2, 70), level: getLevel(conf - 2), category: 'lineitem' });
    if (order.materialSpec) fields.push({ label: 'Material Spec', value: order.materialSpec, confidence: Math.max(conf - 5, 65), level: getLevel(conf - 5), category: 'lineitem' });
    if (order.materialId) fields.push({ label: 'Item Number', value: order.materialId, confidence: conf, level: getLevel(conf), category: 'lineitem' });
    if (order.quantity) fields.push({ label: 'Quantity', value: order.quantity, confidence: Math.max(conf - 8, 65), level: getLevel(conf - 8), category: 'lineitem' });
    if (order.rollWidth) fields.push({ label: 'Roll Width', value: order.rollWidth, confidence: Math.max(conf - 10, 60), level: getLevel(conf - 10), category: 'lineitem' });
    if (order.unitPrice) fields.push({ label: 'Unit Price', value: `$${order.unitPrice.toFixed(2)}`, confidence: Math.min(conf + 5, 99), level: 'high', category: 'lineitem' });
  }

  // Delivery & Terms
  if (order.deliveryDate) fields.push({ label: 'Requested Delivery', value: order.deliveryDate, confidence: Math.max(conf - 15, 55), level: getLevel(conf - 15), category: 'terms' });
  if (order.paymentTerms) fields.push({ label: 'Payment Terms', value: order.paymentTerms, confidence: Math.min(conf + 3, 99), level: 'high', category: 'terms' });
  if (order.freightTerms) fields.push({ label: 'Freight Terms', value: order.freightTerms, confidence: Math.min(conf + 2, 98), level: 'high', category: 'terms' });
  if (order.incoterms) fields.push({ label: 'Incoterms', value: order.incoterms, confidence: Math.min(conf + 4, 99), level: 'high', category: 'terms' });

  // Special Instructions
  if (order.shippingInstructions) fields.push({ label: 'Shipping Instructions', value: order.shippingInstructions, confidence: Math.max(conf - 20, 50), level: getLevel(conf - 20), category: 'special' });
  if (order.specialInstructions) fields.push({ label: 'Special Instructions', value: order.specialInstructions, confidence: Math.max(conf - 25, 45), level: getLevel(conf - 25), category: 'special' });

  // Order Value
  if (order.value) fields.push({ label: 'Total Order Value', value: `$${order.value.toLocaleString()}`, confidence: Math.min(conf + 8, 99), level: 'high', category: 'value' });

  return fields;
};

const chatMessages = [
  { role: 'ai', content: "I've analyzed this order from 3M Industrial Adhesives. This appears to be a rush order for release liner with premium silicone coating.\n\nKey findings:\n- Customer has ordered similar specs 12 times in past 18 months\n- Last similar order shipped from Plant 2100 (Chicago)\n- Requested delivery (Jan 15) is 8 days from receipt - tight for this spec\n\nWould you like me to check SKU availability and margin options?" },
  { role: 'user', content: 'What did we ship last time for similar thickness and coating?' },
  { role: 'ai', content: 'Last 3 orders with 50um PET + Premium Silicone for 3M:\n\n- SO-892341: SKU RL-PET50-SIL-P (exact match) @ $2.45/LM\n- SO-871256: SKU RL-PET50-SIL-S (standard silicone) @ $2.12/LM\n- SO-865892: SKU RL-PET50-SIL-P @ $2.38/LM\n\nCustomer accepted the standard silicone alternate once when premium was backordered. Margin was 4.2% higher.' },
];

const CustomerIntentCockpit = ({ onBack, darkMode = false, selectedOrder: initialOrder = null, selectedLineNumber: initialLineNumber = null, onNavigate }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('po');
  const [chatInput, setChatInput] = useState('');
  const [activeLineNumber, setActiveLineNumber] = useState(1); // For multi-line orders

  // Navigation confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({ open: false, order: null });

  // Info dialog state (replaces browser alerts)
  const [infoDialog, setInfoDialog] = useState({ open: false, title: '', message: '', type: 'info' });

  // Data fetching state
  const [intentOrders, setIntentOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    rush: 0,
    lowConf: 0,
    avgConf: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similarOrders, setSimilarOrders] = useState([]);
  const [pdfFullscreen, setPdfFullscreen] = useState(false);

  // Get PDF URL for the selected order
  const getPdfUrl = (order) => {
    if (!order) return null;
    const orderId = order.id?.replace(/^(PO-|ORD-|INT-)/, '') || order.poNumber;
    return `${API_BASE_URL}/api/ordlyai/intent/orders/${orderId}/pdf`;
  };

  // Fetch intent orders from API
  const fetchIntentOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/intent/orders?limit=50`);
      if (!response.ok) throw new Error('Failed to fetch intent orders');
      const data = await response.json();

      setIntentOrders(data.orders);
      setStats({
        total: data.stats.total || data.orders.length,
        rush: data.stats.rush || data.orders.filter(o => o.priority === 'high').length,
        lowConf: data.orders.filter(o => o.confidence < 75).length,
        avgConf: Math.round(data.stats.avgConf || 0),
      });
    } catch (err) {
      console.error('Error fetching intent orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch similar orders for selected order
  const fetchSimilarOrders = async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/intent/orders/${orderId}/similar?limit=5`);
      if (!response.ok) throw new Error('Failed to fetch similar orders');
      const data = await response.json();
      setSimilarOrders(data);
    } catch (err) {
      console.error('Error fetching similar orders:', err);
      setSimilarOrders([]);
    }
  };

  useEffect(() => {
    fetchIntentOrders();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      fetchSimilarOrders(selectedOrder.id);
    }
  }, [selectedOrder]);

  // Handle initial order passed from Pipeline navigation
  useEffect(() => {
    if (initialOrder && intentOrders.length > 0) {
      const rawOrderId = (initialOrder.id || '').replace(/^(PO-|INT-|ORD-)/, '');
      const matchingOrder = intentOrders.find(o => {
        const rawOId = (o.id || '').replace(/^(PO-|INT-|ORD-)/, '');
        return rawOId === rawOrderId || o.id?.includes(rawOrderId);
      });
      if (matchingOrder) {
        const orderWithLines = {
          ...matchingOrder,
          lineItems: initialOrder.lineItems || matchingOrder.lineItems || [],
          lineCount: initialOrder.lineCount || matchingOrder.lineCount || 1,
        };
        setSelectedOrder(orderWithLines);
        if (initialLineNumber) {
          setActiveLineNumber(initialLineNumber);
        }
      }
    }
  }, [initialOrder, intentOrders, initialLineNumber]);

  // Export handler
  const handleExport = () => {
    window.open(`${API_BASE_URL}/api/ordlyai/intent/export`, '_blank');
  };

  // Promote to Decisioning handler
  const handlePromote = async () => {
    if (!selectedOrder) return;
    try {
      const orderId = selectedOrder.id.replace(/^(PO-|ORD-|INT-)/, '');
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/order/${orderId}/promote`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to promote order');
      const result = await response.json();

      // Show themed confirmation dialog
      setConfirmDialog({ open: true, order: { ...selectedOrder, stage: 1 } });
    } catch (err) {
      console.error('Error promoting order:', err);
      setInfoDialog({ open: true, title: 'Error', message: err.message, type: 'error' });
    }
  };

  // Handle confirmation dialog actions
  const handleConfirmNavigate = () => {
    if (onNavigate && confirmDialog.order) {
      onNavigate('sku-decisioning', confirmDialog.order);
    }
    setConfirmDialog({ open: false, order: null });
  };

  const handleCancelNavigate = () => {
    setConfirmDialog({ open: false, order: null });
    setSelectedOrder(null);
    fetchIntentOrders();
  };

  // Re-Extract handler (simulated)
  const handleReExtract = () => {
    setInfoDialog({
      open: true,
      title: 'Re-Extracting Fields',
      message: 'AI document extraction is analyzing the order...\n\nThis feature uses machine learning to extract and validate order fields from the source document.',
      type: 'info',
    });
  };

  // Request Clarification handler (simulated)
  const handleRequestClarification = () => {
    setInfoDialog({
      open: true,
      title: 'Clarification Requested',
      message: 'A clarification request has been sent to the customer.\n\nThe automated email includes a link for the customer to provide missing or unclear information.',
      type: 'success',
    });
  };

  // DataGrid columns
  const columns = [
    {
      field: 'priority',
      headerName: 'Priority',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const colors = {
          high: { bg: alpha('#ef4444', 0.12), color: '#dc2626' },
          medium: { bg: alpha('#f59e0b', 0.12), color: '#d97706' },
          normal: { bg: alpha('#10b981', 0.12), color: '#059669' },
          low: { bg: alpha('#64748b', 0.12), color: '#64748b' },
        };
        const style = colors[params.value] || colors.normal;
        return <Chip label={params.value.toUpperCase()} size="small" sx={{ ...style, fontWeight: 600, fontSize: '0.65rem' }} />;
      },
    },
    {
      field: 'id',
      headerName: 'Purchase Order',
      width: 140,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 700, color: ACCENT_BLUE, fontSize: '0.8rem' }}>{params.value}</Typography>
      ),
    },
    {
      field: 'customer',
      headerName: 'Customer',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{params.value}</Typography>
      ),
    },
    {
      field: 'subject',
      headerName: 'Subject',
      flex: 1.5,
      minWidth: 250,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }} noWrap>{params.value}</Typography>
      ),
    },
    {
      field: 'tags',
      headerName: 'Tags',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {params.value.map((tag) => {
            const tagColors = {
              'New Order': { bg: alpha('#10b981', 0.12), color: '#059669' },
              'Rush': { bg: alpha('#ef4444', 0.12), color: '#dc2626' },
              'Change Req': { bg: alpha('#f59e0b', 0.12), color: '#d97706' },
              'Expedite': { bg: alpha('#ef4444', 0.12), color: '#dc2626' },
              'Spec Clarify': { bg: alpha('#8b5cf6', 0.12), color: '#7c3aed' },
              'Quote Req': { bg: alpha(ACCENT_BLUE, 0.12), color: ACCENT_BLUE },
            };
            const style = tagColors[tag] || { bg: alpha('#64748b', 0.12), color: '#64748b' };
            return <Chip key={tag} label={tag} size="small" sx={{ ...style, fontSize: '0.6rem', height: 20, fontWeight: 600 }} />;
          })}
        </Box>
      ),
    },
    {
      field: 'confidence',
      headerName: 'Confidence',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const color = params.value >= 90 ? '#059669' : params.value >= 75 ? '#d97706' : '#dc2626';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 40, height: 6, bgcolor: alpha('#64748b', 0.2), borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ width: `${params.value}%`, height: '100%', bgcolor: color, borderRadius: 3 }} />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.75rem', color }}>{params.value}%</Typography>
          </Box>
        );
      },
    },
    {
      field: 'slaTimer',
      headerName: 'SLA',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const hours = parseFloat(params.value);
        const color = hours <= 2 ? '#dc2626' : hours <= 6 ? '#d97706' : '#64748b';
        return <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color }}>{params.value}</Typography>;
      },
    },
    {
      field: 'received',
      headerName: 'Received',
      width: 140,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>{params.value}</Typography>
      ),
    },
  ];

  const handleRowClick = (params) => {
    setSelectedOrder(params.row);
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
  };

  const getTagColor = (tag) => {
    if (tag.includes('New')) return { bg: alpha('#10b981', 0.12), color: '#059669' };
    if (tag.includes('Rush')) return { bg: alpha('#ef4444', 0.12), color: '#dc2626' };
    if (tag.includes('Change')) return { bg: alpha('#f59e0b', 0.12), color: '#d97706' };
    return { bg: alpha('#8b5cf6', 0.12), color: '#7c3aed' };
  };

  const getConfidenceColor = (level) => {
    if (level === 'high') return '#059669';
    if (level === 'med') return '#d97706';
    return '#dc2626';
  };

  // ==================== DETAIL VIEW ====================
  if (selectedOrder) {
    return (
      <Box sx={{ p: 3, minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: darkMode ? '#0d1117' : '#f8fafc', overflow: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>
                ORDLY.AI
              </Link>
              <Link component="button" variant="body1" onClick={handleBackToList} sx={{ textDecoration: 'none', color: 'text.primary' }}>
                Intent Cockpit
              </Link>
              <Typography color="primary" variant="body1" fontWeight={600}>
                {selectedOrder.id}
              </Typography>
            </Breadcrumbs>
            <Button startIcon={<ArrowBackIcon />} onClick={handleBackToList} variant="outlined" size="small">
              Back to List
            </Button>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
            <EmailIcon sx={{ fontSize: 40, color: '#0854a0' }} />
            <Box>
              <Typography variant="h5" fontWeight={600}>{selectedOrder.customer}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedOrder.subject}</Typography>
            </Box>
          </Stack>
        </Box>

        {/* Line Item Tabs - Only show for multi-line orders */}
        {(selectedOrder?.lineCount || 1) > 1 && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            mb: 2,
            bgcolor: alpha('#0854a0', 0.04),
            borderRadius: 2,
            border: `1px solid ${alpha('#0854a0', 0.1)}`,
          }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', mr: 1 }}>
                Line Items:
              </Typography>
              {(selectedOrder?.lineItems || []).map((line) => {
                const isActive = activeLineNumber === line.lineNumber;
                return (
                  <Chip
                    key={line.lineNumber}
                    label={`Line ${line.lineNumber}: ${line.material?.slice(0, 20) || 'Item'}...`}
                    onClick={() => setActiveLineNumber(line.lineNumber)}
                    size="small"
                    sx={{
                      bgcolor: isActive ? alpha('#0854a0', 0.15) : alpha('#64748b', 0.08),
                      color: isActive ? '#0854a0' : '#64748b',
                      border: isActive ? `2px solid #0854a0` : '1px solid transparent',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: alpha('#0854a0', 0.12) },
                    }}
                  />
                );
              })}
            </Stack>
            <Chip
              label={`${selectedOrder?.lineCount || 1} items in PO`}
              size="small"
              sx={{
                bgcolor: alpha('#0854a0', 0.1),
                color: '#0854a0',
                fontWeight: 600,
                fontSize: '0.65rem',
              }}
            />
          </Box>
        )}

        {/* Main Grid */}
        <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
          {/* Center Panel: Document Viewer */}
          <Grid item xs={12} md={7} sx={{ display: 'flex' }}>
            <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <DescriptionIcon sx={{ color: '#0854a0', fontSize: 18 }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Document Extraction
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5}>
                  {['PO', 'Email', 'Spec'].map((tab) => (
                    <Chip
                      key={tab}
                      label={tab}
                      size="small"
                      onClick={() => setActiveTab(tab.toLowerCase())}
                      sx={{
                        bgcolor: activeTab === tab.toLowerCase() ? alpha('#0854a0', 0.12) : alpha('#64748b', 0.08),
                        color: activeTab === tab.toLowerCase() ? '#1565c0' : '#64748b',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </Stack>
              </Box>
              <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
                {/* PDF Document Viewer */}
                <Paper
                  variant="outlined"
                  sx={{
                    mb: 2,
                    bgcolor: darkMode ? '#1e293b' : '#f8fafc',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {/* PDF Header */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      bgcolor: darkMode ? '#0f172a' : '#e2e8f0',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PdfIcon sx={{ fontSize: 18, color: '#dc2626' }} />
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#334155' }}>
                        {selectedOrder.poNumber || selectedOrder.id?.replace(/^(PO-|ORD-|INT-)/, '')} - {selectedOrder.customer}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Open in new tab">
                        <IconButton
                          size="small"
                          onClick={() => window.open(getPdfUrl(selectedOrder), '_blank')}
                          sx={{ color: '#64748b' }}
                        >
                          <OpenInNewIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Fullscreen">
                        <IconButton
                          size="small"
                          onClick={() => setPdfFullscreen(true)}
                          sx={{ color: '#64748b' }}
                        >
                          <FullscreenIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>

                  {/* PDF Embed */}
                  <Box sx={{ height: 300 }}>
                    <iframe
                      src={getPdfUrl(selectedOrder)}
                      width="100%"
                      height="100%"
                      style={{ border: 'none' }}
                      title={`PO Document - ${selectedOrder.poNumber || selectedOrder.id}`}
                    />
                  </Box>
                </Paper>

                {/* Fullscreen PDF Dialog */}
                <Dialog
                  open={pdfFullscreen}
                  onClose={() => setPdfFullscreen(false)}
                  maxWidth={false}
                  fullWidth
                  PaperProps={{
                    sx: {
                      width: '95vw',
                      height: '95vh',
                      maxWidth: 'none',
                      maxHeight: 'none',
                      m: 0,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      bgcolor: '#0854a0',
                      color: 'white',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PdfIcon sx={{ fontSize: 20 }} />
                      <Typography fontWeight={600}>
                        {selectedOrder.poNumber || selectedOrder.id?.replace(/^(PO-|ORD-|INT-)/, '')} - {selectedOrder.customer}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Open in new tab">
                        <IconButton
                          size="small"
                          onClick={() => window.open(getPdfUrl(selectedOrder), '_blank')}
                          sx={{ color: 'white' }}
                        >
                          <OpenInNewIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <IconButton size="small" onClick={() => setPdfFullscreen(false)} sx={{ color: 'white' }}>
                        <CloseIcon />
                      </IconButton>
                    </Stack>
                  </Box>
                  <DialogContent sx={{ p: 0, height: 'calc(100% - 56px)' }}>
                    <iframe
                      src={getPdfUrl(selectedOrder)}
                      width="100%"
                      height="100%"
                      style={{ border: 'none' }}
                      title={`PO Document - ${selectedOrder.poNumber || selectedOrder.id}`}
                    />
                  </DialogContent>
                </Dialog>

                {/* Extracted Fields */}
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981' }} /> Extracted Order Intent
                  <Chip
                    label={`${getExtractedFields(selectedOrder).length} fields`}
                    size="small"
                    sx={{ ml: 'auto', bgcolor: alpha('#10b981', 0.1), color: '#059669', fontSize: '0.65rem', height: 18 }}
                  />
                </Typography>
                <Box sx={{ maxHeight: 400, overflow: 'auto', pr: 0.5 }}>
                  {(() => {
                    const fields = getExtractedFields(selectedOrder);
                    const categories = {
                      order: { label: 'Order Identification', icon: <AssignmentIcon sx={{ fontSize: 12, color: '#0854a0' }} /> },
                      buyer: { label: 'Buyer Information', icon: <PersonIcon sx={{ fontSize: 12, color: '#1976d2' }} /> },
                      shipto: { label: 'Ship-To Details', icon: <LocalShippingIcon sx={{ fontSize: 12, color: '#0d47a1' }} /> },
                      billto: { label: 'Bill-To Details', icon: <ReceiptIcon sx={{ fontSize: 12, color: '#5c6bc0' }} /> },
                      lineitem: { label: 'Item Data (VBAP)', icon: <InventoryIcon sx={{ fontSize: 12, color: '#0a6ed1' }} /> },
                      terms: { label: 'Delivery & Terms', icon: <EventNoteIcon sx={{ fontSize: 12, color: '#2196f3' }} /> },
                      special: { label: 'Special Instructions', icon: <InfoIcon sx={{ fontSize: 12, color: '#f59e0b' }} /> },
                      value: { label: 'Order Value', icon: <AttachMoneyIcon sx={{ fontSize: 12, color: '#10b981' }} /> },
                    };
                    const groupedFields = {};
                    fields.forEach(f => {
                      const cat = f.category || 'other';
                      if (!groupedFields[cat]) groupedFields[cat] = [];
                      groupedFields[cat].push(f);
                    });

                    return Object.entries(groupedFields).map(([cat, catFields]) => (
                      <Box key={cat} sx={{ mb: 1.5 }}>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {categories[cat]?.icon || <DescriptionIcon sx={{ fontSize: 12, color: '#64748b' }} />}
                          {categories[cat]?.label || cat}
                        </Typography>
                        {catFields.map((field) => (
                          field.isStructuredItem ? (
                            // Render structured item as a card with grouped fields
                            <Paper
                              key={field.label}
                              variant="outlined"
                              sx={{
                                p: 1.5,
                                mb: 1,
                                borderLeft: `3px solid #0854a0`,
                                borderRadius: 1,
                                bgcolor: darkMode ? alpha('#0854a0', 0.08) : alpha('#0854a0', 0.03),
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#0854a0', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <InventoryIcon sx={{ fontSize: 14 }} />
                                  {field.label}
                                </Typography>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: getConfidenceColor(field.level) }} />
                              </Box>
                              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0.75 }}>
                                {field.value.map((item, i) => (
                                  <Box key={i} sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Typography sx={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                                      {item.key}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: darkMode ? '#fff' : '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.value}>
                                      {item.value}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            </Paper>
                          ) : (
                            // Render regular field
                            <Paper
                              key={field.label}
                              variant="outlined"
                              sx={{
                                p: 1,
                                mb: 0.5,
                                borderLeft: `3px solid ${getConfidenceColor(field.level)}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                bgcolor: darkMode ? alpha('#64748b', 0.05) : 'white',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.65rem', minWidth: 100 }}>
                                  {field.label}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.75rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={field.value}>
                                  {field.value}
                                </Typography>
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: getConfidenceColor(field.level),
                                    flexShrink: 0,
                                  }}
                                />
                              </Box>
                            </Paper>
                          )
                        ))}
                      </Box>
                    ));
                  })()}
                </Box>
              </Box>
              {/* Action Bar */}
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                <Button startIcon={<RefreshIcon />} variant="outlined" size="small" onClick={handleReExtract} sx={{ flex: 1, fontSize: '0.75rem' }}>Re-Extract</Button>
                <Button startIcon={<SendIcon />} variant="outlined" size="small" onClick={handleRequestClarification} sx={{ flex: 1, fontSize: '0.75rem' }}>Request Clarification</Button>
                <Button variant="contained" size="small" onClick={handlePromote} sx={{ flex: 1, fontSize: '0.75rem', bgcolor: '#0854a0', '&:hover': { bgcolor: '#1565c0' } }}>
                  Promote to Decisioning
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* Right Panel: Axis Chat & Similar Orders */}
          <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
            <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Axis Chat */}
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <SmartToyIcon sx={{ color: '#0854a0', fontSize: 18 }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Axis Chat
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981' }} />
                  <Typography variant="caption" sx={{ color: '#10b981', fontSize: '0.7rem' }}>Connected</Typography>
                </Stack>
              </Box>
              <Box sx={{ p: 2, maxHeight: 280, overflow: 'auto', flex: 1 }}>
                {chatMessages.map((msg, idx) => (
                  <Box key={idx} sx={{ mb: 2, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    <Box
                      sx={{
                        display: 'inline-block',
                        maxWidth: '90%',
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: msg.role === 'user' ? '#0854a0' : alpha('#0854a0', 0.08),
                        border: msg.role === 'ai' ? '1px solid' : 'none',
                        borderColor: alpha('#0854a0', 0.2),
                      }}
                    >
                      <Typography variant="caption" sx={{ color: msg.role === 'user' ? 'white' : '#64748b', whiteSpace: 'pre-line', fontSize: '0.75rem' }}>
                        {msg.content}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ask about this order, customer history, or SKU options..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem' } }}
                />
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                  {['Similar orders?', 'Check ATP', 'Credit status', 'Best margin?'].map((prompt) => (
                    <Chip
                      key={prompt}
                      label={prompt}
                      size="small"
                      onClick={() => setChatInput(prompt)}
                      sx={{
                        bgcolor: alpha('#64748b', 0.08),
                        color: '#64748b',
                        fontSize: '0.65rem',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: alpha('#0854a0', 0.12), color: '#1565c0' },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Similar Orders */}
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <HistoryIcon sx={{ color: '#0854a0', fontSize: 18 }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Similar Past Orders
                  </Typography>
                </Stack>
                {similarOrders.map((order) => (
                  <Paper
                    key={order.so}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': { borderColor: '#0854a0', bgcolor: alpha('#0854a0', 0.05) },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ color: '#1565c0', fontSize: '0.8rem' }}>{order.so}</Typography>
                      <Chip label={order.match} size="small" sx={{ bgcolor: alpha('#10b981', 0.12), color: '#059669', fontSize: '0.65rem', height: 18, fontWeight: 600 }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>{order.details}</Typography>
                  </Paper>
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Navigation Confirmation Dialog */}
        <ConfirmationDialog
          open={confirmDialog.open}
          onClose={handleCancelNavigate}
          onConfirm={handleConfirmNavigate}
          title="Order Promoted Successfully"
          message={`Order ${confirmDialog.order?.id || ''} has been promoted to the Decisioning stage.\n\nWould you like to continue to SKU Decisioning to review margin and lead time options?`}
          confirmText="View in SKU Decisioning"
          cancelText="Stay Here"
          darkMode={darkMode}
        />

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
  }

  // ==================== LIST VIEW (DataGrid) ====================
  return (
    <Box sx={{ p: 3, minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: darkMode ? '#0d1117' : '#f8fafc', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary' }}>
              ORDLY.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              Customer Intent Cockpit
            </Typography>
          </Breadcrumbs>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh"><IconButton color="primary" onClick={fetchIntentOrders} disabled={loading}><RefreshIcon /></IconButton></Tooltip>
            <Tooltip title="Export"><IconButton color="primary" onClick={handleExport}><DownloadIcon /></IconButton></Tooltip>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
              Back to ORDLY.AI
            </Button>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <EmailIcon sx={{ fontSize: 40, color: '#0854a0' }} />
          <Typography variant="h5" fontWeight={600}>Customer Intent Cockpit</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          AI-powered customer intent analysis and order intake - Click a row to view details
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Inbox Queue', value: stats.total, color: PRIMARY_BLUE },
          { label: 'Rush Orders', value: stats.rush, color: '#ef4444' },
          { label: 'Low Confidence', value: stats.lowConf, color: '#f59e0b' },
          { label: 'Avg. Confidence', value: `${stats.avgConf}%`, color: '#10b981' },
          { label: 'Avg. Processing', value: '3.2m', color: '#8b5cf6' },
        ].map((card) => (
          <Grid item xs={12} sm={6} md={2.4} key={card.label}>
            <Card variant="outlined" sx={{ borderLeft: `3px solid ${card.color}` }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
                  {card.label}
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: card.color }}>{card.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* DataGrid */}
      <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <InboxIcon sx={{ color: PRIMARY_BLUE, fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
              Order Inbox Queue
            </Typography>
          </Stack>
          <Chip label={`${stats.total} orders`} size="small" sx={{ bgcolor: alpha(PRIMARY_BLUE, 0.12), color: PRIMARY_BLUE, fontWeight: 600, fontSize: '0.7rem' }} />
        </Box>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 6 }}>
              <CircularProgress size={40} />
              <Typography sx={{ mt: 2, color: '#64748b' }}>Loading intent orders...</Typography>
            </Box>
          ) : error ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 6 }}>
              <Typography color="error" sx={{ mb: 2 }}>Error: {error}</Typography>
              <Button variant="outlined" onClick={fetchIntentOrders}>Retry</Button>
            </Box>
          ) : (
            <DataGrid
              rows={intentOrders}
              columns={columns}
              density="compact"
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
                sorting: { sortModel: [{ field: 'received', sort: 'desc' }] },
              }}
              pageSizeOptions={[10, 25, 50]}
              slots={{ toolbar: GridToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
              onRowClick={handleRowClick}
              disableRowSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': { fontSize: '0.8rem' },
                '& .MuiDataGrid-columnHeader': {
                  bgcolor: darkMode ? '#1e293b' : '#f1f5f9',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                },
                '& .MuiDataGrid-row:hover': {
                  bgcolor: alpha(ACCENT_BLUE, 0.08),
                  cursor: 'pointer',
                },
              }}
            />
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default CustomerIntentCockpit;
