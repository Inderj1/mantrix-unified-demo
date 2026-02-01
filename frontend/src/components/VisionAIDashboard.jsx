import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Stack,
  Tooltip,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  FormControlLabel,
  Switch,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  InputAdornment,
  useTheme,
  alpha,
  TablePagination,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CameraAlt as CameraIcon,
  Analytics as AnalyticsIcon,
  Label as LabelIcon,
  Settings as SettingsIcon,
  AutoAwesome as AutoAwesomeIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  GridOn as GridOnIcon,
  Rectangle as RectangleIcon,
  RadioButtonUnchecked as CircleIcon,
  Timeline as PolylineIcon,
  Place as PointIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  ModelTraining as ModelTrainingIcon,
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon2,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Assessment as AssessmentIcon,
  Build as BuildIcon,
  Tune as TuneIcon,
  Psychology as PsychologyIcon,
  SmartToy as SmartToyIcon,
  PhotoCamera as PhotoCameraIcon,
  Collections as CollectionsIcon,
  Dashboard as DashboardIcon,
  BubbleChart as BubbleChartIcon,
  DonutLarge as DonutLargeIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  Send as SendIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Inventory as InventoryIcon,
  QrCodeScanner as QrCodeScannerIcon,
  LocalShipping as ShippingIcon,
  Category as CategoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Warehouse as WarehouseIcon,
  BarChart as StockChartIcon,
  ProductionQuantityLimits as StockLevelIcon,
  LocalOffer as PriceTagIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { scaleOrdinal, scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { withTooltip, Tooltip as VisxTooltip, defaultStyles } from '@visx/tooltip';
import { ParentSize } from '@visx/responsive';
import { Pie } from '@visx/shape';
import { Text } from '@visx/text';
import { animated, useSpring } from '@react-spring/web';
import { LinePath, Line, Area } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { GridRows, GridColumns } from '@visx/grid';
import { GradientOrangeRed, GradientPurpleRed } from '@visx/gradient';

const columnHelper = createColumnHelper();

// Enhanced Pie Chart Component for Inventory Categories
const InventoryPieChart = withTooltip(({ data, width, height, tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip }) => {
  const radius = Math.min(width, height) / 2;
  const centerY = height / 2;
  const centerX = width / 2;

  const colorScale = scaleOrdinal({
    domain: data.map(d => d.category),
    range: ['#00357a', '#1a5a9e', '#1a5a9e', '#002352', '#1a5a9e', '#1a5a9e'],
  });

  return (
    <svg width={width} height={height}>
      <GradientPurpleRed id="gradient-purple-red" />
      <Group top={centerY} left={centerX}>
        <Pie
          data={data}
          pieValue={(d) => d.count}
          outerRadius={radius - 20}
          innerRadius={radius - 60}
        >
          {(pie) =>
            pie.arcs.map((arc, i) => {
              const [centroidX, centroidY] = pie.path.centroid(arc);
              return (
                <g key={`arc-${i}`}>
                  <animated.path
                    d={pie.path(arc)}
                    fill={colorScale(arc.data.category)}
                    onMouseEnter={(e) => {
                      const eventSvgCoords = { x: e.clientX, y: e.clientY };
                      showTooltip({
                        tooltipData: arc.data,
                        tooltipTop: eventSvgCoords.y,
                        tooltipLeft: eventSvgCoords.x,
                      });
                    }}
                    onMouseLeave={hideTooltip}
                    style={{
                      cursor: 'pointer',
                      opacity: tooltipData === arc.data ? 0.8 : 1,
                    }}
                  />
                  <Text
                    x={centroidX}
                    y={centroidY}
                    dy=".33em"
                    fill="white"
                    fontSize={12}
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {arc.data.count}
                  </Text>
                </g>
              );
            })
          }
        </Pie>
      </Group>
      {tooltipData && (
        <VisxTooltip
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...defaultStyles,
            backgroundColor: 'rgba(0,0,0,0.9)',
            color: 'white',
          }}
        >
          <div>
            <strong>{tooltipData.category}</strong>
            <div>Items: {tooltipData.count}</div>
            <div>Value: ${tooltipData.value?.toLocaleString()}</div>
            <div>Status: {tooltipData.status}</div>
          </div>
        </VisxTooltip>
      )}
    </svg>
  );
});

