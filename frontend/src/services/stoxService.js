/**
 * STOX.AI Service Layer
 * API client for inventory optimization analytics
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

class StoxService {
  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1/stox`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // ========== SHORTAGE DETECTOR METHODS ==========

  /**
   * Get shortage alerts
   * @param {Object} params - Query parameters
   * @param {string} params.severity - Filter by severity (Critical, High, Medium, Low)
   * @param {number} params.limit - Number of results
   * @param {number} params.offset - Pagination offset
   */
  async getShortageAlerts(params = {}) {
    const response = await this.client.get('/shortage-detector/alerts', { params });
    return response.data;
  }

  /**
   * Get stockout predictions for next 3 months
   * @param {Object} params - Query parameters
   * @param {number} params.months - Number of months to predict
   * @param {string} params.material_id - Filter by material ID
   */
  async getStockoutPredictions(params = {}) {
    const response = await this.client.get('/shortage-detector/predictions', { params });
    return response.data;
  }

  /**
   * Get material-level risk summary
   */
  async getMaterialRiskSummary() {
    const response = await this.client.get('/shortage-detector/material-risk');
    return response.data;
  }

  // ========== INVENTORY HEATMAP METHODS ==========

  /**
   * Get inventory distribution by plant/location
   */
  async getInventoryDistribution() {
    const response = await this.client.get('/inventory-heatmap/distribution');
    return response.data;
  }

  /**
   * Get detailed metrics for specific location
   * @param {Object} params - Query parameters
   * @param {string} params.plant - Filter by plant/location
   */
  async getLocationMetrics(params = {}) {
    const response = await this.client.get('/inventory-heatmap/location-metrics', { params });
    return response.data;
  }

  /**
   * Get performance comparison S4 vs IBP vs StoxAI by plant
   */
  async getPlantPerformance() {
    const response = await this.client.get('/inventory-heatmap/plant-performance');
    return response.data;
  }

  // ========== REALLOCATION OPTIMIZER METHODS ==========

  /**
   * Get stock reallocation opportunities (excess vs deficit)
   */
  async getReallocationOpportunities() {
    const response = await this.client.get('/reallocation-optimizer/opportunities');
    return response.data;
  }

  /**
   * Get transfer recommendations with cost/benefit
   * @param {Object} params - Query parameters
   * @param {string} params.material_id - Filter by material ID
   */
  async getTransferRecommendations(params = {}) {
    const response = await this.client.get('/reallocation-optimizer/transfer-recommendations', { params });
    return response.data;
  }

  /**
   * Get EOQ recommendations from lot size calculations
   */
  async getLotSizeOptimization() {
    const response = await this.client.get('/reallocation-optimizer/lot-size-optimization');
    return response.data;
  }

  // ========== INBOUND RISK MONITOR METHODS ==========

  /**
   * Get vendor performance and risk metrics
   */
  async getVendorRiskMetrics() {
    const response = await this.client.get('/inbound-risk/vendor-metrics');
    return response.data;
  }

  /**
   * Get detailed supplier performance by SKU
   * @param {Object} params - Query parameters
   * @param {string} params.vendor - Filter by vendor
   */
  async getSupplierPerformance(params = {}) {
    const response = await this.client.get('/inbound-risk/supplier-performance', { params });
    return response.data;
  }

  /**
   * Get inbound shipment risk alerts
   * @param {Object} params - Query parameters
   * @param {number} params.risk_threshold - OTIF% threshold for alerts
   */
  async getInboundAlerts(params = {}) {
    const response = await this.client.get('/inbound-risk/alerts', { params });
    return response.data;
  }

  // ========== AGING STOCK INTELLIGENCE METHODS ==========

  /**
   * Get aging inventory analysis (high WC + low turnover)
   */
  async getAgingInventory() {
    const response = await this.client.get('/aging-stock/inventory-analysis');
    return response.data;
  }

  /**
   * Get obsolescence risk from annual cost data
   */
  async getObsolescenceRisk() {
    const response = await this.client.get('/aging-stock/obsolescence-risk');
    return response.data;
  }

  /**
   * Get clearance strategy recommendations for slow-moving SKUs
   */
  async getClearanceRecommendations() {
    const response = await this.client.get('/aging-stock/clearance-recommendations');
    return response.data;
  }

  // ========== DASHBOARD METHODS ==========

  /**
   * Get enterprise-level summary metrics
   */
  async getEnterpriseSummary() {
    const response = await this.client.get('/dashboard/enterprise-summary');
    return response.data;
  }

  /**
   * Health check
   */
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }

  // ========== BIGQUERY ENDPOINTS (Demo Data) ==========

  /**
   * Get working capital baseline data
   * @param {Object} params - Query parameters
   * @param {string} params.plant - Filter by plant ID
   * @param {string} params.category - Filter by category
   * @param {string} params.abc_class - Filter by ABC class (A, B, C)
   * @param {number} params.limit - Number of results
   * @param {number} params.offset - Pagination offset
   */
  async getWorkingCapital(params = {}) {
    const response = await this.client.get('/working-capital', { params });
    return response.data;
  }

  /**
   * Get inventory health data
   * @param {Object} params - Query parameters
   * @param {string} params.plant - Filter by plant ID
   * @param {string} params.risk_level - Filter by risk level
   * @param {number} params.limit - Number of results
   */
  async getInventoryHealth(params = {}) {
    const response = await this.client.get('/inventory-health', { params });
    return response.data;
  }

  /**
   * Get MRP parameter optimization data
   * @param {Object} params - Query parameters
   * @param {string} params.plant - Filter by plant ID
   * @param {string} params.abc_class - Filter by ABC class
   * @param {number} params.limit - Number of results
   */
  async getMRPParameters(params = {}) {
    const response = await this.client.get('/mrp-parameters', { params });
    return response.data;
  }

  /**
   * Get supplier lead time analytics
   * @param {Object} params - Query parameters
   * @param {string} params.vendor - Filter by vendor name
   * @param {string} params.risk_level - Filter by risk level
   * @param {number} params.limit - Number of results
   */
  async getLeadTimes(params = {}) {
    const response = await this.client.get('/lead-times', { params });
    return response.data;
  }

  /**
   * Get optimization recommendations
   * @param {Object} params - Query parameters
   * @param {string} params.category - Filter by category
   * @param {string} params.status - Filter by status
   * @param {string} params.priority - Filter by priority
   * @param {number} params.limit - Number of results
   */
  async getRecommendations(params = {}) {
    const response = await this.client.get('/recommendations', { params });
    return response.data;
  }

  /**
   * Get demand pattern intelligence
   * @param {Object} params - Query parameters
   * @param {string} params.plant - Filter by plant ID
   * @param {string} params.pattern - Filter by pattern type
   * @param {number} params.limit - Number of results
   */
  async getDemandPatterns(params = {}) {
    const response = await this.client.get('/demand-patterns', { params });
    return response.data;
  }

  /**
   * Get cash release timeline initiatives
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Number of results
   */
  async getCashRelease(params = {}) {
    const response = await this.client.get('/cash-release', { params });
    return response.data;
  }

  /**
   * Get forecast data
   * @param {Object} params - Query parameters
   * @param {string} params.plant - Filter by plant ID
   * @param {string} params.pattern - Filter by pattern type
   * @param {number} params.limit - Number of results
   */
  async getForecasts(params = {}) {
    const response = await this.client.get('/forecasts', { params });
    return response.data;
  }

  /**
   * Get exceptions for Command Center
   * @param {Object} params - Query parameters
   * @param {string} params.tile - Filter by tile name
   * @param {number} params.priority - Filter by priority level
   * @param {number} params.limit - Number of results
   */
  async getExceptions(params = {}) {
    const response = await this.client.get('/exceptions', { params });
    return response.data;
  }

  // ========== BIGQUERY ENDPOINTS (Real Data) ==========

  /**
   * Get performance KPIs (fill rate, OTIF, cycle time) - REAL DATA
   */
  async getPerformanceKPIs() {
    const response = await this.client.get('/kpis/performance');
    return response.data;
  }

  /**
   * Get margin analysis by plant/material - REAL DATA
   * @param {Object} params - Query parameters
   * @param {string} params.plant - Filter by plant
   * @param {number} params.limit - Number of results
   */
  async getMarginAnalysis(params = {}) {
    const response = await this.client.get('/kpis/margins', { params });
    return response.data;
  }

  /**
   * Get CFO rollup dashboard data - REAL DATA
   */
  async getCFORollup() {
    const response = await this.client.get('/cfo-rollup');
    return response.data;
  }

  /**
   * Get sell-through analytics - REAL DATA
   */
  async getSellThrough() {
    const response = await this.client.get('/sell-through');
    return response.data;
  }
}

// Export singleton instance
const stoxService = new StoxService();
export default stoxService;
