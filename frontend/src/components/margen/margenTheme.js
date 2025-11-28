import { alpha } from '@mui/material';

/**
 * MARGEN.AI Theme Configuration
 * Arizona Beverages COPA (Profitability Analysis) focused styling
 */

export const margenTheme = {
  // Color Palette
  colors: {
    // Primary neutrals
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      900: '#1e293b',
    },
    // Financial colors
    emerald: {
      50: '#ecfdf5',
      500: '#10b981',
      600: '#059669',
    },
    red: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
    },
    amber: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
    },
    blue: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
    },
    purple: {
      50: '#faf5ff',
      500: '#a855f7',
      600: '#9333ea',
    },
    cyan: {
      50: '#ecfeff',
      500: '#06b6d4',
      600: '#0891b2',
    },
    orange: {
      50: '#fff7ed',
      500: '#f97316',
      600: '#ea580c',
    },
  },

  // DataGrid Styles
  dataGrid: {
    header: {
      backgroundColor: '#f8fafc',
      color: '#1e293b',
      fontSize: '0.85rem',
      fontWeight: 700,
      borderBottom: '2px solid #64748b',
    },
    cell: {
      fontSize: '0.8rem',
    },
    rowHover: {
      bgcolor: alpha('#64748b', 0.08),
    },
    clickableRow: {
      cursor: 'pointer',
      '&:hover': {
        bgcolor: alpha('#64748b', 0.12),
      },
    },
  },

  // Financial Chip Styles
  chips: {
    // Positive/Negative financial values
    positive: {
      bgcolor: alpha('#10b981', 0.12),
      color: '#059669',
      border: '1px solid',
      borderColor: alpha('#059669', 0.2),
      fontWeight: 700,
    },
    negative: {
      bgcolor: alpha('#ef4444', 0.12),
      color: '#dc2626',
      border: '1px solid',
      borderColor: alpha('#dc2626', 0.2),
      fontWeight: 700,
    },
    neutral: {
      bgcolor: alpha('#64748b', 0.12),
      color: '#475569',
      border: '1px solid',
      borderColor: alpha('#475569', 0.2),
      fontWeight: 700,
    },
    // Status chips
    status: {
      onTrack: {
        bgcolor: alpha('#10b981', 0.12),
        color: '#059669',
        border: '1px solid',
        borderColor: alpha('#059669', 0.2),
      },
      atRisk: {
        bgcolor: alpha('#f59e0b', 0.12),
        color: '#d97706',
        border: '1px solid',
        borderColor: alpha('#d97706', 0.2),
      },
      delayed: {
        bgcolor: alpha('#ef4444', 0.12),
        color: '#dc2626',
        border: '1px solid',
        borderColor: alpha('#dc2626', 0.2),
      },
      completed: {
        bgcolor: alpha('#3b82f6', 0.12),
        color: '#2563eb',
        border: '1px solid',
        borderColor: alpha('#2563eb', 0.2),
      },
    },
    // Alert severity
    severity: {
      critical: {
        bgcolor: alpha('#ef4444', 0.12),
        color: '#dc2626',
        border: '1px solid',
        borderColor: alpha('#dc2626', 0.2),
      },
      high: {
        bgcolor: alpha('#f97316', 0.12),
        color: '#ea580c',
        border: '1px solid',
        borderColor: alpha('#ea580c', 0.2),
      },
      medium: {
        bgcolor: alpha('#f59e0b', 0.12),
        color: '#d97706',
        border: '1px solid',
        borderColor: alpha('#d97706', 0.2),
      },
      low: {
        bgcolor: alpha('#3b82f6', 0.12),
        color: '#2563eb',
        border: '1px solid',
        borderColor: alpha('#2563eb', 0.2),
      },
    },
    // Type chips (risk/opportunity)
    type: {
      risk: {
        bgcolor: alpha('#ef4444', 0.12),
        color: '#dc2626',
        border: '1px solid',
        borderColor: alpha('#dc2626', 0.2),
      },
      opportunity: {
        bgcolor: alpha('#10b981', 0.12),
        color: '#059669',
        border: '1px solid',
        borderColor: alpha('#059669', 0.2),
      },
    },
    // Customer segments
    segments: {
      champions: {
        bgcolor: alpha('#10b981', 0.12),
        color: '#059669',
      },
      loyal: {
        bgcolor: alpha('#3b82f6', 0.12),
        color: '#2563eb',
      },
      potential: {
        bgcolor: alpha('#06b6d4', 0.12),
        color: '#0891b2',
      },
      atRisk: {
        bgcolor: alpha('#f97316', 0.12),
        color: '#ea580c',
      },
      lost: {
        bgcolor: alpha('#ef4444', 0.12),
        color: '#dc2626',
      },
    },
  },

  // Helper function to get DataGrid sx props - Matches stoxTheme exactly
  getDataGridSx: (options = {}) => {
    const { clickable = false } = options;
    return {
      '& .MuiDataGrid-cell': {
        fontSize: '0.8rem',
      },
      '& .MuiDataGrid-columnHeaders': {
        backgroundColor: '#f8fafc',
        color: '#1e293b',
        fontSize: '0.85rem',
        fontWeight: 700,
        borderBottom: '2px solid #64748b',
      },
      '& .MuiDataGrid-columnHeaderTitle': {
        fontWeight: 700,
      },
      '& .MuiDataGrid-row': {
        ...(clickable && {
          cursor: 'pointer',
          '&:hover': {
            bgcolor: alpha('#64748b', 0.12),
          },
        }),
        ...(!clickable && {
          '&:hover': {
            bgcolor: alpha('#64748b', 0.08),
          },
        }),
      },
      '& .MuiDataGrid-cell:focus': { outline: 'none' },
      '& .MuiDataGrid-row:focus': { outline: 'none' },
    };
  },

  // Helper to format currency
  formatCurrency: (value, compact = false) => {
    if (value === null || value === undefined) return '-';
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (compact) {
      if (absValue >= 1000000000) return `${sign}$${(absValue / 1000000000).toFixed(1)}B`;
      if (absValue >= 1000000) return `${sign}$${(absValue / 1000000).toFixed(1)}M`;
      if (absValue >= 1000) return `${sign}$${(absValue / 1000).toFixed(0)}K`;
    }
    return `${sign}$${absValue.toLocaleString()}`;
  },

  // Helper to format percentage
  formatPercent: (value, decimals = 1) => {
    if (value === null || value === undefined) return '-';
    return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
  },

  // Helper to get color based on value threshold
  getValueColor: (value, thresholds = { good: 0, warning: -5 }) => {
    if (value >= thresholds.good) return margenTheme.colors.emerald;
    if (value >= thresholds.warning) return margenTheme.colors.amber;
    return margenTheme.colors.red;
  },

  // Helper to get chip sx based on value
  getValueChipSx: (value, thresholds = { good: 0, warning: -5 }) => {
    const colors = margenTheme.getValueColor(value, thresholds);
    return {
      fontWeight: 700,
      bgcolor: alpha(colors[500], 0.12),
      color: colors[600],
      border: '1px solid',
      borderColor: alpha(colors[600], 0.2),
    };
  },
};

export default margenTheme;
