import React, { useState } from 'react';
import {
  Chip,
  IconButton,
  Tooltip,
  Box,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Visibility as ViewIcon,
  Science as SimulateIcon,
  Place as LocationIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { getSeverityLevel } from './CategoryIcons';

/**
 * MarketSignalTable - Reusable table component for displaying market signals using MUI DataGrid
 *
 * Props:
 * - signals: Array of signal objects
 * - onViewDetails: Handler for View Details button
 * - onSimulate: Handler for Simulate Impact button
 * - compact: Whether to show compact view (default: false)
 */
const MarketSignalTable = ({
  signals = [],
  onViewDetails,
  onSimulate,
  compact = false,
}) => {
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '$0';
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `${value >= 0 ? '' : '-'}$${(absValue / 1000000).toFixed(1)}M`;
    } else if (absValue >= 1000) {
      return `${value >= 0 ? '' : '-'}$${(absValue / 1000).toFixed(0)}K`;
    }
    return `${value >= 0 ? '' : '-'}$${absValue.toFixed(0)}`;
  };

  // Get severity chip
  const getSeverityChip = (severityScore) => {
    const level = getSeverityLevel(severityScore);
    return (
      <Chip
        label={level.label}
        size="small"
        icon={<span>{level.icon}</span>}
        sx={{
          bgcolor: level.bgColor,
          color: level.color,
          border: `1px solid ${level.color}`,
          fontWeight: 600,
          fontSize: '0.7rem',
        }}
      />
    );
  };

  // Define columns for DataGrid
  const columns = [
    {
      field: 'name',
      headerName: 'Signal Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.value}
          </Typography>
          {params.row.description && !compact && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {params.row.description}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 0.8,
      minWidth: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'severityScore',
      headerName: 'Severity',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => getSeverityChip(params.value),
    },
    {
      field: 'impactValue',
      headerName: 'Business Impact',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            color: params.value >= 0 ? '#4caf50' : '#f44336',
          }}
        >
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    ...(compact ? [] : [
      {
        field: 'timeToImpact',
        headerName: 'Time to Impact',
        width: 130,
        renderCell: (params) => (
          <Typography variant="body2" color="text.secondary">
            {params.value}
          </Typography>
        ),
      },
    ]),
    ...(compact ? [] : [
      {
        field: 'affected',
        headerName: 'Affected',
        width: 150,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {params.row.affectedSKUs && (
              <Chip
                label={`${params.row.affectedSKUs} SKUs`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.65rem', height: 20 }}
              />
            )}
            {params.row.affectedSuppliers && (
              <Chip
                label={`${params.row.affectedSuppliers} Suppliers`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.65rem', height: 20 }}
              />
            )}
          </Box>
        ),
      },
    ]),
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(params.row);
              }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Simulate Impact">
            <IconButton
              size="small"
              color="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onSimulate?.(params.row);
              }}
            >
              <SimulateIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Empty state
  if (signals.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          px: 2,
        }}
      >
        <CheckIcon sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Active Signals
        </Typography>
        <Typography variant="body2" color="text.secondary">
          All clear for this category
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 600 }}>
      <DataGrid
        rows={signals}
        columns={columns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 25, 50, 100]}
        disableRowSelectionOnClick
        density={compact ? 'compact' : 'standard'}
        initialState={{
          sorting: {
            sortModel: [{ field: 'severityScore', sort: 'desc' }],
          },
        }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f9f9f9',
            cursor: 'pointer',
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f5f5',
            fontWeight: 600,
          },
        }}
      />
    </Box>
  );
};

export default MarketSignalTable;
