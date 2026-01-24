/**
 * MANTRIX AI - Centralized Brand Colors Configuration
 *
 * This file contains all brand colors for the application.
 * Import this file in any component that needs brand colors.
 *
 * Primary: Navy Blue (#00357a)
 * Accent: Orange (#ff751f) - used sparingly
 */

// ============================================
// CORE BRAND COLORS
// ============================================
export const BRAND = {
  // Primary Navy Blue palette
  navy: {
    main: '#00357a',
    light: '#1a5a9e',
    dark: '#002352',
    contrast: '#ffffff',
  },
  // Accent Orange palette (use sparingly)
  orange: {
    main: '#ff751f',
    light: '#ff9a54',
    dark: '#cc5c19',
    contrast: '#ffffff',
  },
};

// ============================================
// MODULE COLOR (consistent across all tiles)
// ============================================
export const MODULE_COLOR = BRAND.navy.main;

// ============================================
// SEMANTIC COLORS
// ============================================
export const SEMANTIC = {
  success: {
    main: '#10b981',
    light: '#36d068',
    dark: '#059669',
  },
  error: {
    main: '#ef4444',
    light: '#ff6b6b',
    dark: '#dc2626',
  },
  warning: {
    main: BRAND.orange.main,  // Using brand orange for warnings
    light: BRAND.orange.light,
    dark: BRAND.orange.dark,
  },
  info: {
    main: BRAND.navy.main,
    light: BRAND.navy.light,
    dark: BRAND.navy.dark,
  },
};

// ============================================
// NEUTRAL COLORS
// ============================================
export const NEUTRAL = {
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    disabled: '#94a3b8',
  },
  background: {
    default: '#f8fbfd',
    paper: '#ffffff',
    card: '#ffffff',
  },
  border: {
    light: 'rgba(0,0,0,0.08)',
    medium: 'rgba(0,0,0,0.12)',
    dark: 'rgba(0,0,0,0.23)',
  },
  grey: {
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
};

// ============================================
// DARK MODE COLORS
// ============================================
export const DARK_MODE = {
  text: {
    primary: '#e6edf3',
    secondary: '#8b949e',
    disabled: '#6e7781',
  },
  background: {
    default: '#0d1117',
    paper: '#161b22',
    card: '#21262d',
  },
  border: {
    light: 'rgba(255,255,255,0.1)',
    medium: 'rgba(255,255,255,0.15)',
    dark: 'rgba(255,255,255,0.2)',
  },
  // Adjusted brand colors for dark mode visibility
  navy: {
    main: '#4d9eff',
    light: '#6baeff',
    dark: '#3a8ae6',
  },
  orange: {
    main: '#ff9a54',
    light: '#ffb380',
    dark: '#ff751f',
  },
};

// ============================================
// CHART COLORS
// ============================================
export const CHART_COLORS = [
  BRAND.navy.main,      // Primary navy
  BRAND.navy.light,     // Light navy
  BRAND.orange.main,    // Orange accent
  BRAND.navy.dark,      // Dark navy
  '#4d7ba8',            // Blue-grey
  '#6a6d70',            // Medium grey
  '#89919a',            // Light grey
  '#32363a',            // Charcoal
  '#a9aeb3',            // Silver grey
  '#5f7d99',            // Slate blue
];

// ============================================
// HELPER FUNCTION: getColors(darkMode)
// Returns appropriate colors based on dark mode state
// ============================================
export const getColors = (darkMode = false) => ({
  primary: darkMode ? DARK_MODE.navy.main : BRAND.navy.main,
  secondary: darkMode ? DARK_MODE.navy.dark : BRAND.navy.dark,
  accent: darkMode ? DARK_MODE.orange.main : BRAND.orange.main,
  success: darkMode ? SEMANTIC.success.light : SEMANTIC.success.main,
  warning: darkMode ? DARK_MODE.orange.main : BRAND.orange.main,
  error: darkMode ? SEMANTIC.error.light : SEMANTIC.error.main,
  text: darkMode ? DARK_MODE.text.primary : NEUTRAL.text.primary,
  textSecondary: darkMode ? DARK_MODE.text.secondary : NEUTRAL.text.secondary,
  grey: darkMode ? DARK_MODE.text.secondary : NEUTRAL.text.secondary,
  background: darkMode ? DARK_MODE.background.default : NEUTRAL.background.default,
  paper: darkMode ? DARK_MODE.background.paper : NEUTRAL.background.paper,
  cardBg: darkMode ? DARK_MODE.background.card : NEUTRAL.background.card,
  border: darkMode ? DARK_MODE.border.light : NEUTRAL.border.light,
});

