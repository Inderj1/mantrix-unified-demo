"""
FastAPI routes for MargenAI analytics - DISABLED VERSION
Returns appropriate messages for unconfigured PostgreSQL
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/v1/margen", tags=["margen-analytics"])


@router.get("/health")
async def health_check():
    """Health check for MargenAI service"""
    return {
        "status": "disabled",
        "service": "MargenAI Analytics",
        "message": "PostgreSQL not configured on this instance",
        "database_connected": False
    }


@router.get("/products/overview")
async def get_products_overview(
    limit: int = Query(default=100, le=500, description="Number of products to return"),
    offset: int = Query(default=0, ge=0, description="Offset for pagination"),
):
    """Get product margin overview - DISABLED"""
    return {
        "products": [],
        "pagination": {
            "total": 0,
            "limit": limit,
            "offset": offset,
            "has_next": False,
            "has_prev": False
        },
        "message": "MargenAI analytics requires PostgreSQL configuration"
    }


@router.get("/summary")
async def get_summary():
    """Get executive summary - DISABLED"""
    return {
        "summary": {
            "total_revenue": 0,
            "total_margin": 0,
            "average_margin_percentage": 0,
            "total_customers": 0,
            "total_products": 0,
            "profitable_products": 0,
            "loss_making_products": 0
        },
        "message": "MargenAI analytics requires PostgreSQL configuration"
    }


@router.get("/segments/analytics")
async def get_segment_analytics():
    """Get customer segment analytics - DISABLED"""
    return {
        "segments": [],
        "summary": {
            "total_segments": 0,
            "highest_value_segment": "N/A",
            "most_profitable_segment": "N/A"
        },
        "message": "MargenAI analytics requires PostgreSQL configuration"
    }


@router.get("/trends/analysis")
async def get_trends_analysis(months_back: int = Query(default=12, ge=1, le=24)):
    """Get trend analysis - DISABLED"""
    return {
        "monthly_trends": [],
        "growth_metrics": {
            "revenue_growth": 0,
            "margin_growth": 0,
            "customer_growth": 0
        },
        "message": "MargenAI analytics requires PostgreSQL configuration"
    }


@router.get("/insights/performance")
async def get_performance_insights():
    """Get performance insights - DISABLED"""
    return {
        "insights": [],
        "recommendations": [],
        "message": "MargenAI analytics requires PostgreSQL configuration"
    }