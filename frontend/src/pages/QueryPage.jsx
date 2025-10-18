import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as ContentCopyIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useMutation } from 'react-query';
import { apiService } from '../services/api';
import SQLDisplay from '../components/SQLDisplay';
import ResultsTable from '../components/ResultsTable';
import QuerySuggestions from '../components/QuerySuggestions';

const exampleQueries = [
  "Show me top 10 products by inventory quantity",
  "What products have low inventory (less than 20 units)?",
  "Which products are most overstocked?",
  "Show inventory by warehouse location",
  "What's the total inventory value by category?",
  "Which SKUs have been out of stock longest?",
  "Show me products with negative days of inventory",
  "What's the inventory turnover by product category?",
  "Find products that need immediate restocking",
  "Show inventory health metrics by warehouse",
];

function QueryPage() {
  const [query, setQuery] = useState('');
  const [useVectorSearch, setUseVectorSearch] = useState(true);
  const [maxTables, setMaxTables] = useState(5);
  const [executeQuery, setExecuteQuery] = useState(true);
  const [lastResult, setLastResult] = useState(null);

  const queryMutation = useMutation(
    (data) => {
      const endpoint = executeQuery ? apiService.executeQuery : apiService.generateSQL;
      return endpoint(data.question, {
        use_vector_search: data.useVectorSearch,
        max_tables: data.maxTables,
      });
    },
    {
      onSuccess: (response) => {
        setLastResult(response.data);
      },
    }
  );

  const handleSubmit = () => {
    if (!query.trim()) return;
    
    queryMutation.mutate({
      question: query,
      useVectorSearch,
      maxTables,
    });
  };

  const handleExampleClick = (exampleQuery) => {
    setQuery(exampleQuery);
  };

  const handleCopySQL = () => {
    if (lastResult?.sql) {
      navigator.clipboard.writeText(lastResult.sql);
    }
  };

  const handleDownloadResults = () => {
    if (lastResult?.execution?.results) {
      const csv = convertToCSV(lastResult.execution.results);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `query_results_${new Date().toISOString()}.csv`;
      a.click();
    }
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
    ].join('\n');
    return csv;
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Left Panel - Query Input */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Query Input
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Enter your natural language query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Example Queries:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {exampleQueries.slice(0, 5).map((example, index) => (
                  <Chip
                    key={index}
                    label={example}
                    onClick={() => handleExampleClick(example)}
                    variant="outlined"
                    size="small"
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>

            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Advanced Options</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={useVectorSearch}
                      onChange={(e) => setUseVectorSearch(e.target.checked)}
                    />
                  }
                  label="Use vector search for table selection"
                />
                <Box sx={{ mt: 2 }}>
                  <Typography gutterBottom>Maximum tables to consider</Typography>
                  <Slider
                    value={maxTables}
                    onChange={(e, value) => setMaxTables(value)}
                    min={1}
                    max={10}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={executeQuery}
                      onChange={(e) => setExecuteQuery(e.target.checked)}
                    />
                  }
                  label="Execute query after generation"
                />
              </AccordionDetails>
            </Accordion>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={!query.trim() || queryMutation.isLoading}
              startIcon={queryMutation.isLoading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
            >
              {queryMutation.isLoading ? 'Generating...' : 'Generate SQL'}
            </Button>

            {queryMutation.isError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {queryMutation.error?.response?.data?.detail || 'An error occurred'}
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Right Panel - Results */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Results
            </Typography>

            {lastResult && (
              <>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6">Generated SQL</Typography>
                      <Button
                        size="small"
                        startIcon={<ContentCopyIcon />}
                        onClick={handleCopySQL}
                      >
                        Copy
                      </Button>
                    </Box>
                    <SQLDisplay sql={lastResult.sql} />
                  </CardContent>
                </Card>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Query Details</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Tables Used
                        </Typography>
                        <Typography variant="body1">
                          {lastResult.tables_used?.length || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Complexity
                        </Typography>
                        <Typography variant="body1">
                          {lastResult.estimated_complexity || 'Unknown'}
                        </Typography>
                      </Grid>
                      {lastResult.validation?.valid && (
                        <>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Estimated Cost
                            </Typography>
                            <Typography variant="body1">
                              ${lastResult.validation.estimated_cost_usd?.toFixed(8) || '0.00'}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Data Scanned
                            </Typography>
                            <Typography variant="body1">
                              {(lastResult.validation.total_bytes_processed || 0).toLocaleString()} bytes
                            </Typography>
                          </Grid>
                        </>
                      )}
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Explanation
                        </Typography>
                        <Typography variant="body2">
                          {lastResult.explanation}
                        </Typography>
                      </Grid>
                      {lastResult.optimization_notes && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Optimization Notes
                          </Typography>
                          <Typography variant="body2">
                            {lastResult.optimization_notes}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {lastResult.execution?.results && (
                  <Card sx={{ mt: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          Query Results ({lastResult.execution.results.length} rows)
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<DownloadIcon />}
                          onClick={handleDownloadResults}
                        >
                          Download CSV
                        </Button>
                      </Box>
                      <ResultsTable results={lastResult.execution.results} />
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </Paper>
        </Grid>

        {/* Query Suggestions */}
        <Grid item xs={12}>
          <QuerySuggestions onSelectQuery={setQuery} />
        </Grid>
      </Grid>
    </Box>
  );
}

export default QueryPage;