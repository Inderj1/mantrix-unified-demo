#!/bin/bash
# Test script for COPA/BigQuery queries
# Results are written to test_query_results.md

API_URL="http://localhost:8000/api/v1/bigquery/query"
OUTPUT_FILE="/Users/inder/projects/mantrix-unified-demo/backend/test_query_results.md"

# Clear output file
cat > "$OUTPUT_FILE" << 'HEADER'
# AXIS.AI Query Test Results
**Date:** $(date '+%Y-%m-%d %H:%M')
**Environment:** Local (localhost:8000)

---

HEADER

# Replace the date placeholder
sed -i '' "s/\$(date '+%Y-%m-%d %H:%M')/$(date '+%Y-%m-%d %H:%M')/" "$OUTPUT_FILE"

run_query() {
    local test_name="$1"
    local question="$2"

    echo "Testing: $test_name..."

    # Run the query
    response=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "{\"question\": \"$question\"}" \
        --max-time 120)

    # Extract fields
    sql=$(echo "$response" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('sql','NO SQL GENERATED'))" 2>/dev/null)
    explanation=$(echo "$response" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('explanation','N/A'))" 2>/dev/null)
    row_count=$(echo "$response" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('results',[])))" 2>/dev/null)
    error=$(echo "$response" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('error',''))" 2>/dev/null)
    sample_rows=$(echo "$response" | python3 -c "
import json,sys
d=json.load(sys.stdin)
results = d.get('results',[])
for r in results[:5]:
    print(r)
" 2>/dev/null)

    # Determine status
    if [ -n "$error" ] && [ "$error" != "" ] && [ "$error" != "None" ]; then
        status="FAIL"
    elif [ "$row_count" = "0" ] || [ -z "$row_count" ]; then
        status="WARN (0 rows)"
    else
        status="PASS ($row_count rows)"
    fi

    # Write to file
    cat >> "$OUTPUT_FILE" << EOF
## $test_name
**Status:** $status
**Question:** $question

**Explanation:** $explanation

**SQL:**
\`\`\`sql
$sql
\`\`\`

**Results:** $row_count rows
**Sample Data (first 5 rows):**
\`\`\`
$sample_rows
\`\`\`

$([ -n "$error" ] && [ "$error" != "" ] && [ "$error" != "None" ] && echo "**Error:** $error")

---

EOF

    echo "  -> $status"
}

echo "Starting AXIS.AI Query Tests..."
echo "================================"

# 1. P&L Queries
run_query "1. Top-Down P&L (Last Quarter)" "Show me top-down P&L for last quarter"
run_query "2. Full P&L Statement" "Give me a complete profit and loss statement"
run_query "3. P&L by GL Category" "Show me P&L breakdown by GL account category"

# 2. Revenue Queries
run_query "4. Revenue by Top 10 Customers" "Show me revenue by top 10 customers"
run_query "5. Month-over-Month Revenue by Customer" "Show me month on month revenue by top 10 customers with customer names"
run_query "6. Revenue by Plant" "Show me total revenue by plant"

# 3. Cost/Spend Queries
run_query "7. This Month vs Last Month Spend" "What was spent this month vs last month"
run_query "8. Purchasing Spend Analysis" "Show me purchasing spend by category"
run_query "9. COGS Breakdown" "Show me cost of goods sold breakdown"

# 4. Freight and Ingredient Queries
run_query "10. Freight In vs Freight Out" "Show me freight in vs freight out costs"
run_query "11. Ingredient Consumption" "Show me total ingredient consumption costs"

# 5. Year-over-Year Queries
run_query "12. Revenue Year over Year" "Show me revenue year over year comparison"
run_query "13. YoY by Customer" "Compare revenue this year vs last year by top 10 customers"

# 6. Customer/Plant Specific
run_query "14. Walmart Revenue YTD" "Show me Walmart revenue year to date"
run_query "15. Sales Revenue by Customer and Plant" "Show me sales revenue by customer and plant for top 10 customers"
run_query "16. Gross Profit by Customer" "Show me gross profit by top 10 customers"
run_query "17. Net Sales by Month" "Show me net sales by month for 2024 and 2025"

echo ""
echo "================================"
echo "All tests complete! Results saved to: $OUTPUT_FILE"
