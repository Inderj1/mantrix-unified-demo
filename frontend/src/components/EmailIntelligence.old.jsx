import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Grid,
  Chip,
  Badge,
  Tabs,
  Tab,
  Avatar,
  useTheme,
  alpha,
  Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Email as EmailIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Business as VendorIcon,
  Person as CustomerIcon,
  Receipt as OrderIcon,
  Notifications as EscalationIcon,
  Refresh as RefreshIcon,
  SentimentSatisfied as SentimentPositiveIcon,
  SentimentDissatisfied as SentimentNegativeIcon,
  SentimentNeutral as SentimentNeutralIcon,
} from '@mui/icons-material';

const EmailIntelligence = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data state
  const [stats, setStats] = useState({
    totalEmails: 0,
    vendorEmails: 0,
    customerInquiries: 0,
    orderConfirmations: 0,
    escalations: 0,
  });
  const [vendorCommunications, setVendorCommunications] = useState([]);
  const [customerInquiries, setCustomerInquiries] = useState([]);
  const [orderValidations, setOrderValidations] = useState([]);
  const [escalations, setEscalations] = useState([]);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch stats
      const statsResponse = await fetch('/api/v1/comms/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          totalEmails: statsData.total_emails,
          vendorEmails: statsData.vendor_emails,
          customerInquiries: statsData.customer_inquiries,
          orderConfirmations: statsData.order_confirmations,
          escalations: statsData.escalations,
        });
      }

      // Fetch vendor communications
      const vendorResponse = await fetch('/api/v1/comms/vendor-communications');
      if (vendorResponse.ok) {
        const vendorData = await vendorResponse.json();
        setVendorCommunications(vendorData);
      }

      // Fetch customer inquiries
      const customerResponse = await fetch('/api/v1/comms/customer-inquiries');
      if (customerResponse.ok) {
        const customerData = await customerResponse.json();
        setCustomerInquiries(customerData);
      }

      // Fetch order validations
      const orderResponse = await fetch('/api/v1/comms/order-validations');
      if (orderResponse.ok) {
        const orderData = await orderResponse.json();
        setOrderValidations(orderData);
      }

      // Fetch escalations
      const escalationsResponse = await fetch('/api/v1/comms/escalations');
      if (escalationsResponse.ok) {
        const escalationsData = await escalationsResponse.json();
        setEscalations(escalationsData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
      case 'confirmed':
      case 'closed':
      case 'matched':
        return theme.palette.success.main;
      case 'pending':
      case 'open':
        return theme.palette.warning.main;
      case 'escalated':
      case 'urgent':
      case 'critical':
      case 'mismatch':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <SentimentPositiveIcon sx={{ color: theme.palette.success.main }} />;
      case 'negative':
        return <SentimentNegativeIcon sx={{ color: theme.palette.error.main }} />;
      default:
        return <SentimentNeutralIcon sx={{ color: theme.palette.grey[500] }} />;
    }
  };

  // DataGrid columns for vendor communications
  const vendorColumns = [
    {
      field: 'vendor_name',
      headerName: 'Vendor',
      width: 200,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#FF9800' }}>
            {params.value?.charAt(0)}
          </Avatar>
          <Typography variant="body2">{params.value}</Typography>
        </Stack>
      ),
    },
    { field: 'subject', headerName: 'Subject', width: 300, flex: 1 },
    { field: 'email_date', headerName: 'Date', width: 120 },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'critical' ? 'error' : params.value === 'high' ? 'warning' : 'default'}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{ bgcolor: alpha(getStatusColor(params.value), 0.1), color: getStatusColor(params.value) }}
        />
      ),
    },
    {
      field: 'sentiment',
      headerName: 'Sentiment',
      width: 100,
      renderCell: (params) => getSentimentIcon(params.value),
    },
  ];

  // DataGrid columns for customer inquiries
  const customerColumns = [
    {
      field: 'customer_name',
      headerName: 'Customer',
      width: 200,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#4CAF50' }}>
            {params.value?.charAt(0)}
          </Avatar>
          <Typography variant="body2">{params.value}</Typography>
        </Stack>
      ),
    },
    { field: 'subject', headerName: 'Subject', width: 300, flex: 1 },
    { field: 'email_date', headerName: 'Date', width: 120 },
    {
      field: 'response_time',
      headerName: 'Response Time',
      width: 130,
      renderCell: (params) => (
        <Chip label={params.value || 'N/A'} size="small" variant="outlined" />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{ bgcolor: alpha(getStatusColor(params.value), 0.1), color: getStatusColor(params.value) }}
        />
      ),
    },
    {
      field: 'sentiment',
      headerName: 'Sentiment',
      width: 100,
      renderCell: (params) => getSentimentIcon(params.value),
    },
  ];

  // DataGrid columns for order validations
  const orderColumns = [
    {
      field: 'order_number',
      headerName: 'Order Number',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          {params.value}
        </Typography>
      ),
    },
    { field: 'customer_name', headerName: 'Customer', width: 200 },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600}>
          ${params.value?.toFixed(2)}
        </Typography>
      ),
    },
    { field: 'order_date', headerName: 'Date', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{ bgcolor: alpha(getStatusColor(params.value), 0.1), color: getStatusColor(params.value) }}
        />
      ),
    },
    {
      field: 'match_status',
      headerName: 'Match Status',
      width: 150,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          {params.value === 'matched' ? (
            <CheckIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
          ) : (
            <ErrorIcon sx={{ color: theme.palette.error.main, fontSize: 20 }} />
          )}
          <Typography variant="body2" sx={{ color: getStatusColor(params.value) }}>
            {params.value}
          </Typography>
        </Stack>
      ),
    },
  ];

  // DataGrid columns for escalations
  const escalationColumns = [
    {
      field: 'escalation_type',
      headerName: 'Type',
      width: 180,
      renderCell: (params) => (
        <Chip
          label={params.value?.replace('_', ' ')}
          size="small"
          icon={params.value === 'vendor_dispute' ? <VendorIcon /> : <CustomerIcon />}
        />
      ),
    },
    { field: 'subject', headerName: 'Subject', width: 300, flex: 1 },
    { field: 'party_name', headerName: 'Party', width: 200 },
    { field: 'escalation_date', headerName: 'Date', width: 120 },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'critical' ? 'error' : 'warning'}
          icon={<WarningIcon />}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{ bgcolor: alpha(getStatusColor(params.value), 0.1), color: getStatusColor(params.value) }}
        />
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              COMMS.AI
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Email & Communication Intelligence Platform
            </Typography>
          </Box>
          <Button
            startIcon={<RefreshIcon />}
            variant="outlined"
            onClick={fetchData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: alpha('#2196F3', 0.1), border: '1px solid', borderColor: alpha('#2196F3', 0.2) }}>
            <CardContent>
              <Stack spacing={1}>
                <EmailIcon sx={{ color: '#2196F3', fontSize: 32 }} />
                <Typography variant="h4" fontWeight={700}>
                  {stats.totalEmails}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Emails
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: alpha('#FF9800', 0.1), border: '1px solid', borderColor: alpha('#FF9800', 0.2) }}>
            <CardContent>
              <Stack spacing={1}>
                <VendorIcon sx={{ color: '#FF9800', fontSize: 32 }} />
                <Typography variant="h4" fontWeight={700}>
                  {stats.vendorEmails}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Vendor Communications
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: alpha('#4CAF50', 0.1), border: '1px solid', borderColor: alpha('#4CAF50', 0.2) }}>
            <CardContent>
              <Stack spacing={1}>
                <CustomerIcon sx={{ color: '#4CAF50', fontSize: 32 }} />
                <Typography variant="h4" fontWeight={700}>
                  {stats.customerInquiries}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Customer Inquiries
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: alpha('#9C27B0', 0.1), border: '1px solid', borderColor: alpha('#9C27B0', 0.2) }}>
            <CardContent>
              <Stack spacing={1}>
                <OrderIcon sx={{ color: '#9C27B0', fontSize: 32 }} />
                <Typography variant="h4" fontWeight={700}>
                  {stats.orderConfirmations}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Order Confirmations
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: alpha('#F44336', 0.1), border: '1px solid', borderColor: alpha('#F44336', 0.2) }}>
            <CardContent>
              <Stack spacing={1}>
                <Badge badgeContent={escalations.filter(e => e.status === 'escalated').length} color="error">
                  <EscalationIcon sx={{ color: '#F44336', fontSize: 32 }} />
                </Badge>
                <Typography variant="h4" fontWeight={700}>
                  {stats.escalations}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Escalations
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
            },
          }}
        >
          <Tab icon={<VendorIcon />} iconPosition="start" label="Vendor Communications" />
          <Tab icon={<CustomerIcon />} iconPosition="start" label="Customer Inquiries" />
          <Tab icon={<OrderIcon />} iconPosition="start" label="Order Validations" />
          <Tab icon={<EscalationIcon />} iconPosition="start" label="Escalations" />
        </Tabs>
      </Paper>

      {/* Tab Content with DataGrid */}
      {activeTab === 0 && (
        <Paper>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Vendor Communication Tracking
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Track and analyze communications with suppliers and vendors
            </Typography>
          </Box>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={vendorCommunications}
              columns={vendorColumns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              loading={loading}
              disableSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
              }}
            />
          </Box>
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Customer Inquiry Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Monitor and respond to customer inquiries with AI-powered insights
            </Typography>
          </Box>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={customerInquiries}
              columns={customerColumns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              loading={loading}
              disableSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
              }}
            />
          </Box>
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Confirmation Validation
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Automated validation of order confirmations against ERP data
            </Typography>
          </Box>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={orderValidations}
              columns={orderColumns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              loading={loading}
              disableSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
              }}
            />
          </Box>
        </Paper>
      )}

      {activeTab === 3 && (
        <Paper>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Escalation Detection
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              AI-powered detection of issues requiring immediate attention
            </Typography>
          </Box>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={escalations}
              columns={escalationColumns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              loading={loading}
              disableSelectionOnClick
              getRowClassName={(params) =>
                params.row.severity === 'critical' ? 'critical-row' : ''
              }
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
                '& .critical-row': {
                  bgcolor: alpha('#F44336', 0.05),
                },
              }}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default EmailIntelligence;
