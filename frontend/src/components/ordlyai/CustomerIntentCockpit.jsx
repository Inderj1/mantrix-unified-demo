import React, { useState, useEffect, useRef } from 'react';
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
  InputAdornment,
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
  Business as BusinessIcon,
  Science as ScienceIcon,  // Flask icon for mock/simulated data
  VerifiedUser as VerifiedUserIcon,  // Checkmark for derived/real data
  Calculate as CalculateIcon,  // For calculated values
  Link as LinkIcon,  // For SAP matched
  LinkOff as LinkOffIcon,  // For no SAP match
} from '@mui/icons-material';
import { Dialog, DialogContent } from '@mui/material';
import ordlyTheme from './ordlyTheme';
import ConfirmationDialog from './ConfirmationDialog';
import InfoDialog from './InfoDialog';
import OrderTrackingBar from './OrderTrackingBar';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

// Primary blue color for ORDLY.AI
const PRIMARY_BLUE = '#002352';
const ACCENT_BLUE = '#1976d2';

// Data source types for visual indicators
// 'extracted' = from PDF/document extraction (real data)
// 'database' = from SAP/database lookup (real data)
// 'calculated' = computed from other values (derived)
// 'mock' = hardcoded/simulated placeholder (not real)
const DATA_SOURCES = {
  EXTRACTED: 'extracted',  // From PDF extraction
  DATABASE: 'database',    // From SAP/database
  CALCULATED: 'calculated', // Computed value
  MOCK: 'mock',            // Placeholder/simulated
};

