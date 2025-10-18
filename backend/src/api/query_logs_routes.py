"""
Query Logs API routes
"""
from fastapi import APIRouter, HTTPException, Query as QueryParam
from typing import Dict, Any, List, Optional
from datetime import datetime
import structlog
from src.core.query_log_store import get_query_logs, clear_query_logs

logger = structlog.get_logger()
router = APIRouter(tags=["query-logs"])


@router.get("/query-logs")
async def get_query_logs_endpoint(
    limit: int = QueryParam(100, ge=1, le=1000),
    offset: int = QueryParam(0, ge=0),
    mode: Optional[str] = QueryParam(None)
) -> Dict[str, Any]:
    """Get query execution logs."""
    try:
        return get_query_logs(limit=limit, offset=offset, mode=mode)
    except Exception as e:
        logger.error(f"Failed to fetch query logs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/query-logs")
async def clear_query_logs_endpoint() -> Dict[str, str]:
    """Clear all query logs."""
    try:
        clear_query_logs()
        return {"message": "Query logs cleared successfully"}
    except Exception as e:
        logger.error(f"Failed to clear query logs: {e}")
        raise HTTPException(status_code=500, detail=str(e))