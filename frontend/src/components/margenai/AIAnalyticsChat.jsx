import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
  CircularProgress,
  Chip,
  Alert,
  Button,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
  Stack,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  Clear as ClearIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { apiService } from '../../services/api';

const ALLOWED_TOPICS = [
  'revenue', 'sales', 'profit', 'margin', 'cost', 'expense', 'cash flow',
  'working capital', 'customer', 'product', 'forecast', 'prediction',
  'trend', 'analysis', 'metric', 'kpi', 'performance', 'growth',
  'market share', 'segment', 'gl account', 'financial', 'ebitda',
  'gross margin', 'net income', 'operating expense', 'cogs'
];

const SAMPLE_QUERIES = [
  "What's our revenue trend for the last 3 months?",
  "Show me top customers by gross margin",
  "Which products have the highest profit margins?",
  "What's our cash conversion cycle?",
  "Forecast revenue for next quarter",
  "Break down COGS by component"
];

const AIAnalyticsChat = ({ dashboardData, onBack }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hi! I'm your AI Analytics Assistant. I can help you analyze revenue, costs, forecasts, and other financial metrics. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isTopicAllowed = (query) => {
    const lowerQuery = query.toLowerCase();
    return ALLOWED_TOPICS.some(topic => lowerQuery.includes(topic));
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    if (!isTopicAllowed(input)) {
      const restrictionMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: 'Please ask questions related to financial analytics, revenue, costs, forecasts, or business metrics. For other topics, please use the "Ask Anything" section.',
        timestamp: new Date(),
        isRestriction: true
      };
      setMessages(prev => [...prev, restrictionMessage]);
      return;
    }

    setLoading(true);
    setQueryHistory(prev => [input, ...prev].slice(0, 10));

    try {
      // Generate SQL and execute query based on natural language
      const response = await apiService.generateAndExecuteQuery(input);
      
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        timestamp: new Date(),
        text: response.data.explanation || 'Here are the results:',
        data: response.data.results,
        sql: response.data.sql,
        visualization: response.data.suggested_visualization
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing query:', error);
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: 'I encountered an error processing your request. Please try rephrasing your question.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (message) => {
    if (message.isRestriction) {
      return (
        <Alert severity="info" sx={{ mt: 1 }}>
          {message.text}
        </Alert>
      );
    }

    if (message.isError) {
      return (
        <Alert severity="error" sx={{ mt: 1 }}>
          {message.text}
        </Alert>
      );
    }

    if (message.data) {
      return (
        <Box>
          <Typography variant="body1" gutterBottom>{message.text}</Typography>
          {message.sql && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Generated SQL:</Typography>
              <Paper sx={{ p: 1, bgcolor: 'grey.100', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {message.sql}
              </Paper>
            </Box>
          )}
          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardContent>
              <pre style={{ fontSize: '0.875rem', overflow: 'auto' }}>
                {JSON.stringify(message.data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return <Typography variant="body1">{message.text}</Typography>;
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
      {/* Header with Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link
              component="button"
              variant="body1"
              onClick={onBack}
              sx={{
                textDecoration: 'none',
                color: 'text.primary',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              MARGEN.AI
            </Link>
            <Typography color="primary" variant="body1" fontWeight={600}>
              AI Analytics Chat
            </Typography>
          </Breadcrumbs>
          {onBack && (
            <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
              Back to MargenAI
            </Button>
          )}
        </Stack>
      </Box>

      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">AI Analytics Assistant</Typography>
          <Box>
            <IconButton 
              onClick={() => setShowHistory(!showHistory)}
              color={showHistory ? 'primary' : 'default'}
            >
              <HistoryIcon />
            </IconButton>
            <IconButton onClick={() => setMessages([messages[0]])}>
              <ClearIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Chat Messages */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <List>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                alignItems="flex-start"
                sx={{
                  flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                  gap: 2
                }}
              >
                <Avatar sx={{ 
                  bgcolor: message.type === 'user' ? 'primary.main' : 'secondary.main',
                  alignSelf: 'flex-start'
                }}>
                  {message.type === 'user' ? <PersonIcon /> : <BotIcon />}
                </Avatar>
                <Box sx={{ 
                  maxWidth: '70%',
                  bgcolor: message.type === 'user' ? 'primary.light' : 'grey.100',
                  borderRadius: 2,
                  p: 2
                }}>
                  {renderMessageContent(message)}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Box>
              </ListItem>
            ))}
            {loading && (
              <ListItem>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <BotIcon />
                </Avatar>
                <Box sx={{ ml: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    Analyzing your request...
                  </Typography>
                </Box>
              </ListItem>
            )}
          </List>
          <div ref={messagesEndRef} />
        </Box>

        {/* Side Panel */}
        {showHistory && (
          <Paper sx={{ width: 300, p: 2, borderLeft: 1, borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>Query History</Typography>
            <List dense>
              {queryHistory.map((query, index) => (
                <ListItem 
                  key={index}
                  button
                  onClick={() => setInput(query)}
                >
                  <ListItemText 
                    primary={query}
                    primaryTypographyProps={{ fontSize: '0.875rem' }}
                  />
                </ListItem>
              ))}
              {queryHistory.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No query history yet
                </Typography>
              )}
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>Sample Queries</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {SAMPLE_QUERIES.map((query, index) => (
                <Chip
                  key={index}
                  label={query}
                  size="small"
                  onClick={() => setInput(query)}
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
            </Box>
          </Paper>
        )}
      </Box>

      {/* Input Area */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box display="flex" gap={1}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask about revenue, costs, forecasts, or any financial metrics..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            multiline
            maxRows={3}
            disabled={loading}
          />
          <IconButton 
            color="primary" 
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
          >
            <SendIcon />
          </IconButton>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Ask questions about financial analytics, revenue, costs, and business metrics. 
          For other topics, please use the "Ask Anything" section.
        </Typography>
      </Box>
    </Box>
  );
};

export default AIAnalyticsChat;