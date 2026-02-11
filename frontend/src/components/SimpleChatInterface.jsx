import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
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
  Alert,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip as MuiTooltip,
  Tab,
  Tabs,
  Card,
  CardContent,
  alpha,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as PersonIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon,
  Link as LinkIcon,
  History as HistoryIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  DeleteOutline as DeleteOutlineIcon,
  Insights as InsightsIcon,
  Close as CloseIcon,
  ChatOutlined as ChatIcon,
  Science as ResearchIcon,
  Edit as EditIcon,
  PlayArrow as PlayArrowIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  Analytics as AnalyticsIcon,
  TableChart as TableChartIcon,
  ScatterPlot as ScatterPlotIcon,
  Radar as RadarIcon,
  ViewModule as ViewModuleIcon,
  FilterList as FilterListIcon,
  Dashboard as DashboardIcon,
  AutoGraph as AutoGraphIcon,
  InfoOutlined as InfoIcon,
  Forum as ForumIcon,
  Tag as TagIcon,
  AttachMoney as MoneyIcon,
  Numbers as NumbersIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Percent as PercentIcon,
  AccountCircle as AccountIcon,
  Store as StoreIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { apiService } from '../services/api';
import ResultAnalysis from './ResultAnalysis';
import DeepResearchInterface from './DeepResearchInterface';
import QueryLogger from './QueryLogger';
import EnhancedAnalyticsModal from './EnhancedAnalyticsModal';
import MantraxResultsView from './MantraxResultsView';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap, FunnelChart, Funnel,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  ResponsiveContainer
} from 'recharts';

// Chart colors
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#67b7dc'];

const getColors = (darkMode) => ({
  primary: darkMode ? '#4d9eff' : '#00357a',
  text: darkMode ? '#e6edf3' : '#1e293b',
  textSecondary: darkMode ? '#8b949e' : '#64748b',
  background: darkMode ? '#0d1117' : '#f8fbfd',
  paper: darkMode ? '#161b22' : '#ffffff',
  cardBg: darkMode ? '#21262d' : '#ffffff',
  border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
});

// Helper function: Debounce utility
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Helper function: Group conversations by date
const getDateGroup = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const thisWeek = new Date(today);
  thisWeek.setDate(thisWeek.getDate() - 7);
  const thisMonth = new Date(today);
  thisMonth.setDate(thisMonth.getDate() - 30);

  if (date >= today) return 'Today';
  if (date >= yesterday) return 'Yesterday';
  if (date >= thisWeek) return 'This Week';
  if (date >= thisMonth) return 'This Month';
  return 'Older';
};

// Helper function: Group conversations
const groupConversations = (conversations) => {
  const groups = {
    'Today': [],
    'Yesterday': [],
    'This Week': [],
    'This Month': [],
    'Older': []
  };

  conversations.forEach(conv => {
    const group = getDateGroup(conv.updated_at || conv.updatedAt);
    groups[group].push(conv);
  });

  return groups;
};

// Sample queries for quick access
const SAMPLE_QUERIES = [
  { 
    category: "Revenue Analysis", 
    queries: [
      "What's our monthly recurring revenue?",
      "Show revenue by product line",
      "Compare this year vs last year revenue"
    ]
  },
  { 
    category: "Cost Management", 
    queries: [
      "What are our biggest expense categories?",
      "Show COGS trend over time",
      "Calculate gross margin by product"
    ]
  },
  { 
    category: "Customer Insights", 
    queries: [
      "Who are our top customers by lifetime value?",
      "Show customer acquisition trends",
      "Analyze churn rate by segment"
    ]
  },
  { 
    category: "Performance Metrics", 
    queries: [
      "Calculate ROI for marketing campaigns",
      "Show key performance indicators dashboard",
      "What's our cash conversion cycle?"
    ]
  }
];

