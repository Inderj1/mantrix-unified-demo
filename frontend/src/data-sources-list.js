// Comprehensive list of SQL-compatible data sources
export const SQL_DATA_SOURCES = {
  // Cloud Data Warehouses
  cloudDataWarehouses: [
    {
      name: 'Google BigQuery',
      category: 'Cloud Data Warehouse',
      sqlDialect: 'Standard SQL',
      icon: '🔷',
      connectionType: 'REST API / JDBC',
      features: ['Serverless', 'Petabyte-scale', 'ML integration'],
      supported: true
    },
    {
      name: 'Snowflake',
      category: 'Cloud Data Warehouse',
      sqlDialect: 'ANSI SQL',
      icon: '❄️',
      connectionType: 'JDBC / ODBC',
      features: ['Multi-cloud', 'Time travel', 'Zero-copy cloning'],
      supported: true
    },
    {
      name: 'Amazon Redshift',
      category: 'Cloud Data Warehouse',
      sqlDialect: 'PostgreSQL-based',
      icon: '🔴',
      connectionType: 'JDBC / ODBC',
      features: ['Columnar storage', 'Massively parallel', 'AWS integration'],
      supported: true
    },
    {
      name: 'Azure Synapse Analytics',
      category: 'Cloud Data Warehouse',
      sqlDialect: 'T-SQL',
      icon: '🔵',
      connectionType: 'JDBC / ODBC',
      features: ['Unified analytics', 'Serverless', 'Azure integration'],
      supported: true
    },
    {
      name: 'Databricks SQL',
      category: 'Cloud Data Warehouse',
      sqlDialect: 'ANSI SQL',
      icon: '🧱',
      connectionType: 'JDBC / REST API',
      features: ['Lakehouse', 'ML integration', 'Delta Lake'],
      supported: true
    }
  ],

  // Traditional Relational Databases
  relationalDatabases: [
    {
      name: 'PostgreSQL',
      category: 'Relational Database',
      sqlDialect: 'PostgreSQL',
      icon: '🐘',
      connectionType: 'JDBC / ODBC / Native',
      features: ['ACID compliant', 'JSON support', 'Extensions'],
      supported: true
    },
    {
      name: 'MySQL',
      category: 'Relational Database',
      sqlDialect: 'MySQL',
      icon: '🐬',
      connectionType: 'JDBC / ODBC / Native',
      features: ['Fast', 'Replication', 'Wide adoption'],
      supported: true
    },
    {
      name: 'MariaDB',
      category: 'Relational Database',
      sqlDialect: 'MySQL-compatible',
      icon: '🦭',
      connectionType: 'JDBC / ODBC / Native',
      features: ['MySQL fork', 'Enhanced features', 'Open source'],
      supported: true
    },
    {
      name: 'Microsoft SQL Server',
      category: 'Relational Database',
      sqlDialect: 'T-SQL',
      icon: '🗄️',
      connectionType: 'JDBC / ODBC / Native',
      features: ['Enterprise features', 'SSIS/SSRS', 'Windows integration'],
      supported: true
    },
    {
      name: 'Oracle Database',
      category: 'Relational Database',
      sqlDialect: 'PL/SQL',
      icon: '🔶',
      connectionType: 'JDBC / ODBC / OCI',
      features: ['Enterprise', 'Advanced features', 'RAC'],
      supported: true
    },
    {
      name: 'IBM Db2',
      category: 'Relational Database',
      sqlDialect: 'SQL/PL',
      icon: '🔷',
      connectionType: 'JDBC / ODBC / CLI',
      features: ['Mainframe', 'Enterprise', 'AI integration'],
      supported: true
    }
  ],

  // Distributed SQL Databases
  distributedSQL: [
    {
      name: 'CockroachDB',
      category: 'Distributed SQL',
      sqlDialect: 'PostgreSQL-compatible',
      icon: '🪳',
      connectionType: 'PostgreSQL wire protocol',
      features: ['Distributed', 'Resilient', 'ACID'],
      supported: true
    },
    {
      name: 'YugabyteDB',
      category: 'Distributed SQL',
      sqlDialect: 'PostgreSQL-compatible',
      icon: '🌐',
      connectionType: 'PostgreSQL/Cassandra compatible',
      features: ['Distributed', 'Multi-region', 'Open source'],
      supported: true
    },
    {
      name: 'TiDB',
      category: 'Distributed SQL',
      sqlDialect: 'MySQL-compatible',
      icon: '🐯',
      connectionType: 'MySQL wire protocol',
      features: ['Distributed', 'HTAP', 'Horizontal scaling'],
      supported: true
    },
    {
      name: 'SingleStore (MemSQL)',
      category: 'Distributed SQL',
      sqlDialect: 'MySQL-compatible',
      icon: '⚡',
      connectionType: 'MySQL wire protocol',
      features: ['In-memory', 'Real-time', 'HTAP'],
      supported: true
    }
  ],

  // Time Series Databases (SQL-compatible)
  timeSeriesDatabases: [
    {
      name: 'TimescaleDB',
      category: 'Time Series Database',
      sqlDialect: 'PostgreSQL',
      icon: '⏰',
      connectionType: 'PostgreSQL wire protocol',
      features: ['Time-series optimized', 'PostgreSQL extension', 'Compression'],
      supported: true
    },
    {
      name: 'QuestDB',
      category: 'Time Series Database',
      sqlDialect: 'SQL with extensions',
      icon: '📊',
      connectionType: 'PostgreSQL wire protocol',
      features: ['High performance', 'Time-series', 'SQL extensions'],
      supported: true
    },
    {
      name: 'InfluxDB (v3.0+)',
      category: 'Time Series Database',
      sqlDialect: 'SQL-like (InfluxQL)',
      icon: '📈',
      connectionType: 'HTTP API / CLI',
      features: ['Time-series', 'Tags', 'Retention policies'],
      supported: true
    }
  ],

  // Analytical/OLAP Databases
  analyticalDatabases: [
    {
      name: 'ClickHouse',
      category: 'Analytical Database',
      sqlDialect: 'SQL with extensions',
      icon: '🏠',
      connectionType: 'HTTP / Native / JDBC',
      features: ['Columnar', 'Real-time', 'Fast aggregations'],
      supported: true
    },
    {
      name: 'Apache Druid',
      category: 'Analytical Database',
      sqlDialect: 'SQL',
      icon: '🌳',
      connectionType: 'HTTP / JDBC',
      features: ['Real-time', 'Time-series', 'Sub-second queries'],
      supported: true
    },
    {
      name: 'Apache Pinot',
      category: 'Analytical Database',
      sqlDialect: 'SQL',
      icon: '🍷',
      connectionType: 'JDBC / REST',
      features: ['Real-time', 'Low latency', 'Distributed'],
      supported: true
    },
    {
      name: 'DuckDB',
      category: 'Analytical Database',
      sqlDialect: 'SQL',
      icon: '🦆',
      connectionType: 'In-process / JDBC',
      features: ['Embedded', 'Columnar', 'OLAP'],
      supported: true
    },
    {
      name: 'Apache Doris',
      category: 'Analytical Database',
      sqlDialect: 'MySQL-compatible',
      icon: '🗃️',
      connectionType: 'MySQL wire protocol',
      features: ['MPP', 'Real-time', 'Vectorized'],
      supported: true
    }
  ],

  // SQL-on-Hadoop/Data Lake
  dataLakeEngines: [
    {
      name: 'Presto (Trino)',
      category: 'SQL Query Engine',
      sqlDialect: 'ANSI SQL',
      icon: '🔍',
      connectionType: 'JDBC / REST',
      features: ['Federated queries', 'Fast', 'Multiple sources'],
      supported: true
    },
    {
      name: 'Apache Spark SQL',
      category: 'SQL Query Engine',
      sqlDialect: 'ANSI SQL',
      icon: '✨',
      connectionType: 'JDBC / Thrift',
      features: ['Distributed', 'ML integration', 'Streaming'],
      supported: true
    },
    {
      name: 'Apache Hive',
      category: 'SQL Query Engine',
      sqlDialect: 'HiveQL',
      icon: '🐝',
      connectionType: 'JDBC / Thrift',
      features: ['Hadoop integration', 'Batch processing', 'Partitioning'],
      supported: true
    },
    {
      name: 'Apache Impala',
      category: 'SQL Query Engine',
      sqlDialect: 'SQL-92',
      icon: '🦌',
      connectionType: 'JDBC / ODBC',
      features: ['Low latency', 'MPP', 'Hadoop native'],
      supported: true
    },
    {
      name: 'Amazon Athena',
      category: 'SQL Query Engine',
      sqlDialect: 'Presto SQL',
      icon: '🏛️',
      connectionType: 'JDBC / API',
      features: ['Serverless', 'S3 queries', 'Pay-per-query'],
      supported: true
    }
  ],

  // Graph Databases with SQL
  graphDatabases: [
    {
      name: 'Amazon Neptune',
      category: 'Graph Database',
      sqlDialect: 'SPARQL / Gremlin',
      icon: '🔱',
      connectionType: 'REST / WebSocket',
      features: ['Managed', 'ACID', 'Multiple query languages'],
      supported: false
    },
    {
      name: 'TigerGraph',
      category: 'Graph Database',
      sqlDialect: 'GSQL',
      icon: '🐅',
      connectionType: 'REST / JDBC',
      features: ['Parallel processing', 'Real-time', 'Deep analytics'],
      supported: true
    }
  ],

  // NoSQL with SQL interfaces
  noSQLWithSQL: [
    {
      name: 'MongoDB (with SQL)',
      category: 'Document Database',
      sqlDialect: 'SQL via BI Connector',
      icon: '🍃',
      connectionType: 'MongoDB BI Connector',
      features: ['Document store', 'Flexible schema', 'SQL translation'],
      supported: true
    },
    {
      name: 'Cassandra (with SQL)',
      category: 'Wide Column Store',
      sqlDialect: 'CQL (SQL-like)',
      icon: '👁️',
      connectionType: 'CQL / JDBC',
      features: ['Distributed', 'High availability', 'Wide column'],
      supported: true
    },
    {
      name: 'Azure Cosmos DB',
      category: 'Multi-model Database',
      sqlDialect: 'SQL API',
      icon: '🌌',
      connectionType: 'REST / SDK',
      features: ['Multi-model', 'Global distribution', 'Multiple APIs'],
      supported: true
    },
    {
      name: 'Couchbase (N1QL)',
      category: 'Document Database',
      sqlDialect: 'N1QL (SQL for JSON)',
      icon: '🛋️',
      connectionType: 'REST / SDK',
      features: ['JSON documents', 'SQL-like queries', 'Full-text search'],
      supported: true
    }
  ],

  // Embedded Databases
  embeddedDatabases: [
    {
      name: 'SQLite',
      category: 'Embedded Database',
      sqlDialect: 'SQLite SQL',
      icon: '🪶',
      connectionType: 'File-based / JDBC',
      features: ['Lightweight', 'Serverless', 'Zero-config'],
      supported: true
    },
    {
      name: 'H2 Database',
      category: 'Embedded Database',
      sqlDialect: 'ANSI SQL',
      icon: '💧',
      connectionType: 'JDBC / Embedded',
      features: ['Java-based', 'In-memory', 'Fast'],
      supported: true
    },
    {
      name: 'Apache Derby',
      category: 'Embedded Database',
      sqlDialect: 'SQL-92',
      icon: '🎩',
      connectionType: 'JDBC / Embedded',
      features: ['Java-based', 'Small footprint', 'Standards compliant'],
      supported: true
    }
  ],

  // Specialized/Other
  specialized: [
    {
      name: 'Elasticsearch SQL',
      category: 'Search Engine',
      sqlDialect: 'SQL via X-Pack',
      icon: '🔎',
      connectionType: 'REST / JDBC',
      features: ['Full-text search', 'Analytics', 'SQL translation'],
      supported: true
    },
    {
      name: 'SAP HANA',
      category: 'In-Memory Database',
      sqlDialect: 'SQL Script',
      icon: '🏢',
      connectionType: 'JDBC / ODBC',
      features: ['In-memory', 'OLTP+OLAP', 'Real-time'],
      supported: true
    },
    {
      name: 'Teradata',
      category: 'Data Warehouse',
      sqlDialect: 'Teradata SQL',
      icon: '🏛️',
      connectionType: 'JDBC / ODBC',
      features: ['MPP', 'Enterprise', 'Advanced analytics'],
      supported: true
    },
    {
      name: 'Greenplum',
      category: 'Data Warehouse',
      sqlDialect: 'PostgreSQL-based',
      icon: '🟢',
      connectionType: 'JDBC / ODBC',
      features: ['MPP', 'Open source', 'PostgreSQL compatible'],
      supported: true
    },
    {
      name: 'Vertica',
      category: 'Analytical Database',
      sqlDialect: 'SQL-99',
      icon: '📐',
      connectionType: 'JDBC / ODBC',
      features: ['Columnar', 'Compression', 'Machine learning'],
      supported: true
    }
  ],

  // Streaming SQL
  streamingSQL: [
    {
      name: 'Apache Flink SQL',
      category: 'Stream Processing',
      sqlDialect: 'ANSI SQL',
      icon: '🌊',
      connectionType: 'JDBC / REST',
      features: ['Stream processing', 'Event time', 'Exactly-once'],
      supported: true
    },
    {
      name: 'ksqlDB',
      category: 'Stream Processing',
      sqlDialect: 'KSQL',
      icon: '📡',
      connectionType: 'REST / CLI',
      features: ['Kafka streams', 'Real-time', 'Materialized views'],
      supported: true
    },
    {
      name: 'Materialize',
      category: 'Streaming Database',
      sqlDialect: 'PostgreSQL-compatible',
      icon: '🔄',
      connectionType: 'PostgreSQL wire protocol',
      features: ['Incremental views', 'Real-time', 'SQL on streams'],
      supported: true
    },
    {
      name: 'RisingWave',
      category: 'Streaming Database',
      sqlDialect: 'PostgreSQL-compatible',
      icon: '🌊',
      connectionType: 'PostgreSQL wire protocol',
      features: ['Stream processing', 'Cloud-native', 'Real-time analytics'],
      supported: true
    }
  ]
};

