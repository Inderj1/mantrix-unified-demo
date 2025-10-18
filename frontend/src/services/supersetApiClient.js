import axios from 'axios';

const SUPERSET_BASE_URL = import.meta.env.VITE_SUPERSET_URL || '/superset';

class SupersetApiClient {
  constructor() {
    this.api = axios.create({
      baseURL: SUPERSET_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.authToken = null;
    this.refreshToken = null;
  }

  setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        // Skip authentication for login and health endpoints
        if (config.url?.includes('/security/login') || config.url?.includes('/health')) {
          return config;
        }

        // Ensure we're authenticated before making the request
        if (!this.authToken) {
          await this.ensureAuthenticated();
        }

        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && this.refreshToken) {
          try {
            await this.refreshAuth();
            // Retry the original request
            return this.api(error.config);
          } catch (refreshError) {
            this.logout();
            throw refreshError;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(username, password, provider = 'db') {
    try {
      const response = await this.api.post('/api/v1/security/login', {
        username,
        password,
        provider,
        refresh: true,
      });

      const { access_token, refresh_token } = response.data;
      this.authToken = access_token;
      this.refreshToken = refresh_token;
      
      // Store tokens in localStorage for persistence
      localStorage.setItem('superset_access_token', access_token);
      localStorage.setItem('superset_refresh_token', refresh_token);
      
      return response.data;
    } catch (error) {
      console.error('Superset login failed:', error);
      throw error;
    }
  }

  async refreshAuth() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.api.post('/api/v1/security/refresh', {
      refresh_token: this.refreshToken,
    });

    const { access_token } = response.data;
    this.authToken = access_token;
    localStorage.setItem('superset_access_token', access_token);
    
    return response.data;
  }

  logout() {
    this.authToken = null;
    this.refreshToken = null;
    localStorage.removeItem('superset_access_token');
    localStorage.removeItem('superset_refresh_token');
  }

  // Initialize from stored tokens
  initializeFromStorage() {
    const storedToken = localStorage.getItem('superset_access_token');
    const storedRefreshToken = localStorage.getItem('superset_refresh_token');
    
    if (storedToken) {
      this.authToken = storedToken;
    }
    if (storedRefreshToken) {
      this.refreshToken = storedRefreshToken;
    }
  }

  // Auto-login with default credentials if no token exists
  async ensureAuthenticated() {
    if (this.authToken) {
      return true;
    }

    try {
      // Try to login with default credentials
      await this.login('admin', 'admin');
      return true;
    } catch (error) {
      console.error('Failed to auto-authenticate with Superset:', error);
      return false;
    }
  }

  // Dashboard operations
  async getDashboards(page = 0, pageSize = 20) {
    const response = await this.api.get('/api/v1/dashboard/', {
      params: {
        q: JSON.stringify({
          page: page,
          page_size: pageSize,
          order_column: 'changed_on_delta_humanized',
          order_direction: 'desc',
        }),
      },
    });
    return response.data;
  }

  async getDashboard(dashboardId) {
    const response = await this.api.get(`/api/v1/dashboard/${dashboardId}`);
    return response.data;
  }

  async createDashboard(dashboardData) {
    const response = await this.api.post('/api/v1/dashboard/', dashboardData);
    return response.data;
  }

  async updateDashboard(dashboardId, dashboardData) {
    const response = await this.api.put(`/api/v1/dashboard/${dashboardId}`, dashboardData);
    return response.data;
  }

  async deleteDashboard(dashboardId) {
    const response = await this.api.delete(`/api/v1/dashboard/${dashboardId}`);
    return response.data;
  }

  // Chart operations
  async getCharts(page = 0, pageSize = 20) {
    const response = await this.api.get('/api/v1/chart/', {
      params: {
        q: JSON.stringify({
          page: page,
          page_size: pageSize,
          order_column: 'changed_on_delta_humanized',
          order_direction: 'desc',
        }),
      },
    });
    return response.data;
  }

  async getChart(chartId) {
    const response = await this.api.get(`/api/v1/chart/${chartId}`);
    return response.data;
  }

  async createChart(chartData) {
    const response = await this.api.post('/api/v1/chart/', chartData);
    return response.data;
  }

  async updateChart(chartId, chartData) {
    const response = await this.api.put(`/api/v1/chart/${chartId}`, chartData);
    return response.data;
  }

  async deleteChart(chartId) {
    const response = await this.api.delete(`/api/v1/chart/${chartId}`);
    return response.data;
  }

  // Dataset operations
  async getDatasets(page = 0, pageSize = 20) {
    const response = await this.api.get('/api/v1/dataset/', {
      params: {
        q: JSON.stringify({
          page: page,
          page_size: pageSize,
          order_column: 'changed_on_delta_humanized',
          order_direction: 'desc',
        }),
      },
    });
    return response.data;
  }

  async getDataset(datasetId) {
    const response = await this.api.get(`/api/v1/dataset/${datasetId}`);
    return response.data;
  }

  async createDataset(datasetData) {
    const response = await this.api.post('/api/v1/dataset/', datasetData);
    return response.data;
  }

  // Database operations
  async getDatabases() {
    const response = await this.api.get('/api/v1/database/');
    return response.data;
  }

  async getDatabase(databaseId) {
    const response = await this.api.get(`/api/v1/database/${databaseId}`);
    return response.data;
  }

  // Query operations
  async executeSQL(databaseId, sql, queryLimit = 1000) {
    const response = await this.api.post('/api/v1/sqllab/execute/', {
      database_id: databaseId,
      sql: sql,
      queryLimit: queryLimit,
      runAsync: false,
    });
    return response.data;
  }

  // Chart data operations
  async getChartData(chartId, formData = {}) {
    try {
      const response = await this.api.post(`/api/v1/chart/${chartId}/data/`, {
        queries: [{
          ...formData,
        }],
      });
      return response.data;
    } catch (error) {
      // If the chart data call fails, try to get the chart info first to get proper form data
      if (error.response?.status === 405 || error.response?.status === 400) {
        try {
          const chartInfo = await this.getChart(chartId);
          const chartFormData = chartInfo.result?.params ? JSON.parse(chartInfo.result.params) : {};
          
          const retryResponse = await this.api.post(`/api/v1/chart/${chartId}/data/`, {
            queries: [{
              ...chartFormData,
              ...formData, // Allow passed formData to override
            }],
          });
          return retryResponse.data;
        } catch (retryError) {
          console.error(`Failed to get chart data for chart ${chartId}:`, retryError);
          throw retryError;
        }
      }
      throw error;
    }
  }

  // Export operations
  async exportChart(chartId, format = 'png') {
    const response = await this.api.get(`/api/v1/chart/${chartId}/export/${format}/`);
    return response.data;
  }

  async exportDashboard(dashboardId, format = 'pdf') {
    const response = await this.api.get(`/api/v1/dashboard/${dashboardId}/export/${format}/`);
    return response.data;
  }

  // User and permissions
  async getCurrentUser() {
    const response = await this.api.get('/api/v1/me/');
    return response.data;
  }

  // Utility methods for integration with NLP-to-SQL platform
  async createDatasetFromQuery(sql, databaseId, datasetName, description = '') {
    try {
      // First, validate the SQL by executing it
      await this.executeSQL(databaseId, `${sql} LIMIT 1`);
      
      // Create dataset
      const datasetData = {
        database: databaseId,
        sql: sql,
        table_name: datasetName.replace(/\s+/g, '_').toLowerCase(),
        description: description,
        is_sqllab_view: true,
      };
      
      return await this.createDataset(datasetData);
    } catch (error) {
      console.error('Failed to create dataset from query:', error);
      throw error;
    }
  }

  async createChartFromDataset(datasetId, chartConfig) {
    const chartData = {
      datasource_id: datasetId,
      datasource_type: 'table',
      viz_type: chartConfig.vizType || 'table',
      slice_name: chartConfig.name,
      description: chartConfig.description || '',
      params: JSON.stringify(chartConfig.params || {}),
      cache_timeout: chartConfig.cacheTimeout || 0,
    };
    
    return await this.createChart(chartData);
  }

  // Health check
  async checkHealth() {
    try {
      const response = await this.api.get('/health');
      return { status: 'healthy', data: response.data };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}

// Create singleton instance
const supersetApiClient = new SupersetApiClient();

// Initialize from storage on module load
supersetApiClient.initializeFromStorage();

export default supersetApiClient;