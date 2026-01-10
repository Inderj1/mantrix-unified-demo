import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create Theme Context
const ThemeContext = createContext({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

// Custom hook for using theme context
export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};

// SAP Fiori inspired color palette
const lightPalette = {
  mode: 'light',
  primary: {
    main: '#0A6ED1',
    light: '#1A85E5',
    dark: '#0854A0',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#354A5F',
    light: '#475E75',
    dark: '#223548',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#BB0000',
    light: '#E52929',
    dark: '#8A0000',
  },
  warning: {
    main: '#E78C07',
    light: '#F5A623',
    dark: '#C77600',
  },
  info: {
    main: '#0A6ED1',
    light: '#1A85E5',
    dark: '#0854A0',
  },
  success: {
    main: '#107E3E',
    light: '#13A052',
    dark: '#0A5C2E',
  },
  background: {
    default: '#F5F6F7',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#32363A',
    secondary: '#6A6D70',
    disabled: '#A9ABAD',
  },
  divider: '#E5E5E5',
};

const darkPalette = {
  mode: 'dark',
  primary: {
    main: '#4DA6FF',
    light: '#7BBFFF',
    dark: '#2D8CE6',
    contrastText: '#000000',
  },
  secondary: {
    main: '#8B949E',
    light: '#A8B2BD',
    dark: '#6E7681',
    contrastText: '#000000',
  },
  error: {
    main: '#FF6B6B',
    light: '#FF8A8A',
    dark: '#E54545',
  },
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
  },
  info: {
    main: '#4DA6FF',
    light: '#7BBFFF',
    dark: '#2D8CE6',
  },
  success: {
    main: '#36D068',
    light: '#5ADB84',
    dark: '#22B855',
  },
  background: {
    default: '#0D1117',
    paper: '#161B22',
  },
  text: {
    primary: '#E6EDF3',
    secondary: '#8B949E',
    disabled: '#484F58',
  },
  divider: '#30363D',
};

// Create theme function
const createAppTheme = (isDarkMode) => {
  const palette = isDarkMode ? darkPalette : lightPalette;

  return createTheme({
    palette,
    typography: {
      fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      h1: { fontWeight: 600, fontSize: '2.5rem' },
      h2: { fontWeight: 600, fontSize: '2rem' },
      h3: { fontWeight: 600, fontSize: '1.75rem' },
      h4: { fontWeight: 600, fontSize: '1.5rem' },
      h5: { fontWeight: 600, fontSize: '1.25rem' },
      h6: { fontWeight: 600, fontSize: '1rem' },
      subtitle1: { fontWeight: 500, fontSize: '1rem' },
      subtitle2: { fontWeight: 500, fontSize: '0.875rem' },
      body1: { fontSize: '0.875rem' },
      body2: { fontSize: '0.8125rem' },
      button: { textTransform: 'none', fontWeight: 500 },
      caption: { fontSize: '0.75rem' },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: palette.background.default,
            color: palette.text.primary,
            transition: 'background-color 0.3s ease, color 0.3s ease',
          },
          // Override hardcoded white backgrounds in dark mode
          ...(isDarkMode && {
            '.MuiPaper-root, .MuiCard-root, .MuiDialog-paper, .MuiMenu-paper, .MuiPopover-paper, .MuiAccordion-root': {
              backgroundColor: `${palette.background.paper} !important`,
            },
            // Fix hardcoded white backgrounds in inline styles
            '[style*="background: white"], [style*="background-color: white"], [style*="background:#fff"], [style*="background-color:#fff"], [style*="background: #fff"], [style*="background-color: #fff"]': {
              backgroundColor: `${palette.background.paper} !important`,
            },
          }),
          '*::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '*::-webkit-scrollbar-track': {
            background: isDarkMode ? '#21262D' : '#F1F1F1',
          },
          '*::-webkit-scrollbar-thumb': {
            background: isDarkMode ? '#484F58' : '#C1C1C1',
            borderRadius: '4px',
          },
          '*::-webkit-scrollbar-thumb:hover': {
            background: isDarkMode ? '#6E7681' : '#A8A8A8',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            textTransform: 'none',
            fontWeight: 500,
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: palette.background.paper,
            boxShadow: isDarkMode
              ? '0 1px 3px rgba(0,0,0,0.3)'
              : '0 1px 3px rgba(0,0,0,0.08)',
            border: `1px solid ${palette.divider}`,
            transition: 'background-color 0.3s ease, border-color 0.3s ease',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: palette.background.paper,
            transition: 'background-color 0.3s ease',
          },
          elevation0: {
            boxShadow: 'none',
          },
          elevation1: {
            boxShadow: isDarkMode
              ? '0 1px 3px rgba(0,0,0,0.3)'
              : '0 1px 3px rgba(0,0,0,0.08)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? '#161B22' : '#FFFFFF',
            color: palette.text.primary,
            boxShadow: `0 1px 0 ${palette.divider}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: palette.background.paper,
            borderRight: `1px solid ${palette.divider}`,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: isDarkMode ? '#0D1117' : '#FFFFFF',
              '& fieldset': {
                borderColor: palette.divider,
              },
              '&:hover fieldset': {
                borderColor: palette.primary.main,
              },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? '#0D1117' : '#FFFFFF',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${palette.divider}`,
          },
          head: {
            backgroundColor: isDarkMode ? '#21262D' : '#F5F6F7',
            fontWeight: 600,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: isDarkMode ? '#21262D' : '#F5F6F7',
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: palette.background.paper,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: palette.background.paper,
            border: `1px solid ${palette.divider}`,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: isDarkMode ? '#21262D' : '#F5F6F7',
            },
            '&.Mui-selected': {
              backgroundColor: isDarkMode ? '#1F6FEB20' : '#0A6ED110',
              '&:hover': {
                backgroundColor: isDarkMode ? '#1F6FEB30' : '#0A6ED120',
              },
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${palette.divider}`,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: `1px solid ${palette.divider}`,
            backgroundColor: palette.background.paper,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: isDarkMode ? '#21262D' : '#F5F6F7',
              borderBottom: `1px solid ${palette.divider}`,
            },
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${palette.divider}`,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: isDarkMode ? '#21262D' : '#F5F6F7',
            },
          },
        },
      },
    },
  });
};

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  // Initialize from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      return stored === 'true';
    }
    // Check system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const stored = localStorage.getItem('darkMode');
      // Only update if user hasn't manually set preference
      if (stored === null) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Memoize theme to prevent unnecessary re-renders
  const theme = useMemo(() => createAppTheme(isDarkMode), [isDarkMode]);

  const contextValue = useMemo(() => ({
    isDarkMode,
    toggleDarkMode,
  }), [isDarkMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
