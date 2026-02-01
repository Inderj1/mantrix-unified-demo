import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Stack,
  Button,
  Paper,
  Breadcrumbs,
  Link,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  Tune as TuneIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Science as ScienceIcon,
  SmartToy as SmartToyIcon,
  Shield as ShieldIcon,
  GpsFixed as GpsFixedIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  FilterList as FilterListIcon,
  HourglassEmpty as PendingIcon,
  LocalPharmacy as PrescriptionIcon,
  ListAlt as ChangeSetIcon,
  AutoFixHigh as SimulatorIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

// Import centralized brand colors and stoxTheme
import { MODULE_COLOR, getColors } from '../../../config/brandColors';
import stoxTheme from '../stoxTheme';

// AI Quick Insights for list view
const aiQuickInsights = {
  confidence: 91,
  summary: '342 pending • $2.8M savings opportunity • 91% avg confidence',
};

// Mock data for approval queue
const approvalQueueData = [
  {
    id: 'MAT-1001',
    plant: 'P1000',
    plantName: 'Detroit',
    description: 'Hydraulic Pump Assembly',
    changes: [
      { type: 'ss', label: 'SS', from: 482, to: 680, unit: 'EA' },
      { type: 'rop', label: 'ROP', from: 720, to: 1008, unit: 'EA' },
      { type: 'lt', label: 'LT', from: 14, to: 21, unit: 'days' },
    ],
    netImpact: 27800,
    impactType: 'positive',
    impactLabel: 'per year',
    serviceDelta: 4,
    serviceFrom: 93,
    serviceTo: 97,
    confidence: 94,
    roi: 'high',
  },
  {
    id: 'MAT-2045',
    plant: 'P2000',
    plantName: 'Phoenix',
    description: 'Bearing Assembly 2x4',
    changes: [
      { type: 'ss', label: 'SS', from: 420, to: 320, unit: 'EA' },
    ],
    netImpact: 18200,
    impactType: 'positive',
    impactLabel: 'capital released',
    serviceDelta: -1,
    serviceFrom: 96,
    serviceTo: 95,
    confidence: 89,
    roi: 'high',
  },
  {
    id: 'MAT-3089',
    plant: 'P1000',
    plantName: 'Detroit',
    description: 'Gasket Kit Standard',
    changes: [
      { type: 'ss', label: 'SS', from: 810, to: 450, unit: 'EA' },
      { type: 'rop', label: 'ROP', from: 1200, to: 780, unit: 'EA' },
    ],
    netImpact: 72400,
    impactType: 'positive',
    impactLabel: 'excess reduction',
    serviceDelta: 0,
    serviceFrom: 94,
    serviceTo: 94,
    confidence: 96,
    roi: 'high',
  },
  {
    id: 'MAT-5067',
    plant: 'P2000',
    plantName: 'Phoenix',
    description: 'Electronic Sensor Module',
    changes: [
      { type: 'ss', label: 'SS', from: 500, to: 720, unit: 'EA' },
      { type: 'lt', label: 'LT', from: 10, to: 18, unit: 'days' },
    ],
    netImpact: -44000,
    impactType: 'investment',
    impactLabel: '+$156K protected',
    serviceDelta: 7,
    serviceFrom: 88,
    serviceTo: 95,
    confidence: 78,
    roi: 'medium',
  },
  {
    id: 'MAT-4012',
    plant: 'P3000',
    plantName: 'Seattle',
    description: 'Control Valve Assembly',
    changes: [
      { type: 'lt', label: 'LT', from: 21, to: 16, unit: 'days' },
    ],
    netImpact: 8400,
    impactType: 'positive',
    impactLabel: 'cycle reduction',
    serviceDelta: 0,
    serviceFrom: 97,
    serviceTo: 97,
    confidence: 92,
    roi: 'medium',
  },
];

// Helper functions for chips
const getParamChipSx = (type) => {
  const colorMap = {
    ss: { bg: '#10b981', text: '#10b981' },
    rop: { bg: '#f59e0b', text: '#f59e0b' },
    lt: { bg: '#06b6d4', text: '#06b6d4' },
  };
  const c = colorMap[type] || colorMap.ss;
  return {
    bgcolor: alpha(c.bg, 0.15),
    color: c.text,
    fontWeight: 600,
    fontSize: '0.65rem',
    height: 22,
  };
};

const getImpactColor = (type) => {
  if (type === 'positive') return '#10b981';
  if (type === 'investment') return '#f59e0b';
  return '#ef4444';
};

