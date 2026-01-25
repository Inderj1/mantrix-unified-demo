import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Tabs,
  Tab,
  Chip,
  Avatar,
  Breadcrumbs,
  Link,
  alpha,
} from '@mui/material';
import {
  Person as PersonIcon,
  Psychology as PsychologyIcon,
  PlaylistAddCheck as QueueIcon,
  Storage as StorageIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Hub as HubIcon,
} from '@mui/icons-material';

// Import Tab Components
import IntentAnalysisTab from './tabs/IntentAnalysisTab';
import ActionQueueTab from './tabs/ActionQueueTab';
import SAPQueryTab from './tabs/SAPQueryTab';

const MODULE_COLOR = '#1a5a9e';

const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#1a5a9e',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

// Mock customer intent data
const customerIntentData = [
  {
    id: 1,
    email_id: 201,
    sender_type: 'customer',
    sender_name: 'TechStart Inc',
    sender_email: 'billing@techstart.io',
    subject: 'Invoice Dispute - Incorrect Pricing on Order ORD-45678',
    intent_type: 'action',
    intent_category: 'invoice_dispute',
    confidence: 94,
    risk_level: 'high',
    extracted_entities: {
      document_numbers: ['INV-78901', 'ORD-45678'],
      amounts: ['$15,200', '$12,800'],
      dates: ['2024-01-10'],
      po_references: [],
    },
    recommended_action: 'Queue credit memo for pricing difference review',
    sap_tables_required: ['VBRK', 'VBRP'],
    status: 'action_queued',
    received_date: '2024-01-15',
  },
  {
    id: 2,
    email_id: 202,
    sender_type: 'customer',
    sender_name: 'Global Retail Corp',
    sender_email: 'orders@globalretail.com',
    subject: 'Order Status Inquiry - ORD-45892',
    intent_type: 'question',
    intent_category: 'order_status',
    confidence: 97,
    risk_level: 'low',
    extracted_entities: {
      document_numbers: ['ORD-45892'],
      amounts: ['$34,500'],
      dates: ['2024-01-20'],
      po_references: ['CUST-PO-8976'],
    },
    recommended_action: 'Query SAP and auto-reply with order status',
    sap_tables_required: ['VBAK', 'VBAP'],
    status: 'processed',
    received_date: '2024-01-14',
  },
  {
    id: 3,
    email_id: 203,
    sender_type: 'customer',
    sender_name: 'Enterprise Solutions Ltd',
    sender_email: 'ap@enterprise-sol.com',
    subject: 'Payment Promise - Will Pay by Jan 25',
    intent_type: 'action',
    intent_category: 'payment_promise',
    confidence: 89,
    risk_level: 'medium',
    extracted_entities: {
      document_numbers: ['INV-78456', 'INV-78457'],
      amounts: ['$67,800'],
      dates: ['2024-01-25'],
      po_references: [],
    },
    recommended_action: 'Update dunning block and schedule follow-up',
    sap_tables_required: ['BSID', 'BSAD'],
    status: 'pending',
    received_date: '2024-01-13',
  },
  {
    id: 4,
    email_id: 204,
    sender_type: 'customer',
    sender_name: 'Mega Manufacturing',
    sender_email: 'finance@megaman.com',
    subject: 'Request for Account Statement - Q4 2023',
    intent_type: 'question',
    intent_category: 'account_statement',
    confidence: 96,
    risk_level: 'low',
    extracted_entities: {
      document_numbers: [],
      amounts: [],
      dates: ['2023-10-01', '2023-12-31'],
      po_references: [],
    },
    recommended_action: 'Generate and send account statement for Q4 2023',
    sap_tables_required: ['BSID', 'BSAD'],
    status: 'processed',
    received_date: '2024-01-12',
  },
  {
    id: 5,
    email_id: 205,
    sender_type: 'customer',
    sender_name: 'Financial Services Ltd',
    sender_email: 'procurement@finserv.com',
    subject: 'Delivery Confirmation Request - ORD-45756',
    intent_type: 'question',
    intent_category: 'order_status',
    confidence: 92,
    risk_level: 'low',
    extracted_entities: {
      document_numbers: ['ORD-45756', 'DEL-89012'],
      amounts: ['$23,400'],
      dates: ['2024-01-18'],
      po_references: ['CUST-PO-8901'],
    },
    recommended_action: 'Query SAP delivery status and reply',
    sap_tables_required: ['VBAK', 'VBAP', 'LIKP'],
    status: 'pending',
    received_date: '2024-01-11',
  },
  {
    id: 6,
    email_id: 206,
    sender_type: 'customer',
    sender_name: 'Healthcare Plus',
    sender_email: 'accounts@healthplus.org',
    subject: 'Credit Note Request - Returned Items',
    intent_type: 'action',
    intent_category: 'invoice_dispute',
    confidence: 91,
    risk_level: 'medium',
    extracted_entities: {
      document_numbers: ['RET-12345', 'INV-78234'],
      amounts: ['$8,900'],
      dates: ['2024-01-08'],
      po_references: [],
    },
    recommended_action: 'Queue credit note creation for returned items',
    sap_tables_required: ['VBRK', 'VBRP'],
    status: 'action_queued',
    received_date: '2024-01-10',
  },
  {
    id: 7,
    email_id: 207,
    sender_type: 'customer',
    sender_name: 'Education First',
    sender_email: 'purchasing@edufirst.edu',
    subject: 'Invoice Copy Request - INV-78567',
    intent_type: 'question',
    intent_category: 'account_statement',
    confidence: 98,
    risk_level: 'low',
    extracted_entities: {
      document_numbers: ['INV-78567'],
      amounts: ['$45,600'],
      dates: ['2024-01-05'],
      po_references: [],
    },
    recommended_action: 'Resend invoice copy via email',
    sap_tables_required: ['VBRK'],
    status: 'processed',
    received_date: '2024-01-09',
  },
  {
    id: 8,
    email_id: 208,
    sender_type: 'customer',
    sender_name: 'Logistics Pro',
    sender_email: 'billing@logipro.com',
    subject: 'Payment Dispute - Double Charged',
    intent_type: 'action',
    intent_category: 'invoice_dispute',
    confidence: 87,
    risk_level: 'high',
    extracted_entities: {
      document_numbers: ['INV-78901', 'PMT-45678'],
      amounts: ['$56,700'],
      dates: ['2024-01-03'],
      po_references: [],
    },
    recommended_action: 'Investigate duplicate payment and process refund',
    sap_tables_required: ['BSID', 'BSAD', 'REGUH'],
    status: 'pending',
    received_date: '2024-01-08',
  },
  {
    id: 9,
    email_id: 209,
    sender_type: 'customer',
    sender_name: 'Energy Systems',
    sender_email: 'orders@energy.com',
    subject: 'Order Modification Request - ORD-45901',
    intent_type: 'action',
    intent_category: 'order_status',
    confidence: 85,
    risk_level: 'medium',
    extracted_entities: {
      document_numbers: ['ORD-45901'],
      amounts: ['$78,400'],
      dates: ['2024-01-30'],
      po_references: ['CUST-PO-9012'],
    },
    recommended_action: 'Review order modification and route to sales',
    sap_tables_required: ['VBAK', 'VBAP'],
    status: 'pending',
    received_date: '2024-01-07',
  },
  {
    id: 10,
    email_id: 210,
    sender_type: 'customer',
    sender_name: 'Retail Chain Inc',
    sender_email: 'ap@retailchain.com',
    subject: 'Confirmation of Payment - INV-78123',
    intent_type: 'question',
    intent_category: 'payment_promise',
    confidence: 93,
    risk_level: 'low',
    extracted_entities: {
      document_numbers: ['INV-78123', 'PMT-45901'],
      amounts: ['$123,400'],
      dates: ['2024-01-06'],
      po_references: [],
    },
    recommended_action: 'Confirm payment receipt and update AR records',
    sap_tables_required: ['BSID', 'BSAD'],
    status: 'processed',
    received_date: '2024-01-06',
  },
];

