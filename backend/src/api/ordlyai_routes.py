"""
ORDLY.AI API Routes - Order Intelligence Platform endpoints.

Provides REST endpoints for the 5 ORDLY.AI tile components:
1. SalesOrderPipeline - Pipeline overview
2. CustomerIntentCockpit - Intent analysis
3. SkuBomOptimizer - SKU decisioning
4. OrderValueControlTower - Approval/arbitration
5. SapCommitTrace - SAP commit trace
"""

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import structlog
import csv
import io
import os

from src.core.ordlyai_service import OrdlyAIService
from src.core.ordlyai_static_data import (
    get_order, get_sku_options_for_order, format_margin_waterfall
)

logger = structlog.get_logger()
router = APIRouter(prefix="/api/ordlyai", tags=["ORDLY.AI"])

# Initialize service
service = OrdlyAIService()


# ============ Pipeline Endpoints ============

@router.get("/pipeline")
async def get_pipeline_orders(limit: int = Query(50, ge=1, le=200)):
    """
    Get orders with pipeline stages for SalesOrderPipeline component.
    Returns orders joined with customer, material, and margin data.
    """
    try:
        result = service.get_pipeline_orders(limit=limit)
        return result
    except Exception as e:
        logger.error("Failed to get pipeline orders", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pipeline/stats")
async def get_pipeline_stats():
    """Get summary statistics for the pipeline."""
    try:
        return service.get_pipeline_stats()
    except Exception as e:
        logger.error("Failed to get pipeline stats", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ============ Intent Cockpit Endpoints ============

@router.get("/intent/orders")
async def get_intent_orders(limit: int = Query(20, ge=1, le=100)):
    """
    Get orders in Intent stage for CustomerIntentCockpit component.
    Returns orders with PO reference and extraction confidence.
    """
    try:
        return service.get_intent_orders(limit=limit)
    except Exception as e:
        logger.error("Failed to get intent orders", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/intent/orders/{order_id}/similar")
async def get_similar_orders(order_id: str, limit: int = Query(5, ge=1, le=10)):
    """Get similar historical orders for comparison."""
    try:
        return service.get_similar_orders(order_id, limit=limit)
    except Exception as e:
        logger.error("Failed to get similar orders", error=str(e), order_id=order_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/intent/orders/{order_id}/pdf")
async def get_order_pdf(order_id: str):
    """
    Serve the original PO PDF document for an order.
    Returns the PDF file for display in the frontend viewer.
    """
    try:
        # Clean order ID
        po_number = order_id.replace("ORD-", "").replace("PO-", "").strip()

        # Get PDF path from database
        pdf_info = service.get_order_pdf_path(po_number)
        if not pdf_info or not pdf_info.get("file_path"):
            raise HTTPException(status_code=404, detail=f"PDF not found for order {order_id}")

        file_path = pdf_info["file_path"]

        # Resolve relative path if needed
        if not os.path.isabs(file_path):
            backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            file_path = os.path.normpath(os.path.join(backend_dir, file_path))

        # Verify file exists
        if not os.path.exists(file_path):
            logger.warning("PDF file not found", path=file_path)
            raise HTTPException(status_code=404, detail=f"PDF file not found: {pdf_info.get('file_name', 'unknown')}")

        return FileResponse(
            path=file_path,
            media_type="application/pdf",
            filename=pdf_info.get("file_name", f"{po_number}.pdf"),
            headers={"Content-Disposition": "inline"}  # Display in browser, not download
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get order PDF", error=str(e), order_id=order_id)
        raise HTTPException(status_code=500, detail=str(e))


# ============ SKU Optimizer Endpoints ============

@router.get("/sku-optimizer/orders")
async def get_sku_optimizer_orders(limit: int = Query(20, ge=1, le=100)):
    """
    Get orders in Decisioning stage for SkuBomOptimizer component.
    Returns orders with SKU recommendations and margin analysis.
    """
    try:
        return service.get_sku_optimizer_orders(limit=limit)
    except Exception as e:
        logger.error("Failed to get SKU optimizer orders", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ============ Static SKU Options Endpoint (Consistent Data) ============

@router.get("/sku-optimizer/orders/{order_id}/options")
async def get_static_sku_options(order_id: str):
    """
    Get SKU options with mathematically consistent margin calculations.

    Uses static data to ensure values are consistent across the entire pipeline.
    Margin dollar values = order_value * (margin_pct / 100)
    """
    try:
        # Clean order ID
        po_number = order_id.replace("INT-", "").replace("ORD-", "").replace("PO-", "").strip()

        # Get static order data
        static_order = get_order(po_number)
        if not static_order:
            raise HTTPException(status_code=404, detail=f"Order {order_id} not found")

        financials = static_order["financials"]
        order_value = financials.order_value

        # Get SKU options for this order
        sku_options = get_sku_options_for_order(po_number)

        # Convert to API response format with consistent margin calculations
        options = []
        for i, opt in enumerate(sku_options):
            margin_dollar = opt.get_margin_dollar(order_value)
            options.append({
                "id": f"SKU-{str(i + 1).zfill(3)}",
                "sku": opt.sku,
                "name": opt.name,
                "margin_pct": opt.margin_pct,
                "margin_dollar": margin_dollar,
                "stock_status": "full" if opt.availability == "In Stock" else "partial" if opt.availability == "Partial" else "none",
                "lead_time_days": opt.lead_time_days,
                "plant": opt.plant,
                "plant_name": opt.plant_name,
                "coverage_pct": opt.coverage_pct,
                "is_margin_rec": opt.is_recommended,
                "is_leadtime_rec": opt.is_fastest,
                "is_exact_match": opt.is_exact_match,
                "tags": opt.tags,
                "specs": opt.specs,
            })

        # Get margin waterfall for the base order
        waterfall = format_margin_waterfall(financials)

        return {
            "order_id": order_id,
            "order_value": order_value,
            "sku_options": options,
            "margin_waterfall": waterfall,
            "margin_recommendation": {
                "best_margin_sku": options[0]["sku"] if options else None,
                "best_margin_pct": options[0]["margin_pct"] if options else None,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get static SKU options", error=str(e), order_id=order_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sku-optimizer/orders/{order_id}/waterfall")
async def get_margin_waterfall(order_id: str, sku_index: int = Query(0, ge=0, le=3)):
    """
    Get margin waterfall data for a specific SKU option.

    Returns mathematically consistent cost breakdown:
    - Order Value (100%)
    - Material Cost (-60% of costs)
    - Conversion Cost (-25% of costs)
    - Freight Cost (-15% of costs)
    - Landed Margin (margin %)
    """
    try:
        po_number = order_id.replace("INT-", "").replace("ORD-", "").replace("PO-", "").strip()

        static_order = get_order(po_number)
        if not static_order:
            raise HTTPException(status_code=404, detail=f"Order {order_id} not found")

        base_financials = static_order["financials"]
        order_value = base_financials.order_value

        # Get SKU options and select the specified one
        sku_options = get_sku_options_for_order(po_number)
        if sku_index >= len(sku_options):
            sku_index = 0

        selected_sku = sku_options[sku_index]

        # Calculate waterfall for selected SKU margin
        margin_pct = selected_sku.margin_pct
        margin_dollar = order_value * (margin_pct / 100)
        total_costs = order_value - margin_dollar
        material_cost = total_costs * 0.60
        conversion_cost = total_costs * 0.25
        freight_cost = total_costs * 0.15

        return {
            "order_id": order_id,
            "selected_sku": selected_sku.sku,
            "waterfall": [
                {"label": "Order Value", "value": order_value, "formatted": f"${order_value:,.0f}", "isPositive": True},
                {"label": "Material Cost", "value": -material_cost, "formatted": f"-${material_cost:,.0f}", "isPositive": False},
                {"label": "Conversion Cost", "value": -conversion_cost, "formatted": f"-${conversion_cost:,.0f}", "isPositive": False},
                {"label": "Freight Cost", "value": -freight_cost, "formatted": f"-${freight_cost:,.0f}", "isPositive": False},
                {"label": "Landed Margin", "value": margin_dollar, "formatted": f"${margin_dollar:,.0f}", "pct": margin_pct, "isPositive": True},
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get margin waterfall", error=str(e), order_id=order_id)
        raise HTTPException(status_code=500, detail=str(e))


# ============ Real-time SKU Recommendation Endpoints (ML-powered) ============

from src.core.sku_recommendation_service import get_sku_recommendation_service

# Initialize SKU recommendation service
sku_service = get_sku_recommendation_service()


class SkuRecommendationRequest(BaseModel):
    """Request for SKU recommendations"""
    customer_id: str
    requested_spec: str
    quantity: float
    requested_date: Optional[str] = None
    plant: Optional[str] = None


@router.post("/sku-options")
async def get_sku_options(request: SkuRecommendationRequest):
    """
    Get real-time SKU recommendations with margin and lead time predictions.

    Uses ML models:
    - MarginPredictor (XGBoost) for margin predictions
    - LeadTimeEstimator (rules + SAP data) for delivery estimates

    Returns:
    - Ranked SKU options
    - Margin-optimized recommendation
    - Lead-time-optimized recommendation
    - Trade-off analysis
    """
    try:
        result = sku_service.get_sku_options(
            customer_id=request.customer_id,
            requested_spec=request.requested_spec,
            quantity=request.quantity,
            requested_date=request.requested_date,
            plant=request.plant
        )
        return result
    except Exception as e:
        logger.error("Failed to get SKU options", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sku-options/{order_id}")
async def get_realtime_sku_options_for_order(
    order_id: str,
    limit: int = Query(5, ge=1, le=10)
):
    """
    Get SKU recommendations for an existing order (ML-powered real-time).

    Fetches order details and generates real-time recommendations.
    """
    try:
        # Get order details
        order_details = service.get_sap_order_details(order_id)
        if not order_details:
            raise HTTPException(status_code=404, detail=f"Order {order_id} not found")

        # Extract info from order
        header = {f['code']: f['value'] for f in order_details.get('header', [])}
        partner = {f['code']: f['value'] for f in order_details.get('partner', [])}
        line = {f['code']: f['value'] for f in order_details.get('lineItem', [])}

        customer_id = header.get('KUNNR', partner.get('KUNNR', ''))
        material = line.get('MATNR', '')
        quantity = float(line.get('KWMENG', 1000))

        # Get recommendations
        result = sku_service.get_sku_options(
            customer_id=customer_id,
            requested_spec=material,  # Use current material as spec
            quantity=quantity,
            limit=limit
        )
        result['order_id'] = order_id
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get SKU options for order", error=str(e), order_id=order_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sku-detail/{material_id}")
async def get_sku_detail(
    material_id: str,
    customer_id: str = Query(..., description="SAP customer number"),
    quantity: float = Query(1000, ge=0, description="Order quantity"),
    plant: Optional[str] = None
):
    """
    Get detailed analysis for a specific SKU.

    Returns:
    - Margin breakdown with confidence
    - Lead time breakdown by stage
    - Plant-by-plant comparison
    """
    try:
        result = sku_service.get_sku_detail(
            material_id=material_id,
            customer_id=customer_id,
            quantity=quantity,
            plant=plant
        )
        if result.get('error'):
            raise HTTPException(status_code=404, detail=result['error'])
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get SKU detail", error=str(e), material_id=material_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/lead-time/{material_id}")
async def get_lead_time_estimate(
    material_id: str,
    plant: str = Query(..., description="Plant code"),
    quantity: float = Query(1000, ge=0),
    customer_location: Optional[str] = None
):
    """
    Get detailed lead time estimate for a material-plant combination.

    Returns:
    - Total lead time in days
    - Breakdown by stage (production, QC, packaging, transit)
    - Stock status and coverage
    - Expected delivery date
    """
    try:
        from src.core.lead_time_estimator import get_lead_time_estimator
        estimator = get_lead_time_estimator()

        result = estimator.estimate(
            material_id=material_id,
            plant=plant,
            quantity=quantity,
            customer_location=customer_location
        )
        return result
    except Exception as e:
        logger.error("Failed to get lead time", error=str(e), material_id=material_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/lead-time/{material_id}/all-plants")
async def get_lead_time_all_plants(
    material_id: str,
    quantity: float = Query(1000, ge=0),
    customer_location: Optional[str] = None
):
    """
    Get lead time estimates across all plants for a material.

    Returns plants sorted by lead time (fastest first).
    """
    try:
        from src.core.lead_time_estimator import get_lead_time_estimator
        estimator = get_lead_time_estimator()

        results = estimator.estimate_multiple_plants(
            material_id=material_id,
            quantity=quantity,
            customer_location=customer_location
        )
        return {"material_id": material_id, "plants": results}
    except Exception as e:
        logger.error("Failed to get lead times", error=str(e), material_id=material_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/margin-predict")
async def predict_margin(
    customer_id: str = Query(..., description="SAP customer number"),
    material_id: str = Query(..., description="SAP material number"),
    plant: str = Query("2100", description="Plant code"),
    quantity: float = Query(1000, ge=0),
    unit_price: Optional[float] = None,
    unit_cost: Optional[float] = None
):
    """
    Get ML-powered margin prediction for a customer-material combination.

    Uses XGBoost model trained on historical order data.
    Returns margin percentage with confidence level.
    """
    try:
        from src.core.margin_predictor import get_margin_predictor
        predictor = get_margin_predictor()

        order_value = quantity * (unit_price or 2.50)
        result = predictor.predict(
            customer_id=customer_id,
            material_id=material_id,
            plant=plant,
            quantity=quantity,
            order_value=order_value,
            unit_price=unit_price,
            unit_cost=unit_cost
        )
        return result
    except Exception as e:
        logger.error("Failed to predict margin", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ============ Approval/Arbitration Endpoints ============

@router.get("/approval/orders")
async def get_approval_orders(limit: int = Query(20, ge=1, le=100)):
    """
    Get orders in Arbitration stage for OrderValueControlTower component.
    Returns orders with CLV, credit risk, and segment data.
    """
    try:
        return service.get_approval_orders(limit=limit)
    except Exception as e:
        logger.error("Failed to get approval orders", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/approval/orders/{order_id}/clv")
async def get_customer_clv(order_id: str, customer_id: Optional[str] = None):
    """Get CLV metrics for a specific customer."""
    try:
        # If customer_id not provided, extract from order
        if not customer_id:
            customer_id = order_id  # Fallback
        return service.get_clv_metrics(customer_id)
    except Exception as e:
        logger.error("Failed to get CLV metrics", error=str(e), order_id=order_id)
        raise HTTPException(status_code=500, detail=str(e))


# ============ SAP Commit Trace Endpoints ============

@router.get("/sap-commit/orders")
async def get_sap_commit_orders(limit: int = Query(20, ge=1, le=100)):
    """
    Get orders in Committing/Complete stages for SapCommitTrace component.
    Returns committed orders with SAP document details.
    """
    try:
        return service.get_sap_commit_orders(limit=limit)
    except Exception as e:
        logger.error("Failed to get SAP commit orders", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sap-commit/orders/{order_id}")
async def get_sap_order_details(order_id: str):
    """Get detailed SAP fields for a specific order."""
    try:
        result = service.get_sap_order_details(order_id)
        if not result:
            raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get SAP order details", error=str(e), order_id=order_id)
        raise HTTPException(status_code=500, detail=str(e))


# ============ 4-Step Pipeline Integration Endpoints ============


class IntentProcessRequest(BaseModel):
    """Request for processing a new order intent"""
    po_customer_name: str
    raw_spec_text: Optional[str] = None
    parsed_spec: Optional[Dict[str, Any]] = None
    quantity: float
    quantity_uom: str = "LM"
    requested_date: Optional[str] = None
    selling_price: Optional[float] = None


class MaterialAnalyzeRequest(BaseModel):
    """Request for analyzing materials"""
    matnr_list: List[str]
    quantity: float
    selling_price: Optional[float] = None


@router.post("/intent/process")
async def process_intent(request: IntentProcessRequest):
    """
    Full 4-step processing pipeline for a new order intent.

    Step 1: Match PO customer name to SAP KUNNR
    Step 2: Get customer order history and defaults
    Step 3: Match spec to materials
    Step 4: Analyze materials for cost, stock, lead time

    Returns margin and lead time recommendations.
    """
    try:
        result = await service.process_intent(
            po_customer_name=request.po_customer_name,
            raw_spec_text=request.raw_spec_text,
            parsed_spec=request.parsed_spec,
            quantity=request.quantity,
            quantity_uom=request.quantity_uom,
            requested_date=request.requested_date,
            selling_price=request.selling_price
        )
        return result
    except Exception as e:
        logger.error("Failed to process intent", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/material/analyze")
async def analyze_materials(request: MaterialAnalyzeRequest):
    """
    Analyze materials for cost, availability, and lead time.

    Returns detailed analysis with margin and lead time recommendations.
    """
    try:
        result = await service.analyze_materials(
            matnr_list=request.matnr_list,
            quantity=request.quantity,
            selling_price=request.selling_price
        )
        return result
    except Exception as e:
        logger.error("Failed to analyze materials", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/intent/{intent_id}/recommendations")
async def get_recommendations(intent_id: str):
    """Get margin and lead time recommendations for an intent."""
    try:
        result = await service.get_intent_recommendations(intent_id)
        if not result:
            raise HTTPException(status_code=404, detail=f"Intent {intent_id} not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get recommendations", error=str(e), intent_id=intent_id)
        raise HTTPException(status_code=500, detail=str(e))


# ============ Drilldown Endpoints ============

@router.get("/customer/{kunnr}/history")
async def get_customer_history(
    kunnr: str,
    months: int = Query(12, ge=1, le=36),
    limit: int = Query(50, ge=1, le=200)
):
    """
    Customer drilldown: Get full order history with defaults and spec acceptance.

    Returns:
    - Order history with items
    - Customer defaults (AUART, VKORG, VTWEG, SPART)
    - Frequently ordered materials
    - Spec acceptance history
    """
    try:
        result = await service.get_customer_history(kunnr, months=months, limit=limit)
        if not result or not result.get('kunnr'):
            raise HTTPException(status_code=404, detail=f"Customer {kunnr} not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get customer history", error=str(e), kunnr=kunnr)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/material/{matnr}/plants")
async def get_material_plant_details(
    matnr: str,
    quantity: float = Query(1000, ge=0),
    selling_price: Optional[float] = None
):
    """
    Material drilldown: Get detailed analysis per plant.

    Returns:
    - Cost breakdown per plant
    - Stock levels and coverage
    - Lead time breakdown
    - Best plant recommendations
    """
    try:
        result = await service.get_material_plant_details(
            matnr, quantity, selling_price
        )
        if not result:
            raise HTTPException(status_code=404, detail=f"Material {matnr} not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get material details", error=str(e), matnr=matnr)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/intent/{intent_id}/comparison")
async def get_material_comparison(intent_id: str):
    """
    Comparison drilldown: Side-by-side comparison of all material options.

    Returns:
    - All material options with full analysis
    - Spec match quality
    - Cost and margin comparison
    - Availability and lead time
    - Customer history with each material
    - Trade-off analysis
    """
    try:
        result = await service.get_material_comparison(intent_id)
        if not result:
            raise HTTPException(status_code=404, detail=f"Intent {intent_id} not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get comparison", error=str(e), intent_id=intent_id)
        raise HTTPException(status_code=500, detail=str(e))


# ============ Order Action Endpoints ============

class OrderActionRequest(BaseModel):
    """Request for order actions (approve, hold, escalate, promote)"""
    order_id: str
    action: str  # approve, hold, escalate, promote, reset
    note: Optional[str] = None
    user: Optional[str] = "ORDLY_SYSTEM"


class OrderActionResponse(BaseModel):
    """Response from order action"""
    success: bool
    order_id: str
    action: str
    new_stage: Optional[int] = None
    new_status: Optional[str] = None
    message: str


@router.post("/order/action", response_model=OrderActionResponse)
async def perform_order_action(request: OrderActionRequest):
    """
    Perform an action on an order: approve, hold, escalate, promote, or reset.

    Actions:
    - approve: Move order to next stage (Committing/Complete)
    - hold: Set status to 'hold' (keeps current stage)
    - escalate: Set status to 'escalated' (keeps current stage)
    - promote: Move order to next stage with 'processing' status
    - reset: Reset order to initial state (stage 0, processing)
    """
    try:
        result = service.update_order_status(
            order_id=request.order_id,
            action=request.action,
            note=request.note,
            user=request.user
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Failed to perform order action", error=str(e), order_id=request.order_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/order/{order_id}/promote")
async def promote_order(order_id: str, user: str = Query("ORDLY_SYSTEM")):
    """Promote order to next stage."""
    try:
        result = service.update_order_status(order_id, "promote", user=user)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Failed to promote order", error=str(e), order_id=order_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/order/{order_id}/approve")
async def approve_order(order_id: str, user: str = Query("ORDLY_SYSTEM")):
    """Approve order and move to Complete stage."""
    try:
        result = service.update_order_status(order_id, "approve", user=user)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Failed to approve order", error=str(e), order_id=order_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/order/{order_id}/hold")
async def hold_order(order_id: str, note: Optional[str] = None, user: str = Query("ORDLY_SYSTEM")):
    """Put order on hold."""
    try:
        result = service.update_order_status(order_id, "hold", note=note, user=user)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Failed to hold order", error=str(e), order_id=order_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/order/{order_id}/escalate")
async def escalate_order(order_id: str, note: Optional[str] = None, user: str = Query("ORDLY_SYSTEM")):
    """Escalate order for review."""
    try:
        result = service.update_order_status(order_id, "escalate", note=note, user=user)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Failed to escalate order", error=str(e), order_id=order_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/order/{order_id}/reset")
async def reset_order(order_id: str, user: str = Query("ORDLY_SYSTEM")):
    """Reset order to initial stage (Intent)."""
    try:
        result = service.update_order_status(order_id, "reset", user=user)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Failed to reset order", error=str(e), order_id=order_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/order/{order_id}/demote")
async def demote_order(order_id: str, user: str = Query("ORDLY_SYSTEM")):
    """Demote order to previous stage (move back one step)."""
    try:
        result = service.update_order_status(order_id, "demote", user=user)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Failed to demote order", error=str(e), order_id=order_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/orders/reset-all")
async def reset_all_orders(user: str = Query("ORDLY_SYSTEM")):
    """Reset all test orders to initial state for demo."""
    try:
        result = service.reset_all_orders(user=user)
        return result
    except Exception as e:
        logger.error("Failed to reset all orders", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ============ Multi-Line Order Endpoints ============

@router.get("/order/{order_id}/lines")
async def get_order_with_lines(order_id: str):
    """
    Get order with all line items.
    Returns structured order data with lineItems array.
    """
    try:
        result = service.get_order_with_lines(order_id)
        if not result:
            raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get order with lines", error=str(e), order_id=order_id)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/order/{order_id}/line/{line_number}/options")
async def get_line_sku_options(order_id: str, line_number: int):
    """
    Get SKU options for a specific line item.
    Returns options tailored to the line item's material and financials.
    """
    try:
        result = service.get_line_sku_options(order_id, line_number)
        if result.get("error"):
            raise HTTPException(status_code=404, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get line SKU options", error=str(e), order_id=order_id, line_number=line_number)
        raise HTTPException(status_code=500, detail=str(e))


class LineActionRequest(BaseModel):
    """Request for line item actions"""
    action: str  # select_sku, approve, hold, escalate, reject, reset
    selected_sku: Optional[str] = None
    note: Optional[str] = None
    user: Optional[str] = "ORDLY_SYSTEM"


@router.post("/order/{order_id}/line/{line_number}/action")
async def perform_line_action(order_id: str, line_number: int, request: LineActionRequest):
    """
    Perform an action on a specific line item.

    Actions:
    - select_sku: Select SKU for this line (moves to Arbitration)
    - approve: Approve this line
    - hold: Put this line on hold
    - escalate: Escalate this line for review
    - reject: Reject this line
    - reset: Reset this line to pending

    Order status is automatically recalculated after each line action.
    """
    try:
        result = service.update_line_status(
            order_id=order_id,
            line_number=line_number,
            action=request.action,
            selected_sku=request.selected_sku,
            note=request.note,
            user=request.user
        )
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Unknown error"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to perform line action", error=str(e), order_id=order_id, line_number=line_number)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/order/{order_id}/line/{line_number}/select-sku")
async def select_line_sku(order_id: str, line_number: int, sku: str, user: str = Query("ORDLY_SYSTEM")):
    """Select SKU for a specific line item."""
    try:
        result = service.update_line_status(
            order_id=order_id,
            line_number=line_number,
            action="select_sku",
            selected_sku=sku,
            user=user
        )
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Unknown error"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to select line SKU", error=str(e), order_id=order_id, line_number=line_number)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/order/{order_id}/line/{line_number}/approve")
async def approve_line(order_id: str, line_number: int, user: str = Query("ORDLY_SYSTEM")):
    """Approve a specific line item."""
    try:
        result = service.update_line_status(
            order_id=order_id,
            line_number=line_number,
            action="approve",
            user=user
        )
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Unknown error"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to approve line", error=str(e), order_id=order_id, line_number=line_number)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/order/{order_id}/line/{line_number}/hold")
async def hold_line(order_id: str, line_number: int, note: Optional[str] = None, user: str = Query("ORDLY_SYSTEM")):
    """Put a specific line item on hold."""
    try:
        result = service.update_line_status(
            order_id=order_id,
            line_number=line_number,
            action="hold",
            note=note,
            user=user
        )
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Unknown error"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to hold line", error=str(e), order_id=order_id, line_number=line_number)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/order/{order_id}/approve-all-lines")
async def approve_all_lines(order_id: str, user: str = Query("ORDLY_SYSTEM")):
    """
    Approve all pending lines in an order.
    Order can only be committed to SAP when all lines are approved.
    """
    try:
        result = service.approve_all_lines(order_id, user=user)
        return result
    except Exception as e:
        logger.error("Failed to approve all lines", error=str(e), order_id=order_id)
        raise HTTPException(status_code=500, detail=str(e))


# ============ Export Endpoints ============

@router.get("/pipeline/export")
async def export_pipeline_orders():
    """Export pipeline orders as CSV."""
    try:
        data = service.get_pipeline_orders(limit=200)
        orders = data.get('orders', [])

        # Create CSV
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['PO Number', 'Customer', 'Material', 'Quantity', 'UOM', 'Value', 'Margin %', 'Stage', 'Status'])

        for order in orders:
            writer.writerow([
                order.get('id', ''),
                order.get('customer', ''),
                order.get('material', ''),
                order.get('quantity', ''),
                order.get('unit', ''),
                order.get('value', ''),
                order.get('margin', ''),
                order.get('stageLabel', ''),
                order.get('status', '')
            ])

        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=pipeline_orders.csv"}
        )
    except Exception as e:
        logger.error("Failed to export pipeline orders", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/intent/export")
async def export_intent_orders():
    """Export intent orders as CSV."""
    try:
        data = service.get_intent_orders(limit=100)
        orders = data.get('orders', [])

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Order ID', 'Customer', 'Subject', 'Priority', 'Confidence', 'Received'])

        for order in orders:
            writer.writerow([
                order.get('id', ''),
                order.get('customer', ''),
                order.get('subject', ''),
                order.get('priority', ''),
                order.get('confidence', ''),
                order.get('received', '')
            ])

        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=intent_orders.csv"}
        )
    except Exception as e:
        logger.error("Failed to export intent orders", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/approval/export")
async def export_approval_orders():
    """Export approval orders as CSV."""
    try:
        data = service.get_approval_orders(limit=100)
        orders = data.get('orders', [])

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Order ID', 'Customer', 'SKU', 'Order Value', 'Margin %', 'Segment', 'Credit', 'Status', 'CLV'])

        for order in orders:
            writer.writerow([
                order.get('id', ''),
                order.get('customer', ''),
                order.get('sku', ''),
                order.get('orderValue', ''),
                order.get('margin', ''),
                order.get('segment', ''),
                order.get('creditStatus', ''),
                order.get('approvalStatus', ''),
                order.get('clv', '')
            ])

        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=approval_orders.csv"}
        )
    except Exception as e:
        logger.error("Failed to export approval orders", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))