// ============================================
// CHIP STYLES (for DataGrid and other components)
// ============================================
export const CHIP_STYLES = {
  primary: {
    bgcolor: `rgba(0, 53, 122, 0.12)`,
    color: BRAND.navy.main,
    borderColor: `rgba(0, 53, 122, 0.2)`,
  },
  success: {
    bgcolor: `rgba(16, 185, 129, 0.12)`,
    color: SEMANTIC.success.dark,
    borderColor: `rgba(5, 150, 105, 0.2)`,
  },
  warning: {
    bgcolor: `rgba(255, 117, 31, 0.12)`,
    color: BRAND.orange.dark,
    borderColor: `rgba(204, 92, 25, 0.2)`,
  },
  error: {
    bgcolor: `rgba(239, 68, 68, 0.12)`,
    color: SEMANTIC.error.dark,
    borderColor: `rgba(220, 38, 38, 0.2)`,
  },
  info: {
    bgcolor: `rgba(0, 53, 122, 0.12)`,
    color: BRAND.navy.main,
    borderColor: `rgba(0, 53, 122, 0.2)`,
  },
};

// ============================================
// STATUS COLORS (for badges, indicators)
// ============================================
export const STATUS_COLORS = {
  active: SEMANTIC.success.main,
  inactive: NEUTRAL.grey[400],
  pending: BRAND.orange.main,
  processing: BRAND.navy.main,
  completed: SEMANTIC.success.main,
  failed: SEMANTIC.error.main,
  warning: BRAND.orange.main,
  critical: SEMANTIC.error.main,
  high: BRAND.orange.main,
  medium: BRAND.navy.light,
  low: NEUTRAL.grey[500],
};

// ============================================
// GRADIENT PRESETS
// ============================================
export const GRADIENTS = {
  navyToLight: `linear-gradient(135deg, ${BRAND.navy.main} 0%, ${BRAND.navy.light} 100%)`,
  navyToDark: `linear-gradient(135deg, ${BRAND.navy.light} 0%, ${BRAND.navy.dark} 100%)`,
  orangeToLight: `linear-gradient(135deg, ${BRAND.orange.main} 0%, ${BRAND.orange.light} 100%)`,
  navySubtle: `linear-gradient(135deg, rgba(0, 53, 122, 0.1) 0%, rgba(0, 53, 122, 0.05) 100%)`,
  orangeSubtle: `linear-gradient(135deg, rgba(255, 117, 31, 0.1) 0%, rgba(255, 117, 31, 0.05) 100%)`,
};

// ============================================
// ALPHA HELPERS (for transparency)
// ============================================
export const alpha = (color, opacity) => {
  // Simple alpha function for hex colors
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Pre-computed alpha values for common use cases
export const BRAND_ALPHA = {
  navy: {
    5: 'rgba(0, 53, 122, 0.05)',
    8: 'rgba(0, 53, 122, 0.08)',
    10: 'rgba(0, 53, 122, 0.1)',
    12: 'rgba(0, 53, 122, 0.12)',
    15: 'rgba(0, 53, 122, 0.15)',
    20: 'rgba(0, 53, 122, 0.2)',
  },
  orange: {
    5: 'rgba(255, 117, 31, 0.05)',
    8: 'rgba(255, 117, 31, 0.08)',
    10: 'rgba(255, 117, 31, 0.1)',
    12: 'rgba(255, 117, 31, 0.12)',
    15: 'rgba(255, 117, 31, 0.15)',
    20: 'rgba(255, 117, 31, 0.2)',
  },
};

// Default export for convenience
export default {
  BRAND,
  MODULE_COLOR,
  SEMANTIC,
  NEUTRAL,
  DARK_MODE,
  CHART_COLORS,
  CHIP_STYLES,
  STATUS_COLORS,
  GRADIENTS,
  BRAND_ALPHA,
  getColors,
  alpha,
};
