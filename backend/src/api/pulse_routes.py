"""
FastAPI routes for Enterprise Pulse
Proactive agents that execute queries to ensure business is not impacted
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import structlog
from ..core.pulse_monitor_service import PulseMonitorService

logger = structlog.get_logger()
router = APIRouter(prefix="/api/v1/pulse", tags=["enterprise-pulse"])

# Initialize service
pulse_service = PulseMonitorService()


# Request/Response Models
class CreateMonitorRequest(BaseModel):
    user_id: str
    natural_language: str
    name: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class SaveMonitorRequest(BaseModel):
    user_id: str
    name: str
    description: Optional[str] = None
    natural_language_query: str
    sql_query: str
    data_source: str
    alert_condition: Optional[str] = None
    severity: str = 'medium'
    frequency: str = 'daily'
    enabled: bool = True


class RefineMonitorRequest(BaseModel):
    feedback: str


class MonitorResponse(BaseModel):
    monitor_id: str
    name: str
    natural_language_query: str
    sql_query: str
    data_source: str
    preview_data: List[Dict[str, Any]]
    suggested_conditions: Dict[str, Any]
    suggested_frequency: str
    suggested_severity: str


class AlertFeedbackRequest(BaseModel):
    feedback: str  # 'true_positive' or 'false_positive'
    notes: Optional[str] = None


class UpdateMonitorRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    alert_condition: Optional[str] = None
    severity: Optional[str] = None
    frequency: Optional[str] = None
    enabled: Optional[bool] = None
    notification_config: Optional[Dict[str, bool]] = None
    notification_recipients: Optional[List[Dict[str, str]]] = None


@router.post("/monitors/create")
async def create_monitor(request: CreateMonitorRequest):
    """
    Step 1: Create proactive agent from natural language
    Agent will execute on schedule to ensure business is not impacted
    Returns generated SQL, preview data, and suggestions
    """
    try:
        result = await pulse_service.create_monitor_from_nl(
            user_id=request.user_id,
            natural_language=request.natural_language,
            name=request.name,
            user_context=request.context
        )

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        logger.error(f"Error creating monitor: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create monitor: {str(e)}"
        )


@router.post("/monitors/save")
async def save_monitor(request: SaveMonitorRequest):
    """
    Step 2: Deploy proactive agent after user review
    Agent will execute on configured schedule to ensure business is not impacted
    """
    try:
        monitor_config = request.dict()
        monitor_id = await pulse_service.save_monitor(monitor_config)

        return {
            "success": True,
            "monitor_id": monitor_id,
            "message": "Monitor created successfully"
        }

    except Exception as e:
        logger.error(f"Error saving monitor: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save monitor: {str(e)}"
        )


@router.get("/monitors")
async def list_monitors(
    user_id: str = Query(..., description="User ID"),
    include_disabled: bool = Query(False, description="Include disabled agents")
):
    """
    Get all proactive agents for a user
    """
    try:
        monitors = await pulse_service.get_user_monitors(
            user_id=user_id,
            include_disabled=include_disabled
        )

        return {
            "success": True,
            "monitors": monitors,
            "total": len(monitors)
        }

    except Exception as e:
        logger.error(f"Error listing monitors: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list monitors: {str(e)}"
        )


@router.get("/monitors/{monitor_id}")
async def get_monitor(monitor_id: str):
    """
    Get monitor details by ID
    """
    try:
        monitor = pulse_service._get_monitor(monitor_id)

        if not monitor:
            raise HTTPException(status_code=404, detail="Monitor not found")

        return {
            "success": True,
            "monitor": monitor
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting monitor: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get monitor: {str(e)}"
        )


@router.post("/monitors/{monitor_id}/refine")
async def refine_monitor(monitor_id: str, request: RefineMonitorRequest):
    """
    Refine proactive agent query based on user feedback
    Agent regenerates improved query using LLM to better ensure business is not impacted
    """
    try:
        result = await pulse_service.refine_query_with_feedback(
            monitor_id=monitor_id,
            feedback=request.feedback
        )

        return {
            "success": True,
            "data": result,
            "message": "Monitor query refined successfully"
        }

    except Exception as e:
        logger.error(f"Error refining monitor: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to refine monitor: {str(e)}"
        )


@router.post("/monitors/{monitor_id}/test")
async def test_monitor(monitor_id: str):
    """
    Execute proactive agent immediately (run query and check conditions)
    Tests agent to ensure it will protect business operations
    """
    try:
        result = await pulse_service.execute_monitor(monitor_id)

        return {
            "success": True,
            "data": result,
            "message": "Monitor executed successfully"
        }

    except Exception as e:
        logger.error(f"Error testing monitor: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to test monitor: {str(e)}"
        )


@router.put("/monitors/{monitor_id}")
async def update_monitor(monitor_id: str, request: UpdateMonitorRequest):
    """
    Update monitor configuration including notifications, schedules, and alert settings
    """
    try:
        # Build dynamic update query based on provided fields
        update_fields = []
        params = []

        if request.name is not None:
            update_fields.append("name = %s")
            params.append(request.name)

        if request.description is not None:
            update_fields.append("description = %s")
            params.append(request.description)

        if request.alert_condition is not None:
            update_fields.append("alert_condition = %s")
            params.append(request.alert_condition)

        if request.severity is not None:
            update_fields.append("severity = %s")
            params.append(request.severity)

        if request.frequency is not None:
            update_fields.append("frequency = %s")
            params.append(request.frequency)

        if request.enabled is not None:
            update_fields.append("enabled = %s")
            params.append(request.enabled)

        if request.notification_config is not None:
            import json
            update_fields.append("notification_config = %s")
            params.append(json.dumps(request.notification_config))

        if request.notification_recipients is not None:
            import json
            update_fields.append("notification_recipients = %s")
            params.append(json.dumps(request.notification_recipients))

        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")

        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        params.append(monitor_id)

        query = f"""
        UPDATE pulse_monitors
        SET {', '.join(update_fields)}
        WHERE id = %s
        RETURNING id, name, description, severity, frequency, enabled,
                  notification_config, notification_recipients
        """

        result = pulse_service.pg_client.execute_query(query, tuple(params))

        if not result:
            raise HTTPException(status_code=404, detail="Monitor not found")

        return {
            "success": True,
            "monitor": result[0],
            "message": "Monitor updated successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating monitor: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update monitor: {str(e)}"
        )


@router.put("/monitors/{monitor_id}/toggle")
async def toggle_monitor(monitor_id: str, enabled: bool = Query(...)):
    """
    Enable or disable a monitor
    """
    try:
        query = """
        UPDATE pulse_monitors
        SET enabled = %s, updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
        RETURNING id
        """

        result = pulse_service.pg_client.execute_query(
            query,
            (enabled, monitor_id)
        )

        if not result:
            raise HTTPException(status_code=404, detail="Monitor not found")

        return {
            "success": True,
            "monitor_id": monitor_id,
            "enabled": enabled,
            "message": f"Monitor {'enabled' if enabled else 'disabled'}"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error toggling monitor: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to toggle monitor: {str(e)}"
        )


@router.delete("/monitors/{monitor_id}")
async def delete_monitor(monitor_id: str):
    """
    Delete a monitor (soft delete - just disable it)
    """
    try:
        query = """
        UPDATE pulse_monitors
        SET enabled = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
        RETURNING id
        """

        result = pulse_service.pg_client.execute_query(query, (monitor_id,))

        if not result:
            raise HTTPException(status_code=404, detail="Monitor not found")

        return {
            "success": True,
            "monitor_id": monitor_id,
            "message": "Monitor deleted successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting monitor: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete monitor: {str(e)}"
        )


@router.get("/alerts")
async def get_alerts(
    user_id: str = Query(..., description="User ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, description="Number of alerts to return", ge=1, le=200)
):
    """
    Get recent alerts for user's monitors
    """
    try:
        alerts = await pulse_service.get_recent_alerts(
            user_id=user_id,
            limit=limit,
            status=status
        )

        return {
            "success": True,
            "alerts": alerts,
            "total": len(alerts)
        }

    except Exception as e:
        logger.error(f"Error getting alerts: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get alerts: {str(e)}"
        )


@router.post("/alerts/{alert_id}/feedback")
async def submit_alert_feedback(alert_id: str, request: AlertFeedbackRequest):
    """
    Submit feedback on an alert (true positive / false positive)
    This helps the agent learn and improve
    """
    try:
        # Update alert with feedback
        query = """
        UPDATE pulse_alerts
        SET user_feedback = %s, feedback_notes = %s
        WHERE id = %s
        RETURNING monitor_id
        """

        result = pulse_service.pg_client.execute_query(
            query,
            (request.feedback, request.notes, alert_id)
        )

        if not result:
            raise HTTPException(status_code=404, detail="Alert not found")

        monitor_id = result[0]['monitor_id']

        # Update monitor's true/false positive counters
        if request.feedback == 'true_positive':
            counter_query = """
            UPDATE pulse_monitors
            SET true_positives = true_positives + 1
            WHERE id = %s
            """
        else:  # false_positive
            counter_query = """
            UPDATE pulse_monitors
            SET false_positives = false_positives + 1
            WHERE id = %s
            """

        pulse_service.pg_client.execute_query(counter_query, (monitor_id,))

        return {
            "success": True,
            "alert_id": alert_id,
            "feedback": request.feedback,
            "message": "Feedback recorded successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to submit feedback: {str(e)}"
        )


@router.put("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    """
    Acknowledge an alert
    """
    try:
        query = """
        UPDATE pulse_alerts
        SET status = 'acknowledged',
            acknowledged_at = CURRENT_TIMESTAMP
        WHERE id = %s
        RETURNING id
        """

        result = pulse_service.pg_client.execute_query(query, (alert_id,))

        if not result:
            raise HTTPException(status_code=404, detail="Alert not found")

        return {
            "success": True,
            "alert_id": alert_id,
            "message": "Alert acknowledged"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error acknowledging alert: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to acknowledge alert: {str(e)}"
        )


@router.get("/templates")
async def get_monitor_templates(
    category: Optional[str] = Query(None, description="Filter by category")
):
    """
    Get pre-built monitor templates
    """
    try:
        query = """
        SELECT
            id, name, description, category,
            natural_language_template, sql_template,
            data_source, default_frequency, default_severity,
            suggested_alert_condition, usage_count, avg_rating
        FROM pulse_monitor_templates
        WHERE is_active = true
        """

        params = []
        if category:
            query += " AND category = %s"
            params.append(category)

        query += " ORDER BY category, usage_count DESC"

        templates = pulse_service.pg_client.execute_query(
            query,
            tuple(params) if params else None
        )

        return {
            "success": True,
            "templates": templates,
            "total": len(templates)
        }

    except Exception as e:
        logger.error(f"Error getting templates: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get templates: {str(e)}"
        )


@router.get("/stats")
async def get_pulse_stats(user_id: str = Query(..., description="User ID")):
    """
    Get Enterprise Pulse statistics for a user
    """
    try:
        # Get monitor stats
        monitor_stats_query = """
        SELECT
            COUNT(*) as total_monitors,
            COUNT(*) FILTER (WHERE enabled = true) as active_monitors,
            COUNT(*) FILTER (WHERE enabled = false) as disabled_monitors,
            COUNT(*) FILTER (WHERE frequency = 'real-time') as realtime_monitors,
            COUNT(*) FILTER (WHERE frequency = 'daily') as daily_monitors
        FROM pulse_monitors
        WHERE user_id = %s
        """

        monitor_stats = pulse_service.pg_client.execute_query(
            monitor_stats_query,
            (user_id,)
        )

        # Get alert stats
        alert_stats_query = """
        SELECT
            COUNT(*) as total_alerts,
            COUNT(*) FILTER (WHERE a.status = 'active') as active_alerts,
            COUNT(*) FILTER (WHERE a.severity = 'high') as high_severity_alerts,
            COUNT(*) FILTER (WHERE a.user_feedback = 'true_positive') as true_positives,
            COUNT(*) FILTER (WHERE a.user_feedback = 'false_positive') as false_positives
        FROM pulse_alerts a
        JOIN pulse_monitors m ON a.monitor_id = m.id
        WHERE m.user_id = %s
        """

        alert_stats = pulse_service.pg_client.execute_query(
            alert_stats_query,
            (user_id,)
        )

        return {
            "success": True,
            "monitors": monitor_stats[0] if monitor_stats else {},
            "alerts": alert_stats[0] if alert_stats else {}
        }

    except Exception as e:
        logger.error(f"Error getting pulse stats: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get pulse stats: {str(e)}"
        )
