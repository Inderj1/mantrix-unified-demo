#!/bin/bash

# Backend Data Export Script
# Exports all data from backend API endpoints to JSON files

API_BASE="https://madisonreed.cloudmantra.ai/api/v1"
OUTPUT_DIR="./backend-data-export"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "=== Backend Data Export Started at $(date) ==="
echo "Output directory: $OUTPUT_DIR"
echo ""

# Function to fetch and save endpoint data
fetch_endpoint() {
    local endpoint=$1
    local filename=$2
    local method=${3:-GET}

    echo "Fetching: $endpoint"

    if [ "$method" = "GET" ]; then
        curl -s -X GET "$API_BASE$endpoint" \
            -H "Content-Type: application/json" \
            > "$OUTPUT_DIR/$filename" 2>&1
    else
        curl -s -X POST "$API_BASE$endpoint" \
            -H "Content-Type: application/json" \
            > "$OUTPUT_DIR/$filename" 2>&1
    fi

    if [ $? -eq 0 ]; then
        echo "  ✓ Saved to: $filename"
    else
        echo "  ✗ Failed to fetch"
    fi
}

# System Health
echo "=== System Health ==="
fetch_endpoint "/health" "00-health.json"
echo ""

# Analytics Endpoints
echo "=== Analytics Data ==="
fetch_endpoint "/analytics/dashboard" "analytics-dashboard.json"
fetch_endpoint "/analytics/segments" "analytics-segments.json"
fetch_endpoint "/analytics/revenue-trends" "analytics-revenue-trends.json"
fetch_endpoint "/analytics/retention" "analytics-retention.json"
fetch_endpoint "/analytics/products" "analytics-products.json"
fetch_endpoint "/analytics/top-customers" "analytics-top-customers.json"
fetch_endpoint "/analytics/insights" "analytics-insights.json"
fetch_endpoint "/analytics/churn-risk" "analytics-churn-risk.json"
fetch_endpoint "/analytics/products/metrics" "analytics-products-metrics.json"
fetch_endpoint "/analytics/financial/summary" "analytics-financial-summary.json"
fetch_endpoint "/analytics/financial/trends" "analytics-financial-trends.json"
fetch_endpoint "/analytics/financial/profitability" "analytics-financial-profitability.json"
fetch_endpoint "/analytics/cohort-insights" "analytics-cohort-insights.json"
fetch_endpoint "/analytics/performance-insights" "analytics-performance-insights.json"
fetch_endpoint "/analytics/recommendations" "analytics-recommendations.json"
echo ""

# Table Data
echo "=== Table Data ==="
fetch_endpoint "/analytics/tables/customer-master" "table-customer-master.json"
fetch_endpoint "/analytics/tables/transactions" "table-transactions.json"
fetch_endpoint "/analytics/tables/segmentation-performance" "table-segmentation-performance.json"
fetch_endpoint "/analytics/tables/cohort-retention" "table-cohort-retention.json"
fetch_endpoint "/analytics/tables/cohort-revenue" "table-cohort-revenue.json"
fetch_endpoint "/analytics/tables/time-series-performance" "table-time-series-performance.json"
fetch_endpoint "/analytics/tables/product-customer-matrix" "table-product-customer-matrix.json"
echo ""

# Markets AI Data (if available)
echo "=== Markets AI Data ==="
fetch_endpoint "/markets/signals" "markets-signals.json"
fetch_endpoint "/markets/categories" "markets-categories.json"
fetch_endpoint "/markets/insights" "markets-insights.json"
echo ""

# User Profiles (if available)
echo "=== User Data ==="
fetch_endpoint "/user-profiles" "user-profiles.json"
fetch_endpoint "/connections" "connections.json"
echo ""

# Document Intelligence (if available)
echo "=== Documents ==="
fetch_endpoint "/documents" "documents.json"
echo ""

# Cache Stats
echo "=== Cache Stats ==="
fetch_endpoint "/analytics/cache/stats" "cache-stats.json"
echo ""

# Create index file
cat > "$OUTPUT_DIR/INDEX.md" << EOF
# Backend Data Export
Generated: $(date)
API Base: $API_BASE

## Files Exported

### System
- 00-health.json - API health status

### Analytics
- analytics-dashboard.json - Main dashboard data
- analytics-segments.json - Customer segments
- analytics-revenue-trends.json - Revenue trends over time
- analytics-retention.json - Customer retention metrics
- analytics-products.json - Product performance
- analytics-top-customers.json - Top customers by revenue
- analytics-insights.json - Business insights
- analytics-churn-risk.json - Customer churn risk analysis
- analytics-products-metrics.json - Product metrics
- analytics-financial-summary.json - Financial summary
- analytics-financial-trends.json - Financial trends
- analytics-financial-profitability.json - Profitability analysis
- analytics-cohort-insights.json - Cohort analysis
- analytics-performance-insights.json - Performance insights
- analytics-recommendations.json - AI recommendations

### Tables
- table-customer-master.json - Customer master data
- table-transactions.json - Transaction records
- table-segmentation-performance.json - Segment performance
- table-cohort-retention.json - Cohort retention data
- table-cohort-revenue.json - Cohort revenue data
- table-time-series-performance.json - Time series metrics
- table-product-customer-matrix.json - Product-customer matrix

### Markets AI
- markets-signals.json - Market signals
- markets-categories.json - Signal categories
- markets-insights.json - Market insights

### User & Documents
- user-profiles.json - User profiles
- connections.json - Data connections
- documents.json - Document intelligence data

### System
- cache-stats.json - Cache statistics

## Usage

All files are in JSON format and can be:
- Imported into databases
- Used for testing
- Analyzed with data tools
- Backed up for recovery

EOF

echo ""
echo "=== Export Complete ==="
echo "Total files: $(ls -1 $OUTPUT_DIR/*.json 2>/dev/null | wc -l)"
echo "Output directory: $OUTPUT_DIR"
echo "Index file: $OUTPUT_DIR/INDEX.md"
echo ""