// Helper function to get all supported data sources
export const getSupportedDataSources = () => {
  const allSources = [];
  Object.values(SQL_DATA_SOURCES).forEach(category => {
    allSources.push(...category.filter(source => source.supported));
  });
  return allSources;
};

// Helper function to get data sources by category
export const getDataSourcesByCategory = (categoryName) => {
  return SQL_DATA_SOURCES[categoryName] || [];
};

// Helper function to search data sources
export const searchDataSources = (query) => {
  const searchTerm = query.toLowerCase();
  const results = [];
  
  Object.values(SQL_DATA_SOURCES).forEach(category => {
    category.forEach(source => {
      if (
        source.name.toLowerCase().includes(searchTerm) ||
        source.category.toLowerCase().includes(searchTerm) ||
        source.sqlDialect.toLowerCase().includes(searchTerm) ||
        source.features.some(feature => feature.toLowerCase().includes(searchTerm))
      ) {
        results.push(source);
      }
    });
  });
  
  return results;
};

// Categories for grouping
export const DATA_SOURCE_CATEGORIES = {
  cloudDataWarehouses: 'Cloud Data Warehouses',
  relationalDatabases: 'Traditional Relational Databases',
  distributedSQL: 'Distributed SQL Databases',
  timeSeriesDatabases: 'Time Series Databases',
  analyticalDatabases: 'Analytical/OLAP Databases',
  dataLakeEngines: 'SQL-on-Hadoop/Data Lake',
  graphDatabases: 'Graph Databases',
  noSQLWithSQL: 'NoSQL with SQL Interfaces',
  embeddedDatabases: 'Embedded Databases',
  specialized: 'Specialized/Enterprise',
  streamingSQL: 'Streaming SQL'
};

