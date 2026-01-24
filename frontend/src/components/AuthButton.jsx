import React from 'react';
import { useClerk, useUser } from '@clerk/clerk-react';
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { clearCache } from '../config/queryClient';
import { clearNavigationState } from '../hooks/usePersistedState';

function AuthButton() {
  let clerkHooks = { openSignIn: null, signOut: null };
  let userHooks = { user: null, isSignedIn: false, isLoaded: false };
  
  try {
    clerkHooks = useClerk();
    userHooks = useUser();
  } catch (error) {
    console.error('Clerk hooks not available:', error);
    // Return a fallback button
    return (
      <Button variant="outlined" color="inherit" sx={{ ml: 2 }} disabled>
        Auth Not Available
      </Button>
    );
  }
  
  const { openSignIn, signOut } = clerkHooks;
  const { user, isSignedIn, isLoaded } = userHooks;
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  // Debug logging
  console.log('AuthButton render:', { isLoaded, isSignedIn, user });

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleClose();
    // Clear React Query cache and navigation state before signing out
    await clearCache();
    clearNavigationState();
    await signOut();
  };

  const handleProfile = () => {
    handleClose();
    // Navigate to profile page or open profile modal
  };

  if (!isLoaded) {
    console.log('Clerk not loaded yet');
    return (
      <Button disabled variant="outlined" color="inherit" sx={{ ml: 2 }}>
        Loading...
      </Button>
    );
  }

  if (!isSignedIn) {
    return (
      <Button
        variant="contained"
        startIcon={<LoginIcon />}
        onClick={() => openSignIn()}
        fullWidth
        sx={{
          py: 1.5,
          px: 3,
          fontSize: '1rem',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600,
          textTransform: 'none',
          bgcolor: '#00357a',
          color: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 14px rgba(0, 53, 122, 0.3)',
          '&:hover': {
            bgcolor: '#ff751f',
            boxShadow: '0 6px 20px rgba(255, 117, 31, 0.4)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        Sign In to Continue
      </Button>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
        {user.primaryEmailAddress?.emailAddress}
      </Typography>
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        <Avatar
          src={user.imageUrl}
          alt={user.fullName || user.firstName || 'User'}
          sx={{ width: 32, height: 32 }}
        >
          {!user.imageUrl && (user.firstName?.[0] || user.primaryEmailAddress?.emailAddress?.[0] || 'U')}
        </Avatar>
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1">
            {user.fullName || user.firstName || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.primaryEmailAddress?.emailAddress}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleProfile}>
          <PersonIcon sx={{ mr: 1 }} fontSize="small" />
          Profile
        </MenuItem>
        <MenuItem onClick={handleSignOut}>
          <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
          Sign Out
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default AuthButton;