// Mock customer action queue data
const customerActionData = [
  {
    id: 1,
    action_id: 'ACT-20240115-101',
    source_email_id: 201,
    source_type: 'customer',
    action_type: 'post_credit',
    title: 'Create credit memo for pricing dispute',
    description: 'TechStart Inc reports incorrect pricing on Order ORD-45678. Difference: $2,400.',
    bapi_name: 'BAPI_BILLINGDOC_CREATEMULTIPLE',
    bapi_payload: {
      BILLINGDOCUMENT_TYPE: 'G2',
      CUSTOMER: '200123',
      AMOUNT: -2400,
      REFERENCE: 'INV-78901',
    },
    financial_impact: '$2,400',
    risk_score: 55,
    required_approvals: ['AR Manager'],
    status: 'pending',
    assigned_to: 'AR Team',
    due_date: '2024-01-17',
    created_date: '2024-01-15',
    customer_name: 'TechStart Inc',
  },
  {
    id: 2,
    action_id: 'ACT-20240113-102',
    source_email_id: 203,
    source_type: 'customer',
    action_type: 'update_dunning',
    title: 'Update dunning block for payment promise',
    description: 'Enterprise Solutions Ltd committed to pay $67,800 by Jan 25. Block dunning until then.',
    bapi_name: 'BAPI_CUSTOMER_DUNNING_CHANGE',
    bapi_payload: {
      CUSTOMER: '200456',
      DUNNING_BLOCK: 'X',
      BLOCK_UNTIL: '2024-01-26',
    },
    financial_impact: '$67,800',
    risk_score: 40,
    required_approvals: [],
    status: 'approved',
    assigned_to: 'Collections Team',
    due_date: '2024-01-14',
    created_date: '2024-01-13',
    customer_name: 'Enterprise Solutions Ltd',
  },
  {
    id: 3,
    action_id: 'ACT-20240110-103',
    source_email_id: 206,
    source_type: 'customer',
    action_type: 'post_credit',
    title: 'Create credit note for returned items',
    description: 'Healthcare Plus returned items worth $8,900. Credit note required.',
    bapi_name: 'BAPI_BILLINGDOC_CREATEMULTIPLE',
    bapi_payload: {
      BILLINGDOCUMENT_TYPE: 'G2',
      CUSTOMER: '200789',
      AMOUNT: -8900,
      REFERENCE: 'RET-12345',
    },
    financial_impact: '$8,900',
    risk_score: 35,
    required_approvals: ['AR Manager'],
    status: 'executing',
    assigned_to: 'AR Team',
    due_date: '2024-01-16',
    created_date: '2024-01-10',
    customer_name: 'Healthcare Plus',
  },
  {
    id: 4,
    action_id: 'ACT-20240108-104',
    source_email_id: 208,
    source_type: 'customer',
    action_type: 'process_refund',
    title: 'Investigate and process refund for double charge',
    description: 'Logistics Pro was charged twice for $56,700. Investigate and process refund.',
    bapi_name: 'BAPI_ACC_DOCUMENT_POST',
    bapi_payload: {
      DOC_TYPE: 'DZ',
      CUSTOMER: '200234',
      AMOUNT: 56700,
    },
    financial_impact: '$56,700',
    risk_score: 75,
    required_approvals: ['AR Manager', 'Finance Director'],
    status: 'pending',
    assigned_to: 'Finance Team',
    due_date: '2024-01-15',
    created_date: '2024-01-08',
    customer_name: 'Logistics Pro',
  },
];

