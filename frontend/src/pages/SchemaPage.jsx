import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { apiService } from '../services/api';

function SchemaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTable, setExpandedTable] = useState(null);

  const { data: schemaData, isLoading, error } = useQuery(
    'schemas',
    () => apiService.getSchemas(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const tables = schemaData?.data?.tables || [];
  const filteredTables = tables.filter((table) =>
    table.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.columns.some((col) => col.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getDataTypeColor = (type) => {
    const typeColors = {
      STRING: 'primary',
      INTEGER: 'success',
      FLOAT: 'success',
      BOOLEAN: 'warning',
      TIMESTAMP: 'info',
      DATE: 'info',
      RECORD: 'error',
      ARRAY: 'secondary',
    };
    return typeColors[type] || 'default';
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load schema: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Database Schema
        </Typography>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search tables or columns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Found {filteredTables.length} tables in dataset
        </Typography>

        {filteredTables.map((table) => (
          <Accordion
            key={table.table_name}
            expanded={expandedTable === table.table_name}
            onChange={(e, isExpanded) => 
              setExpandedTable(isExpanded ? table.table_name : null)
            }
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <TableChartIcon sx={{ mr: 2, color: 'action.active' }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{table.table_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {table.row_count?.toLocaleString() || 0} rows • {table.columns.length} columns
                  </Typography>
                </Box>
                {table.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                    {table.description}
                  </Typography>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Column Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Mode</TableCell>
                      <TableCell>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {table.columns.map((column) => (
                      <TableRow key={column.name}>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {column.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={column.type}
                            size="small"
                            color={getDataTypeColor(column.type)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {column.mode}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {column.description || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {table.created && (
                <Box sx={{ mt: 2, display: 'flex', gap: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(table.created).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Modified: {new Date(table.modified).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Box>
  );
}

export default SchemaPage;