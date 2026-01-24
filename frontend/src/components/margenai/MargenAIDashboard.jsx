import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Breadcrumbs,
  Link,
  Chip,
  Button,
  alpha,
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  ShowChart as ShowChartIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

// Import tab components
import ExecutiveSummaryTab from '../margen/ExecutiveSummaryTab';
import RevenueProfitabilityTab from '../margen/RevenueProfitabilityTab';
import CashWorkingCapitalTab from '../margen/CashWorkingCapitalTab';
import GrowthMarketTab from '../margen/GrowthMarketTab';
import ActionAccountabilityTab from '../margen/ActionAccountabilityTab';

const MargenAIDashboard = ({ onBack, onTileClick, darkMode = false }) => {
  const [activeTab, setActiveTab] = useState(0);

  const getColors = (darkMode) => ({
    primary: darkMode ? '#4d9eff' : '#00357a',
    text: darkMode ? '#e6edf3' : '#1e293b',
    textSecondary: darkMode ? '#8b949e' : '#64748b',
    background: darkMode ? '#0d1117' : '#f8fbfd',
    paper: darkMode ? '#161b22' : '#ffffff',
    cardBg: darkMode ? '#21262d' : '#ffffff',
    border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  });

  const colors = getColors(darkMode);

  const tabs = [
    { label: 'Executive Summary', icon: <AssessmentIcon sx={{ fontSize: 18 }} /> },
    { label: 'Revenue & Profitability', icon: <TrendingUpIcon sx={{ fontSize: 18 }} /> },
    { label: 'Cash & Working Capital', icon: <AccountBalanceIcon sx={{ fontSize: 18 }} /> },
    { label: 'Growth & Market', icon: <ShowChartIcon sx={{ fontSize: 18 }} /> },
    { label: 'Action & Accountability', icon: <AssignmentIcon sx={{ fontSize: 18 }} /> },
  ];

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: colors.background }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${colors.border}`,
          bgcolor: colors.paper,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 0.5 }}>
              <Link
                component="button"
                variant="body2"
                onClick={onBack}
                sx={{ textDecoration: 'none', color: colors.textSecondary, '&:hover': { color: colors.primary } }}
              >
                MARGEN.AI
              </Link>
              <Typography sx={{ color: colors.text }} variant="body2" fontWeight={600}>
                COPA Analytics
              </Typography>
            </Breadcrumbs>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AssessmentIcon sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
                  Arizona Beverages - COPA Analytics
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  Profitability Analysis & Margin Intelligence
                </Typography>
              </Box>
              <Chip
                label="COPA"
                size="small"
                sx={{
                  ml: 2,
                  fontWeight: 600,
                  bgcolor: alpha('#10b981', 0.12),
                  color: '#059669',
                }}
              />
            </Stack>
          </Box>
          <Stack direction="row" spacing={1}>
            {onBack && (
              <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
                Back
              </Button>
            )}
            <IconButton size="small" sx={{ bgcolor: alpha('#64748b', 0.08) }}>
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>

      {/* Tabs */}
      <Paper
        elevation={0}
        sx={{
          px: 3,
          borderBottom: `1px solid ${colors.border}`,
          bgcolor: colors.paper,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              minHeight: 56,
              color: colors.textSecondary,
              '&.Mui-selected': {
                color: '#10b981',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#10b981',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{ gap: 1 }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 3,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            },
          },
        }}
      >
        {activeTab === 0 && <ExecutiveSummaryTab />}
        {activeTab === 1 && <RevenueProfitabilityTab />}
        {activeTab === 2 && <CashWorkingCapitalTab />}
        {activeTab === 3 && <GrowthMarketTab />}
        {activeTab === 4 && <ActionAccountabilityTab />}
      </Box>
    </Box>
  );
};

export default MargenAIDashboard;