// Enhanced Line Chart for Stock Levels Over Time
const StockLevelsChart = ({ data, width, height }) => {
  const theme = useTheme();
  
  const xScale = scaleLinear({
    domain: [0, data.length - 1],
    range: [0, width - 60],
  });

  const yScale = scaleLinear({
    domain: [0, 100],
    range: [height - 40, 0],
  });

  const getX = (d, i) => xScale(i);
  const getYStock = d => yScale(d.stockLevel);
  const getYReorder = d => yScale(d.reorderPoint);

  return (
    <svg width={width} height={height}>
      <GradientOrangeRed id="gradient-orange-red" />
      <rect width={width} height={height} fill="transparent" />
      <Group left={40} top={20}>
        <GridRows scale={yScale} width={width - 60} height={height - 40} stroke="#e0e0e0" strokeOpacity={0.3} />
        <GridColumns scale={xScale} height={height - 40} stroke="#e0e0e0" strokeOpacity={0.3} />
        
        <Area
          data={data}
          x={getX}
          y0={height - 40}
          y1={getYStock}
          fill="url(#gradient-purple-red)"
          opacity={0.3}
          curve={curveMonotoneX}
        />
        
        <LinePath
          data={data}
          x={getX}
          y={getYStock}
          stroke={theme.palette.primary.main}
          strokeWidth={2}
          curve={curveMonotoneX}
        />
        
        <LinePath
          data={data}
          x={getX}
          y={getYReorder}
          stroke={theme.palette.warning.main}
          strokeWidth={2}
          strokeDasharray="5,5"
          curve={curveMonotoneX}
        />
        
        <AxisLeft scale={yScale} stroke={theme.palette.text.secondary} tickLabelProps={() => ({
          fill: theme.palette.text.secondary,
          fontSize: 11,
          textAnchor: 'end',
        })} />
        
        <AxisBottom
          scale={xScale}
          top={height - 40}
          stroke={theme.palette.text.secondary}
          tickFormat={(v) => data[v]?.date || ''}
          tickLabelProps={() => ({
            fill: theme.palette.text.secondary,
            fontSize: 11,
            textAnchor: 'middle',
          })}
        />
      </Group>
    </svg>
  );
};

