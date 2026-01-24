import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, Button, Breadcrumbs, Link, Stack, IconButton, Tooltip, alpha,
  TextField, Slider, Divider, Accordion, AccordionSummary, AccordionDetails, Chip, InputAdornment, Alert,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Refresh, NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon, Save, RestartAlt,
  ExpandMore, AccountBalance, LocalShipping, Warning, TrendingDown, Calculate, Info as InfoIcon,
} from '@mui/icons-material';
import stoxTheme from './stoxTheme';

// Dark Mode Color Helper
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
 * Cost Configuration Panel
 *
 * Purpose: Allow customer-specific cost economics
 *
 * Configurable Parameters:
 * 1. Holding Cost (Carrying Cost): 15-25% of inventory value
 *    - Cost of Capital (WACC): 8-12%
 *    - Warehousing & Handling: 2-4%
 *    - Obsolescence Risk: 2-5%
 *    - Insurance & Taxes: 1-2%
 *    - Shrinkage: 0.5-1%
 *
 * 2. Ordering Cost: $75-150/PO
 *    - Procurement Labor: $30-60/PO
 *    - Receiving & Inspection: $20-40/PO
 *    - AP Processing: $15-25/PO
 *    - System/Overhead: $10-20/PO
 *
 * 3. Stockout Cost:
 *    - Lost Sales × Gross Margin
 *    - Expedite Freight Premium: $200-1000/event
 *    - Customer Penalty / OTIF fines
 *    - Production Downtime
 *    - Backorder Admin Cost: $50-100/event
 */

const defaultCostConfig = {
  // Holding Cost Components (%)
  wacc: 10,
  warehousing: 3,
  obsolescence: 3,
  insurance: 1.5,
  shrinkage: 0.5,

  // Ordering Cost Components ($)
  procurementLabor: 45,
  receivingInspection: 30,
  apProcessing: 20,
  systemOverhead: 15,

  // Stockout Cost Components ($)
  avgGrossMargin: 35, // % for lost sales calculation
  expediteFreight: 500,
  otifPenalty: 250,
  productionDowntime: 1000,
  backorderAdmin: 75,
};

