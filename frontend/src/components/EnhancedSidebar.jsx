import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  Stack,
  Badge,
  Chip,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  ForumOutlined as ForumIcon,
  Speed as CoreAIIcon,
  Radar as MarketsIcon,
  Hub as HubIcon,
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  FiberManualRecord as DotIcon,
  MonitorHeart as PulseIcon,
  Visibility as VisionIcon,
  Flag as CommandTowerIcon,
  Email as EmailIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const EnhancedSidebar = ({
  drawerOpen,
  setDrawerOpen,
  selectedTab,
  setSelectedTab,
  apiHealth,
  useSapTheme,
  darkMode = false,
}) => {
  const menuItems = [
    {
      section: 'Mantra AI',
      items: [
        {
          id: 8,
          icon: <PulseIcon />,
          primary: 'ENTERPRISE PULSE',
          secondary: 'Real-time Business Metrics',
          color: '#00357a',
        },
      ],
    },
    {
      section: 'Decision Intelligence',
      items: [
        {
          id: 0,
          icon: <ForumIcon />,
          primary: 'AXIS.AI',
          secondary: 'Platform-Wide Q&A',
          color: '#00357a',
        },
        {
          id: 1,
          icon: <CoreAIIcon />,
          primary: 'CORE.AI',
          secondary: 'Operational Intelligence',
          color: '#00357a',
        },
        {
          id: 3,
          icon: <MarketsIcon />,
          primary: 'MARKETS.AI',
          secondary: 'Market Intelligence',
          color: '#00357a',
        },
      ],
    },
    {
      section: 'Processing Hub',
      items: [
        {
          id: 6,
          icon: <HubIcon />,
          primary: 'DOCUMENT HUB',
          secondary: 'Upload & Analyze Documents',
          color: '#00357a',
        },
        {
          id: 13,
          icon: <EmailIcon />,
          primary: 'EMAIL INTEL',
          secondary: 'Email & Communication Analysis',
          color: '#00357a',
        },
        {
          id: 9,
          icon: <VisionIcon />,
          primary: 'VISION STUDIO',
          secondary: 'Document OCR & Image Intelligence',
          color: '#00357a',
        },
      ],
    },
    {
      section: 'Action Center',
      items: [
        {
          id: 10,
          icon: <CommandTowerIcon />,
          primary: 'COMMAND TOWER',
          secondary: 'Action Tracking & Audit Trail',
          color: '#00357a',
        },
      ],
    },
  ];

  // Dark mode colors
  const sidebarBgColor = darkMode ? '#0d1117' : (useSapTheme ? 'background.paper' : '#0f0f23');
  const sidebarTextColor = darkMode ? '#ffffff' : (useSapTheme ? 'text.primary' : '#e0e0e0');
  const hoverBgColor = darkMode ? 'rgba(255,255,255,0.08)' : (useSapTheme ? 'action.hover' : 'rgba(255,255,255,0.08)');
  const headerBgColor = darkMode ? '#161b22' : 'background.paper';
  const borderColor = darkMode ? 'rgba(255,255,255,0.15)' : (useSapTheme ? 'divider' : 'rgba(255,255,255,0.1)');
  const sectionTextColor = darkMode ? 'rgba(255,255,255,0.85)' : (useSapTheme ? 'text.secondary' : 'rgba(255,255,255,0.4)');

  return (
    <Drawer
      variant="permanent"
      open={drawerOpen}
      sx={{
        width: drawerOpen ? 240 : 64,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerOpen ? 240 : 64,
          boxSizing: 'border-box',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          bgcolor: sidebarBgColor,
          borderRight: 0,
          overflowX: 'hidden',
          boxShadow: useSapTheme ? '2px 0 8px rgba(0,0,0,0.1)' : '2px 0 12px rgba(0,0,0,0.5)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: drawerOpen ? 2 : 1,
          minHeight: 70,
          background: darkMode
            ? 'linear-gradient(135deg, #161b22 0%, #0d1117 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderBottom: '1px solid',
          borderColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          position: 'relative',
        }}
      >
        {drawerOpen ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Logo */}
            <Box
              component="img"
              src="/MANTRIX_AI.svg"
              alt="MANTRIX AI"
              sx={{
                height: 40,
                width: 'auto',
                objectFit: 'contain',
                filter: darkMode
                  ? 'invert(1) hue-rotate(180deg)'
                  : 'none',
                transition: 'all 0.2s ease',
              }}
            />

            {/* Hamburger Menu Button */}
            <IconButton
              onClick={() => setDrawerOpen(!drawerOpen)}
              size="small"
              sx={{
                color: darkMode ? '#8b949e' : '#64748b',
                bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                borderRadius: 1.5,
                '&:hover': {
                  bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  color: darkMode ? '#e6edf3' : '#0f172a',
                },
              }}
            >
              <MenuOpenIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          /* Centered Menu Button when collapsed */
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 0.5 }}>
            <IconButton
              onClick={() => setDrawerOpen(!drawerOpen)}
              size="small"
              sx={{
                color: darkMode ? '#8b949e' : '#64748b',
                bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                borderRadius: 1.5,
                '&:hover': {
                  bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  color: darkMode ? '#e6edf3' : '#0f172a',
                },
              }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'hidden', overflowX: 'hidden', py: 1.5 }}>
        {menuItems.map((section, sectionIndex) => (
          <Box key={sectionIndex}>
            {drawerOpen && (
              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  py: 0.5,
                  display: 'block',
                  color: sectionTextColor,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontSize: '0.65rem',
                }}
              >
                {section.section}
              </Typography>
            )}

            <List sx={{ px: 0.5, py: 0 }}>
              {section.items.map((item) => (
                <Tooltip
                  key={item.id}
                  title={!drawerOpen ? item.primary : item.disabled ? 'Coming Soon' : ''}
                  placement="right"
                >
                  <ListItemButton
                    selected={selectedTab === item.id}
                    onClick={() => !item.disabled && setSelectedTab(item.id)}
                    disabled={item.disabled}
                    sx={{
                      borderRadius: 2,
                      mb: 0.25,
                      mx: 0.25,
                      minHeight: 36,
                      transition: 'all 0.2s',
                      color: darkMode ? sidebarTextColor : (useSapTheme ? 'inherit' : sidebarTextColor),
                      position: 'relative',
                      overflow: 'hidden',
                      opacity: item.disabled ? 0.5 : 1,
                      cursor: item.disabled ? 'not-allowed' : 'pointer',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 3,
                        height: '70%',
                        bgcolor: item.color,
                        borderRadius: '0 2px 2px 0',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                      },
                      '&:hover': {
                        bgcolor: hoverBgColor,
                        transform: drawerOpen ? 'translateX(4px)' : 'none',
                        '&::before': {
                          opacity: 0.5,
                        },
                      },
                      '&.Mui-selected': {
                        bgcolor: useSapTheme
                          ? 'primary.main'
                          : '#00357a',
                        color: useSapTheme ? 'white' : 'white',
                        '&::before': {
                          opacity: 1,
                        },
                        '&:hover': {
                          bgcolor: useSapTheme
                            ? 'primary.dark'
                            : '#004494',
                        },
                        '& .MuiListItemIcon-root': {
                          color: useSapTheme ? 'white' : item.color,
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: drawerOpen ? 36 : 'auto',
                        color: 'inherit',
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: 1.5,
                          bgcolor:
                            selectedTab === item.id
                              ? 'transparent'
                              : darkMode
                              ? `${item.color}40`
                              : useSapTheme
                              ? `${item.color}20`
                              : `${item.color}25`,
                          color: selectedTab === item.id ? 'white' : item.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          position: 'relative',
                          '& svg': { fontSize: 20 },
                        }}
                      >
                        {item.badge && !drawerOpen ? (
                          <Badge
                            badgeContent={item.badge}
                            color="primary"
                            sx={{
                              '& .MuiBadge-badge': {
                                fontSize: '0.6rem',
                                height: 16,
                                minWidth: 16,
                                top: -4,
                                right: -4,
                              },
                            }}
                          >
                            {item.icon}
                          </Badge>
                        ) : (
                          item.icon
                        )}
                        {item.status && drawerOpen && (
                          <DotIcon
                            sx={{
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              fontSize: 10,
                              color: item.status === 'new' ? '#4CAF50' : 
                                     item.status === 'coming-soon' ? '#FF9800' : 
                                     '#4CAF50',
                            }}
                          />
                        )}
                      </Box>
                    </ListItemIcon>
                    {drawerOpen && (
                      <ListItemText
                        primary={
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <Typography variant="body2" fontWeight={500}>
                              {item.primary}
                            </Typography>
                            {item.badge && (
                              <Chip
                                label={item.badge}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.65rem',
                                  bgcolor: useSapTheme
                                    ? 'primary.light'
                                    : item.color,
                                  color: 'white',
                                }}
                              />
                            )}
                            {item.status === 'coming-soon' && (
                              <Chip
                                label="Soon"
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.6rem',
                                  bgcolor: 'rgba(255, 152, 0, 0.2)',
                                  color: '#FF9800',
                                  border: '1px solid #FF9800',
                                }}
                              />
                            )}
                            {item.status === 'new' && (
                              <Chip
                                label="New"
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.6rem',
                                  bgcolor: 'rgba(76, 175, 80, 0.2)',
                                  color: '#4CAF50',
                                  border: '1px solid #4CAF50',
                                }}
                              />
                            )}
                          </Stack>
                        }
                        secondary={null}
                        primaryTypographyProps={{ fontWeight: 500 }}
                        secondaryTypographyProps={{
                          sx: {
                            color: useSapTheme
                              ? 'text.secondary'
                              : 'rgba(255,255,255,0.5)',
                            fontSize: '0.7rem',
                            display: 'none',
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              ))}
            </List>

            {sectionIndex < menuItems.length - 1 && (
              <Divider
                sx={{
                  my: 2,
                  mx: 2,
                  borderColor: borderColor,
                }}
              />
            )}
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 1,
          borderTop: 1,
          borderColor: borderColor,
          bgcolor: darkMode ? '#161b22' : (useSapTheme ? 'background.default' : 'rgba(0,0,0,0.2)'),
        }}
      >
        <ListItemButton
          onClick={() => setSelectedTab(4)}
          sx={{
            borderRadius: 2,
            bgcolor: selectedTab === 4 ? '#FF9800' + '20' : 'transparent',
            border: '1px solid',
            borderColor: selectedTab === 4 ? '#FF9800' : borderColor,
            color: sidebarTextColor,
            '&:hover': {
              bgcolor: '#FF9800' + '10',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: drawerOpen ? 36 : 'auto' }}>
            <SettingsIcon sx={{ color: '#FF9800' }} />
          </ListItemIcon>
          {drawerOpen && (
            <ListItemText
              primary="CONTROL CENTER"
              primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem', color: sidebarTextColor }}
            />
          )}
        </ListItemButton>
      </Box>
    </Drawer>
  );
};

export default EnhancedSidebar;