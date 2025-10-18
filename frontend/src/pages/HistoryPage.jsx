import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  ContentCopy as ContentCopyIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import SQLDisplay from '../components/SQLDisplay';

// Mock data - in real app, this would come from an API
const mockHistory = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  timestamp: new Date(Date.now() - i * 3600000).toISOString(),
  query: `Sample query ${i + 1}: Show me products with low inventory`,
  sql: `SELECT * FROM products WHERE inventory < 20 ORDER BY inventory ASC LIMIT ${10 + i}`,
  status: i % 5 === 0 ? 'failed' : 'success',
  rowCount: i % 5 === 0 ? 0 : Math.floor(Math.random() * 100),
  executionTime: Math.random() * 5,
  cost: Math.random() * 0.01,
}));

function HistoryPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [history, setHistory] = useState(mockHistory);

  const filteredHistory = history.filter((item) =>
    item.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sql.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (query) => {
    setSelectedQuery(query);
    setDialogOpen(true);
  };

  const handleCopySQL = (sql) => {
    navigator.clipboard.writeText(sql);
  };

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Query History
        </Typography>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search queries..."
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

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Query</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Rows</TableCell>
                <TableCell align="right">Time (s)</TableCell>
                <TableCell align="right">Cost ($)</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHistory
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {format(new Date(row.timestamp), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                        {row.query}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        color={row.status === 'success' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">{row.rowCount}</TableCell>
                    <TableCell align="right">{row.executionTime.toFixed(2)}</TableCell>
                    <TableCell align="right">{row.cost.toFixed(6)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(row)}
                        title="View details"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleCopySQL(row.sql)}
                        title="Copy SQL"
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredHistory.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Query Details</DialogTitle>
        <DialogContent>
          {selectedQuery && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Natural Language Query
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedQuery.query}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                Generated SQL
              </Typography>
              <SQLDisplay sql={selectedQuery.sql} />

              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedQuery.status}
                    color={selectedQuery.status === 'success' ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Rows Returned
                  </Typography>
                  <Typography>{selectedQuery.rowCount}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Execution Time
                  </Typography>
                  <Typography>{selectedQuery.executionTime.toFixed(2)}s</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Cost
                  </Typography>
                  <Typography>${selectedQuery.cost.toFixed(6)}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => handleCopySQL(selectedQuery?.sql)}
          >
            Copy SQL
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default HistoryPage;