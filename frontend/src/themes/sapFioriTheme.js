import { createTheme } from '@mui/material/styles';

// SAP Fiori 3 Color Palette
const sapColors = {
  // Primary Blues
  sapBlue: '#0a6ed1',
  sapDarkBlue: '#0854a0',
  sapLightBlue: '#1873b4',
  
  // Semantic Colors
  sapPositive: '#107e3e',
  sapCritical: '#df6e0c',
  sapNegative: '#bb0000',
  sapInformation: '#0a6ed1',
  sapNeutral: '#6a6d70',
  
  // Shell Colors
  sapShellHeader: '#354a5f',
  sapShellNavigation: '#fff',
  
  // Background Colors
  sapBackgroundLight: '#f7f7f7',
  sapBackgroundMedium: '#eff1f2',
  sapBackgroundDark: '#edeff0',
  
  // Text Colors
  sapTextColor: '#32363a',
  sapTextColorLight: '#6a6d70',
  sapTextColorInverted: '#fff',
  
  // Chart Colors (for AI dashboards)
  sapChart1: '#5899da',
  sapChart2: '#e8743b',
  sapChart3: '#19a979',
  sapChart4: '#ed4a7b',
  sapChart5: '#945ecf',
  sapChart6: '#13a4b4',
  sapChart7: '#525df4',
  sapChart8: '#bf3989',
  sapChart9: '#6c8893',
  sapChart10: '#ee6868',
};

// SAP Typography
const sapTypography = {
  fontFamily: '"Poppins", "72", "72full", Arial, Helvetica, sans-serif',
  fontSize: 14,
  
  // Headers
  h1: {
    fontSize: '2.25rem', // 36px
    fontWeight: 300,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '1.875rem', // 30px
    fontWeight: 300,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.5rem', // 24px
    fontWeight: 400,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.25rem', // 20px
    fontWeight: 400,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.125rem', // 18px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1rem', // 16px
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
  
  spacing: 4, // Base spacing unit (4px)
  
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
          padding: '8px 16px',
          boxShadow: 'none',
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
            backgroundColor: 'rgba(10, 110, 209, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(10, 110, 209, 0.12)',
            borderLeft: `3px solid ${sapColors.sapBlue}`,
            '&:hover': {
              backgroundColor: 'rgba(10, 110, 209, 0.16)',
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
          backgroundColor: 'rgba(10, 110, 209, 0.1)',
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