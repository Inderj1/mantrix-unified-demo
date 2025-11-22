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
  ToggleButton,
  ToggleButtonGroup,
  Badge,
  FormControlLabel,
  Switch,
  Grid,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
  ContentCopy as CopyIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  Code as CodeIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  Forum as ForumIcon,
  MoreVert as MoreIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as LocalShippingIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  AutoAwesome as AutoAwesomeIcon,
  Psychology as PsychologyIcon,
  Lightbulb as LightbulbIcon,
  ArrowForward as ArrowForwardIcon,
  Storage as StorageIcon,
  Description as DescriptionIcon,
  Cable as CableIcon,
  Hub as HubIcon,
} from '@mui/icons-material';

const UnifiedChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAIs, setSelectedAIs] = useState([]);
  const [showIndividualResponses, setShowIndividualResponses] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Expandable list of AI agents
  const aiConfigs = {
    core: {
      name: 'CORE.AI',
      icon: <AnalyticsIcon />,
      color: '#4285F4',
      context: 'operational_analytics',
      description: 'Operational Analytics',
      capabilities: ['Real-time KPIs', 'Process optimization', 'Efficiency metrics'],
    },
    axis: {
      name: 'AXIS.AI',
      icon: <TimelineIcon />,
      color: '#9C27B0',
      context: 'strategic_analytics',
      description: 'Strategic Analytics',
      capabilities: ['Trend analysis', 'Forecasting', 'Strategic planning'],
    },
    markets: {
      name: 'MARKETS.AI',
      icon: <BarChartIcon />,
      color: '#FF5722',
      context: 'market_integration',
      description: 'Market Intelligence',
      capabilities: ['Market signals', 'Competitor analysis', 'Price optimization'],
    },
    supply: {
      name: 'SUPPLY.AI',
      icon: <LocalShippingIcon />,
      color: '#00BCD4',
      context: 'supply_chain',
      description: 'Supply Chain Intelligence',
      capabilities: ['Inventory optimization', 'Route planning', 'Supplier management'],
    },
    finance: {
      name: 'FINANCE.AI',
      icon: <AttachMoneyIcon />,
      color: '#4CAF50',
      context: 'financial_analytics',
      description: 'Financial Analytics',
      capabilities: ['Cost analysis', 'Revenue optimization', 'Budget forecasting'],
    },
    customer: {
      name: 'CUSTOMER.AI',
      icon: <PeopleIcon />,
      color: '#FF9800',
      context: 'customer_analytics',
      description: 'Customer Intelligence',
      capabilities: ['Behavior analysis', 'Segmentation', 'Satisfaction metrics'],
    },
  };

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
      type: 'system',
      content: 'Welcome to Ask Anything! Ask me about AI assistants, database schemas, features, or platform capabilities.\n\nSelect specific AI assistants above for specialized queries.',
      timestamp: new Date(),
    }]);
  }, []);

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
      // If no AIs selected, use Mantra AI
      if (selectedAIs.length === 0) {
        const platformResponse = {
          id: Date.now() + 1,
          type: 'platform',
          query: inputMessage,
          timestamp: new Date(),
          content: `Mantra AI Response:\n\n`,
        };

        // Simulate Mantra AI response
        setTimeout(() => {
          // Add platform-specific responses based on query
          if (inputMessage.toLowerCase().includes('core.ai')) {
            platformResponse.content += 'CORE.AI is our Operational AI assistant that focuses on:\n• Real-time operational metrics\n• Process optimization\n• Efficiency analysis\n• Automated workflow recommendations\n\nIt monitors KPIs, identifies bottlenecks, and suggests improvements.';
          } else if (inputMessage.toLowerCase().includes('database') || inputMessage.toLowerCase().includes('table')) {
            platformResponse.content += 'The platform uses the following data structures:\n• Sales tables: order_details, customer_transactions\n• Inventory: product_catalog, stock_levels\n• Analytics: performance_metrics, kpi_dashboard\n• AI Models: model_configurations, execution_logs';
          } else if (inputMessage.toLowerCase().includes('document intelligence')) {
            platformResponse.content += 'Document Intelligence allows you to:\n• Upload any document (PDF, Word, Excel, Images)\n• Automatic content extraction and analysis\n• AI-powered summarization\n• Data quality assessment\n• Interactive Q&A about document contents';
          } else if (inputMessage.toLowerCase().includes('control center')) {
            platformResponse.content += 'Control Center is your central hub for:\n• Managing all AI models and agents\n• Configuring data sources and connections\n• Monitoring system performance\n• Setting automation rules\n• Viewing real-time analytics';
          } else {
            platformResponse.content += 'I can help you understand any aspect of this platform. Try asking about:\n• Specific AI assistants (CORE.AI, AXIS.AI, MARKETS.AI)\n• Features like Document Intelligence or Query Builder\n• Database schemas and data structures\n• Platform capabilities and integrations';
          }
          
          setMessages(prev => [...prev, platformResponse]);
          setLoading(false);
        }, 1000);
        
        return;
      }

      // Create a container for all AI responses
      const responseContainer = {
        id: Date.now() + 1,
        type: 'ai-unified',
        query: inputMessage,
        responses: {},
        timestamp: new Date(),
      };

      // Query all selected AIs in parallel
      const promises = selectedAIs.map(async (aiKey) => {
        const config = aiConfigs[aiKey];
        try {
          const response = await fetch('http://localhost:8000/api/v1/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              question: inputMessage,
              context: config.context
            }),
          });
          const data = await response.json();
          return {
            ai: aiKey,
            success: true,
            data: data,
            message: data.explanation || 'Analysis completed.',
            sql: data.sql,
          };
        } catch (error) {
          return {
            ai: aiKey,
            success: false,
            error: error.message,
          };
        }
      });

      const results = await Promise.all(promises);
      
      // Organize results by AI
      results.forEach(result => {
        responseContainer.responses[result.ai] = result;
      });

      setMessages(prev => [...prev, responseContainer]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'system',
        content: 'An error occurred while processing your request. Please try again.',
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

  const handleAISelection = (event, newSelection) => {
    if (newSelection.length > 0) {
      setSelectedAIs(newSelection);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      type: 'system',
      content: 'Chat cleared. How can the AI team help you today?',
      timestamp: new Date(),
    }]);
    setAnchorEl(null);
  };

  const exportChat = () => {
    const chatContent = messages.map(m => {
      if (m.type === 'user') {
        return `[${m.timestamp.toLocaleTimeString()}] You: ${m.content}`;
      } else if (m.type === 'ai-unified') {
        let content = `[${m.timestamp.toLocaleTimeString()}] AI Team Response to: "${m.query}"\n`;
        Object.entries(m.responses).forEach(([aiKey, response]) => {
          const config = aiConfigs[aiKey];
          content += `\n${config.name}: ${response.message || response.error}`;
          if (response.sql) {
            content += `\nSQL: ${response.sql}`;
          }
        });
        return content;
      }
      return `[${m.timestamp.toLocaleTimeString()}] System: ${m.content}`;
    }).join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unified_chat_${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setAnchorEl(null);
  };

  const renderAIResponse = (aiKey, response) => {
    const config = aiConfigs[aiKey];
    
    return (
      <Box key={aiKey} sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
          <Avatar sx={{ bgcolor: config.color, width: 36, height: 36 }}>
            {config.icon}
          </Avatar>
          <Typography variant="subtitle2" fontWeight="bold">
            {config.name}
          </Typography>
          {response.success && (
            <CheckCircleIcon fontSize="small" color="success" />
          )}
        </Stack>
        
        {response.success ? (
          <>
            <Typography variant="body2" sx={{ mb: 1, ml: 5 }}>
              {response.message}
            </Typography>
            {response.sql && (
              <Box sx={{ mt: 1, ml: 5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Generated SQL
                  </Typography>
                  <IconButton size="small" onClick={() => copyToClipboard(response.sql)}>
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Paper variant="outlined" sx={{ p: 1, bgcolor: 'grey.50' }}>
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {response.sql}
                  </Typography>
                </Paper>
              </Box>
            )}
          </>
        ) : (
          <Alert severity="error" sx={{ py: 0.5, ml: 5 }}>
            {response.error || 'Failed to get response'}
          </Alert>
        )}
      </Box>
    );
  };

  const renderUnifiedResponse = (responses) => {
    // Extract common patterns or aggregate insights
    const successfulResponses = Object.values(responses).filter(r => r.success);
    
    if (successfulResponses.length === 0) {
      return (
        <Alert severity="error">
          All AI assistants encountered errors processing this request.
        </Alert>
      );
    }

    return (
      <Box>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>Unified Analysis:</strong> {successfulResponses.length} AI assistants have analyzed your query.
        </Typography>
        
        {/* Show individual AI responses */}
        {Object.entries(responses).map(([aiKey, response]) => 
          renderAIResponse(aiKey, response)
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Enhanced Header */}
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
                  Ask Anything
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Mantra AI & AI Assistant Hub
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Chip 
                label={selectedAIs.length === 0 ? 'Platform Mode' : `${selectedAIs.length} AI${selectedAIs.length > 1 ? 's' : ''} Selected`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <IconButton sx={{ color: 'white' }} onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Box>
        
        {/* AI Selection Grid */}
        <Box sx={{ bgcolor: 'rgba(0,0,0,0.1)', p: 2 }}>
          <Typography variant="caption" sx={{ mb: 1.5, display: 'block', opacity: 0.9 }}>
            Select AI Assistants to query (optional - leave empty for Mantra AI)
          </Typography>
          <Grid container spacing={1}>
            {Object.entries(aiConfigs).map(([key, config]) => (
              <Grid item xs={6} sm={4} md={2} key={key}>
                <Card 
                  sx={{ 
                    bgcolor: selectedAIs.includes(key) ? config.color : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: '2px solid',
                    borderColor: selectedAIs.includes(key) ? 'white' : 'transparent',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }
                  }}
                  onClick={() => {
                    if (selectedAIs.includes(key)) {
                      setSelectedAIs(selectedAIs.filter(ai => ai !== key));
                    } else {
                      setSelectedAIs([...selectedAIs, key]);
                    }
                  }}
                >
                  <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      width: 40, 
                      height: 40,
                      mx: 'auto',
                      mb: 1
                    }}>
                      {config.icon}
                    </Avatar>
                    <Typography variant="caption" fontWeight="bold" display="block">
                      {config.name}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.8 }}>
                      {config.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
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
            {message.type === 'user' ? (
              <Stack
                direction="row"
                spacing={2}
                sx={{ maxWidth: '70%', alignItems: 'flex-start' }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                  }}
                >
                  <Typography variant="body1">{message.content}</Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.8 }}>
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Paper>
                <Avatar sx={{ bgcolor: 'grey.500', width: 36, height: 36 }}>
                  <PersonIcon />
                </Avatar>
              </Stack>
            ) : message.type === 'ai-unified' ? (
              <Box sx={{ maxWidth: '85%' }}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  {showIndividualResponses ? (
                    renderUnifiedResponse(message.responses)
                  ) : (
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Combined Analysis:</strong>
                      </Typography>
                      {/* Show a summary view */}
                      <Grid container spacing={1}>
                        {Object.entries(message.responses).map(([aiKey, response]) => {
                          const config = aiConfigs[aiKey];
                          return (
                            <Grid item xs={12} key={aiKey}>
                              <Chip
                                avatar={
                                  <Avatar sx={{ bgcolor: config.color }}>
                                    {config.icon}
                                  </Avatar>
                                }
                                label={`${config.name}: ${response.success ? 'Completed' : 'Failed'}`}
                                color={response.success ? 'success' : 'error'}
                                size="small"
                              />
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Box>
            ) : (
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar sx={{ 
                  bgcolor: message.type === 'platform' ? '#667eea' : '#f0f0f0', 
                  width: 36, 
                  height: 36 
                }}>
                  {message.type === 'platform' ? <PsychologyIcon /> : <AIIcon />}
                </Avatar>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: 'white',
                    maxWidth: '70%',
                    borderRadius: '4px 18px 18px 18px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {message.content}
                  </Typography>
                  {message.error && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {message.error}
                    </Alert>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Stack>
            )}
          </Box>
        ))}
        
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              {selectedAIs.length === 0 ? 'Mantra AI is' : `${selectedAIs.length} AI assistant${selectedAIs.length > 1 ? 's are' : ' is'}`} analyzing your query...
            </Typography>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Quick Questions for Mantra AI */}
      {messages.length <= 1 && (
        <Box sx={{ 
          background: 'linear-gradient(to right, #f5f7fa 0%, #c3cfe2 100%)',
          p: 3,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <LightbulbIcon sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" fontWeight="bold">
              Suggested Questions
            </Typography>
          </Stack>
          <Grid container spacing={1}>
            {[
              { icon: <AnalyticsIcon />, text: 'What can CORE.AI do?', color: '#4285F4' },
              { icon: <StorageIcon />, text: 'Show me all database tables', color: '#34A853' },
              { icon: <DescriptionIcon />, text: 'How do I use Document Intelligence?', color: '#9C27B0' },
              { icon: <CableIcon />, text: 'What data sources are connected?', color: '#EA4335' },
              { icon: <HubIcon />, text: 'Explain the Control Center', color: '#FF9800' },
              { icon: <TimelineIcon />, text: 'What is AXIS.AI capable of?', color: '#9C27B0' },
              { icon: <BarChartIcon />, text: 'How does MARKETS.AI work?', color: '#FF5722' },
              { icon: <PsychologyIcon />, text: 'Compare all AI assistants', color: '#00BCD4' },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    }
                  }}
                  onClick={() => setInputMessage(item.text)}
                >
                  <CardContent sx={{ p: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ bgcolor: item.color + '20', width: 32, height: 32 }}>
                        {React.cloneElement(item.icon, { sx: { fontSize: 18, color: item.color } })}
                      </Avatar>
                      <Typography variant="caption" sx={{ fontSize: '0.8rem' }}>
                        {item.text}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
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
            placeholder={
              'Ask anything about the platform, AI assistants, features, data, or capabilities...'
            }
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Badge badgeContent={selectedAIs.length} color="primary">
                    <IconButton
                      color="primary"
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || loading}
                    >
                      <SendIcon />
                    </IconButton>
                  </Badge>
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Paper>
    </Box>
  );
};

export default UnifiedChatInterface;