const SimpleChatInterface = ({ darkMode = false }) => {
  const colors = getColors(darkMode);

  // Get authenticated user from Clerk
  const { user, isLoaded: isUserLoaded } = useUser();

  // Derive userId from authenticated user or use email as fallback
  const userId = user?.id || user?.primaryEmailAddress?.emailAddress || 'default';

  // Pre-populate with welcome message
  const [messages, setMessages] = useState([{
    id: Date.now(),
    type: 'assistant',
    content: 'Hello! I\'m AXIS.AI, your BigQuery analytics assistant. I can query your BigQuery datasets to answer business questions. Try asking something like "Show me revenue by product" or "What are the top 10 customers by sales?". I\'ll maintain context throughout our conversation for follow-up questions.',
    timestamp: new Date(),
  }]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [openAnalysisDialog, setOpenAnalysisDialog] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showSampleQueries, setShowSampleQueries] = useState(true);
  const [mode, setMode] = useState('chat'); // 'chat' or 'research'
  const [viewMode, setViewMode] = useState('chat'); // 'chat' or 'history' within chat mode
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [detailedResultsData, setDetailedResultsData] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [editedSql, setEditedSql] = useState({});
  const [visualizationType, setVisualizationType] = useState({});
  const [sqlTheme, setSqlTheme] = useState('github');
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsModalData, setAnalyticsModalData] = useState(null);
  const [analyticsModalMode, setAnalyticsModalMode] = useState('modal'); // 'modal', 'drawer', 'embedded'
  const [showDeepResearch, setShowDeepResearch] = useState(false);
  const [deepResearchQuestion, setDeepResearchQuestion] = useState('');
  const initializationRef = useRef(false);

  console.log('SimpleChatInterface rendering, mode:', mode, 'userId:', userId);


  // Initialize on mount - wait for user to be loaded
  useEffect(() => {
    let isMounted = true;

    const initializeChat = async () => {
      if (!isMounted || !isUserLoaded) return;

      try {
        console.log('=== Initializing chat for user:', userId, '===');

        // First check localStorage for existing conversation (scoped to user)
        const savedConversationId = localStorage.getItem(`currentConversationId_${userId}`);
        console.log('Saved conversation ID from localStorage:', savedConversationId);

        // Load all conversations for this user from database
        console.log('Fetching conversations from database for user:', userId);
        const response = await apiService.listConversations(userId);
        const loadedConversations = response.data.conversations || [];
        console.log(`Loaded ${loadedConversations.length} conversations from database`);

        // Sort conversations by updated_at (should already be sorted by backend, but ensure it)
        const sortedConversations = loadedConversations.sort((a, b) => {
          const dateA = new Date(a.updated_at || a.updatedAt);
          const dateB = new Date(b.updated_at || b.updatedAt);
          return dateB - dateA;
        });

        setConversations(sortedConversations);

        // If we have a saved conversation ID, try to load it (if it exists in DB)
        if (savedConversationId && sortedConversations.some(c => (c.conversation_id || c.conversationId) === savedConversationId)) {
          console.log('Loading saved conversation:', savedConversationId);
          await loadConversation(savedConversationId);
        } else if (sortedConversations.length > 0) {
          // Load the most recent conversation
          const mostRecentId = sortedConversations[0].conversation_id || sortedConversations[0].conversationId;
          console.log('Loading most recent conversation:', mostRecentId);
          await loadConversation(mostRecentId);
        } else {
          // No conversations exist, create a new one
          console.log('No conversations found in database, creating new one');
          await createNewConversation(false);
        }

        console.log('=== Chat initialization complete ===');
      } catch (error) {
        console.error('Initialization error:', error);
        // If all else fails, create a new conversation
        if (isMounted && !conversationId) {
          await createNewConversation(false);
        }
      }
    };

    // Only initialize if we haven't already and user is loaded
    if (!conversationId && isUserLoaded) {
      initializeChat();
    }

    return () => {
      isMounted = false;
    };
  }, [isUserLoaded, userId]); // Re-run when user loads or changes

  // Auto-scroll to latest message
  useEffect(() => {
    // Small delay to ensure DOM is updated with new message
    const scrollTimeout = setTimeout(() => {
      // Scroll messages container to bottom to show latest message
      const messagesContainer = document.querySelector('[data-messages-container="true"]');
      if (messagesContainer) {
        messagesContainer.scrollTo({
          top: messagesContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
    
    // Keep conversations list at top when switching conversations
    if (conversationId) {
      const conversationsList = document.querySelector('[data-conversations-list="true"]');
      if (conversationsList) {
        conversationsList.scrollTop = 0;
      }
    }
    
    return () => clearTimeout(scrollTimeout);
  }, [messages, conversationId, loading]); // Scroll when messages change, conversation changes, or loading state changes

  // Load conversations from MongoDB
  const loadConversations = async () => {
    setLoadingConversations(true);
    try {
      const response = await apiService.listConversations(userId);
      const loadedConversations = response.data.conversations || [];

      // Sort by updated_at (most recent first)
      const sortedConversations = loadedConversations.sort((a, b) => {
        const dateA = new Date(a.updated_at || a.updatedAt);
        const dateB = new Date(b.updated_at || b.updatedAt);
        return dateB - dateA; // Descending order
      });

      setConversations(sortedConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Create a new conversation
  const createNewConversation = async (shouldReloadList = true) => {
    try {
      console.log('Creating conversation on backend...');
      const response = await apiService.createConversation(userId);
      const newConvId = response.data.conversation_id;
      console.log('Created conversation:', newConvId);
      setConversationId(newConvId);
      
      // Save to localStorage (scoped to user)
      localStorage.setItem(`currentConversationId_${userId}`, newConvId);
      
      // Set welcome message
      const welcomeMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Hello! I\'m AXIS.AI, your BigQuery analytics assistant. I can query your BigQuery datasets to answer business questions. Try asking something like "Show me revenue by product" or "What are the top 10 customers by sales?". I\'ll maintain context throughout our conversation for follow-up questions.',
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessage]);
      
      // Save welcome message to backend
      try {
        await apiService.addMessage(newConvId, welcomeMessage);
      } catch (error) {
        console.error('Failed to save welcome message:', error);
      }
      
      // Reload conversations list only if requested
      if (shouldReloadList) {
        console.log('Reloading conversations list...');
        await loadConversations();
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      // Fallback to local conversation ID
      const fallbackId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setConversationId(fallbackId);
      localStorage.setItem(`currentConversationId_${userId}`, fallbackId);
    }
  };

  // Load a specific conversation
  const loadConversation = async (convId) => {
    try {
      const response = await apiService.getConversation(convId);
      const conversation = response.data;
      
      // Convert messages to the format expected by the UI
      const formattedMessages = conversation.messages.map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        sql: msg.sql,
        results: msg.results,
        resultCount: msg.result_count,
        error: msg.error,
        metadata: msg.metadata,
        timestamp: new Date(msg.timestamp),
      }));
      
      // If no messages, add the welcome message
      if (formattedMessages.length === 0) {
        formattedMessages.push({
          id: Date.now(),
          type: 'assistant',
          content: 'Hello! I\'m AXIS.AI, your BigQuery analytics assistant. I can query your BigQuery datasets to answer business questions. Try asking something like "Show me revenue by product" or "What are the top 10 customers by sales?". I\'ll maintain context throughout our conversation for follow-up questions.',
          timestamp: new Date(),
        });
      }
      
      setMessages(formattedMessages);
      setConversationId(convId);

      // Save to localStorage for persistence (scoped to user)
      localStorage.setItem(`currentConversationId_${userId}`, convId);
      
      // Don't close the sidebar when selecting a conversation
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const scrollToBottom = () => {
    const messagesContainer = document.querySelector('[data-messages-container="true"]');
    if (messagesContainer) {
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    
    // Immediately scroll when user sends message
    setTimeout(scrollToBottom, 50);

    // Don't save user message here - the backend will save it when processing the query

    try {
      // Call BigQuery API with conversation ID (AXIS.AI uses BigQuery)
      console.log('Sending BigQuery query:', inputMessage, 'with conversation ID:', conversationId);
      const response = await apiService.executeBigQuery(inputMessage, { conversationId });
      const { data } = response;
      
      console.log('API Response:', data);

      // Check if we have an error in the response
      if (data.error) {
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.error_details?.user_friendly_message || 'Sorry, I encountered an error processing your query.',
          error: data.error,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        
        // Scroll to show the error
        setTimeout(scrollToBottom, 100);
        
        // Don't save error message here - backend already saved it
        
        return;
      }

      // Create assistant message with results
      console.log('🔍 API Response Debug:', {
        hasTopLevelResults: !!data.results,
        topLevelResultsLength: data.results?.length,
        topLevelResultsType: typeof data.results,
        hasExecutionResults: !!data.execution?.results,
        executionResultsLength: data.execution?.results?.length,
        executionResultsType: typeof data.execution?.results,
        firstResult: data.results?.[0] || data.execution?.results?.[0],
        fullDataKeys: Object.keys(data),
        executionKeys: data.execution ? Object.keys(data.execution) : null
      });

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.explanation || 'Query executed successfully.',
        sql: data.sql,
        results: data.results || data.execution?.results || [],
        resultCount: data.row_count || data.execution?.row_count || 0,
        metadata: {
          cost: data.validation?.estimated_cost_usd,
          bytesProcessed: data.validation?.total_bytes_processed,
          tablesUsed: data.tables_used,
        },
        timestamp: new Date(),
      };

      console.log('📊 Assistant Message Created:', {
        resultsLength: assistantMessage.results.length,
        resultCount: assistantMessage.resultCount,
        firstResult: assistantMessage.results[0]
      });

      console.log('Assistant message with results:', assistantMessage.results);
      console.log('Results type:', typeof assistantMessage.results);
      console.log('Results length:', assistantMessage.results?.length);
      setMessages(prev => [...prev, assistantMessage]);
      
      // Scroll to show the response
      setTimeout(scrollToBottom, 100);
      
      // Don't save assistant message here - backend already saved it

      // Reload conversations to update the list
      await loadConversations();

    } catch (error) {
      console.error('Query error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your query.',
        error: error.response?.data?.detail || error.message,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Scroll to show the error
      setTimeout(scrollToBottom, 100);
      
      // Don't save error message here - let backend handle it
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRunModifiedSql = async (messageId, sql) => {
    setLoading(true);
    try {
      const response = await apiService.executeBigQuery(sql, { conversationId, isModifiedSql: true });
      const { data } = response;
      
      if (data.error) {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: `Error running modified SQL: ${data.error_details?.user_friendly_message || data.error}`,
          error: data.error,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      // Create a new message for the modified query results
      const resultMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'Modified query executed successfully.',
        sql: sql,
        results: data.execution?.results || [],
        resultCount: data.execution?.row_count || 0,
        metadata: {
          cost: data.validation?.estimated_cost_usd,
          bytesProcessed: data.validation?.total_bytes_processed,
          tablesUsed: data.tables_used,
        },
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, resultMessage]);
      setEditMode(prev => ({ ...prev, [messageId]: false }));
    } catch (error) {
      console.error('Error running modified SQL:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'Sorry, I encountered an error running the modified SQL.',
        error: error.response?.data?.detail || error.message,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadCSV = (results) => {
    if (!results || results.length === 0) return;
    
    const headers = Object.keys(results[0]);
    const csv = [
      headers.join(','),
      ...results.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAnalyzeResults = async (message) => {
    if (!message.results || message.results.length === 0) return;
    
    setActiveMessageId(message.timestamp);
    setAnalysisLoading(true);
    setOpenAnalysisDialog(true);
    
    // Find the original user question by looking for the previous user message
    const messageIndex = messages.findIndex(m => m.id === message.id);
    let userQuestion = 'Query results';
    
    // Look backwards from the current message to find the user's question
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].type === 'user') {
        userQuestion = messages[i].content;
        break;
      }
    }
    
    try {
      // Log the data being sent for debugging
      // Debug logging
      console.log('Analyze Results Request:', {
        question: userQuestion,
        sql: message.sql,
        resultsCount: message.results?.length,
        resultsType: typeof message.results,
        results: message.results?.slice(0, 2), // Log first 2 results
        metadata: message.metadata
      });
      
      const response = await apiService.analyzeResults(
        userQuestion,
        message.sql,
        message.results,
        message.metadata
      );
      
      setActiveAnalysis(response.data);
    } catch (error) {
      console.error('Failed to analyze results:', error);
      
      // Log more detailed error information
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          detail: error.response.data?.detail
        });
      }
      // Show error in analysis
      setActiveAnalysis({
        summary: 'An error occurred while analyzing the results. Please try again.',
        key_insights: ['Error: ' + error.message],
        trends: []
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleFollowUpQuestion = (question) => {
    setInputMessage(question);
    setOpenAnalysisDialog(false);
    // Focus the input field
    setTimeout(() => {
      document.querySelector('input[type="text"]')?.focus();
    }, 100);
  };

  const handleViewDetailedResults = (message) => {
    // Find the user message that triggered this response
    const messageIndex = messages.findIndex(m => m.id === message.id);
    const userQuery = messageIndex > 0 ? messages[messageIndex - 1].content : message.content;
    
    setDetailedResultsData({
      query: userQuery,
      sql: message.sql,
      results: message.results,
      metadata: message.metadata
    });
    setShowDetailedResults(true);
  };

  const handleNewChat = async () => {
    setInputMessage('');
    // Clear messages and set welcome message
    setMessages([{
      id: Date.now(),
      type: 'assistant',
      content: 'Hello! I\'m AXIS.AI, your BigQuery analytics assistant. I can query your BigQuery datasets to answer business questions. Try asking something like "Show me revenue by product" or "What are the top 10 customers by sales?". I\'ll maintain context throughout our conversation for follow-up questions.',
      timestamp: new Date(),
    }]);
    await createNewConversation();
    setHistoryOpen(false);
  };

  // Delete a conversation
  const handleDeleteConversation = async (convId) => {
    try {
      await apiService.deleteConversation(convId);
      await loadConversations();
      
      // If we deleted the current conversation, create a new one
      if (convId === conversationId) {
        await createNewConversation();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  // Clear all conversations
  const handleClearAllConversations = async () => {
    if (!window.confirm('Are you sure you want to clear all conversations? This cannot be undone.')) {
      return;
    }

    setLoadingConversations(true);

    try {
      console.log('Starting to delete all conversations for user:', userId);

      // Use bulk delete endpoint
      const response = await apiService.deleteAllConversations(userId);
      console.log('Delete all response:', response.data);

      const deletedCount = response.data.deleted_count || 0;
      console.log(`Successfully deleted ${deletedCount} conversations from database`);

      // Clear local state immediately
      setConversations([]);
      setConversationId(null);
      localStorage.removeItem(`currentConversationId_${userId}`);

      // Set welcome message for new conversation
      setMessages([{
        id: Date.now(),
        type: 'assistant',
        content: 'Hello! I\'m AXIS.AI, your BigQuery analytics assistant. I can query your BigQuery datasets to answer business questions. Try asking something like "Show me revenue by product" or "What are the top 10 customers by sales?". I\'ll maintain context throughout our conversation for follow-up questions.',
        timestamp: new Date(),
      }]);

      // Create new conversation
      await createNewConversation(false); // Don't reload list since we already cleared it

      // Verify deletion by reloading conversations
      setTimeout(async () => {
        const verifyResponse = await apiService.listConversations(userId);
        const remainingConvs = verifyResponse.data.conversations || [];
        console.log(`Verification: ${remainingConvs.length} conversations remaining after delete`);

        if (remainingConvs.length > 1) {
          // Should only have the newly created conversation
          console.warn('Warning: More conversations than expected after delete');
        }
      }, 1000);

      console.log('Successfully cleared all conversations and created new one');
    } catch (error) {
      console.error('Failed to clear conversations:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Failed to clear conversations: ${error.response?.data?.detail || error.message}`);

      // Reload conversations to sync state
      await loadConversations();
    } finally {
      setLoadingConversations(false);
    }
  };

  // Helper to parse formatted numbers (handles $, commas, etc.)
  const parseFormattedNumber = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove $, commas, and whitespace
      const cleaned = value.replace(/[$,\s]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  };

  // Prepare chart data
  const prepareChartData = (results) => {
    if (!results || results.length === 0) {
      return null;
    }

    const keys = Object.keys(results[0]);

    // Try to identify numeric columns - improved detection to handle formatted numbers
    const numericColumns = keys.filter(key => {
      return results.every(row => {
        const value = row[key];
        // Skip null/undefined values
        if (value === null || value === undefined || value === '') {
          return true;
        }
        // Check if it's a number or can be parsed as a formatted number
        if (typeof value === 'number') return true;

        // Try to parse formatted strings like "$1,234.56"
        const parsed = parseFormattedNumber(value);
        return parsed !== null;
      });
    });

    // Sanitize data: convert formatted strings to numbers for charts
    const sanitizedData = results.map(row => {
      const sanitized = { ...row };
      numericColumns.forEach(col => {
        if (sanitized[col] !== null && sanitized[col] !== undefined) {
          const parsed = parseFormattedNumber(sanitized[col]);
          if (parsed !== null) {
            sanitized[col] = parsed;
          }
        }
      });
      return sanitized;
    });

    console.log('Chart data preparation:', {
      totalColumns: keys.length,
      numericColumns: numericColumns,
      hasNumericData: numericColumns.length > 0,
      sampleData: sanitizedData[0]
    });

    return {
      data: sanitizedData,
      keys,
      numericColumns,
      hasNumericData: numericColumns.length > 0
    };
  };

  // Intelligently prepare data for specific chart type
  const prepareDataForChartType = (data, keys, numericColumns, vizType) => {
    const labelKey = keys.find(k => !numericColumns.includes(k)) || keys[0];
    const valueKey = numericColumns[0];

    // For PIE charts: Aggregate and show top categories
    if (vizType === 'pie') {
      // Group by label key and sum the primary numeric column
      const aggregated = {};
      data.forEach(row => {
        const label = String(row[labelKey] || 'Unknown');
        const value = parseFloat(row[valueKey]) || 0;
        aggregated[label] = (aggregated[label] || 0) + value;
      });

      // Convert to array and sort by value
      let pieData = Object.entries(aggregated).map(([name, value]) => ({
        name,
        value
      })).sort((a, b) => b.value - a.value);

      // Show top 8, group rest as "Others"
      if (pieData.length > 8) {
        const top8 = pieData.slice(0, 8);
        const others = pieData.slice(8).reduce((sum, item) => sum + item.value, 0);
        if (others > 0) {
          pieData = [...top8, { name: 'Others', value: others }];
        } else {
          pieData = top8;
        }
      }

      return { data: pieData, labelKey: 'name', valueKey: 'value', numericColumns: ['value'] };
    }

    // For BAR charts: Limit to top performers if too many rows
    if (vizType === 'bar' && data.length > 15) {
      // Sort by first numeric column and take top 15
      const sorted = [...data].sort((a, b) => {
        const aVal = parseFloat(a[valueKey]) || 0;
        const bVal = parseFloat(b[valueKey]) || 0;
        return bVal - aVal;
      });
      return { data: sorted.slice(0, 15), labelKey, valueKey, numericColumns };
    }

    // For LINE charts: Sort by label (assuming it's time-based or sequential)
    if (vizType === 'line') {
      // Try to sort by label - useful for time series
      const sorted = [...data].sort((a, b) => {
        const aLabel = a[labelKey];
        const bLabel = b[labelKey];
        // If labels are dates or numbers, sort accordingly
        if (!isNaN(Date.parse(aLabel)) && !isNaN(Date.parse(bLabel))) {
          return new Date(aLabel) - new Date(bLabel);
        }
        if (!isNaN(aLabel) && !isNaN(bLabel)) {
          return parseFloat(aLabel) - parseFloat(bLabel);
        }
        return String(aLabel).localeCompare(String(bLabel));
      });

      // Limit to reasonable number of data points for line chart
      if (sorted.length > 30) {
        return { data: sorted.slice(0, 30), labelKey, valueKey, numericColumns };
      }
      return { data: sorted, labelKey, valueKey, numericColumns };
    }

    // For AREA charts: Same as line
    if (vizType === 'area') {
      const sorted = [...data].sort((a, b) => {
        const aLabel = a[labelKey];
        const bLabel = b[labelKey];
        if (!isNaN(Date.parse(aLabel)) && !isNaN(Date.parse(bLabel))) {
          return new Date(aLabel) - new Date(bLabel);
        }
        return String(aLabel).localeCompare(String(bLabel));
      });
      if (sorted.length > 30) {
        return { data: sorted.slice(0, 30), labelKey, valueKey, numericColumns };
      }
      return { data: sorted, labelKey, valueKey, numericColumns };
    }

    // Default: return as is
    return { data, labelKey, valueKey, numericColumns };
  };

  // Render visualization based on type
  const renderVisualization = (messageId, results) => {
    console.log('renderVisualization called:', { messageId, results });

    const chartData = prepareChartData(results);
    if (!chartData || !chartData.hasNumericData) {
      return (
        <Alert
          severity="info"
          sx={{
            bgcolor: darkMode ? alpha('#00357a', 0.15) : undefined,
            color: colors.text,
            '& .MuiAlert-icon': { color: darkMode ? '#64b5f6' : undefined },
          }}
        >
          No numeric data available for visualization. Switch to table view.
        </Alert>
      );
    }

    const vizType = visualizationType[messageId] || 'table';

    // Intelligently prepare data based on chart type
    const { data, labelKey, valueKey, numericColumns } = prepareDataForChartType(
      chartData.data,
      chartData.keys,
      chartData.numericColumns,
      vizType
    );
    
    // Get transformation info message
    const getTransformationMessage = () => {
      if (vizType === 'pie') {
        return `Aggregated ${results.length} rows by ${labelKey}, showing top ${data.length} categories`;
      }
      if (vizType === 'bar' && results.length > 15 && data.length === 15) {
        return `Showing top 15 out of ${results.length} rows, sorted by ${valueKey}`;
      }
      if ((vizType === 'line' || vizType === 'area') && results.length > 30 && data.length === 30) {
        return `Showing first 30 data points out of ${results.length} rows`;
      }
      return null;
    };

    const transformationMsg = getTransformationMessage();

    console.log('Visualization data:', {
      vizType,
      labelKey,
      valueKey,
      numericColumns,
      dataLength: data.length
    });

    // Enhanced tooltip formatter
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <Box sx={{ 
            bgcolor: 'background.paper', 
            p: 2, 
            border: 1, 
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 2
          }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {`${labelKey}: ${label}`}
            </Typography>
            {payload.map((entry, index) => (
              <Typography key={index} variant="body2" sx={{ color: entry.color }}>
                {`${entry.dataKey}: ${typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}`}
              </Typography>
            ))}
          </Box>
        );
      }
      return null;
    };

    return (
      <Box>
        {transformationMsg && (
          <Alert
            severity="info"
            sx={{
              mb: 2,
              bgcolor: darkMode ? alpha('#00357a', 0.15) : undefined,
              color: colors.text,
              '& .MuiAlert-icon': { color: darkMode ? '#64b5f6' : undefined },
            }}
          >
            {transformationMsg}
          </Alert>
        )}
        {renderChartByType()}
      </Box>
    );

    function renderChartByType() {
    // Helper to truncate long labels
    const truncateLabel = (label, maxLength = 20) => {
      if (!label) return '';
      const str = String(label);
      return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
    };

    switch (vizType) {
      case 'bar':
        return (
          <Box sx={{ width: '100%', height: 450, overflow: 'hidden', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey={labelKey}
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={90}
                  interval={0}
                  tickFormatter={(value) => truncateLabel(value, 25)}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  width={80}
                  tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                {numericColumns.map((col, idx) => (
                  <Bar
                    key={col}
                    dataKey={col}
                    fill={COLORS[idx % COLORS.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Box>
        );
      
      case 'line':
        return (
          <Box sx={{ width: '100%', height: 450, overflow: 'hidden', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey={labelKey}
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={90}
                  interval={0}
                  tickFormatter={(value) => truncateLabel(value, 25)}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  width={80}
                  tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                {numericColumns.map((col, idx) => (
                  <Line
                    key={col}
                    type="monotone"
                    dataKey={col}
                    stroke={COLORS[idx % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        );
      
      case 'pie':
        return (
          <Box sx={{ width: '100%', height: 450, overflow: 'hidden', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="45%"
                  labelLine={true}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey={valueKey}
                  label={({ name, percent }) => {
                    const truncated = truncateLabel(name, 15);
                    return `${truncated}: ${(percent * 100).toFixed(0)}%`;
                  }}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value) => typeof value === 'number' ? `$${value.toLocaleString()}` : value}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '10px' }}
                  formatter={(value) => truncateLabel(value, 20)}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        );
      
      case 'area':
        return (
          <Box sx={{ width: '100%', height: 450, overflow: 'hidden', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 100 }}>
                <defs>
                  {numericColumns.map((col, idx) => (
                    <linearGradient key={col} id={`gradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.1}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey={labelKey}
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={90}
                  interval={0}
                  tickFormatter={(value) => truncateLabel(value, 25)}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  width={80}
                  tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                {numericColumns.map((col, idx) => (
                  <Area
                    key={col}
                    type="monotone"
                    dataKey={col}
                    stroke={COLORS[idx % COLORS.length]}
                    fill={`url(#gradient-${idx})`}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        );
      
      case 'scatter':
        if (numericColumns.length < 2) {
          return (
            <Alert
              severity="warning"
              sx={{
                bgcolor: darkMode ? alpha('#ff9800', 0.15) : undefined,
                color: colors.text,
                '& .MuiAlert-icon': { color: darkMode ? '#ffa726' : undefined },
              }}
            >
              Scatter plot requires at least 2 numeric columns for X and Y axes.
            </Alert>
          );
        }
        return (
          <Box sx={{ width: '100%', height: 450, overflow: 'hidden', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  dataKey={numericColumns[0]}
                  name={numericColumns[0]}
                  tick={{ fontSize: 11 }}
                  label={{ value: truncateLabel(numericColumns[0], 30), position: 'insideBottom', offset: -10, fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey={numericColumns[1]}
                  name={numericColumns[1]}
                  tick={{ fontSize: 11 }}
                  width={80}
                  label={{ value: truncateLabel(numericColumns[1], 30), angle: -90, position: 'insideLeft', fontSize: 11 }}
                  tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Scatter fill={COLORS[0]} />
              </ScatterChart>
            </ResponsiveContainer>
          </Box>
        );
      
      case 'radar':
        if (numericColumns.length < 3) {
          return (
            <Alert
              severity="warning"
              sx={{
                bgcolor: darkMode ? alpha('#ff9800', 0.15) : undefined,
                color: colors.text,
                '& .MuiAlert-icon': { color: darkMode ? '#ffa726' : undefined },
              }}
            >
              Radar chart works best with at least 3 numeric dimensions.
            </Alert>
          );
        }

        const radarData = numericColumns.map(col => ({
          metric: truncateLabel(col, 20),
          value: data.reduce((sum, item) => sum + (item[col] || 0), 0) / data.length,
          fullMark: Math.max(...data.map(item => item[col] || 0))
        }));

        return (
          <Box sx={{ width: '100%', height: 450, overflow: 'hidden', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                <PolarGrid stroke="#f0f0f0" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} tick={{ fontSize: 11 }} />
                <Radar
                  name="Average Values"
                  dataKey="value"
                  stroke={COLORS[0]}
                  fill={COLORS[0]}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <RechartsTooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </Box>
        );
      
      case 'treemap':
        const treemapData = data.map((item, index) => ({
          name: truncateLabel(item[labelKey], 20),
          size: item[valueKey] || 1,
          fill: COLORS[index % COLORS.length]
        }));

        return (
          <Box sx={{ width: '100%', height: 450, overflow: 'hidden', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData}
                dataKey="size"
                aspectRatio={4/3}
                stroke="#fff"
                strokeWidth={2}
              />
            </ResponsiveContainer>
          </Box>
        );
      
      case 'funnel':
        const funnelData = data
          .map(item => ({
            name: truncateLabel(item[labelKey], 15),
            value: item[valueKey] || 0,
            fill: COLORS[data.indexOf(item) % COLORS.length]
          }))
          .sort((a, b) => b.value - a.value);

        return (
          <Box sx={{ width: '100%', height: 450, overflow: 'hidden', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart data={funnelData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                <RechartsTooltip content={<CustomTooltip />} />
                <Funnel
                  dataKey="value"
                  nameKey="name"
                  labelLine={false}
                  label={({ name, value, percent }) =>
                    `${name}: ${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`
                  }
                />
              </FunnelChart>
            </ResponsiveContainer>
          </Box>
        );
      
      default:
        return null;
    }
    }
  };

  const renderMessage = (message) => {
    if (message.type === 'user') {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ maxWidth: '70%' }}>
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="body1">{message.content}</Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.8 }}>
                {message.timestamp.toLocaleTimeString()}
              </Typography>
            </Paper>
            <Avatar sx={{ bgcolor: darkMode ? alpha(colors.text, 0.2) : 'grey.500' }}>
              <PersonIcon sx={{ color: colors.text }} />
            </Avatar>
          </Stack>
        </Box>
      );
    }

    // Assistant message
    return (
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <ForumIcon sx={{ fontSize: 36, color: '#00357a', mt: 1 }} />
          <Box sx={{ flex: 1, maxWidth: 'calc(100% - 52px)' }}>
            {/* Main message - Enhanced Summary */}
            <Card
              elevation={2}
              sx={{
                mb: 2,
                borderLeft: '4px solid',
                borderLeftColor: colors.primary,
                background: darkMode
                  ? `linear-gradient(to right, ${alpha(colors.primary, 0.08)}, ${colors.paper})`
                  : 'linear-gradient(to right, rgba(25, 118, 210, 0.03), rgba(255, 255, 255, 1))',
                border: `1px solid ${colors.border}`,
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      component="div"
                      sx={{
                        lineHeight: 1.7,
                        color: colors.text,
                      }}
                    >
                      {(() => {
                        // Split content into main text and numbered list items
                        const parts = message.content.split(/(\d+\.\s+)/);
                        const elements = [];
                        let currentText = '';

                        for (let i = 0; i < parts.length; i++) {
                          const part = parts[i];

                          // Check if this is a number followed by period (like "1. ")
                          if (/^\d+\.\s+$/.test(part)) {
                            // Add accumulated text before the list
                            if (currentText.trim()) {
                              elements.push(
                                <Typography key={`text-${i}`} variant="body2" component="div" sx={{ mb: 1.5 }}>
                                  {currentText.trim()}
                                </Typography>
                              );
                              currentText = '';
                            }

                            // Get the next part which is the list item content
                            const nextPart = parts[i + 1] || '';
                            const listItemText = nextPart.trim();

                            elements.push(
                              <Box key={`list-${i}`} component="div" sx={{ ml: 2, mb: 0.5, display: 'flex', alignItems: 'flex-start' }}>
                                <Typography variant="body2" component="span" sx={{ mr: 1, fontWeight: 600, color: colors.primary }}>
                                  •
                                </Typography>
                                <Typography variant="body2" component="span" sx={{ flex: 1, color: colors.text }}>
                                  {listItemText}
                                </Typography>
                              </Box>
                            );

                            i++; // Skip the next part as we've already used it
                          } else if (!/^\d+\.\s+$/.test(parts[i - 1] || '')) {
                            // Only accumulate if the previous part wasn't a number
                            currentText += part;
                          }
                        }

                        // Add any remaining text
                        if (currentText.trim()) {
                          elements.push(
                            <Typography key="text-final" variant="body2" component="div">
                              {currentText.trim()}
                            </Typography>
                          );
                        }

                        return elements;
                      })()}
                    </Typography>
                    {message.error && (
                      <Alert
                        severity="error"
                        sx={{
                          mt: 2,
                          bgcolor: darkMode ? alpha('#f44336', 0.15) : undefined,
                          color: colors.text,
                          '& .MuiAlert-icon': { color: darkMode ? '#ef5350' : undefined },
                        }}
                      >
                        {message.error}
                      </Alert>
                    )}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 1.5, fontStyle: 'italic' }}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* SQL Query Display - Collapsible with Edit Mode */}
            {message.sql && (
              <Accordion sx={{ mb: 2, bgcolor: darkMode ? colors.cardBg : 'grey.100', border: `1px solid ${colors.border}` }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="sql-content"
                  id="sql-header"
                  sx={{
                    '& .MuiAccordionSummary-content': {
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CodeIcon fontSize="small" color="action" />
                    <Typography variant="subtitle2">
                      {editMode[message.id] ? 'Edit SQL Query' : 'View Generated SQL'}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mr: 2 }} onClick={(e) => e.stopPropagation()}>
                    <ToggleButton
                      value="edit"
                      selected={editMode[message.id] || false}
                      onChange={() => {
                        setEditMode(prev => ({ ...prev, [message.id]: !prev[message.id] }));
                        if (!editedSql[message.id]) {
                          setEditedSql(prev => ({ ...prev, [message.id]: message.sql }));
                        }
                      }}
                      size="small"
                      sx={{ height: 28 }}
                    >
                      <EditIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {editMode[message.id] ? 'View' : 'Edit'}
                    </ToggleButton>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ bgcolor: editMode[message.id] ? colors.paper : (darkMode ? '#0d1117' : 'grey.900'), p: 2 }}>
                  {editMode[message.id] ? (
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={1}>
                          <ToggleButtonGroup
                            value={sqlTheme}
                            exclusive
                            onChange={(e, v) => v && setSqlTheme(v)}
                            size="small"
                            sx={{
                              '& .MuiToggleButton-root': {
                                color: colors.text,
                                borderColor: colors.border,
                                '&.Mui-selected': {
                                  bgcolor: alpha(colors.primary, 0.15),
                                  color: colors.primary,
                                },
                              },
                            }}
                          >
                            <ToggleButton value="github">Light</ToggleButton>
                            <ToggleButton value="monokai">Dark</ToggleButton>
                          </ToggleButtonGroup>
                          <IconButton 
                            size="small" 
                            onClick={() => copyToClipboard(editedSql[message.id] || message.sql)}
                          >
                            <CopyIcon />
                          </IconButton>
                        </Stack>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PlayArrowIcon />}
                          onClick={() => handleRunModifiedSql(message.id, editedSql[message.id] || message.sql)}
                          disabled={loading}
                        >
                          Run Modified SQL
                        </Button>
                      </Stack>
                      <AceEditor
                        mode="sql"
                        theme={sqlTheme}
                        value={editedSql[message.id] || message.sql}
                        onChange={(value) => setEditedSql(prev => ({ ...prev, [message.id]: value }))}
                        name={`sql-editor-${message.id}`}
                        editorProps={{ $blockScrolling: true }}
                        width="100%"
                        height="200px"
                        fontSize={14}
                        showPrintMargin={false}
                        showGutter={true}
                        highlightActiveLine={true}
                        setOptions={{
                          enableBasicAutocompletion: true,
                          enableLiveAutocompletion: true,
                          enableSnippets: true,
                          showLineNumbers: true,
                          tabSize: 2,
                        }}
                      />
                    </Box>
                  ) : (
                    <>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="caption" color="white">SQL Query</Typography>
                        <IconButton size="small" onClick={() => copyToClipboard(message.sql)}>
                          <CopyIcon sx={{ color: 'white', fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                      <Box sx={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.875rem',
                        color: 'white',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}>
                        {message.sql}
                      </Box>
                    </>
                  )}
                </AccordionDetails>
              </Accordion>
            )}

            {/* Results Table */}
            {message.results && message.results.length > 0 && (
              <Paper elevation={1} sx={{ p: 2, bgcolor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="h6" sx={{ color: colors.text }}>
                    Results ({message.results.length} rows)
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => downloadCSV(message.results)}
                      sx={{ color: colors.primary, borderColor: colors.border }}
                    >
                      Export CSV
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<InsightsIcon />}
                      onClick={() => handleAnalyzeResults(message)}
                    >
                      View Detailed Results
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="secondary"
                      startIcon={<AutoGraphIcon />}
                      onClick={() => {
                        const messageIndex = messages.findIndex(m => m.id === message.id);
                        let userQuestion = 'Query results';
                        // Look backwards from the current message to find the user's question
                        for (let i = messageIndex - 1; i >= 0; i--) {
                          if (messages[i].type === 'user') {
                            userQuestion = messages[i].content;
                            break;
                          }
                        }
                        setAnalyticsModalData({
                          query: userQuestion,
                          results: {
                            rows: message.results,
                            metadata: message.metadata,
                            sql: message.sql,
                          },
                        });
                        setShowAnalyticsModal(true);
                      }}
                    >
                      Analytics Workbench
                    </Button>
                    
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ResearchIcon />}
                      onClick={() => {
                        const userMessage = messages[messages.findIndex(m => m.id === message.id) - 1];
                        const researchQuestion = userMessage?.content 
                          ? `Based on this query result: "${userMessage.content}", provide a deeper analysis of the trends, patterns, and business implications.`
                          : 'Analyze the trends and patterns in this data';
                        
                        setDeepResearchQuestion(researchQuestion);
                        setShowDeepResearch(true);
                      }}
                    >
                      Deep Research
                    </Button>
                  </Stack>
                </Stack>
                
                {/* Visualization Toggle */}
                {(() => {
                  const chartData = prepareChartData(message.results);
                  console.log('Visualization toggle check:', {
                    messageId: message.id,
                    hasResults: !!message.results,
                    resultsLength: message.results?.length,
                    chartData: chartData,
                    hasNumericData: chartData?.hasNumericData
                  });
                  return chartData?.hasNumericData;
                })() && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                    <ToggleButtonGroup
                      value={visualizationType[message.id] || 'table'}
                      exclusive
                      onChange={(e, v) => v && setVisualizationType(prev => ({ ...prev, [message.id]: v }))}
                      size="small"
                      sx={{
                        '& .MuiToggleButton-root': {
                          color: colors.text,
                          borderColor: colors.border,
                          '&.Mui-selected': {
                            bgcolor: alpha(colors.primary, 0.15),
                            color: colors.primary,
                          },
                        },
                      }}
                    >
                      <ToggleButton value="table">
                        <MuiTooltip title="Table View"><TableChartIcon /></MuiTooltip>
                      </ToggleButton>
                      <ToggleButton value="bar">
                        <MuiTooltip title="Bar Chart"><BarChartIcon /></MuiTooltip>
                      </ToggleButton>
                      <ToggleButton value="line">
                        <MuiTooltip title="Line Chart"><TimelineIcon /></MuiTooltip>
                      </ToggleButton>
                      <ToggleButton value="pie">
                        <MuiTooltip title="Pie Chart"><PieChartIcon /></MuiTooltip>
                      </ToggleButton>
                      <ToggleButton value="area">
                        <MuiTooltip title="Area Chart"><AnalyticsIcon /></MuiTooltip>
                      </ToggleButton>
                      <ToggleButton value="scatter">
                        <MuiTooltip title="Scatter Plot"><ScatterPlotIcon /></MuiTooltip>
                      </ToggleButton>
                      <ToggleButton value="radar">
                        <MuiTooltip title="Radar Chart"><RadarIcon /></MuiTooltip>
                      </ToggleButton>
                      <ToggleButton value="treemap">
                        <MuiTooltip title="Treemap"><ViewModuleIcon /></MuiTooltip>
                      </ToggleButton>
                      <ToggleButton value="funnel">
                        <MuiTooltip title="Funnel Chart"><FilterListIcon /></MuiTooltip>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                )}
                
                <Box sx={{ height: 400, width: '100%' }}>
                  {visualizationType[message.id] && visualizationType[message.id] !== 'table' ? (
                    renderVisualization(message.id, message.results)
                  ) : (
                    (() => {
                      try {
                        // Safety check - ensure we have data before creating columns
                        if (!message.results || message.results.length === 0 || !message.results[0]) {
                          return (
                            <Typography variant="body2" sx={{ p: 2 }}>
                              No data to display
                            </Typography>
                          );
                        }

                      const safeRows = message.results.map((row, index) => ({ id: index, ...row }));
                      const safeColumns = Object.keys(message.results[0]).map((key, index) => {
                        // Find a sample value to determine type (check multiple rows if needed)
                        let sampleValue = message.results[0][key];
                        for (let i = 0; i < Math.min(5, message.results.length) && (sampleValue === null || sampleValue === undefined); i++) {
                          sampleValue = message.results[i][key];
                        }

                        // Check if this looks like an ID column (should NOT be formatted as numeric)
                        const lowerKey = key.toLowerCase();
                        const isIdColumn = lowerKey === 'customer' ||
                                          lowerKey.includes('customer_id') ||
                                          lowerKey.includes('customerid') ||
                                          lowerKey.includes('_id') ||
                                          lowerKey.endsWith('id') ||
                                          lowerKey.includes('number') ||
                                          lowerKey.includes('_no') ||
                                          lowerKey.includes('_code') ||
                                          lowerKey === 'sku' ||
                                          lowerKey === 'material' ||
                                          lowerKey.includes('sold_to') ||
                                          lowerKey.includes('bill_to') ||
                                          lowerKey.includes('ship_to') ||
                                          lowerKey.includes('payer') ||
                                          lowerKey.includes('order') ||
                                          lowerKey.includes('document') ||
                                          lowerKey.includes('invoice') ||
                                          lowerKey.includes('delivery') ||
                                          lowerKey.includes('shipment') ||
                                          lowerKey.includes('billing') ||
                                          lowerKey === 'po' ||
                                          /^(ebeln|ebelp|vbeln|posnr|kunnr|lifnr|matnr|bukrs|belnr|gjahr|buzei|banfn|bnfpo|mblnr|kostl|prctr|saknr|werks|ekorg|mandt|zeile|kdauf|vgbel|vgpos)$/i.test(lowerKey);

                        // Check if numeric - could be number type or a numeric string from BigQuery
                        // But exclude ID columns even if they contain only digits
                        const isNumeric = !isIdColumn && (
                                         typeof sampleValue === 'number' ||
                                         (typeof sampleValue === 'string' && !isNaN(parseFloat(sampleValue)) && isFinite(sampleValue)));

                        // Check if this is a quantity/count column (should NOT be formatted as currency)
                        const isQuantity = key.toLowerCase().includes('quantity') ||
                                         key.toLowerCase().includes('qty') ||
                                         key.toLowerCase().includes('count') ||
                                         key.toLowerCase().includes('units');

                        // Check if this is a currency amount column (exclude quantities)
                        // Keywords that indicate currency columns
                        const currencyKeywords = [
                          'amount', 'total', 'revenue', 'cost', 'cogs', 'sales', 'margin',
                          'profit', 'price', 'value', 'fee', 'discount', 'freight', 'allowance',
                          'variance', 'budget', 'spend', 'payment', 'clv', 'monetary',
                          'gm', 'gross', 'net', 'earnings', 'income', 'expense', 'balance',
                          'credit', 'debit', 'tax', 'surcharge', 'commission', 'rebate'
                        ];

                        const hasCurrencyKeyword = currencyKeywords.some(kw => lowerKey.includes(kw));

                        // Also detect currency by looking at the data: large numbers with decimals
                        // Sample multiple values to check if they look like currency
                        let looksLikeCurrency = false;
                        if (isNumeric && !hasCurrencyKeyword) {
                          const sampleValues = message.results.slice(0, 10).map(r => r[key]).filter(v => v != null);
                          const numericSamples = sampleValues.map(v => typeof v === 'number' ? v : parseFloat(v)).filter(n => !isNaN(n));
                          if (numericSamples.length > 0) {
                            // Check if values are large (> 100) and have decimal places - likely currency
                            const hasLargeValues = numericSamples.some(n => Math.abs(n) > 100);
                            const hasDecimals = numericSamples.some(n => n % 1 !== 0);
                            // Avoid treating percentages (0-100 range) or IDs as currency
                            const notPercentage = numericSamples.some(n => Math.abs(n) > 100 || n < 0);
                            looksLikeCurrency = hasLargeValues && hasDecimals && notPercentage;
                          }
                        }

                        const isAmount = !isQuantity && (hasCurrencyKeyword || looksLikeCurrency);
                        const isFirstColumn = index === 0;

                        // Detect date columns
                        const isDate = lowerKey.includes('date') || lowerKey.includes('created') || lowerKey.includes('updated') || lowerKey.includes('posted') || lowerKey.includes('time');

                        // Detect year columns
                        const isYear = lowerKey.includes('year') || lowerKey === 'fy' || lowerKey === 'gjahr';

                        // Detect status/boolean columns
                        const isStatus = lowerKey.includes('status') || lowerKey.includes('block') || lowerKey.includes('flag') || lowerKey.includes('state') || lowerKey.includes('active') || lowerKey.includes('type');

                        // Alignment rules:
                        // - IDs, names, text → left
                        // - Amounts, quantities, other numbers → right
                        // - Dates, years, statuses → center
                        const getAlignment = () => {
                          if (isYear) return 'center';
                          if (isDate) return 'center';
                          if (isStatus && !isNumeric) return 'center';
                          if (isIdColumn || isFirstColumn) return 'left';
                          if (isNumeric) return 'right';
                          return 'left';
                        };
                        const colAlign = getAlignment();

                        // Determine the appropriate icon for this column
                        const getColumnIcon = () => {
                          // Customer/Account related
                          if (lowerKey.includes('customer') || lowerKey.includes('sold_to') || lowerKey.includes('bill_to') || lowerKey.includes('payer')) {
                            return <AccountIcon sx={{ fontSize: 16, color: darkMode ? '#4d9eff' : '#00357a' }} />;
                          }
                          // Ship to / Location
                          if (lowerKey.includes('ship_to') || lowerKey.includes('location') || lowerKey.includes('address') || lowerKey.includes('city') || lowerKey.includes('region')) {
                            return <LocationIcon sx={{ fontSize: 16, color: '#059669' }} />;
                          }
                          // Order/Document IDs
                          if (lowerKey.includes('order') || lowerKey.includes('document') || lowerKey.includes('invoice') || lowerKey.includes('po_')) {
                            return <ReceiptIcon sx={{ fontSize: 16, color: '#f59e0b' }} />;
                          }
                          // Material/Product/SKU
                          if (lowerKey.includes('material') || lowerKey.includes('product') || lowerKey.includes('sku') || lowerKey.includes('item')) {
                            return <InventoryIcon sx={{ fontSize: 16, color: '#8b5cf6' }} />;
                          }
                          // Category/Type
                          if (lowerKey.includes('category') || lowerKey.includes('type') || lowerKey.includes('group') || lowerKey.includes('class')) {
                            return <CategoryIcon sx={{ fontSize: 16, color: '#ec4899' }} />;
                          }
                          // Date columns
                          if (lowerKey.includes('date') || lowerKey.includes('time') || lowerKey.includes('created') || lowerKey.includes('updated')) {
                            return <CalendarIcon sx={{ fontSize: 16, color: '#06b6d4' }} />;
                          }
                          // Currency/Amount columns
                          if (isAmount) {
                            return <MoneyIcon sx={{ fontSize: 16, color: '#10b981' }} />;
                          }
                          // Quantity columns
                          if (isQuantity) {
                            return <NumbersIcon sx={{ fontSize: 16, color: '#6366f1' }} />;
                          }
                          // Percentage columns
                          if (lowerKey.includes('percent') || lowerKey.includes('rate') || lowerKey.includes('ratio')) {
                            return <PercentIcon sx={{ fontSize: 16, color: '#f97316' }} />;
                          }
                          // Name columns
                          if (lowerKey.includes('name') && !lowerKey.includes('customer')) {
                            return <DescriptionIcon sx={{ fontSize: 16, color: '#64748b' }} />;
                          }
                          // Company/Business
                          if (lowerKey.includes('company') || lowerKey.includes('business') || lowerKey.includes('org')) {
                            return <BusinessIcon sx={{ fontSize: 16, color: '#0891b2' }} />;
                          }
                          // Store/Channel
                          if (lowerKey.includes('store') || lowerKey.includes('channel') || lowerKey.includes('plant')) {
                            return <StoreIcon sx={{ fontSize: 16, color: '#a855f7' }} />;
                          }
                          // ID columns (generic)
                          if (isIdColumn) {
                            return <TagIcon sx={{ fontSize: 16, color: darkMode ? '#4d9eff' : '#00357a' }} />;
                          }
                          // Numeric columns (generic)
                          if (isNumeric) {
                            return <NumbersIcon sx={{ fontSize: 16, color: '#64748b' }} />;
                          }
                          // Default - no icon
                          return null;
                        };

                        const columnIcon = getColumnIcon();
                        const headerLabel = key
                          .split('_')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                          .join(' ');

                        return {
                          field: key,
                          headerName: headerLabel,
                          flex: 1,
                          minWidth: isDate ? 120 : (isYear ? 90 : (isStatus ? 110 : 150)),
                          type: isNumeric ? 'number' : 'string',
                          align: colAlign,
                          headerAlign: colAlign,
                          renderHeader: () => (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, justifyContent: colAlign === 'center' ? 'center' : colAlign === 'right' ? 'flex-end' : 'flex-start', width: '100%' }}>
                              {columnIcon}
                              <span style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                                {headerLabel}
                              </span>
                            </Box>
                          ),
                          renderCell: (params) => {
                            try {
                              // Handle null/undefined values
                              if (params.value === null || params.value === undefined) {
                                return <span style={{ color: darkMode ? '#6b7280' : '#9ca3af', fontStyle: 'italic' }}>—</span>;
                              }

                              // Convert to number if it's a numeric string
                              const numValue = typeof params.value === 'number' ? params.value : parseFloat(params.value);
                              const isValidNumber = !isNaN(numValue) && isFinite(numValue);

                              // Style year columns — centered, no commas
                              if (isYear && isValidNumber) {
                                return (
                                  <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem', color: darkMode ? '#e6edf3' : '#1e293b' }}>
                                    {String(Math.round(numValue))}
                                  </span>
                                );
                              }

                              // Style date columns — centered, muted
                              if (isDate) {
                                return (
                                  <span style={{ fontSize: '0.8rem', color: darkMode ? '#8b949e' : '#64748b' }}>
                                    {String(params.value)}
                                  </span>
                                );
                              }

                              // Style status columns — centered chip-like
                              if (isStatus && !isNumeric) {
                                const val = String(params.value);
                                const isBlocked = val.toLowerCase().includes('block');
                                return (
                                  <span style={{
                                    fontSize: '0.75rem', fontWeight: 600,
                                    color: isBlocked ? '#dc2626' : (darkMode ? '#8b949e' : '#64748b'),
                                  }}>
                                    {val}
                                  </span>
                                );
                              }

                              // Style ID columns with primary color and monospace font
                              if (isIdColumn) {
                                return (
                                  <span style={{
                                    fontWeight: 600,
                                    color: darkMode ? '#4d9eff' : '#00357a',
                                    fontFamily: 'monospace',
                                    fontSize: '0.8rem'
                                  }}>
                                    {String(params.value)}
                                  </span>
                                );
                              }

                              // Style currency amounts with color coding for positive/negative
                              if (isNumeric && isAmount && isValidNumber) {
                                const formattedValue = `$${Math.abs(numValue).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}`;
                                // Color code: green for positive, red for negative, neutral for zero
                                let amountColor = darkMode ? '#e6edf3' : '#1e293b';
                                if (numValue > 0) amountColor = '#059669';
                                if (numValue < 0) amountColor = '#dc2626';
                                return (
                                  <span style={{
                                    fontWeight: 600,
                                    color: amountColor,
                                    fontFamily: 'monospace'
                                  }}>
                                    {numValue < 0 ? '-' : ''}{formattedValue}
                                  </span>
                                );
                              }

                              // Style other numeric values
                              if (isNumeric && isValidNumber) {
                                // Don't add comma separators for year-like values (1900-2099)
                                const isYearLike = Number.isInteger(numValue) && numValue >= 1900 && numValue <= 2099;
                                return (
                                  <span style={{ fontFamily: 'monospace' }}>
                                    {isYearLike ? String(numValue) : numValue.toLocaleString('en-US')}
                                  </span>
                                );
                              }

                              return String(params.value);
                            } catch (err) {
                              console.error('Error rendering cell:', err);
                              return String(params.value || '');
                            }
                          }
                        };
                      });

                      return (
                        <DataGrid
                          rows={safeRows}
                          columns={safeColumns}
                          initialState={{
                            pagination: {
                              paginationModel: { pageSize: 10, page: 0 },
                            },
                          }}
                          pageSizeOptions={[10, 25, 50]}
                          density="compact"
                          disableRowSelectionOnClick
                          slots={{ toolbar: GridToolbar }}
                          slotProps={{
                            toolbar: {
                              showQuickFilter: true,
                              quickFilterProps: { debounceMs: 500 },
                            },
                          }}
                          sx={{
                            bgcolor: colors.cardBg,
                            border: 'none',
                            borderRadius: 2,
                            color: colors.text,
                            '& .MuiDataGrid-main': {
                              bgcolor: colors.cardBg,
                            },
                            '& .MuiDataGrid-toolbarContainer': {
                              p: 1.5,
                              gap: 1,
                              borderBottom: `1px solid ${colors.border}`,
                              bgcolor: darkMode ? '#21262d' : '#f8fafc',
                              '& .MuiButton-root': {
                                color: colors.primary,
                                fontSize: '0.75rem',
                              },
                              '& .MuiInputBase-root': {
                                bgcolor: darkMode ? '#0d1117' : '#ffffff',
                                borderRadius: 1,
                                fontSize: '0.8rem',
                              },
                            },
                            '& .MuiDataGrid-cell': {
                              fontSize: '0.8rem',
                              color: colors.text,
                              borderColor: colors.border,
                              borderRight: `1px solid ${darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                              py: 1,
                              '&:last-child': { borderRight: 'none' },
                              '&:first-of-type': {
                                borderRight: `2px solid ${darkMode ? 'rgba(77,158,255,0.15)' : 'rgba(0,53,122,0.12)'}`,
                              },
                            },
                            '& .MuiDataGrid-columnHeaders': {
                              bgcolor: darkMode ? '#21262d' : '#f8fafc',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              color: colors.text,
                              borderBottom: `2px solid ${darkMode ? '#4d9eff' : '#00357a'}`,
                            },
                            '& .MuiDataGrid-columnHeader': {
                              bgcolor: darkMode ? '#21262d' : '#f8fafc',
                              color: colors.text,
                              borderRight: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                              '&:last-child': { borderRight: 'none' },
                              '&:first-of-type': {
                                borderRight: `2px solid ${darkMode ? 'rgba(77,158,255,0.15)' : 'rgba(0,53,122,0.12)'}`,
                              },
                            },
                            '& .MuiDataGrid-columnHeaderTitle': {
                              color: colors.text,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            },
                            '& .MuiDataGrid-row': {
                              bgcolor: colors.cardBg,
                              '&:hover': {
                                bgcolor: darkMode ? 'rgba(77, 158, 255, 0.08)' : 'rgba(0, 53, 122, 0.04)',
                              },
                              '&:nth-of-type(even)': {
                                bgcolor: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                              },
                            },
                            '& .MuiDataGrid-footerContainer': {
                              bgcolor: darkMode ? '#21262d' : '#f8fafc',
                              borderColor: colors.border,
                              borderTop: `1px solid ${colors.border}`,
                              color: colors.text,
                            },
                            '& .MuiTablePagination-root': {
                              color: colors.text,
                            },
                            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                              color: colors.textSecondary,
                              fontSize: '0.75rem',
                            },
                            '& .MuiIconButton-root': {
                              color: colors.textSecondary,
                            },
                            '& .MuiDataGrid-virtualScroller': {
                              bgcolor: colors.cardBg,
                            },
                            '& .MuiDataGrid-cell:focus': { outline: 'none' },
                            '& .MuiDataGrid-row:focus': { outline: 'none' },
                          }}
                        />
                      );
                    } catch (err) {
                      console.error('Error rendering DataGrid:', err);
                      return (
                        <Alert
                          severity="error"
                          sx={{
                            m: 2,
                            bgcolor: darkMode ? alpha('#f44336', 0.15) : undefined,
                            color: colors.text,
                            '& .MuiAlert-icon': { color: darkMode ? '#ef5350' : undefined },
                          }}
                        >
                          Error displaying results: {err.message}
                        </Alert>
                      );
                    }
                  })()
                  )}
                </Box>

                {/* Metadata and Actions - Compact */}
                <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center' }}>
                  {message.metadata && (message.metadata.cost || message.metadata.bytesProcessed) && (
                    <>
                      {message.metadata.cost && (
                        <Chip
                          size="small"
                          label={`Cost: $${message.metadata.cost.toFixed(6)}`}
                          variant="outlined"
                          sx={{ height: 24, fontSize: '0.75rem' }}
                        />
                      )}
                      {message.metadata.bytesProcessed && (
                        <Chip
                          size="small"
                          label={`${(message.metadata.bytesProcessed / 1024 / 1024).toFixed(1)} MB`}
                          variant="outlined"
                          sx={{ height: 24, fontSize: '0.75rem' }}
                        />
                      )}
                    </>
                  )}
                  {message.results && message.results.length > 0 && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<InsightsIcon />}
                      onClick={() => handleViewDetailedResults(message)}
                      sx={{ 
                        height: 24, 
                        fontSize: '0.75rem',
                        textTransform: 'none',
                        ml: 'auto'
                      }}
                    >
                      View detailed results
                    </Button>
                  )}
                </Stack>
              </Paper>
            )}


            {/* No results message */}
            {message.results && message.results.length === 0 && message.sql && (
              <Paper elevation={1} sx={{ p: 2, bgcolor: darkMode ? alpha('#ff9800', 0.15) : 'warning.light', border: `1px solid ${colors.border}` }}>
                <Typography variant="body2">
                  The query executed successfully but returned no results.
                </Typography>
              </Paper>
            )}
          </Box>
        </Stack>
      </Box>
    );
  };

  // Memoized filtered and grouped conversations
  const groupedConversations = useMemo(() => {
    // Filter conversations based on debounced search query
    const filtered = conversations.filter(conv => {
      if (!debouncedSearchQuery) return true;
      const query = debouncedSearchQuery.toLowerCase();
      return (
        conv.title.toLowerCase().includes(query) ||
        (conv.messages && conv.messages.some(msg => msg.content.toLowerCase().includes(query)))
      );
    });

    // Group the filtered conversations
    return groupConversations(filtered);
  }, [conversations, debouncedSearchQuery]);

  const renderHistoryPanel = () => (
    <Box
      sx={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: historyOpen ? 320 : 48,
        height: '100%',
        transition: 'width 0.2s ease-in-out',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0,
          overflow: 'hidden',
        }}
    >
      {/* Toggle Button */}
      <Box
        sx={{
          p: 1,
          borderBottom: 1,
          borderColor: colors.border,
          display: 'flex',
          alignItems: 'center',
          justifyContent: historyOpen ? 'space-between' : 'center',
          cursor: 'pointer',
          bgcolor: colors.cardBg,
          '&:hover': {
            bgcolor: darkMode ? alpha(colors.primary, 0.1) : 'grey.200',
          },
        }}
        onClick={() => setHistoryOpen(!historyOpen)}
      >
        {historyOpen ? (
          <>
            <Stack direction="row" spacing={1} alignItems="center">
              <HistoryIcon sx={{ color: colors.textSecondary }} />
              <Typography variant="subtitle2" fontWeight="bold" sx={{ color: colors.text }}>
                Conversation History
              </Typography>
            </Stack>
            <IconButton size="small">
              <ChevronRightIcon />
            </IconButton>
          </>
        ) : (
          <IconButton size="small">
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      {/* History Content */}
      {historyOpen && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Search Bar */}
          <Box sx={{ p: 2, pb: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: darkMode ? colors.paper : undefined,
                  color: colors.text,
                  '& fieldset': { borderColor: colors.border },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: colors.textSecondary,
                  opacity: 1,
                },
              }}
            />
          </Box>
          
          {/* Conversations List */}
          <Box 
            data-conversations-list="true"
            sx={{ 
              flex: 1, 
              overflow: 'auto', 
              p: 2, 
              pt: 1,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                borderRadius: '3px',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                },
              },
            }}>
          {loadingConversations ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : conversations.length === 0 ? (
            <Typography variant="body2" sx={{ color: colors.textSecondary }} align="center">
              No conversations yet
            </Typography>
          ) : (
            <Stack spacing={2}>
              {Object.entries(groupedConversations).map(([groupName, groupConvs]) => {
                if (groupConvs.length === 0) return null;

                return (
                  <Box key={groupName}>
                    {/* Date Group Header */}
                    <Typography
                      variant="caption"
                      sx={{
                        px: 1,
                        py: 0.5,
                        fontWeight: 600,
                        color: colors.textSecondary,
                        display: 'block'
                      }}
                    >
                      {groupName}
                    </Typography>

                    {/* Conversations in this group */}
                    <Stack spacing={1} sx={{ mt: 0.5 }}>
                      {groupConvs.map((conv) => {
                        const isActive = (conv.conversation_id || conv.conversationId) === conversationId;
                        const messageCount = conv.metadata?.message_count || 0;
                        const displayTitle = conv.title || 'New Conversation';

                        // Get first user message as preview
                        const firstUserMsg = conv.messages?.find(m => m.type === 'user');
                        const preview = firstUserMsg?.content?.substring(0, 60) || '';

                        return (
                          <Paper
                            key={conv.conversation_id || conv.conversationId}
                            elevation={0}
                            sx={{
                              p: 1.5,
                              bgcolor: isActive ? alpha(colors.primary, 0.15) : colors.cardBg,
                              cursor: 'pointer',
                              border: isActive ? '2px solid' : '1px solid',
                              borderColor: isActive ? colors.primary : colors.border,
                              borderRadius: 1.5,
                              transition: 'all 0.15s ease-in-out',
                              overflow: 'hidden',
                              '&:hover': {
                                bgcolor: isActive ? alpha(colors.primary, 0.2) : (darkMode ? alpha(colors.primary, 0.05) : 'grey.100'),
                                borderColor: isActive ? colors.primary : alpha(colors.primary, 0.3),
                              },
                            }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ overflow: 'hidden' }}>
                              <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }} onClick={() => loadConversation(conv.conversation_id || conv.conversationId)}>
                                <Stack spacing={0.5}>
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight={isActive ? 600 : 500}
                                    sx={{
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      color: isActive ? colors.primary : colors.text,
                                    }}
                                  >
                                    {displayTitle}
                                  </Typography>

                                  {preview && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.7rem',
                                        fontStyle: 'italic',
                                        color: colors.textSecondary,
                                        display: 'block',
                                      }}
                                    >
                                      {preview}{preview.length >= 60 ? '...' : ''}
                                    </Typography>
                                  )}

                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: colors.textSecondary }}>
                                      {new Date(conv.updated_at || conv.updatedAt).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </Typography>
                                    {messageCount > 0 && (
                                      <Chip
                                        size="small"
                                        label={`${messageCount}`}
                                        sx={{
                                          height: 16,
                                          fontSize: '0.65rem',
                                          minWidth: 20,
                                          bgcolor: alpha(colors.primary, 0.15),
                                          color: colors.primary,
                                        }}
                                      />
                                    )}
                                  </Stack>
                                </Stack>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Delete this conversation?')) {
                                    handleDeleteConversation(conv.conversation_id || conv.conversationId);
                                  }
                                }}
                                sx={{
                                  opacity: 0.4,
                                  flexShrink: 0,
                                  '&:hover': {
                                    opacity: 1,
                                    color: 'error.main'
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
          </Box>
          
          {/* Clear All Button at bottom */}
          {conversations.length > 0 && (
            <Box sx={{ p: 2, pt: 1, borderTop: 1, borderColor: colors.border }}>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                  <Chip
                    icon={<HistoryIcon sx={{ color: colors.textSecondary }} />}
                    label={`${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: colors.border,
                      color: colors.text,
                    }}
                  />
                </Box>
                <Button
                  fullWidth
                  size="small"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={handleClearAllConversations}
                  sx={{
                    color: colors.textSecondary,
                    borderColor: colors.border,
                    '&:hover': {
                      borderColor: colors.primary,
                      bgcolor: alpha(colors.primary, 0.05),
                      color: colors.text,
                    },
                  }}
                  variant="outlined"
                >
                  Clear All
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      )}
      </Paper>
    </Box>
  );

  return (
    <Box sx={{
      height: '100%',
      minHeight: 0,
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
      bgcolor: colors.background,
    }}>
      {/* Main Content Area */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        mr: historyOpen ? '320px' : '48px',
        transition: 'margin-right 0.2s ease-in-out',
      }}>
        {/* Header */}
        <Paper elevation={1} sx={{ p: 1.5, borderRadius: 0, position: 'relative', zIndex: 10, flexShrink: 0, bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Left section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ForumIcon sx={{ fontSize: 40, color: '#00357a' }} />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
                    AXIS.AI
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {mode === 'chat'
                    ? 'Ask questions about your data in natural language'
                    : 'Conduct comprehensive data analysis with AI-powered research'}
                </Typography>
              </Box>
            </Box>
            
            {/* Right section */}
            <Box>
              <Stack direction="row" spacing={2} alignItems="center">
                {/* Mode Toggle */}
                <ToggleButtonGroup
                  value={mode}
                  exclusive
                  onChange={(e, newMode) => {
                    console.log('Mode changing from', mode, 'to', newMode);
                    if (newMode !== null) {
                      setMode(newMode);
                    }
                  }}
                  size="small"
                  sx={{
                    '& .MuiToggleButton-root': {
                      textTransform: 'none',
                      px: 2,
                      color: colors.text,
                      borderColor: colors.border,
                      '&.Mui-selected': {
                        bgcolor: alpha(colors.primary, 0.15),
                        color: colors.primary,
                      },
                    }
                  }}
                >
                  <ToggleButton value="chat">
                    <ChatIcon sx={{ mr: 1, fontSize: 18 }} />
                    Chat
                  </ToggleButton>
                  <ToggleButton value="research">
                    <ResearchIcon sx={{ mr: 1, fontSize: 18 }} />
                    Research
                  </ToggleButton>
                </ToggleButtonGroup>

                <Divider orientation="vertical" flexItem sx={{ borderColor: colors.border }} />
                
                {mode === 'chat' && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleNewChat}
                    size="small"
                    sx={{ 
                      borderRadius: 1,
                      textTransform: 'none',
                      px: 2,
                      py: 0.75,
                    }}
                  >
                    New Chat
                  </Button>
                )}
              </Stack>
            </Box>
          </Box>
        </Paper>

        {/* Conditional Content Based on Mode */}
        {console.log('Current mode:', mode)}
        {mode === 'chat' ? (
          <>
            {/* Sub-tabs for Chat Mode */}
            <Paper sx={{ mx: 2, mt: 1, bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
              <Tabs
                value={viewMode}
                onChange={(e, v) => setViewMode(v)}
                sx={{
                  borderBottom: 1,
                  borderColor: colors.border,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    minHeight: 48,
                    color: colors.textSecondary,
                    '&.Mui-selected': {
                      color: colors.primary,
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: colors.primary,
                  },
                }}
              >
                <Tab
                  value="chat"
                  label="Chat"
                  icon={<ChatIcon sx={{ fontSize: 18 }} />}
                  iconPosition="start"
                />
                <Tab
                  value="history"
                  label="Execution History"
                  icon={<HistoryIcon sx={{ fontSize: 18 }} />}
                  iconPosition="start"
                />
              </Tabs>
            </Paper>

            {/* Chat View */}
            {viewMode === 'chat' ? (
              <>
                {/* Sample Queries Panel */}
                {showSampleQueries && messages.length === 0 && (
              <Accordion
            defaultExpanded
            sx={{
              flexShrink: 0,
              mx: 2,
              mt: 1,
              mb: 1,
              bgcolor: colors.paper,
              border: `1px solid ${colors.border}`,
              '& .MuiAccordionSummary-root': {
                minHeight: 40,
                bgcolor: darkMode ? colors.cardBg : undefined,
                '& .MuiAccordionSummary-content': {
                  margin: '8px 0',
                }
              },
              '& .MuiAccordionDetails-root': {
                pt: 1,
                pb: 2,
                bgcolor: colors.paper,
              }
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: colors.text }} />}>
              <Typography variant="h6" sx={{ fontSize: '1rem', color: colors.text }}>
                Sample Queries - Click to try
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {SAMPLE_QUERIES.map((section) => (
                  <Grid item xs={12} sm={6} md={3} key={section.category}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: colors.textSecondary }}>
                        {section.category}
                      </Typography>
                      <Stack spacing={1}>
                        {section.queries.map((query, idx) => (
                          <Chip
                            key={idx}
                            label={query}
                            size="small"
                            onClick={() => setInputMessage(query)}
                            sx={{
                              cursor: 'pointer',
                              justifyContent: 'flex-start',
                              height: 'auto',
                              bgcolor: colors.cardBg,
                              color: colors.text,
                              border: `1px solid ${colors.border}`,
                              '& .MuiChip-label': {
                                whiteSpace: 'normal',
                                padding: '8px 12px',
                              },
                              '&:hover': {
                                bgcolor: alpha(colors.primary, 0.15),
                                color: colors.primary,
                                borderColor: colors.primary,
                              }
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Messages Area - With Scroll */}
        <Box
          data-messages-container="true"
          sx={{
            flexGrow: 1,
            minHeight: 0, // Important for proper flex behavior
            overflow: 'auto', // Changed from 'hidden' to 'auto' to enable scrolling
            px: 2,
            pt: 2,
            pb: 1, // Reduced bottom padding
            bgcolor: colors.background,
            display: 'flex',
            flexDirection: 'column',
            // Custom scrollbar styling
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              },
            },
          }}>
          <Box sx={{ width: '100%', pt: 2 }}>
            {/* Empty state message - only show if truly empty (no welcome message) */}
            {messages.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4, opacity: 0.6 }}>
                <Typography variant="h6" color="text.secondary">
                  Start a conversation by typing below or selecting a sample query
                </Typography>
              </Box>
            )}
            
            {/* Messages - Show all messages now that we have scroll */}
            {messages.map(message => (
              <div key={message.id} id={`message-${message.id}`}>
                {renderMessage(message)}
              </div>
            ))}
            
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <ForumIcon sx={{ fontSize: 36, color: '#00357a' }} />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ color: colors.primary }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary, ml: 2 }}>
                    Processing your query...
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ flexShrink: 0, borderColor: colors.border }} />

        {/* Input Area - Fixed */}
        <Paper elevation={3} sx={{ px: 2, py: 1.5, borderRadius: 0, flexShrink: 0, bgcolor: colors.paper, border: `1px solid ${colors.border}` }}>
          <Box sx={{ width: '100%' }}>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about your data..."
                disabled={loading}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: darkMode ? colors.paper : undefined,
                    color: colors.text,
                    '& fieldset': { borderColor: colors.border },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: colors.textSecondary,
                    opacity: 1,
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || loading}
                sx={{ 
                  borderRadius: 2, 
                  px: 3,
                  minWidth: 100
                }}
                endIcon={<SendIcon />}
              >
                Send
              </Button>
            </Stack>
          </Box>
        </Paper>
              </>
            ) : (
              /* History View */
              <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
                <QueryLogger />
              </Box>
            )}
          </>
        ) : (
          /* Research Mode */
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            p: 3
          }}>
            <Box sx={{ textAlign: 'center', maxWidth: 600 }}>
              <ResearchIcon sx={{ fontSize: 64, color: colors.primary, mb: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 1 }}>
                <Typography variant="h4" sx={{ color: colors.text }}>
                  Deep Research
                </Typography>
                <Chip
                  label="BETA"
                  size="small"
                  sx={{
                    bgcolor: darkMode ? alpha('#ff9800', 0.2) : 'warning.light',
                    color: darkMode ? '#ffa726' : 'warning.dark',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    height: 22
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: darkMode ? '#ffa726' : 'warning.main', display: 'block', mb: 2, fontStyle: 'italic' }}>
                Undergoing Pilot - Your feedback helps us improve
              </Typography>
              <Typography variant="body1" sx={{ color: colors.textSecondary }} paragraph>
                Ask complex financial questions that require comprehensive analysis.
                Our AI agents will collaborate to provide detailed insights with data validation,
                trend analysis, and actionable recommendations.
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ResearchIcon />}
                onClick={() => {
                  setShowDeepResearch(true);
                  setDeepResearchQuestion('');
                }}
              >
                Start New Research
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<HistoryIcon />}
                onClick={() => {
                  // TODO: Show research history
                  console.log('Show research history');
                }}
              >
                View Research History
              </Button>
            </Stack>
            
            <Box sx={{ mt: 4, maxWidth: 800 }}>
              <Typography variant="h6" gutterBottom sx={{ color: colors.text }}>
                Example Research Questions:
              </Typography>
              <Grid container spacing={2}>
                {[
                  "Analyze our Q3 revenue variance and identify the key drivers behind performance changes",
                  "Compare our operating margins across different product lines and recommend optimization strategies",
                  "Investigate the relationship between marketing spend and customer acquisition cost trends",
                  "Evaluate the financial impact of our supply chain initiatives on COGS and profitability"
                ].map((question, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        bgcolor: colors.paper,
                        border: `1px solid ${colors.border}`,
                        '&:hover': {
                          bgcolor: darkMode ? alpha(colors.primary, 0.1) : 'action.hover',
                          borderColor: colors.primary,
                        }
                      }}
                      onClick={() => {
                        setDeepResearchQuestion(question);
                        setShowDeepResearch(true);
                      }}
                    >
                      <Typography variant="body2" sx={{ color: colors.text }}>
                        {question}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        )}
      </Box>
      
      {/* History Panel - Fixed Sidebar (only in chat mode and when not viewing history) */}
      {mode === 'chat' && viewMode === 'chat' && renderHistoryPanel()}
      
      {/* Result Analysis Dialog */}
      <Dialog
        open={openAnalysisDialog}
        onClose={() => setOpenAnalysisDialog(false)}
        maxWidth="lg"
        fullWidth
        fullScreen={false}
        PaperProps={{
          sx: { 
            minHeight: { xs: '100vh', sm: '80vh' },
            maxHeight: { xs: '100vh', sm: '90vh' },
          }
        }}
      >
        <DialogTitle sx={{
          borderBottom: 1,
          borderColor: colors.border,
          pb: 2,
          bgcolor: colors.paper,
          color: colors.text,
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <InsightsIcon color="primary" />
              <Typography variant="h5" fontWeight="bold">
                AI Analysis Results
              </Typography>
            </Stack>
            <IconButton 
              onClick={() => setOpenAnalysisDialog(false)}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: colors.background }}>
          {activeAnalysis || analysisLoading ? (
            <ResultAnalysis
              analysis={activeAnalysis}
              loading={analysisLoading}
              onFollowUpClick={handleFollowUpQuestion}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Mantrax Detailed Results Dialog */}
      <Dialog
        open={showDetailedResults}
        onClose={() => setShowDetailedResults(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { 
            minHeight: '80vh',
            maxHeight: '90vh',
          }
        }}
      >
        <DialogContent sx={{ p: 0, bgcolor: colors.background }}>
          {showDetailedResults && detailedResultsData && (
            <MantraxResultsView
              query={detailedResultsData.query}
              sql={detailedResultsData.sql}
              results={detailedResultsData.results}
              metadata={detailedResultsData.metadata}
              onClose={() => setShowDetailedResults(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Enhanced Analytics Modal */}
      <EnhancedAnalyticsModal
        open={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        initialQuery={analyticsModalData?.query || ''}
        initialData={analyticsModalData?.results || null}
        mode={analyticsModalMode}
        conversationId={conversationId}
        onQueryExecute={(newResults) => {
          // Optional: Update the chat with new results if needed
          console.log('New results from analytics modal:', newResults);
        }}
      />

      {/* Deep Research Interface */}
      <DeepResearchInterface
        open={showDeepResearch}
        onClose={() => setShowDeepResearch(false)}
        initialQuestion={deepResearchQuestion}
        onResults={(results) => {
          console.log('Deep research results:', results);
          // Optionally add results to chat
          if (results.executive_summary) {
            const researchMessage = {
              id: Date.now(),
              type: 'assistant',
              content: `Deep Research Complete: ${results.executive_summary}`,
              metadata: {
                type: 'deep_research_result',
                research_id: results.research_id,
                confidence_level: results.confidence_level,
                data_quality: results.data_quality
              },
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, researchMessage]);
          }
        }}
      />
    </Box>
  );
};

export default SimpleChatInterface;