// Connection configuration templates
export const CONNECTION_TEMPLATES = {
  bigquery: {
    projectId: '',
    datasetId: '',
    credentials: 'path/to/credentials.json'
  },
  postgresql: {
    host: 'localhost',
    port: 5432,
    database: '',
    username: '',
    password: '',
    sslMode: 'prefer'
  },
  mysql: {
    host: 'localhost',
    port: 3306,
    database: '',
    username: '',
    password: ''
  },
  snowflake: {
    account: '',
    username: '',
    password: '',
    warehouse: '',
    database: '',
    schema: 'PUBLIC'
  },
  redshift: {
    host: '',
    port: 5439,
    database: '',
    username: '',
    password: '',
    ssl: true
  },
  sqlserver: {
    server: 'localhost',
    port: 1433,
    database: '',
    username: '',
    password: '',
    encrypt: true
  },
  oracle: {
    host: 'localhost',
    port: 1521,
    serviceName: '',
    username: '',
    password: ''
  },
  mongodb: {
    connectionString: 'mongodb://localhost:27017',
    database: '',
    authSource: 'admin'
  },
  clickhouse: {
    host: 'localhost',
    port: 8123,
    database: 'default',
    username: 'default',
    password: ''
  },
  elasticsearch: {
    nodes: ['http://localhost:9200'],
    username: '',
    password: '',
    apiKey: ''
  }
};