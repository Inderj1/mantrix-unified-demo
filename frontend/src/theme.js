import { createTheme } from '@mui/material/styles';
import { BRAND, SEMANTIC, NEUTRAL, BRAND_ALPHA } from './config/brandColors';

// MANTRIX AI Corporate Theme
// Uses centralized brand colors from config/brandColors.js
const theme = createTheme({
  palette: {
    mode: 'light',
    // Primary: MANTRIX Navy Blue
    primary: {
      main: BRAND.navy.main,
      light: BRAND.navy.light,
      dark: BRAND.navy.dark,
      contrastText: BRAND.navy.contrast,
    },
    // Secondary: Professional Grey - used sparingly
    secondary: {
      main: '#6A6D70',      // Medium grey
      light: '#89919A',     // Light grey
      dark: '#32363A',      // Dark grey
      contrastText: '#ffffff',
    },
    // Background: Clean corporate backgrounds
    background: {
      default: '#F7F7F7',   // Ultra light grey (main background)
      paper: '#FFFFFF',     // White (cards, surfaces)
    },
    // Text: Professional hierarchy
    text: {
      primary: '#32363A',   // Dark grey for main text
      secondary: '#6A6D70', // Medium grey for secondary text
      disabled: '#C7C7C7',  // Light grey for disabled
    },
    // Status colors - more muted/professional
    success: {
      main: '#107E3E',      // SAP Green (muted)
      light: '#2DA55C',
      dark: '#0A5128',
      contrastText: '#ffffff',
    },
    error: {
      main: '#BB0000',      // SAP Red (professional)
      light: '#E00000',
      dark: '#8B0000',
      contrastText: '#ffffff',
    },
    warning: {
      main: BRAND.orange.main,      // MANTRIX Orange (used sparingly)
      light: BRAND.orange.light,
      dark: BRAND.orange.dark,
      contrastText: BRAND.orange.contrast,
    },
    info: {
      main: BRAND.navy.main,
      light: BRAND.navy.light,
      dark: BRAND.navy.dark,
      contrastText: BRAND.navy.contrast,
    },
    // Dividers and borders
    divider: '#D9D9D9',
  },
  typography: {
    // SAP uses '72' font, fallback to professional sans-serif
    fontFamily: '"72", "72full", "Inter", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: '2rem',
      fontWeight: 400,
      lineHeight: 1.2,
      color: '#32363A',
      letterSpacing: '-0.01em',
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 400,
      lineHeight: 1.3,
      color: '#32363A',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 400,
      lineHeight: 1.3,
      color: '#32363A',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#32363A',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#32363A',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#32363A',
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#32363A',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#6A6D70',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: '#6A6D70',
    },
  },
  shape: {
    borderRadius: 4,  // More conservative, corporate border radius
  },
  spacing: 8,  // SAP Fiori uses 8px base spacing
  shadows: [
    'none',
    '0px 1px 3px rgba(50, 54, 58, 0.1)',    // Subtle shadow
    '0px 2px 4px rgba(50, 54, 58, 0.12)',   // Card shadow
    '0px 3px 6px rgba(50, 54, 58, 0.15)',   // Elevated
    '0px 4px 8px rgba(50, 54, 58, 0.15)',   // Modal
    '0px 5px 10px rgba(50, 54, 58, 0.15)',
    '0px 6px 12px rgba(50, 54, 58, 0.15)',
    '0px 7px 14px rgba(50, 54, 58, 0.15)',
    '0px 8px 16px rgba(50, 54, 58, 0.15)',
    '0px 9px 18px rgba(50, 54, 58, 0.15)',
    '0px 10px 20px rgba(50, 54, 58, 0.15)',
    '0px 11px 22px rgba(50, 54, 58, 0.15)',
    '0px 12px 24px rgba(50, 54, 58, 0.15)',
    '0px 13px 26px rgba(50, 54, 58, 0.15)',
    '0px 14px 28px rgba(50, 54, 58, 0.15)',
    '0px 15px 30px rgba(50, 54, 58, 0.15)',
    '0px 16px 32px rgba(50, 54, 58, 0.15)',
    '0px 17px 34px rgba(50, 54, 58, 0.15)',
    '0px 18px 36px rgba(50, 54, 58, 0.15)',
    '0px 19px 38px rgba(50, 54, 58, 0.15)',
    '0px 20px 40px rgba(50, 54, 58, 0.15)',
    '0px 21px 42px rgba(50, 54, 58, 0.15)',
    '0px 22px 44px rgba(50, 54, 58, 0.15)',
    '0px 23px 46px rgba(50, 54, 58, 0.15)',
    '0px 24px 48px rgba(50, 54, 58, 0.15)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
          padding: '6px 16px',
          fontSize: '0.875rem',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderWidth: '1px',
          borderColor: '#D9D9D9',
          '&:hover': {
            borderWidth: '1px',
            backgroundColor: BRAND_ALPHA.navy[5],
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          boxShadow: '0px 1px 3px rgba(50, 54, 58, 0.1)',
          border: '1px solid #EDEFF0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(50, 54, 58, 0.1)',
        },
        elevation2: {
          boxShadow: '0px 2px 4px rgba(50, 54, 58, 0.12)',
        },
        elevation3: {
          boxShadow: '0px 3px 6px rgba(50, 54, 58, 0.15)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#D9D9D9',
            },
            '&:hover fieldset': {
              borderColor: '#6A6D70',
            },
            '&.Mui-focused fieldset': {
              borderColor: BRAND.navy.main,
              borderWidth: '1px',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontSize: '0.75rem',
          fontWeight: 500,
        },
        outlined: {
          borderColor: '#D9D9D9',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(50, 54, 58, 0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #EDEFF0',
        },
        head: {
          fontWeight: 600,
          color: '#32363A',
          backgroundColor: '#F7F7F7',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#EDEFF0',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: BRAND_ALPHA.navy[5],
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: '#EDEFF0',
        },
      },
    },
  },
});

export default theme;
