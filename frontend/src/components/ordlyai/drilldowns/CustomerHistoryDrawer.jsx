import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  alpha,
  Collapse,
} from '@mui/material';
import {
  Close as CloseIcon,
  Business as BusinessIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

/**
 * CustomerHistoryDrawer - Drilldown for customer order history
 *
 * Shows:
 * - Customer defaults (AUART, VKORG, VTWEG, SPART)
 * - Order history with items
 * - Frequently ordered materials
 * - Spec acceptance history
 */
const CustomerHistoryDrawer = ({ open, onClose, kunnr, customerName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (open && kunnr) {
      fetchCustomerHistory();
    }
  }, [open, kunnr]);

  const fetchCustomerHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/customer/${kunnr}/history?months=12&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch customer history');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 600, md: 700 }, p: 0 }
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <BusinessIcon sx={{ color: '#0854a0', fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>{customerName || 'Customer'}</Typography>
              <Typography variant="caption" color="text.secondary">KUNNR: {kunnr}</Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, overflow: 'auto', height: 'calc(100vh - 80px)' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : data ? (
          <Stack spacing={3}>
            {/* Customer Defaults */}
            <Card variant="outlined">
              <CardContent sx={{ pb: 2 }}>
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Customer Defaults
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { label: 'Sales Org', value: data.customer_defaults?.sales_org || 'N/A' },
                    { label: 'Dist Channel', value: data.customer_defaults?.distribution_channel || 'N/A' },
                    { label: 'Division', value: data.customer_defaults?.division || 'N/A' },
                    { label: 'Payment Terms', value: data.customer_defaults?.payment_terms || 'N/A' },
                    { label: 'Incoterms', value: data.customer_defaults?.incoterms || 'N/A' },
                    { label: 'Order Count', value: data.customer_defaults?.order_count || 0 },
                  ].map((item) => (
                    <Grid item xs={4} key={item.label}>
                      <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>{item.label}</Typography>
                      <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" spacing={4}>
                  <Box>
                    <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Avg Order Value</Typography>
                    <Typography variant="h6" fontWeight={600} color="primary">
                      {formatCurrency(data.customer_defaults?.avg_order_value)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Last Order</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatDate(data.customer_defaults?.last_order_date)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Order History */}
            <Card variant="outlined">
              <CardContent sx={{ pb: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ShoppingCartIcon sx={{ color: '#0854a0', fontSize: 18 }} />
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Order History (Last 12 months)
                    </Typography>
                  </Stack>
                  <Chip label={`${data.order_count} orders`} size="small" sx={{ bgcolor: alpha('#0854a0', 0.12), color: '#1565c0', fontWeight: 600, fontSize: '0.65rem' }} />
                </Stack>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Order #</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Date</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Materials</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }} align="right">Value</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(data.orders || []).slice(0, 10).map((order) => (
                      <React.Fragment key={order.vbeln}>
                        <TableRow
                          hover
                          onClick={() => setExpandedOrder(expandedOrder === order.vbeln ? null : order.vbeln)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1565c0' }}>{order.vbeln}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{formatDate(order.erdat)}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>
                            {Array.isArray(order.items) ? `${order.items.length} items` : '0 items'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }} align="right">{formatCurrency(order.netwr)}</TableCell>
                          <TableCell>
                            {expandedOrder === order.vbeln ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={5} sx={{ py: 0, borderBottom: expandedOrder === order.vbeln ? undefined : 'none' }}>
                            <Collapse in={expandedOrder === order.vbeln}>
                              <Box sx={{ py: 1, pl: 2 }}>
                                {Array.isArray(order.items) && order.items.map((item, idx) => (
                                  <Stack key={idx} direction="row" spacing={2} sx={{ py: 0.5 }}>
                                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', minWidth: 100 }}>{item.matnr}</Typography>
                                    <Typography sx={{ fontSize: '0.7rem', flex: 1 }}>{item.arktx}</Typography>
                                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600 }}>{item.kwmeng} {item.vrkme}</Typography>
                                  </Stack>
                                ))}
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Frequently Ordered Materials */}
            <Card variant="outlined">
              <CardContent sx={{ pb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <InventoryIcon sx={{ color: '#0854a0', fontSize: 18 }} />
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Frequently Ordered Materials
                  </Typography>
                </Stack>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Material</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }} align="center">Orders</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }} align="right">Avg Qty</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Last Ordered</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(data.frequently_ordered_materials || []).map((mat) => (
                      <TableRow key={mat.matnr} hover>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{mat.matnr}</Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>{mat.description}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={mat.order_count} size="small" sx={{ bgcolor: alpha('#10b981', 0.12), color: '#059669', fontWeight: 600, fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }} align="right">
                          {mat.avg_quantity?.toLocaleString()} {mat.uom}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{formatDate(mat.last_ordered)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Spec Acceptance History */}
            <Card variant="outlined">
              <CardContent sx={{ pb: 2 }}>
                <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                  Spec Acceptance History
                </Typography>
                <Stack spacing={1}>
                  {(data.spec_acceptance_history || []).map((spec, idx) => (
                    <Stack
                      key={idx}
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        bgcolor: spec.accepted ? alpha('#10b981', 0.08) : alpha('#ef4444', 0.08)
                      }}
                    >
                      {spec.accepted ? (
                        <CheckCircleIcon sx={{ color: '#10b981', fontSize: 18 }} />
                      ) : (
                        <CancelIcon sx={{ color: '#ef4444', fontSize: 18 }} />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: '0.8rem' }}>
                          <strong>{spec.accepted ? 'Accepted' : 'Rejected'}</strong> {spec.acceptance_type?.replace('_', ' ')}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {spec.original_spec} → {spec.accepted_spec}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {formatDate(spec.accepted_date)}
                      </Typography>
                    </Stack>
                  ))}
                  {(!data.spec_acceptance_history || data.spec_acceptance_history.length === 0) && (
                    <Typography sx={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', py: 2 }}>
                      No spec acceptance history available
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        ) : null}
      </Box>
    </Drawer>
  );
};

export default CustomerHistoryDrawer;
