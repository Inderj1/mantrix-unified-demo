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
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Radar as RadarIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { getCategoriesArray, getCategoryById } from './markets/CategoryIcons';
import MarketCategoryTile from './markets/MarketCategoryTile';
import MarketCategoryDetail from './markets/MarketCategoryDetail';
import MarketConfigPanel from './markets/MarketConfigPanel';
import mockMarketSignals, { getSignalsByCategory, getTotalImpact, getCriticalSignals } from '../data/mockMarketData';
import { usePersistedState } from '../hooks/usePersistedState';

/**
 * MarketsAIDashboard - Main dashboard for market intelligence
 * Tile-based layout showing all 15 market signal categories
 */
const MarketsAIDashboard = () => {
  const categories = getCategoriesArray();

  // State - persisted configuration
  const [enabledCategories, setEnabledCategories] = usePersistedState(
    'mantrix-markets-enabled-categories',
    categories.map(c => c.id)
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

  // Calculate global metrics
  const totalImpact = getTotalImpact();
  const criticalSignals = getCriticalSignals();
  const totalActiveSignals = Object.values(mockMarketSignals).flat().length;

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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          background: '#ffffff',
          borderRadius: 2,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <RadarIcon sx={{ fontSize: 40, color: '#FF5722' }} />
            <Box>
              <Typography
                variant="h4"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: '#111827',
                  fontWeight: 700,
                  letterSpacing: '-0.025em',
                }}
              >
                MARKETS.AI
                <Chip
                  label="Market Intelligence"
                  size="small"
                  sx={{
                    bgcolor: '#fef3c7',
                    color: '#d97706',
                    fontWeight: 600,
                    border: '1px solid #fde68a',
                  }}
                />
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                Comprehensive market signal monitoring across 15 categories
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isScanning && (
              <Chip
                label="Scanning..."
                size="small"
                icon={<RefreshIcon />}
                sx={{ bgcolor: '#e3f2fd', color: '#2196f3' }}
              />
            )}
            <Tooltip title="Configure Categories">
              <IconButton
                onClick={() => setConfigPanelOpen(true)}
                sx={{
                  bgcolor: '#f5f5f5',
                  '&:hover': { bgcolor: '#e0e0e0' },
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Global Summary Metrics */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff3e0', height: '100%' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Active Categories
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#ff9800">
                {enabledCategories.length} / {categories.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Monitoring enabled
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ffebee', height: '100%' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Critical Signals
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#f44336">
                {criticalSignals.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Require immediate action
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e8f5e9', height: '100%' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Total Business Impact
              </Typography>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ color: totalImpact >= 0 ? '#4caf50' : '#f44336' }}
              >
                {formatCurrency(totalImpact)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {totalImpact >= 0 ? 'Opportunity value' : 'At risk'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Active Signals
              </Typography>
              <Typography variant="h4" fontWeight={700} color="#2196f3">
                {totalActiveSignals}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Across all categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category Tiles Grid */}
      <Box>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Market Signal Categories
        </Typography>

        <Grid container spacing={2}>
          {categories.map((category) => {
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
                />
              </Grid>
            );
          })}
        </Grid>
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
          />
        )}
      </Dialog>

      {/* Configuration Panel */}
      <MarketConfigPanel
        open={configPanelOpen}
        onClose={() => setConfigPanelOpen(false)}
        enabledCategories={enabledCategories}
        onSave={handleConfigSave}
      />

      {/* Signal Detail Dialog */}
      <Dialog
        open={!!signalDetailDialog}
        onClose={() => setSignalDetailDialog(null)}
        maxWidth="md"
        fullWidth
      >
        {signalDetailDialog && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{signalDetailDialog.name}</Typography>
                <IconButton onClick={() => setSignalDetailDialog(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ py: 2 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <AlertTitle>Signal Details</AlertTitle>
                  {signalDetailDialog.description}
                </Alert>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {signalDetailDialog.location}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Business Impact
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatCurrency(signalDetailDialog.impactValue)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Time to Impact
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {signalDetailDialog.timeToImpact}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Severity
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {signalDetailDialog.severity}
                    </Typography>
                  </Grid>
                </Grid>

                {signalDetailDialog.recommendations && signalDetailDialog.recommendations.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Recommended Actions:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                      {signalDetailDialog.recommendations.map((rec, idx) => (
                        <Box component="li" key={idx} sx={{ mb: 1 }}>
                          <Typography variant="body2">{rec}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
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
