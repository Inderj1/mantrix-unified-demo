import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Button,
  TextField,
  Grid,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
  Storage as StorageIcon,
  QueryStats as QueryStatsIcon,
  Code as CodeIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { apiService } from '../services/api';

const QueryLogger = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    fetchLogs();
    
    // Auto-refresh every 5 seconds if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getQueryLogs({
        limit: 100,
        offset: 0
      });
      setLogs(response.data.logs || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
      setError('Failed to fetch query logs');
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    try {
      await apiService.clearQueryLogs();
      setLogs([]);
      setSelectedLog(null);
    } catch (err) {
      console.error('Failed to clear logs:', err);
      setError('Failed to clear logs');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" fontSize="small" />;
      case 'failed':
        return <ErrorIcon color="error" fontSize="small" />;
      case 'running':
        return <CircularProgress size={16} />;
      default:
        return <ScheduleIcon color="action" fontSize="small" />;
    }
  };

  const getExecutionTime = (log) => {
    if (log.start_time && log.end_time) {
      const start = new Date(log.start_time);
      const end = new Date(log.end_time);
      const diff = end - start;
      if (diff < 1000) return `${diff}ms`;
      return `${(diff / 1000).toFixed(2)}s`;
    }
    return '-';
  };

  const filteredLogs = logs.filter(log => 
    !searchTerm || 
    log.query?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.execution_id?.includes(searchTerm)
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <QueryStatsIcon />
              Query Execution Logs
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant={autoRefresh ? "contained" : "outlined"}
              size="small"
              onClick={() => setAutoRefresh(!autoRefresh)}
              startIcon={<RefreshIcon />}
            >
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </Button>
          </Grid>
          <Grid item>
            <IconButton onClick={fetchLogs} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton onClick={clearLogs} disabled={loading || logs.length === 0}>
              <ClearIcon />
            </IconButton>
          </Grid>
        </Grid>
        
        <TextField
          fullWidth
          size="small"
          placeholder="Search queries or execution IDs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mt: 2 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Logs List */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {loading && logs.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredLogs.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {searchTerm ? 'No matching logs found' : 'No query logs available'}
            </Typography>
          </Paper>
        ) : (
          filteredLogs.map((log, index) => (
            <Accordion
              key={log.execution_id || index}
              expanded={selectedLog === log.execution_id}
              onChange={() => setSelectedLog(
                selectedLog === log.execution_id ? null : log.execution_id
              )}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  {getStatusIcon(log.status)}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" noWrap>
                      {log.query}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {log.timestamp ? format(new Date(log.timestamp), 'MMM dd, HH:mm:ss') : '-'}
                    </Typography>
                  </Box>
                  <Chip
                    label={log.mode || 'chat'}
                    size="small"
                    color={log.mode === 'research' ? 'secondary' : 'primary'}
                    variant="outlined"
                  />
                  <Typography variant="caption" sx={{ minWidth: 60, textAlign: 'right' }}>
                    {getExecutionTime(log)}
                  </Typography>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Execution Info */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Execution Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Execution ID:
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {log.execution_id || '-'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Tables Used:
                        </Typography>
                        <Typography variant="body2">
                          {log.tables_used?.join(', ') || '-'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider />

                  {/* Research Steps (if research mode) */}
                  {log.mode === 'research' && log.steps && (
                    <>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Research Steps ({log.steps.length})
                        </Typography>
                        {log.steps.map((step, stepIndex) => (
                          <Paper
                            key={stepIndex}
                            variant="outlined"
                            sx={{ p: 2, mb: 1, bgcolor: 'background.default' }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              {getStatusIcon(step.status)}
                              <Typography variant="body2" sx={{ flex: 1 }}>
                                {step.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {step.duration || '-'}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {step.description}
                            </Typography>
                            {step.error && (
                              <Alert severity="error" sx={{ mt: 1 }}>
                                {step.error}
                              </Alert>
                            )}
                          </Paper>
                        ))}
                      </Box>
                      <Divider />
                    </>
                  )}

                  {/* SQL Query */}
                  {log.sql && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CodeIcon fontSize="small" />
                        Generated SQL
                      </Typography>
                      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                        <SyntaxHighlighter
                          language="sql"
                          style={vscDarkPlus}
                          customStyle={{
                            margin: 0,
                            fontSize: '0.875rem',
                            maxHeight: '400px'
                          }}
                        >
                          {log.sql}
                        </SyntaxHighlighter>
                      </Paper>
                    </Box>
                  )}

                  {/* Multiple SQL Queries (for research mode) */}
                  {log.mode === 'research' && log.queries && log.queries.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StorageIcon fontSize="small" />
                        Executed Queries ({log.queries.length})
                      </Typography>
                      {log.queries.map((query, queryIndex) => (
                        <Accordion key={queryIndex} sx={{ mb: 1 }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="body2">
                              Step {queryIndex + 1}: {query.step_name || 'Query'}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                              <SyntaxHighlighter
                                language="sql"
                                style={vscDarkPlus}
                                customStyle={{
                                  margin: 0,
                                  fontSize: '0.875rem',
                                  maxHeight: '300px'
                                }}
                              >
                                {query.sql}
                              </SyntaxHighlighter>
                            </Paper>
                            {query.row_count !== undefined && (
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Rows returned: {query.row_count}
                              </Typography>
                            )}
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  )}

                  {/* Error Details */}
                  {log.error && (
                    <Alert severity="error">
                      <Typography variant="subtitle2" gutterBottom>
                        Error Details
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                        {log.error}
                      </Typography>
                    </Alert>
                  )}

                  {/* Result Summary */}
                  {log.result_summary && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Result Summary
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {log.result_summary}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>
    </Box>
  );
};

export default QueryLogger;