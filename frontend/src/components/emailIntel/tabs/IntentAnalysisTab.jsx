import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Avatar,
  alpha,
  Grid,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import {
  QuestionAnswer as QuestionIcon,
  PlayArrow as ActionIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

import IntentDetailDrawer from '../components/IntentDetailDrawer';

const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

// Color mapping for intent types and risk levels
const intentColors = {
  question: '#3b82f6',
  action: '#f59e0b',
};

const riskColors = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};

const statusColors = {
  pending: '#6b7280',
  processed: '#10b981',
  action_queued: '#3b82f6',
};

function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 1.5, justifyContent: 'flex-end' }}>
      <GridToolbarQuickFilter
        sx={{
          minWidth: 300,
          '& .MuiInput-root': {
            fontSize: '0.875rem',
          }
        }}
        debounceMs={300}
        placeholder="Search emails..."
      />
    </GridToolbarContainer>
  );
}

const IntentAnalysisTab = ({ data, darkMode = false, sourceType = 'vendor' }) => {
  const colors = getColors(darkMode);
  const [selectedIntent, setSelectedIntent] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [intentFilter, setIntentFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Calculate stats
  const stats = {
    questions: data.filter(d => d.intent_type === 'question').length,
    actions: data.filter(d => d.intent_type === 'action').length,
    avgConfidence: Math.round(data.reduce((acc, d) => acc + d.confidence, 0) / data.length),
    pending: data.filter(d => d.status === 'pending').length,
  };

  // Filter data
  const filteredData = data.filter(item => {
    if (intentFilter !== 'all' && item.intent_type !== intentFilter) return false;
    if (riskFilter !== 'all' && item.risk_level !== riskFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    return true;
  });

  const handleRowClick = (params) => {
    setSelectedIntent(params.row);
    setDrawerOpen(true);
  };

  const columns = [
    {
      field: 'sender_name',
      headerName: sourceType === 'vendor' ? 'Vendor' : 'Customer',
      width: 180,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 28, height: 28, bgcolor: sourceType === 'vendor' ? '#00357a' : '#1a5a9e', fontSize: '0.75rem' }}>
            {params.value?.charAt(0)}
          </Avatar>
          <Typography variant="body2" noWrap>{params.value}</Typography>
        </Stack>
      ),
    },
    {
      field: 'subject',
      headerName: 'Subject',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography variant="body2" noWrap sx={{ color: colors.text }}>
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'intent_type',
      headerName: 'Intent',
      width: 120,
      renderCell: (params) => (
        <Chip
          icon={params.value === 'question' ? <QuestionIcon sx={{ fontSize: 16 }} /> : <ActionIcon sx={{ fontSize: 16 }} />}
          label={params.value}
          size="small"
          sx={{
            bgcolor: alpha(intentColors[params.value], 0.15),
            color: intentColors[params.value],
            fontWeight: 600,
            textTransform: 'capitalize',
            '& .MuiChip-icon': { color: intentColors[params.value] },
          }}
        />
      ),
    },
    {
      field: 'intent_category',
      headerName: 'Category',
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ textTransform: 'capitalize', color: colors.textSecondary }}>
          {params.value?.replace(/_/g, ' ')}
        </Typography>
      ),
    },
    {
      field: 'confidence',
      headerName: 'Confidence',
      width: 110,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box sx={{
            width: 40,
            height: 6,
            borderRadius: 3,
            bgcolor: alpha(params.value >= 90 ? '#10b981' : params.value >= 80 ? '#f59e0b' : '#ef4444', 0.2),
            overflow: 'hidden',
          }}>
            <Box sx={{
              width: `${params.value}%`,
              height: '100%',
              bgcolor: params.value >= 90 ? '#10b981' : params.value >= 80 ? '#f59e0b' : '#ef4444',
              borderRadius: 3,
            }} />
          </Box>
          <Typography variant="caption" fontWeight={600} sx={{ color: colors.text }}>
            {params.value}%
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'risk_level',
      headerName: 'Risk',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: alpha(riskColors[params.value], 0.15),
            color: riskColors[params.value],
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value?.replace(/_/g, ' ')}
          size="small"
          sx={{
            bgcolor: alpha(statusColors[params.value], 0.15),
            color: statusColors[params.value],
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        />
      ),
    },
    {
      field: 'received_date',
      headerName: 'Received',
      width: 110,
    },
    {
      field: 'actions',
      headerName: '',
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="View Details">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIntent(params.row);
              setDrawerOpen(true);
            }}
          >
            <ViewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box>
      {/* Stats Bar */}
      <Box sx={{
        p: 2,
        borderBottom: `1px solid ${colors.border}`,
        bgcolor: darkMode ? colors.cardBg : alpha('#00357a', 0.02),
      }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(intentColors.question, 0.15) }}>
                  <QuestionIcon sx={{ fontSize: 16, color: intentColors.question }} />
                </Avatar>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>Questions</Typography>
                <Typography variant="body1" fontWeight={700} sx={{ color: colors.text }}>{stats.questions}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(intentColors.action, 0.15) }}>
                  <ActionIcon sx={{ fontSize: 16, color: intentColors.action }} />
                </Avatar>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>Actions</Typography>
                <Typography variant="body1" fontWeight={700} sx={{ color: colors.text }}>{stats.actions}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ width: 28, height: 28, bgcolor: alpha('#10b981', 0.15) }}>
                  <TrendingUpIcon sx={{ fontSize: 16, color: '#10b981' }} />
                </Avatar>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>Avg Confidence</Typography>
                <Typography variant="body1" fontWeight={700} sx={{ color: colors.text }}>{stats.avgConfidence}%</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(statusColors.pending, 0.15) }}>
                  <PsychologyIcon sx={{ fontSize: 16, color: statusColors.pending }} />
                </Avatar>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>Pending</Typography>
                <Typography variant="body1" fontWeight={700} sx={{ color: colors.text }}>{stats.pending}</Typography>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Intent</InputLabel>
                <Select
                  value={intentFilter}
                  label="Intent"
                  onChange={(e) => setIntentFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="question">Question</MenuItem>
                  <MenuItem value="action">Action</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Risk</InputLabel>
                <Select
                  value={riskFilter}
                  label="Risk"
                  onChange={(e) => setRiskFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="processed">Processed</MenuItem>
                  <MenuItem value="action_queued">Action Queued</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* DataGrid */}
      <Box sx={{ height: 500 }}>
        <DataGrid
          rows={filteredData}
          columns={columns}
          density="compact"
          onRowClick={handleRowClick}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          slots={{ toolbar: CustomToolbar }}
          sx={{
            border: 'none',
            color: colors.text,
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${colors.border}`,
              cursor: 'pointer',
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: darkMode ? colors.cardBg : 'grey.50',
              borderBottom: `1px solid ${colors.border}`,
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: alpha(sourceType === 'vendor' ? '#00357a' : '#1a5a9e', 0.05),
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: `1px solid ${colors.border}`,
            },
          }}
        />
      </Box>

      {/* Intent Detail Drawer */}
      <IntentDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        intent={selectedIntent}
        darkMode={darkMode}
        sourceType={sourceType}
      />
    </Box>
  );
};

export default IntentAnalysisTab;