// Mock SAP query data for customers
const customerSAPQueries = [
  {
    id: 1,
    query_id: 'QRY-20240114-101',
    email_id: 202,
    query_type: 'order_status',
    query_reference: 'ORD-45892',
    sap_result: {
      document_type: 'Sales Order',
      document_number: 'ORD-45892',
      customer: '200456 - Global Retail Corp',
      amount: 34500,
      currency: 'USD',
      order_date: '2024-01-10',
      delivery_date: '2024-01-20',
      status: 'In Production',
      shipping_status: 'Pending',
      items: [
        { material: 'PROD-001', quantity: 100, unit: 'EA', price: 150.00 },
        { material: 'PROD-002', quantity: 200, unit: 'EA', price: 97.50 },
      ],
    },
    ai_analysis: 'Order is on track for delivery. Production 80% complete.',
    recommended_response: 'Dear Global Retail Corp,\n\nThank you for your inquiry regarding Order ORD-45892.\n\nOrder Status: In Production (80% complete)\nExpected Delivery: January 20, 2024\nTotal Value: $34,500.00\n\nYour order is on track and will ship as scheduled.\n\nBest regards,\nCustomer Service Team',
  },
  {
    id: 2,
    query_id: 'QRY-20240112-102',
    email_id: 204,
    query_type: 'account_statement',
    query_reference: 'ACCT-200789',
    sap_result: {
      document_type: 'Account Statement',
      customer: '200789 - Mega Manufacturing',
      period: 'Q4 2023',
      opening_balance: 45000,
      total_invoices: 234500,
      total_payments: 256000,
      closing_balance: 23500,
      transactions: [
        { date: '2023-10-05', type: 'Invoice', ref: 'INV-77901', amount: 78500 },
        { date: '2023-10-20', type: 'Payment', ref: 'PMT-44501', amount: -78500 },
        { date: '2023-11-10', type: 'Invoice', ref: 'INV-78123', amount: 89000 },
        { date: '2023-11-25', type: 'Payment', ref: 'PMT-44678', amount: -89000 },
        { date: '2023-12-05', type: 'Invoice', ref: 'INV-78456', amount: 67000 },
        { date: '2023-12-28', type: 'Payment', ref: 'PMT-44890', amount: -88500 },
      ],
    },
    ai_analysis: 'Account in good standing. All payments received on time.',
    recommended_response: 'Dear Mega Manufacturing,\n\nPlease find attached your account statement for Q4 2023.\n\nSummary:\n- Opening Balance: $45,000.00\n- Total Invoices: $234,500.00\n- Total Payments: $256,000.00\n- Closing Balance: $23,500.00\n\nThank you for your continued business.\n\nBest regards,\nAccounts Receivable Team',
  },
];

