import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  IconButton,
  Tooltip,
  alpha,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh,
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon,
  LocalHospital as HospitalIcon,
  CheckCircle,
  Schedule,
  Error as ErrorIcon,
} from '@mui/icons-material';

const ConsignmentKitProcess = ({ onBack }) => {
  const [processData, setProcessData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalKits: 0,
    activeKits: 0,
    inTransit: 0,
    completedToday: 0,
  });

  useEffect(() => {
    fetchProcessData();
  }, []);

  const fetchProcessData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/stox/consignment-kit-process');
      const data = await response.json();

      if (data.success) {
        setProcessData(data.processes || []);
        setStats(data.stats || {
          totalKits: 0,
          activeKits: 0,
          inTransit: 0,
          completedToday: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching consignment kit process data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processSteps = [
    {
      step: 1,
      activity: 'Kit Request',
      owner: 'Hospital',
      duration: '2-4 hrs',
      status: 'Active',
      icon: <HospitalIcon />,
      color: '#2b88d8',
    },
    {
      step: 2,
      activity: 'Transfer Order',
      owner: 'Distributor',
      duration: '1 hr',
      status: 'Active',
      icon: <InventoryIcon />,
      color: '#10b981',
    },
    {
      step: 3,
      activity: 'Pick & Ship DC',
      owner: 'Distributor',
      duration: '1-2 days',
      status: 'Transit',
      icon: <ShippingIcon />,
      color: '#f59e0b',
    },
    {
      step: 4,
      activity: 'Kit in Transit',
      owner: 'FedEx',
      duration: '1-2 days',
      status: 'Transit',
      icon: <ShippingIcon />,
      color: '#f59e0b',
    },
    {
      step: 5,
      activity: 'Receipt',
      owner: 'Hospital',
      duration: '2-4 hrs',
      status: 'Pending',
      icon: <HospitalIcon />,
      color: '#64748b',
    },
    {
      step: 6,
      activity: 'Surgery',
      owner: 'Hospital',
      duration: '1-2 days',
      status: 'Pending',
      icon: <HospitalIcon />,
      color: '#64748b',
    },
    {
      step: 7,
      activity: 'Usage Record',
      owner: 'Distributor',
      duration: '1 hr',
      status: 'Pending',
      icon: <InventoryIcon />,
      color: '#64748b',
    },
    {
      step: 8,
      activity: 'Ship Replacements',
      owner: 'Distributor',
      duration: '1 day',
      status: 'Pending',
      icon: <ShippingIcon />,
      color: '#64748b',
    },
    {
      step: 9,
      activity: 'Replace Transit',
      owner: 'FedEx',
      duration: '1-2 days',
      status: 'Transit',
      icon: <ShippingIcon />,
      color: '#f59e0b',
    },
    {
      step: 10,
      activity: 'Restock Kit',
      owner: 'Distributor',
      duration: '2-4 hrs',
      status: 'Pending',
      icon: <InventoryIcon />,
      color: '#64748b',
    },
    {
      step: 11,
      activity: 'Kit Available',
      owner: 'Hospital',
      duration: 'N/A',
      status: 'Complete',
      icon: <CheckCircle />,
      color: '#10b981',
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <Schedule fontSize="small" sx={{ color: '#2b88d8' }} />;
      case 'Transit':
        return <ShippingIcon fontSize="small" sx={{ color: '#f59e0b' }} />;
      case 'Complete':
        return <CheckCircle fontSize="small" sx={{ color: '#10b981' }} />;
      case 'Pending':
        return <Schedule fontSize="small" sx={{ color: '#64748b' }} />;
      default:
        return <ErrorIcon fontSize="small" sx={{ color: '#ef4444' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'primary';
      case 'Transit':
        return 'warning';
      case 'Complete':
        return 'success';
      case 'Pending':
        return 'default';
      default:
        return 'error';
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <InventoryIcon sx={{ fontSize: 40, color: '#10b981' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={700}>
              Consignment Kit Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              End-to-end consignment kit lifecycle tracking
            </Typography>
          </Box>
          <Button startIcon={<Refresh />} onClick={fetchProcessData} variant="outlined" size="small">
            Refresh
          </Button>
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
            Back
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: alpha('#2b88d8', 0.05), borderLeft: `4px solid #2b88d8` }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Total Kits
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#2b88d8' }}>
                {stats.totalKits}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: alpha('#10b981', 0.05), borderLeft: `4px solid #10b981` }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Active Kits
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#10b981' }}>
                {stats.activeKits}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: alpha('#f59e0b', 0.05), borderLeft: `4px solid #f59e0b` }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                In Transit
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#f59e0b' }}>
                {stats.inTransit}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: alpha('#0078d4', 0.05), borderLeft: `4px solid #0078d4` }}>
            <CardContent sx={{ py: 1.5, px: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Completed Today
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#0078d4' }}>
                {stats.completedToday}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Process Flow */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
          Consignment Kit Process Flow
        </Typography>

        {loading ? (
          <LinearProgress />
        ) : (
          <Grid container spacing={2}>
            {processSteps.map((step, index) => (
              <Grid item xs={12} key={step.step}>
                <Card
                  sx={{
                    border: '2px solid',
                    borderColor: alpha(step.color, 0.3),
                    bgcolor: alpha(step.color, 0.02),
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: step.color,
                      bgcolor: alpha(step.color, 0.05),
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <CardContent sx={{ py: 2, px: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                      {/* Step Number */}
                      <Grid item xs={12} sm={1}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            bgcolor: step.color,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '1.2rem',
                          }}
                        >
                          {step.step}
                        </Box>
                      </Grid>

                      {/* Activity */}
                      <Grid item xs={12} sm={3}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ color: step.color }}>{step.icon}</Box>
                          <Box>
                            <Typography variant="body1" fontWeight={600}>
                              {step.activity}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>

                      {/* Owner */}
                      <Grid item xs={12} sm={2}>
                        <Typography variant="body2" color="text.secondary">
                          Owner
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {step.owner}
                        </Typography>
                      </Grid>

                      {/* Duration */}
                      <Grid item xs={12} sm={2}>
                        <Typography variant="body2" color="text.secondary">
                          Duration
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {step.duration}
                        </Typography>
                      </Grid>

                      {/* Status */}
                      <Grid item xs={12} sm={2}>
                        <Chip
                          label={step.status}
                          color={getStatusColor(step.status)}
                          size="small"
                          icon={getStatusIcon(step.status)}
                          sx={{ fontWeight: 600 }}
                        />
                      </Grid>

                      {/* Progress */}
                      <Grid item xs={12} sm={2}>
                        <Typography variant="caption" color="text.secondary">
                          {step.status === 'Complete' ? '100%' : step.status === 'Active' ? '75%' : step.status === 'Transit' ? '50%' : '0%'}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={step.status === 'Complete' ? 100 : step.status === 'Active' ? 75 : step.status === 'Transit' ? 50 : 0}
                          sx={{
                            height: 8,
                            borderRadius: 1,
                            bgcolor: alpha(step.color, 0.1),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: step.color,
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Connector Arrow */}
                {index < processSteps.length - 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                    <Box
                      sx={{
                        width: 2,
                        height: 24,
                        bgcolor: alpha('#64748b', 0.3),
                      }}
                    />
                  </Box>
                )}
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default ConsignmentKitProcess;
