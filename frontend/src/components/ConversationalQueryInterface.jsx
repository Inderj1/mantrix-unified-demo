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
  InputAdornment,
  Menu,
  MenuItem,
  Tooltip,
  Alert,
  Fade,
  Grow,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Psychology as PsychologyIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  Lightbulb as LightbulbIcon,
  MoreVert as MoreIcon,
  AutoAwesome as AutoAwesomeIcon,
  QueryStats as QueryStatsIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  DataUsage as DataUsageIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useMutation } from 'react-query';
import { apiService } from '../services/api';
import EnhancedChatMessage from './EnhancedChatMessage';
import DatasetSettings from './DatasetSettings';
import DebugChatMessage from './DebugChatMessage';

const ConversationalQueryInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [conversationContext, setConversationContext] = useState({
    lastQuery: null,
    lastResults: null,
    lastTables: [],
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const aiConfig = {
    name: 'Query Assistant',
    icon: <PsychologyIcon />,
    color: '#4285F4',
  };

  // Example queries based on context
  const getContextualSuggestions = () => {
    if (!conversationContext.lastResults) {
      return [
        "Show me total revenue by month",
        "What are the top 5 products by sales?",
        "Display customer distribution by region",
        "Calculate average order value over time",
        "Show inventory levels by category",
      ];
    }

    // Context-aware suggestions
    const hasNumericData = conversationContext.lastResults.some(row => 
      Object.values(row).some(val => typeof val === 'number')
    );
    
    const hasDateData = conversationContext.lastResults.some(row => 
      Object.keys(row).some(key => 
        key.toLowerCase().includes('date') || 
        key.toLowerCase().includes('time')
      )
    );

    const suggestions = [];
    
    if (hasNumericData) {
      suggestions.push(
        "Show me the trend over time",
        "What's the total sum?",
        "Group by category and show averages",
        "Find the top 10 values",
        "Show percentage distribution"
      );
    }
    
    if (hasDateData) {
      suggestions.push(
        "Show monthly breakdown",
        "Compare year-over-year",
        "What's the growth rate?",
        "Show seasonal patterns"
      );
    }

    suggestions.push(
      "Filter results where value > 1000",
      "Add a calculated field",
      "Export this data",
      "Show correlation analysis"
    );

    return suggestions.slice(0, 5);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message
    setMessages([{
      id: Date.now(),
      type: 'ai',
      content: `Hello! I'm your conversational data assistant. I can help you explore your data through natural language queries.

Ask me anything about your data, and I'll generate SQL queries and present the results in interactive tables and charts. You can then ask follow-up questions to dive deeper into the insights.

Try starting with questions like:
• "Show me revenue trends"
• "What are my top customers?"
• "Analyze sales by region"`,
      timestamp: new Date(),
    }]);
  }, []);

  // Query mutation
  const queryMutation = useMutation(
    (question) => apiService.executeQuery(question),
    {
      onSuccess: (response) => {
        const { data } = response;
        
        console.log('ConversationalQueryInterface - API Response:', {
          hasExecution: !!data.execution,
          hasResults: !!data.execution?.results,
          resultsLength: data.execution?.results?.length,
          fullData: data
        });
        
        // Add more detailed logging
        console.log('Raw API response:', response);
        console.log('Execution object:', data.execution);
        console.log('Results array:', data.execution?.results);
        
        // Create result message
        const resultMessage = {
          id: Date.now() + 1,
          type: 'ai_query_result',
          sql: data.sql,
          results: data.execution?.results || data.results || data.data || [],
          metadata: {
            estimated_cost_usd: data.validation?.estimated_cost_usd,
            bytes_processed: data.validation?.total_bytes_processed,
            complexity: data.estimated_complexity,
            tables_used: data.tables_used,
            row_count: data.execution?.row_count || data.row_count || 0,
          },
          explanation: data.explanation || generateExplanation(data),
          timestamp: new Date(),
        };
        
        console.log('Creating result message with results:', resultMessage.results);

        setMessages(prev => [...prev, resultMessage]);

        // Update context
        setConversationContext({
          lastQuery: question,
          lastResults: data.execution?.results || [],
          lastTables: data.tables_used || [],
        });
        
        setLoading(false);
      },
      onError: (error) => {
        console.error('Query execution error:', error);
        console.error('Error response:', error.response);
        
        const errorMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: 'I encountered an error processing your query. Please try rephrasing or check your data connection.',
          error: error.response?.data?.detail || error.message,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        setLoading(false);
      },
    }
  );

  const generateExplanation = (data) => {
    const rowCount = data.execution?.row_count || data.execution?.results?.length || data.results?.length || 0;
    const tableCount = data.tables_used?.length || 0;
    
    let explanation = `I've executed your query and found ${rowCount} results`;
    
    if (tableCount > 0) {
      explanation += ` from ${tableCount} table${tableCount > 1 ? 's' : ''}`;
    }
    
    explanation += '.';

    if (rowCount > 0) {
      explanation += '\n\nYou can interact with the results below - switch between table, pivot, and chart views to explore the data from different angles.';
    }

    if (data.optimization_notes) {
      explanation += `\n\nOptimization note: ${data.optimization_notes}`;
    }

    return explanation;
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

    // Check if this is a follow-up question
    const isFollowUp = conversationContext.lastResults && 
      (inputMessage.toLowerCase().includes('filter') ||
       inputMessage.toLowerCase().includes('group') ||
       inputMessage.toLowerCase().includes('show') ||
       inputMessage.toLowerCase().includes('only'));

    if (isFollowUp) {
      // Process follow-up locally if possible
      handleFollowUpQuery(inputMessage);
    } else {
      // Execute new query
      queryMutation.mutate(inputMessage);
    }

    setLoading(false);
  };

  const handleFollowUpQuery = (query) => {
    // Simple follow-up processing
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('filter') || lowerQuery.includes('only')) {
      // Add filtering message
      const filterMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `To filter the results, I'll need to create a new query with a WHERE clause. Let me process that for you.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, filterMessage]);
      
      // Execute modified query
      const modifiedQuery = `${conversationContext.lastQuery} with additional filter: ${query}`;
      queryMutation.mutate(modifiedQuery);
    } else if (lowerQuery.includes('chart') || lowerQuery.includes('graph')) {
      // Suggest using the chart view
      const chartMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `You can view the data as a chart by clicking the "Chart" button in the results above. You can choose from Bar, Line, Pie, and Area charts.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, chartMessage]);
    } else {
      // Execute as new query
      queryMutation.mutate(query);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      type: 'ai',
      content: 'Chat cleared. How can I help you explore your data today?',
      timestamp: new Date(),
    }]);
    setConversationContext({
      lastQuery: null,
      lastResults: null,
      lastTables: [],
    });
    setAnchorEl(null);
  };

  const exportConversation = () => {
    const conversationText = messages.map(m => {
      if (m.type === 'user') {
        return `[${m.timestamp.toLocaleTimeString()}] You: ${m.content}`;
      } else if (m.type === 'ai_query_result') {
        return `[${m.timestamp.toLocaleTimeString()}] Assistant: ${m.explanation}\n\nSQL: ${m.sql}\n\nResults: ${m.results.length} rows`;
      }
      return `[${m.timestamp.toLocaleTimeString()}] Assistant: ${m.content}`;
    }).join('\n\n---\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_conversation_${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setAnchorEl(null);
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 0,
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                width: 56, 
                height: 56,
                border: '2px solid rgba(255,255,255,0.3)'
              }}>
                <AutoAwesomeIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Conversational Data Explorer
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Ask questions, get insights, explore interactively
                </Typography>
              </Box>
            </Stack>
            <IconButton sx={{ color: 'white' }} onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreIcon />
            </IconButton>
          </Stack>
        </Box>
      </Paper>

      {/* Chat Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => { setSettingsOpen(true); setAnchorEl(null); }}>
          <SettingsIcon sx={{ mr: 1 }} /> Dataset Settings
        </MenuItem>
        <MenuItem onClick={clearChat}>
          <ClearIcon sx={{ mr: 1 }} /> Clear Conversation
        </MenuItem>
        <MenuItem onClick={exportConversation}>
          <DownloadIcon sx={{ mr: 1 }} /> Export Conversation
        </MenuItem>
      </Menu>

      {/* Dataset Settings Dialog */}
      <DatasetSettings 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />

      {/* Messages Area */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 3,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Box sx={{ maxWidth: 1200, width: '100%', mx: 'auto' }}>
          {messages.map((message, index) => (
            <Fade in={true} key={message.id} timeout={500}>
              <Box>
                <EnhancedChatMessage 
                  message={message} 
                  aiConfig={aiConfig}
                />
              </Box>
            </Fade>
          ))}
          
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar sx={{ bgcolor: aiConfig.color, width: 36, height: 36 }}>
                {aiConfig.icon}
              </Avatar>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Analyzing your query...
                </Typography>
              </Box>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>
      </Box>

      {/* Contextual Suggestions */}
      <Grow in={messages.length > 1}>
        <Box sx={{ 
          px: 3,
          pb: 2,
          maxWidth: 1200,
          width: '100%',
          mx: 'auto'
        }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <LightbulbIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Suggested follow-ups:
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {getContextualSuggestions().map((suggestion, idx) => (
              <Chip
                key={idx}
                label={suggestion}
                size="small"
                onClick={() => setInputMessage(suggestion)}
                sx={{ 
                  cursor: 'pointer',
                  mb: 1,
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                  }
                }}
              />
            ))}
          </Stack>
        </Box>
      </Grow>

      {/* Input Area */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          borderTop: 1, 
          borderColor: 'divider',
          borderRadius: 0,
        }}
      >
        <Box sx={{ maxWidth: 1200, width: '100%', mx: 'auto' }}>
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={4}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your data..."
            disabled={loading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || loading}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '&:disabled': {
                        bgcolor: 'action.disabledBackground',
                      }
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default ConversationalQueryInterface;