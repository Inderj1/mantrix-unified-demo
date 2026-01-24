import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  Stack,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  InputAdornment,
  Collapse,
  alpha,
  MenuItem,
  TablePagination,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ViewList as ViewListIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  NavigateNext as NavigateNextIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  RestartAlt as ResetIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonChecked as RadioButtonCheckedIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Warning as WarningIcon,
  Block as BlockIcon,
  Whatshot as WhatshotIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import ordlyTheme from './ordlyTheme';
import InfoDialog from './InfoDialog';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

// Line status chip styles
const getLineStatusChipProps = (status) => {
  const styles = {
    pending: { bgcolor: alpha('#f59e0b', 0.12), color: '#d97706', label: 'Pending' },
    approved: { bgcolor: alpha('#10b981', 0.12), color: '#059669', label: 'Approved' },
    held: { bgcolor: alpha('#ef4444', 0.12), color: '#dc2626', label: 'Held' },
    rejected: { bgcolor: alpha('#64748b', 0.12), color: '#475569', label: 'Rejected' },
    escalated: { bgcolor: alpha('#ef4444', 0.12), color: '#dc2626', label: 'Escalated' },
  };
  return styles[status] || styles.pending;
};

// Line Items Table Component for multi-line orders
const LineItemsTable = ({ lineItems, onLineClick, darkMode }) => {
  if (!lineItems || lineItems.length === 0) return null;

  return (
    <Box sx={{ mt: 2, borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
        Line Items ({lineItems.length})
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ bgcolor: darkMode ? '#0d1117' : 'white' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: darkMode ? '#1e293b' : '#f1f5f9' }}>
              <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', width: 50 }}>#</TableCell>
              <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b' }}>Material</TableCell>
              <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', width: 80 }}>Quantity</TableCell>
              <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', width: 80 }}>Status</TableCell>
              <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', width: 100 }}>SKU</TableCell>
              <TableCell sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', width: 80, textAlign: 'right' }}>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lineItems.map((line) => {
              const statusProps = getLineStatusChipProps(line.lineStatus);
              return (
                <TableRow
                  key={line.lineNumber}
                  hover
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onLineClick) onLineClick(line.lineNumber);
                  }}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: alpha('#002352', 0.06) },
                  }}
                >
                  <TableCell>
                    <Chip
                      label={line.lineNumber}
                      size="small"
                      sx={{
                        bgcolor: alpha('#002352', 0.1),
                        color: '#002352',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        height: 20,
                        minWidth: 24,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }} noWrap title={line.material}>
                      {line.material?.slice(0, 35) || '--'}
                    </Typography>
                    {line.materialId && (
                      <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>
                        {line.materialId}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.75rem' }}>
                      {line.quantity?.toLocaleString()} {line.unit || 'MSI'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusProps.label}
                      size="small"
                      sx={{
                        ...statusProps,
                        fontWeight: 600,
                        fontSize: '0.55rem',
                        height: 18,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.7rem', fontFamily: 'monospace', color: line.selectedSku ? '#002352' : '#94a3b8' }}>
                      {line.selectedSku || '---'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      ${(line.extendedPrice || 0).toLocaleString()}
                    </Typography>
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

// Generate tiles based on order stage - 3 stage flow: Intent -> SKU Decisioning -> Arbitration
const generateTilesForOrder = (order) => {
  // Map old 4-stage to new 3-stage (stages 1 & 2 merged into 1)
  const mappedStage = order.stage >= 3 ? 2 : (order.stage >= 1 ? 1 : 0);
  const isEscalated = order.status === 'escalated';

  const getStageStatus = (stageNum) => {
    if (stageNum < mappedStage) return 'complete';
    if (stageNum === mappedStage) return isEscalated ? 'escalated' : 'active';
    return 'pending';
  };

  // Only show values for stages the order has reached or passed
  const hasReachedStage = (stageNum) => mappedStage >= stageNum;

  return [
    {
      stage: 0,
      label: 'INTENT',
      title: 'Customer Intent Analysis',
      status: getStageStatus(0),
      fields: [
        { key: 'Customer', value: order.customer ? order.customer.slice(0, 20) : '--' },
        { key: 'PO Number', value: order.id?.replace('PO-', '') || '--' },
        { key: 'Material', value: order.material ? order.material.slice(0, 20) : '--' },
        { key: 'Confidence', value: order.confidence ? `${order.confidence}%` : '94%' },
      ],
      highlight: {
        label: mappedStage === 0 ? 'Analyzing Intent' : 'Intent Captured',
        value: mappedStage === 0 ? 'Extracting fields...' : 'Complete',
        color: mappedStage === 0 ? '#0d47a1' : '#10b981',
      },
    },
    {
      stage: 1,
      label: 'SKU DECISIONING',
      title: 'SKU & BOM Decisioning',
      status: getStageStatus(1),
      fields: hasReachedStage(1) ? [
        { key: 'Best Margin', value: order.margin ? `${order.margin.toFixed(1)}%` : '--' },
        { key: 'Lead Time', value: order.leadTime ? `${order.leadTime} days` : '--' },
        { key: 'Quantity', value: order.quantity || '--' },
        { key: 'Plant', value: order.plant || '--' },
      ] : [
        { key: 'Best Margin', value: '--' },
        { key: 'Lead Time', value: '--' },
        { key: 'Quantity', value: '--' },
        { key: 'Plant', value: '--' },
      ],
      highlight: {
        label: mappedStage === 1 ? 'Optimizing SKU' : mappedStage > 1 ? 'SKU Selected' : 'Awaiting Intent',
        value: mappedStage >= 1 ? (order.margin ? `${order.margin.toFixed(1)}% margin` : 'Analyzing...') : '--',
        color: mappedStage === 1 ? '#00357a' : mappedStage > 1 ? '#10b981' : '#64748b',
      },
    },
    {
      stage: 2,
      label: 'ARBITRATION',
      title: 'Order Value Control',
      status: getStageStatus(2),
      fields: hasReachedStage(2) ? [
        { key: 'Customer', value: order.customer ? order.customer.slice(0, 20) : '--' },
        { key: 'Order Value', value: order.value ? `$${order.value.toLocaleString()}` : '--' },
        { key: 'Margin', value: order.margin ? `${order.margin.toFixed(1)}%` : '--' },
        { key: 'Status', value: order.status || '--' },
      ] : [
        { key: 'Customer', value: '--' },
        { key: 'Order Value', value: '--' },
        { key: 'Margin', value: '--' },
        { key: 'Status', value: '--' },
      ],
      highlight: {
        label: isEscalated ? 'Escalated' : mappedStage === 2 ? 'In Review' : mappedStage > 2 ? 'Approved' : 'Awaiting SKU',
        value: isEscalated ? 'Requires Review' : mappedStage >= 2 ? 'Passed' : '--',
        color: isEscalated ? '#ef4444' : mappedStage === 2 ? '#f59e0b' : mappedStage > 2 ? '#10b981' : '#64748b',
      },
    },
  ];
};

// Expandable Row Component
const ExpandableRow = ({ row, isOpen, onToggle, darkMode, onTileClick, onLineClick }) => {
  const getStatusChipProps = (status) => {
    const styles = {
      rush: { bgcolor: alpha('#ef4444', 0.12), color: '#dc2626' },
      new: { bgcolor: alpha('#1976d2', 0.12), color: '#1565c0' },
      processing: { bgcolor: alpha('#1a5a9e', 0.12), color: '#00357a' },
      escalated: { bgcolor: alpha('#ef4444', 0.12), color: '#dc2626' },
      review: { bgcolor: alpha('#f59e0b', 0.12), color: '#d97706' },
      approved: { bgcolor: alpha('#10b981', 0.12), color: '#059669' },
      committed: { bgcolor: alpha('#10b981', 0.15), color: '#059669' },
    };
    return styles[status] || styles.new;
  };

  const getTileStatusChip = (status) => {
    const styles = {
      complete: { label: 'Complete', icon: <CheckCircleIcon sx={{ fontSize: 10, mr: 0.5 }} />, bgcolor: alpha('#10b981', 0.1), color: '#059669' },
      active: { label: 'Active', icon: <RadioButtonCheckedIcon sx={{ fontSize: 10, mr: 0.5 }} />, bgcolor: alpha('#1976d2', 0.1), color: '#1565c0' },
      pending: { label: 'Pending', icon: <RadioButtonUncheckedIcon sx={{ fontSize: 10, mr: 0.5 }} />, bgcolor: alpha('#64748b', 0.1), color: '#64748b' },
      escalated: { label: 'Escalated', icon: <WarningIcon sx={{ fontSize: 10, mr: 0.5 }} />, bgcolor: alpha('#ef4444', 0.1), color: '#dc2626' },
      blocked: { label: 'Blocked', icon: <BlockIcon sx={{ fontSize: 10, mr: 0.5 }} />, bgcolor: alpha('#64748b', 0.1), color: '#64748b' },
    };
    return styles[status] || styles.pending;
  };

  const getTileLabelColor = (stage) => {
    // 3-stage flow colors: Intent (dark blue), SKU Decisioning (blue), Arbitration (amber)
    const colors = ['#0d47a1', '#00357a', '#f59e0b'];
    return colors[stage] || '#64748b';
  };

  return (
    <>
      {/* Main Row */}
      <TableRow
        hover
        onClick={onToggle}
        sx={{
          cursor: 'pointer',
          bgcolor: isOpen ? alpha('#002352', 0.04) : 'inherit',
          '&:hover': { bgcolor: alpha('#002352', 0.06) },
        }}
      >
        <TableCell sx={{ width: 40, p: 1 }}>
          <IconButton size="small">
            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ width: 100 }}>
          <Chip
            icon={row.status === 'rush' ? <WhatshotIcon sx={{ fontSize: 12 }} /> : undefined}
            label={row.status === 'rush' ? 'RUSH' : row.status.toUpperCase()}
            size="small"
            sx={{ ...getStatusChipProps(row.status), fontWeight: 600, fontSize: '0.65rem' }}
          />
        </TableCell>
        <TableCell>
          <Typography sx={{ fontWeight: 700, color: '#1565c0', fontSize: '0.8rem' }}>{row.id}</Typography>
        </TableCell>
        <TableCell>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{row.customer}</Typography>
        </TableCell>
        <TableCell align="center">
          <Chip
            label={row.lineCount || 1}
            size="small"
            sx={{
              minWidth: 24,
              height: 22,
              bgcolor: (row.lineCount || 1) > 1 ? alpha('#002352', 0.12) : alpha('#64748b', 0.1),
              color: (row.lineCount || 1) > 1 ? '#002352' : '#64748b',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          />
        </TableCell>
        <TableCell>
          {(row.lineCount || 1) > 1 ? (
            <Tooltip
              title={
                <Box sx={{ p: 0.5 }}>
                  {(row.lineItems || []).map((li, idx) => (
                    <Typography key={idx} sx={{ fontSize: '0.7rem', mb: 0.3 }}>
                      {li.lineNumber}. {li.material}
                    </Typography>
                  ))}
                </Box>
              }
              arrow
            >
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', cursor: 'help' }} noWrap>
                {(row.lineItems || []).slice(0, 2).map(li => li.material?.slice(0, 12)).join(', ')}
                {(row.lineItems || []).length > 2 ? ` +${row.lineItems.length - 2} more` : '...'}
              </Typography>
            </Tooltip>
          ) : (
            <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }} noWrap>{row.material}</Typography>
          )}
        </TableCell>
        <TableCell>
          <Typography sx={{ fontSize: '0.8rem' }}>{row.quantity}</Typography>
        </TableCell>
        <TableCell>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>{row.unit || '--'}</Typography>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 0.3 }}>
              {[0, 1, 2].map((s) => {
                // Map old 4-stage to new 3-stage for display
                const mappedStage = row.stage >= 3 ? 2 : (row.stage >= 1 ? 1 : 0);
                return (
                  <Box
                    key={s}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: s < mappedStage ? '#10b981' : s === mappedStage ? '#1976d2' : alpha('#64748b', 0.3),
                    }}
                  />
                );
              })}
            </Box>
            <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>{row.stageLabel}</Typography>
          </Box>
        </TableCell>
        <TableCell align="right">
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>${row.value.toLocaleString()}</Typography>
        </TableCell>
      </TableRow>

      {/* Expandable Detail Row */}
      <TableRow>
        <TableCell colSpan={9} sx={{ p: 0, borderBottom: isOpen ? '1px solid' : 'none', borderColor: 'divider' }}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, bgcolor: darkMode ? alpha('#002352', 0.05) : alpha('#002352', 0.02) }}>
              <Grid container spacing={1.5}>
                {row.tiles.map((tile, idx) => {
                  const labelColor = getTileLabelColor(tile.stage);
                  const statusChip = getTileStatusChip(tile.status);
                  const isPending = tile.status === 'pending' || tile.status === 'blocked';
                  // Check if order has reached this stage - only allow clicking on stages the order has reached
                  const orderStage = row.stage ?? 0;
                  const hasReachedStage = orderStage >= tile.stage;
                  const isClickable = hasReachedStage;

                  return (
                    <Grid item xs={12} sm={4} md={4} key={idx}>
                      <Card
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          // Only allow navigation if order has reached this stage
                          if (!isClickable) {
                            console.log('🔴 TILE BLOCKED - Order has not reached this stage:', tile.stage, 'Order stage:', orderStage);
                            return;
                          }
                          console.log('🔵 TILE CLICKED:', tile.stage, tile.label, row.id);
                          if (onTileClick) {
                            onTileClick(tile.stage, row);
                          }
                        }}
                        sx={{
                          borderTop: `3px solid ${isClickable ? labelColor : '#cbd5e1'}`,
                          opacity: isClickable ? (isPending ? 0.7 : 1) : 0.5,
                          height: '100%',
                          bgcolor: isClickable ? (darkMode ? '#161b22' : 'white') : (darkMode ? '#1e293b' : '#f1f5f9'),
                          cursor: isClickable ? 'pointer' : 'not-allowed',
                          transition: 'all 0.2s ease',
                          position: 'relative',
                          '&:hover': isClickable ? {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 4px 12px ${alpha(labelColor, 0.25)}`,
                            borderColor: labelColor,
                          } : {},
                        }}
                      >
                        {/* Locked overlay for stages not yet reached */}
                        {!isClickable && (
                          <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: darkMode ? 'rgba(30, 41, 59, 0.85)' : 'rgba(241, 245, 249, 0.85)',
                            zIndex: 10,
                            borderRadius: 1,
                          }}>
                            <Stack alignItems="center" spacing={0.5}>
                              <LockIcon sx={{ fontSize: 24, color: '#94a3b8' }} />
                              <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                                Not Reached
                              </Typography>
                            </Stack>
                          </Box>
                        )}
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                          {/* Tile Header */}
                          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: isClickable ? labelColor : '#94a3b8', letterSpacing: 0.5 }}>
                              {tile.stage}. {tile.label}
                            </Typography>
                            <Chip
                              icon={statusChip.icon}
                              label={statusChip.label}
                              size="small"
                              sx={{ bgcolor: statusChip.bgcolor, color: statusChip.color, fontWeight: 600, fontSize: '0.5rem', height: 16, '& .MuiChip-icon': { ml: 0.5 } }}
                            />
                          </Stack>

                          {/* Tile Title */}
                          <Typography sx={{ fontWeight: 600, fontSize: '0.75rem', mb: 1, color: darkMode ? '#e2e8f0' : 'text.primary' }} noWrap>
                            {tile.title}
                          </Typography>

                          {/* Fields - show only first 2 on small tiles */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
                            {tile.fields.slice(0, 3).map((field, fidx) => (
                              <Box key={fidx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ fontSize: '0.6rem', color: '#64748b' }}>{field.key}</Typography>
                                <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: field.value === '--' ? '#94a3b8' : (darkMode ? '#e2e8f0' : 'text.primary') }} noWrap>
                                  {field.value}
                                </Typography>
                              </Box>
                            ))}
                          </Box>

                          {/* Highlight */}
                          <Box sx={{ bgcolor: darkMode ? alpha('#64748b', 0.1) : '#f8fafc', borderRadius: 1, p: 1, border: `1px solid ${alpha(tile.highlight.color, 0.2)}` }}>
                            <Typography sx={{ fontSize: '0.55rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              {tile.highlight.label}
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: tile.highlight.color }}>
                              {tile.highlight.value}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Line Items Table for multi-line orders */}
              {row.lineItems && row.lineItems.length > 1 && (
                <LineItemsTable
                  lineItems={row.lineItems}
                  onLineClick={(lineNumber) => {
                    if (onLineClick) onLineClick(row, lineNumber);
                  }}
                  darkMode={darkMode}
                />
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const SalesOrderPipeline = ({ onBack, darkMode = false, onNavigate }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [orderBy, setOrderBy] = useState('status');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Info dialog state (replaces browser alerts)
  const [infoDialog, setInfoDialog] = useState({ open: false, title: '', message: '', type: 'info' });

  // Data fetching state
  const [pipelineData, setPipelineData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    pipelineValue: 0,
    avgMargin: 0,
    committed: 0,
    escalated: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  const fetchPipelineData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/pipeline?limit=100`);
      if (!response.ok) throw new Error('Failed to fetch pipeline data');
      const data = await response.json();

      // Transform orders to include tiles
      // API already returns id with PO- prefix, don't add it again
      const ordersWithTiles = data.orders.map(order => ({
        ...order,
        tiles: generateTilesForOrder(order),
        // Include lineItems from API response (for multi-line orders)
        lineItems: order.lineItems || [],
        lineCount: order.lineCount || 1,
      }));

      setPipelineData(ordersWithTiles);
      setStats({
        total: data.stats.total,
        inProgress: data.stats.inProgress,
        pipelineValue: data.stats.pipelineValue,
        avgMargin: data.stats.avgMargin?.toFixed(1) || '0',
        committed: data.stats.completed,
        escalated: data.stats.escalated,
      });
    } catch (err) {
      console.error('Error fetching pipeline data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelineData();
  }, []);

  // Export handler
  const handleExport = () => {
    window.open(`${API_BASE_URL}/api/ordlyai/pipeline/export`, '_blank');
  };

  // Reset all orders handler
  const handleResetAll = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/orders/reset-all`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to reset orders');
      const result = await response.json();
      setInfoDialog({
        open: true,
        title: 'Orders Reset',
        message: result.message || 'All orders have been reset to their initial state for demo purposes.',
        type: 'success',
      });
      fetchPipelineData();
    } catch (err) {
      console.error('Error resetting orders:', err);
      setInfoDialog({ open: true, title: 'Error', message: err.message, type: 'error' });
    }
  };

  // IBP-style filter panel state
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    stage: '',
    customer: '',
    material: '',
    minValue: '',
    maxValue: '',
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      stage: '',
      customer: '',
      material: '',
      minValue: '',
      maxValue: '',
    });
    setPage(0);
  };

  const allStatuses = [...new Set(pipelineData.map(r => r.status))];
  const allStages = [...new Set(pipelineData.map(r => r.stageLabel))];
  const allCustomers = [...new Set(pipelineData.map(r => r.customer))];

  // Filter and sort data
  const filteredData = useMemo(() => {
    let data = [...pipelineData];

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      data = data.filter(row =>
        row.id.toLowerCase().includes(query) ||
        row.customer.toLowerCase().includes(query) ||
        row.material.toLowerCase().includes(query) ||
        row.status.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status) {
      data = data.filter(row => row.status === filters.status);
    }

    // Stage filter
    if (filters.stage) {
      data = data.filter(row => row.stageLabel === filters.stage);
    }

    // Customer filter
    if (filters.customer) {
      data = data.filter(row => row.customer === filters.customer);
    }

    // Material filter
    if (filters.material) {
      const query = filters.material.toLowerCase();
      data = data.filter(row => row.material.toLowerCase().includes(query));
    }

    // Value range filter
    if (filters.minValue) {
      data = data.filter(row => row.value >= Number(filters.minValue));
    }
    if (filters.maxValue) {
      data = data.filter(row => row.value <= Number(filters.maxValue));
    }

    // Sort
    data.sort((a, b) => {
      let aVal = a[orderBy];
      let bVal = b[orderBy];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [pipelineData, filters, orderBy, order]);

  // Paginated data
  const paginatedData = useMemo(() => {
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const columns = [
    { id: 'expand', label: '', sortable: false, width: 40 },
    { id: 'status', label: 'Status', sortable: true, width: 100 },
    { id: 'id', label: 'PO Number', sortable: true },
    { id: 'customer', label: 'Customer', sortable: true },
    { id: 'lineCount', label: 'Items', sortable: true, width: 60, align: 'center' },
    { id: 'material', label: 'Material / Spec', sortable: true },
    { id: 'quantity', label: 'Quantity', sortable: true },
    { id: 'unit', label: 'UOM', sortable: true, width: 60 },
    { id: 'stage', label: 'Stage', sortable: true },
    { id: 'value', label: 'Value', sortable: true, align: 'right' },
  ];

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

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
              Sales Order Pipeline
            </Typography>
          </Breadcrumbs>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Reset All Orders"><IconButton color="warning" onClick={handleResetAll} disabled={loading}><ResetIcon /></IconButton></Tooltip>
            <Tooltip title="Refresh"><IconButton color="primary" onClick={fetchPipelineData} disabled={loading}><RefreshIcon /></IconButton></Tooltip>
            <Tooltip title="Export"><IconButton color="primary" onClick={handleExport}><DownloadIcon /></IconButton></Tooltip>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
              Back to ORDLY.AI
            </Button>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <ViewListIcon sx={{ fontSize: 40, color: '#002352' }} />
          <Typography variant="h5" fontWeight={600}>Sales Order Pipeline</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Unified view of all orders across workflow stages - Click a row to expand details
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Orders', value: stats.total, color: '#002352' },
          { label: 'In Progress', value: stats.inProgress, color: '#f59e0b' },
          { label: 'Pipeline Value', value: stats.pipelineValue >= 1000000 ? `$${(stats.pipelineValue / 1000000).toFixed(1)}M` : `$${(stats.pipelineValue / 1000).toFixed(1)}K`, color: '#10b981' },
          { label: 'Avg Margin', value: `${stats.avgMargin}%`, color: '#10b981' },
          { label: 'Committed', value: stats.committed, color: '#1a5a9e' },
          { label: 'Escalated', value: stats.escalated, color: '#ef4444' },
        ].map((card) => (
          <Grid item xs={6} sm={4} md={2} key={card.label}>
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

      {/* Table Card */}
      <Card variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: filterPanelOpen ? 2 : 0 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <ViewListIcon sx={{ color: '#002352', fontSize: 18 }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                Order Pipeline
              </Typography>
              <Chip label={`${filteredData.length} orders`} size="small" sx={{ bgcolor: alpha('#002352', 0.12), color: '#002352', fontWeight: 600, fontSize: '0.7rem' }} />
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              {/* Quick Search */}
              <TextField
                size="small"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: '#64748b' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 200, '& .MuiInputBase-input': { fontSize: '0.8rem' } }}
              />
              <Tooltip title={filterPanelOpen ? 'Hide Filters' : 'Show Filters'}>
                <IconButton
                  onClick={() => setFilterPanelOpen(!filterPanelOpen)}
                  color={activeFilterCount > 0 ? 'primary' : 'default'}
                >
                  <FilterListIcon />
                  {activeFilterCount > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: '#002352',
                        color: 'white',
                        fontSize: '0.6rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                      }}
                    >
                      {activeFilterCount}
                    </Box>
                  )}
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* IBP-Style Filter Panel */}
          <Collapse in={filterPanelOpen}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: darkMode ? alpha('#64748b', 0.05) : '#f8fafc' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      label="Status"
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      {allStatuses.map(s => (
                        <MenuItem key={s} value={s}>{s.toUpperCase()}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Stage</InputLabel>
                    <Select
                      value={filters.stage}
                      label="Stage"
                      onChange={(e) => handleFilterChange('stage', e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      {allStages.map(s => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Customer</InputLabel>
                    <Select
                      value={filters.customer}
                      label="Customer"
                      onChange={(e) => handleFilterChange('customer', e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      {allCustomers.map(c => (
                        <MenuItem key={c} value={c}>{c}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Min Value ($)"
                    type="number"
                    value={filters.minValue}
                    onChange={(e) => handleFilterChange('minValue', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Max Value ($)"
                    type="number"
                    value={filters.maxValue}
                    onChange={(e) => handleFilterChange('maxValue', e.target.value)}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  disabled={activeFilterCount === 0}
                  sx={{ textTransform: 'none' }}
                >
                  Clear Filters
                </Button>
              </Box>
            </Paper>
          </Collapse>
        </Box>

        {/* Table */}
        <TableContainer sx={{ flex: 1 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: darkMode ? '#1e293b' : '#f1f5f9' }}>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.align || 'left'}
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: '#64748b',
                      width: col.width,
                      bgcolor: darkMode ? '#1e293b' : '#f1f5f9',
                    }}
                  >
                    {col.sortable ? (
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? order : 'asc'}
                        onClick={() => handleSort(col.id)}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : (
                      col.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={40} />
                    <Typography sx={{ mt: 2, color: '#64748b' }}>Loading pipeline data...</Typography>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography color="error" sx={{ mb: 2 }}>Error: {error}</Typography>
                    <Button variant="outlined" onClick={fetchPipelineData}>Retry</Button>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography sx={{ color: '#64748b' }}>No orders found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row) => (
                  <ExpandableRow
                    key={row.id}
                    row={row}
                    isOpen={expandedRows.has(row.id)}
                    onToggle={() => toggleRow(row.id)}
                    darkMode={darkMode}
                    onTileClick={(stage, orderRow) => {
                      // Map 3-stage flow: 0=intent, 1=decisioning, 2=arbitration
                      const tileMap = {
                        0: 'customer-intent-cockpit',
                        1: 'sku-decisioning',
                        2: 'order-value-control-tower',
                      };
                      if (onNavigate) {
                        onNavigate(tileMap[stage], orderRow);
                      }
                    }}
                    onLineClick={(orderRow, lineNumber) => {
                      // Navigate to SKU Decisioning for specific line
                      if (onNavigate) {
                        onNavigate('sku-decisioning', orderRow, lineNumber);
                      }
                    }}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{ borderTop: '1px solid', borderColor: 'divider' }}
        />
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

export default SalesOrderPipeline;