const CustomerHUBModule = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: 'Intent Analysis', icon: <PsychologyIcon />, count: customerIntentData.length },
    { label: 'Action Queue', icon: <QueueIcon />, count: customerActionData.filter(a => a.status === 'pending').length },
    { label: 'SAP Queries', icon: <StorageIcon />, count: customerSAPQueries.length },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <IntentAnalysisTab data={customerIntentData} darkMode={darkMode} sourceType="customer" />;
      case 1:
        return <ActionQueueTab data={customerActionData} darkMode={darkMode} sourceType="customer" />;
      case 2:
        return <SAPQueryTab data={customerSAPQueries} darkMode={darkMode} sourceType="customer" />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{
      p: 3,
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      background: darkMode
        ? 'linear-gradient(180deg, rgba(26, 90, 158, 0.1) 0%, #0d1117 50%)'
        : 'linear-gradient(180deg, rgba(26, 90, 158, 0.05) 0%, rgba(255, 255, 255, 1) 50%)',
    }}>
      {/* Header with Breadcrumbs */}
      <Paper elevation={0} sx={{
        p: 2,
        borderRadius: 0,
        mb: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        bgcolor: colors.paper,
        border: `1px solid ${colors.border}`,
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link
              component="button"
              variant="body1"
              onClick={onBack}
              sx={{
                textDecoration: 'none',
                color: colors.text,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              EMAIL INTEL
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              CUSTOMER HUB
            </Typography>
          </Breadcrumbs>

          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            variant="outlined"
            size="small"
            sx={{ borderColor: 'divider' }}
          >
            Back
          </Button>
        </Stack>

        {/* System Identity Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 4,
            height: 60,
            bgcolor: MODULE_COLOR,
            borderRadius: 2
          }} />
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: MODULE_COLOR }}>
                <PersonIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="h5" fontWeight={700} sx={{
                letterSpacing: '-0.5px',
                color: darkMode ? '#e6edf3' : MODULE_COLOR
              }}>
                CUSTOMER HUB
              </Typography>
              <Chip
                icon={<HubIcon sx={{ fontSize: 14 }} />}
                label="Intelligence Hub"
                size="small"
                sx={{
                  bgcolor: alpha(MODULE_COLOR, 0.1),
                  color: MODULE_COLOR,
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  '& .MuiChip-icon': { color: MODULE_COLOR },
                }}
              />
            </Stack>
            <Typography variant="body2" sx={{
              fontSize: '0.85rem',
              color: colors.textSecondary
            }}>
              AI-powered intent classification and action automation for customer inquiries
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{
        bgcolor: colors.paper,
        border: `1px solid ${colors.border}`,
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: `1px solid ${colors.border}`,
            bgcolor: darkMode ? colors.cardBg : alpha(MODULE_COLOR, 0.02),
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 56,
              color: colors.textSecondary,
              '&.Mui-selected': {
                color: MODULE_COLOR,
              },
            },
            '& .MuiTabs-indicator': {
              bgcolor: MODULE_COLOR,
              height: 3,
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  {tab.icon}
                  <span>{tab.label}</span>
                  <Chip
                    label={tab.count}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      bgcolor: activeTab === index ? alpha(MODULE_COLOR, 0.15) : alpha(colors.textSecondary, 0.1),
                      color: activeTab === index ? MODULE_COLOR : colors.textSecondary,
                      fontWeight: 600,
                    }}
                  />
                </Stack>
              }
            />
          ))}
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 0 }}>
          {renderTabContent()}
        </Box>
      </Paper>
    </Box>
  );
};

export default CustomerHUBModule;
