#!/bin/bash

# MARGEN.AI Frontend KPI Validation Script
# Tests all API endpoints and validates KPI calculations

echo "================================================================================"
echo "MARGEN.AI FRONTEND KPI VALIDATION"
echo "Testing API endpoints and KPI calculations"
echo "================================================================================"
echo

API_BASE="http://localhost:8000/api/v1/margen/csg"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Revenue & Growth Analytics KPIs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

# Revenue Summary
echo "Fetching: ${API_BASE}/revenue/summary"
RESPONSE=$(curl -s "${API_BASE}/revenue/summary")
echo "$RESPONSE" | python3 -m json.tool
echo

# By System
echo "Fetching: ${API_BASE}/revenue/by-system"
RESPONSE=$(curl -s "${API_BASE}/revenue/by-system")
echo "Top 3 Systems by Revenue:"
echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); [print(f\"  {i+1}. {s['system']}: \${s['total_revenue']:,.2f}\") for i,s in enumerate(data.get('systems', [])[:3])]"
echo

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Margin & Profitability Analytics KPIs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

# Top Performers
echo "Fetching: ${API_BASE}/margin/top-performers"
RESPONSE=$(curl -s "${API_BASE}/margin/top-performers")
echo "$RESPONSE" | python3 -m json.tool
echo

# By System (sorted by GM%)
echo "Fetching: ${API_BASE}/margin/by-system?sort_by=gm_percent"
RESPONSE=$(curl -s "${API_BASE}/margin/by-system?sort_by=gm_percent")
echo "Top 5 Systems by GM%:"
echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); [print(f\"  {i+1}. {s['system']}: {s['gm_percent']:.2f}% (\${s['total_gm']:,.2f})\") for i,s in enumerate(data.get('systems', [])[:5])]"
echo

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Cost & COGS Analytics KPIs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

# COGS Summary
echo "Fetching: ${API_BASE}/cogs/summary"
RESPONSE=$(curl -s "${API_BASE}/cogs/summary")
echo "$RESPONSE" | python3 -m json.tool
echo

# By System
echo "Fetching: ${API_BASE}/cogs/by-system"
RESPONSE=$(curl -s "${API_BASE}/cogs/by-system")
echo "Top 3 Systems by COGS:"
echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); [print(f\"  {i+1}. {s['system']}: \${s['total_cogs']:,.2f} ({s['cogs_percent']:.2f}%)\") for i,s in enumerate(data.get('systems', [])[:3])]"
echo

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: P&L Statement Analytics KPIs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

# P&L Summary
echo "Fetching: ${API_BASE}/pl/summary"
RESPONSE=$(curl -s "${API_BASE}/pl/summary")
echo "$RESPONSE" | python3 -m json.tool
echo

# Monthly P&L
echo "Fetching: ${API_BASE}/pl/by-month"
RESPONSE=$(curl -s "${API_BASE}/pl/by-month")
echo "Monthly P&L Summary:"
echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); [print(f\"  {m['month_label']}: \${m['revenue']:,.2f} revenue, {m['gm_percent']:.2f}% GM\") for m in data.get('data', [])]"
echo

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 5: Data Consistency Checks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

echo "Verifying Total Revenue consistency across endpoints..."
REV1=$(curl -s "${API_BASE}/revenue/summary" | python3 -c "import sys, json; print(json.load(sys.stdin)['summary']['total_revenue'])")
REV2=$(curl -s "${API_BASE}/cogs/summary" | python3 -c "import sys, json; print(json.load(sys.stdin)['summary']['total_revenue'])")
REV3=$(curl -s "${API_BASE}/pl/summary" | python3 -c "import sys, json; print(json.load(sys.stdin)['summary']['total_revenue'])")

if [ "$REV1" == "$REV2" ] && [ "$REV2" == "$REV3" ]; then
    echo -e "${GREEN}✅ Revenue consistency check PASSED${NC}"
    echo "   All endpoints report: \$$REV1"
else
    echo -e "${RED}❌ Revenue consistency check FAILED${NC}"
    echo "   Revenue endpoint: \$$REV1"
    echo "   COGS endpoint: \$$REV2"
    echo "   P&L endpoint: \$$REV3"
fi

echo
echo "Verifying Total COGS consistency..."
COGS1=$(curl -s "${API_BASE}/cogs/summary" | python3 -c "import sys, json; print(json.load(sys.stdin)['summary']['total_cogs'])")
COGS2=$(curl -s "${API_BASE}/pl/summary" | python3 -c "import sys, json; print(json.load(sys.stdin)['summary']['total_cogs'])")

if [ "$COGS1" == "$COGS2" ]; then
    echo -e "${GREEN}✅ COGS consistency check PASSED${NC}"
    echo "   All endpoints report: \$$COGS1"
else
    echo -e "${RED}❌ COGS consistency check FAILED${NC}"
    echo "   COGS endpoint: \$$COGS1"
    echo "   P&L endpoint: \$$COGS2"
fi

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ALL FRONTEND KPI TESTS COMPLETED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo
