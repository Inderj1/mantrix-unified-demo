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
  Lightbulb as InsightsIcon,
  Psychology as AIIcon,
  Warning as WarningIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';

const InsightsAIDashboard = ({ onBack }) => {
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
          <Typography color="text.primary">INSIGHTS.AI</Typography>
        </Breadcrumbs>
      </Paper>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          AI-Powered Business Insights
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Automated insight generation, anomaly detection, and prescriptive recommendations
        </Typography>

        {/* Coming Soon Content */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <InsightsIcon sx={{ fontSize: 80, color: 'info.main', mb: 3 }} />
                <Typography variant="h5" gutterBottom>
                  INSIGHTS.AI Coming Soon
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  We're developing AI-powered insight capabilities:
                </Typography>
                <Grid container spacing={2} sx={{ maxWidth: 600, mx: 'auto' }}>
                  <Grid item xs={12} sm={6}>
                    <Chip
                      icon={<AutoAwesomeIcon />}
                      label="Automated Insights"
                      color="info"
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Chip
                      icon={<WarningIcon />}
                      label="Anomaly Detection"
                      color="info"
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Chip
                      icon={<AIIcon />}
                      label="Natural Language"
                      color="info"
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Chip
                      icon={<InsightsIcon />}
                      label="Prescriptive Actions"
                      color="info"
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 4, maxWidth: 400, mx: 'auto' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Development Progress
                  </Typography>
                  <LinearProgress variant="determinate" value={10} sx={{ height: 8, borderRadius: 1 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default InsightsAIDashboard;