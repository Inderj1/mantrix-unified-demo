import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Grid,
  Chip,
  Tabs,
  Tab,
  Avatar,
  useTheme,
  alpha,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tooltip,
  Badge,
  TextField,
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import {
  Receipt as ReceiptIcon,
  Description as InvoiceIcon,
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon,
  Business as ContractIcon,
  Assignment as DocumentIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Visibility as VisibilityIcon,
  Image as ImageIcon,
  CloudUpload as UploadIcon,
  Scanner as ScannerIcon,
  BarChart as AnalyticsIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useCustomTypes } from '../hooks/useCustomTypes';
import CustomTypeConfig from './CustomTypeConfig';

// Custom Toolbar
function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 1, justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
      </Box>
      <GridToolbarQuickFilter
        sx={{ minWidth: 300 }}
        debounceMs={300}
        placeholder="Search all columns..."
      />
    </GridToolbarContainer>
  );
}

// Sample data generator for different document types
const generateDocumentData = (docType, count = 15) => {
  const baseDate = Date.now();

  const documentData = {
    'invoices': Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      document_id: `INV-${10000 + i}`,
      vendor_name: ['Tech Supplies Inc', 'Global Manufacturing', 'Quality Parts Ltd', 'Office Pro', 'Industrial Supply'][i % 5],
      invoice_date: new Date(baseDate - i * 86400000).toLocaleDateString(),
      due_date: new Date(baseDate + (30 - i) * 86400000).toLocaleDateString(),
      total_amount: (Math.random() * 50000 + 5000).toFixed(2),
      tax_amount: (Math.random() * 4000 + 400).toFixed(2),
      line_items: Math.floor(Math.random() * 15) + 1,
      payment_status: ['Paid', 'Pending', 'Overdue', 'Partial'][i % 4],
      ocr_confidence: (95 + Math.random() * 4).toFixed(1) + '%',
      validation_status: ['Validated', 'Needs Review', 'Auto-Approved'][i % 3],
      extracted_fields: ['Vendor', 'Amount', 'Date', 'PO Number', 'Tax'],
      image_url: '/sample/invoice-' + (i % 3 + 1) + '.png',
      processing_time: (Math.random() * 3 + 0.5).toFixed(2) + 's',
      matched_po: i % 3 === 0 ? `PO-${2000 + i}` : null,
      currency: 'USD',
    })),

    'receipts': Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      document_id: `RCP-${30000 + i}`,
      merchant_name: ['Office Depot', 'Staples', 'Amazon Business', 'Best Buy', 'Home Depot', 'FedEx', 'UPS Store'][i % 7],
      receipt_date: new Date(baseDate - i * 86400000).toLocaleDateString(),
      total_amount: (Math.random() * 500 + 10).toFixed(2),
      payment_method: ['Credit Card', 'Debit Card', 'Cash', 'Company Card'][i % 4],
      category: ['Office Supplies', 'Equipment', 'Shipping', 'Travel', 'Utilities'][i % 5],
      employee: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Charlie Brown'][i % 5],
      ocr_confidence: (90 + Math.random() * 9).toFixed(1) + '%',
      validation_status: ['Approved', 'Needs Review', 'Rejected'][i % 3],
      expense_report: i % 2 === 0 ? `EXP-${4000 + i}` : 'Not Assigned',
      reimbursement_status: ['Reimbursed', 'Pending', 'Processed'][i % 3],
      image_url: '/sample/receipt-' + (i % 4 + 1) + '.png',
      items_extracted: Math.floor(Math.random() * 10) + 1,
    })),

    'shipping-documents': Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      document_id: `SHIP-${40000 + i}`,
      tracking_number: `1Z999AA${10000000 + i}`,
      carrier: ['UPS', 'FedEx', 'DHL', 'USPS', 'FreightCo'][i % 5],
      ship_date: new Date(baseDate - i * 86400000).toLocaleDateString(),
      expected_delivery: new Date(baseDate + (i * 2 + 3) * 86400000).toLocaleDateString(),
      origin: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ'][i % 5],
      destination: ['Miami, FL', 'Seattle, WA', 'Boston, MA', 'Denver, CO', 'Atlanta, GA'][i % 5],
      package_count: Math.floor(Math.random() * 5) + 1,
      total_weight: (Math.random() * 500 + 10).toFixed(2) + ' lbs',
      shipping_cost: (Math.random() * 200 + 25).toFixed(2),
      status: ['In Transit', 'Delivered', 'Out for Delivery', 'Processing'][i % 4],
      ocr_confidence: (92 + Math.random() * 7).toFixed(1) + '%',
      related_po: i % 3 === 0 ? `PO-${2000 + i}` : null,
      image_url: '/sample/shipping-' + (i % 3 + 1) + '.png',
    })),

    'inventory-labels': Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      document_id: `INV-LABEL-${50000 + i}`,
      sku: `SKU-${100000 + i}`,
      product_name: ['Industrial Motor', 'Control Panel', 'Steel Sheets', 'Electronic Components', 'Safety Equipment'][i % 5],
      barcode: `${Math.floor(Math.random() * 1000000000000)}`,
      qr_code: 'Extracted',
      quantity: Math.floor(Math.random() * 1000) + 10,
      location: [`A${i % 10 + 1}-B${i % 5 + 1}-C${i % 3 + 1}`],
      batch_number: `BATCH-${new Date().getFullYear()}-${1000 + i}`,
      expiry_date: i % 3 === 0 ? new Date(baseDate + 365 * 86400000).toLocaleDateString() : 'N/A',
      unit_price: (Math.random() * 500 + 10).toFixed(2),
      ocr_confidence: (94 + Math.random() * 5).toFixed(1) + '%',
      validation_status: ['Verified', 'Needs Verification'][i % 2],
      warehouse: ['Warehouse A', 'Warehouse B', 'Distribution Center 1'][i % 3],
      image_url: '/sample/label-' + (i % 3 + 1) + '.png',
      last_scanned: new Date(baseDate - Math.random() * 7 * 86400000).toLocaleDateString(),
    })),

  };

  return documentData[docType] || [];
};

