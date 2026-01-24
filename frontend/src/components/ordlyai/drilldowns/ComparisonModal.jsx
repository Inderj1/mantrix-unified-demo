import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
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
  Button,
  ToggleButton,
  ToggleButtonGroup,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  CompareArrows as CompareIcon,
  Star as StarIcon,
  Speed as SpeedIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

/**
 * ComparisonModal - Side-by-side comparison of all material options
 *
 * Shows:
 * - Spec match quality
 * - Cost and margin comparison
 * - Availability and lead time
 * - Trade-off analysis
 */
const ComparisonModal = ({ open, onClose, intentId, onSelect }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [viewMode, setViewMode] = useState('margin');

  useEffect(() => {
    if (open && intentId) {
      fetchComparison();
    }
  }, [open, intentId]);

  const fetchComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ordlyai/intent/${intentId}/comparison`);
      if (!response.ok) throw new Error('Failed to fetch comparison data');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
      // Use mock data for development
      setData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = () => ({
    intent_id: intentId,
    quantity: 25000,
    requested_date: '2025-01-15',
    materials: [
      {
        matnr: 'RL-PET75-FP-S',
        description: 'Standard Fluoropolymer Release (Recommended)',
        spec_match: 'Standard Grade (Alternate)',
        spec_match_score: 85,
        unit_cost: 1.47,
        total_cost: 36750,
        margin_pct: 32.0,
        margin_dollar: 11760,
        availability: 30000,
        coverage_pct: 120,
        lead_time: 5,
        delivery_date: '2025-01-10',
        best_plant: '2100 (Iowa City)',
        customer_orders: 18,
        last_ordered: 'Dec 15, 2024',
        spec_accepted: true,
        spec_accepted_date: 'Sep 2024',
        is_margin_rec: true,
        is_leadtime_rec: false,
      },
      {
        matnr: 'RL-PET75-FP-P',
        description: 'Premium Fluoropolymer Release (Exact Match)',
        spec_match: 'Exact Match (Premium)',
        spec_match_score: 100,
        unit_cost: 1.62,
        total_cost: 40500,
        margin_pct: 28.5,
        margin_dollar: 10473,
        availability: 15000,
        coverage_pct: 60,
        lead_time: 12,
        delivery_date: '2025-01-22',
        best_plant: '2100 (Iowa City)',
        customer_orders: 12,
        last_ordered: 'Nov 28, 2024',
        spec_accepted: null,
        is_margin_rec: false,
        is_leadtime_rec: false,
      },
      {
        matnr: 'RL-PET72-FP-S',
        description: '72μm Thickness Alternate (Fastest)',
        spec_match: 'Within Tolerance (-3um)',
        spec_match_score: 75,
        unit_cost: 1.52,
        total_cost: 38000,
        margin_pct: 30.0,
        margin_dollar: 11025,
        availability: 28000,
        coverage_pct: 112,
        lead_time: 3,
        delivery_date: '2025-01-08',
        best_plant: '2200 (Wisconsin)',
        customer_orders: 6,
        last_ordered: 'Dec 15, 2024',
        spec_accepted: true,
        spec_accepted_date: 'Jul 2024',
        is_margin_rec: false,
        is_leadtime_rec: true,
      },
    ],
    trade_off: {
      margin_vs_leadtime: {
        margin_gain: 735,
        margin_gain_pct: 2.0,
        leadtime_cost: 2,
        meets_deadline: true,
      },
      recommendation: 'Select RL-PET75-FP-S for margin optimization - customer has accepted this alternate before',
    },
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
  };

  const getWinnerStyle = (mat, field, isHigherBetter = true) => {
    if (!data?.materials) return {};
    const values = data.materials.map(m => m[field]);
    const best = isHigherBetter ? Math.max(...values) : Math.min(...values);
    const isBest = mat[field] === best;
    return isBest ? { color: '#059669', fontWeight: 700 } : {};
  };

  const comparisonRows = [
    { label: 'Spec Match', field: 'spec_match', type: 'text' },
    { label: 'Unit Cost', field: 'unit_cost', type: 'currency', higherBetter: false },
    { label: 'Total Cost', field: 'total_cost', type: 'currency', higherBetter: false },
    { label: 'Margin %', field: 'margin_pct', type: 'percent', higherBetter: true },
    { label: 'Margin $', field: 'margin_dollar', type: 'currency', higherBetter: true },
    { label: 'Availability', field: 'availability', type: 'number', higherBetter: true },
    { label: 'Coverage', field: 'coverage_pct', type: 'percent', higherBetter: true },
    { label: 'Lead Time', field: 'lead_time', type: 'days', higherBetter: false },
    { label: 'Delivery Date', field: 'delivery_date', type: 'text' },
    { label: 'Best Plant', field: 'best_plant', type: 'text' },
    { label: 'Customer Orders', field: 'customer_orders', type: 'number', higherBetter: true },
    { label: 'Last Ordered', field: 'last_ordered', type: 'text' },
  ];

  const formatValue = (mat, row) => {
    const value = mat[row.field];
    switch (row.type) {
      case 'currency':
        return formatCurrency(value);
      case 'percent':
        return `${value}%`;
      case 'days':
        return `${value} days`;
      case 'number':
        return value?.toLocaleString();
      default:
        return value;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { maxHeight: '90vh' } }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <CompareIcon sx={{ color: '#002352', fontSize: 28 }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>Material Comparison</Typography>
              <Typography variant="caption" color="text.secondary">
                Qty: {data?.quantity?.toLocaleString()} LM | Requested: {data?.requested_date}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, v) => v && setViewMode(v)}
              size="small"
            >
              <ToggleButton value="margin" sx={{ px: 2 }}>
                <MoneyIcon sx={{ fontSize: 16, mr: 0.5 }} /> Margin Focus
              </ToggleButton>
              <ToggleButton value="leadtime" sx={{ px: 2 }}>
                <SpeedIcon sx={{ fontSize: 16, mr: 0.5 }} /> Lead Time Focus
              </ToggleButton>
            </ToggleButtonGroup>
            <IconButton onClick={onClose}><CloseIcon /></IconButton>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error && !data ? (
          <Alert severity="error">{error}</Alert>
        ) : data ? (
          <Stack spacing={3}>
            {/* Comparison Table */}
            <Card variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', width: 140 }}>
                      ATTRIBUTE
                    </TableCell>
                    {data.materials.map((mat) => (
                      <TableCell key={mat.matnr} align="center" sx={{ borderLeft: '1px solid', borderColor: 'divider' }}>
                        <Stack alignItems="center" spacing={0.5}>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>{mat.matnr}</Typography>
                          <Stack direction="row" spacing={0.5}>
                            {mat.is_margin_rec && (
                              <Chip
                                icon={<StarIcon sx={{ fontSize: 12 }} />}
                                label="MARGIN REC"
                                size="small"
                                sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 600, fontSize: '0.55rem', height: 20 }}
                              />
                            )}
                            {mat.is_leadtime_rec && (
                              <Chip
                                icon={<SpeedIcon sx={{ fontSize: 12 }} />}
                                label="LEAD TIME REC"
                                size="small"
                                sx={{ bgcolor: '#002352', color: 'white', fontWeight: 600, fontSize: '0.55rem', height: 20 }}
                              />
                            )}
                          </Stack>
                        </Stack>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comparisonRows.map((row) => (
                    <TableRow key={row.field} hover>
                      <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                        {row.label}
                      </TableCell>
                      {data.materials.map((mat) => (
                        <TableCell
                          key={mat.matnr}
                          align="center"
                          sx={{
                            fontSize: '0.85rem',
                            borderLeft: '1px solid',
                            borderColor: 'divider',
                            ...getWinnerStyle(mat, row.field, row.higherBetter)
                          }}
                        >
                          {formatValue(mat, row)}
                          {row.field === 'coverage_pct' && mat.coverage_pct >= 100 && (
                            <CheckIcon sx={{ fontSize: 14, ml: 0.5, color: '#10b981', verticalAlign: 'middle' }} />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {/* Spec Acceptance Row */}
                  <TableRow>
                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                      Spec Accepted
                    </TableCell>
                    {data.materials.map((mat) => (
                      <TableCell
                        key={mat.matnr}
                        align="center"
                        sx={{ fontSize: '0.85rem', borderLeft: '1px solid', borderColor: 'divider' }}
                      >
                        {mat.spec_accepted === true ? (
                          <Chip
                            icon={<CheckIcon sx={{ fontSize: 12 }} />}
                            label={mat.spec_accepted_date || 'Yes'}
                            size="small"
                            sx={{ bgcolor: alpha('#10b981', 0.12), color: '#059669', fontWeight: 600, fontSize: '0.65rem' }}
                          />
                        ) : mat.spec_accepted === false ? (
                          <Chip label="Rejected" size="small" sx={{ bgcolor: alpha('#ef4444', 0.12), color: '#dc2626', fontWeight: 600, fontSize: '0.65rem' }} />
                        ) : (
                          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Primary spec</Typography>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </Card>

            {/* Trade-off Analysis */}
            <Card variant="outlined" sx={{ bgcolor: alpha('#002352', 0.03) }}>
              <CardContent>
                <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ mb: 2 }}>
                  <LightbulbIcon sx={{ color: '#002352', fontSize: 20, mt: 0.5 }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Trade-off Analysis
                  </Typography>
                </Stack>
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Choosing MARGIN REC (SIL-S) over LEAD TIME REC (PET48):</strong>
                  </Typography>
                  <Stack direction="row" spacing={4} sx={{ mb: 2 }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Margin Gain</Typography>
                      <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>
                        +{formatCurrency(data.trade_off?.margin_vs_leadtime?.margin_gain)} (+{data.trade_off?.margin_vs_leadtime?.margin_gain_pct}%)
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Lead Time Cost</Typography>
                      <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#d97706' }}>
                        +{data.trade_off?.margin_vs_leadtime?.leadtime_cost} day
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Meets Deadline</Typography>
                      <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: data.trade_off?.margin_vs_leadtime?.meets_deadline ? '#10b981' : '#dc2626' }}>
                        {data.trade_off?.margin_vs_leadtime?.meets_deadline ? 'Yes' : 'No'}
                      </Typography>
                    </Box>
                  </Stack>
                  <Box sx={{ p: 1.5, bgcolor: alpha('#10b981', 0.1), borderRadius: 1, borderLeft: '3px solid #10b981' }}>
                    <Typography sx={{ fontSize: '0.85rem', color: '#059669' }}>
                      <LightbulbIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                      <strong>Recommendation:</strong> {data.trade_off?.recommendation}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="center">
              {data.materials.map((mat) => (
                <Button
                  key={mat.matnr}
                  variant={mat.is_margin_rec && viewMode === 'margin' ? 'contained' : mat.is_leadtime_rec && viewMode === 'leadtime' ? 'contained' : 'outlined'}
                  onClick={() => onSelect && onSelect(mat)}
                  sx={{
                    minWidth: 180,
                    bgcolor: mat.is_margin_rec && viewMode === 'margin' ? '#10b981' : mat.is_leadtime_rec && viewMode === 'leadtime' ? '#002352' : undefined,
                    '&:hover': {
                      bgcolor: mat.is_margin_rec && viewMode === 'margin' ? '#059669' : mat.is_leadtime_rec && viewMode === 'leadtime' ? '#1565c0' : undefined,
                    }
                  }}
                >
                  <Stack alignItems="center">
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{mat.matnr}</Typography>
                    <Typography sx={{ fontSize: '0.65rem' }}>
                      {mat.is_margin_rec ? 'Margin Focus' : mat.is_leadtime_rec ? 'Speed Focus' : 'Exact Spec'}
                    </Typography>
                  </Stack>
                </Button>
              ))}
            </Stack>
          </Stack>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default ComparisonModal;
