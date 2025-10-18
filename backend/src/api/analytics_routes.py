"""
Analytics API routes for customer analytics dashboard
"""
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from typing import Dict, Any, Optional
import structlog
import time
import json
from decimal import Decimal
from datetime import datetime, date
from src.core.customer_analytics_service import CustomerAnalyticsService
from src.core.executive_insights_service import ExecutiveInsightsService
from src.core.ai_insights_cache import get_ai_insights_cache

logger = structlog.get_logger()
router = APIRouter(prefix="/analytics", tags=["analytics"])

# Custom JSON encoder to handle Decimal types
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        elif isinstance(obj, (datetime, date)):
            return obj.isoformat()
        return super().default(obj)

def serialize_for_json(obj):
    """Recursively serialize objects for JSON"""
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, (datetime, date)):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {k: serialize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [serialize_for_json(item) for item in obj]
    elif hasattr(obj, '__dict__'):
        # Handle custom objects
        return serialize_for_json(obj.__dict__)
    return obj

# Initialize services
analytics_service = CustomerAnalyticsService()
executive_insights_service = ExecutiveInsightsService()


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Check analytics service health"""
    try:
        # Test PostgreSQL connection
        from src.db.postgresql_client import PostgreSQLClient
        pg_client = PostgreSQLClient()
        pg_connected = pg_client.test_connection()
        
        return {
            "status": "healthy" if pg_connected else "unhealthy",
            "postgres_connected": pg_connected,
            "message": "Analytics service is operational" if pg_connected else "PostgreSQL connection failed"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "postgres_connected": False,
            "message": str(e)
        }


@router.get("/dashboard")
async def get_dashboard_data() -> Dict[str, Any]:
    """
    Get complete dashboard data including segments, revenue trends, and KPIs
    
    Returns comprehensive analytics data for the Core.AI dashboard
    """
    try:
        data = analytics_service.get_dashboard_overview()
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        logger.error(f"Failed to get dashboard data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/segments")
async def get_customer_segments() -> Dict[str, Any]:
    """
    Get customer segment distribution and analytics
    
    Returns detailed segment information including health scores and recommendations
    """
    try:
        data = analytics_service.get_segment_analytics()
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        logger.error(f"Failed to get segment analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/revenue-trends")
async def get_revenue_trends(
    months: int = Query(12, ge=1, le=24, description="Number of months to retrieve")
) -> Dict[str, Any]:
    """
    Get revenue trends over time
    
    Args:
        months: Number of months of data to retrieve (1-24)
    
    Returns time series revenue data with trend analysis
    """
    try:
        data = analytics_service.get_revenue_analytics()
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        logger.error(f"Failed to get revenue trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/retention")
async def get_retention_analytics() -> Dict[str, Any]:
    """
    Get cohort retention analytics
    
    Returns cohort retention data with trend analysis
    """
    try:
        data = analytics_service.get_retention_analytics()
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        logger.error(f"Failed to get retention analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/products")
async def get_product_analytics() -> Dict[str, Any]:
    """
    Get product performance analytics
    
    Returns product performance data with cross-sell opportunities
    """
    try:
        data = analytics_service.get_product_analytics()
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        logger.error(f"Failed to get product analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/top-customers")
async def get_top_customers(
    segment: Optional[str] = Query(None, description="Filter by RFM segment"),
    limit: int = Query(20, ge=1, le=100, description="Number of customers to retrieve")
) -> Dict[str, Any]:
    """
    Get top customers by revenue
    
    Args:
        segment: Optional RFM segment filter
        limit: Number of customers to retrieve (1-100)
    
    Returns list of top customers with their metrics
    """
    try:
        from src.db.postgresql_client import PostgreSQLClient
        pg_client = PostgreSQLClient()
        
        customers = pg_client.get_top_customers(segment=segment, limit=limit)
        
        return {
            "success": True,
            "data": {
                "customers": customers,
                "total": len(customers),
                "segment_filter": segment
            }
        }
    except Exception as e:
        logger.error(f"Failed to get top customers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/insights")
async def get_ai_insights() -> Dict[str, Any]:
    """
    Get AI-generated insights from analytics data
    
    Returns actionable insights based on current data patterns
    """
    try:
        data = analytics_service.get_ai_insights()
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        logger.error(f"Failed to get AI insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/churn-risk")
async def get_churn_risk_customers(
    recency_days: int = Query(180, ge=30, le=365, description="Days since last order threshold")
) -> Dict[str, Any]:
    """
    Get customers at risk of churning
    
    Args:
        recency_days: Number of days since last order to consider at risk
    
    Returns list of at-risk customers with their metrics
    """
    try:
        from src.db.postgresql_client import PostgreSQLClient
        pg_client = PostgreSQLClient()
        
        customers = pg_client.get_churn_risk_customers(recency_threshold=recency_days)
        
        # Calculate total at-risk revenue
        total_at_risk_revenue = sum(c['lifetime_revenue'] for c in customers)
        
        return {
            "success": True,
            "data": {
                "customers": customers,
                "total_at_risk": len(customers),
                "total_revenue_at_risk": round(total_at_risk_revenue, 2),
                "recency_threshold_days": recency_days
            }
        }
    except Exception as e:
        logger.error(f"Failed to get churn risk customers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Customer 360 Endpoints

@router.get("/customer/{customer_id}")
async def get_customer_360(customer_id: str) -> Dict[str, Any]:
    """
    Get comprehensive view of a specific customer
    
    Returns customer profile, purchase history, and analytics
    """
    try:
        from src.db.postgresql_client import PostgreSQLClient
        pg_client = PostgreSQLClient()
        
        # Get customer details
        customer = pg_client.get_customer_detail(customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Get purchase history
        purchase_history = pg_client.get_customer_purchase_history(customer_id, limit=50)
        
        # Get product preferences
        product_preferences = pg_client.get_customer_product_preferences(customer_id)
        
        return {
            "success": True,
            "data": {
                "customer": customer,
                "purchase_history": purchase_history,
                "product_preferences": product_preferences,
                "metrics": {
                    "total_orders": len(purchase_history),
                    "favorite_products": len(product_preferences),
                    "avg_order_value": customer.get('avg_order_value', 0)
                }
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get customer 360 view: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/customers/search")
async def search_customers(
    q: str = Query(..., description="Search term"),
    limit: int = Query(50, ge=1, le=200, description="Maximum results")
) -> Dict[str, Any]:
    """
    Search customers by ID or name
    """
    try:
        from src.db.postgresql_client import PostgreSQLClient
        pg_client = PostgreSQLClient()
        
        customers = pg_client.search_customers(q, limit)
        
        return {
            "success": True,
            "data": {
                "customers": customers,
                "count": len(customers),
                "search_term": q
            }
        }
    except Exception as e:
        logger.error(f"Failed to search customers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Product Performance Endpoints

@router.get("/products/metrics")
async def get_product_metrics() -> Dict[str, Any]:
    """
    Get overall product performance metrics
    """
    try:
        from src.db.postgresql_client import PostgreSQLClient
        pg_client = PostgreSQLClient()
        
        products = pg_client.get_product_metrics()
        
        # Calculate summary metrics
        total_revenue = sum(p['total_revenue'] for p in products)
        total_margin = sum(p['total_margin'] for p in products)
        avg_margin_pct = (total_margin / total_revenue * 100) if total_revenue > 0 else 0
        
        return {
            "success": True,
            "data": {
                "products": products,
                "summary": {
                    "total_products": len(products),
                    "total_revenue": round(total_revenue, 2),
                    "total_margin": round(total_margin, 2),
                    "avg_margin_percent": round(avg_margin_pct, 2)
                }
            }
        }
    except Exception as e:
        logger.error(f"Failed to get product metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/products/{product_id}/segments")
async def get_product_by_segment(product_id: str) -> Dict[str, Any]:
    """
    Get product performance breakdown by customer segment
    """
    try:
        from src.db.postgresql_client import PostgreSQLClient
        pg_client = PostgreSQLClient()
        
        segments = pg_client.get_product_by_segment(product_id)
        
        return {
            "success": True,
            "data": {
                "product_id": product_id,
                "segments": segments,
                "total_customers": sum(s['customer_count'] for s in segments),
                "total_revenue": sum(s['revenue'] for s in segments)
            }
        }
    except Exception as e:
        logger.error(f"Failed to get product by segment: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/products/{product_id}/trends")
async def get_product_trends(
    product_id: str,
    months: int = Query(12, ge=1, le=36, description="Number of months")
) -> Dict[str, Any]:
    """
    Get product sales trends over time
    """
    try:
        from src.db.postgresql_client import PostgreSQLClient
        pg_client = PostgreSQLClient()
        
        trends = pg_client.get_product_trends(product_id, months)
        
        return {
            "success": True,
            "data": {
                "product_id": product_id,
                "trends": trends,
                "months": months
            }
        }
    except Exception as e:
        logger.error(f"Failed to get product trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Financial Analytics Endpoints

@router.get("/financial/summary")
async def get_financial_summary() -> Dict[str, Any]:
    """
    Get overall financial summary and KPIs
    """
    try:
        from src.db.postgresql_client import PostgreSQLClient
        pg_client = PostgreSQLClient()
        
        summary = pg_client.get_financial_summary()
        
        return {
            "success": True,
            "data": summary
        }
    except Exception as e:
        logger.error(f"Failed to get financial summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/financial/trends")
async def get_financial_trends(
    months: int = Query(24, ge=1, le=60, description="Number of months")
) -> Dict[str, Any]:
    """
    Get financial trends over time
    """
    try:
        from src.db.postgresql_client import PostgreSQLClient
        pg_client = PostgreSQLClient()
        
        trends = pg_client.get_financial_trends(months)
        
        return {
            "success": True,
            "data": {
                "trends": trends,
                "months": months
            }
        }
    except Exception as e:
        logger.error(f"Failed to get financial trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/financial/profitability")
async def get_profitability_analysis() -> Dict[str, Any]:
    """
    Get profitability analysis by segment
    """
    try:
        from src.db.postgresql_client import PostgreSQLClient
        pg_client = PostgreSQLClient()
        
        profitability = pg_client.get_profitability_by_segment()
        
        return {
            "success": True,
            "data": {
                "segments": profitability,
                "total_profit": sum(s['profit'] for s in profitability)
            }
        }
    except Exception as e:
        logger.error(f"Failed to get profitability analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Data Tables Endpoints - Complete table data access

@router.get("/tables/customer-master")
async def get_customer_master_table(
    offset: int = Query(0, ge=0),
    limit: int = Query(1000, ge=1, le=10000),
    search: Optional[str] = Query(None, description="Search term for customer ID"),
    segment: Optional[str] = Query(None, description="Filter by RFM segment"),
    abc_class: Optional[str] = Query(None, description="Filter by ABC class")
) -> Dict[str, Any]:
    """
    Get customer master analysis table with all segmentations
    """
    try:
        from src.db.postgresql_client import PostgreSQLClient
        pg_client = PostgreSQLClient()
        
        data = pg_client.get_customer_master_data(
            offset=offset,
            limit=limit,
            search=search,
            segment=segment,
            abc_class=abc_class
        )
        
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        logger.error(f"Failed to get customer master data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tables/transactions")
async def get_transaction_table(
    offset: int = Query(0, ge=0),
    limit: int = Query(1000, ge=1, le=10000),
    customer_id: Optional[str] = Query(None, description="Filter by customer ID"),
    product: Optional[str] = Query(None, description="Filter by product"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
) -> Dict[str, Any]:
    """
    Get transaction data enriched with customer segmentation
    """
    try:
        from src.db.postgresql_client import PostgreSQLClient
        pg_client = PostgreSQLClient()
        
        data = pg_client.get_transaction_data(
            offset=offset,
            limit=limit,
            customer_id=customer_id,
            product=product,
            start_date=start_date,
            end_date=end_date
        )
        
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        logger.error(f"Failed to get transaction data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tables/segmentation-performance")
async def get_segmentation_performance_table() -> Dict[str, Any]:
    """
    Get segmentation performance summary across all segmentation methods
    """
    try:
        from src.db.postgresql_client import PostgreSQLClient
        pg_client = PostgreSQLClient()
        
        data = pg_client.get_segmentation_performance()
        
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        logger.error(f"Failed to get segmentation performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tables/cohort-retention")
async def get_cohort_retention_table() -> Dict[str, Any]:
    """
    Get cohort retention rates by acquisition cohort over time
    """
    try:
        from src.db.postgresql_client import PostgreSQLClient
        pg_client = PostgreSQLClient()
        
        data = pg_client.get_cohort_retention_data()
        
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        logger.error(f"Failed to get cohort retention data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cohort-insights")
async def get_cohort_insights(
    refresh: bool = Query(False, description="Force refresh cache")
) -> Dict[str, Any]:
    """
    Get AI-generated insights from cohort retention data using Claude
    
    Returns research analyst-level insights about retention patterns
    """
    try:
        # Get cache instance
        cache = await get_ai_insights_cache()
        
        # Check cache first unless refresh is requested
        if not refresh:
            cached_insights = await cache.get_cohort_insights()
            if cached_insights:
                logger.info("Returning cached cohort insights")
                # Mark as cached when returning from cache
                cached_insights["cached"] = True
                return cached_insights
        
        # Generate new insights
        logger.info("Generating new cohort insights...")
        
        from src.db.postgresql_client import PostgreSQLClient
        from src.core.llm_client import LLMClient
        import json
        
        pg_client = PostgreSQLClient()
        llm_client = LLMClient()
        
        # Get cohort data
        cohort_data = pg_client.get_cohort_retention_data()
        revenue_data = pg_client.get_cohort_revenue_data()
        
        # Convert dates to strings for JSON serialization
        def serialize_dates(obj):
            if isinstance(obj, dict):
                return {k: serialize_dates(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [serialize_dates(item) for item in obj]
            elif hasattr(obj, 'isoformat'):
                return obj.isoformat()
            elif hasattr(obj, 'strftime'):
                return obj.strftime('%Y-%m-%d')
            else:
                return obj
        
        # Prepare data for LLM analysis - summarize to avoid token limits
        serialized_cohort_data = serialize_dates(cohort_data)
        serialized_revenue_data = serialize_dates(revenue_data)
        
        # Summarize cohort data for analysis
        cohort_summary = []
        if serialized_cohort_data.get("records"):
            for cohort in serialized_cohort_data["records"][:12]:  # Last 12 cohorts
                retention_rates = cohort.get("retention", {})
                cohort_summary.append({
                    "cohort": cohort["cohort"],
                    "size": cohort.get("size", 0),
                    "month_1_retention": retention_rates.get("month_1", 0),
                    "month_3_retention": retention_rates.get("month_3", 0),
                    "month_6_retention": retention_rates.get("month_6", 0),
                    "month_12_retention": retention_rates.get("month_12", 0)
                })
        
        # Summarize revenue data
        revenue_summary = []
        if serialized_revenue_data.get("records"):
            for cohort in serialized_revenue_data["records"][:12]:  # Last 12 cohorts
                revenue_evolution = cohort.get("revenue_evolution", {})
                revenue_summary.append({
                    "cohort": cohort["cohort"],
                    "month_1_revenue": revenue_evolution.get("month_1", 0),
                    "month_3_revenue": revenue_evolution.get("month_3", 0),
                    "month_6_revenue": revenue_evolution.get("month_6", 0),
                    "month_12_revenue": revenue_evolution.get("month_12", 0)
                })
        
        # Calculate key metrics
        retention_metrics = {
            "avg_month_1_retention": sum(c["month_1_retention"] for c in cohort_summary) / len(cohort_summary) if cohort_summary else 0,
            "avg_month_3_retention": sum(c["month_3_retention"] for c in cohort_summary) / len(cohort_summary) if cohort_summary else 0,
            "avg_month_6_retention": sum(c["month_6_retention"] for c in cohort_summary) / len(cohort_summary) if cohort_summary else 0,
            "total_cohorts": len(cohort_summary),
            "date_range": f"{cohort_summary[-1]['cohort']} to {cohort_summary[0]['cohort']}" if cohort_summary else "No data"
        }
        
        # Create prompt for Claude with summarized data
        prompt = f"""You are a senior research analyst specializing in customer retention and cohort analysis. 
        Analyze the following summarized cohort retention and revenue data and provide professional insights.

        Key Metrics:
        - Total cohorts analyzed: {retention_metrics['total_cohorts']}
        - Date range: {retention_metrics['date_range']}
        - Average Month 1 Retention: {retention_metrics['avg_month_1_retention']:.1%}
        - Average Month 3 Retention: {retention_metrics['avg_month_3_retention']:.1%}
        - Average Month 6 Retention: {retention_metrics['avg_month_6_retention']:.1%}

        Cohort Retention Summary (Last 12 cohorts):
        {json.dumps(cohort_summary, indent=2)}

        Cohort Revenue Evolution Summary (Last 12 cohorts):
        {json.dumps(revenue_summary, indent=2)}

        Please provide a comprehensive analysis covering:
        1. Key Retention Patterns: Identify trends, anomalies, and notable patterns
        2. Revenue Insights: How revenue evolves by cohort over time
        3. Cohort Quality: Which cohorts are performing best/worst and why
        4. Risk Identification: Concerning trends that need attention
        5. Actionable Recommendations: Specific actions to improve retention
        6. Benchmarking: How these metrics compare to industry standards

        Format your response as a JSON object with the following structure:
        {{
            "executive_summary": "2-3 sentence high-level summary",
            "key_findings": [
                {{"finding": "...", "impact": "high/medium/low", "metric": "specific number/percentage"}}
            ],
            "retention_analysis": {{
                "overall_health": "strong/moderate/weak",
                "trend": "improving/stable/declining",
                "details": "..."
            }},
            "revenue_analysis": {{
                "trend": "growing/stable/declining", 
                "key_insight": "...",
                "ltv_projection": "..."
            }},
            "risk_factors": [
                {{"risk": "...", "severity": "high/medium/low", "affected_cohorts": []}}
            ],
            "recommendations": [
                {{"action": "...", "priority": "high/medium/low", "expected_impact": "..."}}
            ],
            "notable_cohorts": {{
                "best_performing": {{"cohort": "...", "reason": "..."}},
                "worst_performing": {{"cohort": "...", "reason": "..."}},
                "most_improved": {{"cohort": "...", "reason": "..."}}
            }}
        }}"""
        
        # Get insights from Claude
        response = llm_client.client.messages.create(
            model=llm_client.model,
            max_tokens=2000,
            temperature=0.3,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        
        # Parse the response
        try:
            response_text = response.content[0].text.strip()
            
            # Handle markdown code blocks
            if '```json' in response_text:
                # Extract the JSON between the first { and last }
                json_start = response_text.find('{')
                json_end = response_text.rfind('}') + 1
                if json_start != -1 and json_end > json_start:
                    response_text = response_text[json_start:json_end]
            elif '```' in response_text:
                # Remove any code block markers
                response_text = response_text.replace('```', '').strip()
            
            # Clean up the response text
            response_text = response_text.strip()
            
            # Try to parse as JSON
            insights = json.loads(response_text)
            
            # Validate the structure has the expected keys
            required_keys = ["executive_summary", "key_findings", "retention_analysis", 
                           "revenue_analysis", "risk_factors", "recommendations", "notable_cohorts"]
            
            if not all(key in insights for key in required_keys):
                logger.warning("Parsed JSON missing required keys, using default structure")
                raise ValueError("Missing required keys in parsed JSON")
                
        except Exception as e:
            logger.warning(f"Failed to parse cohort insights JSON: {e}")
            logger.debug(f"Raw response: {response.content[0].text[:500]}...")
            
            # If JSON parsing fails, create structured response from text
            insights = {
                "executive_summary": "Analysis completed. See details below.",
                "key_findings": [{
                    "finding": "Unable to parse detailed insights. Raw analysis provided.",
                    "impact": "medium",
                    "metric": "N/A"
                }],
                "retention_analysis": {
                    "overall_health": "moderate",
                    "trend": "stable", 
                    "details": "Analysis indicates moderate retention patterns. See raw data for details."
                },
                "revenue_analysis": {
                    "trend": "stable", 
                    "key_insight": "Revenue analysis completed. Review raw data for specifics.",
                    "ltv_projection": "Calculation pending"
                },
                "risk_factors": [{
                    "risk": "Data parsing error - manual review recommended",
                    "severity": "low",
                    "affected_cohorts": []
                }],
                "recommendations": [{
                    "action": "Review cohort data manually for detailed insights",
                    "priority": "medium",
                    "expected_impact": "Better understanding of retention patterns"
                }],
                "notable_cohorts": {
                    "best_performing": {"cohort": "TBD", "reason": "Manual review required"},
                    "worst_performing": {"cohort": "TBD", "reason": "Manual review required"},
                    "most_improved": {"cohort": "TBD", "reason": "Manual review required"}
                }
            }
        
        result = {
            "success": True,
            "data": {
                "insights": insights,
                "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "cohort_count": retention_metrics["total_cohorts"],
                "date_range": retention_metrics["date_range"]
            },
            "cached": False
        }
        
        # Cache the result
        await cache.set_cohort_insights(result)
        logger.info("Cohort insights generated and cached")
        
        return result
    except Exception as e:
        logger.error(f"Failed to generate cohort insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tables/cohort-revenue")
async def get_cohort_revenue_table() -> Dict[str, Any]:
    """
    Get average revenue per customer by cohort and time period
    """
    try:
        from src.db.postgresql_client import PostgreSQLClient
        pg_client = PostgreSQLClient()
        
        data = pg_client.get_cohort_revenue_data()
        
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        logger.error(f"Failed to get cohort revenue data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tables/time-series-performance")
async def get_time_series_performance_table(
    segment: Optional[str] = Query(None, description="Filter by customer segment")
) -> Dict[str, Any]:
    """
    Get monthly performance trends by customer segment
    """
    try:
        from src.db.postgresql_client import PostgreSQLClient
        pg_client = PostgreSQLClient()
        
        data = pg_client.get_time_series_performance(segment=segment)
        
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        logger.error(f"Failed to get time series performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tables/product-customer-matrix")
async def get_product_customer_matrix_table(
    top_products: int = Query(50, ge=10, le=200, description="Number of top products"),
    segment: Optional[str] = Query(None, description="Filter by customer segment")
) -> Dict[str, Any]:
    """
    Get product performance across different customer segments
    """
    try:
        from src.db.postgresql_client import PostgreSQLClient
        pg_client = PostgreSQLClient()
        
        data = pg_client.get_product_customer_matrix(
            top_products=top_products,
            segment=segment
        )
        
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        logger.error(f"Failed to get product-customer matrix: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Executive Insights Endpoints

@router.get("/cache/stats")
async def get_cache_stats() -> Dict[str, Any]:
    """Get AI insights cache statistics"""
    try:
        cache = await get_ai_insights_cache()
        stats = await cache.get_cache_stats()
        
        return {
            "success": True,
            "data": stats
        }
    except Exception as e:
        logger.error(f"Failed to get cache stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cache/clear")
async def clear_cache(
    cache_type: Optional[str] = Query(None, description="Type of cache to clear: performance, recommendations, cohort")
) -> Dict[str, Any]:
    """Clear AI insights cache"""
    try:
        cache = await get_ai_insights_cache()
        await cache.clear_cache(cache_type=cache_type)
        
        return {
            "success": True,
            "message": f"Cache cleared for {cache_type if cache_type else 'all types'}"
        }
    except Exception as e:
        logger.error(f"Failed to clear cache: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/test-decimal")
async def test_decimal():
    """Test endpoint to debug Decimal serialization"""
    from decimal import Decimal
    test_data = {
        "decimal_value": Decimal("123.45"),
        "float_value": 123.45,
        "string_value": "test"
    }
    return serialize_for_json(test_data)

@router.get("/performance-insights")
async def get_performance_insights(
    context: Optional[str] = Query(None, description="Additional context for analysis"),
    refresh: bool = Query(False, description="Force refresh cache")
):
    """
    Get AI-generated performance insights for executives
    
    Returns comprehensive analysis suitable for CEO/CFO review
    """
    try:
        # Get cache instance
        cache = await get_ai_insights_cache()
        
        # Check cache first unless refresh is requested
        if not refresh:
            cached_insights = await cache.get_performance_insights(context=context)
            if cached_insights:
                logger.info("Returning cached performance insights")
                return {
                    "success": True,
                    "data": serialize_for_json(cached_insights),
                    "cached": True
                }
        
        # Generate new insights
        logger.info("Generating new performance insights...")
        try:
            insights = executive_insights_service.generate_performance_insights(context=context)
            logger.info(f"Insights type: {type(insights)}")
        except Exception as e:
            logger.error(f"Error in generate_performance_insights: {e}", exc_info=True)
            raise
        
        # Cache the new insights
        await cache.set_performance_insights(insights, context=context)
        
        logger.info("Insights generated and cached")
        
        # Serialize all data before returning
        return {
            "success": True,
            "data": serialize_for_json(insights),
            "cached": False
        }
    except Exception as e:
        logger.error(f"Failed to generate performance insights: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations")
async def get_recommendations(
    focus_area: Optional[str] = Query(None, description="Specific area to focus recommendations on"),
    refresh: bool = Query(False, description="Force refresh cache")
):
    """
    Get AI-generated strategic recommendations
    
    Returns actionable recommendations with implementation steps
    """
    try:
        # Get cache instance
        cache = await get_ai_insights_cache()
        
        # Check cache first unless refresh is requested
        if not refresh:
            cached_recommendations = await cache.get_recommendations(focus_area=focus_area)
            if cached_recommendations:
                logger.info("Returning cached recommendations")
                return {
                    "success": True,
                    "data": serialize_for_json(cached_recommendations),
                    "cached": True
                }
        
        # Generate new recommendations
        logger.info("Generating new recommendations...")
        try:
            recommendations = executive_insights_service.generate_recommendations(focus_area=focus_area)
            logger.info(f"Generated recommendations type: {type(recommendations)}")
            logger.info(f"Recommendations keys: {recommendations.keys() if isinstance(recommendations, dict) else 'Not a dict'}")
        except Exception as e:
            logger.error(f"Error in generate_recommendations: {e}", exc_info=True)
            # Return a properly serialized error response
            return JSONResponse(
                status_code=500,
                content={"detail": f"Failed to generate recommendations: {str(e)}"}
            )
        
        # Cache the new recommendations
        try:
            await cache.set_recommendations(recommendations, focus_area=focus_area)
        except Exception as e:
            logger.error(f"Error caching recommendations: {e}", exc_info=True)
        
        logger.info("Recommendations generated and cached")
        
        # Serialize and return
        return {
            "success": True,
            "data": serialize_for_json(recommendations),
            "cached": False
        }
    except Exception as e:
        logger.error(f"Failed to generate recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/insights/follow-up")
async def handle_follow_up_question(request: Dict[str, Any]):
    """
    Handle follow-up questions on insights or recommendations
    
    Request body should contain:
    - question: The follow-up question
    - context: Previous insights or recommendations context
    """
    try:
        question = request.get("question")
        context = request.get("context", {})
        
        if not question:
            raise HTTPException(status_code=400, detail="Question is required")
        
        response = executive_insights_service.handle_follow_up_question(
            question=question,
            context=context
        )
        
        # Serialize and return
        return {
            "success": True,
            "data": serialize_for_json(response)
        }
    except Exception as e:
        logger.error(f"Failed to handle follow-up question: {e}")
        raise HTTPException(status_code=500, detail=str(e))