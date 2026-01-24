import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  InputAdornment,
  Chip,
  Divider,
  alpha,
  IconButton,
  Popper,
  Fade,
  ClickAwayListener,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ArrowForward as ArrowIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  Hub as HubIcon,
  TrendingUp as TrendingIcon,
  Inventory as InventoryIcon,
  Science as ScienceIcon,
  Dashboard as DashboardIcon,
  AutoAwesome as AIIcon,
  TableChart as TableIcon,
  Map as MapIcon,
  ShowChart as ChartIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';

// Comprehensive searchable index of all platform content
const searchableItems = [
  // CORE.AI items
  {
    id: 'core-ai',
    title: 'CORE.AI',
    subtitle: 'Operational Intelligence Suite',
    path: ['CORE.AI'],
    icon: <AnalyticsIcon />,
    color: '#4285F4',
    tags: ['operational', 'intelligence', 'core', 'analytics'],
    action: { type: 'navigate', tabId: 1 },
  },
  {
    id: 'margen-ai',
    title: 'MARGEN.AI',
    subtitle: 'Margin Analytics & Revenue Intelligence',
    path: ['CORE.AI', 'MARGEN.AI'],
    icon: <TrendingIcon />,
    color: '#1976d2',
    tags: ['margin', 'financial', 'revenue', 'cost', 'analytics', 'profitability'],
    action: { type: 'navigate', tabId: 1, view: 'margen' },
  },
  {
    id: 'stox-ai',
    title: 'STOX.AI',
    subtitle: 'Smart Inventory Optimization',
    path: ['CORE.AI', 'STOX.AI'],
    icon: <InventoryIcon />,
    color: '#2e7d32',
    tags: ['inventory', 'supply', 'chain', 'stock', 'optimization', 'demand'],
    action: { type: 'navigate', tabId: 1, view: 'stox' },
  },
  {
    id: 'route-ai',
    title: 'ROUTE.AI',
    subtitle: 'Fleet & Route Optimization',
    path: ['CORE.AI', 'ROUTE.AI'],
    icon: <MapIcon />,
    color: '#FF9800',
    tags: ['route', 'fleet', 'logistics', 'delivery', 'optimization', 'transportation'],
    action: { type: 'navigate', tabId: 1, view: 'route' },
  },
  // AXIS.AI items
  {
    id: 'axis-ai',
    title: 'AXIS.AI',
    subtitle: 'Platform-Wide Q&A',
    path: ['AXIS.AI'],
    icon: <TimelineIcon />,
    color: '#2196F3',
    tags: ['chat', 'query', 'question', 'nlp', 'sql', 'strategic', 'intelligence', 'axis'],
    action: { type: 'navigate', tabId: 0 },
  },
  // MARKETS.AI items
  {
    id: 'markets-ai',
    title: 'MARKETS.AI',
    subtitle: 'Market Intelligence',
    path: ['MARKETS.AI'],
    icon: <BarChartIcon />,
    color: '#FF5722',
    tags: ['market', 'intelligence', 'analysis', 'trends'],
    action: { type: 'navigate', tabId: 3 },
  },
  // Other platform features
  {
    id: 'enterprise-pulse',
    title: 'ENTERPRISE PULSE',
    subtitle: 'Real-time Business Metrics',
    path: ['ENTERPRISE PULSE'],
    icon: <DashboardIcon />,
    color: '#00ACC1',
    tags: ['dashboard', 'metrics', 'kpi', 'real-time', 'pulse'],
    action: { type: 'navigate', tabId: 8 },
  },
  {
    id: 'process-mining',
    title: 'PROCESS MINING',
    subtitle: 'Business Process Analytics',
    path: ['PROCESS MINING'],
    icon: <HubIcon />,
    color: '#FF6B35',
    tags: ['process', 'mining', 'workflow', 'analytics', 'business'],
    action: { type: 'navigate', tabId: 7 },
  },
  {
    id: 'control-center',
    title: 'Control Center',
    subtitle: 'Platform Management & Settings',
    path: ['Control Center'],
    icon: <HubIcon />,
    color: '#FF9800',
    tags: ['control', 'center', 'settings', 'management', 'config', 'system'],
    action: { type: 'navigate', tabId: 4 },
  },
  {
    id: 'vision-ai',
    title: 'VISION.AI',
    subtitle: 'Inventory & Stock Management',
    path: ['VISION.AI'],
    icon: <ScienceIcon />,
    color: '#00BCD4',
    tags: ['vision', 'inventory', 'stock', 'management', 'visual'],
    action: { type: 'navigate', tabId: 9 },
  },
  {
    id: 'doc-analysis',
    title: 'DOCUMENT HUB',
    subtitle: 'Upload & Analyze Documents',
    path: ['Mantra AI', 'DOCUMENT HUB'],
    icon: <ScienceIcon />,
    color: '#9C27B0',
    tags: ['docs', 'documents', 'upload', 'analyze', 'pdf', 'text', 'mantra'],
    action: { type: 'navigate', tabId: 6 },
  },
  {
    id: 'comms-ai',
    title: 'EMAIL INTEL',
    subtitle: 'Email & Communication Analysis',
    path: ['EMAIL INTEL'],
    icon: <ScienceIcon />,
    color: '#E91E63',
    tags: ['comms', 'email', 'communication', 'analysis', 'sentiment'],
    action: { type: 'navigate', tabId: 13 },
  },
];

