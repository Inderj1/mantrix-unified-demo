import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon,
} from '@mui/icons-material';
import SupersetChart from './SupersetChart';
import supersetApiClient from '../../services/supersetApiClient';

const SupersetDashboard = ({
  dashboardId,
  dashboardConfig,
  title,
  editable = false,
  onEdit,
  onDelete,
  showAddChart = false,
}) => {
  const [dashboard, setDashboard] = useState(null);
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [addChartDialog, setAddChartDialog] = useState(false);
  const [newChartConfig, setNewChartConfig] = useState({
    name: '',
    vizType: 'bar',
    datasetId: '',
  });
  const [availableDatasets, setAvailableDatasets] = useState([]);

  // Load dashboard and charts
  useEffect(() => {
    if (dashboardId) {
      loadDashboard();
    } else if (dashboardConfig) {
      setDashboard(dashboardConfig);
      setCharts(dashboardConfig.charts || []);
      setLoading(false);
    }
  }, [dashboardId, dashboardConfig]);

  // Load available datasets for chart creation
  useEffect(() => {
    if (showAddChart) {
      loadDatasets();
    }
  }, [showAddChart]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get dashboard metadata
      const dashboardData = await supersetApiClient.getDashboard(dashboardId);
      setDashboard(dashboardData.result);
      
      // Extract chart IDs from dashboard JSON metadata
      const dashboardMetadata = JSON.parse(dashboardData.result.json_metadata || '{}');
      const chartIds = dashboardMetadata.chart_ids || [];
      
      // Load chart data for each chart
      const chartPromises = chartIds.map(async (chartId) => {
        try {
          const chartData = await supersetApiClient.getChart(chartId);
          return { id: chartId, ...chartData.result };
        } catch (err) {
          console.error(`Failed to load chart ${chartId}:`, err);
          return null;
        }
      });
      
      const loadedCharts = (await Promise.all(chartPromises)).filter(Boolean);
      setCharts(loadedCharts);
      
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadDatasets = async () => {
    try {
      const datasetsResponse = await supersetApiClient.getDatasets();
      setAvailableDatasets(datasetsResponse.result || []);
    } catch (err) {
      console.error('Failed to load datasets:', err);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRefresh = () => {
    if (dashboardId) {
      loadDashboard();
    }
    handleMenuClose();
  };

  const handleAddChart = async () => {
    try {
      const chartData = {
        slice_name: newChartConfig.name,
        viz_type: newChartConfig.vizType,
        datasource_id: parseInt(newChartConfig.datasetId),
        datasource_type: 'table',
        params: JSON.stringify({
          // Basic chart configuration
          adhoc_filters: [],
          color_scheme: 'supersetColors',
          row_limit: 10000,
        }),
      };
      
      const createdChart = await supersetApiClient.createChart(chartData);
      
      // Add chart to current dashboard
      setCharts(prev => [...prev, { id: createdChart.id, ...createdChart }]);
      
      // Reset form
      setNewChartConfig({ name: '', vizType: 'bar', datasetId: '' });
      setAddChartDialog(false);
      
    } catch (err) {
      console.error('Failed to create chart:', err);
      setError('Failed to create chart: ' + err.message);
    }
  };

  const handleDeleteChart = (chartId) => {
    setCharts(prev => prev.filter(chart => chart.id !== chartId));
  };

  const handleEditChart = (chart) => {
    // Open chart in edit mode (could open in new tab or modal)
    if (onEdit) {
      onEdit(chart);
    }
  };

  const renderChart = (chart, index) => {
    const isWide = chart.viz_type === 'table' || chart.viz_type === 'pivot_table';
    
    return (
      <Grid 
        item 
        xs={12} 
        md={viewMode === 'grid' ? (isWide ? 12 : 6) : 12} 
        lg={viewMode === 'grid' ? (isWide ? 12 : 4) : 12}
        key={chart.id || index}
      >
        <SupersetChart
          chartId={chart.id}
          chartConfig={chart}
          title={chart.slice_name}
          height={viewMode === 'grid' ? 400 : 300}
          showControls={editable}
          onEdit={handleEditChart}
          onDelete={() => handleDeleteChart(chart.id)}
        />
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error && !dashboard) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
        <Button onClick={handleRefresh} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Dashboard Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {title || dashboard?.dashboard_title || 'Dashboard'}
            </Typography>
            
            {dashboard?.description && (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {dashboard.description}
              </Typography>
            )}
            
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip 
                label={`${charts.length} Charts`} 
                color="primary" 
                variant="outlined" 
                size="small" 
              />
              {dashboard?.owners && (
                <Chip 
                  label={`Owner: ${dashboard.owners[0]?.username || 'Unknown'}`}
                  variant="outlined" 
                  size="small" 
                />
              )}
              {dashboard?.changed_on && (
                <Chip 
                  label={`Updated: ${new Date(dashboard.changed_on).toLocaleDateString()}`}
                  variant="outlined" 
                  size="small" 
                />
              )}
            </Stack>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* View Mode Toggle */}
            <IconButton 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              color={viewMode === 'grid' ? 'primary' : 'default'}
            >
              {viewMode === 'grid' ? <GridViewIcon /> : <ListViewIcon />}
            </IconButton>
            
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
            
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
            
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              {onEdit && (
                <MenuItem onClick={() => { onEdit(dashboard); handleMenuClose(); }}>
                  <EditIcon sx={{ mr: 1 }} /> Edit Dashboard
                </MenuItem>
              )}
              <MenuItem onClick={() => { /* Share logic */ handleMenuClose(); }}>
                <ShareIcon sx={{ mr: 1 }} /> Share Dashboard
              </MenuItem>
              {onDelete && (
                <MenuItem onClick={() => { onDelete(dashboardId || dashboard); handleMenuClose(); }}>
                  <DeleteIcon sx={{ mr: 1 }} /> Delete Dashboard
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Charts Grid */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {charts.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No charts in this dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {showAddChart ? 'Click the + button to add your first chart' : 'Charts will appear here once added'}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {charts.map(renderChart)}
          </Grid>
        )}
      </Box>

      {/* Add Chart FAB */}
      {showAddChart && (
        <Fab
          color="primary"
          aria-label="add chart"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          onClick={() => setAddChartDialog(true)}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Add Chart Dialog */}
      <Dialog 
        open={addChartDialog} 
        onClose={() => setAddChartDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Chart</DialogTitle>
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
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Chart Type</InputLabel>
            <Select
              value={newChartConfig.vizType}
              label="Chart Type"
              onChange={(e) => setNewChartConfig(prev => ({ ...prev, vizType: e.target.value }))}
            >
              <MenuItem value="bar">Bar Chart</MenuItem>
              <MenuItem value="line">Line Chart</MenuItem>
              <MenuItem value="pie">Pie Chart</MenuItem>
              <MenuItem value="table">Table</MenuItem>
              <MenuItem value="big_number">Big Number</MenuItem>
              <MenuItem value="area">Area Chart</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel>Dataset</InputLabel>
            <Select
              value={newChartConfig.datasetId}
              label="Dataset"
              onChange={(e) => setNewChartConfig(prev => ({ ...prev, datasetId: e.target.value }))}
            >
              {availableDatasets.map(dataset => (
                <MenuItem key={dataset.id} value={dataset.id}>
                  {dataset.table_name} ({dataset.database.database_name})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddChartDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddChart} 
            variant="contained"
            disabled={!newChartConfig.name || !newChartConfig.datasetId}
          >
            Create Chart
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupersetDashboard;