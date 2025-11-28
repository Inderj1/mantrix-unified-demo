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
} from '@mui/icons-material';

// Import tab components
import ExecutiveSummaryTab from './margen/ExecutiveSummaryTab';
import RevenueProfitabilityTab from './margen/RevenueProfitabilityTab';
import CashWorkingCapitalTab from './margen/CashWorkingCapitalTab';
import GrowthMarketTab from './margen/GrowthMarketTab';
import ActionAccountabilityTab from './margen/ActionAccountabilityTab';

const MargenAIDashboard = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: 'Executive Summary', icon: <AssessmentIcon sx={{ fontSize: 18 }} /> },
    { label: 'Revenue & Profitability', icon: <TrendingUpIcon sx={{ fontSize: 18 }} /> },
    { label: 'Cash & Working Capital', icon: <AccountBalanceIcon sx={{ fontSize: 18 }} /> },
    { label: 'Growth & Market', icon: <ShowChartIcon sx={{ fontSize: 18 }} /> },
    { label: 'Action & Accountability', icon: <AssignmentIcon sx={{ fontSize: 18 }} /> },
  ];

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          px: 3,
          py: 2,
          borderBottom: '1px solid',
          borderColor: alpha('#64748b', 0.15),
          bgcolor: 'white',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 0.5 }}>
              <Link
                component="button"
                variant="body2"
                onClick={onBack}
                sx={{ textDecoration: 'none', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
              >
                Home
              </Link>
              <Typography color="text.primary" variant="body2" fontWeight={600}>
                MARGEN.AI Dashboard
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
                <Typography variant="h5" fontWeight={700} color="#1e293b">
                  Arizona Beverages - COPA Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
          <IconButton size="small" sx={{ bgcolor: alpha('#64748b', 0.08) }}>
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Paper>

      {/* Tabs */}
      <Paper
        elevation={0}
        sx={{
          px: 3,
          borderBottom: '1px solid',
          borderColor: alpha('#64748b', 0.15),
          bgcolor: 'white',
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
              color: '#64748b',
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
