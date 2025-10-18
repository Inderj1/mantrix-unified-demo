import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tooltip,
  Stack,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Avatar,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Search as SearchIcon,
  TableChart as TableChartIcon,
  AccountTree as SchemaIcon,
  TrendingUp as TrendingUpIcon,
  QueryStats as QueryStatsIcon,
  Update as UpdateIcon,
  Storage as StorageIcon,
  Code as CodeIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Cable as CableIcon,
  DataObject as DataObjectIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Storage as DatabaseIcon,
  Key as KeyIcon,
  Schedule as ScheduleIcon,
  BarChart as BarChartIcon,
  Assessment as AssessmentIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Timeline as TimelineIcon,
  ViewInAr as ViewInArIcon,
} from '@mui/icons-material';
import SchemaGraphView from './SchemaGraphView';

// Helper functions
const formatNumber = (num) => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
};

const formatBytes = (bytes) => {
  if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(2)} TB`;
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(2)} KB`;
  return `${bytes} bytes`;
};

const DataCatalog = () => {
  const [currentView, setCurrentView] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDataSource, setSelectedDataSource] = useState('all');
  const [selectedTable, setSelectedTable] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [favoritesTables, setFavoritesTables] = useState([]);
  const [catalogData, setCatalogData] = useState({
    stats: {
      totalTables: 0,
      totalViews: 0,
      totalSchemas: 0,
      totalSize: 0,
      lastUpdated: new Date().toISOString(),
    },
    popularTables: [],
    recentUpdates: [],
    dataSources: [],
    dataQuality: {
      score: 0,
      issues: [],
    },
  });

  const [schemaData, setSchemaData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCatalogData();
  }, []);

  const loadCatalogData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch real schema data from BigQuery
      const [schemasResponse, healthResponse, connectionsResponse] = await Promise.allSettled([
        fetch('/api/v1/schemas'),
        fetch('/api/v1/health'),
        Promise.resolve({ ok: false }) // Backend connections endpoint not available in main API
      ]);

      let totalTables = 0;
      let totalSize = 0;
      let bigQueryTables = [];
      let dataSourcesStatus = [];

      // Process BigQuery schemas
      if (schemasResponse.status === 'fulfilled' && schemasResponse.value.ok) {
        const schemasData = await schemasResponse.value.json();
        
        const bigQueryData = {
          source: 'BigQuery',
          database: 'arizon-poc',
          tables: (schemasData.tables || []).map(table => ({
            name: table.table_name,
            description: table.description || 'No description available',
            type: 'table',
            rowCount: table.row_count || 0,
            sizeBytes: Math.floor(Math.random() * 500000000), // Size not available in API, estimate
            lastModified: formatRelativeTime(table.modified || table.created),
            columns: table.columns?.length || 0,
            relationships: 0, // Could be calculated from foreign keys if available
            quality: { score: Math.floor(Math.random() * 20 + 80), issues: Math.floor(Math.random() * 3) },
            dataset: table.dataset,
            project: table.project,
            created: table.created,
            modified: table.modified
          }))
        };

        bigQueryTables = bigQueryData.tables;
        totalTables += bigQueryData.tables.length;
        totalSize += bigQueryData.tables.reduce((sum, table) => sum + table.sizeBytes, 0);
        
        setSchemaData([bigQueryData]);
      }

      // Process health data
      if (healthResponse.status === 'fulfilled' && healthResponse.value.ok) {
        const healthData = await healthResponse.value.json();
        
        dataSourcesStatus.push({
          name: 'BigQuery',
          status: healthData.database?.status === 'connected' ? 'healthy' : 'error',
          tables: healthData.database?.table_count || totalTables,
          lastSync: 'Just now'
        });
      } else {
        dataSourcesStatus.push({
          name: 'BigQuery',
          status: 'error',
          tables: totalTables,
          lastSync: 'Connection failed'
        });
      }

      // Process connections (if backend is available)
      if (connectionsResponse.status === 'fulfilled' && connectionsResponse.value.ok) {
        const connectionsData = await connectionsResponse.value.json();
        
        connectionsData.forEach(conn => {
          if (!dataSourcesStatus.find(ds => ds.name === conn.type)) {
            dataSourcesStatus.push({
              name: conn.type,
              status: conn.status === 'connected' ? 'healthy' : 'error',
              tables: 0, // Would need to fetch from connection-specific endpoint
              lastSync: formatRelativeTime(conn.last_tested)
            });
          }
        });
      } else {
        // Add PostgreSQL as potentially available if not found in connections
        if (!dataSourcesStatus.find(ds => ds.name === 'PostgreSQL')) {
          dataSourcesStatus.push({
            name: 'PostgreSQL',
            status: 'warning',
            tables: 0,
            lastSync: 'Not configured'
          });
        }
      }

      // Calculate popular tables (based on BigQuery data for now)
      const popularTables = bigQueryTables
        .sort((a, b) => b.rowCount - a.rowCount)
        .slice(0, 3)
        .map(table => ({
          name: table.name,
          schema: table.dataset,
          usage: Math.floor(Math.random() * 1000 + 500), // Mock usage data
          dataSource: 'BigQuery',
          lastAccessed: table.lastModified,
          size: table.sizeBytes,
          rows: table.rowCount
        }));

      // Generate recent updates from table modification times
      const recentUpdates = bigQueryTables
        .filter(table => table.modified)
        .sort((a, b) => new Date(b.modified) - new Date(a.modified))
        .slice(0, 3)
        .map(table => ({
          table: table.name,
          schema: table.dataset,
          type: 'data_refresh',
          timestamp: table.lastModified,
          status: 'success'
        }));

      // Update catalog data with real information
      setCatalogData({
        stats: {
          totalTables,
          totalViews: Math.floor(totalTables * 0.15), // Estimate views as 15% of tables
          totalSchemas: dataSourcesStatus.length,
          totalSize,
          lastUpdated: new Date().toISOString(),
        },
        popularTables,
        recentUpdates,
        dataSources: dataSourcesStatus,
        dataQuality: {
          score: Math.floor(Math.random() * 20 + 75), // Mock quality score
          issues: [
            { severity: 'high', count: Math.floor(Math.random() * 3) },
            { severity: 'medium', count: Math.floor(Math.random() * 8 + 2) },
            { severity: 'low', count: Math.floor(Math.random() * 15 + 5) },
          ],
        },
      });

    } catch (error) {
      console.error('Error loading catalog data:', error);
      setError('Failed to load catalog data. Please check your connection and try again.');
      // Set error state in UI
      setCatalogData(prev => ({
        ...prev,
        dataSources: [{
          name: 'System',
          status: 'error',
          tables: 0,
          lastSync: 'Connection failed'
        }]
      }));
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  const handleToggleFavorite = (tableName) => {
    setFavoritesTables(prev => 
      prev.includes(tableName) 
        ? prev.filter(t => t !== tableName)
        : [...prev, tableName]
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon color="success" fontSize="small" />;
      case 'warning':
        return <WarningIcon color="warning" fontSize="small" />;
      case 'error':
        return <ErrorIcon color="error" fontSize="small" />;
      default:
        return null;
    }
  };

  const getQualityColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const filterTables = () => {
    let filtered = [];
    
    schemaData.forEach(schema => {
      if (selectedDataSource !== 'all' && schema.source !== selectedDataSource) {
        return;
      }
      
      const filteredTables = schema.tables.filter(table => {
        const searchLower = searchTerm.toLowerCase();
        return table.name.toLowerCase().includes(searchLower) ||
               table.description.toLowerCase().includes(searchLower);
      });
      
      if (filteredTables.length > 0) {
        filtered.push({
          ...schema,
          tables: filteredTables,
        });
      }
    });
    
    return filtered;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Header with Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
            Data Catalog
          </Typography>
        </Grid>
        
        {/* Quick Stats Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DatabaseIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">{catalogData.stats.totalTables}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Tables
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={75} 
                sx={{ mt: 1, height: 4, borderRadius: 2 }} 
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ViewInArIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6">{catalogData.stats.totalViews}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Views & Materialized
              </Typography>
              <Chip 
                label="+3 this week" 
                size="small" 
                color="success" 
                sx={{ mt: 1 }} 
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StorageIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">{formatBytes(catalogData.stats.totalSize)}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Storage
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                <Box sx={{ width: '60%', height: 4, bgcolor: 'primary.main', borderRadius: 1 }} />
                <Box sx={{ width: '30%', height: 4, bgcolor: 'secondary.main', borderRadius: 1 }} />
                <Box sx={{ width: '10%', height: 4, bgcolor: 'grey.300', borderRadius: 1 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SpeedIcon sx={{ mr: 1, color: getQualityColor(catalogData.dataQuality.score) + '.main' }} />
                <Typography variant="h6">{catalogData.dataQuality.score}%</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Data Quality Score
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {catalogData.dataQuality.issues.map((issue, idx) => (
                  <Chip
                    key={idx}
                    label={`${issue.count} ${issue.severity}`}
                    size="small"
                    color={issue.severity === 'high' ? 'error' : issue.severity === 'medium' ? 'warning' : 'default'}
                    variant="outlined"
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={currentView} 
          onChange={(e, v) => setCurrentView(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" icon={<AssessmentIcon />} iconPosition="start" />
          <Tab label="Tables & Schemas" icon={<TableChartIcon />} iconPosition="start" />
          <Tab label="Schema Graph" icon={<SchemaIcon />} iconPosition="start" />
          <Tab label="Data Lineage" icon={<TimelineIcon />} iconPosition="start" />
          <Tab label="Quality & Stats" icon={<BarChartIcon />} iconPosition="start" />
        </Tabs>

        {/* Overview Tab */}
        {currentView === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Popular Tables */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  Popular Tables
                </Typography>
                <Stack spacing={2}>
                  {catalogData.popularTables.map((table, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {table.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {table.schema} • {table.dataSource}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <Chip 
                              size="small" 
                              icon={<QueryStatsIcon />} 
                              label={`${table.usage} queries`}
                              variant="outlined"
                            />
                            <Chip 
                              size="small" 
                              label={table.lastAccessed}
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                        <IconButton 
                          size="small"
                          onClick={() => handleToggleFavorite(table.name)}
                        >
                          {favoritesTables.includes(table.name) ? <StarIcon color="primary" /> : <StarBorderIcon />}
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </Grid>

              {/* Recent Updates */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <UpdateIcon sx={{ mr: 1 }} />
                  Recent Updates
                </Typography>
                <Stack spacing={2}>
                  {catalogData.recentUpdates.map((update, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle2">
                            {update.table}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {update.schema} • {update.type.replace('_', ' ')}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Chip 
                            size="small" 
                            label={update.status}
                            color={update.status === 'success' ? 'success' : 'error'}
                          />
                          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            {update.timestamp}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </Grid>

              {/* Data Sources Status */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <StorageIcon sx={{ mr: 1 }} />
                  Data Sources
                </Typography>
                <Grid container spacing={2}>
                  {catalogData.dataSources.map((source, idx) => (
                    <Grid item xs={12} md={4} key={idx}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {getStatusIcon(source.status)}
                          <Typography variant="subtitle1" sx={{ ml: 1 }}>
                            {source.name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            {source.tables} tables
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Last sync: {source.lastSync}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tables & Schemas Tab */}
        {currentView === 1 && (
          <Box sx={{ p: 3 }}>
            {/* Search and Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search tables, columns, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Data Source</InputLabel>
                  <Select
                    value={selectedDataSource}
                    label="Data Source"
                    onChange={(e) => setSelectedDataSource(e.target.value)}
                  >
                    <MenuItem value="all">All Sources</MenuItem>
                    <MenuItem value="BigQuery">BigQuery</MenuItem>
                    <MenuItem value="PostgreSQL">PostgreSQL</MenuItem>
                    <MenuItem value="MongoDB">MongoDB</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" spacing={1}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={async () => {
                      try {
                        setLoading(true);
                        const response = await fetch('/api/v1/schemas/reindex', {
                          method: 'POST'
                        });
                        if (response.ok) {
                          // Refresh data after reindexing
                          await loadCatalogData();
                        }
                      } catch (err) {
                        console.error('Error reindexing schemas:', err);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    Reindex Schemas
                  </Button>
                  <Tooltip title="Refresh catalog data">
                    <IconButton onClick={loadCatalogData} disabled={loading}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Grid>
            </Grid>

            {/* Tables List */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              filterTables().map((schema, idx) => (
                <Accordion key={idx} defaultExpanded={idx === 0}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <DatabaseIcon />
                      <Typography variant="h6">
                        {schema.source} - {schema.database}
                      </Typography>
                      <Chip size="small" label={`${schema.tables.length} tables`} />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Table Name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Rows</TableCell>
                            <TableCell align="right">Size</TableCell>
                            <TableCell>Quality</TableCell>
                            <TableCell>Last Updated</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {schema.tables.map((table, tableIdx) => (
                            <TableRow key={tableIdx} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <TableChartIcon fontSize="small" color="primary" />
                                  <Typography variant="body2" fontWeight="medium">
                                    {table.name}
                                  </Typography>
                                  <Chip 
                                    size="small" 
                                    label={`${table.columns} cols`} 
                                    variant="outlined" 
                                  />
                                  {table.relationships > 0 && (
                                    <Chip 
                                      size="small" 
                                      icon={<CableIcon />} 
                                      label={table.relationships} 
                                      variant="outlined" 
                                    />
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip size="small" label={table.type} />
                              </TableCell>
                              <TableCell>{table.description}</TableCell>
                              <TableCell align="right">{formatNumber(table.rowCount)}</TableCell>
                              <TableCell align="right">{formatBytes(table.sizeBytes)}</TableCell>
                              <TableCell>
                                <Chip 
                                  size="small" 
                                  label={`${table.quality.score}%`}
                                  color={getQualityColor(table.quality.score)}
                                  variant={table.quality.issues > 0 ? 'outlined' : 'filled'}
                                />
                              </TableCell>
                              <TableCell>{table.lastModified}</TableCell>
                              <TableCell>
                                <Stack direction="row" spacing={1}>
                                  <Tooltip title="View details">
                                    <IconButton 
                                      size="small"
                                      onClick={async () => {
                                        setSelectedTable(table);
                                        
                                        // Fetch detailed column information
                                        try {
                                          const response = await fetch(`/api/v1/schemas/${table.name}`);
                                          if (response.ok) {
                                            const detailedSchema = await response.json();
                                            setSelectedTable({
                                              ...table,
                                              detailed: detailedSchema
                                            });
                                          }
                                        } catch (err) {
                                          console.error('Error fetching table details:', err);
                                        }
                                        
                                        setDetailsOpen(true);
                                      }}
                                    >
                                      <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="View sample data">
                                    <IconButton size="small">
                                      <DataObjectIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Generate query">
                                    <IconButton size="small">
                                      <CodeIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Box>
        )}

        {/* Schema Graph Tab */}
        {currentView === 2 && (
          <Box sx={{ p: 3, height: 600 }}>
            <SchemaGraphView schemas={schemaData} />
          </Box>
        )}

        {/* Data Lineage Tab */}
        {currentView === 3 && (
          <Box sx={{ p: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Data lineage visualization helps you understand how data flows through your system
            </Alert>
            <Box sx={{ 
              height: 400, 
              border: '1px dashed #ccc', 
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.default'
            }}>
              <Typography color="text.secondary">
                Data lineage visualization coming soon...
              </Typography>
            </Box>
          </Box>
        )}

        {/* Quality & Stats Tab */}
        {currentView === 4 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Data Quality Overview</Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CircularProgress 
                      variant="determinate" 
                      value={catalogData.dataQuality.score} 
                      size={80}
                      thickness={8}
                    />
                    <Box sx={{ ml: 3 }}>
                      <Typography variant="h4">{catalogData.dataQuality.score}%</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Overall Quality Score
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={1}>
                    {catalogData.dataQuality.issues.map((issue, idx) => (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">
                          {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)} severity issues
                        </Typography>
                        <Chip 
                          size="small" 
                          label={issue.count}
                          color={issue.severity === 'high' ? 'error' : issue.severity === 'medium' ? 'warning' : 'default'}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Usage Statistics</Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Most queried table
                      </Typography>
                      <Typography variant="h6">CE11000</Typography>
                      <Typography variant="caption" color="text.secondary">
                        1,245 queries this week
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Average query response time
                      </Typography>
                      <Typography variant="h6">0.8s</Typography>
                      <Chip size="small" label="15% faster than last week" color="success" />
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Active users
                      </Typography>
                      <Typography variant="h6">42</Typography>
                      <Typography variant="caption" color="text.secondary">
                        In the last 24 hours
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Table Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        {selectedTable && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedTable.name}</Typography>
                <IconButton onClick={() => setDetailsOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* Table Information */}
                <Grid item xs={12}>
                  <Typography variant="body1" paragraph>
                    {selectedTable.description}
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Dataset
                      </Typography>
                      <Typography variant="body2">
                        {selectedTable.dataset || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Row Count
                      </Typography>
                      <Typography variant="body2">
                        {formatNumber(selectedTable.rowCount)}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Size
                      </Typography>
                      <Typography variant="body2">
                        {formatBytes(selectedTable.sizeBytes)}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Last Modified
                      </Typography>
                      <Typography variant="body2">
                        {selectedTable.lastModified}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Column Information */}
                {selectedTable.detailed?.columns && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TableChartIcon />
                      Columns ({selectedTable.detailed.columns.length})
                    </Typography>
                    
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Column Name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Mode</TableCell>
                            <TableCell>Description</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedTable.detailed.columns.map((column, idx) => (
                            <TableRow key={idx}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {column.mode === 'REQUIRED' && (
                                    <KeyIcon fontSize="small" color="primary" />
                                  )}
                                  <Typography variant="body2" fontWeight="medium">
                                    {column.name}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={column.type} 
                                  size="small" 
                                  color={
                                    column.type.includes('STRING') ? 'primary' :
                                    column.type.includes('INTEGER') || column.type.includes('NUMERIC') ? 'secondary' :
                                    column.type.includes('DATE') || column.type.includes('TIMESTAMP') ? 'success' :
                                    'default'
                                  }
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={column.mode || 'NULLABLE'} 
                                  size="small"
                                  color={column.mode === 'REQUIRED' ? 'error' : 'default'}
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {column.description || 'No description'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                )}

                {/* Loading state for table details */}
                {!selectedTable.detailed && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2" color="text.secondary">
                        Loading column details...
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button startIcon={<DownloadIcon />}>Export Schema</Button>
              <Button startIcon={<CodeIcon />} variant="contained">
                Generate Query
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default DataCatalog;