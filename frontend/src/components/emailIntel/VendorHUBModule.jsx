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
  Business as BusinessIcon,
  Email as EmailIcon,
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

const MODULE_COLOR = '#00357a';

const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

// Mock vendor intent data
const vendorIntentData = [
  {
    id: 1,
    email_id: 101,
    sender_type: 'vendor',
    sender_name: 'Acme Industries',
    sender_email: 'ap@acme-industries.com',
    subject: 'Invoice 450123 Payment Status Inquiry',
    intent_type: 'question',
    intent_category: 'payment_status',
    confidence: 95,
    risk_level: 'low',
    extracted_entities: {
      document_numbers: ['450123'],
      amounts: ['$125,000'],
      dates: ['2024-01-15'],
      po_references: ['PO-78045'],
    },
    recommended_action: 'Query SAP and auto-reply with payment status',
    sap_tables_required: ['BKPF', 'BSEG'],
    status: 'pending',
    received_date: '2024-01-15',
  },
  {
    id: 2,
    email_id: 102,
    sender_type: 'vendor',
    sender_name: 'Global Manufacturing Co',
    sender_email: 'billing@globalman.com',
    subject: 'Request to Release Payment Block - Invoice 450789',
    intent_type: 'action',
    intent_category: 'block_release',
    confidence: 92,
    risk_level: 'medium',
    extracted_entities: {
      document_numbers: ['450789'],
      amounts: ['$87,500'],
      dates: ['2024-01-14'],
      po_references: ['PO-78102'],
    },
    recommended_action: 'Queue block release for AP Manager approval',
    sap_tables_required: ['RBKP', 'BSEG'],
    status: 'action_queued',
    received_date: '2024-01-14',
  },
  {
    id: 3,
    email_id: 103,
    sender_type: 'vendor',
    sender_name: 'Quality Parts Ltd',
    sender_email: 'orders@qualityparts.com',
    subject: 'PO-78156 Confirmation Request',
    intent_type: 'question',
    intent_category: 'po_status',
    confidence: 98,
    risk_level: 'low',
    extracted_entities: {
      document_numbers: [],
      amounts: ['$45,200'],
      dates: ['2024-01-20'],
      po_references: ['PO-78156'],
    },
    recommended_action: 'Query SAP and auto-reply with PO confirmation status',
    sap_tables_required: ['EKKO', 'EKPO'],
    status: 'processed',
    received_date: '2024-01-13',
  },
  {
    id: 4,
    email_id: 104,
    sender_type: 'vendor',
    sender_name: 'Logistics Pro Solutions',
    sender_email: 'dispatch@logipro.com',
    subject: 'Delivery Delay Notice - Shipment SH-5892',
    intent_type: 'action',
    intent_category: 'delivery_delay',
    confidence: 88,
    risk_level: 'high',
    extracted_entities: {
      document_numbers: ['SH-5892'],
      amounts: [],
      dates: ['2024-01-25', '2024-02-01'],
      po_references: ['PO-78089'],
    },
    recommended_action: 'Update schedule lines and notify procurement',
    sap_tables_required: ['EKKO', 'MSEG', 'MATDOC'],
    status: 'pending',
    received_date: '2024-01-12',
  },
  {
    id: 5,
    email_id: 105,
    sender_type: 'vendor',
    sender_name: 'Materials Direct Corp',
    sender_email: 'ar@matdirect.com',
    subject: 'Payment Received - Thank You',
    intent_type: 'question',
    intent_category: 'payment_status',
    confidence: 90,
    risk_level: 'low',
    extracted_entities: {
      document_numbers: ['PMT-892341'],
      amounts: ['$156,000'],
      dates: ['2024-01-10'],
      po_references: [],
    },
    recommended_action: 'No action required - informational',
    sap_tables_required: [],
    status: 'processed',
    received_date: '2024-01-11',
  },
  {
    id: 6,
    email_id: 106,
    sender_type: 'vendor',
    sender_name: 'Industrial Components LLC',
    sender_email: 'invoices@indcomp.com',
    subject: 'URGENT: Invoice 450234 - Payment Overdue',
    intent_type: 'action',
    intent_category: 'payment_status',
    confidence: 94,
    risk_level: 'high',
    extracted_entities: {
      document_numbers: ['450234'],
      amounts: ['$234,500'],
      dates: ['2024-01-01', '2024-01-15'],
      po_references: ['PO-77956'],
    },
    recommended_action: 'Escalate to AP Manager - payment past due',
    sap_tables_required: ['BKPF', 'BSEG', 'ACDOCA'],
    status: 'action_queued',
    received_date: '2024-01-10',
  },
  {
    id: 7,
    email_id: 107,
    sender_type: 'vendor',
    sender_name: 'Supply Chain Partners',
    sender_email: 'support@scpartners.com',
    subject: 'Request for Credit Note - Damaged Goods',
    intent_type: 'action',
    intent_category: 'block_release',
    confidence: 86,
    risk_level: 'medium',
    extracted_entities: {
      document_numbers: ['RET-45678'],
      amounts: ['$12,300'],
      dates: ['2024-01-08'],
      po_references: ['PO-78023'],
    },
    recommended_action: 'Queue credit note creation for approval',
    sap_tables_required: ['RBKP', 'BSEG'],
    status: 'pending',
    received_date: '2024-01-09',
  },
  {
    id: 8,
    email_id: 108,
    sender_type: 'vendor',
    sender_name: 'Premier Distributors Inc',
    sender_email: 'sales@premierdist.com',
    subject: 'Quote Response - Material Pricing Q1 2024',
    intent_type: 'question',
    intent_category: 'po_status',
    confidence: 82,
    risk_level: 'low',
    extracted_entities: {
      document_numbers: ['QT-2024-156'],
      amounts: ['$567,000'],
      dates: ['2024-03-31'],
      po_references: [],
    },
    recommended_action: 'Forward to procurement for review',
    sap_tables_required: [],
    status: 'pending',
    received_date: '2024-01-08',
  },
  {
    id: 9,
    email_id: 109,
    sender_type: 'vendor',
    sender_name: 'Worldwide Suppliers',
    sender_email: 'orders@worldwidesup.com',
    subject: 'PO-78178 Schedule Confirmation',
    intent_type: 'question',
    intent_category: 'delivery_delay',
    confidence: 91,
    risk_level: 'low',
    extracted_entities: {
      document_numbers: [],
      amounts: ['$89,400'],
      dates: ['2024-02-15'],
      po_references: ['PO-78178'],
    },
    recommended_action: 'Query SAP and confirm delivery schedule',
    sap_tables_required: ['EKKO', 'EKPO'],
    status: 'processed',
    received_date: '2024-01-07',
  },
  {
    id: 10,
    email_id: 110,
    sender_type: 'vendor',
    sender_name: 'Express Logistics',
    sender_email: 'tracking@expresslog.com',
    subject: 'Shipment Delivered - PO-78145',
    intent_type: 'question',
    intent_category: 'delivery_delay',
    confidence: 96,
    risk_level: 'low',
    extracted_entities: {
      document_numbers: ['TRK-894521'],
      amounts: [],
      dates: ['2024-01-06'],
      po_references: ['PO-78145'],
    },
    recommended_action: 'Update GR status if not already posted',
    sap_tables_required: ['MSEG', 'MATDOC'],
    status: 'processed',
    received_date: '2024-01-06',
  },
];

// Mock vendor action queue data
const vendorActionData = [
  {
    id: 1,
    action_id: 'ACT-20240115-001',
    source_email_id: 102,
    source_type: 'vendor',
    action_type: 'release_block',
    title: 'Release payment block for Invoice 450789',
    description: 'Global Manufacturing Co requests immediate payment release. GR confirmed and quantities match.',
    bapi_name: 'BAPI_INCOMINGINVOICE_CHANGE',
    bapi_payload: {
      INVOICEDOCNUMBER: '450789',
      COMPANYCODE: '1000',
      FISCALYEAR: '2024',
      BLOCKCODE: '',
    },
    financial_impact: '$87,500',
    risk_score: 45,
    required_approvals: ['AP Manager'],
    status: 'pending',
    assigned_to: 'AP Team',
    due_date: '2024-01-16',
    created_date: '2024-01-14',
    vendor_name: 'Global Manufacturing Co',
  },
  {
    id: 2,
    action_id: 'ACT-20240114-002',
    source_email_id: 106,
    source_type: 'vendor',
    action_type: 'send_reply',
    title: 'Escalate overdue payment - Invoice 450234',
    description: 'Industrial Components LLC invoice is 15 days past due. Requires immediate attention.',
    bapi_name: null,
    bapi_payload: null,
    financial_impact: '$234,500',
    risk_score: 85,
    required_approvals: ['AP Manager', 'Finance Director'],
    status: 'pending',
    assigned_to: 'Finance Team',
    due_date: '2024-01-15',
    created_date: '2024-01-10',
    vendor_name: 'Industrial Components LLC',
  },
  {
    id: 3,
    action_id: 'ACT-20240112-003',
    source_email_id: 104,
    source_type: 'vendor',
    action_type: 'update_schedule',
    title: 'Update delivery schedule - SH-5892',
    description: 'Logistics Pro Solutions reports 7-day delay. Update schedule lines in SAP.',
    bapi_name: 'BAPI_PO_CHANGE',
    bapi_payload: {
      PURCHASEORDER: 'PO-78089',
      DELIVERY_DATE: '2024-02-01',
    },
    financial_impact: null,
    risk_score: 65,
    required_approvals: ['Procurement Manager'],
    status: 'approved',
    assigned_to: 'Procurement Team',
    due_date: '2024-01-18',
    created_date: '2024-01-12',
    vendor_name: 'Logistics Pro Solutions',
  },
  {
    id: 4,
    action_id: 'ACT-20240109-004',
    source_email_id: 107,
    source_type: 'vendor',
    action_type: 'post_credit',
    title: 'Create credit note for damaged goods',
    description: 'Supply Chain Partners returned damaged materials. Credit note of $12,300 required.',
    bapi_name: 'BAPI_ACC_DOCUMENT_POST',
    bapi_payload: {
      DOCUMENTHEADER: {
        DOC_TYPE: 'KG',
        COMP_CODE: '1000',
      },
      AMOUNT: -12300,
      VENDOR: '100234',
    },
    financial_impact: '$12,300',
    risk_score: 40,
    required_approvals: ['AP Manager'],
    status: 'executing',
    assigned_to: 'AP Team',
    due_date: '2024-01-17',
    created_date: '2024-01-09',
    vendor_name: 'Supply Chain Partners',
  },
  {
    id: 5,
    action_id: 'ACT-20240108-005',
    source_email_id: 101,
    source_type: 'vendor',
    action_type: 'send_reply',
    title: 'Send payment status reply - Invoice 450123',
    description: 'Auto-generated reply with payment schedule for Acme Industries.',
    bapi_name: null,
    bapi_payload: null,
    financial_impact: '$125,000',
    risk_score: 15,
    required_approvals: [],
    status: 'completed',
    assigned_to: 'System',
    due_date: '2024-01-15',
    created_date: '2024-01-15',
    vendor_name: 'Acme Industries',
  },
  {
    id: 6,
    action_id: 'ACT-20240107-006',
    source_email_id: 103,
    source_type: 'vendor',
    action_type: 'send_reply',
    title: 'Send PO confirmation - PO-78156',
    description: 'Auto-reply confirming PO receipt for Quality Parts Ltd.',
    bapi_name: null,
    bapi_payload: null,
    financial_impact: '$45,200',
    risk_score: 10,
    required_approvals: [],
    status: 'completed',
    assigned_to: 'System',
    due_date: '2024-01-13',
    created_date: '2024-01-13',
    vendor_name: 'Quality Parts Ltd',
  },
];

