import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  ButtonGroup,
  Button,
  Chip,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Stack,
  Alert,
  Divider,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
  Fullscreen as FullscreenIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  TableChart as TableIcon,
  Storage as StorageIcon,
  Cable as CableIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';

const SchemaGraphView = ({ schemas }) => {
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Create a simplified graph view using cards
  const renderSchemaCard = (schema, schemaIdx) => {
    return (
      <Grid item xs={12} md={6} lg={4} key={schemaIdx}>
        <Card 
          sx={{ 
            height: '100%',
            border: '2px solid',
            borderColor: 'primary.main',
            position: 'relative',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <StorageIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" component="div">
                {schema.database}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {schema.source}
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Tables ({schema.tables.length})
            </Typography>
            
            <Stack spacing={1}>
              {schema.tables.slice(0, 5).map((table, idx) => (
                <Paper
                  key={idx}
                  variant="outlined"
                  sx={{ 
                    p: 1.5,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                    bgcolor: selectedNode?.name === table.name ? 'action.selected' : 'background.paper',
                  }}
                  onClick={() => setSelectedNode({...table, schema: schema.database})}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TableIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{table.name}</Typography>
                    </Box>
                    {table.relationships > 0 && (
                      <Chip 
                        size="small" 
                        icon={<CableIcon />} 
                        label={table.relationships} 
                      />
                    )}
                  </Box>
                </Paper>
              ))}
              {schema.tables.length > 5 && (
                <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
                  +{schema.tables.length - 5} more tables
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const filteredSchemas = schemas?.filter(schema => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return schema.database.toLowerCase().includes(searchLower) ||
           schema.source.toLowerCase().includes(searchLower) ||
           schema.tables.some(table => 
             table.name.toLowerCase().includes(searchLower) ||
             table.description?.toLowerCase().includes(searchLower)
           );
  });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Controls */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        gap: 2 
      }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search schemas and tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>View Mode</InputLabel>
            <Select
              value={filterType}
              label="View Mode"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="all">All Objects</MenuItem>
              <MenuItem value="schemas">Schemas Only</MenuItem>
              <MenuItem value="relationships">Relationships</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh Layout">
            <IconButton size="small" color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Export Diagram">
            <IconButton size="small">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Fullscreen">
            <IconButton size="small">
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 2 }}>
        Click on any table to view its details and relationships. Use the search box to find specific schemas or tables.
      </Alert>

      {/* Graph Container */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {filterType === 'relationships' ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Table Relationships View
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 4, 
                minHeight: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default'
              }}
            >
              <Stack spacing={3} alignItems="center">
                <Typography color="text.secondary">
                  Interactive relationship diagram would be displayed here
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  This view requires D3.js library which can be installed with: npm install d3
                </Typography>
              </Stack>
            </Paper>
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ p: 2 }}>
            {filteredSchemas?.map((schema, idx) => renderSchemaCard(schema, idx))}
          </Grid>
        )}
      </Box>

      {/* Selected Node Details */}
      {selectedNode && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            p: 3,
            maxWidth: 400,
            zIndex: 1000,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
            <Typography variant="h6">
              {selectedNode.name}
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => setSelectedNode(null)}
              sx={{ ml: 2 }}
            >
              ×
            </IconButton>
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Schema: {selectedNode.schema}
          </Typography>
          
          {selectedNode.description && (
            <Typography variant="body2" paragraph>
              {selectedNode.description}
            </Typography>
          )}
          
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={`${selectedNode.columns} columns`} />
            <Chip size="small" label={`${selectedNode.rowCount?.toLocaleString()} rows`} />
            {selectedNode.relationships > 0 && (
              <Chip 
                size="small" 
                icon={<CableIcon />} 
                label={`${selectedNode.relationships} relationships`}
                color="primary"
                variant="outlined"
              />
            )}
          </Stack>
          
          <Button 
            variant="contained" 
            size="small" 
            fullWidth 
            sx={{ mt: 2 }}
            startIcon={<ArrowIcon />}
          >
            Explore Table
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default SchemaGraphView;