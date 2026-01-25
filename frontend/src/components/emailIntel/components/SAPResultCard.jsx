import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  alpha,
  Grid,
  Button,
  TextField,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Storage as StorageIcon,
  Lightbulb as LightbulbIcon,
  Email as EmailIcon,
  Send as SendIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const SAPResultCard = ({ result, darkMode = false, sourceType = 'vendor' }) => {
  const colors = getColors(darkMode);
  const moduleColor = sourceType === 'vendor' ? '#00357a' : '#1a5a9e';
  const [editingResponse, setEditingResponse] = useState(false);
  const [responseText, setResponseText] = useState(result?.recommended_response || '');
  const [showDetails, setShowDetails] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const sapResult = result.sap_result;

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(responseText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Paper sx={{
      bgcolor: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: 2,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <Box sx={{
        p: 2,
        bgcolor: alpha(moduleColor, darkMode ? 0.1 : 0.03),
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <StorageIcon sx={{ color: moduleColor }} />
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ color: colors.text }}>
                {sapResult.document_type}: {sapResult.document_number || result.query_reference}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Query ID: {result.query_id}
              </Typography>
            </Box>
          </Stack>
          <Chip
            label={result.query_type?.replace(/_/g, ' ')}
            size="small"
            sx={{
              bgcolor: alpha(moduleColor, 0.1),
              color: moduleColor,
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          />
        </Stack>
      </Box>

      {/* SAP Result Details */}
      <Box sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ color: colors.text }}>
            SAP Query Result
          </Typography>
          <IconButton size="small" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Stack>

        <Collapse in={showDetails}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {sapResult.vendor && (
              <Grid item xs={12} md={6}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Vendor</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>{sapResult.vendor}</Typography>
              </Grid>
            )}
            {sapResult.customer && (
              <Grid item xs={12} md={6}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Customer</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>{sapResult.customer}</Typography>
              </Grid>
            )}
            {sapResult.amount && (
              <Grid item xs={6} md={3}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Amount</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#10b981' }}>
                  ${sapResult.amount.toLocaleString()} {sapResult.currency}
                </Typography>
              </Grid>
            )}
            {sapResult.posting_date && (
              <Grid item xs={6} md={3}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Posting Date</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>{sapResult.posting_date}</Typography>
              </Grid>
            )}
            {sapResult.due_date && (
              <Grid item xs={6} md={3}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Due Date</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>{sapResult.due_date}</Typography>
              </Grid>
            )}
            {sapResult.delivery_date && (
              <Grid item xs={6} md={3}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Delivery Date</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>{sapResult.delivery_date}</Typography>
              </Grid>
            )}
            {sapResult.status && (
              <Grid item xs={12} md={6}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Status</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>{sapResult.status}</Typography>
              </Grid>
            )}
            {sapResult.block_reason && (
              <Grid item xs={12} md={6}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Block Reason</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#ef4444' }}>{sapResult.block_reason}</Typography>
              </Grid>
            )}
            {sapResult.payment_run_date && (
              <Grid item xs={6} md={3}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>Payment Run Date</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#10b981' }}>{sapResult.payment_run_date}</Typography>
              </Grid>
            )}
            {sapResult.gr_status && (
              <Grid item xs={6} md={3}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>GR Status</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>{sapResult.gr_status}</Typography>
              </Grid>
            )}
            {sapResult.gr_date && (
              <Grid item xs={6} md={3}>
                <Typography variant="caption" sx={{ color: colors.textSecondary }}>GR Date</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>{sapResult.gr_date}</Typography>
              </Grid>
            )}
          </Grid>

          {/* Line Items Table (if available) */}
          {sapResult.items && sapResult.items.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 600, mb: 1, display: 'block' }}>
                Line Items
              </Typography>
              <TableContainer component={Paper} sx={{ bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: darkMode ? colors.cardBg : 'grey.50' }}>
                      <TableCell sx={{ color: colors.text, fontWeight: 600 }}>Material</TableCell>
                      <TableCell align="right" sx={{ color: colors.text, fontWeight: 600 }}>Quantity</TableCell>
                      <TableCell sx={{ color: colors.text, fontWeight: 600 }}>Unit</TableCell>
                      <TableCell align="right" sx={{ color: colors.text, fontWeight: 600 }}>Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sapResult.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ color: colors.text }}>{item.material}</TableCell>
                        <TableCell align="right" sx={{ color: colors.text }}>{item.quantity}</TableCell>
                        <TableCell sx={{ color: colors.text }}>{item.unit}</TableCell>
                        <TableCell align="right" sx={{ color: '#10b981', fontWeight: 600 }}>${item.price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Transactions Table (for account statements) */}
          {sapResult.transactions && sapResult.transactions.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 600, mb: 1, display: 'block' }}>
                Transactions
              </Typography>
              <TableContainer component={Paper} sx={{ bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: darkMode ? colors.cardBg : 'grey.50' }}>
                      <TableCell sx={{ color: colors.text, fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ color: colors.text, fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ color: colors.text, fontWeight: 600 }}>Reference</TableCell>
                      <TableCell align="right" sx={{ color: colors.text, fontWeight: 600 }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sapResult.transactions.map((txn, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ color: colors.text }}>{txn.date}</TableCell>
                        <TableCell sx={{ color: colors.text }}>{txn.type}</TableCell>
                        <TableCell sx={{ color: colors.text }}>{txn.ref}</TableCell>
                        <TableCell align="right" sx={{ color: txn.amount >= 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                          ${Math.abs(txn.amount).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Collapse>
      </Box>

      <Divider />

      {/* AI Analysis */}
      <Box sx={{ p: 2, bgcolor: alpha('#10b981', darkMode ? 0.08 : 0.03) }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <LightbulbIcon sx={{ fontSize: 18, color: '#10b981' }} />
          <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#10b981' }}>
            AI Analysis
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: colors.text }}>
          {result.ai_analysis}
        </Typography>
      </Box>

      <Divider />

      {/* Recommended Response */}
      <Box sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <EmailIcon sx={{ fontSize: 18, color: moduleColor }} />
            <Typography variant="subtitle2" fontWeight={600} sx={{ color: colors.text }}>
              Recommended Response
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <IconButton
              size="small"
              onClick={() => setEditingResponse(!editingResponse)}
              sx={{ color: moduleColor }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleCopyResponse}
              sx={{ color: copied ? '#10b981' : colors.textSecondary }}
            >
              {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
            </IconButton>
          </Stack>
        </Stack>

        {editingResponse ? (
          <TextField
            fullWidth
            multiline
            rows={6}
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: colors.paper,
                color: colors.text,
                fontFamily: 'inherit',
                fontSize: '0.875rem',
              },
            }}
          />
        ) : (
          <Paper sx={{
            p: 2,
            bgcolor: darkMode ? '#0d1117' : '#f8f9fa',
            border: `1px solid ${colors.border}`,
            borderRadius: 1,
          }}>
            <Typography variant="body2" sx={{ color: colors.text, whiteSpace: 'pre-wrap' }}>
              {responseText}
            </Typography>
          </Paper>
        )}

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            sx={{
              bgcolor: moduleColor,
              '&:hover': { bgcolor: alpha(moduleColor, 0.9) },
            }}
          >
            Send Response
          </Button>
          <Button
            variant="outlined"
            sx={{
              borderColor: colors.border,
              color: colors.text,
            }}
          >
            Queue for Review
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default SAPResultCard;