const VisionAIDashboard = ({ onBack }) => {
  const theme = useTheme();
  
  // State Management
  const [activeTab, setActiveTab] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [detectionResults, setDetectionResults] = useState([]);
  const [activeModel, setActiveModel] = useState('inventory-detection');
  const [confidence, setConfidence] = useState(0.5);
  const [viewMode, setViewMode] = useState('grid');
  const [labelMode, setLabelMode] = useState('manual');
  const [autoLabelPrompt, setAutoLabelPrompt] = useState('');
  const [annotations, setAnnotations] = useState([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [drawingTool, setDrawingTool] = useState('rectangle');
  const [isDrawing, setIsDrawing] = useState(false);
  const [calibrationSettings, setCalibrationSettings] = useState({
    epochs: 100,
    batchSize: 16,
    learningRate: 0.001,
    dataAugmentation: true,
  });
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [gcsPath, setGcsPath] = useState('');
  const [gcsFiles, setGcsFiles] = useState([]);
  const [loadingGcs, setLoadingGcs] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [liveStream, setLiveStream] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);
  const [statistics, setStatistics] = useState({
    totalScanned: 0,
    itemsIdentified: 0,
    accuracy: 0.96,
    processingTime: 180,
    inventoryValue: 1245000,
    stockAccuracy: 0.94,
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Mock data for Inventory Management
  const inventoryCategoryData = [
    { category: 'Electronics', count: 342, value: 450000, status: 'In Stock' },
    { category: 'Clothing', count: 567, value: 125000, status: 'In Stock' },
    { category: 'Food & Beverages', count: 234, value: 85000, status: 'Low Stock' },
    { category: 'Home & Garden', count: 189, value: 95000, status: 'In Stock' },
    { category: 'Sports & Outdoors', count: 145, value: 75000, status: 'Critical' },
    { category: 'Books & Media', count: 423, value: 65000, status: 'Overstock' },
  ];

  const stockLevelsData = [
    { date: 'Mon', stockLevel: 85, reorderPoint: 30 },
    { date: 'Tue', stockLevel: 82, reorderPoint: 30 },
    { date: 'Wed', stockLevel: 78, reorderPoint: 30 },
    { date: 'Thu', stockLevel: 88, reorderPoint: 30 },
    { date: 'Fri', stockLevel: 92, reorderPoint: 30 },
    { date: 'Sat', stockLevel: 75, reorderPoint: 30 },
  ];

  const modelOptions = [
    { id: 'inventory-detection', name: 'Inventory Detection v2', type: 'Object Detection', accuracy: 0.96 },
    { id: 'barcode-scanner', name: 'Barcode & QR Scanner', type: 'OCR', accuracy: 0.99 },
    { id: 'shelf-analysis', name: 'Shelf Analysis Model', type: 'Segmentation', accuracy: 0.92 },
    { id: 'product-recognition', name: 'Product Recognition', type: 'Classification', accuracy: 0.94 },
  ];

  // Recent inventory scans table data
  const recentScansData = useMemo(() => 
    [
      { timestamp: new Date().toLocaleTimeString(), location: 'Warehouse A-12', itemType: 'Electronics', itemsCount: 45, status: 'Verified' },
      { timestamp: new Date().toLocaleTimeString(), location: 'Shelf B-7', itemType: 'Clothing', itemsCount: 23, status: 'Discrepancy' },
      { timestamp: new Date().toLocaleTimeString(), location: 'Storage C-3', itemType: 'Food Items', itemsCount: 67, status: 'Low Stock' },
    ].map((scan, index) => ({
      ...scan,
      id: index,
    })), []
  );

  // TanStack Table Configuration for Recent Scans
  const recentScansColumns = useMemo(
    () => [
      columnHelper.accessor('timestamp', {
        header: 'Timestamp',
        cell: info => (
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {info.getValue()}
          </Typography>
        ),
      }),
      columnHelper.accessor('location', {
        header: 'Location',
        cell: info => (
          <Stack direction="row" alignItems="center" spacing={1}>
            <WarehouseIcon fontSize="small" color="action" />
            <Typography variant="body2">{info.getValue()}</Typography>
          </Stack>
        ),
      }),
      columnHelper.accessor('itemType', {
        header: 'Item Category',
        cell: info => (
          <Chip label={info.getValue()} size="small" color="primary" variant="outlined" icon={<CategoryIcon />} />
        ),
      }),
      columnHelper.accessor('itemsCount', {
        header: ({ column }) => (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <span>Items Count</span>
            {column.getIsSorted() === 'asc' && <ArrowUpIcon fontSize="small" />}
            {column.getIsSorted() === 'desc' && <ArrowDownIcon fontSize="small" />}
          </Stack>
        ),
        cell: info => (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" fontWeight={600}>
              {info.getValue()}
            </Typography>
            <InventoryIcon fontSize="small" color="action" />
          </Stack>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: info => {
          const status = info.getValue();
          const statusConfig = {
            'Verified': { color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
            'Discrepancy': { color: 'warning', icon: <WarningIcon fontSize="small" /> },
            'Low Stock': { color: 'error', icon: <ErrorIcon fontSize="small" /> },
          };
          const config = statusConfig[status] || { color: 'default', icon: null };
          return (
            <Chip
              label={status}
              size="small"
              color={config.color}
              variant="filled"
              icon={config.icon}
              sx={{ fontWeight: 600 }}
            />
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={() => console.log('View', row.original)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
            <IconButton size="small">
              <QrCodeScannerIcon fontSize="small" />
            </IconButton>
          </Stack>
        ),
      }),
    ],
    []
  );

  const recentScansTable = useReactTable({
    data: recentScansData,
    columns: recentScansColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      globalFilter,
    },
  });

  // Detection Results Table Configuration for Inventory Items
  const inventoryDetectionColumns = useMemo(
    () => [
      columnHelper.accessor('itemName', {
        header: 'Item Name',
        cell: info => (
          <Stack direction="row" alignItems="center" spacing={1}>
            <ShoppingCartIcon fontSize="small" color="primary" />
            <Typography variant="body2" fontWeight={500}>
              {info.getValue()}
            </Typography>
          </Stack>
        ),
      }),
      columnHelper.accessor('sku', {
        header: 'SKU/Barcode',
        cell: info => (
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {info.getValue()}
          </Typography>
        ),
      }),
      columnHelper.accessor('quantity', {
        header: 'Quantity',
        cell: info => (
          <Typography variant="body2" fontWeight={600}>
            {info.getValue()}
          </Typography>
        ),
      }),
      columnHelper.accessor('confidence', {
        header: 'Detection Confidence',
        cell: info => {
          const value = info.getValue();
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={value * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                  color={value > 0.9 ? 'success' : value > 0.7 ? 'warning' : 'error'}
                />
              </Box>
              <Typography variant="caption" sx={{ minWidth: 35 }}>
                {(value * 100).toFixed(0)}%
              </Typography>
            </Box>
          );
        },
      }),
      columnHelper.accessor('location', {
        header: 'Location',
        cell: info => {
          const location = info.getValue();
          if (!location) return '-';
          return (
            <Chip 
              label={location} 
              size="small" 
              variant="outlined"
              icon={<PointIcon />}
            />
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small">
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small">
              <PriceTagIcon fontSize="small" />
            </IconButton>
          </Stack>
        ),
      }),
    ],
    []
  );

  // Mock inventory detection results
  const mockInventoryDetections = [
    { itemName: 'iPhone 14 Pro', sku: 'SKU-001234', quantity: 12, confidence: 0.98, location: 'A-12-3' },
    { itemName: 'Samsung TV 55"', sku: 'SKU-005678', quantity: 5, confidence: 0.95, location: 'B-4-1' },
    { itemName: 'Nike Shoes', sku: 'SKU-009012', quantity: 24, confidence: 0.92, location: 'C-8-2' },
    { itemName: 'Coffee Maker', sku: 'SKU-003456', quantity: 8, confidence: 0.89, location: 'D-2-5' },
    { itemName: 'Laptop Bag', sku: 'SKU-007890', quantity: 15, confidence: 0.94, location: 'E-6-3' },
  ];

  // File upload handling
  const onDrop = useCallback((acceptedFiles) => {
    const newImages = acceptedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      status: 'pending',
      annotations: [],
    }));
    setSelectedImages(prev => [...prev, ...newImages]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    multiple: true
  });

  // GCS File Loading
  const loadFromGCS = async () => {
    setLoadingGcs(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/v1/vision/gcs/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: gcsPath }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setGcsFiles(data.files);
      }
    } catch (error) {
      console.error('Error loading GCS files:', error);
    } finally {
      setLoadingGcs(false);
    }
  };

  // Process images with AI model for inventory
  const processImages = async () => {
    setProcessing(true);
    setStatistics(prev => ({ ...prev, totalScanned: prev.totalScanned + selectedImages.length }));
    
    // Simulate processing
    setTimeout(() => {
      const results = selectedImages.map(img => ({
        imageId: img.id,
        detections: mockInventoryDetections.map(item => ({
          ...item,
          bbox: [
            Math.random() * 100,
            Math.random() * 100,
            50 + Math.random() * 100,
            50 + Math.random() * 100,
          ],
        })),
      }));
      setDetectionResults(results);
      setProcessing(false);
      
      // Update statistics
      const totalItems = results.reduce((sum, r) => 
        sum + r.detections.reduce((s, d) => s + d.quantity, 0), 0
      );
      setStatistics(prev => ({
        ...prev,
        itemsIdentified: prev.itemsIdentified + totalItems,
        accuracy: 0.96,
        processingTime: 180,
      }));
    }, 2000);
  };

  // Auto-label with GPT-4 Vision for inventory
  const autoLabelImages = async () => {
    if (!autoLabelPrompt) return;
    
    setProcessing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/v1/vision/auto-label`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: selectedImages.map(img => img.id),
          prompt: autoLabelPrompt,
        }),
      });
      
      if (response.ok) {
        const annotations = await response.json();
        setAnnotations(annotations);
      }
    } catch (error) {
      console.error('Error auto-labeling:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Export annotations
  const exportAnnotations = () => {
    const data = {
      images: selectedImages.map(img => ({
        id: img.id,
        name: img.name,
        annotations: annotations.filter(a => a.imageId === img.id),
      })),
      format: exportFormat,
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_annotations_${Date.now()}.${exportFormat}`;
    a.click();
  };

  // Train/Calibrate model
  const startTraining = async () => {
    setIsTraining(true);
    setTrainingProgress(0);
    
    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          return 100;
        }
        return prev + 5;
      });
    }, 500);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton onClick={onBack} size="small">
              <ArrowBackIcon />
            </IconButton>
            <VisibilityIcon sx={{ fontSize: 40, color: '#00357a' }} />
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Vision AI - Inventory Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI-powered inventory scanning, labeling, and management
              </Typography>
            </Box>
            <Chip
              label="Stock & Inventory"
              variant="outlined"
              size="small"
              icon={<InventoryIcon />}
            />
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Chip
              icon={<CheckCircleIcon />}
              label={`Model: ${activeModel}`}
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<SpeedIcon />}
              label={`${statistics.processingTime}ms`}
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<AssessmentIcon />}
              label={`Accuracy: ${(statistics.accuracy * 100).toFixed(1)}%`}
              variant="outlined"
              size="small"
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Main Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab icon={<QrCodeScannerIcon />} label="Scan & Count" />
          <Tab icon={<LabelIcon />} label="Label & Tag" />
          <Tab icon={<TuneIcon />} label="Calibrate" />
          <Tab icon={<PsychologyIcon />} label="AI Assist" />
          <Tab icon={<SettingsIcon />} label="Settings" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {/* Scan & Count Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Input Source Selection */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <ToggleButtonGroup
                    value={liveStream ? 'camera' : 'upload'}
                    exclusive
                    onChange={(e, v) => setLiveStream(v === 'camera')}
                  >
                    <ToggleButton value="upload">
                      <CloudUploadIcon sx={{ mr: 1 }} />
                      Upload Images
                    </ToggleButton>
                    <ToggleButton value="camera">
                      <CameraIcon sx={{ mr: 1 }} />
                      Live Scanner
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <Divider orientation="vertical" flexItem />

                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="model-select-label">Detection Model</InputLabel>
                    <Select 
                      labelId="model-select-label"
                      value={activeModel} 
                      onChange={(e) => setActiveModel(e.target.value)}
                      label="Detection Model"
                    >
                      {modelOptions.map(model => (
                        <MenuItem key={model.id} value={model.id}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography>{model.name}</Typography>
                            <Chip label={`${(model.accuracy * 100).toFixed(0)}%`} size="small" />
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Typography>Confidence:</Typography>
                  <Slider
                    value={confidence}
                    onChange={(e, v) => setConfidence(v)}
                    min={0}
                    max={1}
                    step={0.01}
                    sx={{ width: 150 }}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => `${(v * 100).toFixed(0)}%`}
                  />

                  <Button
                    variant="contained"
                    startIcon={processing ? <StopIcon /> : <QrCodeScannerIcon />}
                    onClick={processing ? () => setProcessing(false) : processImages}
                    disabled={selectedImages.length === 0 && !liveStream}
                  >
                    {processing ? 'Stop' : 'Scan Items'}
                  </Button>
                </Stack>
              </Paper>
            </Grid>

            {/* Upload Area or Camera View */}
            <Grid item xs={12}>
              {!liveStream ? (
                <Paper
                  {...getRootProps()}
                  sx={{
                    p: 4,
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'divider',
                    bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                    cursor: 'pointer',
                    textAlign: 'center',
                    minHeight: 200,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <input {...getInputProps()} />
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Drop shelf/warehouse images here or click to browse
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supports PNG, JPG, JPEG, GIF, BMP, WebP
                  </Typography>
                  
                  <Divider sx={{ my: 3 }}>OR</Divider>
                  
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <TextField
                      placeholder="gs://bucket/inventory-images"
                      value={gcsPath}
                      onChange={(e) => setGcsPath(e.target.value)}
                      size="small"
                      sx={{ width: 300 }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<CloudDownloadIcon />}
                      onClick={loadFromGCS}
                      disabled={!gcsPath || loadingGcs}
                    >
                      Load from GCS
                    </Button>
                  </Stack>
                </Paper>
              ) : (
                <Paper sx={{ p: 2, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Stack alignItems="center" spacing={2}>
                    <QrCodeScannerIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
                    <Typography variant="h6" color="text.secondary">
                      Barcode/QR scanner will appear here
                    </Typography>
                    <Button variant="outlined" startIcon={<CameraIcon />}>
                      Enable Scanner
                    </Button>
                  </Stack>
                </Paper>
              )}
            </Grid>

            {/* Image Grid */}
            {selectedImages.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      Selected Images ({selectedImages.length})
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(e, v) => v && setViewMode(v)}
                        size="small"
                      >
                        <ToggleButton value="grid">
                          <GridOnIcon />
                        </ToggleButton>
                        <ToggleButton value="list">
                          <CollectionsIcon />
                        </ToggleButton>
                      </ToggleButtonGroup>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => setSelectedImages([])}
                      >
                        Clear All
                      </Button>
                    </Stack>
                  </Stack>

                  <Grid container spacing={2}>
                    {selectedImages.map((image) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={image.id}>
                        <Card sx={{ 
                          position: 'relative',
                          '&:hover': {
                            boxShadow: theme.shadows[8],
                            transform: 'translateY(-2px)',
                            transition: 'all 0.3s ease',
                          }
                        }}>
                          <Box
                            sx={{
                              height: 200,
                              backgroundImage: `url(${image.url})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              position: 'relative',
                            }}
                          >
                            {processing && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  bgcolor: 'rgba(0,0,0,0.5)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <CircularProgress color="primary" />
                              </Box>
                            )}
                            {detectionResults.find(r => r.imageId === image.id) && (
                              <Chip
                                label={`${detectionResults.find(r => r.imageId === image.id).detections.length} items`}
                                color="success"
                                size="small"
                                icon={<InventoryIcon />}
                                sx={{ position: 'absolute', top: 8, right: 8 }}
                              />
                            )}
                          </Box>
                          <CardContent>
                            <Typography variant="body2" noWrap>
                              {image.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {(image.size / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            )}

            {/* Results Display with TanStack Table */}
            {detectionResults.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Inventory Detection Results
                  </Typography>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Identified {detectionResults.reduce((sum, r) => sum + r.detections.length, 0)} unique items across {detectionResults.length} images
                  </Alert>
                  
                  {detectionResults.map((result) => {
                    const resultTable = useReactTable({
                      data: result.detections,
                      columns: inventoryDetectionColumns,
                      getCoreRowModel: getCoreRowModel(),
                    });

                    return (
                      <Accordion key={result.imageId}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography>
                              Image: {selectedImages.find(img => img.id === result.imageId)?.name}
                            </Typography>
                            <Chip
                              label={`${result.detections.length} items`}
                              size="small"
                              color="primary"
                              icon={<InventoryIcon />}
                            />
                          </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                {resultTable.getHeaderGroups().map(headerGroup => (
                                  <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                      <TableCell key={header.id}>
                                        {flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                        )}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableHead>
                              <TableBody>
                                {resultTable.getRowModel().rows.map(row => (
                                  <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                      <TableCell key={cell.id}>
                                        {flexRender(
                                          cell.column.columnDef.cell,
                                          cell.getContext()
                                        )}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Paper>
              </Grid>
            )}
          </Grid>
        )}

        {/* Label & Tag Tab */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  <ToggleButtonGroup
                    value={labelMode}
                    exclusive
                    onChange={(e, v) => v && setLabelMode(v)}
                    size="small"
                  >
                    <ToggleButton value="manual">
                      <EditIcon sx={{ mr: 1 }} />
                      Manual Tagging
                    </ToggleButton>
                    <ToggleButton value="auto">
                      <AutoAwesomeIcon sx={{ mr: 1 }} />
                      Auto-Identify
                    </ToggleButton>
                    <ToggleButton value="validation">
                      <CheckCircleIcon sx={{ mr: 1 }} />
                      Verification
                    </ToggleButton>
                  </ToggleButtonGroup>

                  {labelMode === 'manual' && (
                    <>
                      <Divider orientation="vertical" flexItem />
                      <Typography>Annotation Tool:</Typography>
                      <ToggleButtonGroup
                        value={drawingTool}
                        exclusive
                        onChange={(e, v) => v && setDrawingTool(v)}
                        size="small"
                      >
                        <ToggleButton value="rectangle">
                          <RectangleIcon />
                        </ToggleButton>
                        <ToggleButton value="polygon">
                          <PolylineIcon />
                        </ToggleButton>
                        <ToggleButton value="point">
                          <PointIcon />
                        </ToggleButton>
                        <ToggleButton value="barcode">
                          <QrCodeScannerIcon />
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </>
                  )}

                  {labelMode === 'auto' && (
                    <>
                      <TextField
                        placeholder="Describe items to identify (e.g., 'Find all electronics and label with SKU')"
                        value={autoLabelPrompt}
                        onChange={(e) => setAutoLabelPrompt(e.target.value)}
                        size="small"
                        sx={{ flexGrow: 1 }}
                      />
                      <Button
                        variant="contained"
                        startIcon={<AutoAwesomeIcon />}
                        onClick={autoLabelImages}
                        disabled={!autoLabelPrompt || selectedImages.length === 0}
                      >
                        Auto-Identify
                      </Button>
                    </>
                  )}

                  <Box sx={{ flexGrow: 1 }} />
                  
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel id="export-format-select-label">Export Format</InputLabel>
                    <Select 
                      labelId="export-format-select-label"
                      value={exportFormat} 
                      onChange={(e) => setExportFormat(e.target.value)}
                      label="Export Format"
                    >
                      <MenuItem value="json">JSON</MenuItem>
                      <MenuItem value="csv">CSV</MenuItem>
                      <MenuItem value="excel">Excel</MenuItem>
                      <MenuItem value="xml">XML</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={exportAnnotations}
                    disabled={annotations.length === 0}
                  >
                    Export
                  </Button>
                </Stack>

                {/* Annotation Canvas Area */}
                <Box sx={{ 
                  height: 500, 
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  borderRadius: 1, 
                  position: 'relative',
                  border: `1px dashed ${theme.palette.divider}`,
                }}>
                  {selectedImages.length > 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="h6" color="text.secondary">
                        Inventory tagging canvas will appear here
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Select an image to start tagging items
                      </Typography>
                    </Box>
                  ) : (
                    <Stack alignItems="center" justifyContent="center" height="100%" spacing={2}>
                      <LabelIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
                      <Typography variant="h6" color="text.secondary">
                        No images loaded
                      </Typography>
                      <Button variant="outlined" onClick={() => setActiveTab(1)}>
                        Go to Scan & Count Tab
                      </Button>
                    </Stack>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Calibrate Tab */}
        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Model Training Configuration
                </Typography>
                
                <Stack spacing={3}>
                  <FormControl fullWidth>
                    <InputLabel id="base-model-select-label">Base Model</InputLabel>
                    <Select 
                      labelId="base-model-select-label"
                      value={activeModel} 
                      onChange={(e) => setActiveModel(e.target.value)}
                      label="Base Model"
                    >
                      {modelOptions.map(model => (
                        <MenuItem key={model.id} value={model.id}>
                          {model.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box>
                    <Typography gutterBottom>Training Epochs: {calibrationSettings.epochs}</Typography>
                    <Slider
                      value={calibrationSettings.epochs}
                      onChange={(e, v) => setCalibrationSettings(prev => ({ ...prev, epochs: v }))}
                      min={10}
                      max={500}
                      step={10}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Box>

                  <Box>
                    <Typography gutterBottom>Batch Size: {calibrationSettings.batchSize}</Typography>
                    <Slider
                      value={calibrationSettings.batchSize}
                      onChange={(e, v) => setCalibrationSettings(prev => ({ ...prev, batchSize: v }))}
                      min={1}
                      max={64}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Box>

                  <Box>
                    <Typography gutterBottom>Learning Rate: {calibrationSettings.learningRate}</Typography>
                    <Slider
                      value={calibrationSettings.learningRate}
                      onChange={(e, v) => setCalibrationSettings(prev => ({ ...prev, learningRate: v }))}
                      min={0.0001}
                      max={0.01}
                      step={0.0001}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(v) => v.toFixed(4)}
                    />
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={calibrationSettings.dataAugmentation}
                        onChange={(e) => setCalibrationSettings(prev => ({ ...prev, dataAugmentation: e.target.checked }))}
                      />
                    }
                    label="Enable Data Augmentation"
                  />

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={isTraining ? <StopIcon /> : <ModelTrainingIcon />}
                    onClick={isTraining ? () => setIsTraining(false) : startTraining}
                    color={isTraining ? 'error' : 'primary'}
                  >
                    {isTraining ? 'Stop Training' : 'Start Training'}
                  </Button>

                  {isTraining && (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Training Progress: {trainingProgress}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={trainingProgress} 
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Training Dataset
                </Typography>
                
                <Stack spacing={2}>
                  <Alert severity="info">
                    Upload your inventory training data to Google Cloud Storage
                  </Alert>
                  
                  <TextField
                    label="GCS Training Data Path"
                    placeholder="gs://your-bucket/inventory-training"
                    fullWidth
                  />
                  
                  <TextField
                    label="GCS Validation Data Path"
                    placeholder="gs://your-bucket/inventory-validation"
                    fullWidth
                  />
                  
                  <Button variant="outlined" startIcon={<CloudDownloadIcon />}>
                    Validate Dataset
                  </Button>
                  
                  <Divider />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Dataset Statistics
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card variant="outlined" sx={{ p: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Training Images
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>0</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card variant="outlined" sx={{ p: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Validation Images
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>0</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card variant="outlined" sx={{ p: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Product Classes
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>0</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card variant="outlined" sx={{ p: 1.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Total Annotations
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>0</Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Model Performance History
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ParentSize>
                    {({ width, height }) => (
                      <StockLevelsChart 
                        data={stockLevelsData} 
                        width={width} 
                        height={height} 
                      />
                    )}
                  </ParentSize>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* AI Assist Tab */}
        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper 
                sx={{ 
                  p: 3, 
                  height: 'calc(100vh - 280px)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  AI Assistant for Inventory Management
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Ask questions about inventory tracking, stock optimization, or get help with the platform
                </Alert>
                
                {/* Chat Messages Area - Scrollable */}
                <Box sx={{ 
                  flexGrow: 1,
                  bgcolor: alpha(theme.palette.grey[500], 0.05),
                  borderRadius: 1, 
                  p: 2, 
                  mb: 2,
                  overflowY: 'auto',
                  minHeight: 0, // Important for flexbox overflow
                }}>
                  <Typography variant="body2" color="text.secondary">
                    Chat messages will appear here...
                  </Typography>
                </Box>
                
                {/* Quick Actions - Always Visible */}
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Quick Actions:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.5 }}>
                    <Chip label="How to optimize stock levels?" clickable size="small" />
                    <Chip label="Best practices for inventory tracking" clickable size="small" />
                    <Chip label="Explain reorder points" clickable size="small" />
                    <Chip label="Barcode vs QR codes" clickable size="small" />
                    <Chip label="Cycle counting strategies" clickable size="small" />
                  </Stack>
                </Box>
                
                {/* Input Section - Always Visible at Bottom */}
                <Stack 
                  direction="row" 
                  spacing={2}
                  sx={{
                    position: 'sticky',
                    bottom: 0,
                    bgcolor: 'background.paper',
                    pt: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                  }}
                >
                  <TextField
                    fullWidth
                    placeholder="Ask about inventory management..."
                    variant="outlined"
                    multiline
                    maxRows={3}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.paper',
                      }
                    }}
                  />
                  <Button 
                    variant="contained" 
                    endIcon={<SendIcon />}
                    sx={{ 
                      alignSelf: 'flex-end',
                      minWidth: 100,
                    }}
                  >
                    Send
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Settings Tab */}
        {activeTab === 4 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Model Settings
                </Typography>
                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel id="default-model-select-label">Default Model</InputLabel>
                    <Select 
                      labelId="default-model-select-label"
                      value={activeModel}
                      onChange={(e) => setActiveModel(e.target.value)}
                      label="Default Model"
                    >
                      {modelOptions.map(model => (
                        <MenuItem key={model.id} value={model.id}>
                          {model.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <TextField
                    label="Model Server URL"
                    defaultValue="http://localhost:5001"
                    fullWidth
                  />
                  
                  <TextField
                    label="OpenAI API Key"
                    type="password"
                    fullWidth
                    helperText="Required for GPT-4 Vision auto-identification"
                  />
                </Stack>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Storage Settings
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="GCS Bucket"
                    placeholder="inventory-vision-ai"
                    fullWidth
                  />
                  
                  <TextField
                    label="GCS Project ID"
                    placeholder="your-gcp-project"
                    fullWidth
                  />
                  
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Auto-upload scanned images to GCS"
                  />
                  
                  <FormControlLabel
                    control={<Switch />}
                    label="Enable local caching"
                  />
                  
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Real-time inventory sync"
                  />
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default VisionAIDashboard;