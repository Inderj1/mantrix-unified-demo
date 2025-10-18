import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Speed as DriverIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const DriverAIDashboard = ({ onBack }) => {
  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header with Breadcrumbs */}
      <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link
            underline="hover"
            color="inherit"
            onClick={onBack}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Finance.AI
          </Link>
          <Typography color="text.primary">DRIVER.AI</Typography>
        </Breadcrumbs>
      </Paper>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Driver-Based Planning
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Identify key business drivers, perform sensitivity analysis, and create driver-based forecasts
        </Typography>

        {/* Coming Soon Content */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <DriverIcon sx={{ fontSize: 80, color: 'warning.main', mb: 3 }} />
                <Typography variant="h5" gutterBottom>
                  DRIVER.AI Coming Soon
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  We're building advanced driver-based planning capabilities:
                </Typography>
                <Grid container spacing={2} sx={{ maxWidth: 600, mx: 'auto' }}>
                  <Grid item xs={12} sm={6}>
                    <Chip
                      icon={<AnalyticsIcon />}
                      label="Driver Identification"
                      color="warning"
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Chip
                      icon={<TimelineIcon />}
                      label="Sensitivity Analysis"
                      color="warning"
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Chip
                      icon={<SettingsIcon />}
                      label="Correlation Analysis"
                      color="warning"
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Chip
                      icon={<DriverIcon />}
                      label="Impact Simulation"
                      color="warning"
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 4, maxWidth: 400, mx: 'auto' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Development Progress
                  </Typography>
                  <LinearProgress variant="determinate" value={15} sx={{ height: 8, borderRadius: 1 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DriverAIDashboard;