const GlobalSearch = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Global keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Filter search results based on query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = searchableItems.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(query);
      const subtitleMatch = item.subtitle.toLowerCase().includes(query);
      const pathMatch = item.path.some(p => p.toLowerCase().includes(query));
      const tagMatch = item.tags.some(tag => tag.includes(query));
      
      return titleMatch || subtitleMatch || pathMatch || tagMatch;
    });

    // Sort results by relevance
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      
      // Exact matches first
      if (aTitle === query) return -1;
      if (bTitle === query) return 1;
      
      // Then starts with
      if (aTitle.startsWith(query)) return -1;
      if (bTitle.startsWith(query)) return 1;
      
      return 0;
    });

    setSearchResults(results);
    setIsOpen(results.length > 0);
    setSelectedIndex(0);
  }, [searchQuery]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % searchResults.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          handleResultClick(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultClick = (item) => {
    console.log('Navigating to:', item);
    setSearchQuery('');
    setIsOpen(false);
    onNavigate(item.action);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <Box sx={{ position: 'relative' }} ref={searchRef}>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: { xs: 280, sm: 360, md: 480 },
          px: 2,
          py: 0.5,
          borderRadius: 3,
          bgcolor: alpha('#000', 0.04),
          border: '1px solid',
          borderColor: 'transparent',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: alpha('#000', 0.06),
            borderColor: alpha('#00357a', 0.2),
          },
          '&:focus-within': {
            bgcolor: 'background.paper',
            borderColor: 'primary.main',
            boxShadow: `0 0 0 3px ${alpha('#00357a', 0.1)}`,
          },
        }}
      >
        <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
        <TextField
          inputRef={inputRef}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchQuery.trim() && searchResults.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder="Search anything..."
          fullWidth
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: '0.875rem',
              '& input': {
                padding: '6px 0',
                '&::placeholder': {
                  color: 'text.secondary',
                  opacity: 0.8,
                },
              },
            },
            endAdornment: (
              <Stack direction="row" spacing={1} alignItems="center">
                {searchQuery && (
                  <Fade in timeout={200}>
                    <IconButton 
                      size="small" 
                      onClick={handleClear}
                      sx={{ 
                        padding: '4px',
                        '&:hover': {
                          bgcolor: alpha('#000', 0.04),
                        },
                      }}
                    >
                      <ClearIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Fade>
                )}
                {!searchQuery && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: alpha('#000', 0.04),
                      border: '1px solid',
                      borderColor: alpha('#000', 0.08),
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.65rem',
                        fontFamily: 'monospace',
                        color: 'text.secondary',
                        fontWeight: 600,
                      }}
                    >
                      ⌘K
                    </Typography>
                  </Box>
                )}
              </Stack>
            ),
          }}
        />
        {searchQuery && (
          <Chip
            size="small"
            label={`${searchResults.length} results`}
            sx={{
              ml: 1,
              height: 20,
              fontSize: '0.7rem',
              bgcolor: alpha('#00357a', 0.1),
              color: 'primary.main',
              fontWeight: 600,
            }}
          />
        )}
      </Paper>

      <Popper
        open={isOpen}
        anchorEl={searchRef.current}
        placement="bottom-start"
        transition
        style={{ zIndex: 1300, width: searchRef.current?.offsetWidth }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper
              elevation={4}
              sx={{
                mt: 1,
                maxHeight: 420,
                overflow: 'hidden',
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha('#00357a', 0.15),
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              }}
            >
              <ClickAwayListener onClickAway={() => setIsOpen(false)}>
                <Box>
                  {/* Results header */}
                  <Box sx={{ 
                    px: 2, 
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: alpha('#00357a', 0.02),
                  }}>
                    <Typography variant="caption" sx={{ 
                      color: 'text.secondary',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>
                      Search Results
                    </Typography>
                  </Box>
                  
                  <List sx={{ py: 0, maxHeight: 380, overflow: 'auto' }}>
                  {searchResults.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <ListItemButton
                        selected={index === selectedIndex}
                        onClick={() => handleResultClick(item)}
                        sx={{
                          py: 1.5,
                          px: 2,
                          borderLeft: '3px solid transparent',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: alpha(item.color, 0.04),
                            borderLeftColor: alpha(item.color, 0.3),
                            transform: 'translateX(4px)',
                          },
                          '&.Mui-selected': {
                            bgcolor: alpha(item.color, 0.08),
                            borderLeftColor: item.color,
                            '&:hover': {
                              bgcolor: alpha(item.color, 0.12),
                            },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 48 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 2,
                              background: `linear-gradient(135deg, ${alpha(item.color, 0.1)} 0%, ${alpha(item.color, 0.2)} 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: item.color,
                              boxShadow: `0 2px 8px ${alpha(item.color, 0.2)}`,
                            }}
                          >
                            {React.cloneElement(item.icon, { fontSize: 'small' })}
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography 
                              variant="body2" 
                              fontWeight={600}
                              sx={{ color: 'text.primary', mb: 0.25 }}
                            >
                              {item.title}
                            </Typography>
                          }
                          secondary={
                            <Stack spacing={0.5}>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: 'text.secondary',
                                  display: 'block',
                                }}
                              >
                                {item.subtitle}
                              </Typography>
                              <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                                {item.path.map((p, i) => (
                                  <React.Fragment key={i}>
                                    {i > 0 && (
                                      <ArrowIcon 
                                        sx={{ 
                                          fontSize: 10, 
                                          color: 'text.disabled',
                                          mx: 0.25,
                                        }} 
                                      />
                                    )}
                                    <Chip
                                      label={p}
                                      size="small"
                                      sx={{
                                        height: 16,
                                        fontSize: '0.65rem',
                                        bgcolor: i === item.path.length - 1 
                                          ? alpha(item.color, 0.1)
                                          : 'transparent',
                                        color: i === item.path.length - 1 
                                          ? item.color 
                                          : 'text.secondary',
                                        fontWeight: i === item.path.length - 1 ? 600 : 400,
                                        '& .MuiChip-label': {
                                          px: 0.75,
                                        },
                                      }}
                                    />
                                  </React.Fragment>
                                ))}
                              </Stack>
                            </Stack>
                          }
                        />
                        <Box sx={{ ml: 'auto', pl: 2 }}>
                          <IconButton 
                            size="small"
                            sx={{ 
                              color: alpha(item.color, 0.6),
                              '&:hover': {
                                color: item.color,
                                bgcolor: alpha(item.color, 0.08),
                              },
                            }}
                          >
                            <ArrowIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </ListItemButton>
                      {index < searchResults.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                  {searchResults.length === 0 && searchQuery && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          bgcolor: alpha('#000', 0.04),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                        }}
                      >
                        <SearchIcon sx={{ fontSize: 32, color: 'text.disabled' }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        No results found for "{searchQuery}"
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Try searching for "STOX", "inventory", "ML", or "financial"
                      </Typography>
                    </Box>
                  )}
                  </List>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
};

export default GlobalSearch;