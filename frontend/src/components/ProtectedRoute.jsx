import React, { useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Paper, Button } from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';
import authConfig from '../auth_config.json';

function ProtectedRoute({ children, routePath }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!isLoaded) return;

      // Check if authentication is enabled
      if (!authConfig.authentication.enabled) {
        console.log('Authentication is disabled in config');
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Check if route requires protection
      const isProtected = authConfig.authentication.protected_routes[routePath] !== false;
      if (!isProtected) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Check if user is signed in
      if (!isSignedIn) {
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }

      // Check email authorization
      const userEmail = user.primaryEmailAddress?.emailAddress;
      if (!userEmail) {
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }

      const { authorized_emails, authorized_domains } = authConfig.authentication.access_control;
      
      // Check if email is in whitelist
      const isEmailAuthorized = authorized_emails.includes(userEmail);
      
      // Check if domain is authorized
      const userDomain = userEmail.split('@')[1];
      const isDomainAuthorized = authorized_domains.includes(userDomain);

      setIsAuthorized(isEmailAuthorized || isDomainAuthorized);
      setIsChecking(false);
    };

    checkAuthorization();
  }, [isLoaded, isSignedIn, user, routePath]);

  if (!isLoaded || isChecking) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isSignedIn) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Authentication Required
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Please sign in to access this page.
          </Typography>
          <Button
            variant="contained"
            onClick={() => openSignIn()}
            sx={{ mt: 2 }}
          >
            Sign In
          </Button>
        </Paper>
      </Box>
    );
  }

  if (!isAuthorized) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
          <BlockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You don't have permission to access this page.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Your email: {user.primaryEmailAddress?.emailAddress}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please contact your administrator for access.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
            sx={{ mt: 3 }}
          >
            Go to Home
          </Button>
        </Paper>
      </Box>
    );
  }

  return <>{children}</>;
}

export default ProtectedRoute;