// Mock SAP query data
const vendorSAPQueries = [
  {
    id: 1,
    query_id: 'QRY-20240115-001',
    email_id: 101,
    query_type: 'invoice_status',
    query_reference: '450123',
    sap_result: {
      document_type: 'Invoice',
      document_number: '450123',
      vendor: '100234 - Acme Industries',
      amount: 125000,
      currency: 'USD',
      posting_date: '2024-01-10',
      due_date: '2024-02-10',
      status: 'Posted - Payment Scheduled',
      block_reason: null,
      payment_run_date: '2024-02-08',
      gr_status: 'Complete',
      gr_date: '2024-01-08',
    },
    ai_analysis: 'Invoice is properly posted and scheduled for payment. No issues detected.',
    recommended_response: 'Dear Acme Industries,\n\nThank you for your inquiry regarding Invoice 450123.\n\nInvoice Status: Posted - Payment Scheduled\nAmount: $125,000.00\nPayment Run Date: February 8, 2024\n\nPlease let us know if you have any further questions.\n\nBest regards,\nAccounts Payable Team',
  },
  {
    id: 2,
    query_id: 'QRY-20240114-002',
    email_id: 102,
    query_type: 'invoice_status',
    query_reference: '450789',
    sap_result: {
      document_type: 'Invoice',
      document_number: '450789',
      vendor: '100456 - Global Manufacturing Co',
      amount: 87500,
      currency: 'USD',
      posting_date: '2024-01-05',
      due_date: '2024-02-05',
      status: 'Blocked - Quantity Variance',
      block_reason: 'GR quantity mismatch (PO: 1000, GR: 980)',
      payment_run_date: null,
      gr_status: 'Partial',
      gr_date: '2024-01-03',
    },
    ai_analysis: 'Block can be released - GR discrepancy is within tolerance (2%). Recommend approval for release.',
    recommended_response: 'Dear Global Manufacturing Co,\n\nRegarding Invoice 450789:\n\nWe have reviewed the block reason and determined the variance is within acceptable tolerance. Your request has been forwarded to our AP Manager for approval.\n\nExpected resolution: Within 2 business days\n\nBest regards,\nAccounts Payable Team',
  },
  {
    id: 3,
    query_id: 'QRY-20240113-003',
    email_id: 103,
    query_type: 'po_status',
    query_reference: 'PO-78156',
    sap_result: {
      document_type: 'Purchase Order',
      document_number: 'PO-78156',
      vendor: '100789 - Quality Parts Ltd',
      amount: 45200,
      currency: 'USD',
      posting_date: '2024-01-12',
      due_date: null,
      status: 'Confirmed',
      delivery_date: '2024-01-20',
      items: [
        { material: 'MAT-001', quantity: 500, unit: 'EA', price: 45.20 },
        { material: 'MAT-002', quantity: 200, unit: 'EA', price: 112.50 },
      ],
    },
    ai_analysis: 'PO is confirmed and on track for delivery. No issues detected.',
    recommended_response: 'Dear Quality Parts Ltd,\n\nPO-78156 Status: Confirmed\n\nDelivery Date: January 20, 2024\nTotal Value: $45,200.00\n\nItems:\n- MAT-001: 500 EA @ $45.20\n- MAT-002: 200 EA @ $112.50\n\nPlease proceed with shipment as scheduled.\n\nBest regards,\nProcurement Team',
  },
];