const getColors = (darkMode) => ({
  primary: darkMode ? '#4da6ff' : '#0a6ed1',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const DocumentVisionIntelligence = ({ onNavigateToConfig, darkMode = false }) => {
  const theme = useTheme();
  const colors = getColors(darkMode);
  const [selectedType, setSelectedType] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documentData, setDocumentData] = useState({});
  const [stats, setStats] = useState({});
  const [imageDialog, setImageDialog] = useState({ open: false, imageUrl: '', data: null });
  const [searchQuery, setSearchQuery] = useState('');

  // Custom types management
  const { customTypes, addType, updateType, deleteType } = useCustomTypes('vision-studio-custom-types');
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);

  const defaultDocumentTypes = [
    {
      id: 1,
      name: 'invoices',
      display_name: 'Invoices',
      description: 'AI-extracted invoice data with automatic PO matching',
      icon: InvoiceIcon,
      color: '#0078d4',
    },
    {
      id: 2,
      name: 'receipts',
      display_name: 'Receipts',
      description: 'Expense receipt scanning and categorization',
      icon: ReceiptIcon,
      color: '#106ebe',
    },
    {
      id: 3,
      name: 'shipping-documents',
      display_name: 'Shipping Documents',
      description: 'Shipping label and tracking document extraction',
      icon: ShippingIcon,
      color: '#2b88d8',
    },
    {
      id: 4,
      name: 'inventory-labels',
      display_name: 'Inventory Labels',
      description: 'Barcode, QR code, and label data extraction',
      icon: InventoryIcon,
      color: '#005a9e',
    },
  ];

  // Icon mapping for custom types
  const iconMap = {
    Email: DocumentIcon,
    Description: InvoiceIcon,
    Assessment: AnalyticsIcon,
    Settings: SettingsIcon,
    BarChart: AnalyticsIcon,
    PieChart: AnalyticsIcon,
    TrendingUp: AnalyticsIcon,
    Speed: AnalyticsIcon,
    Storage: InventoryIcon,
    Cloud: UploadIcon,
  };

  const getIconComponent = (iconName) => {
    return iconMap[iconName] || DocumentIcon;
  };

  // Merge default and custom types
  const documentTypes = [
    ...defaultDocumentTypes,
    ...customTypes.map(type => ({
      ...type,
      icon: getIconComponent(type.icon),
    })),
  ];

  useEffect(() => {
    loadInitialData();
  }, [customTypes]);

  useEffect(() => {
    if (activeTab < documentTypes.length) {
      const currentType = documentTypes[activeTab];
      if (!documentData[currentType.name]) {
        loadDataForType(currentType.name);
      }
    }
  }, [activeTab]);

  const loadInitialData = () => {
    const initialStats = {};
    documentTypes.forEach(type => {
      const data = generateDocumentData(type.name, 15);
      setDocumentData(prev => ({ ...prev, [type.name]: data }));
      initialStats[type.name] = data.length;
    });
    setStats(initialStats);
  };

  // Custom type handlers
  const handleAddCustomType = () => {
    setEditingType(null);
    setConfigDialogOpen(true);
  };

  const handleEditCustomType = (type) => {
    setEditingType(type);
    setConfigDialogOpen(true);
  };

  const handleSaveCustomType = (formData) => {
    if (editingType) {
      updateType(editingType.id, formData);
    } else {
      addType(formData);
    }
    setConfigDialogOpen(false);
    setEditingType(null);
  };

  const handleDeleteCustomType = (typeId) => {
    if (window.confirm('Are you sure you want to delete this custom type?')) {
      deleteType(typeId);
      if (selectedType?.id === typeId) {
        setSelectedType(null);
      }
    }
  };

  const loadDataForType = (typeName) => {
    setLoading(true);
    setTimeout(() => {
      const data = generateDocumentData(typeName, 15);
      setDocumentData(prev => ({ ...prev, [typeName]: data }));
      setStats(prev => ({ ...prev, [typeName]: data.length }));
      setLoading(false);
    }, 500);
  };

  const handleViewImage = (row) => {
    setImageDialog({
      open: true,
      imageUrl: row.image_url,
      data: row,
    });
  };

  const handleCloseImage = () => {
    setImageDialog({ open: false, imageUrl: '', data: null });
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (['validated', 'approved', 'paid', 'delivered', 'verified', 'reconciled'].some(s => statusLower.includes(s))) {
      return theme.palette.success.main;
    }
    if (['pending', 'review', 'processing'].some(s => statusLower.includes(s))) {
      return theme.palette.warning.main;
    }
    if (['rejected', 'overdue', 'failed'].some(s => statusLower.includes(s))) {
      return theme.palette.error.main;
    }
    return theme.palette.grey[500];
  };

  const buildColumnsForType = (typeName) => {
    const commonColumns = [
      {
        field: 'actions',
        headerName: 'Image',
        width: 80,
        sortable: false,
        renderCell: (params) => (
          <Tooltip title="View Document Image">
            <IconButton size="small" color="primary" onClick={() => handleViewImage(params.row)}>
              <ImageIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ];

    const typeSpecificColumns = {
      'invoices': [
        { field: 'document_id', headerName: 'Invoice #', width: 130 },
        { field: 'vendor_name', headerName: 'Vendor', width: 200 },
        { field: 'invoice_date', headerName: 'Date', width: 120 },
        { field: 'total_amount', headerName: 'Amount', width: 120, renderCell: (params) => `$${params.value}` },
        { field: 'payment_status', headerName: 'Status', width: 130, renderCell: (params) => (
          <Chip label={params.value} size="small" sx={{ bgcolor: alpha(getStatusColor(params.value), 0.1), color: getStatusColor(params.value) }} />
        )},
        { field: 'ocr_confidence', headerName: 'OCR Confidence', width: 140 },
        { field: 'validation_status', headerName: 'Validation', width: 140 },
        { field: 'matched_po', headerName: 'Matched PO', width: 130 },
      ],
      'receipts': [
        { field: 'document_id', headerName: 'Receipt #', width: 140 },
        { field: 'merchant_name', headerName: 'Merchant', width: 180 },
        { field: 'receipt_date', headerName: 'Date', width: 120 },
        { field: 'total_amount', headerName: 'Amount', width: 110, renderCell: (params) => `$${params.value}` },
        { field: 'category', headerName: 'Category', width: 140 },
        { field: 'employee', headerName: 'Employee', width: 150 },
        { field: 'validation_status', headerName: 'Status', width: 130, renderCell: (params) => (
          <Chip label={params.value} size="small" sx={{ bgcolor: alpha(getStatusColor(params.value), 0.1), color: getStatusColor(params.value) }} />
        )},
        { field: 'ocr_confidence', headerName: 'OCR Confidence', width: 140 },
      ],
      'shipping-documents': [
        { field: 'document_id', headerName: 'Document #', width: 140 },
        { field: 'tracking_number', headerName: 'Tracking #', width: 180 },
        { field: 'carrier', headerName: 'Carrier', width: 110 },
        { field: 'origin', headerName: 'Origin', width: 150 },
        { field: 'destination', headerName: 'Destination', width: 150 },
        { field: 'status', headerName: 'Status', width: 140, renderCell: (params) => (
          <Chip label={params.value} size="small" sx={{ bgcolor: alpha(getStatusColor(params.value), 0.1), color: getStatusColor(params.value) }} />
        )},
        { field: 'package_count', headerName: 'Packages', width: 100 },
        { field: 'ocr_confidence', headerName: 'OCR Confidence', width: 140 },
      ],
      'inventory-labels': [
        { field: 'document_id', headerName: 'Label ID', width: 150 },
        { field: 'sku', headerName: 'SKU', width: 140 },
        { field: 'product_name', headerName: 'Product', width: 200 },
        { field: 'quantity', headerName: 'Qty', width: 90 },
        { field: 'location', headerName: 'Location', width: 130 },
        { field: 'warehouse', headerName: 'Warehouse', width: 160 },
        { field: 'validation_status', headerName: 'Status', width: 150, renderCell: (params) => (
          <Chip label={params.value} size="small" sx={{ bgcolor: alpha(getStatusColor(params.value), 0.1), color: getStatusColor(params.value) }} />
        )},
        { field: 'ocr_confidence', headerName: 'OCR Confidence', width: 140 },
      ],
    };

    return [...commonColumns, ...(typeSpecificColumns[typeName] || [])];
  };

  const getTotalDocuments = () => {
    return Object.values(stats).reduce((acc, val) => acc + val, 0);
  };

  // Tile Landing View
  if (!selectedType) {
    // Filter tiles based on search query
    const filteredTypes = documentTypes.filter((type) =>
      type.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <Box sx={{ p: 3, height: '100%', overflowY: 'auto', bgcolor: colors.background }}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 0, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DocumentIcon sx={{ fontSize: 40, color: '#0078d4' }} />
              <Box>
                <Typography variant="h5" fontWeight={600} sx={{ color: colors.text }}>
                  VISION STUDIO
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  AI-powered OCR and document processing platform
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button startIcon={<SettingsIcon />} variant="outlined" onClick={onNavigateToConfig}>
                Configure
              </Button>
              <Button startIcon={<RefreshIcon />} variant="outlined" onClick={loadInitialData}>
                Refresh
              </Button>
            </Stack>
          </Stack>

          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Search document types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              endAdornment: searchQuery && (
                <IconButton size="small" onClick={() => setSearchQuery('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              ),
            }}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: darkMode ? colors.paper : alpha(theme.palette.primary.main, 0.02),
                color: colors.text,
                '& fieldset': { borderColor: colors.border },
              },
            }}
          />
        </Paper>

        <Grid container spacing={1.5}>
          {filteredTypes.map((type, index) => {
            const IconComponent = type.icon;
            return (
              <Grid item xs={12} sm={6} md={3} lg={3} key={type.id}>
                <Card
                  sx={{
                    height: 200,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: `1px solid ${colors.border}`,
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    bgcolor: colors.cardBg,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: `0 20px 40px ${alpha(type.color, 0.12)}, 0 8px 16px rgba(0,0,0,0.06)`,
                      '& .module-icon': {
                        transform: 'scale(1.1)',
                        bgcolor: type.color,
                        color: 'white',
                      },
                      '& .module-arrow': {
                        opacity: 1,
                        transform: 'translateX(4px)',
                      },
                    },
                  }}
                  onClick={() => setSelectedType(type)}
                >
                  <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box
                        className="module-icon"
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1.5,
                          bgcolor: alpha(type.color, 0.1),
                          color: type.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <IconComponent sx={{ fontSize: 22 }} />
                      </Box>
                      {type.isCustom && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCustomType(type);
                            }}
                            sx={{ width: 24, height: 24, color: type.color }}
                          >
                            <EditIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomType(type.id);
                            }}
                            sx={{ width: 24, height: 24, color: '#F44336' }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: type.color, mb: 0.5, fontSize: '0.9rem', lineHeight: 1.3 }}>
                      {type.display_name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 'auto', lineHeight: 1.4, fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {type.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid', borderColor: alpha(type.color, 0.1) }}>
                      <Chip label={`${stats[type.name] || 0} Docs`} size="small" sx={{ height: 22, fontSize: '0.65rem', bgcolor: alpha(type.color, 0.08), color: type.color, fontWeight: 600 }} />
                      <ArrowForwardIcon className="module-arrow" sx={{ color: type.color, fontSize: 16, opacity: 0.5, transition: 'all 0.3s ease' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}

          {/* Add Custom Type Tile */}
          {!searchQuery && (
            <Grid item xs={12} sm={6} md={3} lg={3}>
              <Card
                sx={{
                  height: 200,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px dashed',
                  borderColor: alpha('#0078d4', 0.3),
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha('#0078d4', 0.02),
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: '#0078d4',
                    bgcolor: alpha('#0078d4', 0.05),
                  },
                }}
                onClick={handleAddCustomType}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <AddIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                  <Typography variant="body2" fontWeight={600} color="primary">
                    Add Custom Type
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Create your own document type
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* No Results Message */}
        {filteredTypes.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No document types found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search query
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  // Detail View for Selected Type
  const currentTypeIndex = documentTypes.findIndex(t => t.id === selectedType.id);

  return (
    <Box sx={{ bgcolor: colors.background }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 0, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={() => setSelectedType(null)} variant="text" sx={{ mb: 1, color: colors.text }}>
              Back to Document Types
            </Button>
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: colors.text }}>
              {selectedType.display_name}
            </Typography>
            <Typography variant="body1" sx={{ color: colors.textSecondary }}>
              {selectedType.description}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button startIcon={<UploadIcon />} variant="outlined">
              Upload Documents
            </Button>
            <Button startIcon={<RefreshIcon />} variant="outlined" onClick={loadInitialData}>
              Refresh
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Data Grid */}
      <Paper sx={{ bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
        <Box sx={{ height: 650, width: '100%' }}>
          <DataGrid
            rows={documentData[selectedType.name] || []}
            columns={buildColumnsForType(selectedType.name)}
            density="compact"
            initialState={{
              pagination: { paginationModel: { pageSize: 25, page: 0 } },
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            loading={loading}
            checkboxSelection
            disableRowSelectionOnClick
            slots={{ toolbar: CustomToolbar }}
            sx={{
              border: `1px solid ${colors.border}`,
              color: colors.text,
              bgcolor: colors.paper,
              '& .MuiDataGrid-cell:focus': { outline: 'none' },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: darkMode ? colors.cardBg : 'grey.100',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: colors.text,
                borderBottom: `1px solid ${colors.border}`,
              },
              '& .MuiDataGrid-cell': {
                borderBottom: `1px solid ${colors.border}`,
                color: colors.text,
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: `1px solid ${colors.border}`,
                backgroundColor: darkMode ? colors.cardBg : undefined,
              },
            }}
          />
        </Box>
      </Paper>

      {/* Image Preview Dialog */}
      <Dialog open={imageDialog.open} onClose={handleCloseImage} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <ImageIcon color="primary" />
            <Typography variant="h6">Document Image Preview</Typography>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {imageDialog.data && (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Document ID</Typography>
                  <Typography variant="body1" fontWeight={600}>{imageDialog.data.document_id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">OCR Confidence</Typography>
                  <Typography variant="body1" fontWeight={600}>{imageDialog.data.ocr_confidence}</Typography>
                </Grid>
              </Grid>
              <Box sx={{
                bgcolor: darkMode ? colors.cardBg : 'grey.100',
                p: 3,
                borderRadius: 2,
                textAlign: 'center',
                minHeight: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${colors.border}`,
              }}>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  📄 Document image would be displayed here
                  <br />
                  <Typography variant="caption" sx={{ mt: 1, display: 'block', color: colors.textSecondary }}>
                    Path: {imageDialog.imageUrl}
                  </Typography>
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImage}>Close</Button>
          <Button variant="contained" startIcon={<AnalyticsIcon />}>
            View Extracted Data
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Type Config Dialog */}
      <CustomTypeConfig
        open={configDialogOpen}
        onClose={() => {
          setConfigDialogOpen(false);
          setEditingType(null);
        }}
        onSave={handleSaveCustomType}
        editType={editingType}
        moduleType="vision"
      />
    </Box>
  );
};

export default DocumentVisionIntelligence;
