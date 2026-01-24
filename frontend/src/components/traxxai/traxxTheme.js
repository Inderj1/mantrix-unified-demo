import { alpha } from '@mui/material';

/**
 * Standardized TRAXX.AI Theme Configuration
 * Light, corporate-friendly color scheme for all DataGrid tables and components
 * Matches STOX.AI theme structure for consistency
 */

export const traxxTheme = {
  // Color Palette
  colors: {
    // Primary neutrals
    slate: {
      50: '#f8fafc',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      900: '#1e293b',
    },
    // Accent colors - TRAXX.AI specific
    cyan: {
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
    },
    orange: {
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
    },
    purple: {
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
    },
    pink: {
      400: '#f472b6',
      500: '#ec4899',
      600: '#db2777',
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
    blue: {
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
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

  // Chip Styles
  chips: {
    // ID/Primary chips
    primary: {
      bgcolor: alpha('#475569', 0.12),
      color: '#475569',
      border: '1px solid',
      borderColor: alpha('#475569', 0.2),
      fontWeight: 700,
    },
    // Kit ID chips
    kitId: {
      bgcolor: alpha('#06b6d4', 0.12),
      color: '#0891b2',
      border: '1px solid',
      borderColor: alpha('#0891b2', 0.2),
      fontWeight: 700,
    },
    // Kit Type chips
    kitTypes: {
      loaner: {
        bgcolor: alpha('#a855f7', 0.12),
        color: '#9333ea',
        border: '1px solid',
        borderColor: alpha('#9333ea', 0.2),
        fontWeight: 600,
      },
      consignment: {
        bgcolor: alpha('#06b6d4', 0.12),
        color: '#0891b2',
        border: '1px solid',
        borderColor: alpha('#0891b2', 0.2),
        fontWeight: 600,
      },
    },
    // Kit Category chips
    kitCategories: {
      tlif: {
        bgcolor: alpha('#10b981', 0.12),
        color: '#059669',
        border: '1px solid',
        borderColor: alpha('#059669', 0.2),
        fontWeight: 600,
      },
      plif: {
        bgcolor: alpha('#a855f7', 0.12),
        color: '#9333ea',
        border: '1px solid',
        borderColor: alpha('#9333ea', 0.2),
        fontWeight: 600,
      },
      deformity: {
        bgcolor: alpha('#ec4899', 0.12),
        color: '#db2777',
        border: '1px solid',
        borderColor: alpha('#db2777', 0.2),
        fontWeight: 600,
      },
      cervical: {
        bgcolor: alpha('#06b6d4', 0.12),
        color: '#0891b2',
        border: '1px solid',
        borderColor: alpha('#0891b2', 0.2),
        fontWeight: 600,
      },
    },
    // Status chips
    kitStatus: {
      'at-hospital': {
        bgcolor: alpha('#10b981', 0.12),
        color: '#059669',
        border: '1px solid',
        borderColor: alpha('#059669', 0.2),
        fontWeight: 600,
      },
      'in-transit': {
        bgcolor: alpha('#a855f7', 0.12),
        color: '#9333ea',
        border: '1px solid',
        borderColor: alpha('#9333ea', 0.2),
        fontWeight: 600,
      },
      idle: {
        bgcolor: alpha('#f59e0b', 0.12),
        color: '#d97706',
        border: '1px solid',
        borderColor: alpha('#d97706', 0.2),
        fontWeight: 600,
      },
      qc: {
        bgcolor: alpha('#06b6d4', 0.12),
        color: '#0891b2',
        border: '1px solid',
        borderColor: alpha('#0891b2', 0.2),
        fontWeight: 600,
      },
      quarantine: {
        bgcolor: alpha('#ef4444', 0.12),
        color: '#dc2626',
        border: '1px solid',
        borderColor: alpha('#dc2626', 0.2),
        fontWeight: 600,
      },
    },
    // Priority chips
    priority: {
      green: {
        bgcolor: alpha('#10b981', 0.12),
        color: '#059669',
        border: '1px solid',
        borderColor: alpha('#059669', 0.2),
        fontWeight: 700,
      },
      yellow: {
        bgcolor: alpha('#f59e0b', 0.12),
        color: '#d97706',
        border: '1px solid',
        borderColor: alpha('#d97706', 0.2),
        fontWeight: 700,
      },
      red: {
        bgcolor: alpha('#ef4444', 0.12),
        color: '#dc2626',
        border: '1px solid',
        borderColor: alpha('#dc2626', 0.2),
        fontWeight: 700,
      },
    },
    // Owner type chips
    ownerTypes: {
      'sales-rep': {
        bgcolor: alpha('#06b6d4', 0.12),
        color: '#0891b2',
        border: '1px solid',
        borderColor: alpha('#0891b2', 0.2),
        fontWeight: 600,
      },
      'distributor-rep': {
        bgcolor: alpha('#a855f7', 0.12),
        color: '#9333ea',
        border: '1px solid',
        borderColor: alpha('#9333ea', 0.2),
        fontWeight: 600,
      },
      'back-office': {
        bgcolor: alpha('#ec4899', 0.12),
        color: '#db2777',
        border: '1px solid',
        borderColor: alpha('#db2777', 0.2),
        fontWeight: 600,
      },
      ops: {
        bgcolor: alpha('#f59e0b', 0.12),
        color: '#d97706',
        border: '1px solid',
        borderColor: alpha('#d97706', 0.2),
        fontWeight: 600,
      },
      logistics: {
        bgcolor: alpha('#64748b', 0.12),
        color: '#475569',
        border: '1px solid',
        borderColor: alpha('#475569', 0.2),
        fontWeight: 600,
      },
    },
    // Escalation level chips
    escalation: {
      1: {
        bgcolor: alpha('#10b981', 0.12),
        color: '#059669',
        border: '1px solid',
        borderColor: alpha('#059669', 0.2),
        fontWeight: 600,
      },
      2: {
        bgcolor: alpha('#f59e0b', 0.12),
        color: '#d97706',
        border: '1px solid',
        borderColor: alpha('#d97706', 0.2),
        fontWeight: 600,
      },
      3: {
        bgcolor: alpha('#f97316', 0.12),
        color: '#ea580c',
        border: '1px solid',
        borderColor: alpha('#ea580c', 0.2),
        fontWeight: 600,
      },
      4: {
        bgcolor: alpha('#ef4444', 0.12),
        color: '#dc2626',
        border: '1px solid',
        borderColor: alpha('#dc2626', 0.2),
        fontWeight: 600,
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
        bgcolor: alpha('#06b6d4', 0.12),
        color: '#0891b2',
        border: '1px solid',
        borderColor: alpha('#0891b2', 0.2),
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
      bgcolor: alpha('#f97316', 0.08),
      border: `1px solid ${alpha('#ea580c', 0.2)}`,
    },
    economic: {
      bgcolor: alpha('#ef4444', 0.08),
      border: `1px solid ${alpha('#dc2626', 0.2)}`,
    },
    info: {
      bgcolor: alpha('#64748b', 0.05),
      border: `1px solid ${alpha('#475569', 0.15)}`,
    },
    success: {
      bgcolor: alpha('#10b981', 0.08),
      border: `1px solid ${alpha('#059669', 0.2)}`,
    },
  },

  // Helper function to get DataGrid sx props
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

  // Helper function to get Chip sx props
  getChipSx: (type, variant = 'default') => {
    const baseStyles = traxxTheme.chips[type];
    if (variant && baseStyles[variant]) {
      return baseStyles[variant];
    }
    return baseStyles;
  },

  // Format currency helper
  formatCurrency: (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(2)}`;
  },
};

export default traxxTheme;
