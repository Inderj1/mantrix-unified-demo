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
  LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Inventory as InventoryIcon,
  Factory as FactoryIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Star as StarIcon,
} from '@mui/icons-material';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

/**
 * MaterialPlantDrawer - Drilldown for material plant details
 *
 * Shows:
 * - Plant comparison table
 * - Cost breakdown per plant
 * - Lead time breakdown
 * - Stock levels and coverage
 */
const MaterialPlantDrawer = ({ open, onClose, matnr, quantity = 15000, sellingPrice = 3.20 }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (open && matnr) {
      fetchMaterialDetails();
    }
  }, [open, matnr, quantity]);

  const fetchMaterialDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/api/ordlyai/material/${matnr}/plants?quantity=${quantity}${sellingPrice ? `&selling_price=${sellingPrice}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch material details');
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

  const getPlantName = (plant) => {
    const names = {
      '2100': 'Chicago',
      '2500': 'Ohio',
      '3000': 'Texas'
    };
    return names[plant] || plant;
  };

  const getLeadTimeColor = (days) => {
    if (days === 0) return '#10b981';
    if (days <= 4) return '#059669';
    if (days <= 6) return '#d97706';
    return '#dc2626';
  };

  const getCoverageColor = (pct) => {
    if (pct >= 100) return '#10b981';
    if (pct >= 50) return '#d97706';
    return '#dc2626';
  };

  // Find best plant for selected criteria
  const selectedPlant = data?.plants?.find(p => p.plant === data.best_cost_plant) || data?.plants?.[0];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 650, md: 750 }, p: 0 }
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <InventoryIcon sx={{ color: '#002352', fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>{matnr}</Typography>
              <Typography variant="caption" color="text.secondary">{data?.description}</Typography>
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
            {/* Plant Comparison */}
            <Card variant="outlined">
              <CardContent sx={{ pb: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <FactoryIcon sx={{ color: '#002352', fontSize: 18 }} />
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Plant Comparison
                    </Typography>
                  </Stack>
                  <Chip
                    label={`Qty Needed: ${quantity.toLocaleString()} LM`}
                    size="small"
                    sx={{ bgcolor: alpha('#002352', 0.12), color: '#1565c0', fontWeight: 600, fontSize: '0.65rem' }}
                  />
                </Stack>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Plant</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }} align="right">Cost/Unit</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }} align="right">Stock</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }} align="center">Lead Time</TableCell>
                      <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }} align="right">Total Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(data.plants || []).map((plant) => (
                      <TableRow
                        key={plant.plant}
                        sx={{
                          bgcolor: plant.plant === data.best_cost_plant ? alpha('#10b981', 0.08) : 'transparent',
                          '&:hover': { bgcolor: alpha('#002352', 0.05) }
                        }}
                      >
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box>
                              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{plant.plant}</Typography>
                              <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>{getPlantName(plant.plant)}</Typography>
                            </Box>
                            {plant.plant === data.best_cost_plant && (
                              <Chip label="LOWEST" size="small" sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 600, fontSize: '0.55rem', height: 18 }} />
                            )}
                            {plant.plant === data.best_lead_time_plant && plant.plant !== data.best_cost_plant && (
                              <Chip label="FASTEST" size="small" sx={{ bgcolor: '#002352', color: 'white', fontWeight: 600, fontSize: '0.55rem', height: 18 }} />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{formatCurrency(plant.unit_cost)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack alignItems="flex-end">
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{plant.qty_on_hand?.toLocaleString()}</Typography>
                            <Chip
                              label={plant.stock_covers_qty ? 'Covers' : `${plant.coverage_pct}%`}
                              size="small"
                              sx={{
                                bgcolor: alpha(getCoverageColor(plant.coverage_pct), 0.12),
                                color: getCoverageColor(plant.coverage_pct),
                                fontWeight: 600,
                                fontSize: '0.55rem',
                                height: 18
                              }}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: getLeadTimeColor(plant.effective_lead_time) }}>
                            {plant.effective_lead_time === 0 ? 'In Stock' : `${plant.effective_lead_time} days`}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{formatCurrency(plant.total_cost)}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            {selectedPlant && (
              <Card variant="outlined">
                <CardContent sx={{ pb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <MoneyIcon sx={{ color: '#002352', fontSize: 18 }} />
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Cost Breakdown (Plant {selectedPlant.plant} - {getPlantName(selectedPlant.plant)})
                    </Typography>
                  </Stack>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Component</TableCell>
                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }} align="right">Per Unit</TableCell>
                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }} align="right">Total ({quantity.toLocaleString()})</TableCell>
                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }} align="right">% of Cost</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { label: 'Material Cost', perUnit: selectedPlant.unit_cost * 0.76, pct: 76 },
                        { label: 'Conversion', perUnit: selectedPlant.unit_cost * 0.17, pct: 17 },
                        { label: 'Freight (est)', perUnit: selectedPlant.unit_cost * 0.07, pct: 7 },
                      ].map((row) => (
                        <TableRow key={row.label}>
                          <TableCell sx={{ fontSize: '0.8rem' }}>{row.label}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }} align="right">{formatCurrency(row.perUnit)}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }} align="right">{formatCurrency(row.perUnit * quantity)}</TableCell>
                          <TableCell align="right">
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <LinearProgress
                                variant="determinate"
                                value={row.pct}
                                sx={{ width: 60, height: 8, borderRadius: 1, bgcolor: alpha('#002352', 0.1), '& .MuiLinearProgress-bar': { bgcolor: '#002352' } }}
                              />
                              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{row.pct}%</Typography>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ bgcolor: alpha('#002352', 0.05) }}>
                        <TableCell sx={{ fontSize: '0.85rem', fontWeight: 700 }}>TOTAL LANDED</TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', fontWeight: 700 }} align="right">{formatCurrency(selectedPlant.unit_cost)}</TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', fontWeight: 700 }} align="right">{formatCurrency(selectedPlant.total_cost)}</TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', fontWeight: 700 }} align="right">100%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  {selectedPlant.margin_pct && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: alpha('#10b981', 0.08), borderRadius: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>Margin Analysis</Typography>
                        <Stack direction="row" spacing={3}>
                          <Box>
                            <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>MARGIN %</Typography>
                            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#059669' }}>{selectedPlant.margin_pct}%</Typography>
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>MARGIN $</Typography>
                            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#059669' }}>{formatCurrency(selectedPlant.margin_dollar)}</Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Lead Time Breakdown */}
            {selectedPlant && (
              <Card variant="outlined">
                <CardContent sx={{ pb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <ScheduleIcon sx={{ color: '#002352', fontSize: 18 }} />
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                      Lead Time Breakdown
                    </Typography>
                  </Stack>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Stage</TableCell>
                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }} align="center">Days</TableCell>
                        <TableCell sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.8rem' }}>Stock Available</TableCell>
                        <TableCell align="center">
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                            {selectedPlant.stock_covers_qty ? '0' : selectedPlant.in_house_production_days}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {selectedPlant.stock_covers_qty ? (
                              <CheckCircleIcon sx={{ color: '#10b981', fontSize: 16 }} />
                            ) : (
                              <WarningIcon sx={{ color: '#d97706', fontSize: 16 }} />
                            )}
                            <Typography sx={{ fontSize: '0.75rem', color: selectedPlant.stock_covers_qty ? '#059669' : '#d97706' }}>
                              {selectedPlant.stock_covers_qty ? `${selectedPlant.qty_on_hand?.toLocaleString()} LM in stock` : 'Production required'}
                            </Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.8rem' }}>GR Processing</TableCell>
                        <TableCell align="center">
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedPlant.gr_processing_days}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Quality release</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.8rem' }}>Planned Delivery</TableCell>
                        <TableCell align="center">
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedPlant.planned_delivery_days}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Pick, pack, ship</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ bgcolor: alpha('#10b981', 0.08) }}>
                        <TableCell sx={{ fontSize: '0.85rem', fontWeight: 700 }}>TOTAL LEAD TIME</TableCell>
                        <TableCell align="center">
                          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#059669' }}>
                            {selectedPlant.effective_lead_time} days
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {selectedPlant.estimated_delivery_date && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <ShippingIcon sx={{ color: '#10b981', fontSize: 16 }} />
                              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#059669' }}>
                                Est. Delivery: {new Date(selectedPlant.estimated_delivery_date).toLocaleDateString()}
                              </Typography>
                            </Stack>
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Stock Summary */}
            {selectedPlant && (
              <Card variant="outlined">
                <CardContent sx={{ pb: 2 }}>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>
                    Stock Summary (Plant {selectedPlant.plant})
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      { label: 'Unrestricted', value: selectedPlant.qty_on_hand, color: '#10b981' },
                      { label: 'In QC', value: selectedPlant.qty_in_qc, color: '#d97706' },
                      { label: 'In Transfer', value: selectedPlant.qty_in_transfer, color: '#002352' },
                      { label: 'Blocked', value: selectedPlant.qty_blocked, color: '#ef4444' },
                    ].map((item) => (
                      <Grid item xs={3} key={item.label}>
                        <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1, bgcolor: alpha(item.color, 0.08) }}>
                          <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: item.color }}>
                            {item.value?.toLocaleString() || 0}
                          </Typography>
                          <Typography sx={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>{item.label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Stack>
        ) : null}
      </Box>
    </Drawer>
  );
};

export default MaterialPlantDrawer;
