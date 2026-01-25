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
  Button,
  Card,
  CardContent,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import {
  ViewList as ListIcon,
  ViewKanban as KanbanIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  PlayArrow as ExecutingIcon,
  Block as RejectedIcon,
  Send as SendIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';

import ActionDetailDrawer from '../components/ActionDetailDrawer';

const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const statusColors = {
  pending: { bg: '#6b7280', label: 'Pending' },
  approved: { bg: '#10b981', label: 'Approved' },
  executing: { bg: '#3b82f6', label: 'Executing' },
  completed: { bg: '#059669', label: 'Completed' },
  rejected: { bg: '#ef4444', label: 'Rejected' },
};

const statusIcons = {
  pending: <ScheduleIcon sx={{ fontSize: 16 }} />,
  approved: <CheckIcon sx={{ fontSize: 16 }} />,
  executing: <ExecutingIcon sx={{ fontSize: 16 }} />,
  completed: <CheckIcon sx={{ fontSize: 16 }} />,
  rejected: <RejectedIcon sx={{ fontSize: 16 }} />,
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
        placeholder="Search actions..."
      />
    </GridToolbarContainer>
  );
}

// Kanban Card Component
const ActionCard = ({ action, onClick, darkMode, sourceType }) => {
  const colors = getColors(darkMode);
  const moduleColor = sourceType === 'vendor' ? '#00357a' : '#1a5a9e';

  return (
    <Card
      sx={{
        mb: 1.5,
        cursor: 'pointer',
        border: `1px solid ${colors.border}`,
        bgcolor: colors.paper,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: `0 4px 12px ${alpha(moduleColor, 0.15)}`,
          borderColor: moduleColor,
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack spacing={1.5}>
          {/* Title */}
          <Typography variant="body2" fontWeight={600} sx={{ color: colors.text, lineHeight: 1.3 }}>
            {action.title}
          </Typography>

          {/* Source */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ width: 20, height: 20, bgcolor: moduleColor, fontSize: '0.6rem' }}>
              {(action.vendor_name || action.customer_name)?.charAt(0)}
            </Avatar>
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              {action.vendor_name || action.customer_name}
            </Typography>
          </Stack>

          {/* Financial Impact */}
          {action.financial_impact && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <MoneyIcon sx={{ fontSize: 14, color: '#10b981' }} />
              <Typography variant="caption" fontWeight={600} sx={{ color: '#10b981' }}>
                {action.financial_impact}
              </Typography>
            </Stack>
          )}

          {/* Risk Score */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>Risk Score</Typography>
              <Typography variant="caption" fontWeight={600} sx={{
                color: action.risk_score >= 70 ? '#ef4444' : action.risk_score >= 40 ? '#f59e0b' : '#10b981'
              }}>
                {action.risk_score}
              </Typography>
            </Stack>
            <Box sx={{
              height: 4,
              borderRadius: 2,
              bgcolor: alpha(action.risk_score >= 70 ? '#ef4444' : action.risk_score >= 40 ? '#f59e0b' : '#10b981', 0.2),
            }}>
              <Box sx={{
                width: `${action.risk_score}%`,
                height: '100%',
                borderRadius: 2,
                bgcolor: action.risk_score >= 70 ? '#ef4444' : action.risk_score >= 40 ? '#f59e0b' : '#10b981',
              }} />
            </Box>
          </Box>

          {/* Footer */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1, borderTop: `1px solid ${colors.border}` }}>
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              Due: {action.due_date}
            </Typography>
            {action.required_approvals?.length > 0 && (
              <Chip
                label={`${action.required_approvals.length} Approval${action.required_approvals.length > 1 ? 's' : ''}`}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.6rem',
                  bgcolor: alpha('#f59e0b', 0.15),
                  color: '#f59e0b',
                }}
              />
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Kanban Column Component
const KanbanColumn = ({ title, status, actions, onCardClick, darkMode, sourceType }) => {
  const colors = getColors(darkMode);
  const statusConfig = statusColors[status];

  return (
    <Box sx={{
      flex: 1,
      minWidth: 280,
      maxWidth: 320,
    }}>
      <Paper sx={{
        bgcolor: darkMode ? colors.cardBg : alpha(statusConfig.bg, 0.03),
        border: `1px solid ${colors.border}`,
        borderRadius: 2,
        overflow: 'hidden',
        height: '100%',
      }}>
        {/* Column Header */}
        <Box sx={{
          p: 1.5,
          bgcolor: alpha(statusConfig.bg, 0.1),
          borderBottom: `1px solid ${colors.border}`,
        }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: statusConfig.bg,
            }} />
            <Typography variant="subtitle2" fontWeight={600} sx={{ color: colors.text }}>
              {title}
            </Typography>
            <Chip
              label={actions.length}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                bgcolor: alpha(statusConfig.bg, 0.15),
                color: statusConfig.bg,
                fontWeight: 600,
              }}
            />
          </Stack>
        </Box>

        {/* Column Content */}
        <Box sx={{ p: 1.5, maxHeight: 450, overflowY: 'auto' }}>
          {actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              onClick={() => onCardClick(action)}
              darkMode={darkMode}
              sourceType={sourceType}
            />
          ))}
          {actions.length === 0 && (
            <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', textAlign: 'center', py: 4 }}>
              No actions
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

const ActionQueueTab = ({ data, darkMode = false, sourceType = 'vendor' }) => {
  const colors = getColors(darkMode);
  const moduleColor = sourceType === 'vendor' ? '#00357a' : '#1a5a9e';
  const [viewMode, setViewMode] = useState('kanban');
  const [selectedAction, setSelectedAction] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Calculate stats
  const stats = {
    pending: data.filter(d => d.status === 'pending').length,
    dueToday: data.filter(d => d.due_date === new Date().toLocaleDateString()).length,
    overdue: data.filter(d => new Date(d.due_date) < new Date() && d.status === 'pending').length,
    totalImpact: data
      .filter(d => d.financial_impact)
      .reduce((acc, d) => acc + parseFloat(d.financial_impact.replace(/[$,]/g, '')), 0),
  };

  const handleCardClick = (action) => {
    setSelectedAction(action);
    setDrawerOpen(true);
  };

  // Group actions by status for Kanban view
  const groupedActions = {
    pending: data.filter(a => a.status === 'pending'),
    approved: data.filter(a => a.status === 'approved'),
    executing: data.filter(a => a.status === 'executing'),
    completed: data.filter(a => a.status === 'completed'),
  };

  const columns = [
    {
      field: 'action_id',
      headerName: 'Action ID',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} sx={{ color: moduleColor }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'title',
      headerName: 'Title',
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
      field: sourceType === 'vendor' ? 'vendor_name' : 'customer_name',
      headerName: sourceType === 'vendor' ? 'Vendor' : 'Customer',
      width: 160,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 24, height: 24, bgcolor: moduleColor, fontSize: '0.7rem' }}>
            {params.value?.charAt(0)}
          </Avatar>
          <Typography variant="body2" noWrap>{params.value}</Typography>
        </Stack>
      ),
    },
    {
      field: 'action_type',
      headerName: 'Type',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value?.replace(/_/g, ' ')}
          size="small"
          sx={{
            bgcolor: alpha(moduleColor, 0.1),
            color: moduleColor,
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        />
      ),
    },
    {
      field: 'financial_impact',
      headerName: 'Impact',
      width: 110,
      renderCell: (params) => params.value ? (
        <Typography variant="body2" fontWeight={600} sx={{ color: '#10b981' }}>
          {params.value}
        </Typography>
      ) : '-',
    },
    {
      field: 'risk_score',
      headerName: 'Risk',
      width: 90,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: alpha(params.value >= 70 ? '#ef4444' : params.value >= 40 ? '#f59e0b' : '#10b981', 0.15),
            color: params.value >= 70 ? '#ef4444' : params.value >= 40 ? '#f59e0b' : '#10b981',
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          icon={statusIcons[params.value]}
          label={statusColors[params.value]?.label}
          size="small"
          sx={{
            bgcolor: alpha(statusColors[params.value]?.bg, 0.15),
            color: statusColors[params.value]?.bg,
            fontWeight: 600,
            '& .MuiChip-icon': { color: statusColors[params.value]?.bg },
          }}
        />
      ),
    },
    {
      field: 'due_date',
      headerName: 'Due Date',
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
              handleCardClick(params.row);
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
        bgcolor: darkMode ? colors.cardBg : alpha(moduleColor, 0.02),
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(statusColors.pending.bg, 0.15) }}>
                  <ScheduleIcon sx={{ fontSize: 16, color: statusColors.pending.bg }} />
                </Avatar>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>Pending</Typography>
                <Typography variant="body1" fontWeight={700} sx={{ color: colors.text }}>{stats.pending}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ width: 28, height: 28, bgcolor: alpha('#f59e0b', 0.15) }}>
                  <WarningIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                </Avatar>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>Due Today</Typography>
                <Typography variant="body1" fontWeight={700} sx={{ color: colors.text }}>{stats.dueToday}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ width: 28, height: 28, bgcolor: alpha('#ef4444', 0.15) }}>
                  <WarningIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                </Avatar>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>Overdue</Typography>
                <Typography variant="body1" fontWeight={700} sx={{ color: colors.text }}>{stats.overdue}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ width: 28, height: 28, bgcolor: alpha('#10b981', 0.15) }}>
                  <MoneyIcon sx={{ fontSize: 16, color: '#10b981' }} />
                </Avatar>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>Total Impact</Typography>
                <Typography variant="body1" fontWeight={700} sx={{ color: colors.text }}>
                  ${stats.totalImpact.toLocaleString()}
                </Typography>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newValue) => newValue && setViewMode(newValue)}
                size="small"
              >
                <ToggleButton value="list">
                  <Tooltip title="List View">
                    <ListIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="kanban">
                  <Tooltip title="Kanban View">
                    <KanbanIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Content */}
      {viewMode === 'list' ? (
        <Box sx={{ height: 500 }}>
          <DataGrid
            rows={data}
            columns={columns}
            density="compact"
            onRowClick={(params) => handleCardClick(params.row)}
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
                bgcolor: alpha(moduleColor, 0.05),
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: `1px solid ${colors.border}`,
              },
            }}
          />
        </Box>
      ) : (
        <Box sx={{ p: 2, overflowX: 'auto' }}>
          <Stack direction="row" spacing={2}>
            <KanbanColumn
              title="Pending"
              status="pending"
              actions={groupedActions.pending}
              onCardClick={handleCardClick}
              darkMode={darkMode}
              sourceType={sourceType}
            />
            <KanbanColumn
              title="Approved"
              status="approved"
              actions={groupedActions.approved}
              onCardClick={handleCardClick}
              darkMode={darkMode}
              sourceType={sourceType}
            />
            <KanbanColumn
              title="Executing"
              status="executing"
              actions={groupedActions.executing}
              onCardClick={handleCardClick}
              darkMode={darkMode}
              sourceType={sourceType}
            />
            <KanbanColumn
              title="Completed"
              status="completed"
              actions={groupedActions.completed}
              onCardClick={handleCardClick}
              darkMode={darkMode}
              sourceType={sourceType}
            />
          </Stack>
        </Box>
      )}

      {/* Action Detail Drawer */}
      <ActionDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        action={selectedAction}
        darkMode={darkMode}
        sourceType={sourceType}
      />
    </Box>
  );
};

export default ActionQueueTab;