const VendorHUBModule = ({ onBack, darkMode = false }) => {
  const colors = getColors(darkMode);
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: 'Intent Analysis', icon: <PsychologyIcon />, count: vendorIntentData.length },
    { label: 'Action Queue', icon: <QueueIcon />, count: vendorActionData.filter(a => a.status === 'pending').length },
    { label: 'SAP Queries', icon: <StorageIcon />, count: vendorSAPQueries.length },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <IntentAnalysisTab data={vendorIntentData} darkMode={darkMode} sourceType="vendor" />;
      case 1:
        return <ActionQueueTab data={vendorActionData} darkMode={darkMode} sourceType="vendor" />;
      case 2:
        return <SAPQueryTab data={vendorSAPQueries} darkMode={darkMode} sourceType="vendor" />;
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
        ? 'linear-gradient(180deg, rgba(0, 53, 122, 0.1) 0%, #0d1117 50%)'
        : 'linear-gradient(180deg, rgba(0, 53, 122, 0.05) 0%, rgba(255, 255, 255, 1) 50%)',
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
              VENDOR HUB
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
                <BusinessIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography variant="h5" fontWeight={700} sx={{
                letterSpacing: '-0.5px',
                color: darkMode ? '#e6edf3' : MODULE_COLOR
              }}>
                VENDOR HUB
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
              AI-powered intent classification and action automation for vendor communications
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

export default VendorHUBModule;
