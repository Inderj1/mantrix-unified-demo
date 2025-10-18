import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';

const QueryIntelligence = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchPopularQueries();
  }, []);

  const fetchPopularQueries = async () => {
    try {
      const response = await fetch('/api/v1/cache/popular-queries');
      const data = await response.json();
      if (data.queries) {
        setQueries(data.queries);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching queries:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Query Intelligence
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Popular cached queries and their usage statistics
        </Typography>
      </Box>

      {queries.length === 0 ? (
        <Alert severity="info">No cached queries found. Queries will appear here once you start using the system.</Alert>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Query</TableCell>
                  <TableCell align="right">Hit Count</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {queries
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((query, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 600 }}>
                          {query.query}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{query.hit_count}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={query.hit_count > 0 ? 'Cached' : 'Stored'}
                          size="small"
                          color={query.hit_count > 0 ? 'success' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={queries.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>
      )}
    </Box>
  );
};

export default QueryIntelligence;