const getRoiChipSx = (roi) => {
  const colorMap = {
    high: { bg: '#10b981', text: '#10b981' },
    medium: { bg: '#f59e0b', text: '#f59e0b' },
    low: { bg: '#64748b', text: '#64748b' },
  };
  const c = colorMap[roi] || colorMap.medium;
  return {
    bgcolor: alpha(c.bg, 0.15),
    color: c.text,
    fontWeight: 600,
    fontSize: '0.65rem',
  };
};

// DataGrid column definitions
const getColumns = (colors, onNavigate) => [
  {
    field: 'id',
    headerName: 'Material / Plant',
    minWidth: 180,
    flex: 1.2,
    renderCell: (params) => (
      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#3b82f6' }}>{params.value}</Typography>
        <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>
          {params.row.description} | {params.row.plant} {params.row.plantName}
        </Typography>
      </Box>
    ),
  },
  {
    field: 'changes',
    headerName: 'Parameter Changes',
    minWidth: 200,
    flex: 1.3,
    sortable: false,
    renderCell: (params) => (
      <Stack direction="column" spacing={0.5}>
        {params.value.map((change, idx) => (
          <Chip
            key={idx}
            label={`${change.label} ${change.from}→${change.to} ${change.unit}`}
            size="small"
            sx={getParamChipSx(change.type)}
          />
        ))}
      </Stack>
    ),
  },
  {
    field: 'netImpact',
    headerName: 'Net $ Impact',
    minWidth: 120,
    flex: 0.8,
    type: 'number',
    align: 'right',
    headerAlign: 'right',
    renderCell: (params) => (
      <Box sx={{ textAlign: 'right' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: getImpactColor(params.row.impactType) }}>
          {params.value >= 0 ? '+' : ''}${Math.abs(params.value / 1000).toFixed(1)}K
        </Typography>
        <Typography sx={{ fontSize: '0.65rem', color: params.row.impactType === 'investment' ? '#10b981' : colors.textSecondary }}>
          {params.row.impactLabel}
        </Typography>
      </Box>
    ),
  },
  {
    field: 'serviceDelta',
    headerName: 'Service Δ',
    minWidth: 100,
    flex: 0.6,
    type: 'number',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{
          fontWeight: 600,
          fontSize: '0.85rem',
          color: params.value > 0 ? '#10b981' : params.value < 0 ? '#f59e0b' : colors.textSecondary,
        }}>
          {params.value > 0 ? '+' : ''}{params.value} pts
        </Typography>
        <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary }}>
          {params.row.serviceFrom}% → {params.row.serviceTo}%
        </Typography>
      </Box>
    ),
  },
  {
    field: 'confidence',
    headerName: 'Confidence',
    minWidth: 100,
    flex: 0.6,
    type: 'number',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: params.value >= 90 ? '#10b981' : '#f59e0b' }}>
          {params.value}%
        </Typography>
        <Box sx={{ width: 60, mt: 0.5 }}>
          <LinearProgress
            variant="determinate"
            value={params.value}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: alpha(colors.border, 0.5),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                bgcolor: params.value >= 90 ? '#10b981' : '#ff751f',
              },
            }}
          />
        </Box>
      </Box>
    ),
  },
  {
    field: 'roi',
    headerName: 'ROI',
    minWidth: 80,
    flex: 0.5,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Chip
        label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
        size="small"
        sx={getRoiChipSx(params.value)}
      />
    ),
  },
  {
    field: 'actions',
    headerName: 'Actions',
    minWidth: 130,
    flex: 0.7,
    sortable: false,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); }}
          sx={{
            bgcolor: alpha('#10b981', 0.12),
            color: '#10b981',
            '&:hover': { bgcolor: '#10b981', color: 'white' },
          }}
        >
          <CheckCircleIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onNavigate && onNavigate('whatif-simulator'); }}
          sx={{
            bgcolor: alpha('#8b5cf6', 0.12),
            color: '#8b5cf6',
            '&:hover': { bgcolor: '#8b5cf6', color: 'white' },
          }}
        >
          <ScienceIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); }}
          sx={{
            bgcolor: alpha('#ef4444', 0.12),
            color: '#ef4444',
            '&:hover': { bgcolor: '#ef4444', color: 'white' },
          }}
        >
          <CancelIcon fontSize="small" />
        </IconButton>
      </Stack>
    ),
  },
];

