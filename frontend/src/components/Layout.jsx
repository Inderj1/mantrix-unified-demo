import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  History as HistoryIcon,
  Schema as SchemaIcon,
  HealthAndSafety as HealthIcon,
  ChevronLeft as ChevronLeftIcon,
  Chat as ChatIcon,
  Psychology as PsychologyIcon,
  AccountTree as AccountTreeIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  AccountBalance as AccountBalanceIcon,
  AdminPanelSettings as AdminIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import AuthButton from './AuthButton';
import { useUser } from '@clerk/clerk-react';
import authConfig from '../auth_config.json';

const drawerWidth = 240;

const menuItems = [
  { text: 'Chat Explorer', icon: <ChatIcon />, path: '/chat' },
  { text: 'Customer 360°', icon: <PersonIcon />, path: '/customer-360' },
  { text: 'Product Performance', icon: <InventoryIcon />, path: '/product-performance' },
  { text: 'Financial Analytics', icon: <AccountBalanceIcon />, path: '/financial-analytics' },
  { text: 'Process Mining', icon: <AccountTreeIcon />, path: '/process-mining' },
  { text: 'What-If Analysis', icon: <PsychologyIcon />, path: '/whatif-analysis' },
  { text: 'Query Builder', icon: <SearchIcon />, path: '/query' },
  { text: 'History', icon: <HistoryIcon />, path: '/history' },
  { text: 'Schema', icon: <SchemaIcon />, path: '/schema' },
  { text: 'Health', icon: <HealthIcon />, path: '/health' },
];

const profileMenuItem = { text: 'AI Persona', icon: <AccountCircleIcon />, path: '/profile' };

function Layout({ children }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useUser();
  
  // Check if user is admin
  const isAdmin = user?.primaryEmailAddress?.emailAddress && 
    authConfig.authentication.access_control.roles.admin.includes(
      user.primaryEmailAddress.emailAddress
    );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          NLP to SQL
        </Typography>
        {isMobile && (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ ml: 'auto' }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem key={profileMenuItem.text} disablePadding>
          <ListItemButton
            selected={location.pathname === profileMenuItem.path}
            onClick={() => {
              navigate(profileMenuItem.path);
              if (isMobile) {
                setMobileOpen(false);
              }
            }}
          >
            <ListItemIcon>{profileMenuItem.icon}</ListItemIcon>
            <ListItemText primary={profileMenuItem.text} />
          </ListItemButton>
        </ListItem>
      </List>
      {isAdmin && (
        <>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton
                selected={location.pathname === '/admin/settings'}
                onClick={() => {
                  navigate('/admin/settings');
                  if (isMobile) {
                    setMobileOpen(false);
                  }
                }}
              >
                <ListItemIcon>
                  <AdminIcon />
                </ListItemIcon>
                <ListItemText primary="Admin Settings" />
              </ListItemButton>
            </ListItem>
          </List>
        </>
      )}
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            COPA Export - BigQuery Interface
          </Typography>
          <AuthButton />
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </>
  );
}

export default Layout;