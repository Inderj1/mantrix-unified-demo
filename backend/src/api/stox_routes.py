"""
FastAPI routes for STOX.AI inventory optimization analytics
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import structlog
from ..core.stox_service import StoxService

logger = structlog.get_logger()
router = APIRouter(prefix="/api/v1/stox", tags=["stox-ai"])

# Initialize service
stox_service = StoxService()


# ========== SHORTAGE DETECTOR ENDPOINTS ==========

@router.get("/shortage-detector/alerts")
async def get_shortage_alerts(
    severity: Optional[str] = Query(None, description="Filter by severity: Critical, High, Medium, Low"),
    limit: int = Query(100, description="Number of results"),
    offset: int = Query(0, description="Pagination offset")
):
    """Get real-time shortage alerts"""
    try:
        result = stox_service.get_shortage_alerts(severity=severity, limit=limit, offset=offset)
        return result
    except Exception as e:
        logger.error(f"Failed to get shortage alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/shortage-detector/predictions")
async def get_stockout_predictions(
    months: int = Query(3, description="Number of months to predict"),
    material_id: Optional[str] = Query(None, description="Filter by material ID")
):
    """Get 3-month stockout predictions"""
    try:
        return stox_service.get_stockout_predictions(months=months, material_id=material_id)
    except Exception as e:
        logger.error(f"Failed to get stockout predictions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/shortage-detector/material-risk")
async def get_material_risk_summary():
    """Get material-level risk summary"""
    try:
        return stox_service.get_material_risk_summary()
    except Exception as e:
        logger.error(f"Failed to get material risk summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== INVENTORY HEATMAP ENDPOINTS ==========

@router.get("/inventory-heatmap/distribution")
async def get_inventory_distribution():
    """Get inventory distribution by plant/location"""
    try:
        return stox_service.get_inventory_distribution()
    except Exception as e:
        logger.error(f"Failed to get inventory distribution: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/inventory-heatmap/location-metrics")
async def get_location_metrics(
    plant: Optional[str] = Query(None, description="Filter by plant/location")
):
    """Get detailed metrics for specific location"""
    try:
        return stox_service.get_location_metrics(plant=plant)
    except Exception as e:
        logger.error(f"Failed to get location metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/inventory-heatmap/plant-performance")
async def get_plant_performance():
    """Get performance comparison S4 vs IBP vs StoxAI by plant"""
    try:
        return stox_service.get_plant_performance()
    except Exception as e:
        logger.error(f"Failed to get plant performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== REALLOCATION OPTIMIZER ENDPOINTS ==========

@router.get("/reallocation-optimizer/opportunities")
async def get_reallocation_opportunities():
    """Get stock reallocation opportunities (excess vs deficit)"""
    try:
        return stox_service.get_reallocation_opportunities()
    except Exception as e:
        logger.error(f"Failed to get reallocation opportunities: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reallocation-optimizer/transfer-recommendations")
async def get_transfer_recommendations(
    material_id: Optional[str] = Query(None, description="Filter by material ID")
):
    """Get specific transfer recommendations with cost/benefit"""
    try:
        return stox_service.get_transfer_recommendations(material_id=material_id)
    except Exception as e:
        logger.error(f"Failed to get transfer recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reallocation-optimizer/lot-size-optimization")
async def get_lot_size_optimization():
    """Get EOQ recommendations from lot size calculations"""
    try:
        return stox_service.get_lot_size_optimization()
    except Exception as e:
        logger.error(f"Failed to get lot size optimization: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== INBOUND RISK MONITOR ENDPOINTS ==========

@router.get("/inbound-risk/vendor-metrics")
async def get_vendor_risk_metrics():
    """Get vendor performance and risk metrics"""
    try:
        return stox_service.get_vendor_risk_metrics()
    except Exception as e:
        logger.error(f"Failed to get vendor risk metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/inbound-risk/supplier-performance")
async def get_supplier_performance(
    vendor: Optional[str] = Query(None, description="Filter by vendor")
):
    """Get detailed supplier performance by SKU"""
    try:
        return stox_service.get_supplier_performance(vendor=vendor)
    except Exception as e:
        logger.error(f"Failed to get supplier performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/inbound-risk/alerts")
async def get_inbound_alerts(
    risk_threshold: float = Query(0.95, description="OTIF% threshold for alerts")
):
    """Get inbound shipment risk alerts"""
    try:
        return stox_service.get_inbound_alerts(risk_threshold=risk_threshold)
    except Exception as e:
        logger.error(f"Failed to get inbound alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== AGING STOCK INTELLIGENCE ENDPOINTS ==========

@router.get("/aging-stock/inventory-analysis")
async def get_aging_inventory():
    """Get aging inventory analysis (high WC + low turnover)"""
    try:
        return stox_service.get_aging_inventory()
    except Exception as e:
        logger.error(f"Failed to get aging inventory: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/aging-stock/obsolescence-risk")
async def get_obsolescence_risk():
    """Get obsolescence risk from annual cost data"""
    try:
        return stox_service.get_obsolescence_risk()
    except Exception as e:
        logger.error(f"Failed to get obsolescence risk: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/aging-stock/clearance-recommendations")
async def get_clearance_recommendations():
    """Get clearance strategy recommendations for slow-moving SKUs"""
    try:
        return stox_service.get_clearance_recommendations()
    except Exception as e:
        logger.error(f"Failed to get clearance recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== DASHBOARD ENDPOINTS ==========

@router.get("/dashboard/enterprise-summary")
async def get_enterprise_summary():
    """Get enterprise-level summary metrics"""
    try:
        summary = stox_service.get_enterprise_summary()
        return summary
    except Exception as e:
        logger.error(f"Failed to get enterprise summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== CONSIGNMENT KIT PROCESS ENDPOINTS ==========

@router.get("/consignment-kit-process")
async def get_consignment_kit_process():
    """Get consignment kit process data and statistics"""
    try:
        return stox_service.get_consignment_kit_process()
    except Exception as e:
        logger.error(f"Failed to get consignment kit process data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "STOX.AI"}


# ========== BIGQUERY ENDPOINTS (Demo Data) ==========

@router.get("/working-capital")
async def get_working_capital(
    plant: Optional[str] = Query(None, description="Filter by plant ID"),
    category: Optional[str] = Query(None, description="Filter by category"),
    abc_class: Optional[str] = Query(None, description="Filter by ABC class (A, B, C)"),
    limit: int = Query(100, description="Number of results"),
    offset: int = Query(0, description="Pagination offset")
):
    """Get working capital baseline data from BigQuery"""
    try:
        return stox_service.get_working_capital_baseline(
            plant=plant, category=category, abc_class=abc_class,
            limit=limit, offset=offset
        )
    except Exception as e:
        logger.error(f"Failed to get working capital: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/inventory-health")
async def get_inventory_health(
    plant: Optional[str] = Query(None, description="Filter by plant ID"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level"),
    limit: int = Query(100, description="Number of results")
):
    """Get inventory health data from BigQuery"""
    try:
        return stox_service.get_inventory_health(
            plant=plant, risk_level=risk_level, limit=limit
        )
    except Exception as e:
        logger.error(f"Failed to get inventory health: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/mrp-parameters")
async def get_mrp_parameters(
    plant: Optional[str] = Query(None, description="Filter by plant ID"),
    abc_class: Optional[str] = Query(None, description="Filter by ABC class"),
    limit: int = Query(100, description="Number of results")
):
    """Get MRP parameter optimization data from BigQuery"""
    try:
        return stox_service.get_mrp_parameters(
            plant=plant, abc_class=abc_class, limit=limit
        )
    except Exception as e:
        logger.error(f"Failed to get MRP parameters: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/lead-times")
async def get_lead_times(
    vendor: Optional[str] = Query(None, description="Filter by vendor name"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level"),
    limit: int = Query(100, description="Number of results")
):
    """Get supplier lead time analytics from BigQuery"""
    try:
        return stox_service.get_supplier_lead_times(
            vendor=vendor, risk_level=risk_level, limit=limit
        )
    except Exception as e:
        logger.error(f"Failed to get lead times: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations")
async def get_recommendations(
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    limit: int = Query(50, description="Number of results")
):
    """Get optimization recommendations from BigQuery"""
    try:
        return stox_service.get_recommendations(
            category=category, status=status, priority=priority, limit=limit
        )
    except Exception as e:
        logger.error(f"Failed to get recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/demand-patterns")
async def get_demand_patterns(
    plant: Optional[str] = Query(None, description="Filter by plant ID"),
    pattern: Optional[str] = Query(None, description="Filter by pattern type"),
    limit: int = Query(100, description="Number of results")
):
    """Get demand pattern intelligence from BigQuery"""
    try:
        return stox_service.get_demand_patterns(
            plant=plant, pattern=pattern, limit=limit
        )
    except Exception as e:
        logger.error(f"Failed to get demand patterns: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cash-release")
async def get_cash_release(
    limit: int = Query(20, description="Number of results")
):
    """Get cash release timeline initiatives from BigQuery"""
    try:
        return stox_service.get_cash_release(limit=limit)
    except Exception as e:
        logger.error(f"Failed to get cash release: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/forecasts")
async def get_forecasts(
    plant: Optional[str] = Query(None, description="Filter by plant ID"),
    pattern: Optional[str] = Query(None, description="Filter by pattern type"),
    limit: int = Query(100, description="Number of results")
):
    """Get forecast data from BigQuery"""
    try:
        return stox_service.get_forecasts(
            plant=plant, pattern=pattern, limit=limit
        )
    except Exception as e:
        logger.error(f"Failed to get forecasts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/exceptions")
async def get_exceptions(
    tile: Optional[str] = Query(None, description="Filter by tile name"),
    priority: Optional[int] = Query(None, description="Filter by priority level"),
    limit: int = Query(20, description="Number of results")
):
    """Get exceptions for Command Center from BigQuery"""
    try:
        return stox_service.get_exceptions(
            tile=tile, priority=priority, limit=limit
        )
    except Exception as e:
        logger.error(f"Failed to get exceptions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ========== BIGQUERY ENDPOINTS (Real Data) ==========

@router.get("/kpis/performance")
async def get_performance_kpis():
    """Get performance KPIs (fill rate, OTIF, cycle time) - REAL DATA"""
    try:
        return stox_service.get_performance_kpis()
    except Exception as e:
        logger.error(f"Failed to get performance KPIs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/kpis/margins")
async def get_margin_analysis(
    plant: Optional[str] = Query(None, description="Filter by plant"),
    limit: int = Query(100, description="Number of results")
):
    """Get margin analysis by plant/material - REAL DATA"""
    try:
        return stox_service.get_margin_analysis(plant=plant, limit=limit)
    except Exception as e:
        logger.error(f"Failed to get margin analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cfo-rollup")
async def get_cfo_rollup():
    """Get CFO rollup dashboard data - REAL DATA"""
    try:
        return stox_service.get_cfo_rollup()
    except Exception as e:
        logger.error(f"Failed to get CFO rollup: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sell-through")
async def get_sell_through():
    """Get sell-through analytics - REAL DATA"""
    try:
        return stox_service.get_sell_through_analytics()
    except Exception as e:
        logger.error(f"Failed to get sell-through analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))
