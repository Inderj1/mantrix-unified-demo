import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Avatar,
  Stack,
  IconButton,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
  ContentCopy as CopyIcon,
  Clear as ClearIcon,
  Code as CodeIcon,
  TipsAndUpdates as TipsIcon,
  ExpandMore as ExpandMoreIcon,
  TableChart as TableIcon,
  BarChart as ChartIcon,
  Info as InfoIcon,
  AttachMoney as MarginIcon,
  QueryStats as QueryStatsIcon,
} from '@mui/icons-material';

const MargenAIChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [examples, setExamples] = useState([]);
  const [showExamples, setShowExamples] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    setMessages([{
      id: Date.now(),
      type: 'ai',
      content: `Hello! I'm MargenAI Chat, your intelligent margin analytics assistant. I can help you analyze product margins, customer segments, and profitability trends using natural language.`,
      timestamp: new Date(),
    }]);

    // Fetch example queries
    fetchExamples();
  }, []);

  const fetchExamples = async () => {
    try {
      const response = await fetch('/api/v1/margen/chat/examples');
      const data = await response.json();
      setExamples(data.examples || []);
    } catch (error) {
      console.error('Failed to fetch examples:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setShowExamples(false);

    try {
      const response = await fetch('/api/v1/margen/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: inputMessage,
          conversation_context: messages.slice(-5) // Send last 5 messages for context
        }),
      });

      const result = await response.json();
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: result.message,
        sql: result.sql,
        data: result.data,
        columns: result.columns,
        row_count: result.row_count,
        visualization_type: result.visualization_type,
        follow_up_suggestions: result.follow_up_suggestions,
        error: result.error,
        from_cache: result.from_cache,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'I encountered an error processing your request. Please try again.',
        error: error.message,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleExampleClick = (query) => {
    setInputMessage(query);
    inputRef.current?.focus();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      type: 'ai',
      content: 'Chat cleared. How can I help you analyze your margin data?',
      timestamp: new Date(),
    }]);
    setShowExamples(true);
  };

  const renderDataTable = (data, columns) => {
    if (!data || data.length === 0) return null;

    return (
      <TableContainer component={Paper} sx={{ maxHeight: 400, mt: 2 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col} sx={{ fontWeight: 600, bgcolor: 'grey.100' }}>
                  {col.replace(/_/g, ' ').toUpperCase()}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(0, 10).map((row, idx) => (
              <TableRow key={idx} hover>
                {columns.map((col) => (
                  <TableCell key={col}>
                    {typeof row[col] === 'number' 
                      ? row[col].toLocaleString() 
                      : row[col] || '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data.length > 10 && (
          <Box sx={{ p: 1, bgcolor: 'grey.50', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Showing 10 of {data.length} rows
            </Typography>
          </Box>
        )}
      </TableContainer>
    );
  };

  const renderMessage = (message) => {
    const isUser = message.type === 'user';

    return (
      <Box
        key={message.id}
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}
      >
        <Avatar
          sx={{
            bgcolor: isUser ? 'primary.main' : 'success.main',
            width: 36,
            height: 36,
          }}
        >
          {isUser ? <PersonIcon /> : <MarginIcon />}
        </Avatar>

        <Box sx={{ flex: 1, maxWidth: '80%' }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {isUser ? 'You' : 'MargenAI'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {message.timestamp.toLocaleTimeString()}
            </Typography>
            {message.from_cache && (
              <Chip label="Cached" size="small" color="info" variant="outlined" />
            )}
          </Stack>

          <Paper
            sx={{
              p: 2,
              bgcolor: isUser ? 'primary.50' : 'background.paper',
              borderRadius: 2,
            }}
          >
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>

            {/* Show error if present */}
            {message.error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {message.error}
              </Alert>
            )}

            {/* Show SQL query */}
            {message.sql && (
              <Accordion sx={{ mt: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CodeIcon fontSize="small" />
                    <Typography variant="body2">View SQL Query</Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ position: 'relative' }}>
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(message.sql)}
                      sx={{ position: 'absolute', right: 0, top: 0 }}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                    <Box
                      component="pre"
                      sx={{
                        p: 2,
                        bgcolor: 'grey.900',
                        color: 'grey.50',
                        borderRadius: 1,
                        overflow: 'auto',
                        fontSize: '0.875rem',
                      }}
                    >
                      {message.sql}
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Show data table */}
            {message.data && message.columns && (
              <Box sx={{ mt: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <TableIcon fontSize="small" color="primary" />
                  <Typography variant="body2" fontWeight={600}>
                    Results ({message.row_count} rows)
                  </Typography>
                </Stack>
                {renderDataTable(message.data, message.columns)}
              </Box>
            )}

            {/* Show follow-up suggestions */}
            {message.follow_up_suggestions && message.follow_up_suggestions.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  You might also want to ask:
                </Typography>
                <Stack direction="column" spacing={1}>
                  {message.follow_up_suggestions.map((suggestion, idx) => (
                    <Chip
                      key={idx}
                      label={suggestion}
                      onClick={() => handleExampleClick(suggestion)}
                      sx={{ justifyContent: 'flex-start', cursor: 'pointer' }}
                      icon={<TipsIcon />}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'success.main' }}>
              <MarginIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                MargenAI Chat
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Natural language interface for margin analytics
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Clear chat">
              <IconButton onClick={clearChat} size="small">
                <ClearIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Messages Area */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        {messages.map(renderMessage)}
        
        {/* Show examples when chat is empty */}
        {showExamples && examples.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Example Questions
            </Typography>
            <Grid container spacing={2}>
              {examples.map((category, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        {category.category}
                      </Typography>
                      <Stack spacing={1}>
                        {category.queries.map((query, qIdx) => (
                          <Chip
                            key={qIdx}
                            label={query}
                            onClick={() => handleExampleClick(query)}
                            sx={{ 
                              justifyContent: 'flex-start',
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                            size="small"
                          />
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        
        {loading && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              MargenAI is analyzing...
            </Typography>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Paper sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={2}>
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={3}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about margins, products, segments, or trends..."
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <QueryStatsIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={loading || !inputMessage.trim()}
            endIcon={<SendIcon />}
            sx={{ minWidth: 100 }}
          >
            Send
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default MargenAIChat;