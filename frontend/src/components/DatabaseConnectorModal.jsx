import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  Paper,
  Grid,
  Tabs,
  Tab,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Storage as DatabaseIcon,
  TableChart as TableIcon,
  ViewColumn as ColumnIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  DataUsage as DataUsageIcon,
  Key as KeyIcon,
  Link as RelationshipIcon,
  Speed as PerformanceIcon,
  TrendingUp as TrendingUpIcon,
  QueryStats as QueryStatsIcon,
  Code as CodeIcon,
  Preview as PreviewIcon,
  CloudQueue as CloudIcon,
  Computer as LocalIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';

const DatabaseConnectorModal = ({ open, onClose, onSelectTable, mode = 'browse' }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDataSource, setSelectedDataSource] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Data states
  const [dataSources, setDataSources] = useState([]);
  const [schemas, setSchemas] = useState({});
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableDetails, setTableDetails] = useState(null);
  const [sampleData, setSampleData] = useState(null);
  const [tableStats, setTableStats] = useState({});
  
  // Load data on mount
  useEffect(() => {
    if (open) {
      loadDataCatalog();
    }
  }, [open]);
  
  const loadDataCatalog = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load schemas and tables
      const response = await apiService.getSchemas();
      if (response.data) {
        // Process response into organized structure
        const sources = [];
        const allTables = [];
        const schemaMap = {};
        
        // Mock data structure - adjust based on your actual API response
        const mockSources = [
          {
            id: 'bigquery',
            name: 'BigQuery',
            type: 'cloud',
            status: 'connected',
            icon: <CloudIcon />,
            datasets: [
              {
                name: 'analytics',
                tables: [
                  { name: 'sales_orders', description: 'Sales order transactions', rowCount: 2500000, sizeBytes: 128000000 },
                  { name: 'customers', description: 'Customer master data', rowCount: 150000, sizeBytes: 25000000 },
                  { name: 'products', description: 'Product catalog', rowCount: 8500, sizeBytes: 5000000 },
                ],
              },
              {
                name: 'financial',
                tables: [
                  { name: 'gl_accounts', description: 'General ledger accounts', rowCount: 5000, sizeBytes: 1000000 },
                  { name: 'transactions', description: 'Financial transactions', rowCount: 10000000, sizeBytes: 500000000 },
                ],
              },
            ],
          },
          {
            id: 'postgresql',
            name: 'PostgreSQL',
            type: 'local',
            status: 'connected',
            icon: <LocalIcon />,
            datasets: [
              {
                name: 'inventory',
                tables: [
                  { name: 'stock_levels', description: 'Current inventory levels', rowCount: 45000, sizeBytes: 10000000 },
                  { name: 'warehouses', description: 'Warehouse locations', rowCount: 50, sizeBytes: 50000 },
                ],
              },
            ],
          },
        ];
        
        // Process mock data
        mockSources.forEach(source => {
          sources.push(source);
          source.datasets.forEach(dataset => {
            dataset.tables.forEach(table => {
              const fullTable = {
                ...table,
                source: source.name,
                sourceId: source.id,
                dataset: dataset.name,
                fullName: `${source.name}.${dataset.name}.${table.name}`,
              };
              allTables.push(fullTable);
              
              if (!schemaMap[source.id]) {
                schemaMap[source.id] = {};
              }
              if (!schemaMap[source.id][dataset.name]) {
                schemaMap[source.id][dataset.name] = [];
              }
              schemaMap[source.id][dataset.name].push(fullTable);
            });
          });
        });
        
        setDataSources(sources);
        setSchemas(schemaMap);
        setTables(allTables);
      }
    } catch (err) {
      console.error('Failed to load data catalog:', err);
      setError('Failed to load data catalog. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const loadTableDetails = async (table) => {
    try {
      // Mock table details - replace with actual API call
      const details = {
        columns: [
          { name: 'id', type: 'INTEGER', nullable: false, isPrimary: true },
          { name: 'created_at', type: 'TIMESTAMP', nullable: false, isPrimary: false },
          { name: 'amount', type: 'DECIMAL(10,2)', nullable: true, isPrimary: false },
          { name: 'status', type: 'VARCHAR(50)', nullable: false, isPrimary: false },
          { name: 'customer_id', type: 'INTEGER', nullable: false, isPrimary: false, isForeign: true },
        ],
        indexes: [
          { name: 'idx_created_at', columns: ['created_at'], unique: false },
          { name: 'idx_customer_id', columns: ['customer_id'], unique: false },
        ],
        relationships: [
          { type: 'foreign_key', from: 'customer_id', to: 'customers.id' },
        ],
        stats: {
          lastUpdated: new Date().toISOString(),
          queryCount: 1250,
          avgQueryTime: 0.8,
          cacheHitRate: 0.92,
        },
      };
      
      setTableDetails(details);
      
      // Load sample data
      const sample = {
        rows: [
          { id: 1, created_at: '2024-01-15T10:30:00Z', amount: 150.50, status: 'completed', customer_id: 101 },
          { id: 2, created_at: '2024-01-15T11:45:00Z', amount: 225.00, status: 'pending', customer_id: 102 },
          { id: 3, created_at: '2024-01-15T14:20:00Z', amount: 89.99, status: 'completed', customer_id: 103 },
        ],
      };
      setSampleData(sample);
    } catch (err) {
      console.error('Failed to load table details:', err);
    }
  };
  
  const handleSelectTable = (table) => {
    setSelectedTable(table);
    loadTableDetails(table);
  };
  
  const handleUseTable = () => {
    if (selectedTable && onSelectTable) {
      onSelectTable(selectedTable);
      onClose();
    }
  };
  
  const handleCopyTableName = (tableName) => {
    navigator.clipboard.writeText(tableName);
  };
  
  const filteredTables = tables.filter(table => {
    const matchesSearch = searchQuery === '' || 
      table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSource = selectedDataSource === 'all' || 
      table.sourceId === selectedDataSource;
    
    return matchesSearch && matchesSource;
  });
  
  const renderDataSourcesTab = () => (
    <Box>
      <Grid container spacing={3}>
        {dataSources.map((source) => (
          <Grid item xs={12} md={6} key={source.id}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
              onClick={() => {
                setSelectedDataSource(source.id);
                setActiveTab(1);
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Box sx={{ color: source.status === 'connected' ? 'success.main' : 'error.main' }}>
                  {source.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">{source.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {source.type === 'cloud' ? 'Cloud Database' : 'Local Database'}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={source.status}
                  color={source.status === 'connected' ? 'success' : 'error'}
                  icon={source.status === 'connected' ? <CheckCircleIcon /> : <ErrorIcon />}
                />
              </Stack>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Datasets
                    </Typography>
                    <Typography variant="h6">
                      {source.datasets.length}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Total Tables
                    </Typography>
                    <Typography variant="h6">
                      {source.datasets.reduce((acc, ds) => acc + ds.tables.length, 0)}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2 }}>
                {source.datasets.map((dataset, idx) => (
                  <Chip
                    key={idx}
                    size="small"
                    label={`${dataset.name} (${dataset.tables.length})`}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
  
  const renderTablesTab = () => (
    <Box>
      {/* Search and filters */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search tables..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Data Source</InputLabel>
          <Select
            value={selectedDataSource}
            label="Data Source"
            onChange={(e) => setSelectedDataSource(e.target.value)}
          >
            <MenuItem value="all">All Sources</MenuItem>
            {dataSources.map((source) => (
              <MenuItem key={source.id} value={source.id}>
                {source.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <IconButton onClick={loadDataCatalog}>
          <RefreshIcon />
        </IconButton>
      </Stack>
      
      {/* Tables list */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <List>
          {filteredTables.map((table) => (
            <ListItem
              key={table.fullName}
              disablePadding
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                bgcolor: selectedTable?.fullName === table.fullName ? 'action.selected' : 'background.paper',
              }}
            >
              <ListItemButton onClick={() => handleSelectTable(table)}>
                <ListItemIcon>
                  <TableIcon />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle2">{table.name}</Typography>
                      <Chip size="small" label={table.source} variant="outlined" />
                      <Chip size="small" label={table.dataset} variant="outlined" />
                    </Stack>
                  }
                  secondary={
                    <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                      <Typography variant="caption">{table.description}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {table.rowCount ? `${(table.rowCount / 1000).toFixed(0)}K rows` : ''}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {table.sizeBytes ? `${(table.sizeBytes / 1024 / 1024).toFixed(1)} MB` : ''}
                      </Typography>
                    </Stack>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Copy table name">
                    <IconButton edge="end" onClick={(e) => {
                      e.stopPropagation();
                      handleCopyTableName(table.fullName);
                    }}>
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
  
  const renderDetailsTab = () => {
    if (!selectedTable) {
      return (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Select a table to view details
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>{selectedTable.name}</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {selectedTable.description}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">Source</Typography>
                <Typography variant="body2">{selectedTable.source}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">Dataset</Typography>
                <Typography variant="body2">{selectedTable.dataset}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">Row Count</Typography>
                <Typography variant="body2">
                  {selectedTable.rowCount ? selectedTable.rowCount.toLocaleString() : 'N/A'}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">Size</Typography>
                <Typography variant="body2">
                  {selectedTable.sizeBytes ? `${(selectedTable.sizeBytes / 1024 / 1024).toFixed(1)} MB` : 'N/A'}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        
        {tableDetails && (
          <>
            {/* Columns */}
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
              Columns ({tableDetails.columns.length})
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Column Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Nullable</TableCell>
                    <TableCell>Key</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableDetails.columns.map((column) => (
                    <TableRow key={column.name}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ColumnIcon fontSize="small" color="action" />
                          <Typography variant="body2">{column.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {column.type}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={column.nullable ? 'Yes' : 'No'}
                          color={column.nullable ? 'default' : 'primary'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {column.isPrimary && (
                          <Chip size="small" label="Primary" color="primary" icon={<KeyIcon />} />
                        )}
                        {column.isForeign && (
                          <Chip size="small" label="Foreign" color="secondary" icon={<RelationshipIcon />} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Sample Data */}
            {sampleData && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Sample Data
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {Object.keys(sampleData.rows[0] || {}).map((col) => (
                          <TableCell key={col}>{col}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sampleData.rows.map((row, idx) => (
                        <TableRow key={idx}>
                          {Object.values(row).map((val, cidx) => (
                            <TableCell key={cidx}>
                              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </>
        )}
      </Box>
    );
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <DatabaseIcon color="primary" />
            <Typography variant="h6">Data Catalog</Typography>
          </Stack>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <DialogContent dividers sx={{ minHeight: 500 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
          <Tab label="Data Sources" icon={<DatabaseIcon />} iconPosition="start" />
          <Tab label="Tables" icon={<TableIcon />} iconPosition="start" />
          <Tab label="Details" icon={<InfoIcon />} iconPosition="start" disabled={!selectedTable} />
        </Tabs>
        
        {activeTab === 0 && renderDataSourcesTab()}
        {activeTab === 1 && renderTablesTab()}
        {activeTab === 2 && renderDetailsTab()}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {mode === 'browse' && selectedTable && (
          <Button variant="contained" onClick={handleUseTable}>
            Use This Table
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DatabaseConnectorModal;