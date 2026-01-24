import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  alpha,
  Skeleton,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  SmartToy as SmartToyIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import o2cTheme from './o2cTheme';
import SourceIndicator, { DATA_SOURCES } from './SourceIndicator';

// Primary blue color
const PRIMARY_BLUE = '#0854a0';
const ACCENT_BLUE = '#1976d2';

// Flow navigation steps
const flowSteps = [
  { id: 'executive-command-center', num: 1, label: 'Executive Overview', status: 'complete' },
  { id: 'sales-area-intelligence', num: 2, label: 'Sales Areas', status: 'complete' },
  { id: 'customer-intelligence', num: 3, label: 'Customers', status: 'complete' },
  { id: 'document-flow-analysis', num: 4, label: 'Document Flow', status: 'complete' },
  { id: 'transaction-drilldown', num: 5, label: 'Transactions', status: 'active' },
];

const TransactionDrilldown = ({ onBack, darkMode = false, onNavigate }) => {
  const [selectedTx, setSelectedTx] = useState(null);
  const [anomalyFilter, setAnomalyFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [selectedTxDetails, setSelectedTxDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch transaction data from API
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/o2cai/transactions/list?limit=100');
        if (response.ok) {
          const result = await response.json();

          // Transform data for DataGrid
          const rows = (result.data || []).map((t, idx) => {
            // Calculate days since order
            const orderDate = new Date(t.orderDate);
            const today = new Date();
            const daysSinceOrder = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));

            // Determine status based on order value and age (simulated - no real status in VBAK)
            let status = 'OPEN';
            let cycle = `${daysSinceOrder}d`;
            let anomaly = false;
            let warning = false;
            let flag = null;

            // Simulate anomaly detection based on order characteristics
            if (daysSinceOrder > 30) {
              status = 'DELAYED';
              anomaly = true;
              flag = 'AGING';
            } else if (t.orderValue > 500000) {
              status = 'HIGH VALUE';
              warning = true;
            } else if (daysSinceOrder < 7) {
              status = 'NEW';
            } else {
              status = 'IN PROGRESS';
            }

            return {
              id: idx + 1,
              orderId: t.orderNumber,
              customer: t.customerName,
              custId: t.customerId,
              value: t.orderValue,
              created: new Date(t.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              orderDate: t.orderDate,
              orderType: t.orderType,
              lineCount: t.lineCount,
              currency: t.currency,
              cycle,
              status,
              flag,
              anomaly,
              warning,
              source: t.source,
              sapTable: t.sapTable,
            };
          });

          setTransactions(rows);
          setTotalTransactions(result.total);

          // Select first transaction by default
          if (rows.length > 0 && !selectedTx) {
            setSelectedTx(rows[0].orderId);
          }
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
      setLoading(false);
    };

    fetchTransactions();
  }, []);

  // Fetch transaction details when selection changes
  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedTx) return;

      setLoadingDetails(true);
      try {
        const response = await fetch(`/api/o2cai/transactions/${selectedTx}`);
        if (response.ok) {
          const result = await response.json();
          setSelectedTxDetails(result);
        }
      } catch (error) {
        console.error('Error fetching transaction details:', error);
      }
      setLoadingDetails(false);
    };

    fetchDetails();
  }, [selectedTx]);

  const getStatusChip = (status) => {
    const config = {
      complete: { label: '✓', bgcolor: alpha('#10b981', 0.12), color: '#059669' },
      active: { label: '5', bgcolor: alpha(PRIMARY_BLUE, 0.12), color: PRIMARY_BLUE },
      pending: { label: '', bgcolor: alpha('#64748b', 0.12), color: '#64748b' },
    };
    return config[status] || config.pending;
  };

  const getOrderStatusConfig = (status) => {
    const configs = {
      'IN PROGRESS': { bgcolor: alpha(ACCENT_BLUE, 0.12), color: ACCENT_BLUE },
      NEW: { bgcolor: alpha('#10b981', 0.12), color: '#059669' },
      DELAYED: { bgcolor: alpha('#d97706', 0.12), color: '#d97706' },
      'HIGH VALUE': { bgcolor: alpha('#8b5cf6', 0.12), color: '#8b5cf6' },
      BLOCKED: { bgcolor: alpha('#dc2626', 0.12), color: '#dc2626' },
      OPEN: { bgcolor: alpha('#64748b', 0.12), color: '#64748b' },
    };
    return configs[status] || { bgcolor: alpha('#64748b', 0.12), color: '#64748b' };
  };

  const getCycleColor = (cycle) => {
    if (cycle === '—') return '#dc2626';
    const days = parseFloat(cycle);
    if (days <= 7) return '#059669';
    if (days <= 14) return '#d97706';
    return '#dc2626';
  };

  const filteredRows = anomalyFilter
    ? transactions.filter(t => t.anomaly || t.warning)
    : transactions;

  const anomalyCount = transactions.filter(t => t.anomaly || t.warning).length;

  const transactionColumns = [
    {
      field: 'orderId',
      headerName: 'SALES ORDER',
      width: 130,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 600, color: PRIMARY_BLUE, fontSize: '0.7rem' }}>
            {params.value}
          </Typography>
          <SourceIndicator source={DATA_SOURCES.SAP_SD} sapTable="VBAK" />
        </Box>
      ),
    },
    {
      field: 'customer',
      headerName: 'CUSTOMER',
      flex: 1,
      minWidth: 140,
      renderCell: (params) => (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: darkMode ? '#e2e8f0' : '#1e293b' }}>
              {params.value}
            </Typography>
            <SourceIndicator source={DATA_SOURCES.SAP_MASTER} sapTable="KNA1" />
          </Box>
          <Typography sx={{ fontSize: '0.6rem', color: darkMode ? '#8b949e' : '#64748b' }}>
            {params.row.custId}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'value',
      headerName: 'VALUE',
      width: 110,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 600, color: PRIMARY_BLUE, fontSize: '0.7rem' }}>
            ${(params.value / 1000).toFixed(1)}K
          </Typography>
          <SourceIndicator source={DATA_SOURCES.SAP_SD} sapTable="VBAP" />
        </Box>
      ),
    },
    {
      field: 'created',
      headerName: 'CREATED',
      width: 80,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.7rem' }}>{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'cycle',
      headerName: 'DAYS',
      width: 70,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: getCycleColor(params.value), fontSize: '0.7rem' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'STATUS',
      width: 100,
      renderCell: (params) => {
        const config = getOrderStatusConfig(params.value);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              label={params.value}
              size="small"
              sx={{
                bgcolor: config.bgcolor,
                color: config.color,
                fontWeight: 600,
                fontSize: '0.55rem',
                height: 20,
              }}
            />
            <SourceIndicator source={DATA_SOURCES.CALCULATED} />
          </Box>
        );
      },
    },
    {
      field: 'flag',
      headerName: 'FLAG',
      width: 90,
      renderCell: (params) => (
        params.value ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              label={params.value}
              size="small"
              sx={{
                bgcolor: alpha('#dc2626', 0.12),
                color: '#dc2626',
                fontWeight: 600,
                fontSize: '0.55rem',
                height: 20,
              }}
            />
            <SourceIndicator source={DATA_SOURCES.CALCULATED} />
          </Box>
        ) : (
          <Typography sx={{ color: darkMode ? '#8b949e' : '#64748b', fontSize: '0.7rem' }}>—</Typography>
        )
      ),
    },
  ];

  // Get selected transaction row data
  const selectedTxRow = transactions.find(t => t.orderId === selectedTx);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: darkMode ? '#0d1117' : '#f8fafc' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          background: darkMode
            ? 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)'
            : o2cTheme.bannerGradient,
          borderBottom: `2px solid ${darkMode ? alpha(ACCENT_BLUE, 0.3) : alpha(ACCENT_BLUE, 0.2)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={onBack} size="small" sx={{ color: darkMode ? '#e2e8f0' : PRIMARY_BLUE }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: darkMode ? '#e2e8f0' : PRIMARY_BLUE }}>
                Transaction Drilldown
              </Typography>
              <Typography variant="caption" sx={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                Order Details • Line Items • Document Flow
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label="Step 5 of 5"
              size="small"
              sx={{
                bgcolor: alpha(PRIMARY_BLUE, 0.12),
                color: PRIMARY_BLUE,
                fontWeight: 600,
              }}
            />
            <SourceIndicator source={DATA_SOURCES.SAP_SD} sapTable="VBAK/VBAP" size="medium" />
          </Box>
        </Box>
      </Paper>

      {/* Flow Navigation */}
      <Box sx={{ px: 2, py: 1, bgcolor: darkMode ? '#0d1117' : '#f8fafc', borderBottom: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, alignItems: 'center' }}>
          {flowSteps.map((step, idx) => {
            const chipConfig = getStatusChip(step.status);
            return (
              <React.Fragment key={step.id}>
                <Chip
                  label={`${step.status === 'complete' ? '✓' : step.num}. ${step.label}`}
                  size="small"
                  onClick={() => step.status !== 'active' && onNavigate && onNavigate(step.id)}
                  sx={{
                    bgcolor: chipConfig.bgcolor,
                    color: chipConfig.color,
                    fontWeight: 600,
                    fontSize: '0.65rem',
                    cursor: step.status === 'active' ? 'default' : 'pointer',
                    border: step.status === 'active' ? `1px solid ${PRIMARY_BLUE}` : 'none',
                    '&:hover': step.status !== 'active' ? {
                      bgcolor: alpha(chipConfig.color, 0.2),
                    } : {},
                  }}
                />
                {idx < flowSteps.length - 1 && (
                  <Typography sx={{ color: darkMode ? '#475569' : '#94a3b8', fontSize: '0.75rem' }}>→</Typography>
                )}
              </React.Fragment>
            );
          })}
        </Box>
      </Box>

      {/* Filter Bar */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 2,
        py: 1.5,
        bgcolor: darkMode ? '#0d1117' : '#f8fafc',
        borderBottom: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`,
      }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <TextField
            placeholder="Search SO#, customer, material..."
            size="small"
            sx={{
              '& .MuiInputBase-root': {
                fontSize: '0.7rem',
                color: darkMode ? '#e2e8f0' : '#1e293b',
                bgcolor: darkMode ? '#161b22' : 'white',
                border: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`,
                borderRadius: 1,
              },
              '& .MuiInputBase-input': { py: 1, px: 1.5 },
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              width: 250,
            }}
          />
          {loading && <CircularProgress size={16} />}
        </Box>
        <Button
          onClick={() => setAnomalyFilter(!anomalyFilter)}
          variant={anomalyFilter ? 'contained' : 'outlined'}
          size="small"
          sx={{
            fontSize: '0.7rem',
            textTransform: 'none',
            bgcolor: anomalyFilter ? '#dc2626' : 'transparent',
            color: anomalyFilter ? 'white' : '#dc2626',
            borderColor: '#dc2626',
            '&:hover': {
              bgcolor: anomalyFilter ? '#b91c1c' : alpha('#dc2626', 0.1),
            },
          }}
        >
          <WarningIcon sx={{ fontSize: 14, mr: 0.5 }} />
          Flagged Only
          <Chip
            label={anomalyCount}
            size="small"
            sx={{
              ml: 1,
              height: 18,
              fontSize: '0.6rem',
              bgcolor: anomalyFilter ? 'rgba(255,255,255,0.2)' : alpha('#dc2626', 0.2),
              color: anomalyFilter ? 'white' : '#dc2626',
              fontWeight: 600,
            }}
          />
          <SourceIndicator source={DATA_SOURCES.CALCULATED} />
        </Button>
      </Box>

      {/* Main Content - 2 Columns */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          {/* Left Panel: Transaction List */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                bgcolor: darkMode ? '#161b22' : 'white',
                border: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`,
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ p: 1.5, borderBottom: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`, bgcolor: darkMode ? '#0d1117' : '#f8fafc' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReceiptIcon sx={{ fontSize: 16, color: PRIMARY_BLUE }} />
                    Sales Order Transactions
                    <SourceIndicator source={DATA_SOURCES.SAP_SD} sapTable="VBAK" />
                  </Typography>
                  {loading && <CircularProgress size={16} />}
                </Box>
                <Typography sx={{ fontSize: '0.65rem', color: darkMode ? '#8b949e' : '#64748b', mt: 0.5 }}>
                  {totalTransactions.toLocaleString()} orders total • {transactions.length} loaded • Click row for details
                </Typography>
              </Box>
              <Box sx={{ flex: 1, p: 1.5 }}>
                <DataGrid
                  rows={filteredRows}
                  columns={transactionColumns}
                  density="compact"
                  loading={loading}
                  hideFooter
                  disableColumnMenu
                  onRowClick={(params) => setSelectedTx(params.row.orderId)}
                  getRowClassName={(params) => {
                    if (params.row.anomaly) return 'anomaly-row';
                    if (params.row.warning) return 'warning-row';
                    return '';
                  }}
                  sx={{
                    ...o2cTheme.getDataGridSx({ darkMode, clickable: true }),
                    height: '100%',
                    '& .MuiDataGrid-cell': { fontSize: '0.7rem' },
                    '& .MuiDataGrid-columnHeaderTitle': { fontSize: '0.65rem' },
                    '& .anomaly-row': {
                      borderLeft: '3px solid #dc2626',
                    },
                    '& .warning-row': {
                      borderLeft: '3px solid #8b5cf6',
                    },
                    '& .MuiDataGrid-row': {
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: darkMode ? alpha(PRIMARY_BLUE, 0.1) : alpha(PRIMARY_BLUE, 0.08),
                      },
                      '&.Mui-selected': {
                        bgcolor: darkMode ? alpha(PRIMARY_BLUE, 0.15) : alpha(PRIMARY_BLUE, 0.12),
                      },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Right Panel: Transaction Detail */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                bgcolor: darkMode ? '#161b22' : 'white',
                border: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`,
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {selectedTxDetails ? (
                <>
                  {/* Header */}
                  <Box sx={{ p: 1.5, bgcolor: darkMode ? '#0d1117' : '#f8fafc', borderBottom: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: PRIMARY_BLUE }}>
                        {selectedTxDetails.header?.orderNumber}
                      </Typography>
                      <SourceIndicator source={DATA_SOURCES.SAP_SD} sapTable="VBAK" />
                      {loadingDetails && <CircularProgress size={14} />}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mt: 0.5, fontSize: '0.65rem', color: darkMode ? '#8b949e' : '#64748b', alignItems: 'center' }}>
                      <span>{selectedTxDetails.header?.customerName}</span>
                      <span>{selectedTxDetails.header?.customerId}</span>
                      <SourceIndicator source={DATA_SOURCES.SAP_MASTER} sapTable="KNA1" />
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
                    {/* Order Details */}
                    <Typography sx={{ fontSize: '0.65rem', color: darkMode ? '#8b949e' : '#64748b', textTransform: 'uppercase', mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Order Details
                      <SourceIndicator source={DATA_SOURCES.SAP_SD} sapTable="VBAK" />
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        mb: 2,
                        bgcolor: darkMode ? '#0d1117' : '#f8fafc',
                        border: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`,
                        borderRadius: 1,
                      }}
                    >
                      {[
                        { label: 'Order Type', value: selectedTxDetails.header?.orderType, source: DATA_SOURCES.SAP_SD },
                        { label: 'Order Date', value: selectedTxDetails.header?.orderDate ? new Date(selectedTxDetails.header.orderDate).toLocaleDateString() : '-', source: DATA_SOURCES.SAP_SD },
                        { label: 'Sales Org', value: selectedTxDetails.header?.salesOrg || '-', source: DATA_SOURCES.SAP_SD },
                        { label: 'Dist. Channel', value: selectedTxDetails.header?.distributionChannel || '-', source: DATA_SOURCES.SAP_SD },
                        { label: 'Division', value: selectedTxDetails.header?.division || '-', source: DATA_SOURCES.SAP_SD },
                        { label: 'Currency', value: selectedTxDetails.header?.currency || 'USD', source: DATA_SOURCES.SAP_SD },
                      ].map((item, idx, arr) => (
                        <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75, borderBottom: idx < arr.length - 1 ? `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}` : 'none' }}>
                          <Typography sx={{ fontSize: '0.65rem', color: darkMode ? '#8b949e' : '#94a3b8' }}>
                            {item.label}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b' }}>
                              {item.value}
                            </Typography>
                            <SourceIndicator source={item.source} sapTable="VBAK" />
                          </Box>
                        </Box>
                      ))}
                    </Paper>

                    {/* Line Items */}
                    <Typography sx={{ fontSize: '0.65rem', color: darkMode ? '#8b949e' : '#64748b', textTransform: 'uppercase', mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Line Items ({selectedTxDetails.items?.length || 0})
                      <SourceIndicator source={DATA_SOURCES.SAP_SD} sapTable="VBAP" />
                    </Typography>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        mb: 2,
                        bgcolor: darkMode ? '#0d1117' : '#f8fafc',
                        border: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`,
                        borderRadius: 1,
                        maxHeight: 200,
                        overflow: 'auto',
                      }}
                    >
                      {(selectedTxDetails.items || []).slice(0, 10).map((item, idx) => (
                        <Box key={idx} sx={{ py: 1, borderBottom: idx < (selectedTxDetails.items?.length || 0) - 1 ? `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}` : 'none' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b' }}>
                                {item.materialDescription || item.materialId}
                              </Typography>
                              <SourceIndicator source={DATA_SOURCES.SAP_MASTER} sapTable="MAKT" />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: PRIMARY_BLUE }}>
                                ${(item.netValue / 1000).toFixed(1)}K
                              </Typography>
                              <SourceIndicator source={DATA_SOURCES.SAP_SD} sapTable="VBAP" />
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                            <Typography sx={{ fontSize: '0.6rem', color: darkMode ? '#8b949e' : '#64748b' }}>
                              Item: {item.itemNumber}
                            </Typography>
                            <Typography sx={{ fontSize: '0.6rem', color: darkMode ? '#8b949e' : '#64748b' }}>
                              Qty: {item.quantity?.toLocaleString()} {item.unit}
                            </Typography>
                            <Typography sx={{ fontSize: '0.6rem', color: darkMode ? '#8b949e' : '#64748b' }}>
                              Plant: {item.plant || '-'}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                      {(selectedTxDetails.items?.length || 0) > 10 && (
                        <Typography sx={{ fontSize: '0.6rem', color: PRIMARY_BLUE, mt: 1, textAlign: 'center' }}>
                          +{selectedTxDetails.items.length - 10} more items
                        </Typography>
                      )}
                    </Paper>

                    {/* Order Total */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        mb: 2,
                        bgcolor: darkMode ? alpha(PRIMARY_BLUE, 0.1) : alpha(PRIMARY_BLUE, 0.08),
                        border: `1px solid ${alpha(PRIMARY_BLUE, 0.3)}`,
                        borderRadius: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: darkMode ? '#e2e8f0' : '#1e293b' }}>
                          Order Total
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: PRIMARY_BLUE }}>
                            ${((selectedTxDetails.items || []).reduce((sum, item) => sum + (item.netValue || 0), 0) / 1000).toFixed(1)}K
                          </Typography>
                          <SourceIndicator source={DATA_SOURCES.CALCULATED} />
                        </Box>
                      </Box>
                    </Paper>

                    {/* AI Insight */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        bgcolor: darkMode ? alpha('#059669', 0.1) : alpha('#10b981', 0.08),
                        border: `1px solid ${alpha('#059669', 0.3)}`,
                        borderRadius: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <Typography sx={{ fontSize: '0.65rem', color: '#059669', fontWeight: 600, textTransform: 'uppercase' }}>
                          <SmartToyIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                          AI Insight
                        </Typography>
                        <SourceIndicator source={DATA_SOURCES.MOCK} />
                      </Box>
                      <Typography sx={{ fontSize: '0.65rem', color: darkMode ? '#e2e8f0' : '#475569', lineHeight: 1.5 }}>
                        This order is part of a regular purchasing pattern for {selectedTxDetails.header?.customerName}. Based on historical data, similar orders typically ship within 5-7 business days.
                      </Typography>
                    </Paper>
                  </Box>
                </>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  {loadingDetails ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Typography sx={{ fontSize: '0.8rem', color: darkMode ? '#8b949e' : '#64748b' }}>
                      Select a transaction to view details
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Footer */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderTop: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`,
          bgcolor: darkMode ? '#0d1117' : '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography sx={{ fontSize: '0.6rem', color: darkMode ? '#8b949e' : '#64748b' }}>
            SAP Tables:
          </Typography>
          {['VBAK', 'VBAP', 'VBKD', 'KNA1', 'MAKT'].map((table) => (
            <Chip key={table} label={table} size="small" sx={{ fontSize: '0.55rem', height: 18, bgcolor: alpha(PRIMARY_BLUE, 0.1) }} />
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon sx={{ fontSize: 14 }} />}
            onClick={() => onNavigate && onNavigate('document-flow-analysis')}
            sx={{
              fontSize: '0.7rem',
              textTransform: 'none',
              borderColor: darkMode ? '#21262d' : '#e2e8f0',
              color: darkMode ? '#8b949e' : '#64748b',
            }}
          >
            Document Flow
          </Button>
          <Button
            variant="contained"
            size="small"
            sx={{
              fontSize: '0.7rem',
              textTransform: 'none',
              bgcolor: PRIMARY_BLUE,
              '&:hover': { bgcolor: '#074080' },
            }}
          >
            Export to Excel
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default TransactionDrilldown;
