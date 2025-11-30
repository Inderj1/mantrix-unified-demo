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
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  Hub as HubIcon,
  QueryStats as QueryStatsIcon,
  DataUsage as DataUsageIcon,
  Cable as CableIcon,
  Description as DescriptionIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  FiberManualRecord as DotIcon,
  AccountTree as ProcessMiningIcon,
  Psychology as SimulationIcon,
  Speed as SpeedIcon,
  AutoAwesome as StoxShiftIcon,
  RemoveRedEye as VisionIcon,
  Science as MLStudioIcon,
  ModelTraining as ModelIcon,
  SmartToy as AIModelIcon,
  AccountCircle as PersonaIcon,
  Settings as SettingsIcon,
  RocketLaunch as ExecutionIcon,
} from '@mui/icons-material';

const EnhancedSidebar = ({
  drawerOpen,
  setDrawerOpen,
  selectedTab,
  setSelectedTab,
  apiHealth,
  useSapTheme,
}) => {
  const menuItems = [
    {
      section: 'Mantra AI',
      items: [
        {
          id: 8,
          icon: <SpeedIcon />,
          primary: 'ENTERPRISE PULSE',
          secondary: 'Real-time Business Metrics',
          color: '#00ACC1',
        },
        {
          id: 7,
          icon: <ProcessMiningIcon />,
          primary: 'PROCESS MINING',
          secondary: 'Business Process Analytics',
          color: '#FF6B35',
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
          color: '#2196F3',
        },
        {
          id: 1,
          icon: <AnalyticsIcon />,
          primary: 'CORE.AI',
          secondary: 'Operational Intelligence',
          color: '#4285F4',
          status: 'active',
        },
        {
          id: 3,
          icon: <BarChartIcon />,
          primary: 'MARKETS.AI',
          secondary: 'Market Intelligence',
          color: '#FF5722',
        },
      ],
    },
    {
      section: 'Processing Hub',
      items: [
        {
          id: 6,
          icon: <DescriptionIcon />,
          primary: 'DOCUMENT HUB',
          secondary: 'Upload & Analyze Documents',
          color: '#9C27B0',
        },
        {
          id: 9,
          icon: <VisionIcon />,
          primary: 'VISION STUDIO',
          secondary: 'Document OCR & Image Intelligence',
          color: '#00BCD4',
        },
        {
          id: 13,
          icon: <ForumIcon />,
          primary: 'EMAIL INTEL',
          secondary: 'Email & Communication Analysis',
          color: '#E91E63',
        },
        {
          id: 10,
          icon: <ExecutionIcon />,
          primary: 'COMMAND TOWER',
          secondary: 'Action Tracking & Audit Trail',
          color: '#10b981',
          status: 'active',
        },
      ],
    },
  ];

  const sidebarBgColor = useSapTheme ? 'background.paper' : '#0f0f23';
  const sidebarTextColor = useSapTheme ? 'text.primary' : '#e0e0e0';
  const hoverBgColor = useSapTheme ? 'action.hover' : 'rgba(255,255,255,0.08)';

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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          minHeight: 64,
          bgcolor: useSapTheme ? 'background.paper' : 'background.paper',
          borderBottom: '1px solid',
          borderColor: useSapTheme ? 'divider' : 'rgba(255,255,255,0.1)',
          position: 'relative',
        }}
      >
        {drawerOpen ? (
          <>
            {/* Logo - Left aligned */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                flex: 1,
              }}
            >
              <Box
                component="img"
                src="/mantra9.png"
                alt="Mantra9"
                sx={{
                  height: 40,
                  width: 'auto',
                  objectFit: 'contain',
                }}
              />
            </Box>

            {/* Hamburger Menu Button */}
            <IconButton
              onClick={() => setDrawerOpen(!drawerOpen)}
              size="small"
              sx={{
                color: useSapTheme ? 'text.primary' : 'text.primary',
              }}
            >
              <MenuOpenIcon />
            </IconButton>
          </>
        ) : (
          /* Centered Menu Button when collapsed */
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <IconButton
              onClick={() => setDrawerOpen(!drawerOpen)}
              size="small"
              sx={{
                color: useSapTheme ? 'text.primary' : 'text.primary',
              }}
            >
              <MenuIcon />
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
                  color: useSapTheme ? 'text.secondary' : 'rgba(255,255,255,0.4)',
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
                      color: useSapTheme ? 'inherit' : sidebarTextColor,
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
                          : '#1e3a5f',
                        color: useSapTheme ? 'white' : 'white',
                        '&::before': {
                          opacity: 1,
                        },
                        '&:hover': {
                          bgcolor: useSapTheme
                            ? 'primary.dark'
                            : '#264a73',
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
                              : useSapTheme
                              ? `${item.color}15`
                              : `${item.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          position: 'relative',
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
                  borderColor: useSapTheme
                    ? 'divider'
                    : 'rgba(255,255,255,0.08)',
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
          borderColor: useSapTheme ? 'divider' : 'rgba(255,255,255,0.08)',
          bgcolor: useSapTheme ? 'background.default' : 'rgba(0,0,0,0.2)',
        }}
      >
        <ListItemButton
          onClick={() => setSelectedTab(4)}
          sx={{
            borderRadius: 2,
            bgcolor: selectedTab === 4 ? '#FF9800' + '20' : 'transparent',
            border: '1px solid',
            borderColor: selectedTab === 4 ? '#FF9800' : 'divider',
            '&:hover': {
              bgcolor: '#FF9800' + '10',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: drawerOpen ? 36 : 'auto' }}>
            <HubIcon sx={{ color: '#FF9800' }} />
          </ListItemIcon>
          {drawerOpen && (
            <ListItemText
              primary="CONTROL CENTER"
              primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
            />
          )}
        </ListItemButton>
      </Box>
    </Drawer>
  );
};

export default EnhancedSidebar;