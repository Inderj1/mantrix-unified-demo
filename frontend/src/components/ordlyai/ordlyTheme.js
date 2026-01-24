import { alpha } from '@mui/material';

/**
 * Standardized ORDLY.AI Theme Configuration
 * Blue corporate palette for all DataGrid tables and components
 * Matches REVEQ.AI theme structure for consistency
 */

export const ordlyTheme = {
  // Color Palette - Blue focused
  colors: {
    // Primary blues - ORDLY.AI specific
    blue: {
      50: '#f0f4f8',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#00357a',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
    // Primary accent - SAP-like blue
    primary: {
      light: '#42a5f5',
      main: '#002352',
      dark: '#074080',
    },
    // Secondary accent
    secondary: {
      light: '#64b5f6',
      main: '#1976d2',
      dark: '#1565c0',
    },
    // Primary neutrals
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    // Status colors
    emerald: {
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
    },
    amber: {
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
    },
    red: {
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
    },
    cyan: {
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
    },
  },

  // DataGrid Styles
  dataGrid: {
    header: {
      backgroundColor: '#f0f4f8',
      color: '#0d47a1',
      fontSize: '0.85rem',
      fontWeight: 700,
      borderBottom: '2px solid #1976d2',
    },
    cell: {
      fontSize: '0.8rem',
    },
    rowHover: {
      bgcolor: alpha('#1976d2', 0.08),
    },
    clickableRow: {
      cursor: 'pointer',
      '&:hover': {
        bgcolor: alpha('#1976d2', 0.12),
      },
    },
  },

  // Chip Styles
  chips: {
    // ID/Primary chips
    primary: {
      bgcolor: alpha('#002352', 0.12),
      color: '#002352',
      border: '1px solid',
      borderColor: alpha('#002352', 0.2),
      fontWeight: 700,
    },
    // Order ID chips
    orderId: {
      bgcolor: alpha('#1976d2', 0.12),
      color: '#1565c0',
      border: '1px solid',
      borderColor: alpha('#1565c0', 0.2),
      fontWeight: 700,
    },
    // Status chips
    orderStatus: {
      new: {
        bgcolor: alpha('#06b6d4', 0.12),
        color: '#0891b2',
        border: '1px solid',
        borderColor: alpha('#0891b2', 0.2),
        fontWeight: 600,
      },
      processing: {
        bgcolor: alpha('#1976d2', 0.12),
        color: '#1565c0',
        border: '1px solid',
        borderColor: alpha('#1565c0', 0.2),
        fontWeight: 600,
      },
      rush: {
        bgcolor: alpha('#ef4444', 0.12),
        color: '#dc2626',
        border: '1px solid',
        borderColor: alpha('#dc2626', 0.2),
        fontWeight: 600,
      },
      escalated: {
        bgcolor: alpha('#ef4444', 0.12),
        color: '#dc2626',
        border: '1px solid',
        borderColor: alpha('#dc2626', 0.2),
        fontWeight: 600,
      },
      review: {
        bgcolor: alpha('#f59e0b', 0.12),
        color: '#d97706',
        border: '1px solid',
        borderColor: alpha('#d97706', 0.2),
        fontWeight: 600,
      },
      approved: {
        bgcolor: alpha('#10b981', 0.12),
        color: '#059669',
        border: '1px solid',
        borderColor: alpha('#059669', 0.2),
        fontWeight: 600,
      },
      committed: {
        bgcolor: alpha('#10b981', 0.15),
        color: '#059669',
        border: '1px solid',
        borderColor: alpha('#059669', 0.2),
        fontWeight: 600,
      },
    },
    // Stage chips
    stages: {
      intent: {
        bgcolor: alpha('#06b6d4', 0.12),
        color: '#0891b2',
        fontWeight: 600,
      },
      decisioning: {
        bgcolor: alpha('#10b981', 0.12),
        color: '#059669',
        fontWeight: 600,
      },
      arbitration: {
        bgcolor: alpha('#f59e0b', 0.12),
        color: '#d97706',
        fontWeight: 600,
      },
      commit: {
        bgcolor: alpha('#1976d2', 0.12),
        color: '#1565c0',
        fontWeight: 600,
      },
    },
    // Priority chips
    priority: {
      high: {
        bgcolor: alpha('#ef4444', 0.12),
        color: '#dc2626',
        fontWeight: 700,
      },
      medium: {
        bgcolor: alpha('#f59e0b', 0.12),
        color: '#d97706',
        fontWeight: 700,
      },
      low: {
        bgcolor: alpha('#10b981', 0.12),
        color: '#059669',
        fontWeight: 700,
      },
    },
    // General status chips
    status: {
      success: {
        bgcolor: alpha('#10b981', 0.12),
        color: '#059669',
        border: '1px solid',
        borderColor: alpha('#059669', 0.2),
      },
      warning: {
        bgcolor: alpha('#f59e0b', 0.12),
        color: '#d97706',
        border: '1px solid',
        borderColor: alpha('#d97706', 0.2),
      },
      error: {
        bgcolor: alpha('#ef4444', 0.12),
        color: '#dc2626',
        border: '1px solid',
        borderColor: alpha('#dc2626', 0.2),
      },
      info: {
        bgcolor: alpha('#1976d2', 0.12),
        color: '#1565c0',
        border: '1px solid',
        borderColor: alpha('#1565c0', 0.2),
      },
    },
  },

  // Trend Indicators
  trends: {
    up: {
      color: '#059669',
      icon: 'TrendingUp',
    },
    down: {
      color: '#dc2626',
      icon: 'TrendingDown',
    },
    flat: {
      color: '#64748b',
      icon: 'TrendingFlat',
    },
  },

  // Card/Paper Backgrounds
  cards: {
    highlight: {
      bgcolor: alpha('#1976d2', 0.08),
      border: `1px solid ${alpha('#1565c0', 0.2)}`,
    },
    info: {
      bgcolor: alpha('#002352', 0.05),
      border: `1px solid ${alpha('#002352', 0.15)}`,
    },
    success: {
      bgcolor: alpha('#10b981', 0.08),
      border: `1px solid ${alpha('#059669', 0.2)}`,
    },
    warning: {
      bgcolor: alpha('#f59e0b', 0.08),
      border: `1px solid ${alpha('#d97706', 0.2)}`,
    },
    error: {
      bgcolor: alpha('#ef4444', 0.08),
      border: `1px solid ${alpha('#dc2626', 0.2)}`,
    },
  },

  // Header gradient
  headerGradient: 'linear-gradient(135deg, #002352 0%, #1976d2 100%)',
  bannerGradient: 'linear-gradient(135deg, rgba(8, 84, 160, 0.08) 0%, rgba(25, 118, 210, 0.08) 100%)',

  // Helper function to get DataGrid sx props
  getDataGridSx: (options = {}) => {
    const { clickable = false, darkMode = false } = options;
    return {
      bgcolor: darkMode ? '#161b22' : undefined,
      '& .MuiDataGrid-cell': {
        fontSize: '0.8rem',
        color: darkMode ? '#e6edf3' : undefined,
      },
      '& .MuiDataGrid-columnHeaders': {
        backgroundColor: darkMode ? '#21262d' : '#f0f4f8',
        color: darkMode ? '#e6edf3' : '#0d47a1',
        fontSize: '0.85rem',
        fontWeight: 700,
        borderBottom: darkMode ? '2px solid #42a5f5' : '2px solid #1976d2',
      },
      '& .MuiDataGrid-row': {
        ...(clickable && {
          cursor: 'pointer',
          '&:hover': {
            bgcolor: darkMode ? '#21262d' : alpha('#1976d2', 0.12),
          },
        }),
        ...(!clickable && {
          '&:hover': {
            bgcolor: darkMode ? alpha('#42a5f5', 0.08) : alpha('#1976d2', 0.08),
          },
        }),
      },
      '& .MuiDataGrid-cell:focus': { outline: 'none' },
      '& .MuiDataGrid-row:focus': { outline: 'none' },
      '& .MuiDataGrid-footerContainer': {
        backgroundColor: darkMode ? '#161b22' : undefined,
        color: darkMode ? '#8b949e' : undefined,
      },
      '& .MuiTablePagination-root': {
        color: darkMode ? '#8b949e' : undefined,
      },
    };
  },

  // Format currency helper
  formatCurrency: (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(2)}`;
  },
};

export default ordlyTheme;
