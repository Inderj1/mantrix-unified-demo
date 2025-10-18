import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Tabs,
  Tab,
  IconButton,
  Button,
  Alert,
  Stack,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Code as CodeIcon,
  Storage as DataIcon,
  Add as AddIcon,
  PlayArrow as ExecuteIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  Dashboard as DashboardIcon,
  TableChart as TableIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as LineChartIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import SupersetChart from './superset/SupersetChart';
import { apiService } from '../services/api';
import supersetApiClient from '../services/supersetApiClient';

const WorkbenchInterface = () => {
  // Panel states
  const [rightPanelTab, setRightPanelTab] = useState(0); // 0: Charts, 1: Dashboards
  const [bottomPanelExpanded] = useState(true);
  
  // Data states
  const [availableDatasets, setAvailableDatasets] = useState([]);
  const [charts, setCharts] = useState([]);
  const [dashboards, setDashboards] = useState([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [queryResults, setQueryResults] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Dialog states
  const [createChartDialog, setCreateChartDialog] = useState(false);
  const [createDashboardDialog, setCreateDashboardDialog] = useState(false);
  const [newChartConfig, setNewChartConfig] = useState({
    name: '',
    type: 'bar',
    datasetId: '',
    sql: '',
  });
  const [newDashboardConfig, setNewDashboardConfig] = useState({
    title: '',
    description: '',
  });

  // Load initial data
  useEffect(() => {
    loadSuperset();
  }, []);

  const loadSuperset = async () => {
    try {
      // Always login fresh to ensure we have a valid token
      await supersetApiClient.login('admin', 'admin');
      console.log('Superset login successful');
      
      // Load datasets
      const datasetsResponse = await supersetApiClient.getDatasets();
      setAvailableDatasets(datasetsResponse.result || []);
      console.log('Loaded datasets:', datasetsResponse.result?.length);
      
      // Load existing charts
      const chartsResponse = await supersetApiClient.getCharts();
      setCharts(chartsResponse.result || []);
      console.log('Loaded charts:', chartsResponse.result?.length);
      
      // Load existing dashboards
      const dashboardsResponse = await supersetApiClient.getDashboards();
      setDashboards(dashboardsResponse.result || []);
      console.log('Loaded dashboards:', dashboardsResponse.result?.length);
    } catch (error) {
      console.error('Failed to load Superset data:', error);
    }
  };

  // Removed document analysis functionality

  // Execute query
  const handleExecuteQuery = async () => {
    if (!currentQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await apiService.executeQuery(currentQuery, {
        format: 'json',
        includeMetadata: true,
      });
      
      setQueryResults(response.data);
    } catch (error) {
      console.error('Failed to execute query:', error);
      setQueryResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Create chart from query results
  const handleCreateChart = async () => {
    if (!queryResults || queryResults.error) return;
    
    try {
      // Always login fresh to ensure we have a valid token
      await supersetApiClient.login('admin', 'admin');
      
      // First create a dataset from the SQL query
      const databases = await supersetApiClient.getDatabases();
      const defaultDbId = databases.result?.[0]?.id;
      
      if (!defaultDbId) {
        throw new Error('No database connection available');
      }
      
      const dataset = await supersetApiClient.createDatasetFromQuery(
        currentQuery,
        defaultDbId,
        newChartConfig.name + '_dataset',
        'Dataset created from Workbench query'
      );
      
      // Create chart from dataset
      const chartData = {
        slice_name: newChartConfig.name,
        viz_type: newChartConfig.type,
        datasource_id: dataset.id,
        datasource_type: 'table',
        params: JSON.stringify({
          adhoc_filters: [],
          color_scheme: 'supersetColors',
          row_limit: 10000,
        }),
      };
      
      const chart = await supersetApiClient.createChart(chartData);
      setCharts(prev => [...prev, chart]);
      
      // Reset form
      setNewChartConfig({ name: '', type: 'bar', datasetId: '', sql: '' });
      setCreateChartDialog(false);
      
    } catch (error) {
      console.error('Failed to create chart:', error);
    }
  };

  // Create dashboard
  const handleCreateDashboard = async () => {
    try {
      // Always login fresh to ensure we have a valid token
      await supersetApiClient.login('admin', 'admin');
      
      const dashboardData = {
        dashboard_title: newDashboardConfig.title,
        description: newDashboardConfig.description,
        json_metadata: JSON.stringify({
          chart_ids: [],
          color_scheme: 'supersetColors',
        }),
      };
      
      const dashboard = await supersetApiClient.createDashboard(dashboardData);
      setDashboards(prev => [...prev, dashboard]);
      
      // Reset form
      setNewDashboardConfig({ title: '', description: '' });
      setCreateDashboardDialog(false);
      
    } catch (error) {
      console.error('Failed to create dashboard:', error);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Analytics Workbench
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Self-service analytics with advanced visualization capabilities
        </Typography>
      </Paper>

      {/* Main Content - Three Panel Layout */}
      <Box sx={{ flex: 1, display: 'flex', gap: 2, overflow: 'hidden' }}>
        

        {/* Right Panel - Charts & Dashboards */}
        <Paper sx={{ width: '350px', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
            <Tabs 
              value={rightPanelTab} 
              onChange={(e, v) => setRightPanelTab(v)}
            >
              <Tab label="Charts" icon={<BarChartIcon />} />
              <Tab label="Dashboards" icon={<DashboardIcon />} />
            </Tabs>
            
            <Box>
              <IconButton 
                size="small" 
                onClick={() => rightPanelTab === 0 ? setCreateChartDialog(true) : setCreateDashboardDialog(true)}
              >
                <AddIcon />
              </IconButton>
              <IconButton size="small" onClick={loadSuperset}>
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>
          
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {rightPanelTab === 0 && (
              <Stack spacing={2}>
                {charts.map(chart => (
                  <SupersetChart
                    key={chart.id}
                    chartId={chart.id}
                    title={chart.slice_name}
                    height={200}
                    showControls={false}
                  />
                ))}
                {charts.length === 0 && (
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    No charts created yet. Create your first chart using the query results.
                  </Typography>
                )}
              </Stack>
            )}
            
            {rightPanelTab === 1 && (
              <Stack spacing={2}>
                {dashboards.map(dashboard => (
                  <Paper 
                    key={dashboard.id} 
                    sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <Typography variant="subtitle2">{dashboard.dashboard_title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dashboard.description || 'No description'}
                    </Typography>
                  </Paper>
                ))}
                {dashboards.length === 0 && (
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    No dashboards created yet. Create your first dashboard to organize your charts.
                  </Typography>
                )}
              </Stack>
            )}
          </Box>
        </Paper>

        {/* Center Panel - Query Interface */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Query Editor */}
          <Paper sx={{ mb: 2, display: 'flex', flexDirection: 'column', height: bottomPanelExpanded ? '40%' : '200px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pb: 1 }}>
              <Typography variant="h6">
                SQL Query Editor
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<ExecuteIcon />}
                  onClick={handleExecuteQuery}
                  disabled={loading || !currentQuery.trim()}
                >
                  Execute
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<BarChartIcon />}
                  onClick={() => setCreateChartDialog(true)}
                  disabled={!queryResults || queryResults.error}
                >
                  Create Chart
                </Button>
              </Stack>
            </Box>
            
            <Box sx={{ flex: 1, p: 2, pt: 0 }}>
              <TextField
                fullWidth
                multiline
                rows={bottomPanelExpanded ? 8 : 4}
                value={currentQuery}
                onChange={(e) => setCurrentQuery(e.target.value)}
                placeholder="Enter your SQL query here or select a dataset/document to get started..."
                variant="outlined"
                sx={{ 
                  '& .MuiInputBase-root': { 
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                  }
                }}
              />
            </Box>
          </Paper>

          {/* Query Results */}
          <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Query Results</Typography>
            </Box>
            
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              )}
              
              {queryResults && queryResults.error && (
                <Alert severity="error">
                  {queryResults.error}
                </Alert>
              )}
              
              {queryResults && !queryResults.error && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {queryResults.rows?.length || 0} rows returned
                  </Typography>
                  {/* Render results table here */}
                  <pre style={{ fontSize: '0.8rem', overflow: 'auto' }}>
                    {JSON.stringify(queryResults, null, 2)}
                  </pre>
                </Box>
              )}
              
              {!queryResults && !loading && (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
                  Execute a query to see results here
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Create Chart Dialog */}
      <Dialog open={createChartDialog} onClose={() => setCreateChartDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Chart</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Chart Name"
            fullWidth
            variant="outlined"
            value={newChartConfig.name}
            onChange={(e) => setNewChartConfig(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth>
            <InputLabel>Chart Type</InputLabel>
            <Select
              value={newChartConfig.type}
              label="Chart Type"
              onChange={(e) => setNewChartConfig(prev => ({ ...prev, type: e.target.value }))}
            >
              <MenuItem value="bar">Bar Chart</MenuItem>
              <MenuItem value="line">Line Chart</MenuItem>
              <MenuItem value="pie">Pie Chart</MenuItem>
              <MenuItem value="table">Table</MenuItem>
              <MenuItem value="big_number">Big Number</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateChartDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateChart} 
            variant="contained"
            disabled={!newChartConfig.name}
          >
            Create Chart
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Dashboard Dialog */}
      <Dialog open={createDashboardDialog} onClose={() => setCreateDashboardDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Dashboard</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Dashboard Title"
            fullWidth
            variant="outlined"
            value={newDashboardConfig.title}
            onChange={(e) => setNewDashboardConfig(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newDashboardConfig.description}
            onChange={(e) => setNewDashboardConfig(prev => ({ ...prev, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDashboardDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateDashboard} 
            variant="contained"
            disabled={!newDashboardConfig.title}
          >
            Create Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkbenchInterface;