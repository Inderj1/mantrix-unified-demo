import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  alpha,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { getColors } from '../../config/brandColors';
import ProactiveKPISummary from './ProactiveKPISummary';
import UnifiedAlertsGrid from './UnifiedAlertsGrid';
import KitAlertDetail from './KitAlertDetail';
import {
  generateKitAlerts,
  generateAlertDetail,
  calculateAlertStats,
  ALERT_CATEGORIES,
} from './kitAlertMockData';
import { getPatternSummary } from './proactivePatternData';

// Extended category mapping including COPA patterns
const EXTENDED_CATEGORIES = {
  ...ALERT_CATEGORIES,
  copa_profitability: [
    'copa_margin_erosion',
    'copa_customer_contribution',
    'copa_discount_leakage',
    'copa_cost_variance',
    'copa_supplier_degradation',
    'copa_contract_profitability',
    'copa_regional_shift',
  ],
};

const ProactiveActionsTab = ({ darkMode = false }) => {
  const colors = getColors(darkMode);
  const [kitAlerts, setKitAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    setKitAlerts(generateKitAlerts(12));
  }, []);

  const stats = useMemo(() => calculateAlertStats(kitAlerts), [kitAlerts]);
  const patternSummary = useMemo(() => getPatternSummary(), []);

  const handleAlertAction = (action, data) => {
    setKitAlerts((prev) =>
      prev.map((alert) => {
        if (alert.id !== data.alertId) return alert;
        const now = new Date().toISOString();
        const newHistoryItem = { action, by: 'Current User', at: now, notes: '' };

        switch (action) {
          case 'approve':
            newHistoryItem.notes = `Approved AI suggestion: ${data.aiSuggestion?.action}`;
            return { ...alert, status: 'resolved', action_history: [newHistoryItem, ...(alert.action_history || [])] };
          case 'escalate':
            newHistoryItem.notes = `Escalated to ${data.escalateTo}`;
            return { ...alert, severity: alert.severity === 'high' ? 'critical' : 'high', action_history: [newHistoryItem, ...(alert.action_history || [])] };
          case 'assign':
            newHistoryItem.notes = `Assigned to ${data.assignee}`;
            return { ...alert, status: 'in_progress', assigned_to: { name: data.assignee, role: 'Team Member' }, action_history: [newHistoryItem, ...(alert.action_history || [])] };
          case 'snooze':
            newHistoryItem.notes = `Snoozed for ${data.duration}`;
            return { ...alert, status: 'snoozed', action_history: [newHistoryItem, ...(alert.action_history || [])] };
          case 'note':
            newHistoryItem.action = 'note_added';
            newHistoryItem.notes = data.note;
            return { ...alert, action_history: [newHistoryItem, ...(alert.action_history || [])] };
          case 'resolve':
            newHistoryItem.notes = `Resolved as ${data.resolution}`;
            return { ...alert, status: 'resolved', action_history: [newHistoryItem, ...(alert.action_history || [])] };
          default:
            return alert;
        }
      })
    );
    if (selectedAlert?.id === data.alertId) {
      setSelectedAlert(null);
    }
  };

  const handleRefresh = () => {
    setKitAlerts(generateKitAlerts(12));
  };

  // Alert detail view
  if (selectedAlert) {
    return (
      <KitAlertDetail
        alert={generateAlertDetail(selectedAlert)}
        onBack={() => setSelectedAlert(null)}
        onAction={handleAlertAction}
        darkMode={darkMode}
      />
    );
  }

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100%' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 0,
          mb: 3,
          boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
          bgcolor: colors.paper,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: alpha(colors.primary, darkMode ? 0.2 : 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PsychologyIcon sx={{ fontSize: 24, color: colors.primary }} />
          </Box>
          <Box flex={1}>
            <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
              Proactive Actions
            </Typography>
            <Typography variant="body2" sx={{ color: colors.grey }}>
              AI-driven alerts and ERP-actionable patterns across COPA &amp; STOX
            </Typography>
          </Box>
          <IconButton
            onClick={handleRefresh}
            sx={{
              color: colors.textSecondary,
              '&:hover': { bgcolor: alpha(colors.primary, 0.1) },
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* KPI Summary (6 cards) */}
      <ProactiveKPISummary
        stats={stats}
        patternSummary={patternSummary}
        darkMode={darkMode}
      />

      {/* Unified Alerts DataGrid */}
      <UnifiedAlertsGrid
        alerts={kitAlerts}
        darkMode={darkMode}
        onAlertClick={setSelectedAlert}
        alertCategories={EXTENDED_CATEGORIES}
      />
    </Box>
  );
};

export default ProactiveActionsTab;
