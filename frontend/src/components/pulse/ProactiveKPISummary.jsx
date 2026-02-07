import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  alpha,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Lightbulb as OpportunityIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingUp as TrendingUpIcon,
  PlaylistAddCheck as PendingExecIcon,
  AccountBalance as CopaIcon,
} from '@mui/icons-material';
import { getColors } from '../../config/brandColors';

const ProactiveKPISummary = ({ stats = {}, patternSummary = {}, darkMode = false }) => {
  const colors = getColors(darkMode);

  const kpiCards = [
    {
      label: 'Active Insights',
      value: stats.activeAlerts || 0,
      icon: WarningIcon,
      color: colors.error,
    },
    {
      label: 'Opportunities',
      value: stats.opportunities || 0,
      icon: OpportunityIcon,
      color: colors.success,
    },
    {
      label: 'Revenue at Risk',
      value: `$${((stats.revenueAtRisk || 0) / 1000).toFixed(0)}K`,
      icon: AttachMoneyIcon,
      color: colors.warning,
    },
    {
      label: 'Pattern Health',
      value: `${patternSummary.patternHealth || 96}%`,
      icon: TrendingUpIcon,
      color: colors.primary,
    },
    {
      label: 'Pending Executions',
      value: patternSummary.pendingExecutions || 0,
      icon: PendingExecIcon,
      color: colors.accent,
    },
    {
      label: 'COPA Detections',
      value: patternSummary.copaDetections || 0,
      icon: CopaIcon,
      color: colors.primary,
    },
  ];

  return (
    <Grid container spacing={2} mb={3} sx={{ px: 2 }}>
      {kpiCards.map((kpi) => {
        const KpiIcon = kpi.icon;
        return (
          <Grid item xs={6} sm={4} md={2} key={kpi.label}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha(kpi.color, 0.2),
                bgcolor: darkMode ? alpha(kpi.color, 0.1) : alpha(kpi.color, 0.03),
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                    {kpi.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: kpi.color }}>
                    {kpi.value}
                  </Typography>
                </Box>
                <KpiIcon sx={{ color: kpi.color, fontSize: 28 }} />
              </Box>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default ProactiveKPISummary;
