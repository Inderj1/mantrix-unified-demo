import React from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import MarketSignalTable from './MarketSignalTable';
import { getSeverityLevel } from './CategoryIcons';

// Dark mode color helper
const getColors = (darkMode) => ({
  primary: darkMode ? '#4da6ff' : '#0a6ed1',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

/**
 * MarketCategoryDetail - Expanded view for a market signal category
 *
 * Props:
 * - category: Category object from MARKET_CATEGORIES
 * - signals: Array of signals for this category
 * - onClose: Handler to close the detail view
 * - onViewSignalDetails: Handler for viewing individual signal details
 * - onSimulateImpact: Handler for simulating impact
 * - darkMode: Whether dark mode is enabled
 */
const MarketCategoryDetail = ({
  category,
  signals = [],
  onClose,
  onViewSignalDetails,
  onSimulateImpact,
  darkMode = false,
}) => {
  const colors = getColors(darkMode);
  const IconComponent = category.icon;

  // Calculate summary metrics
  const totalSignals = signals.length;
  const criticalSignals = signals.filter(s => s.severityScore >= 80).length;
  const highSignals = signals.filter(s => s.severityScore >= 60 && s.severityScore < 80).length;

  const totalImpact = signals.reduce((sum, s) => sum + (s.impactValue || 0), 0);
  const totalAffectedSKUs = signals.reduce((sum, s) => sum + (s.affectedSKUs || 0), 0);
  const totalAffectedSuppliers = signals.reduce((sum, s) => sum + (s.affectedSuppliers || 0), 0);
  const totalAffectedCustomers = signals.reduce((sum, s) => sum + (s.affectedCustomers || 0), 0);

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '$0';
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `${value >= 0 ? '' : '-'}$${(absValue / 1000000).toFixed(2)}M`;
    } else if (absValue >= 1000) {
      return `${value >= 0 ? '' : '-'}$${(absValue / 1000).toFixed(0)}K`;
    }
    return `${value >= 0 ? '' : '-'}$${absValue.toFixed(0)}`;
  };

  // Get highest severity
  const highestSeverity = signals.length > 0
    ? Math.max(...signals.map(s => s.severityScore))
    : 0;
  const severityLevel = getSeverityLevel(highestSeverity);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: colors.paper,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, p: 3, pb: 0, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${category.color}20`,
            }}
          >
            <IconComponent sx={{ fontSize: 28, color: category.color }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
              {category.name} - Active Signals
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              {category.description}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon sx={{ color: colors.text }} />
        </IconButton>
      </Box>

      {/* Summary Metrics */}
      <Grid container spacing={2} sx={{ mb: 2, px: 3, flexShrink: 0 }}>
        {/* Total Signals */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            height: '100%',
            bgcolor: darkMode ? colors.cardBg : '#f5f5f5',
            border: `1px solid ${colors.border}`
          }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: colors.textSecondary }} gutterBottom>
                Total Signals
              </Typography>
              <Typography variant="h4" fontWeight={700} color={category.color}>
                {totalSignals}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                {criticalSignals > 0 && (
                  <Chip
                    label={`${criticalSignals} Critical`}
                    size="small"
                    sx={{ bgcolor: '#ffebee', color: '#f44336', fontSize: '0.7rem' }}
                  />
                )}
                {highSignals > 0 && (
                  <Chip
                    label={`${highSignals} High`}
                    size="small"
                    sx={{ bgcolor: '#fff3e0', color: '#ff9800', fontSize: '0.7rem' }}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Business Impact */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            height: '100%',
            bgcolor: darkMode
              ? colors.cardBg
              : (totalImpact >= 0 ? '#e8f5e9' : '#ffebee'),
            border: `1px solid ${colors.border}`
          }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: colors.textSecondary }} gutterBottom>
                Total Business Impact
              </Typography>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ color: totalImpact >= 0 ? '#4caf50' : '#f44336' }}
              >
                {formatCurrency(totalImpact)}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                {totalImpact >= 0 ? 'Opportunity Value' : 'At Risk'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Affected SKUs */}
        {totalAffectedSKUs > 0 && (
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              height: '100%',
              bgcolor: darkMode ? colors.cardBg : '#fff3e0',
              border: `1px solid ${colors.border}`
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <InventoryIcon sx={{ fontSize: 20, color: '#ff9800' }} />
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                    Affected SKUs
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="#ff9800">
                  {totalAffectedSKUs.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Affected Suppliers/Customers */}
        {(totalAffectedSuppliers > 0 || totalAffectedCustomers > 0) && (
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              height: '100%',
              bgcolor: darkMode ? colors.cardBg : '#e3f2fd',
              border: `1px solid ${colors.border}`
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PeopleIcon sx={{ fontSize: 20, color: '#2196f3' }} />
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                    Affected Partners
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {totalAffectedSuppliers > 0 && (
                    <Typography variant="body2" sx={{ color: colors.text }}>
                      {totalAffectedSuppliers} Suppliers
                    </Typography>
                  )}
                  {totalAffectedCustomers > 0 && (
                    <Typography variant="body2" sx={{ color: colors.text }}>
                      {totalAffectedCustomers} Customers
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, px: 3, flexShrink: 0 }}>
        <Button
          variant="contained"
          startIcon={<AssessmentIcon />}
          sx={{
            bgcolor: category.color,
            '&:hover': {
              bgcolor: category.color,
              filter: 'brightness(0.9)',
            },
          }}
          onClick={() => {
            // Generate comprehensive report
            alert('Generate Report functionality - Coming soon!');
          }}
        >
          Generate Report
        </Button>
        <Button
          variant="outlined"
          startIcon={<TrendingUpIcon />}
          sx={{
            borderColor: category.color,
            color: category.color,
            '&:hover': {
              borderColor: category.color,
              bgcolor: `${category.color}10`,
            },
          }}
          onClick={() => {
            // Simulate overall category impact
            if (onSimulateImpact) {
              onSimulateImpact({ category: category.name, signals });
            }
          }}
        >
          Simulate Overall Impact
        </Button>
      </Box>

      <Divider sx={{ my: 2, flexShrink: 0 }} />

      {/* Signals Table */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2, color: colors.text }}>
          Active Signals ({totalSignals})
        </Typography>
        <MarketSignalTable
          signals={signals}
          onViewDetails={onViewSignalDetails}
          onSimulate={onSimulateImpact}
          darkMode={darkMode}
        />
      </Box>
    </Box>
  );
};

export default MarketCategoryDetail;
