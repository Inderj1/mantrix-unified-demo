import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  alpha,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Storage as StorageIcon,
  Send as SendIcon,
} from '@mui/icons-material';

import SAPResultCard from '../components/SAPResultCard';

const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

const queryTypes = {
  vendor: [
    { value: 'invoice_status', label: 'Invoice Status', tables: ['BKPF', 'BSEG'] },
    { value: 'po_status', label: 'PO Status', tables: ['EKKO', 'EKPO'] },
    { value: 'payment_status', label: 'Payment Status', tables: ['BKPF', 'BSEG', 'REGUH'] },
    { value: 'delivery_status', label: 'Delivery Status', tables: ['MSEG', 'MATDOC'] },
  ],
  customer: [
    { value: 'order_status', label: 'Order Status', tables: ['VBAK', 'VBAP'] },
    { value: 'invoice_status', label: 'Invoice Status', tables: ['VBRK', 'VBRP'] },
    { value: 'account_statement', label: 'Account Statement', tables: ['BSID', 'BSAD'] },
    { value: 'delivery_status', label: 'Delivery Status', tables: ['LIKP', 'LIPS'] },
  ],
};

function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 1.5, justifyContent: 'flex-end' }}>
      <GridToolbarQuickFilter
        sx={{
          minWidth: 250,
          '& .MuiInput-root': {
            fontSize: '0.875rem',
          }
        }}
        debounceMs={300}
        placeholder="Search queries..."
      />
    </GridToolbarContainer>
  );
}

const SAPQueryTab = ({ data, darkMode = false, sourceType = 'vendor' }) => {
  const colors = getColors(darkMode);
  const moduleColor = sourceType === 'vendor' ? '#00357a' : '#1a5a9e';
  const [queryType, setQueryType] = useState('');
  const [queryReference, setQueryReference] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [isQuerying, setIsQuerying] = useState(false);

  const availableQueryTypes = queryTypes[sourceType];

  const handleExecuteQuery = () => {
    setIsQuerying(true);
    // Simulate query execution
    setTimeout(() => {
      // Find matching result or show first result as demo
      const matchingResult = data.find(d =>
        d.query_reference.toLowerCase().includes(queryReference.toLowerCase()) ||
        d.query_type === queryType
      ) || data[0];
      setSelectedResult(matchingResult);
      setIsQuerying(false);
    }, 1000);
  };

  const columns = [
    {
      field: 'query_id',
      headerName: 'Query ID',
      width: 160,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} sx={{ color: moduleColor }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'query_type',
      headerName: 'Type',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value?.replace(/_/g, ' ')}
          size="small"
          sx={{
            bgcolor: alpha(moduleColor, 0.1),
            color: moduleColor,
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        />
      ),
    },
    {
      field: 'query_reference',
      headerName: 'Reference',
      width: 150,
    },
    {
      field: 'sap_result',
      headerName: 'Document',
      width: 180,
      valueGetter: (params) => params?.document_number || params?.customer || '-',
    },
    {
      field: 'sap_result.status',
      headerName: 'Status',
      width: 180,
      valueGetter: (params) => params.row?.sap_result?.status || '-',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: colors.text }}>
          {params.row?.sap_result?.status || '-'}
        </Typography>
      ),
    },
    {
      field: 'sap_result.amount',
      headerName: 'Amount',
      width: 120,
      valueGetter: (params) => params.row?.sap_result?.amount,
      renderCell: (params) => params.row?.sap_result?.amount ? (
        <Typography variant="body2" fontWeight={600} sx={{ color: '#10b981' }}>
          ${params.row.sap_result.amount.toLocaleString()}
        </Typography>
      ) : '-',
    },
  ];

  return (
    <Box>
      {/* Query Builder */}
      <Box sx={{
        p: 2,
        borderBottom: `1px solid ${colors.border}`,
        bgcolor: darkMode ? colors.cardBg : alpha(moduleColor, 0.02),
      }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: colors.text }}>
          SAP Query Builder
        </Typography>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Query Type</InputLabel>
              <Select
                value={queryType}
                label="Query Type"
                onChange={(e) => setQueryType(e.target.value)}
              >
                {availableQueryTypes.map((qt) => (
                  <MenuItem key={qt.value} value={qt.value}>
                    <Stack>
                      <Typography variant="body2">{qt.label}</Typography>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                        Tables: {qt.tables.join(', ')}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Reference Number"
              placeholder={sourceType === 'vendor' ? 'e.g., INV-450123 or PO-78045' : 'e.g., ORD-45892 or INV-78901'}
              value={queryReference}
              onChange={(e) => setQueryReference(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: colors.textSecondary }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<StorageIcon />}
              onClick={handleExecuteQuery}
              disabled={!queryType || !queryReference || isQuerying}
              sx={{
                bgcolor: moduleColor,
                '&:hover': { bgcolor: alpha(moduleColor, 0.9) },
              }}
            >
              {isQuerying ? 'Querying...' : 'Execute Query'}
            </Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {queryType && availableQueryTypes.find(qt => qt.value === queryType)?.tables.map((table) => (
                <Chip
                  key={table}
                  label={table}
                  size="small"
                  sx={{
                    bgcolor: alpha(moduleColor, 0.1),
                    color: moduleColor,
                    fontWeight: 600,
                    fontSize: '0.7rem',
                  }}
                />
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Query Result */}
      {selectedResult && (
        <Box sx={{ p: 2, borderBottom: `1px solid ${colors.border}` }}>
          <SAPResultCard
            result={selectedResult}
            darkMode={darkMode}
            sourceType={sourceType}
          />
        </Box>
      )}

      {/* Recent Queries */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, color: colors.text }}>
          Recent Queries
        </Typography>
        <Box sx={{ height: selectedResult ? 300 : 450 }}>
          <DataGrid
            rows={data}
            columns={columns}
            density="compact"
            onRowClick={(params) => setSelectedResult(params.row)}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[10, 25]}
            disableRowSelectionOnClick
            slots={{ toolbar: CustomToolbar }}
            sx={{
              border: `1px solid ${colors.border}`,
              borderRadius: 2,
              color: colors.text,
              '& .MuiDataGrid-cell': {
                borderBottom: `1px solid ${colors.border}`,
                cursor: 'pointer',
              },
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: darkMode ? colors.cardBg : 'grey.50',
                borderBottom: `1px solid ${colors.border}`,
              },
              '& .MuiDataGrid-row:hover': {
                bgcolor: alpha(moduleColor, 0.05),
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: `1px solid ${colors.border}`,
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default SAPQueryTab;
