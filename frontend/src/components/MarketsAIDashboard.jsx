import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  alpha,
  Stack,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Radar as RadarIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Close as CloseIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import { getCategoriesArray, getCategoryById } from './markets/CategoryIcons';
import MarketCategoryTile from './markets/MarketCategoryTile';
import MarketCategoryDetail from './markets/MarketCategoryDetail';
import MarketConfigPanel from './markets/MarketConfigPanel';
import mockMarketSignals, { getSignalsByCategory, getTotalImpact, getCriticalSignals } from '../data/mockMarketData';
import { usePersistedState } from '../hooks/usePersistedState';

// Import centralized brand colors
import { MODULE_COLOR, getColors } from '../config/brandColors';

/**
 * MarketsAIDashboard - Main dashboard for market intelligence
 * Tile-based layout showing all 15 market signal categories
 * Updated styling to match STOX.AI and MARGEN.AI
 */
const MarketsAIDashboard = ({ darkMode = false }) => {
  const colors = getColors(darkMode);
  const categories = getCategoriesArray();

  // State - persisted configuration (all categories disabled by default)
  const [enabledCategories, setEnabledCategories] = usePersistedState(
    'mantrix-markets-enabled-categories',
    []  // All market signals disabled by default
  );
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
  const [signalDetailDialog, setSignalDetailDialog] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Simulate periodic scanning
  useEffect(() => {
    const interval = setInterval(() => {
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 2000);
    }, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Calculate global metrics - only for enabled categories
  const hasEnabledCategories = enabledCategories.length > 0;

  // Filter signals to only include enabled categories
  const enabledCategorySignals = hasEnabledCategories
    ? Object.entries(mockMarketSignals)
        .filter(([category]) => enabledCategories.includes(category))
        .flatMap(([, signals]) => signals)
    : [];

  const totalImpact = hasEnabledCategories
    ? enabledCategorySignals.reduce((sum, signal) => sum + (signal.impactValue || 0), 0)
    : 0;

  const criticalSignals = hasEnabledCategories
    ? enabledCategorySignals.filter(s => s.severity === 'critical')
    : [];

  const totalActiveSignals = hasEnabledCategories
    ? enabledCategorySignals.length
    : 0;

  // Get signal count per category
  const getSignalCount = (categoryId) => {
    const signals = getSignalsByCategory(categoryId);
    return signals.length;
  };

  // Get highest severity per category
  const getHighestSeverity = (categoryId) => {
    const signals = getSignalsByCategory(categoryId);
    if (signals.length === 0) return 0;
    return Math.max(...signals.map(s => s.severityScore || 0));
  };

  // Handle tile click
  const handleTileClick = (categoryId) => {
    setExpandedCategory(categoryId);
    setCategoryDialogOpen(true);
  };

  // Handle config save
  const handleConfigSave = (newEnabledCategories) => {
    setEnabledCategories(newEnabledCategories);
    // In production, save to backend API
    console.log('Saved configuration:', newEnabledCategories);
  };

  // Handle signal detail view
  const handleViewSignalDetails = (signal) => {
    setSignalDetailDialog(signal);
  };

  // Handle simulate impact
  const handleSimulateImpact = (data) => {
    alert(`Simulating impact for: ${data.name || data.category}\n\nThis feature will open a detailed impact simulation tool.`);
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '$0';
    const absValue = Math.abs(value);
    if (absValue >= 1000000) {
      return `${value >= 0 ? '' : '-'}$${(absValue / 1000000).toFixed(1)}M`;
    } else if (absValue >= 1000) {
      return `${value >= 0 ? '' : '-'}$${(absValue / 1000).toFixed(0)}K`;
    }
    return `${value >= 0 ? '' : '-'}$${absValue.toFixed(0)}`;
  };

  return (
    <Box sx={{
      p: 3,
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      bgcolor: colors.background,
    }}>
      {/* Header */}
      <Paper elevation={0} sx={{
        p: 2,
        borderRadius: 0,
        mb: 3,
        bgcolor: colors.paper,
        border: `1px solid ${colors.border}`,
        boxShadow: darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {/* System Identity Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RadarIcon sx={{ fontSize: 40, color: MODULE_COLOR }} />
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.5px', color: MODULE_COLOR }}>
                MARKETS.AI
              </Typography>
              <Chip
                label="15 Categories"
                size="small"
                sx={{
                  bgcolor: alpha(MODULE_COLOR, 0.1),
                  color: MODULE_COLOR,
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}
              />
              {isScanning && (
                <Chip
                  label="Scanning..."
                  size="small"
                  icon={<RefreshIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    bgcolor: alpha(MODULE_COLOR, 0.1),
                    color: MODULE_COLOR,
                    fontWeight: 500,
                    fontSize: '0.7rem',
                    '& .MuiChip-icon': { color: MODULE_COLOR }
                  }}
                />
              )}
            </Stack>
            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: colors.textSecondary }}>
              Comprehensive market signal monitoring across 15 intelligence categories
            </Typography>
          </Box>
          <Tooltip title="Configure Categories">
            <IconButton
              onClick={() => setConfigPanelOpen(true)}
              size="small"
              sx={{
                bgcolor: alpha(MODULE_COLOR, 0.1),
                '&:hover': { bgcolor: alpha(MODULE_COLOR, 0.2) }
              }}
            >
              <SettingsIcon sx={{ color: MODULE_COLOR }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Global Summary Metrics */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              border: `1px solid ${colors.border}`,
              borderRadius: 3,
              bgcolor: colors.cardBg,
              boxShadow: darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>
                Active Categories
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: MODULE_COLOR }}>
                {enabledCategories.length} / {categories.length}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: colors.textSecondary }}>
                Monitoring enabled
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              border: `1px solid ${colors.border}`,
              borderRadius: 3,
              bgcolor: colors.cardBg,
              boxShadow: darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>
                Critical Signals
              </Typography>
              <Typography variant="h5" fontWeight={700} color="error.main">
                {criticalSignals.length}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: colors.textSecondary }}>
                Require immediate action
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              border: `1px solid ${colors.border}`,
              borderRadius: 3,
              bgcolor: colors.cardBg,
              boxShadow: darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>
                Total Business Impact
              </Typography>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ color: totalImpact >= 0 ? 'success.main' : 'error.main' }}
              >
                {formatCurrency(totalImpact)}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: colors.textSecondary }}>
                {totalImpact >= 0 ? 'Opportunity value' : 'At risk'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: '100%',
              border: `1px solid ${colors.border}`,
              borderRadius: 3,
              bgcolor: colors.cardBg,
              boxShadow: darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: colors.textSecondary }}>
                Active Signals
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: MODULE_COLOR }}>
                {totalActiveSignals}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.65rem', color: colors.textSecondary }}>
                Across all categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category Tiles Grid */}
      <Box>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: MODULE_COLOR }}>
          Market Signal Categories
        </Typography>

        <Grid container spacing={1.5}>
          {categories.map((category, index) => {
            const isEnabled = enabledCategories.includes(category.id);
            const signalCount = isEnabled ? getSignalCount(category.id) : 0;
            const highestSeverity = isEnabled ? getHighestSeverity(category.id) : 0;

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
                <MarketCategoryTile
                  category={category}
                  signalCount={signalCount}
                  enabled={isEnabled}
                  highestSeverity={highestSeverity}
                  trend={null}
                  onClick={() => isEnabled && handleTileClick(category.id)}
                  onConfigClick={() => setConfigPanelOpen(true)}
                  index={index}
                  darkMode={darkMode}
                />
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Footer Info */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
          <LightbulbIcon sx={{ color: 'warning.main' }} />
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            MARKETS.AI provides comprehensive market signal monitoring powered by real-time data analytics
          </Typography>
        </Stack>
      </Box>

      {/* Category Detail Dialog */}
      <Dialog
        open={categoryDialogOpen}
        onClose={() => {
          setCategoryDialogOpen(false);
          setExpandedCategory(null);
        }}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
            bgcolor: colors.paper,
          }
        }}
      >
        {expandedCategory && (
          <MarketCategoryDetail
            category={getCategoryById(expandedCategory)}
            signals={getSignalsByCategory(expandedCategory)}
            onClose={() => {
              setCategoryDialogOpen(false);
              setExpandedCategory(null);
            }}
            onViewSignalDetails={handleViewSignalDetails}
            onSimulateImpact={handleSimulateImpact}
            darkMode={darkMode}
          />
        )}
      </Dialog>

      {/* Configuration Panel */}
      <MarketConfigPanel
        open={configPanelOpen}
        onClose={() => setConfigPanelOpen(false)}
        enabledCategories={enabledCategories}
        onSave={handleConfigSave}
        darkMode={darkMode}
      />

      {/* Signal Detail Dialog */}
      <Dialog
        open={!!signalDetailDialog}
        onClose={() => setSignalDetailDialog(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: colors.paper,
          }
        }}
      >
        {signalDetailDialog && (
          <>
            <DialogTitle sx={{ bgcolor: colors.paper }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: colors.text }}>{signalDetailDialog.name}</Typography>
                <IconButton onClick={() => setSignalDetailDialog(null)}>
                  <CloseIcon sx={{ color: colors.text }} />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ bgcolor: colors.paper }}>
              <Box sx={{ py: 2 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <AlertTitle>Signal Details</AlertTitle>
                  {signalDetailDialog.description}
                </Alert>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Location
                    </Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ color: colors.text }}>
                      {signalDetailDialog.location}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Business Impact
                    </Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ color: colors.text }}>
                      {formatCurrency(signalDetailDialog.impactValue)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Time to Impact
                    </Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ color: colors.text }}>
                      {signalDetailDialog.timeToImpact}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      Severity
                    </Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ color: colors.text }}>
                      {signalDetailDialog.severity}
                    </Typography>
                  </Grid>
                </Grid>

                {signalDetailDialog.recommendations && signalDetailDialog.recommendations.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: colors.text }}>
                      Recommended Actions:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                      {signalDetailDialog.recommendations.map((rec, idx) => (
                        <Box component="li" key={idx} sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ color: colors.text }}>{rec}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ bgcolor: colors.paper }}>
              <Button onClick={() => setSignalDetailDialog(null)}>Close</Button>
              <Button
                variant="contained"
                onClick={() => {
                  handleSimulateImpact(signalDetailDialog);
                  setSignalDetailDialog(null);
                }}
              >
                Simulate Impact
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MarketsAIDashboard;