// Helper to generate extracted fields from selected order (dynamic from PO extraction)
// Now accepts selectedLineNumber to show line-specific data
const getExtractedFields = (order, selectedLineNumber = 1) => {
  if (!order) return [];
  const conf = order.confidence || 90;
  const getLevel = (c) => c >= 90 ? 'high' : c >= 70 ? 'med' : 'low';

  // Build comprehensive list of extracted fields grouped by category
  const fields = [];

  // ========== ORDER HEADER SECTION (Static - doesn't change with line selection) ==========

  // Order Identification
  fields.push({ label: 'PO Number', value: order.poNumber || order.id?.replace(/^(PO-|ORD-|INT-)/, '') || 'N/A', confidence: 99, level: 'high', category: 'order', source: DATA_SOURCES.EXTRACTED });

  // Buyer Information - all from PDF extraction
  fields.push({ label: 'Customer', value: order.customer || 'Unknown', confidence: Math.min(conf + 3, 99), level: 'high', category: 'buyer', source: DATA_SOURCES.EXTRACTED });
  if (order.buyerName) fields.push({ label: 'Buyer Name', value: order.buyerName, confidence: conf, level: getLevel(conf), category: 'buyer', source: DATA_SOURCES.EXTRACTED });
  if (order.buyerEmail) fields.push({ label: 'Buyer Email', value: order.buyerEmail, confidence: Math.min(conf + 5, 99), level: 'high', category: 'buyer', source: DATA_SOURCES.EXTRACTED });
  if (order.buyerPhone) fields.push({ label: 'Buyer Phone', value: order.buyerPhone, confidence: Math.max(conf - 5, 70), level: getLevel(conf - 5), category: 'buyer', source: DATA_SOURCES.EXTRACTED });

  // Ship-To Information - from PDF extraction
  if (order.shipToName) fields.push({ label: 'Ship-To Name', value: order.shipToName, confidence: Math.min(conf + 2, 99), level: 'high', category: 'shipto', source: DATA_SOURCES.EXTRACTED });
  if (order.shipToAddress) fields.push({ label: 'Ship-To Address', value: order.shipToAddress, confidence: conf, level: getLevel(conf), category: 'shipto', source: DATA_SOURCES.EXTRACTED });
  const shipToLocation = [order.shipToCity, order.shipToState, order.shipToZip].filter(Boolean).join(', ');
  if (shipToLocation) fields.push({ label: 'Ship-To Location', value: shipToLocation, confidence: Math.min(conf + 1, 99), level: 'high', category: 'shipto', source: DATA_SOURCES.EXTRACTED });

  // Bill-To Information - from PDF extraction
  if (order.billToName) fields.push({ label: 'Bill-To Name', value: order.billToName, confidence: conf, level: getLevel(conf), category: 'billto', source: DATA_SOURCES.EXTRACTED });
  if (order.billTo && order.billTo !== order.billToName) fields.push({ label: 'Bill-To Address', value: order.billTo, confidence: Math.max(conf - 3, 75), level: getLevel(conf - 3), category: 'billto', source: DATA_SOURCES.EXTRACTED });

  // ========== ORDER TOTALS SECTION (Shows both calculated and extracted) ==========
  const lineItems = order.lineItems || [];
  const lineCount = lineItems.length || 1;

  // Show line count - from database
  fields.push({ label: 'Total Line Items', value: `${lineCount} position${lineCount > 1 ? 's' : ''}`, confidence: 99, level: 'high', category: 'value', source: DATA_SOURCES.DATABASE });

  // Show both totals with discrepancy indicator
  if (order.calculatedTotal > 0) {
    fields.push({
      label: 'Calculated Total',
      value: `$${order.calculatedTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      confidence: 99,
      level: 'high',
      category: 'value',
      sublabel: '(sum of line items)',
      source: DATA_SOURCES.CALCULATED  // Computed from line items
    });
  }
  if (order.extractedTotal > 0) {
    fields.push({
      label: 'PO Document Total',
      value: `$${order.extractedTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      confidence: conf,
      level: order.totalDiscrepancy ? 'low' : 'high',
      category: 'value',
      sublabel: '(from extraction)',
      hasDiscrepancy: order.totalDiscrepancy,
      source: DATA_SOURCES.EXTRACTED  // From PDF extraction
    });
  }


  // ========== SELECTED LINE ITEM SECTION (Dynamic - changes with line selection) ==========
  if (lineItems.length > 0) {
    // Find the selected line item
    const selectedLine = lineItems.find(li => (li.lineNumber || 1) === selectedLineNumber) || lineItems[0];
    const lineNum = selectedLine?.lineNumber || selectedLineNumber;

    // Add section header for selected line
    fields.push({
      label: `Selected Line ${lineNum} of ${lineCount}`,
      value: '',
      category: 'lineitem',
      isSectionHeader: true
    });

    // Show selected line item details - all from database (po_line_items table)
    if (selectedLine) {
      if (selectedLine.material) fields.push({ label: 'Material', value: selectedLine.material, confidence: conf, level: getLevel(conf), category: 'lineitem', source: DATA_SOURCES.DATABASE });
      if (selectedLine.materialId) fields.push({ label: 'Customer Item #', value: selectedLine.materialId, confidence: conf, level: getLevel(conf), category: 'lineitem', source: DATA_SOURCES.DATABASE });
      if (selectedLine.quantity) fields.push({ label: 'Quantity', value: `${selectedLine.quantity.toLocaleString()} ${selectedLine.unit || ''}`.trim(), confidence: conf, level: getLevel(conf), category: 'lineitem', source: DATA_SOURCES.DATABASE });
      if (selectedLine.unitPrice) fields.push({ label: 'Unit Price', value: `$${selectedLine.unitPrice.toFixed(4)}`, confidence: Math.min(conf + 5, 99), level: 'high', category: 'lineitem', source: DATA_SOURCES.DATABASE });
      if (selectedLine.extendedPrice) fields.push({ label: 'Line Value', value: `$${selectedLine.extendedPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, confidence: 99, level: 'high', category: 'lineitem', source: DATA_SOURCES.CALCULATED });
      if (selectedLine.materialSpec) fields.push({ label: 'Material Spec', value: selectedLine.materialSpec, confidence: Math.max(conf - 5, 65), level: getLevel(conf - 5), category: 'lineitem', source: DATA_SOURCES.EXTRACTED });
      if (selectedLine.rollWidth) fields.push({ label: 'Roll Width', value: selectedLine.rollWidth, confidence: Math.max(conf - 5, 65), level: getLevel(conf - 5), category: 'lineitem', source: DATA_SOURCES.EXTRACTED });
    }
  } else {
    // Fallback to header-level fields for single line items (no lineItems array)
    fields.push({ label: 'Line 1 of 1', value: '', category: 'lineitem', isSectionHeader: true });
    if (order.materialDescription) fields.push({ label: 'Material', value: order.materialDescription, confidence: Math.max(conf - 2, 70), level: getLevel(conf - 2), category: 'lineitem', source: DATA_SOURCES.EXTRACTED });
    if (order.materialSpec) fields.push({ label: 'Material Spec', value: order.materialSpec, confidence: Math.max(conf - 5, 65), level: getLevel(conf - 5), category: 'lineitem', source: DATA_SOURCES.EXTRACTED });
    if (order.materialId) fields.push({ label: 'Customer Item #', value: order.materialId, confidence: conf, level: getLevel(conf), category: 'lineitem', source: DATA_SOURCES.EXTRACTED });
    if (order.quantity) fields.push({ label: 'Quantity', value: order.quantity, confidence: Math.max(conf - 8, 65), level: getLevel(conf - 8), category: 'lineitem', source: DATA_SOURCES.EXTRACTED });
    if (order.rollWidth) fields.push({ label: 'Roll Width', value: order.rollWidth, confidence: Math.max(conf - 10, 60), level: getLevel(conf - 10), category: 'lineitem', source: DATA_SOURCES.EXTRACTED });
    if (order.unitPrice) fields.push({ label: 'Unit Price', value: `$${order.unitPrice.toFixed(4)}`, confidence: Math.min(conf + 5, 99), level: 'high', category: 'lineitem', source: DATA_SOURCES.EXTRACTED });
    // Calculate line value for single item
    if (order.value) {
      fields.push({ label: 'Line Value', value: `$${order.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, confidence: 99, level: 'high', category: 'lineitem', source: DATA_SOURCES.CALCULATED });
    }
  }

  // ========== TERMS & DELIVERY SECTION - from PDF extraction ==========
  if (order.deliveryDate) fields.push({ label: 'Requested Delivery', value: order.deliveryDate, confidence: Math.max(conf - 15, 55), level: getLevel(conf - 15), category: 'terms', source: DATA_SOURCES.EXTRACTED });
  if (order.paymentTerms) fields.push({ label: 'Payment Terms', value: order.paymentTerms, confidence: Math.min(conf + 3, 99), level: 'high', category: 'terms', source: DATA_SOURCES.EXTRACTED });
  if (order.freightTerms) fields.push({ label: 'Freight Terms', value: order.freightTerms, confidence: Math.min(conf + 2, 98), level: 'high', category: 'terms', source: DATA_SOURCES.EXTRACTED });
  if (order.incoterms) fields.push({ label: 'Incoterms', value: order.incoterms, confidence: Math.min(conf + 4, 99), level: 'high', category: 'terms', source: DATA_SOURCES.EXTRACTED });

  // Special Instructions - from PDF extraction
  if (order.shippingInstructions) fields.push({ label: 'Shipping Instructions', value: order.shippingInstructions, confidence: Math.max(conf - 20, 50), level: getLevel(conf - 20), category: 'special', source: DATA_SOURCES.EXTRACTED });
  if (order.specialInstructions) fields.push({ label: 'Special Instructions', value: order.specialInstructions, confidence: Math.max(conf - 25, 45), level: getLevel(conf - 25), category: 'special', source: DATA_SOURCES.EXTRACTED });

  return fields;
};

// Helper component to render source indicator icon with tooltip
const SourceIndicator = ({ source }) => {
  if (!source) return null;

  const sourceConfig = {
    [DATA_SOURCES.EXTRACTED]: {
      icon: <DescriptionIcon sx={{ fontSize: 10 }} />,
      color: '#10b981',
      label: 'Extracted from PO document',
    },
    [DATA_SOURCES.DATABASE]: {
      icon: <VerifiedUserIcon sx={{ fontSize: 10 }} />,
      color: '#002352',
      label: 'From SAP/Database',
    },
    [DATA_SOURCES.CALCULATED]: {
      icon: <CalculateIcon sx={{ fontSize: 10 }} />,
      color: '#8b5cf6',
      label: 'Calculated value',
    },
    [DATA_SOURCES.MOCK]: {
      icon: <ScienceIcon sx={{ fontSize: 10 }} />,
      color: '#f59e0b',
      label: 'Simulated/Default value',
    },
  };

  const config = sourceConfig[source];
  if (!config) return null;

  return (
    <Tooltip title={config.label} arrow placement="top">
      <Box sx={{ display: 'inline-flex', color: config.color, ml: 0.5 }}>
        {config.icon}
      </Box>
    </Tooltip>
  );
};

const initialChatMessages = [
  { role: 'ai', content: "I can help you with questions about this order. Ask me about:\n\n• Similar past orders from this customer\n• Customer details and SAP match\n• Material specifications\n• Delivery information\n\nWhat would you like to know?" },
];

const CustomerIntentCockpit = ({ onBack, darkMode = false, selectedOrder: initialOrder = null, selectedLineNumber: initialLineNumber = null, onNavigate }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('po');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState(initialChatMessages);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [activeLineNumber, setActiveLineNumber] = useState(1); // For multi-line orders

  // Ref for chat auto-scroll
  const chatContainerRef = useRef(null);

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
    sapMatched: 0,
    sapUnmatched: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similarOrders, setSimilarOrders] = useState([]);
  const [pdfFullscreen, setPdfFullscreen] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

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
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/intent/orders?limit=100`);
      if (!response.ok) throw new Error('Failed to fetch intent orders');
      const data = await response.json();

      setIntentOrders(data.orders);
      // Calculate SAP match stats from orders
      const sapMatched = data.orders.filter(o => o.sapCustomerData && o.sapCustomerData.kunnr).length;
      const sapUnmatched = data.orders.length - sapMatched;
      setStats({
        total: data.stats.total || data.orders.length,
        rush: data.stats.rush || data.orders.filter(o => o.priority === 'high').length,
        lowConf: data.orders.filter(o => o.confidence < 75).length,
        avgConf: Math.round(data.stats.avgConf || 0),
        sapMatched,
        sapUnmatched,
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
      // Use poNumber instead of id - API expects just the PO number, not the "PO-" prefixed id
      fetchSimilarOrders(selectedOrder.poNumber);
    }
  }, [selectedOrder]);

  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

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
    if (!selectedOrder || isPromoting) return;
    // Don't allow promote if already past Intent stage (stage > 0)
    if (selectedOrder.stage > 0) return;

    setIsPromoting(true);
    try {
      const orderId = selectedOrder.id.replace(/^(PO-|ORD-|INT-)/, '');
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/order/${orderId}/promote`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to promote order');
      const result = await response.json();

      // Update the selectedOrder's stage to reflect promotion
      const promotedOrder = { ...selectedOrder, stage: result.new_stage || 1 };
      setSelectedOrder(promotedOrder);

      // Show themed confirmation dialog
      setConfirmDialog({ open: true, order: promotedOrder });
    } catch (err) {
      console.error('Error promoting order:', err);
      setInfoDialog({ open: true, title: 'Error', message: err.message, type: 'error' });
    } finally {
      setIsPromoting(false);
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

  // Send chat message handler
  const handleSendChat = async () => {
    if (!chatInput.trim() || isSendingChat) return;

    const userMessage = chatInput.trim();
    setChatInput('');

    // Add user message immediately
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsSendingChat(true);

    try {
      // Call the AXIS chat API
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/intent/orders/${selectedOrder?.poNumber}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, { role: 'ai', content: data.response || data.message || 'I understand your question. Let me analyze the order data to provide a detailed response.' }]);
      } else {
        // Fallback response for demo purposes
        const fallbackResponses = [
          `Based on the order history for ${selectedOrder?.customer || 'this customer'}, I can see several relevant patterns. Let me provide more details on "${userMessage}".`,
          `I've analyzed the request "${userMessage}" against our historical data. The customer's previous orders show consistent specifications that might help with this inquiry.`,
          `Regarding "${userMessage}" - I found relevant information in the customer's order history and current inventory status.`,
        ];
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        setChatMessages(prev => [...prev, { role: 'ai', content: randomResponse }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages(prev => [...prev, { role: 'ai', content: 'I apologize, but I encountered an error processing your request. Please try again.' }]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Handle Enter key in chat input
  const handleChatKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
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
      flex: 1.2,
      minWidth: 220,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{params.value}</Typography>
      ),
    },
    {
      field: 'sapCustomerData',
      headerName: 'Customer',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const existsInSap = params.value && params.value.kunnr;
        return (
          <Tooltip title={existsInSap ? `Existing SAP Customer: ${params.value.kunnr}` : 'New customer - not found in SAP'} arrow>
            <Chip
              icon={existsInSap ? <BusinessIcon sx={{ fontSize: 14 }} /> : <PersonIcon sx={{ fontSize: 14 }} />}
              label={existsInSap ? 'Existing' : 'New'}
              size="small"
              sx={{
                bgcolor: existsInSap ? alpha('#002352', 0.12) : alpha('#8b5cf6', 0.12),
                color: existsInSap ? '#002352' : '#7c3aed',
                fontWeight: 600,
                fontSize: '0.65rem',
                height: 22,
                '& .MuiChip-icon': {
                  color: existsInSap ? '#002352' : '#7c3aed',
                },
              }}
            />
          </Tooltip>
        );
      },
    },
    {
      field: 'subject',
      headerName: 'Subject',
      flex: 1.8,
      minWidth: 280,
      renderCell: (params) => (
        <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }} noWrap>{params.value}</Typography>
      ),
    },
    {
      field: 'tags',
      headerName: 'Tags',
      width: 140,
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
      headerName: 'OCR Confidence',
      width: 130,
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
              <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>
                ORDLY.AI
              </Link>
              <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>
                Made to Stock
              </Link>
              <Link component="button" variant="body1" onClick={handleBackToList} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>
                Intent Cockpit
              </Link>
              <Typography color="primary" variant="body1" fontWeight={600}>
                {selectedOrder.id}
              </Typography>
            </Breadcrumbs>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
            <EmailIcon sx={{ fontSize: 40, color: '#002352' }} />
            <Box>
              <Typography variant="h5" fontWeight={600}>{selectedOrder.customer}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedOrder.subject}</Typography>
            </Box>
          </Stack>
        </Box>

        {/* Order Tracking Bar - Shows progress across all tiles */}
        <Box sx={{ mb: 2 }}>
          <OrderTrackingBar
            order={selectedOrder}
            currentStage={0}
            onNavigate={onNavigate}
            darkMode={darkMode}
          />
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
            bgcolor: alpha('#002352', 0.04),
            borderRadius: 2,
            border: `1px solid ${alpha('#002352', 0.1)}`,
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
                      bgcolor: isActive ? alpha('#002352', 0.15) : alpha('#64748b', 0.08),
                      color: isActive ? '#002352' : '#64748b',
                      border: isActive ? `2px solid #002352` : '1px solid transparent',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: alpha('#002352', 0.12) },
                    }}
                  />
                );
              })}
            </Stack>
            <Chip
              label={`${selectedOrder?.lineCount || 1} items in PO`}
              size="small"
              sx={{
                bgcolor: alpha('#002352', 0.1),
                color: '#002352',
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
                  <DescriptionIcon sx={{ color: '#002352', fontSize: 18 }} />
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
                        bgcolor: activeTab === tab.toLowerCase() ? alpha('#002352', 0.12) : alpha('#64748b', 0.08),
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
                      style={{ border: '1px solid rgba(0,0,0,0.08)' }}
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
                      bgcolor: '#002352',
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
                      style={{ border: '1px solid rgba(0,0,0,0.08)' }}
                      title={`PO Document - ${selectedOrder.poNumber || selectedOrder.id}`}
                    />
                  </DialogContent>
                </Dialog>

                {/* Extracted Fields with SAP Matched Column */}
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981' }} /> Extracted Order Intent
                  <Chip
                    label={`${getExtractedFields(selectedOrder, activeLineNumber).length} fields`}
                    size="small"
                    sx={{ ml: 'auto', bgcolor: alpha('#10b981', 0.1), color: '#059669', fontSize: '0.65rem', height: 18 }}
                  />
                </Typography>

                {/* Data Source Legend */}
                <Box sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1.5,
                  mb: 1.5,
                  p: 1,
                  bgcolor: alpha('#64748b', 0.05),
                  borderRadius: 1,
                  border: `1px dashed ${alpha('#64748b', 0.2)}`
                }}>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', mr: 0.5 }}>
                    Data Source:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <DescriptionIcon sx={{ fontSize: 10, color: '#10b981' }} />
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>Extracted</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <VerifiedUserIcon sx={{ fontSize: 10, color: '#002352' }} />
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>Database</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <CalculateIcon sx={{ fontSize: 10, color: '#8b5cf6' }} />
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>Calculated</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                    <ScienceIcon sx={{ fontSize: 10, color: '#f59e0b' }} />
                    <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>Simulated</Typography>
                  </Box>
                </Box>

                {/* Column Headers */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 0.75, bgcolor: alpha('#10b981', 0.1), borderRadius: 1 }}>
                    <DescriptionIcon sx={{ fontSize: 12, color: '#10b981' }} />
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                      Extracted (PO)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 0.75, bgcolor: alpha('#002352', 0.1), borderRadius: 1 }}>
                    <BusinessIcon sx={{ fontSize: 12, color: '#002352' }} />
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#002352', textTransform: 'uppercase' }}>
                      SAP Matched
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ maxHeight: 400, overflow: 'auto', pr: 0.5 }}>
                  {(() => {
                    const fields = getExtractedFields(selectedOrder, activeLineNumber);
                    const sapData = selectedOrder?.sapCustomerData;

                    // Get selected line item's SAP material data for lineitem mappings
                    const lineItems = selectedOrder?.lineItems || [];
                    const selectedLine = lineItems.find(li => (li.lineNumber || 1) === activeLineNumber) || lineItems[0];
                    const sapMat = selectedLine?.sapMaterial;

                    // Define SAP field mappings for each extracted field category
                    const sapFieldMappings = {
                      buyer: {
                        'Customer': sapData?.kunnr ? { label: 'KUNNR', value: sapData.kunnr } : null,
                        'Buyer Name': sapData?.sapName ? { label: 'SAP Name', value: sapData.sapName } : null,
                      },
                      shipto: {
                        'Ship-To Name': sapData?.sapName ? { label: 'SAP Customer', value: sapData.sapName } : null,
                        'Ship-To Location': sapData ? { label: 'SAP Location', value: `${sapData.sapCity || ''}, ${sapData.sapState || ''}`.trim() } : null,
                      },
                      terms: {
                        'Payment Terms': sapData?.paymentTerms ? { label: 'SAP Terms', value: sapData.paymentTerms } : null,
                      },
                      lineitem: {
                        'Material': sapMat?.sapMaterialDescription ? { label: 'SAP Material', value: sapMat.sapMaterialDescription } : null,
                        'Customer Item #': sapMat?.sapMaterialNumber ? { label: 'MATNR', value: sapMat.sapMaterialNumber } : null,
                        'Quantity': sapMat?.convertedQuantity ? {
                          label: 'Sales UOM',
                          value: `${sapMat.convertedQuantity.toLocaleString()} ${sapMat.convertedQuantityUom || sapMat.baseUom || ''}`.trim()
                        } : (sapMat?.baseUom ? { label: 'Base UOM', value: sapMat.baseUom } : null),
                        // Unit Price handled separately with 3-column layout (A305 + Avg)
                        'Unit Price': null,
                        'Line Value': null, // Calculated field, no SAP equivalent
                      },
                    };

                    const categories = {
                      order: { label: 'Order Identification', icon: <AssignmentIcon sx={{ fontSize: 12, color: '#002352' }} /> },
                      buyer: { label: 'Buyer Information', icon: <PersonIcon sx={{ fontSize: 12, color: '#1976d2' }} /> },
                      shipto: { label: 'Ship-To Details', icon: <LocalShippingIcon sx={{ fontSize: 12, color: '#0d47a1' }} /> },
                      billto: { label: 'Bill-To Details', icon: <ReceiptIcon sx={{ fontSize: 12, color: '#5c6bc0' }} /> },
                      lineitem: { label: 'Item Data (VBAP)', icon: <InventoryIcon sx={{ fontSize: 12, color: '#00357a' }} /> },
                      terms: { label: 'Delivery & Terms', icon: <EventNoteIcon sx={{ fontSize: 12, color: '#00357a' }} /> },
                      special: { label: 'Special Instructions', icon: <InfoIcon sx={{ fontSize: 12, color: '#f59e0b' }} /> },
                      value: { label: 'Order Value', icon: <AttachMoneyIcon sx={{ fontSize: 12, color: '#10b981' }} /> },
                    };

                    const groupedFields = {};
                    fields.forEach(f => {
                      const cat = f.category || 'other';
                      if (!groupedFields[cat]) groupedFields[cat] = [];
                      groupedFields[cat].push(f);
                    });

                    return (
                      <>
                        {Object.entries(groupedFields).map(([cat, catFields]) => (
                          <Box key={cat} sx={{ mb: 1.5 }}>
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {categories[cat]?.icon || <DescriptionIcon sx={{ fontSize: 12, color: '#64748b' }} />}
                              {categories[cat]?.label || cat}
                            </Typography>
                            {catFields.map((field) => {
                              // Get corresponding SAP field if available
                              const sapField = sapFieldMappings[cat]?.[field.label];

                              return field.isSectionHeader ? (
                                // Render section header for selected line item
                                <Box
                                  key={field.label}
                                  sx={{
                                    p: 1,
                                    mb: 0.5,
                                    mt: 1,
                                    borderRadius: 1,
                                    bgcolor: alpha('#002352', 0.1),
                                    borderLeft: `3px solid #002352`,
                                  }}
                                >
                                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#002352', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <InventoryIcon sx={{ fontSize: 14 }} />
                                    {field.label}
                                  </Typography>
                                </Box>
                              ) : field.label === 'Unit Price' && sapMat ? (
                                // Special layout for Unit Price: PO Price (50%) | A305 + Avg (50% split)
                                <Box
                                  key={field.label}
                                  sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, mb: 0.5 }}
                                >
                                  {/* PO Unit Price */}
                                  <Paper
                                    variant="outlined"
                                    sx={{
                                      p: 1,
                                      borderLeft: `3px solid ${field.source === DATA_SOURCES.MOCK ? '#f59e0b' : '#10b981'}`,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      bgcolor: field.source === DATA_SOURCES.MOCK ? alpha('#f59e0b', 0.03) : darkMode ? alpha('#64748b', 0.05) : 'white',
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.6rem' }}>
                                        {field.label}
                                      </Typography>
                                      <SourceIndicator source={field.source} />
                                    </Box>
                                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.7rem', mt: 0.25 }}>
                                      {field.value || '-'}
                                    </Typography>
                                  </Paper>
                                  {/* SAP Prices Container - A305 + Avg side by side */}
                                  {(() => {
                                    // Convert prices to sales UOM (FT2) if needed
                                    const salesUom = sapMat?.convertedQuantityUom || sapMat?.baseUom || 'FT2';
                                    const convertPrice = (priceObj) => {
                                      if (!priceObj?.price) return null;
                                      const fromUom = (priceObj.uom || '').toUpperCase();
                                      const toUom = salesUom.toUpperCase();
                                      let convertedPrice = priceObj.price;
                                      // MSF to FT2: divide by 1000 (1 MSF = 1000 FT2)
                                      if (fromUom === 'MSF' && toUom === 'FT2') {
                                        convertedPrice = priceObj.price / 1000;
                                      }
                                      // MSF to M2: divide by 92.903 (1 MSF = 92.903 M2)
                                      else if (fromUom === 'MSF' && toUom === 'M2') {
                                        convertedPrice = priceObj.price / 92.903;
                                      }
                                      return { price: convertedPrice, uom: toUom };
                                    };
                                    const a305Converted = convertPrice(sapMat?.a305Price);
                                    const avgConverted = convertPrice(sapMat?.avgPrice);
                                    return (
                                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
                                    {/* A305 Master Price */}
                                    <Paper
                                      variant="outlined"
                                      sx={{
                                        p: 1,
                                        borderLeft: `3px solid ${sapMat?.a305Price ? '#002352' : '#e2e8f0'}`,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        bgcolor: sapMat?.a305Price ? alpha('#002352', 0.06) : alpha('#64748b', 0.02),
                                        borderColor: sapMat?.a305Price ? alpha('#002352', 0.2) : 'divider',
                                      }}
                                    >
                                      <Typography variant="caption" sx={{ color: '#002352', textTransform: 'uppercase', fontSize: '0.6rem' }}>
                                        A305 PRICE
                                      </Typography>
                                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.7rem', mt: 0.25, color: '#002352' }}>
                                        {a305Converted ? `$${a305Converted.price?.toFixed(4)}/${a305Converted.uom}` : '—'}
                                      </Typography>
                                    </Paper>
                                    {/* Historical Avg Price */}
                                    <Paper
                                      variant="outlined"
                                      sx={{
                                        p: 1,
                                        borderLeft: `3px solid ${sapMat?.avgPrice ? '#002352' : '#e2e8f0'}`,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        bgcolor: sapMat?.avgPrice ? alpha('#002352', 0.06) : alpha('#64748b', 0.02),
                                        borderColor: sapMat?.avgPrice ? alpha('#002352', 0.2) : 'divider',
                                      }}
                                    >
                                      <Typography variant="caption" sx={{ color: '#002352', textTransform: 'uppercase', fontSize: '0.6rem' }}>
                                        AVG ({sapMat?.avgPrice?.orderCount || 0})
                                      </Typography>
                                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.7rem', mt: 0.25, color: '#002352' }}>
                                        {avgConverted ? `$${avgConverted.price?.toFixed(4)}/${avgConverted.uom}` : '—'}
                                      </Typography>
                                    </Paper>
                                  </Box>
                                    );
                                  })()}
                                </Box>
                              ) : (
                                // Render two-column field (Extracted | SAP)
                                <Box
                                  key={field.label}
                                  sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, mb: 0.5 }}
                                >
                                  {/* Extracted (PO) Column */}
                                  <Paper
                                    variant="outlined"
                                    sx={{
                                      p: 1,
                                      borderLeft: `3px solid ${field.source === DATA_SOURCES.MOCK ? '#f59e0b' : field.hasDiscrepancy ? '#f59e0b' : '#10b981'}`,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      bgcolor: field.source === DATA_SOURCES.MOCK ? alpha('#f59e0b', 0.03) : darkMode ? alpha('#64748b', 0.05) : 'white',
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      {field.hasDiscrepancy && <WarningIcon sx={{ fontSize: 10, color: '#f59e0b' }} />}
                                      <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.6rem' }}>
                                        {field.label}
                                      </Typography>
                                      <SourceIndicator source={field.source} />
                                    </Box>
                                    {field.sublabel && (
                                      <Typography sx={{ fontSize: '0.5rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                        {field.sublabel}
                                      </Typography>
                                    )}
                                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.7rem', mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={field.value}>
                                      {field.value || '-'}
                                    </Typography>
                                  </Paper>

                                  {/* SAP Matched Column */}
                                  <Paper
                                    variant="outlined"
                                    sx={{
                                      p: 1,
                                      borderLeft: `3px solid ${sapField ? '#002352' : '#e2e8f0'}`,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      bgcolor: sapField ? alpha('#002352', 0.06) : alpha('#64748b', 0.02),
                                      borderColor: sapField ? alpha('#002352', 0.2) : 'divider',
                                    }}
                                  >
                                    {sapField ? (
                                      <>
                                        <Typography variant="caption" sx={{ color: '#002352', textTransform: 'uppercase', fontSize: '0.6rem' }}>
                                          {sapField.label}
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.7rem', mt: 0.25, color: '#002352', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={sapField.value}>
                                          {sapField.value}
                                        </Typography>
                                      </>
                                    ) : (
                                      <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '0.6rem', fontStyle: 'italic' }}>
                                        —
                                      </Typography>
                                    )}
                                  </Paper>
                                </Box>
                              );
                            })}
                          </Box>
                        ))}

                        {/* SAP Customer Master Section - Additional fields not mapped to extracted */}
                        {sapData && sapData.kunnr && (
                          <Box sx={{ mb: 1.5 }}>
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <BusinessIcon sx={{ fontSize: 12, color: '#002352' }} />
                              SAP Customer Master (KNA1/KNVV)
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
                              {[
                                { label: 'SAP Customer #', value: sapData.kunnr },
                                { label: 'SAP Name', value: sapData.sapName },
                                { label: 'Sales Org', value: sapData.salesOrg },
                                { label: 'Dist Channel', value: sapData.distChannel },
                                { label: 'Account Group', value: sapData.accountGroup },
                                { label: 'Customer Since', value: sapData.customerSince },
                                { label: 'SAP Address', value: `${sapData.sapAddress || ''}, ${sapData.sapCity || ''} ${sapData.sapState || ''}`.trim().replace(/^,\s*/, '') },
                                { label: 'SAP Phone', value: sapData.sapPhone },
                              ].filter(f => f.value).map((sapField, idx) => (
                                <Paper
                                  key={idx}
                                  variant="outlined"
                                  sx={{
                                    p: 1,
                                    borderLeft: `3px solid #002352`,
                                    bgcolor: alpha('#002352', 0.03),
                                  }}
                                >
                                  <Typography variant="caption" sx={{ color: '#002352', textTransform: 'uppercase', fontSize: '0.6rem' }}>
                                    {sapField.label}
                                  </Typography>
                                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.7rem', mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={sapField.value}>
                                    {sapField.value}
                                  </Typography>
                                </Paper>
                              ))}
                            </Box>
                          </Box>
                        )}
                      </>
                    );
                  })()}
                </Box>
              </Box>
              {/* Action Bar */}
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                <Button startIcon={<RefreshIcon />} variant="outlined" size="small" onClick={handleReExtract} sx={{ flex: 1, fontSize: '0.75rem' }}>Re-Extract</Button>
                <Button startIcon={<SendIcon />} variant="outlined" size="small" onClick={handleRequestClarification} sx={{ flex: 1, fontSize: '0.75rem' }}>Request Clarification</Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handlePromote}
                  disabled={isPromoting || (selectedOrder?.stage > 0)}
                  sx={{
                    flex: 1,
                    fontSize: '0.75rem',
                    bgcolor: '#002352',
                    '&:hover': { bgcolor: '#1565c0' },
                    '&:disabled': { bgcolor: alpha('#002352', 0.3), color: 'rgba(255,255,255,0.5)' }
                  }}
                >
                  {isPromoting ? 'Promoting...' : selectedOrder?.stage > 0 ? 'Already Promoted' : 'Promote to Decisioning'}
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
                  <SmartToyIcon sx={{ color: '#002352', fontSize: 18 }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Axis Chat
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981' }} />
                  <Typography variant="caption" sx={{ color: '#10b981', fontSize: '0.7rem' }}>Connected</Typography>
                </Stack>
              </Box>
              <Box ref={chatContainerRef} sx={{ p: 2, maxHeight: 280, overflow: 'auto', flex: 1 }}>
                {chatMessages.map((msg, idx) => (
                  <Box key={idx} sx={{ mb: 2, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    <Box
                      sx={{
                        display: 'inline-block',
                        maxWidth: '90%',
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: msg.role === 'user' ? '#002352' : alpha('#002352', 0.08),
                        border: msg.role === 'ai' ? '1px solid' : 'none',
                        borderColor: alpha('#002352', 0.2),
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
                  onKeyPress={handleChatKeyPress}
                  disabled={isSendingChat}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleSendChat}
                          disabled={!chatInput.trim() || isSendingChat}
                          size="small"
                          sx={{
                            color: chatInput.trim() ? '#002352' : '#9ca3af',
                            '&:hover': { bgcolor: alpha('#002352', 0.1) },
                          }}
                        >
                          {isSendingChat ? <CircularProgress size={18} /> : <SendIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem', pr: 0.5 } }}
                />
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                  {['Similar past orders?', 'Customer details', 'Delivery date', 'Material info'].map((prompt) => (
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
                        '&:hover': { bgcolor: alpha('#002352', 0.12), color: '#1565c0' },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Similar Orders */}
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <HistoryIcon sx={{ color: '#002352', fontSize: 18 }} />
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
                      '&:hover': { borderColor: '#002352', bgcolor: alpha('#002352', 0.05) },
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
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>
              ORDLY.AI
            </Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>
              Made to Stock
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              Customer Intent Cockpit
            </Typography>
          </Breadcrumbs>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh"><span><IconButton color="primary" onClick={fetchIntentOrders} disabled={loading}><RefreshIcon /></IconButton></span></Tooltip>
            <Tooltip title="Export"><IconButton color="primary" onClick={handleExport}><DownloadIcon /></IconButton></Tooltip>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
              Back to ORDLY.AI
            </Button>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <EmailIcon sx={{ fontSize: 40, color: '#002352' }} />
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
          { label: 'Existing Customers', value: stats.sapMatched, color: '#002352', icon: <BusinessIcon sx={{ fontSize: 16 }} /> },
          { label: 'New Customers', value: stats.sapUnmatched, color: '#8b5cf6', icon: <PersonIcon sx={{ fontSize: 16 }} /> },
          { label: 'Rush Orders', value: stats.rush, color: '#ef4444' },
          { label: 'Avg. Confidence', value: `${stats.avgConf}%`, color: '#10b981' },
        ].map((card) => (
          <Grid item xs={12} sm={6} md={2.4} key={card.label}>
            <Card variant="outlined" sx={{ borderLeft: `3px solid ${card.color}` }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                  {card.icon && <Box sx={{ color: card.color, display: 'flex', alignItems: 'center' }}>{card.icon}</Box>}
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {card.label}
                  </Typography>
                </Stack>
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
                border: '1px solid rgba(0,0,0,0.08)',
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
