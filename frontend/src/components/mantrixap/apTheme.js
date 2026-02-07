import { alpha } from '@mui/material';

/**
 * MANTRIX AP Theme Configuration
 * Navy blue corporate palette matching ORDLY.AI theme
 * Consistent with ordlyTheme.js structure
 */

// Module accent — navy blue (same as ORDLY.AI / brand)
export const MODULE_NAVY = '#00357a';
export const NAVY_DARK = '#002352';
export const NAVY_BLUE = '#1976d2';
export const NAVY_DEEP = '#0d47a1';

export const apTheme = {
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
  },

  // Role badge styles — navy for AI, orange for human (brand colors)
  roles: {
    ai: {
      bgcolor: alpha(NAVY_DARK, 0.12),
      color: NAVY_DARK,
      border: '1px solid',
      borderColor: alpha(NAVY_DARK, 0.2),
    },
    human: {
      bgcolor: alpha('#ff751f', 0.12),
      color: '#e5600a',
      border: '1px solid',
      borderColor: alpha('#ff751f', 0.2),
    },
  },

  // Chip styles
  chips: {
    // Primary navy chip
    primary: {
      bgcolor: alpha(NAVY_DARK, 0.12),
      color: NAVY_DARK,
      border: '1px solid',
      borderColor: alpha(NAVY_DARK, 0.2),
      fontWeight: 700,
    },
    // Invoice status chips — functional colors
    invoiceStatus: {
      matched: {
        bgcolor: alpha('#10b981', 0.12),
        color: '#059669',
        border: '1px solid',
        borderColor: alpha('#059669', 0.2),
        fontWeight: 600,
      },
      ready: {
        bgcolor: alpha('#10b981', 0.12),
        color: '#059669',
        border: '1px solid',
        borderColor: alpha('#059669', 0.2),
        fontWeight: 600,
      },
      review: {
        bgcolor: alpha('#f59e0b', 0.12),
        color: '#d97706',
        border: '1px solid',
        borderColor: alpha('#d97706', 0.2),
        fontWeight: 600,
      },
      exception: {
        bgcolor: alpha('#ef4444', 0.12),
        color: '#dc2626',
        border: '1px solid',
        borderColor: alpha('#dc2626', 0.2),
        fontWeight: 600,
      },
      parked: {
        bgcolor: alpha('#64748b', 0.12),
        color: '#475569',
        border: '1px solid',
        borderColor: alpha('#64748b', 0.2),
        fontWeight: 600,
      },
      posted: {
        bgcolor: alpha('#10b981', 0.12),
        color: '#059669',
        border: '1px solid',
        borderColor: alpha('#059669', 0.2),
        fontWeight: 600,
      },
      routed: {
        bgcolor: alpha(NAVY_BLUE, 0.12),
        color: '#1565c0',
        border: '1px solid',
        borderColor: alpha('#1565c0', 0.2),
        fontWeight: 600,
      },
      rejected: {
        bgcolor: alpha('#ef4444', 0.12),
        color: '#dc2626',
        border: '1px solid',
        borderColor: alpha('#dc2626', 0.2),
        fontWeight: 600,
      },
      updated: {
        bgcolor: alpha(NAVY_BLUE, 0.12),
        color: '#1565c0',
        border: '1px solid',
        borderColor: alpha('#1565c0', 0.2),
        fontWeight: 600,
      },
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
    exceptionType: {
      'price-contract': { bgcolor: alpha('#fbbf24', 0.15), color: '#d97706' },
      'price-po': { bgcolor: alpha('#fbbf24', 0.15), color: '#d97706' },
      'qty-gr-pending': { bgcolor: alpha(NAVY_BLUE, 0.15), color: '#1565c0' },
      'qty-partial': { bgcolor: alpha(NAVY_BLUE, 0.15), color: '#1565c0' },
      'master-data': { bgcolor: alpha('#ef4444', 0.15), color: '#dc2626' },
      duplicate: { bgcolor: alpha(NAVY_DARK, 0.15), color: NAVY_DARK },
      policy: { bgcolor: alpha('#ef4444', 0.2), color: '#dc2626' },
    },
    sapCode: {
      bgcolor: alpha(NAVY_BLUE, 0.1),
      color: '#1565c0',
      fontWeight: 600,
      fontSize: '0.7rem',
    },
    sapAction: {
      miro: { bgcolor: alpha(NAVY_BLUE, 0.15), color: '#1565c0', fontWeight: 600 },
      fb60: { bgcolor: alpha(NAVY_DARK, 0.15), color: NAVY_DARK, fontWeight: 600 },
    },
    // Line-item matching engine chips
    matchStrategy: {
      'key-based':       { bgcolor: alpha(NAVY_DARK, 0.12), color: NAVY_DARK, fontWeight: 600 },
      'vendor-material': { bgcolor: alpha('#7c3aed', 0.12), color: '#7c3aed', fontWeight: 600 },
      'semantic':        { bgcolor: alpha('#0891b2', 0.12), color: '#0891b2', fontWeight: 600 },
      'qty-price':       { bgcolor: alpha('#d97706', 0.12), color: '#d97706', fontWeight: 600 },
      'gr-xref':         { bgcolor: alpha('#059669', 0.12), color: '#059669', fontWeight: 600 },
      'elimination':     { bgcolor: alpha('#64748b', 0.12), color: '#64748b', fontWeight: 600 },
    },
    guardrail: {
      hard:  { bgcolor: alpha('#ef4444', 0.12), color: '#dc2626', fontWeight: 600 },
      soft:  { bgcolor: alpha('#f59e0b', 0.12), color: '#d97706', fontWeight: 600 },
      audit: { bgcolor: alpha(NAVY_BLUE, 0.12), color: '#1565c0', fontWeight: 600 },
    },
    lineMatch: {
      matched:   { bgcolor: alpha('#10b981', 0.12), color: '#059669', fontWeight: 600 },
      partial:   { bgcolor: alpha('#f59e0b', 0.12), color: '#d97706', fontWeight: 600 },
      exception: { bgcolor: alpha('#ef4444', 0.12), color: '#dc2626', fontWeight: 600 },
      unmatched: { bgcolor: alpha('#64748b', 0.12), color: '#64748b', fontWeight: 600 },
      unplanned: { bgcolor: alpha('#7c3aed', 0.12), color: '#7c3aed', fontWeight: 600 },
    },
  },

  // Card styles (matching ordlyTheme)
  cards: {
    highlight: {
      bgcolor: alpha(NAVY_BLUE, 0.08),
      border: `1px solid ${alpha('#1565c0', 0.2)}`,
    },
    info: {
      bgcolor: alpha(NAVY_DARK, 0.05),
      border: `1px solid ${alpha(NAVY_DARK, 0.15)}`,
    },
  },

  // DataGrid styles — matching ordlyTheme exactly
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

export default apTheme;
