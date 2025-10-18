"""
Markets.AI API Routes
Endpoints for market intelligence signals and configuration
"""
from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from typing import List, Optional
from datetime import datetime

from ..models.market_signal import (
    MarketSignal,
    MarketSignalCreate,
    MarketSignalUpdate,
    MarketSignalList,
    SignalCategory,
    SeverityLevel,
    CategoryConfig
)
from ..db.market_signals_db import get_market_signals_db
from ..core.market_signal_scheduler import get_market_signal_scheduler

router = APIRouter(prefix="/markets", tags=["Markets.AI"])


@router.get("/signals", response_model=MarketSignalList)
async def get_all_signals(
    category: Optional[str] = Query(None, description="Filter by category"),
    severity: Optional[str] = Query(None, description="Filter by severity level"),
    is_active: bool = Query(True, description="Show only active signals"),
    min_severity_score: Optional[int] = Query(None, description="Minimum severity score (0-100)")
):
    """
    Get all market signals with optional filters
    """
    try:
        db = get_market_signals_db()

        # Build category filter
        categories = None
        if category:
            try:
                categories = [SignalCategory(category)]
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid category: {category}")

        # Get signals from database
        signals = db.get_all_signals(
            active_only=is_active,
            min_severity=min_severity_score,
            categories=categories,
            limit=500
        )

        # Filter by severity level if specified
        if severity:
            severity_upper = severity.upper()
            signals = [s for s in signals if s.severity.value == severity_upper]

        # Calculate summary metrics
        category_counts = {}
        total_impact = 0
        critical_count = 0

        for signal in signals:
            cat = signal.category.value
            category_counts[cat] = category_counts.get(cat, 0) + 1
            total_impact += signal.impactValue or 0
            if signal.severityScore >= 80:
                critical_count += 1

        return MarketSignalList(
            signals=signals,
            total=len(signals),
            categories=category_counts,
            totalImpact=total_impact,
            criticalCount=critical_count
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch signals: {str(e)}")


@router.get("/signals/{signal_id}", response_model=MarketSignal)
async def get_signal_by_id(signal_id: str):
    """
    Get a specific signal by ID
    """
    try:
        db = get_market_signals_db()
        signal = db.get_signal_by_id(signal_id)

        if not signal:
            raise HTTPException(status_code=404, detail=f"Signal {signal_id} not found")

        return signal

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch signal: {str(e)}")


@router.get("/categories/{category}", response_model=MarketSignalList)
async def get_signals_by_category(category: str):
    """
    Get all signals for a specific category
    """
    try:
        # Validate category
        try:
            cat_enum = SignalCategory(category)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid category: {category}")

        db = get_market_signals_db()
        signals = db.get_signals_by_category(cat_enum, active_only=True, limit=100)

        # Calculate metrics
        total_impact = sum(s.impactValue or 0 for s in signals)
        critical_count = sum(1 for s in signals if s.severityScore >= 80)

        return MarketSignalList(
            signals=signals,
            total=len(signals),
            categories={category: len(signals)},
            totalImpact=total_impact,
            criticalCount=critical_count
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch category signals: {str(e)}")


@router.get("/summary")
async def get_summary():
    """
    Get aggregated summary of all market signals
    """
    try:
        db = get_market_signals_db()
        stats = db.get_summary_stats(active_only=True)

        # Add severity distribution
        all_signals = db.get_all_signals(active_only=True, limit=1000)
        severity_distribution = {
            "CRITICAL": sum(1 for s in all_signals if s.severityScore >= 80),
            "HIGH": sum(1 for s in all_signals if 60 <= s.severityScore < 80),
            "MEDIUM": sum(1 for s in all_signals if 40 <= s.severityScore < 60),
            "LOW": sum(1 for s in all_signals if s.severityScore < 40)
        }

        return {
            "totalSignals": stats["total_signals"],
            "totalImpact": stats["total_impact"],
            "criticalCount": stats["critical_count"],
            "activeCategories": stats["active_categories"],
            "categoryBreakdown": stats["categories"],
            "severityDistribution": severity_distribution,
            "lastUpdated": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch summary: {str(e)}")


@router.get("/config", response_model=CategoryConfig)
async def get_category_config(customer_id: Optional[str] = Query(None)):
    """
    Get user's enabled category configuration
    TODO: Integrate with user profile/database
    """
    # For now, return all categories enabled by default
    # In production, this would fetch from user profile
    return CategoryConfig(
        enabled_categories=list(SignalCategory),
        customer_id=customer_id
    )


@router.post("/config", response_model=CategoryConfig)
async def save_category_config(config: CategoryConfig):
    """
    Save user's category configuration
    TODO: Persist to database
    """
    # Validate categories
    for cat in config.enabled_categories:
        try:
            SignalCategory(cat)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid category: {cat}")

    # TODO: Save to database
    # For now, just return the config
    return config


@router.patch("/signals/{signal_id}", response_model=MarketSignal)
async def update_signal(signal_id: str, update: MarketSignalUpdate):
    """
    Update a signal (e.g., dismiss, resolve, change severity)
    """
    try:
        db = get_market_signals_db()

        # Check if signal exists
        existing_signal = db.get_signal_by_id(signal_id)
        if not existing_signal:
            raise HTTPException(status_code=404, detail=f"Signal {signal_id} not found")

        # Apply update
        success = db.update_signal(signal_id, update)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update signal")

        # Return updated signal
        updated_signal = db.get_signal_by_id(signal_id)
        return updated_signal

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update signal: {str(e)}")


@router.post("/signals", response_model=MarketSignal, status_code=201)
async def create_signal(signal: MarketSignalCreate):
    """
    Create a new market signal
    """
    try:
        import uuid

        # Generate ID
        signal_id = f"SIG-{str(uuid.uuid4())[:8].upper()}"

        # Create MarketSignal object
        new_signal = MarketSignal(
            id=signal_id,
            detectedAt=datetime.utcnow(),
            isActive=True,
            **signal.dict()
        )

        # Store in database
        db = get_market_signals_db()
        success = db.insert_signal(new_signal)

        if not success:
            raise HTTPException(status_code=409, detail="Signal with this ID already exists")

        return new_signal

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create signal: {str(e)}")


@router.post("/refresh")
async def force_refresh(
    background_tasks: BackgroundTasks,
    category: Optional[str] = Query(None, description="Specific category to refresh")
):
    """
    Force an immediate refresh of market signals
    """
    try:
        scheduler = get_market_signal_scheduler()

        if category:
            try:
                cat_enum = SignalCategory(category)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid category: {category}")

            # Force refresh in background
            background_tasks.add_task(scheduler.force_refresh, cat_enum)
            return {
                "status": "refresh_scheduled",
                "category": category,
                "message": f"Refresh scheduled for {category}"
            }
        else:
            # Force refresh all
            background_tasks.add_task(scheduler.force_refresh)
            return {
                "status": "refresh_scheduled",
                "category": "all",
                "message": "Refresh scheduled for all categories"
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to schedule refresh: {str(e)}")


@router.get("/scheduler/status")
async def get_scheduler_status():
    """
    Get current scheduler status
    """
    try:
        scheduler = get_market_signal_scheduler()
        return scheduler.get_status()

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get scheduler status: {str(e)}")
