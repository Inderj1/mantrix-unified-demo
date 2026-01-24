import { alpha } from '@mui/material';

/**
 * Standardized STOX.AI Theme Configuration
 * Uses MANTRIX brand colors: Navy Blue (#00357a) + Orange (#ff751f)
 */

// Brand color constants
const NAVY = '#00357a';
const NAVY_LIGHT = '#1a5a9e';
const NAVY_DARK = '#002352';
const ORANGE = '#ff751f';

export const stoxTheme = {
  // Color Palette
  colors: {
    // Primary neutrals
    slate: {
      50: '#f8fafc',
      400: '#94a3b8',
      500: '#64748b',
      600: NAVY,
      700: '#334155',
      900: '#1e293b',
    },
    // Accent colors - MANTRIX Navy palette
    sky: {
      400: NAVY_LIGHT,
      500: NAVY,
      600: NAVY_DARK,
    },
    orange: {
      500: ORANGE,
      600: '#cc5c19',
    },
    purple: {
      500: '#a855f7',
      600: NAVY,
    },
    cyan: {
      500: '#06b6d4',
      600: '#0891b2',
    },
    // Status colors
    emerald: {
      500: '#10b981',
      600: '#059669',
    },
    red: {
      500: '#ef4444',
      600: '#dc2626',
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
      bgcolor: alpha(NAVY, 0.12),
      color: NAVY,
      border: '1px solid',
      borderColor: alpha(NAVY, 0.2),
      fontWeight: 700,
    },
    // Forecast/Metric chips
    forecast: {
      bgcolor: alpha('#0ea5e9', 0.12),
      color: '#0284c7',
      border: '1px solid',
      borderColor: alpha('#0284c7', 0.2),
      fontWeight: 700,
    },
    // Channel chips
    channels: {
      retail: {
        bgcolor: alpha('#0ea5e9', 0.12),
        color: '#0284c7',
        border: '1px solid',
        borderColor: alpha('#0284c7', 0.2),
        fontWeight: 600,
      },
      amazon: {
        bgcolor: alpha('#f97316', 0.12),
        color: '#ea580c',
        border: '1px solid',
        borderColor: alpha('#ea580c', 0.2),
        fontWeight: 600,
      },
      wholesale: {
        bgcolor: alpha('#a855f7', 0.12),
        color: NAVY,
        border: '1px solid',
        borderColor: alpha(NAVY, 0.2),
        fontWeight: 600,
      },
      d2c: {
        bgcolor: alpha('#06b6d4', 0.12),
        color: '#0891b2',
        border: '1px solid',
        borderColor: alpha('#0891b2', 0.2),
        fontWeight: 600,
      },
    },
    // Status chips
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
        bgcolor: alpha('#0ea5e9', 0.12),
        color: '#0284c7',
        border: '1px solid',
        borderColor: alpha('#0284c7', 0.2),
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
    lineageTracker: {
      bgcolor: alpha('#0ea5e9', 0.08),
      border: `1px solid ${alpha('#0284c7', 0.2)}`,
    },
    info: {
      bgcolor: alpha('#64748b', 0.05),
      border: `1px solid ${alpha(NAVY, 0.15)}`,
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
    const baseStyles = stoxTheme.chips[type];
    if (variant && baseStyles[variant]) {
      return baseStyles[variant];
    }
    return baseStyles;
  },
};

export default stoxTheme;
