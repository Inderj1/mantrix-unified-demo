/**
 * STOX.AI Service Layer
 * API client for inventory optimization analytics
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
}

// Export singleton instance
const stoxService = new StoxService();
export default stoxService;
