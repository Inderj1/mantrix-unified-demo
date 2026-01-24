import { createTheme } from '@mui/material/styles';

// MANTRIX AI Color Palette
const sapColors = {
  // Primary Blues - MANTRIX Navy
  sapBlue: '#00357a',
  sapDarkBlue: '#002352',
  sapLightBlue: '#1a5a9e',

  // Semantic Colors
  sapPositive: '#107e3e',
  sapCritical: '#ff751f',  // MANTRIX Orange
  sapNegative: '#bb0000',
  sapInformation: '#00357a',
  sapNeutral: '#6a6d70',
  
  // Shell Colors
  sapShellHeader: '#00357a',  // MANTRIX Navy
  sapShellNavigation: '#fff',

  // Background Colors
  sapBackgroundLight: '#f7f7f7',
  sapBackgroundMedium: '#eff1f2',
  sapBackgroundDark: '#edeff0',

  // Text Colors
  sapTextColor: '#32363a',
  sapTextColorLight: '#6a6d70',
  sapTextColorInverted: '#fff',

  // Chart Colors - MANTRIX Navy palette
  sapChart1: '#00357a', // Primary navy
  sapChart2: '#1a5a9e', // Light navy
  sapChart3: '#ff751f', // Orange accent
  sapChart4: '#002352', // Dark navy
  sapChart5: '#4d7ba8', // Blue-grey
  sapChart6: '#6a6d70', // Medium grey
  sapChart7: '#89919a', // Light grey
  sapChart8: '#32363a', // Charcoal
  sapChart9: '#a9aeb3', // Silver grey
  sapChart10: '#5f7d99', // Slate blue
};

// SAP Typography
const sapTypography = {
  fontFamily: '"Segoe UI", "72", "72full", Arial, Helvetica, sans-serif',
  fontSize: 14,
  
  // Headers - more compact
  h1: {
    fontSize: '1.75rem', // 28px
    fontWeight: 400,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '1.5rem', // 24px
    fontWeight: 400,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.25rem', // 20px
    fontWeight: 400,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.125rem', // 18px
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1rem', // 16px
    fontWeight: 500,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '0.938rem', // 15px
    fontWeight: 600,
    lineHeight: 1.5,
  },
  
  // Body
  body1: {
    fontSize: '0.875rem', // 14px
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.8125rem', // 13px
    lineHeight: 1.6,
  },
  
  // Other
  button: {
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'none', // SAP doesn't use uppercase buttons
  },
  caption: {
    fontSize: '0.75rem', // 12px
    lineHeight: 1.5,
  },
};

// Create SAP Fiori Theme
export const sapFioriTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: sapColors.sapBlue,
      dark: sapColors.sapDarkBlue,
      light: sapColors.sapLightBlue,
      contrastText: '#fff',
    },
    secondary: {
      main: sapColors.sapNeutral,
      contrastText: '#fff',
    },
    success: {
      main: sapColors.sapPositive,
      contrastText: '#fff',
    },
    warning: {
      main: sapColors.sapCritical,
      contrastText: '#fff',
    },
    error: {
      main: sapColors.sapNegative,
      contrastText: '#fff',
    },
    info: {
      main: sapColors.sapInformation,
      contrastText: '#fff',
    },
    background: {
      default: sapColors.sapBackgroundLight,
      paper: '#fff',
    },
    text: {
      primary: sapColors.sapTextColor,
      secondary: sapColors.sapTextColorLight,
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  
  typography: sapTypography,

  spacing: 4, // Base spacing unit (4px) - more compact

  shape: {
    borderRadius: 4, // SAP uses subtle rounded corners
  },
  
  components: {
    // App Bar (Header)
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: sapColors.sapShellHeader,
          boxShadow: '0 1px 0 0 rgba(0,0,0,0.15)',
        },
      },
    },
    
    // Buttons
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: '6px 12px',
          boxShadow: 'none',
          fontSize: '0.813rem',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            backgroundColor: sapColors.sapDarkBlue,
          },
        },
        outlined: {
          borderWidth: 1,
          '&:hover': {
            borderWidth: 1,
          },
        },
      },
    },
    
    // Cards
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 0 0 1px rgba(0,0,0,0.15), 0 10px 40px -10px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    
    // Paper
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
        },
        elevation1: {
          boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
        },
        elevation2: {
          boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 10px 40px -10px rgba(0,0,0,0.15)',
        },
      },
    },
    
    // Text Fields
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(0,0,0,0.23)',
            },
            '&:hover fieldset': {
              borderColor: sapColors.sapBlue,
            },
          },
        },
      },
    },
    
    // Tabs
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0,0,0,0.12)',
        },
        indicator: {
          height: 3,
          backgroundColor: sapColors.sapBlue,
        },
      },
    },
    
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 400,
          '&.Mui-selected': {
            fontWeight: 600,
          },
        },
      },
    },
    
    // List Items
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 53, 122, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 53, 122, 0.12)',
            borderLeft: `3px solid ${sapColors.sapBlue}`,
            '&:hover': {
              backgroundColor: 'rgba(0, 53, 122, 0.16)',
            },
          },
        },
      },
    },
    
    // Chips
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 400,
          height: 24,
          fontSize: '0.75rem',
        },
      },
    },

    // Card Content
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 12,
          '&:last-child': {
            paddingBottom: 12,
          },
        },
      },
    },

    // Table
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '8px 12px',
          fontSize: '0.813rem',
        },
        head: {
          fontWeight: 600,
          backgroundColor: sapColors.sapBackgroundMedium,
        },
      },
    },
    
    // Drawer
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: sapColors.sapShellNavigation,
          borderRight: '1px solid rgba(0,0,0,0.12)',
        },
      },
    },
    
    // Alert
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
        standardSuccess: {
          backgroundColor: 'rgba(16, 126, 62, 0.1)',
          color: sapColors.sapPositive,
        },
        standardError: {
          backgroundColor: 'rgba(187, 0, 0, 0.1)',
          color: sapColors.sapNegative,
        },
        standardWarning: {
          backgroundColor: 'rgba(223, 110, 12, 0.1)',
          color: sapColors.sapCritical,
        },
        standardInfo: {
          backgroundColor: 'rgba(0, 53, 122, 0.1)',
          color: sapColors.sapInformation,
        },
      },
    },
  },
});

// Export color palette for charts
export const sapChartColors = [
  sapColors.sapChart1,
  sapColors.sapChart2,
  sapColors.sapChart3,
  sapColors.sapChart4,
  sapColors.sapChart5,
  sapColors.sapChart6,
  sapColors.sapChart7,
  sapColors.sapChart8,
  sapColors.sapChart9,
  sapColors.sapChart10,
];

// Export individual colors for custom usage
export { sapColors };