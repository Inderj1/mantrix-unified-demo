import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Chip,
  Alert,
  Stack,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

import ConnectorCard from './ConnectorCard';
import ConnectionDialog from './ConnectionDialog';

const DatabaseConnectors = () => {
  const [connectors, setConnectors] = useState([]);
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Database connector definitions
  const availableConnectors = [
    // Primary SQL Databases
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      type: 'sql',
      category: 'SQL Databases',
      description: 'Open source relational database system',
      logo: '🐘',
      color: '#336791',
      status: 'disconnected',
      config: {
        host: '',
        port: 5432,
        database: '',
        username: '',
        password: '',
        ssl: false,
      },
      stats: {
        tables: 0,
        lastSync: null,
        dataSize: '0 MB',
      },
    },
    {
      id: 'mysql',
      name: 'MySQL',
      type: 'sql',
      category: 'SQL Databases',
      description: 'Popular open source relational database',
      logo: '🐬',
      color: '#4479A1',
      status: 'disconnected',
      config: {
        host: '',
        port: 3306,
        database: '',
        username: '',
        password: '',
        ssl: false,
      },
      stats: {
        tables: 0,
        lastSync: null,
        dataSize: '0 MB',
      },
    },
    {
      id: 'sqlserver',
      name: 'SQL Server',
      type: 'sql',
      category: 'SQL Databases',
      description: 'Microsoft enterprise database system',
      logo: '🏢',
      color: '#CC2927',
      status: 'disconnected',
      config: {
        server: '',
        port: 1433,
        database: '',
        username: '',
        password: '',
        trustServerCertificate: true,
      },
      stats: {
        tables: 0,
        lastSync: null,
        dataSize: '0 MB',
      },
    },
    {
      id: 'oracle',
      name: 'Oracle Database',
      type: 'sql',
      category: 'SQL Databases',
      description: 'Enterprise-grade relational database',
      logo: '🔴',
      color: '#F80000',
      status: 'disconnected',
      config: {
        host: '',
        port: 1521,
        serviceName: '',
        username: '',
        password: '',
      },
      stats: {
        tables: 0,
        lastSync: null,
        dataSize: '0 MB',
      },
    },
    // Cloud Data Warehouses
    {
      id: 'bigquery',
      name: 'BigQuery',
      type: 'warehouse',
      category: 'Cloud Warehouses',
      description: 'Google Cloud serverless data warehouse',
      logo: '🔵',
      color: '#4285F4',
      status: 'connected',
      config: {
        projectId: 'mantra-ai-project',
        dataset: '1k_dataset',
        keyFile: '[Configured]',
      },
      stats: {
        tables: 12,
        lastSync: '2 hours ago',
        dataSize: '1.2 GB',
      },
    },
    {
      id: 'snowflake',
      name: 'Snowflake',
      type: 'warehouse',
      category: 'Cloud Warehouses',
      description: 'Cloud-native data warehouse platform',
      logo: '❄️',
      color: '#29B5E8',
      status: 'disconnected',
      config: {
        account: '',
        warehouse: '',
        database: '',
        schema: '',
        username: '',
        password: '',
      },
      stats: {
        tables: 0,
        lastSync: null,
        dataSize: '0 MB',
      },
    },
    {
      id: 'redshift',
      name: 'Amazon Redshift',
      type: 'warehouse',
      category: 'Cloud Warehouses',
      description: 'AWS cloud data warehouse service',
      logo: '🟠',
      color: '#FF9900',
      status: 'disconnected',
      config: {
        host: '',
        port: 5439,
        database: '',
        username: '',
        password: '',
        cluster: '',
      },
      stats: {
        tables: 0,
        lastSync: null,
        dataSize: '0 MB',
      },
    },
    // NoSQL Databases
    {
      id: 'mongodb',
      name: 'MongoDB',
      type: 'nosql',
      category: 'NoSQL Databases',
      description: 'Document-oriented NoSQL database',
      logo: '🍃',
      color: '#47A248',
      status: 'connected',
      config: {
        connectionString: 'mongodb://localhost:27017',
        database: 'nlp_to_sql',
        authSource: 'admin',
      },
      stats: {
        collections: 5,
        lastSync: '1 hour ago',
        dataSize: '245 MB',
      },
    },
    {
      id: 'redis',
      name: 'Redis',
      type: 'cache',
      category: 'Cache & Memory',
      description: 'In-memory data structure store',
      logo: '🔴',
      color: '#DC382D',
      status: 'connected',
      config: {
        host: 'localhost',
        port: 6379,
        password: '',
        database: 0,
      },
      stats: {
        keys: 1250,
        lastSync: '5 minutes ago',
        dataSize: '128 MB',
      },
    },
    // Vector Databases
    {
      id: 'weaviate',
      name: 'Weaviate',
      type: 'vector',
      category: 'Vector Databases',
      description: 'Open-source vector search engine',
      logo: '🔍',
      color: '#00C853',
      status: 'connected',
      config: {
        url: 'http://localhost:8080',
        apiKey: '[Configured]',
        className: 'Document',
      },
      stats: {
        objects: 5420,
        lastSync: '30 minutes ago',
        dataSize: '892 MB',
      },
    },
    {
      id: 'pinecone',
      name: 'Pinecone',
      type: 'vector',
      category: 'Vector Databases',
      description: 'Managed vector database service',
      logo: '🌲',
      color: '#00D4AA',
      status: 'disconnected',
      config: {
        apiKey: '',
        environment: '',
        indexName: '',
      },
      stats: {
        vectors: 0,
        lastSync: null,
        dataSize: '0 MB',
      },
    },
    {
      id: 'elasticsearch',
      name: 'Elasticsearch',
      type: 'search',
      category: 'Search Engines',
      description: 'Distributed search and analytics engine',
      logo: '🔎',
      color: '#FEC514',
      status: 'disconnected',
      config: {
        nodes: ['http://localhost:9200'],
        username: '',
        password: '',
        apiKey: '',
      },
      stats: {
        indices: 0,
        lastSync: null,
        dataSize: '0 MB',
      },
    },
  ];

  useEffect(() => {
    setConnectors(availableConnectors);
  }, []);

  const handleAddConnection = () => {
    setSelectedConnector(null);
    setConnectionDialogOpen(true);
  };

  const handleConfigureConnection = (connector) => {
    setSelectedConnector(connector);
    setConnectionDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setConnectionDialogOpen(false);
    setSelectedConnector(null);
  };

  const handleSaveConnection = (connectorData) => {
    setConnectors(prev => {
      const index = prev.findIndex(c => c.id === connectorData.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...connectorData };
        return updated;
      }
      return [...prev, connectorData];
    });
    handleCloseDialog();
  };

  const handleTestConnection = async (connectorId) => {
    setConnectors(prev => prev.map(c => 
      c.id === connectorId ? { ...c, status: 'testing' } : c
    ));

    // Simulate connection test
    setTimeout(() => {
      setConnectors(prev => prev.map(c => 
        c.id === connectorId ? { 
          ...c, 
          status: Math.random() > 0.3 ? 'connected' : 'error',
          stats: Math.random() > 0.3 ? {
            ...c.stats,
            lastSync: 'Just now',
            tables: Math.floor(Math.random() * 20) + 1,
            dataSize: `${Math.floor(Math.random() * 1000) + 100} MB`,
          } : c.stats
        } : c
      ));
    }, 2000);
  };

  const handleRefreshAll = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Refresh all connection statuses
      setConnectors(prev => prev.map(c => ({
        ...c,
        stats: {
          ...c.stats,
          lastSync: c.status === 'connected' ? 'Just now' : c.stats.lastSync,
        }
      })));
    }, 1500);
  };

  const getConnectionStats = () => {
    const connected = connectors.filter(c => c.status === 'connected').length;
    const total = connectors.length;
    return { connected, total };
  };

  const stats = getConnectionStats();

  // Group connectors by category
  const groupedConnectors = connectors.reduce((acc, connector) => {
    const category = connector.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(connector);
    return acc;
  }, {});

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Database Connectors
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage connections to all your data sources
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefreshAll}
              disabled={isLoading}
              sx={{ borderRadius: 2 }}
            >
              Refresh All
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddConnection}
              sx={{ borderRadius: 2 }}
            >
              Add Connection
            </Button>
          </Stack>
        </Box>

        {/* Status Overview */}
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Chip
              label={`${stats.connected}/${stats.total} Connected`}
              color={stats.connected === stats.total ? 'success' : 'warning'}
              variant="outlined"
            />
            <Divider orientation="vertical" flexItem />
            <Typography variant="body2" color="text.secondary">
              Total Data Sources: {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Connections: {stats.connected}
            </Typography>
          </Stack>
        </Paper>
      </Box>

      {/* Connector Categories */}
      {Object.entries(groupedConnectors).map(([category, categoryConnectors]) => (
        <Box key={category} sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {category}
          </Typography>
          <Grid container spacing={3}>
            {categoryConnectors.map((connector) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={connector.id}>
                <ConnectorCard
                  connector={connector}
                  onConfigure={() => handleConfigureConnection(connector)}
                  onTest={() => handleTestConnection(connector.id)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {/* Connection Dialog */}
      <ConnectionDialog
        open={connectionDialogOpen}
        connector={selectedConnector}
        onClose={handleCloseDialog}
        onSave={handleSaveConnection}
        availableConnectors={availableConnectors}
      />
    </Box>
  );
};

export default DatabaseConnectors;