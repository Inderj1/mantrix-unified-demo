import { alpha } from '@mui/material';

/**
 * Master Data (GL.AI / BP.AI) Theme Configuration
 * Navy blue corporate palette matching ORDLY.AI / AP.AI themes
 * Consistent with apTheme.js structure
 */

// Module accent — navy blue (same as ORDLY.AI / AP.AI / brand)
export const MODULE_NAVY = '#00357a';
export const NAVY_DARK = '#002352';
export const NAVY_BLUE = '#1976d2';
export const NAVY_DEEP = '#0d47a1';

export const masterDataTheme = {
  colors: {
    primary: {
      light: '#42a5f5',
      main: NAVY_DARK,
      dark: '#074080',
    },
    secondary: {
      light: '#64b5f6',
      main: NAVY_BLUE,
      dark: '#1565c0',
    },
    blue: {
      50: '#f0f4f8',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: MODULE_NAVY,
      600: '#1e88e5',
      700: NAVY_BLUE,
      800: '#1565c0',
      900: NAVY_DEEP,
    },
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

  // Chip styles
  chips: {
    primary: {
      bgcolor: alpha(NAVY_DARK, 0.12),
      color: NAVY_DARK,
      border: '1px solid',
      borderColor: alpha(NAVY_DARK, 0.2),
      fontWeight: 700,
    },
    confidence: {
      high: {
        bgcolor: alpha('#10b981', 0.12),
        color: '#059669',
        fontWeight: 700,
      },
      med: {
        bgcolor: alpha('#f59e0b', 0.12),
        color: '#d97706',
        fontWeight: 700,
      },
      low: {
        bgcolor: alpha('#ef4444', 0.12),
        color: '#dc2626',
        fontWeight: 700,
      },
    },
    healthStatus: {
      healthy: {
        bgcolor: alpha('#10b981', 0.12),
        color: '#059669',
        border: '1px solid',
        borderColor: alpha('#059669', 0.2),
        fontWeight: 600,
      },
      moderate: {
        bgcolor: alpha('#f59e0b', 0.12),
        color: '#d97706',
        border: '1px solid',
        borderColor: alpha('#d97706', 0.2),
        fontWeight: 600,
      },
      critical: {
        bgcolor: alpha('#ef4444', 0.12),
        color: '#dc2626',
        border: '1px solid',
        borderColor: alpha('#dc2626', 0.2),
        fontWeight: 600,
      },
    },
    mappingMethod: {
      exact: {
        bgcolor: alpha('#10b981', 0.12),
        color: '#059669',
        fontWeight: 600,
      },
      semantic: {
        bgcolor: alpha(NAVY_BLUE, 0.12),
        color: '#1565c0',
        fontWeight: 600,
      },
      manual: {
        bgcolor: alpha('#f59e0b', 0.12),
        color: '#d97706',
        fontWeight: 600,
      },
      unmapped: {
        bgcolor: alpha('#ef4444', 0.12),
        color: '#dc2626',
        fontWeight: 600,
      },
    },
    severity: {
      critical: {
        bgcolor: alpha('#ef4444', 0.12),
        color: '#dc2626',
        fontWeight: 700,
      },
      high: {
        bgcolor: alpha('#f59e0b', 0.12),
        color: '#d97706',
        fontWeight: 700,
      },
      medium: {
        bgcolor: alpha(NAVY_BLUE, 0.12),
        color: '#1565c0',
        fontWeight: 700,
      },
      low: {
        bgcolor: alpha('#64748b', 0.12),
        color: '#475569',
        fontWeight: 700,
      },
    },
    sapCode: {
      bgcolor: alpha(NAVY_BLUE, 0.1),
      color: '#1565c0',
      fontWeight: 600,
      fontSize: '0.7rem',
    },
    bpStatus: {
      auto: {
        bgcolor: alpha('#10b981', 0.12),
        color: '#059669',
        border: '1px solid',
        borderColor: alpha('#059669', 0.2),
        fontWeight: 600,
      },
      needsReview: {
        bgcolor: alpha('#f59e0b', 0.12),
        color: '#d97706',
        border: '1px solid',
        borderColor: alpha('#d97706', 0.2),
        fontWeight: 600,
      },
      mustReview: {
        bgcolor: alpha('#ef4444', 0.12),
        color: '#dc2626',
        border: '1px solid',
        borderColor: alpha('#dc2626', 0.2),
        fontWeight: 600,
      },
    },
    status: {
      approved: {
        bgcolor: alpha('#10b981', 0.12),
        color: '#059669',
        fontWeight: 600,
      },
      review: {
        bgcolor: alpha('#f59e0b', 0.12),
        color: '#d97706',
        fontWeight: 600,
      },
      proposed: {
        bgcolor: alpha(NAVY_BLUE, 0.12),
        color: '#1565c0',
        fontWeight: 600,
      },
      rejected: {
        bgcolor: alpha('#ef4444', 0.12),
        color: '#dc2626',
        fontWeight: 600,
      },
    },
  },

  // Card styles (matching ordlyTheme / apTheme)
  cards: {
    highlight: {
      bgcolor: alpha(NAVY_BLUE, 0.08),
      border: `1px solid ${alpha('#1565c0', 0.2)}`,
    },
    info: {
      bgcolor: alpha(NAVY_DARK, 0.05),
      border: `1px solid ${alpha(NAVY_DARK, 0.15)}`,
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

  // Button styles
  buttons: {
    primary: {
      bgcolor: MODULE_NAVY,
      color: '#fff',
      border: `1px solid ${alpha(MODULE_NAVY, 0.3)}`,
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 600,
      '&:hover': { bgcolor: NAVY_DARK },
    },
    secondary: {
      bgcolor: alpha(NAVY_BLUE, 0.1),
      color: '#1565c0',
      border: `1px solid ${alpha(NAVY_BLUE, 0.25)}`,
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 600,
      '&:hover': { bgcolor: alpha(NAVY_BLUE, 0.18) },
    },
    success: {
      bgcolor: alpha('#10b981', 0.15),
      color: '#059669',
      border: `1px solid ${alpha('#059669', 0.25)}`,
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 600,
      '&:hover': { bgcolor: alpha('#10b981', 0.25) },
    },
    warning: {
      bgcolor: alpha('#f59e0b', 0.1),
      color: '#d97706',
      border: `1px solid ${alpha('#d97706', 0.25)}`,
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 600,
      '&:hover': { bgcolor: alpha('#f59e0b', 0.2) },
    },
    danger: {
      bgcolor: alpha('#ef4444', 0.1),
      color: '#dc2626',
      border: `1px solid ${alpha('#dc2626', 0.25)}`,
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 600,
      '&:hover': { bgcolor: alpha('#ef4444', 0.2) },
    },
    ghost: {
      bgcolor: alpha('#64748b', 0.1),
      color: '#64748b',
      border: `1px solid ${alpha('#64748b', 0.15)}`,
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 600,
      '&:hover': { bgcolor: alpha('#64748b', 0.18) },
    },
  },

  // Tab / filter / sidebar styles
  tabs: {
    filterChip: (isActive) => ({
      bgcolor: isActive ? alpha(MODULE_NAVY, 0.12) : alpha('#64748b', 0.06),
      color: isActive ? MODULE_NAVY : '#64748b',
      border: isActive ? `1px solid ${alpha(MODULE_NAVY, 0.25)}` : '1px solid transparent',
      fontWeight: isActive ? 700 : 500,
      fontSize: '0.75rem',
      cursor: 'pointer',
    }),
    sidebarItem: (isActive, darkMode) => ({
      borderRadius: 2,
      py: 1,
      px: 1.5,
      bgcolor: isActive ? alpha(MODULE_NAVY, 0.12) : 'transparent',
      borderLeft: isActive ? `3px solid ${MODULE_NAVY}` : '3px solid transparent',
      color: isActive ? MODULE_NAVY : undefined,
      '&:hover': { bgcolor: alpha(MODULE_NAVY, 0.06) },
      '&.Mui-selected': {
        bgcolor: alpha(MODULE_NAVY, 0.12),
        color: MODULE_NAVY,
        '&:hover': { bgcolor: alpha(MODULE_NAVY, 0.15) },
      },
    }),
  },

  // Border helpers
  borders: {
    card: (darkMode) => `1px solid ${darkMode ? '#30363d' : '#e2e8f0'}`,
    subtle: (darkMode) => `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
  },

  // DataGrid styles — matching apTheme / ordlyTheme exactly
  getDataGridSx: (options = {}) => {
    const { darkMode = false, clickable = false } = options;
    return {
      bgcolor: darkMode ? '#161b22' : undefined,
      border: darkMode ? '1px solid #30363d' : '1px solid #e2e8f0',
      borderRadius: 2,
      '& .MuiDataGrid-cell': {
        fontSize: '0.8rem',
        color: darkMode ? '#e6edf3' : '#1e293b',
      },
      '& .MuiDataGrid-columnHeaders': {
        backgroundColor: darkMode ? '#21262d' : '#f0f4f8',
        color: darkMode ? '#e6edf3' : NAVY_DEEP,
        fontSize: '0.85rem',
        fontWeight: 700,
        borderBottom: darkMode ? '2px solid #42a5f5' : `2px solid ${NAVY_BLUE}`,
      },
      '& .MuiDataGrid-row': {
        ...(clickable && {
          cursor: 'pointer',
          '&:hover': {
            bgcolor: darkMode ? '#21262d' : alpha(NAVY_BLUE, 0.12),
          },
        }),
        ...(!clickable && {
          '&:hover': {
            bgcolor: darkMode ? alpha('#42a5f5', 0.08) : alpha(NAVY_BLUE, 0.08),
          },
        }),
      },
      '& .MuiDataGrid-cell:focus': { outline: 'none' },
      '& .MuiDataGrid-row:focus': { outline: 'none' },
      '& .MuiDataGrid-footerContainer': {
        backgroundColor: darkMode ? '#161b22' : undefined,
        color: darkMode ? '#8b949e' : undefined,
        borderTop: '1px solid #e2e8f0',
      },
      '& .MuiTablePagination-root': {
        color: darkMode ? '#8b949e' : undefined,
      },
    };
  },

  formatCurrency: (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(2)}`;
  },
};

export default masterDataTheme;