const MRPParameterAdvisor = ({ onBack, onNavigate, darkMode = false }) => {
  const colors = getColors(darkMode);
  const [selectedItem, setSelectedItem] = useState(null);
  const [plantFilter, setPlantFilter] = useState('all');
  const [paramFilter, setParamFilter] = useState('all');
  const [sortBy, setSortBy] = useState('impact');

  // AI theme color for Tile 4 (Blue-Green)
  const aiThemeColor = '#3b82f6';

  // Get columns with colors and onNavigate
  const columns = getColumns(colors, onNavigate);

  const filteredData = approvalQueueData.filter(item => {
    if (plantFilter !== 'all' && item.plant !== plantFilter) return false;
    if (paramFilter !== 'all' && !item.changes.some(c => c.type === paramFilter)) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'impact') return Math.abs(b.netImpact) - Math.abs(a.netImpact);
    if (sortBy === 'confidence') return b.confidence - a.confidence;
    return Math.abs(b.netImpact) - Math.abs(a.netImpact);
  });

  const handleRowClick = (params) => {
    setSelectedItem(params.row);
  };

  const handleFilterChange = (filterName, value) => {
    if (filterName === 'plant') setPlantFilter(value);
    if (filterName === 'param') setParamFilter(value);
    if (filterName === 'sort') setSortBy(value);
  };

  // KPI Card Component
  const KPICard = ({ label, value, color, sub, borderColor }) => (
    <Card
      variant="outlined"
      sx={{
        borderLeft: `4px solid ${borderColor || color}`,
        bgcolor: colors.cardBg,
        borderColor: colors.border,
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography
          sx={{
            fontSize: '0.65rem',
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 1,
            mb: 1,
          }}
        >
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={700} sx={{ color }}>
          {value}
        </Typography>
        {sub && (
          <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, mt: 0.5 }}>
            {sub}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  // Detail View
  if (selectedItem) {
    return (
      <Box
        sx={{
          p: 3,
          minHeight: '100vh',
          bgcolor: colors.background,
          overflow: 'auto',
        }}
      >
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => setSelectedItem(null)}
          sx={{
            mb: 3,
            color: colors.textSecondary,
            '&:hover': { color: '#3b82f6', bgcolor: alpha('#3b82f6', 0.08) },
          }}
        >
          Back to Approval Queue
        </Button>

        {/* Detail Header */}
        <Card
          variant="outlined"
          sx={{
            mb: 3,
            bgcolor: colors.cardBg,
            borderColor: colors.border,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={3}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: '#00357a',
                }}
              >
                <TuneIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography variant="h5" fontWeight={700} sx={{ color: '#00357a' }}>
                    {selectedItem.id}
                  </Typography>
                  <Typography variant="h6" sx={{ color: colors.textSecondary }}>
                    @ {selectedItem.plant} - {selectedItem.plantName}
                  </Typography>
                </Stack>
                <Typography sx={{ color: colors.textSecondary, mt: 0.5 }}>
                  {selectedItem.description} | MRP Parameter Optimization Package
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={`${selectedItem.roi.charAt(0).toUpperCase() + selectedItem.roi.slice(1)} ROI`}
                  sx={getRoiChipSx(selectedItem.roi)}
                />
                <Chip
                  icon={<PendingIcon sx={{ fontSize: 14 }} />}
                  label="Pending Approval"
                  sx={{
                    bgcolor: alpha('#f59e0b', 0.15),
                    color: '#f59e0b',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    '& .MuiChip-icon': { color: '#f59e0b' },
                  }}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Decision Summary KPIs */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, textAlign: 'center', p: 2 }}>
              <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                Net Annual Benefit
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ color: '#10b981', mt: 1 }}>
                +${(Math.abs(selectedItem.netImpact) / 1000).toFixed(1)}K
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Revenue protected - holding cost</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, textAlign: 'center', p: 2 }}>
              <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                Service Level
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ color: '#10b981', mt: 1 }}>
                {selectedItem.serviceFrom}% → {selectedItem.serviceTo}%
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>+{selectedItem.serviceDelta} percentage points</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, textAlign: 'center', p: 2 }}>
              <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                AI Confidence
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ color: '#10b981', mt: 1 }}>
                {selectedItem.confidence}%
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>High recommendation quality</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, textAlign: 'center', p: 2 }}>
              <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 }}>
                Implementation Risk
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ color: '#10b981', mt: 1 }}>
                Low
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>Reversible in 1 MRP cycle</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Parameter Change Details */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Safety Stock */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ShieldIcon sx={{ color: '#10b981', fontSize: 20 }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: colors.text }}>
                      Safety Stock (EISBE)
                    </Typography>
                  </Stack>
                  <Chip label="MARC" size="small" sx={{ bgcolor: alpha('#3b82f6', 0.12), color: '#3b82f6', fontSize: '0.6rem' }} />
                </Stack>

                {/* Header */}
                <Grid container sx={{ py: 1.5, borderBottom: `1px solid ${colors.border}` }}>
                  {['Metric', 'Current', 'Recommended', 'Change', '$ Impact'].map((h, i) => (
                    <Grid item xs={2.4} key={i}>
                      <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {h}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>

                {/* Rows */}
                {[
                  { metric: 'Quantity', current: '482 EA', recommended: '680 EA', change: '+198 EA', impact: '+$39.6K', changeColor: '#f59e0b', impactType: 'negative' },
                  { metric: 'Days Coverage', current: '10 days', recommended: '14 days', change: '+4 days', impact: '—' },
                  { metric: 'Service Factor (k)', current: '1.65', recommended: '2.05', change: '+0.40', impact: '→ 97% SL' },
                ].map((row, idx) => (
                  <Grid container key={idx} sx={{ py: 1.5, borderBottom: idx < 2 ? `1px solid ${alpha(colors.border, 0.5)}` : 'none', alignItems: 'center' }}>
                    <Grid item xs={2.4}>
                      <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>{row.metric}</Typography>
                    </Grid>
                    <Grid item xs={2.4}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text }}>{row.current}</Typography>
                    </Grid>
                    <Grid item xs={2.4}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>{row.recommended}</Typography>
                    </Grid>
                    <Grid item xs={2.4}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: row.changeColor || colors.text }}>{row.change}</Typography>
                    </Grid>
                    <Grid item xs={2.4}>
                      {row.impactType === 'negative' ? (
                        <Chip label={row.impact} size="small" sx={{ bgcolor: alpha('#ef4444', 0.12), color: '#ef4444', fontSize: '0.65rem' }} />
                      ) : (
                        <Typography sx={{ fontSize: '0.8rem', color: colors.text }}>{row.impact}</Typography>
                      )}
                    </Grid>
                  </Grid>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Reorder Point */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <GpsFixedIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: colors.text }}>
                      Reorder Point (MINBE)
                    </Typography>
                  </Stack>
                  <Chip label="MARC" size="small" sx={{ bgcolor: alpha('#3b82f6', 0.12), color: '#3b82f6', fontSize: '0.6rem' }} />
                </Stack>

                {/* Header */}
                <Grid container sx={{ py: 1.5, borderBottom: `1px solid ${colors.border}` }}>
                  {['Metric', 'Current', 'Recommended', 'Change', 'Formula'].map((h, i) => (
                    <Grid item xs={2.4} key={i}>
                      <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {h}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>

                {/* Rows */}
                {[
                  { metric: 'Quantity', current: '720 EA', recommended: '1,008 EA', change: '+288 EA', formula: '+$57.6K', changeColor: '#f59e0b', formulaType: 'chip' },
                  { metric: 'Days Coverage', current: '15 days', recommended: '21 days', change: '+6 days', formula: '—' },
                  { metric: 'Calculation', current: '—', recommended: '—', change: '—', formula: 'ROP = (LT × Avg Demand) + SS' },
                ].map((row, idx) => (
                  <Grid container key={idx} sx={{ py: 1.5, borderBottom: idx < 2 ? `1px solid ${alpha(colors.border, 0.5)}` : 'none', alignItems: 'center' }}>
                    <Grid item xs={2.4}>
                      <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>{row.metric}</Typography>
                    </Grid>
                    <Grid item xs={2.4}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text }}>{row.current}</Typography>
                    </Grid>
                    <Grid item xs={2.4}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>{row.recommended}</Typography>
                    </Grid>
                    <Grid item xs={2.4}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: row.changeColor || colors.text }}>{row.change}</Typography>
                    </Grid>
                    <Grid item xs={2.4}>
                      {row.formulaType === 'chip' ? (
                        <Chip label={row.formula} size="small" sx={{ bgcolor: alpha('#ef4444', 0.12), color: '#ef4444', fontSize: '0.65rem' }} />
                      ) : (
                        <Typography sx={{ fontSize: idx === 2 ? '0.65rem' : '0.8rem', color: colors.textSecondary }}>{row.formula}</Typography>
                      )}
                    </Grid>
                  </Grid>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Second Row - Lead Time and Root Cause */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Lead Time */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ScheduleIcon sx={{ color: '#06b6d4', fontSize: 20 }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: colors.text }}>
                      Lead Time (PLIFZ)
                    </Typography>
                  </Stack>
                  <Chip label="MARC" size="small" sx={{ bgcolor: alpha('#3b82f6', 0.12), color: '#3b82f6', fontSize: '0.6rem' }} />
                </Stack>

                {/* Header */}
                <Grid container sx={{ py: 1.5, borderBottom: `1px solid ${colors.border}` }}>
                  {['Metric', 'SAP Current', 'Actual P50', 'Recommended', 'Rationale'].map((h, i) => (
                    <Grid item xs={2.4} key={i}>
                      <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {h}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>

                {/* Rows */}
                {[
                  { metric: 'Planned Del. Time', sapCurrent: '14 days', actualP50: '21 days', recommended: '21 days', rationale: 'Align to actual', actualColor: '#ef4444', recommendedColor: '#10b981' },
                  { metric: 'LT Gap', sapCurrent: '—', actualP50: '+50%', recommended: '0%', rationale: 'Gap closed', actualColor: '#ef4444', recommendedColor: '#10b981' },
                  { metric: 'Source', sapCurrent: '—', actualP50: '—', recommended: '—', rationale: 'Tile 3 — VENDOR-A 25 deliveries' },
                ].map((row, idx) => (
                  <Grid container key={idx} sx={{ py: 1.5, borderBottom: idx < 2 ? `1px solid ${alpha(colors.border, 0.5)}` : 'none', alignItems: 'center' }}>
                    <Grid item xs={2.4}>
                      <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>{row.metric}</Typography>
                    </Grid>
                    <Grid item xs={2.4}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text }}>{row.sapCurrent}</Typography>
                    </Grid>
                    <Grid item xs={2.4}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: row.actualColor || colors.text }}>{row.actualP50}</Typography>
                    </Grid>
                    <Grid item xs={2.4}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: row.recommendedColor || '#10b981' }}>{row.recommended}</Typography>
                    </Grid>
                    <Grid item xs={2.4}>
                      <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>{row.rationale}</Typography>
                    </Grid>
                  </Grid>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Root Cause Summary */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ bgcolor: colors.cardBg, borderColor: colors.border, height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <AssessmentIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: colors.text }}>
                    Root Cause Summary
                  </Typography>
                </Stack>

                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#8b5cf6', mb: 0.5 }}>
                    From Tile 2 (Demand):
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: colors.textSecondary }}>
                    CV = 0.82 (erratic), Forecast Accuracy 68%, A/Z classification
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', mb: 0.5 }}>
                    From Tile 3 (Supply):
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: colors.textSecondary }}>
                    Vendor OTD 72%, LT variability ±5 days, 7-day systematic delay
                  </Typography>
                </Box>

                <Box>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6', mb: 0.5 }}>
                    Synthesis:
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: colors.textSecondary }}>
                    Both demand and supply variability contribute to stockout risk. Recommended parameters account for both factors.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Parameter Interdependency Explanation - NEW */}
        <Card
          sx={{
            bgcolor: alpha('#00357a', 0.04),
            border: `1px solid ${alpha('#00357a', 0.15)}`,
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#00357a', 0.12) }}>
                <SmartToyIcon sx={{ fontSize: 18, color: '#00357a' }} />
              </Avatar>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#00357a' }}>
                Why This Parameter Combination?
              </Typography>
            </Stack>

            {/* Formula Explanation */}
            <Box sx={{ mb: 2.5, p: 2, bgcolor: colors.cardBg, borderRadius: 1.5, border: `1px solid ${colors.border}` }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.text, mb: 1 }}>
                The MRP Parameter Relationship
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#06b6d4', mb: 1.5 }}>
                ROP = (Lead Time × Daily Demand) + Safety Stock
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary, lineHeight: 1.7 }}>
                <strong>Your SKU calculation:</strong> ROP = (21 days × 48 EA/day) + 680 EA = <strong>1,688 EA</strong><br />
                <em>(Rounded to 1,008 EA based on lot size constraints)</em>
              </Typography>
            </Box>

            {/* Why this combination */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha('#06b6d4', 0.08), border: `1px solid ${alpha('#06b6d4', 0.2)}` }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <ScheduleIcon sx={{ fontSize: 16, color: '#06b6d4' }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#06b6d4' }}>Lead Time First</Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, lineHeight: 1.5 }}>
                    LT increased from 14→21 days because actual vendor delivery averages 21 days. This is the foundation — all other parameters depend on accurate LT.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha('#f59e0b', 0.08), border: `1px solid ${alpha('#f59e0b', 0.2)}` }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <GpsFixedIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b' }}>ROP Follows LT</Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, lineHeight: 1.5 }}>
                    ROP increased by +50% because LT increased +50%. This ensures MRP triggers replenishment early enough to cover the longer lead time.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: alpha('#10b981', 0.08), border: `1px solid ${alpha('#10b981', 0.2)}` }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <ShieldIcon sx={{ fontSize: 16, color: '#10b981' }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>SS Absorbs Variability</Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary, lineHeight: 1.5 }}>
                    SS increased by +41% to absorb both demand variability (CV=0.82) and supply variability (±5d). This protects service level during unexpected spikes.
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Key Insight */}
            <Box sx={{ mt: 2, p: 1.5, borderRadius: 1.5, bgcolor: alpha('#8b5cf6', 0.08), border: `1px solid ${alpha('#8b5cf6', 0.2)}` }}>
              <Typography sx={{ fontSize: '0.75rem', color: '#8b5cf6', lineHeight: 1.6 }}>
                <strong>Key Insight:</strong> These parameters work as a system. Changing LT alone would cause stockouts (ROP not triggered early enough). Changing SS alone would waste working capital (ROP still triggers too late). The combination ensures orders are placed at the right time with adequate buffer.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* AI Recommendation Panel */}
        <Card
          sx={{
            bgcolor: alpha('#3b82f6', 0.04),
            border: `1px solid ${alpha('#3b82f6', 0.25)}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Animated top border */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              bgcolor: '#00357a',
            }}
          />
          <CardContent sx={{ p: 3, pt: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#00357a', width: 40, height: 40 }}>
                  <SmartToyIcon />
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#00357a' }}>
                    STOX.AI Parameter Prescription
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>
                    Comprehensive recommendation based on Tile 2 + Tile 3 root cause analysis
                  </Typography>
                </Box>
              </Stack>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h5" fontWeight={700} sx={{ color: '#10b981' }}>{selectedItem.confidence}%</Typography>
                <Typography sx={{ fontSize: '0.65rem', color: colors.textSecondary, textTransform: 'uppercase' }}>Confidence</Typography>
              </Box>
            </Stack>

            {/* Recommendation */}
            <Card sx={{ bgcolor: alpha(colors.background, 0.5), mb: 3, p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <PrescriptionIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: colors.text }}>
                  Recommended Inventory Policy
                </Typography>
                <Chip label="APPROVE RECOMMENDED" size="small" sx={{ bgcolor: alpha('#ef4444', 0.15), color: '#ef4444', fontSize: '0.6rem', fontWeight: 600 }} />
              </Stack>
              <Typography sx={{ fontSize: '0.8rem', color: colors.textSecondary, lineHeight: 1.7 }}>
                <strong>Executive Summary:</strong> Increase safety stock by 41% and align lead time to actual vendor performance. This protects $125K in annual revenue at risk from stockouts, at a cost of $97K inventory investment, yielding <strong>net benefit of ${(selectedItem.netImpact / 1000).toFixed(1)}K/year</strong> with improved service level ({selectedItem.serviceFrom}% → {selectedItem.serviceTo}%).<br /><br />
                <strong>Implementation Sequence:</strong><br />
                1. Update PLIFZ first (aligns MRP timing)<br />
                2. Update MINBE second (triggers correct reorder)<br />
                3. Update EISBE last (safety buffer in place)<br /><br />
                <strong>Reversibility:</strong> Changes can be rolled back within 1 MRP cycle if service targets are exceeded.
              </Typography>
            </Card>

            {/* SAP Change Set */}
            <Card sx={{ bgcolor: alpha(colors.background, 0.7), border: `1px solid ${alpha('#3b82f6', 0.2)}`, mb: 3, p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <ChangeSetIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#3b82f6' }}>
                  SAP Change Set — Ready for Execution
                </Typography>
              </Stack>

              {/* Header */}
              <Grid container sx={{ py: 1, borderBottom: `1px solid ${colors.border}` }}>
                {['SAP Field', 'Current Value', 'New Value', 'Table'].map((h, i) => (
                  <Grid item xs={3} key={i}>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase' }}>
                      {h}
                    </Typography>
                  </Grid>
                ))}
              </Grid>

              {/* Rows */}
              {[
                { field: 'MARC-EISBE', current: '482', new: '680', table: 'Material Master' },
                { field: 'MARC-MINBE', current: '720', new: '1008', table: 'Material Master' },
                { field: 'MARC-PLIFZ', current: '14', new: '21', table: 'Material Master' },
              ].map((row, idx) => (
                <Grid container key={idx} sx={{ py: 1.25, borderBottom: idx < 2 ? `1px solid ${alpha(colors.border, 0.5)}` : 'none' }}>
                  <Grid item xs={3}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#06b6d4' }}>{row.field}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>{row.current}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>{row.new}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography sx={{ fontSize: '0.75rem', color: colors.textSecondary }}>{row.table}</Typography>
                  </Grid>
                </Grid>
              ))}
            </Card>

            {/* Approval Actions */}
            <Divider sx={{ mb: 3, borderColor: colors.border }} />
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: '#10b981',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#059669',
                  },
                }}
              >
                Approve & Queue for SAP
              </Button>
              <Button
                variant="contained"
                startIcon={<SimulatorIcon sx={{ fontSize: 16 }} />}
                onClick={() => onNavigate && onNavigate('whatif-simulator')}
                sx={{
                  bgcolor: '#00357a',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#002352',
                  },
                }}
              >
                Open in What-If Simulator
              </Button>
              <Button
                variant="outlined"
                startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderColor: colors.border,
                  color: colors.textSecondary,
                  '&:hover': {
                    bgcolor: alpha('#00357a', 0.08),
                    borderColor: '#00357a',
                    color: '#00357a',
                  },
                }}
              >
                Modify Parameters
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderColor: colors.border,
                  color: colors.textSecondary,
                  '&:hover': {
                    bgcolor: alpha('#ef4444', 0.08),
                    borderColor: '#ef4444',
                    color: '#ef4444',
                  },
                }}
              >
                Reject with Reason
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // List View
  return (
    <Box
      sx={{
        p: 3,
        minHeight: '100vh',
        bgcolor: colors.background,
        overflow: 'auto',
      }}
    >
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link
              component="button"
              variant="body1"
              onClick={() => onBack('core')}
              sx={{
                textDecoration: 'none',
                color: colors.text,
                '&:hover': { textDecoration: 'underline', color: colors.primary },
                cursor: 'pointer',
              }}
            >
              CORE.AI
            </Link>
            <Link
              component="button"
              variant="body1"
              onClick={() => onBack('stox')}
              sx={{
                textDecoration: 'none',
                color: colors.text,
                '&:hover': { textDecoration: 'underline', color: colors.primary },
                cursor: 'pointer',
              }}
            >
              STOX.AI
            </Link>
            <Link
              component="button"
              variant="body1"
              onClick={() => onBack('distribution')}
              sx={{
                textDecoration: 'none',
                color: colors.text,
                '&:hover': { textDecoration: 'underline', color: colors.primary },
                cursor: 'pointer',
              }}
            >
              Distribution
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              MRP Parameter Advisor
            </Typography>
          </Breadcrumbs>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<SimulatorIcon sx={{ fontSize: 16 }} />}
              onClick={() => onNavigate && onNavigate('whatif-simulator')}
              sx={{
                borderColor: alpha('#8b5cf6', 0.4),
                color: '#8b5cf6',
                bgcolor: alpha('#8b5cf6', 0.08),
                '&:hover': {
                  borderColor: '#8b5cf6',
                  bgcolor: alpha('#8b5cf6', 0.15),
                },
              }}
            >
              Open What-If Simulator
            </Button>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => onBack('distribution')}
              variant="outlined"
              size="small"
              sx={{ borderColor: colors.border }}
            >
              Back to Distribution
            </Button>
          </Stack>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: alpha('#3b82f6', 0.12),
              color: '#3b82f6',
            }}
          >
            <TuneIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
              MRP Parameter Advisor
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Parameter Optimization & Approval Workflow
            </Typography>
          </Box>
          <Chip
            label="TILE 4"
            size="small"
            sx={{
              ml: 'auto',
              bgcolor: alpha('#3b82f6', 0.12),
              color: '#3b82f6',
              fontWeight: 700,
            }}
          />
        </Stack>
      </Box>

      {/* Summary KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <KPICard
            label="Net Annual Savings"
            value="$2.8M"
            color="#10b981"
            sub="After implementation costs"
            borderColor="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KPICard
            label="Pending Approvals"
            value="342"
            color="#3b82f6"
            sub="MRP parameter changes"
            borderColor="#3b82f6"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KPICard
            label="SS Reductions"
            value="126"
            color="#10b981"
            sub="Releasing $1.2M capital"
            borderColor="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KPICard
            label="SS Increases"
            value="89"
            color="#f59e0b"
            sub="Investing $480K to protect"
            borderColor="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KPICard
            label="Approved Today"
            value="47"
            color="#06b6d4"
            sub="Ready for SAP upload"
            borderColor="#06b6d4"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <KPICard
            label="Avg Confidence"
            value="91%"
            color="#10b981"
            sub="AI recommendation quality"
            borderColor="#10b981"
          />
        </Grid>
      </Grid>

      {/* AI Quick Insight Card */}
      <Paper
        sx={{
          p: 1.5,
          mb: 2,
          bgcolor: alpha(aiThemeColor, 0.04),
          border: `1px solid ${alpha(aiThemeColor, 0.15)}`,
          borderLeft: `3px solid ${aiThemeColor}`,
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(aiThemeColor, 0.15) }}>
            <SmartToyIcon sx={{ fontSize: 18, color: aiThemeColor }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '0.8rem', color: colors.text }}>
              <strong>AI Insights:</strong> {aiQuickInsights.summary}
            </Typography>
          </Box>
          <Chip
            label={`${aiQuickInsights.confidence}% Avg Confidence`}
            size="small"
            sx={{ bgcolor: alpha(aiThemeColor, 0.12), color: aiThemeColor, fontWeight: 600, fontSize: '0.7rem' }}
          />
        </Stack>
      </Paper>

      {/* Filter Bar */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
        <FilterListIcon sx={{ color: colors.textSecondary }} />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel sx={{ color: colors.textSecondary }}>Plant</InputLabel>
          <Select
            value={plantFilter}
            label="Plant"
            onChange={(e) => handleFilterChange('plant', e.target.value)}
            sx={{
              color: colors.text,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
              '& .MuiSvgIcon-root': { color: colors.text },
            }}
            MenuProps={{ PaperProps: { sx: { bgcolor: colors.paper, border: `1px solid ${colors.border}`, '& .MuiMenuItem-root': { color: colors.text, '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' } } } } }}
          >
            <MenuItem value="all">All Plants</MenuItem>
            <MenuItem value="P1000">P1000 - Detroit</MenuItem>
            <MenuItem value="P2000">P2000 - Phoenix</MenuItem>
            <MenuItem value="P3000">P3000 - Seattle</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ color: colors.textSecondary }}>Parameter</InputLabel>
          <Select
            value={paramFilter}
            label="Parameter"
            onChange={(e) => handleFilterChange('param', e.target.value)}
            sx={{
              color: colors.text,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
              '& .MuiSvgIcon-root': { color: colors.text },
            }}
            MenuProps={{ PaperProps: { sx: { bgcolor: colors.paper, border: `1px solid ${colors.border}`, '& .MuiMenuItem-root': { color: colors.text, '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' } } } } }}
          >
            <MenuItem value="all">All Parameters</MenuItem>
            <MenuItem value="ss">Safety Stock (EISBE)</MenuItem>
            <MenuItem value="rop">Reorder Point (MINBE)</MenuItem>
            <MenuItem value="lt">Lead Time (PLIFZ)</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel sx={{ color: colors.textSecondary }}>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            sx={{
              color: colors.text,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
              '& .MuiSvgIcon-root': { color: colors.text },
            }}
            MenuProps={{ PaperProps: { sx: { bgcolor: colors.paper, border: `1px solid ${colors.border}`, '& .MuiMenuItem-root': { color: colors.text, '&:hover': { bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' } } } } }}
          >
            <MenuItem value="impact">Net Impact ↓</MenuItem>
            <MenuItem value="confidence">Confidence ↓</MenuItem>
          </Select>
        </FormControl>
        <Typography sx={{ ml: 'auto', fontSize: '0.8rem', color: colors.textSecondary }}>
          Showing {filteredData.length} of {approvalQueueData.length} items
        </Typography>
      </Paper>

      {/* DataGrid */}
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 400, width: '100%', bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
        <DataGrid
          rows={filteredData}
          columns={columns}
          density="compact"
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          onRowClick={handleRowClick}
          getRowHeight={() => 'auto'}
          sx={{
            ...stoxTheme.getDataGridSx({ clickable: true }),
            bgcolor: colors.paper,
            color: colors.text,
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              color: colors.text,
              borderBottom: `1px solid ${colors.border}`,
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              color: colors.text,
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
            },
            '& .MuiDataGrid-cell': {
              color: colors.text,
              borderBottom: `1px solid ${colors.border}`,
              py: 1,
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : alpha('#3b82f6', 0.05),
              },
            },
            '& .MuiDataGrid-footerContainer': {
              bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              borderTop: `1px solid ${colors.border}`,
              color: colors.text,
            },
            '& .MuiTablePagination-root': {
              color: colors.text,
            },
            '& .MuiDataGrid-toolbarContainer': {
              color: colors.text,
              padding: '8px 16px',
              '& .MuiButton-root': {
                color: colors.text,
              },
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default MRPParameterAdvisor;
