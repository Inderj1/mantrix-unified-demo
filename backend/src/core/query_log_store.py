"""
Query log storage - centralized to avoid circular imports
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
import structlog

logger = structlog.get_logger()

# In-memory store for query logs (in production, use database)
query_logs = []
MAX_LOGS = 1000


def log_query_execution(
    query: str,
    sql: str,
    mode: str = "chat",
    execution_id: Optional[str] = None,
    status: str = "completed",
    error: Optional[str] = None,
    tables_used: Optional[List[str]] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    steps: Optional[List[Dict]] = None,
    queries: Optional[List[Dict]] = None,
    result_summary: Optional[str] = None
) -> Dict[str, Any]:
    """Log a query execution."""
    global query_logs
    
    log_entry = {
        "execution_id": execution_id or str(uuid.uuid4()),
        "timestamp": datetime.utcnow().isoformat(),
        "query": query,
        "sql": sql,
        "mode": mode,
        "status": status,
        "error": error,
        "tables_used": tables_used or [],
        "start_time": start_time.isoformat() if start_time else None,
        "end_time": end_time.isoformat() if end_time else None,
        "steps": steps or [],
        "queries": queries or [],
        "result_summary": result_summary
    }
    
    # Add to beginning of list (newest first)
    query_logs.insert(0, log_entry)
    
    # Keep only MAX_LOGS entries
    if len(query_logs) > MAX_LOGS:
        query_logs = query_logs[:MAX_LOGS]
    
    return log_entry


def get_query_logs(limit: int = 100, offset: int = 0, mode: Optional[str] = None) -> Dict[str, Any]:
    """Get query execution logs."""
    # Filter by mode if specified
    filtered_logs = query_logs
    if mode:
        filtered_logs = [log for log in query_logs if log.get("mode") == mode]
    
    # Apply pagination
    start = offset
    end = min(offset + limit, len(filtered_logs))
    
    return {
        "total": len(filtered_logs),
        "offset": offset,
        "limit": limit,
        "logs": filtered_logs[start:end]
    }


def clear_query_logs():
    """Clear all query logs."""
    query_logs.clear()