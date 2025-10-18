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
  Menu,
  MenuItem,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  QueryStats as QueryIcon,
  Code as CodeIcon,
  TipsAndUpdates as TipsIcon,
} from '@mui/icons-material';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-monokai';

const AIChatInterface = ({ 
  aiName, 
  aiIcon, 
  aiColor = '#4285F4',
  systemPrompt,
  examplePrompts = [],
  onSubmitQuery,
}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
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
      content: `Hello! I'm ${aiName}, your intelligent data analytics assistant. ${systemPrompt}`,
      timestamp: new Date(),
    }]);
  }, [aiName, systemPrompt]);

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

    try {
      // Call the parent's submit handler
      const response = await onSubmitQuery(inputMessage);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.message || 'Query processed successfully',
        sql: response.sql,
        data: response.data,
        error: response.error,
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      type: 'ai',
      content: `Chat cleared. How can I help you with your data analysis?`,
      timestamp: new Date(),
    }]);
    setAnchorEl(null);
  };

  const exportChat = () => {
    const chatContent = messages.map(m => 
      `[${m.timestamp.toLocaleTimeString()}] ${m.type === 'user' ? 'You' : aiName}: ${m.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${aiName}_chat_${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setAnchorEl(null);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: aiColor, width: 48, height: 48 }}>
              {aiIcon || <AIIcon />}
            </Avatar>
            <Box>
              <Typography variant="h6">{aiName}</Typography>
              <Typography variant="caption" color="text.secondary">
                Powered by advanced AI analytics
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <MoreIcon />
          </IconButton>
        </Stack>
      </Paper>

      {/* Chat Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={clearChat}>
          <ClearIcon sx={{ mr: 1 }} /> Clear Chat
        </MenuItem>
        <MenuItem onClick={exportChat}>
          <DownloadIcon sx={{ mr: 1 }} /> Export Chat
        </MenuItem>
      </Menu>

      {/* Messages Area */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2, 
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              sx={{
                maxWidth: '70%',
                alignItems: 'flex-start',
              }}
            >
              {message.type === 'ai' && (
                <Avatar sx={{ bgcolor: aiColor, width: 36, height: 36 }}>
                  {aiIcon || <AIIcon />}
                </Avatar>
              )}
              
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  bgcolor: message.type === 'user' ? 'primary.main' : 'background.paper',
                  color: message.type === 'user' ? 'primary.contrastText' : 'text.primary',
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
                
                {message.sql && (
                  <Box sx={{ mt: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CodeIcon fontSize="small" /> Generated SQL
                      </Typography>
                      <IconButton size="small" onClick={() => copyToClipboard(message.sql)}>
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Paper variant="outlined" sx={{ p: 1, bgcolor: 'background.default' }}>
                      <Typography
                        variant="caption"
                        component="pre"
                        sx={{
                          fontFamily: 'monospace',
                          overflow: 'auto',
                          color: 'text.primary',
                        }}
                      >
                        {message.sql}
                      </Typography>
                    </Paper>
                  </Box>
                )}
                
                {message.error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {message.error}
                  </Alert>
                )}
                
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  {message.timestamp.toLocaleTimeString()}
                </Typography>
              </Paper>
              
              {message.type === 'user' && (
                <Avatar sx={{ bgcolor: 'grey.500', width: 36, height: 36 }}>
                  <PersonIcon />
                </Avatar>
              )}
            </Stack>
          </Box>
        ))}
        
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: aiColor, width: 36, height: 36 }}>
              {aiIcon || <AIIcon />}
            </Avatar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                {aiName} is thinking...
              </Typography>
            </Box>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Example Prompts */}
      {messages.length === 1 && examplePrompts.length > 0 && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            <TipsIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
            Try asking:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {examplePrompts.map((prompt, idx) => (
              <Chip
                key={idx}
                label={prompt}
                size="small"
                onClick={() => setInputMessage(prompt)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Input Area */}
      <Paper elevation={3} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={2}>
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={4}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask ${aiName} anything about your data...`}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || loading}
                  >
                    <SendIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Paper>
    </Box>
  );
};

export default AIChatInterface;