const CostConfiguration = ({ onBack, onSave, onTileClick, darkMode = false }) => {
  const colors = getColors(darkMode);
  const [config, setConfig] = useState(defaultCostConfig);
  const [expanded, setExpanded] = useState(['holding', 'ordering', 'stockout']);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleReset = () => {
    setConfig(defaultCostConfig);
    setHasChanges(false);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(config);
    }
    setHasChanges(false);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(prev =>
      isExpanded
        ? [...prev, panel]
        : prev.filter(p => p !== panel)
    );
  };

  // Calculate totals
  const totalHoldingRate = config.wacc + config.warehousing + config.obsolescence + config.insurance + config.shrinkage;
  const totalOrderingCost = config.procurementLabor + config.receivingInspection + config.apProcessing + config.systemOverhead;
  const avgStockoutCost = config.expediteFreight + config.otifPenalty + config.backorderAdmin;

  const SliderField = ({ label, field, min, max, step, unit, description }) => (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="body2" fontWeight={500}>{label}</Typography>
        <Chip
          label={`${config[field]}${unit}`}
          size="small"
          sx={{ bgcolor: alpha('#106ebe', 0.1), color: '#106ebe', fontWeight: 700 }}
        />
      </Stack>
      <Slider
        value={config[field]}
        onChange={(e, value) => handleChange(field, value)}
        min={min}
        max={max}
        step={step}
        marks={[
          { value: min, label: `${min}${unit}` },
          { value: max, label: `${max}${unit}` },
        ]}
        sx={{ color: '#106ebe' }}
      />
      {description && (
        <Typography variant="caption" color="text.secondary">{description}</Typography>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: colors.background }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>STOX.AI</Link>
            <Link component="button" variant="body1" onClick={onBack} sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { textDecoration: 'underline', color: 'primary.main' }, cursor: 'pointer' }}>Layer 4: Optimization</Link>
            <Typography color="primary" variant="body1" fontWeight={600}>Cost Configuration</Typography>
          </Breadcrumbs>
          <Stack direction="row" spacing={1}>
            <Button startIcon={<RestartAlt />} onClick={handleReset} variant="outlined" size="small" disabled={!hasChanges}>
              Reset
            </Button>
            <Button startIcon={<Save />} onClick={handleSave} variant="contained" size="small" disabled={!hasChanges}>
              Save Configuration
            </Button>
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">Back</Button>
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <SettingsIcon sx={{ fontSize: 32, color: '#106ebe' }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="#106ebe">Cost Configuration</Typography>
            <Typography variant="body2" color="text.secondary">Configure customer-specific cost economics for WC optimization</Typography>
          </Box>
        </Stack>
      </Box>

      {hasChanges && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have unsaved changes. Click "Save Configuration" to apply.
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: '4px solid #106ebe', bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <AccountBalance sx={{ color: '#106ebe' }} />
                <Typography variant="body2" color="text.secondary">Total Holding Rate</Typography>
              </Stack>
              <Typography variant="h4" fontWeight={700} color="#106ebe">{totalHoldingRate.toFixed(1)}%</Typography>
              <Typography variant="caption" color="text.secondary">Annual carrying cost % of inventory value</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: '4px solid #10b981', bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <LocalShipping sx={{ color: '#10b981' }} />
                <Typography variant="body2" color="text.secondary">Total Ordering Cost</Typography>
              </Stack>
              <Typography variant="h4" fontWeight={700} color="#10b981">${totalOrderingCost}/PO</Typography>
              <Typography variant="caption" color="text.secondary">Cost per purchase order</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderLeft: '4px solid #ef4444', bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Warning sx={{ color: '#ef4444' }} />
                <Typography variant="body2" color="text.secondary">Avg Stockout Cost</Typography>
              </Stack>
              <Typography variant="h4" fontWeight={700} color="#ef4444">${avgStockoutCost}/event</Typography>
              <Typography variant="caption" color="text.secondary">Excluding lost margin</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Configuration Accordions */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Holding Cost */}
        <Accordion expanded={expanded.includes('holding')} onChange={handleAccordionChange('holding')} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: alpha('#106ebe', 0.05) }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <AccountBalance sx={{ color: '#106ebe' }} />
              <Box>
                <Typography fontWeight={700}>Holding Cost (Carrying Cost)</Typography>
                <Typography variant="caption" color="text.secondary">
                  Annual cost of holding inventory as % of inventory value
                </Typography>
              </Box>
              <Chip label={`${totalHoldingRate.toFixed(1)}%`} sx={{ bgcolor: '#106ebe', color: 'white', fontWeight: 700 }} />
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <SliderField
                  label="Cost of Capital (WACC)"
                  field="wacc"
                  min={5}
                  max={15}
                  step={0.5}
                  unit="%"
                  description="Weighted average cost of capital - opportunity cost of funds tied in inventory"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <SliderField
                  label="Warehousing & Handling"
                  field="warehousing"
                  min={1}
                  max={6}
                  step={0.5}
                  unit="%"
                  description="Storage space, utilities, equipment, labor for inventory management"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <SliderField
                  label="Obsolescence Risk"
                  field="obsolescence"
                  min={1}
                  max={8}
                  step={0.5}
                  unit="%"
                  description="Risk of inventory becoming obsolete, expired, or out of fashion"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <SliderField
                  label="Insurance & Taxes"
                  field="insurance"
                  min={0.5}
                  max={3}
                  step={0.25}
                  unit="%"
                  description="Property insurance, inventory taxes, and related fees"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <SliderField
                  label="Shrinkage"
                  field="shrinkage"
                  min={0.25}
                  max={2}
                  step={0.25}
                  unit="%"
                  description="Theft, damage, deterioration, and administrative errors"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Ordering Cost */}
        <Accordion expanded={expanded.includes('ordering')} onChange={handleAccordionChange('ordering')} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: alpha('#10b981', 0.05) }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <LocalShipping sx={{ color: '#10b981' }} />
              <Box>
                <Typography fontWeight={700}>Ordering Cost</Typography>
                <Typography variant="caption" color="text.secondary">
                  Cost to place and receive a purchase order
                </Typography>
              </Box>
              <Chip label={`$${totalOrderingCost}/PO`} sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 700 }} />
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <SliderField
                  label="Procurement Labor"
                  field="procurementLabor"
                  min={20}
                  max={80}
                  step={5}
                  unit="$"
                  description="Time spent by procurement team to create and manage PO"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <SliderField
                  label="Receiving & Inspection"
                  field="receivingInspection"
                  min={10}
                  max={60}
                  step={5}
                  unit="$"
                  description="Warehouse labor for receiving, inspection, and put-away"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <SliderField
                  label="AP Processing"
                  field="apProcessing"
                  min={10}
                  max={40}
                  step={5}
                  unit="$"
                  description="Accounts payable invoice processing and payment"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <SliderField
                  label="System/Overhead"
                  field="systemOverhead"
                  min={5}
                  max={30}
                  step={5}
                  unit="$"
                  description="IT systems, communications, and administrative overhead"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Stockout Cost */}
        <Accordion expanded={expanded.includes('stockout')} onChange={handleAccordionChange('stockout')} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ bgcolor: alpha('#ef4444', 0.05) }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Warning sx={{ color: '#ef4444' }} />
              <Box>
                <Typography fontWeight={700}>Stockout Cost</Typography>
                <Typography variant="caption" color="text.secondary">
                  Cost incurred when inventory is not available
                </Typography>
              </Box>
              <Chip label={`$${avgStockoutCost}+ /event`} sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 700 }} />
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <SliderField
                  label="Average Gross Margin"
                  field="avgGrossMargin"
                  min={15}
                  max={60}
                  step={5}
                  unit="%"
                  description="Used to calculate lost margin from stockouts (Lost Sales × Margin)"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <SliderField
                  label="Expedite Freight Premium"
                  field="expediteFreight"
                  min={100}
                  max={1500}
                  step={50}
                  unit="$"
                  description="Air freight or express shipping to recover from stockout"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <SliderField
                  label="OTIF Penalty / Fines"
                  field="otifPenalty"
                  min={0}
                  max={1000}
                  step={50}
                  unit="$"
                  description="Customer penalties for missed on-time-in-full deliveries"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <SliderField
                  label="Production Downtime"
                  field="productionDowntime"
                  min={0}
                  max={5000}
                  step={100}
                  unit="$"
                  description="Manufacturing line stoppage cost per event"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <SliderField
                  label="Backorder Admin Cost"
                  field="backorderAdmin"
                  min={25}
                  max={200}
                  step={25}
                  unit="$"
                  description="Administrative cost to manage backorders"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Formula Reference */}
        <Paper sx={{ p: 2, mt: 2, bgcolor: darkMode ? alpha('#64748b', 0.1) : alpha('#64748b', 0.05), border: `1px solid ${colors.border}` }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Calculate sx={{ color: '#64748b' }} />
            <Typography variant="subtitle2" fontWeight={700}>Key Formulas</Typography>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>Annual Carrying Cost</Typography>
              <Typography variant="caption" color="text.secondary">
                = Inventory Value × {totalHoldingRate.toFixed(1)}%
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>EOQ (Economic Order Quantity)</Typography>
              <Typography variant="caption" color="text.secondary">
                = √(2 × Annual Demand × ${totalOrderingCost} / Unit Cost × {totalHoldingRate.toFixed(1)}%)
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>Lost Margin per Stockout</Typography>
              <Typography variant="caption" color="text.secondary">
                = Lost Sales Units × Unit Price × {config.avgGrossMargin}%
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default CostConfiguration;
