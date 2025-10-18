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
  IconButton,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Badge,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Email as EmailIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Business as VendorIcon,
  Person as CustomerIcon,
  Receipt as OrderIcon,
  Notifications as EscalationIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Analytics as AnalyticsIcon,
  SentimentSatisfied as SentimentPositiveIcon,
  SentimentDissatisfied as SentimentNegativeIcon,
  SentimentNeutral as SentimentNeutralIcon,
} from '@mui/icons-material';

const EmailIntelligence = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  const stats = {
    totalEmails: 1247,
    vendorEmails: 432,
    customerInquiries: 615,
    orderConfirmations: 145,
    escalations: 55,
  };

  const vendorCommunications = [
    {
      id: 1,
      vendor: 'ABC Suppliers Inc.',
      subject: 'Delivery Schedule Update',
      date: '2025-10-18',
      status: 'pending',
      priority: 'high',
      sentiment: 'neutral',
    },
    {
      id: 2,
      vendor: 'XYZ Manufacturing',
      subject: 'Invoice #12345 Dispute',
      date: '2025-10-17',
      status: 'escalated',
      priority: 'critical',
      sentiment: 'negative',
    },
    {
      id: 3,
      vendor: 'Global Logistics Ltd',
      subject: 'Shipment Confirmation',
      date: '2025-10-16',
      status: 'resolved',
      priority: 'normal',
      sentiment: 'positive',
    },
  ];

  const customerInquiries = [
    {
      id: 1,
      customer: 'Acme Corporation',
      subject: 'Product Availability Query',
      date: '2025-10-18',
      status: 'open',
      responseTime: '2h',
      sentiment: 'neutral',
    },
    {
      id: 2,
      customer: 'Tech Solutions Inc',
      subject: 'Urgent: Order Delay Complaint',
      date: '2025-10-18',
      status: 'urgent',
      responseTime: '30m',
      sentiment: 'negative',
    },
    {
      id: 3,
      customer: 'Retail Partners LLC',
      subject: 'Thank you for excellent service',
      date: '2025-10-17',
      status: 'closed',
      responseTime: '1h',
      sentiment: 'positive',
    },
  ];

  const orderValidations = [
    {
      id: 1,
      orderNumber: 'ORD-2025-1001',
      customer: 'Acme Corporation',
      status: 'confirmed',
      amount: '$45,230',
      date: '2025-10-18',
      matchStatus: 'matched',
    },
    {
      id: 2,
      orderNumber: 'ORD-2025-1002',
      customer: 'Tech Solutions Inc',
      status: 'pending',
      amount: '$12,450',
      date: '2025-10-18',
      matchStatus: 'mismatch',
    },
  ];

  const escalations = [
    {
      id: 1,
      type: 'vendor_dispute',
      subject: 'Payment Terms Disagreement',
      party: 'XYZ Manufacturing',
      date: '2025-10-17',
      severity: 'high',
      status: 'open',
    },
    {
      id: 2,
      type: 'customer_complaint',
      subject: 'Delayed Delivery - 3rd Instance',
      party: 'Tech Solutions Inc',
      date: '2025-10-18',
      severity: 'critical',
      status: 'escalated',
    },
  ];

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
            onClick={() => setLoading(true)}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

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

      {/* Tab Content */}
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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Sentiment</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vendorCommunications.map((comm) => (
                  <TableRow key={comm.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#FF9800' }}>
                          {comm.vendor.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">{comm.vendor}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{comm.subject}</TableCell>
                    <TableCell>{comm.date}</TableCell>
                    <TableCell>
                      <Chip label={comm.priority} size="small" color={comm.priority === 'critical' ? 'error' : comm.priority === 'high' ? 'warning' : 'default'} />
                    </TableCell>
                    <TableCell>
                      <Chip label={comm.status} size="small" sx={{ bgcolor: alpha(getStatusColor(comm.status), 0.1), color: getStatusColor(comm.status) }} />
                    </TableCell>
                    <TableCell>{getSentimentIcon(comm.sentiment)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Response Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Sentiment</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customerInquiries.map((inquiry) => (
                  <TableRow key={inquiry.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#4CAF50' }}>
                          {inquiry.customer.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">{inquiry.customer}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{inquiry.subject}</TableCell>
                    <TableCell>{inquiry.date}</TableCell>
                    <TableCell>
                      <Chip label={inquiry.responseTime} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label={inquiry.status} size="small" sx={{ bgcolor: alpha(getStatusColor(inquiry.status), 0.1), color: getStatusColor(inquiry.status) }} />
                    </TableCell>
                    <TableCell>{getSentimentIcon(inquiry.sentiment)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order Number</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Match Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderValidations.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {order.orderNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {order.amount}
                      </Typography>
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <Chip label={order.status} size="small" sx={{ bgcolor: alpha(getStatusColor(order.status), 0.1), color: getStatusColor(order.status) }} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {order.matchStatus === 'matched' ? (
                          <CheckIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                        ) : (
                          <ErrorIcon sx={{ color: theme.palette.error.main, fontSize: 20 }} />
                        )}
                        <Typography variant="body2" sx={{ color: getStatusColor(order.matchStatus) }}>
                          {order.matchStatus}
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Party</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {escalations.map((esc) => (
                  <TableRow key={esc.id} hover sx={{ bgcolor: esc.severity === 'critical' ? alpha('#F44336', 0.05) : 'inherit' }}>
                    <TableCell>
                      <Chip
                        label={esc.type.replace('_', ' ')}
                        size="small"
                        icon={esc.type === 'vendor_dispute' ? <VendorIcon /> : <CustomerIcon />}
                      />
                    </TableCell>
                    <TableCell>{esc.subject}</TableCell>
                    <TableCell>{esc.party}</TableCell>
                    <TableCell>{esc.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={esc.severity}
                        size="small"
                        color={esc.severity === 'critical' ? 'error' : 'warning'}
                        icon={<WarningIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={esc.status} size="small" sx={{ bgcolor: alpha(getStatusColor(esc.status), 0.1), color: getStatusColor(esc.status) }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default EmailIntelligence;
