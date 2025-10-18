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
  AccountBalance as BudgetIcon,
  Assessment as AssessmentIcon,
  CompareArrows as CompareIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';

const BudgetAIDashboard = ({ onBack }) => {
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
          <Typography color="text.primary">BUDGET.AI</Typography>
        </Breadcrumbs>
      </Paper>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Intelligent Budget Planning
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Smart budget allocation, variance analysis, and rolling forecasts with GL account integration
        </Typography>

        {/* Coming Soon Content */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <BudgetIcon sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
                <Typography variant="h5" gutterBottom>
                  BUDGET.AI Coming Soon
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  We're developing intelligent budgeting features including:
                </Typography>
                <Grid container spacing={2} sx={{ maxWidth: 600, mx: 'auto' }}>
                  <Grid item xs={12} sm={6}>
                    <Chip
                      icon={<AssessmentIcon />}
                      label="Budget vs Actual"
                      color="success"
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Chip
                      icon={<CompareIcon />}
                      label="Variance Analysis"
                      color="success"
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Chip
                      icon={<TrendingIcon />}
                      label="Rolling Forecasts"
                      color="success"
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Chip
                      icon={<BudgetIcon />}
                      label="GL Integration"
                      color="success"
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 4, maxWidth: 400, mx: 'auto' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Development Progress
                  </Typography>
                  <LinearProgress variant="determinate" value={20} sx={{ height: 8, borderRadius: 1 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default BudgetAIDashboard;