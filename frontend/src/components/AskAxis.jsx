import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Fab,
  Drawer,
  Paper,
  Typography,
  TextField,
  IconButton,
  Stack,
  Chip,
  Avatar,
  Collapse,
  CircularProgress,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Psychology as BrainIcon,
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  Send as SendIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AutoAwesome as SparkleIcon,
} from '@mui/icons-material';
import { usePageContext } from '../contexts/PageContextProvider';
import chatStorageService from '../services/chatStorageService';

// Dark mode color helper
const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  messagesBg: darkMode ? '#0d1117' : '#f5f5f5',
});

const AskAxis = ({ darkMode = false }) => {
  const theme = useTheme();
  const colors = getColors(darkMode);
  const { context, getContextKey, getContextDescription } = usePageContext();

  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showContext, setShowContext] = useState(true);

  // Chat State
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load conversation when context changes or component mounts
  useEffect(() => {
    if (isOpen) {
      const contextKey = getContextKey();
      const conversation = chatStorageService.getConversation(contextKey);
      setMessages(conversation);
    }
  }, [isOpen, getContextKey]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Shift+M or Cmd+Shift+M to toggle
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message to UI and storage
    const contextKey = getContextKey();
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    chatStorageService.saveMessage(contextKey, userMessage);

    setInputValue('');
    setIsLoading(true);

    try {
      // Call API with context
      const response = await fetch('/api/v1/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage.content,
          context: {
            moduleName: context.moduleName,
            tabName: context.tabName,
            filters: context.filters,
            dateRange: context.dateRange,
            visibleData: context.visibleData,
            chartData: context.chartData,
            metadata: context.metadata,
          },
          sessionId: chatStorageService.getSessionId(),
          userId: chatStorageService.getUserId(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage = {
          role: 'assistant',
          content: data.answer,
          timestamp: new Date().toISOString(),
        };

        const newMessages = [...updatedMessages, aiMessage];
        setMessages(newMessages);
        chatStorageService.saveMessage(contextKey, aiMessage);
      } else {
        // Error handling
        const errorMessage = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
          isError: true,
        };
        const newMessages = [...updatedMessages, errorMessage];
        setMessages(newMessages);
        chatStorageService.saveMessage(contextKey, errorMessage);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Unable to connect. Please check your connection and try again.',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      const newMessages = [...updatedMessages, errorMessage];
      setMessages(newMessages);
      chatStorageService.saveMessage(contextKey, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    'Explain this chart',
    'What caused this spike?',
    'Show me the details',
    'Compare to last period',
  ];

  const handleQuickAction = (action) => {
    setInputValue(action);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <Tooltip title="Ask AXIS (Ctrl+Shift+M)" placement="left">
          <Fab
            color="primary"
            onClick={() => setIsOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              width: 64,
              height: 64,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: '0 8px 24px rgba(33, 150, 243, 0.4)',
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
              zIndex: 1300,
            }}
          >
            <BrainIcon sx={{ fontSize: 32 }} />
          </Fab>
        </Tooltip>
      )}

      {/* Chat Drawer */}
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: isMinimized ? 320 : 450,
            height: isMinimized ? 60 : 650,
            bottom: 24,
            right: 24,
            top: 'auto',
            borderRadius: 3,
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease',
          },
        }}
        variant="persistent"
        hideBackdrop
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: alpha('#fff', 0.2),
                  width: 36,
                  height: 36,
                }}
              >
                <BrainIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Ask AXIS
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Your AI Assistant
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={0.5}>
              <IconButton
                size="small"
                onClick={() => setIsMinimized(!isMinimized)}
                sx={{ color: 'white' }}
              >
                <MinimizeIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setIsOpen(false)}
                sx={{ color: 'white' }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {!isMinimized && (
            <>
              {/* Context Banner */}
              <Box
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                  onClick={() => setShowContext(!showContext)}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <SparkleIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    <Typography variant="caption" fontWeight={600} sx={{ color: colors.textSecondary }}>
                      Context: {getContextDescription()}
                    </Typography>
                  </Stack>
                  <IconButton size="small">
                    {showContext ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </IconButton>
                </Box>
                <Collapse in={showContext}>
                  <Box sx={{ px: 2, pb: 1.5 }}>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {context.moduleName && (
                        <Chip label={context.moduleName} size="small" />
                      )}
                      {context.tabName && (
                        <Chip label={context.tabName} size="small" />
                      )}
                      {context.dateRange && (
                        <Chip
                          label={`${context.dateRange.from} - ${context.dateRange.to}`}
                          size="small"
                        />
                      )}
                    </Stack>
                  </Box>
                </Collapse>
              </Box>

              {/* Messages Area */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 2,
                  bgcolor: colors.messagesBg,
                }}
              >
                {messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <BrainIcon sx={{ fontSize: 64, color: colors.textSecondary, mb: 2 }} />
                    <Typography variant="body2" sx={{ color: colors.textSecondary }} gutterBottom>
                      Ask me anything about this page
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" justifyContent="center" sx={{ mt: 2 }}>
                      {quickActions.map((action, index) => (
                        <Chip
                          key={index}
                          label={action}
                          size="small"
                          onClick={() => handleQuickAction(action)}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Stack>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {messages.map((message, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <Paper
                          elevation={1}
                          sx={{
                            p: 1.5,
                            maxWidth: '80%',
                            bgcolor: message.role === 'user' ? 'primary.main' : colors.paper,
                            color: message.role === 'user' ? 'white' : colors.text,
                            borderRadius: 2,
                            border: message.role === 'user' ? 'none' : `1px solid ${colors.border}`,
                            ...(message.isError && {
                              bgcolor: 'error.light',
                              color: 'white',
                            }),
                          }}
                        >
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {message.content}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              mt: 0.5,
                              opacity: 0.7,
                            }}
                          >
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </Typography>
                        </Paper>
                      </Box>
                    ))}
                    {isLoading && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2, bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
                          <CircularProgress size={20} />
                        </Paper>
                      </Box>
                    )}
                    <div ref={messagesEndRef} />
                  </Stack>
                )}
              </Box>

              {/* Input Area */}
              <Box sx={{ p: 2, bgcolor: colors.paper, borderTop: `1px solid ${colors.border}` }}>
                <Stack direction="row" spacing={1}>
                  <TextField
                    ref={inputRef}
                    fullWidth
                    multiline
                    maxRows={3}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask a question..."
                    variant="outlined"
                    size="small"
                    disabled={isLoading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '&:disabled': {
                        bgcolor: 'action.disabledBackground',
                      },
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Stack>
                <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mt: 0.5 }}>
                  Press Enter to send • Shift+Enter for new line
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default AskAxis;
