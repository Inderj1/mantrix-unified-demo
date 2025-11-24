"""
Command Tower API Routes
Handles ticket creation and retrieval for audit/logging across all modules
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import json
import os

router = APIRouter(prefix="/api/v1/command-tower", tags=["command-tower"])

# Database connection settings
DB_CONFIG = {
    "host": os.getenv("POSTGRES_HOST", "localhost"),
    "port": int(os.getenv("POSTGRES_PORT", 5433)),
    "user": os.getenv("POSTGRES_USER", "mantrix"),
    "password": os.getenv("POSTGRES_PASSWORD", "mantrix123"),
    "database": os.getenv("POSTGRES_DATABASE", "mantrix_nexxt"),
}


class CreateTicketRequest(BaseModel):
    ticket_type: str
    status: str = "Open"
    priority: str = "Medium"
    source_module: str
    source_tile: Optional[str] = None
    title: str
    description: Optional[str] = None
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class UpdateTicketRequest(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class TicketResponse(BaseModel):
    success: bool
    ticket: Optional[Dict[str, Any]] = None
    message: Optional[str] = None


class TicketsListResponse(BaseModel):
    success: bool
    tickets: List[Dict[str, Any]]
    total_count: int
    message: Optional[str] = None


def get_db_connection():
    """Create and return a database connection"""
    return psycopg2.connect(**DB_CONFIG)


@router.get("/tickets", response_model=TicketsListResponse)
async def get_tickets(
    ticket_type: Optional[str] = Query(None, description="Filter by ticket type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    source_module: Optional[str] = Query(None, description="Filter by source module"),
    limit: int = Query(100, ge=1, le=500, description="Number of tickets to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
):
    """
    Get tickets with optional filtering
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Build query with filters
        query = """
            SELECT
                ticket_id,
                ticket_type,
                status,
                priority,
                source_module,
                source_tile,
                title,
                description,
                user_id,
                user_name,
                metadata,
                created_at,
                updated_at,
                completed_at
            FROM command_tower_tickets
            WHERE 1=1
        """
        params = []

        if ticket_type:
            query += " AND ticket_type = %s"
            params.append(ticket_type)

        if status:
            query += " AND status = %s"
            params.append(status)

        if priority:
            query += " AND priority = %s"
            params.append(priority)

        if source_module:
            query += " AND source_module = %s"
            params.append(source_module)

        query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])

        cursor.execute(query, params)
        tickets = cursor.fetchall()

        # Get total count
        count_query = "SELECT COUNT(*) as count FROM command_tower_tickets WHERE 1=1"
        count_params = []

        if ticket_type:
            count_query += " AND ticket_type = %s"
            count_params.append(ticket_type)

        if status:
            count_query += " AND status = %s"
            count_params.append(status)

        if priority:
            count_query += " AND priority = %s"
            count_params.append(priority)

        if source_module:
            count_query += " AND source_module = %s"
            count_params.append(source_module)

        cursor.execute(count_query, count_params)
        total_count = cursor.fetchone()["count"]

        cursor.close()
        conn.close()

        # Convert datetime objects to strings
        tickets_list = []
        for ticket in tickets:
            ticket_dict = dict(ticket)
            if ticket_dict.get("created_at"):
                ticket_dict["created_at"] = ticket_dict["created_at"].isoformat()
            if ticket_dict.get("updated_at"):
                ticket_dict["updated_at"] = ticket_dict["updated_at"].isoformat()
            if ticket_dict.get("completed_at"):
                ticket_dict["completed_at"] = ticket_dict["completed_at"].isoformat()
            tickets_list.append(ticket_dict)

        return TicketsListResponse(
            success=True,
            tickets=tickets_list,
            total_count=total_count
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tickets: {str(e)}")


@router.get("/tickets/{ticket_id}", response_model=TicketResponse)
async def get_ticket(ticket_id: int):
    """
    Get a specific ticket by ID
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute(
            """
            SELECT
                ticket_id,
                ticket_type,
                status,
                priority,
                source_module,
                source_tile,
                title,
                description,
                user_id,
                user_name,
                metadata,
                created_at,
                updated_at,
                completed_at
            FROM command_tower_tickets
            WHERE ticket_id = %s
            """,
            (ticket_id,)
        )

        ticket = cursor.fetchone()
        cursor.close()
        conn.close()

        if not ticket:
            return TicketResponse(
                success=False,
                message=f"Ticket {ticket_id} not found"
            )

        # Convert datetime objects to strings
        ticket_dict = dict(ticket)
        if ticket_dict.get("created_at"):
            ticket_dict["created_at"] = ticket_dict["created_at"].isoformat()
        if ticket_dict.get("updated_at"):
            ticket_dict["updated_at"] = ticket_dict["updated_at"].isoformat()
        if ticket_dict.get("completed_at"):
            ticket_dict["completed_at"] = ticket_dict["completed_at"].isoformat()

        return TicketResponse(
            success=True,
            ticket=ticket_dict
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching ticket: {str(e)}")


@router.post("/tickets", response_model=TicketResponse)
async def create_ticket(request: CreateTicketRequest):
    """
    Create a new ticket
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Convert metadata to JSON string if provided
        metadata_json = json.dumps(request.metadata) if request.metadata else None

        cursor.execute(
            """
            INSERT INTO command_tower_tickets
            (ticket_type, status, priority, source_module, source_tile, title, description, user_id, user_name, metadata)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb)
            RETURNING ticket_id, ticket_type, status, priority, source_module, source_tile, title, description, user_id, user_name, metadata, created_at, updated_at, completed_at
            """,
            (
                request.ticket_type,
                request.status,
                request.priority,
                request.source_module,
                request.source_tile,
                request.title,
                request.description,
                request.user_id,
                request.user_name,
                metadata_json
            )
        )

        ticket = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()

        # Convert datetime objects to strings
        ticket_dict = dict(ticket)
        if ticket_dict.get("created_at"):
            ticket_dict["created_at"] = ticket_dict["created_at"].isoformat()
        if ticket_dict.get("updated_at"):
            ticket_dict["updated_at"] = ticket_dict["updated_at"].isoformat()
        if ticket_dict.get("completed_at"):
            ticket_dict["completed_at"] = ticket_dict["completed_at"].isoformat()

        return TicketResponse(
            success=True,
            ticket=ticket_dict,
            message="Ticket created successfully"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating ticket: {str(e)}")


@router.put("/tickets/{ticket_id}", response_model=TicketResponse)
async def update_ticket(ticket_id: int, request: UpdateTicketRequest):
    """
    Update an existing ticket
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Build dynamic update query
        update_fields = []
        params = []

        if request.status is not None:
            update_fields.append("status = %s")
            params.append(request.status)

        if request.priority is not None:
            update_fields.append("priority = %s")
            params.append(request.priority)

        if request.description is not None:
            update_fields.append("description = %s")
            params.append(request.description)

        if request.metadata is not None:
            update_fields.append("metadata = %s::jsonb")
            params.append(json.dumps(request.metadata))

        if not update_fields:
            return TicketResponse(
                success=False,
                message="No fields to update"
            )

        params.append(ticket_id)

        query = f"""
            UPDATE command_tower_tickets
            SET {', '.join(update_fields)}
            WHERE ticket_id = %s
            RETURNING ticket_id, ticket_type, status, priority, source_module, source_tile, title, description, user_id, user_name, metadata, created_at, updated_at, completed_at
        """

        cursor.execute(query, params)
        ticket = cursor.fetchone()
        conn.commit()

        cursor.close()
        conn.close()

        if not ticket:
            return TicketResponse(
                success=False,
                message=f"Ticket {ticket_id} not found"
            )

        # Convert datetime objects to strings
        ticket_dict = dict(ticket)
        if ticket_dict.get("created_at"):
            ticket_dict["created_at"] = ticket_dict["created_at"].isoformat()
        if ticket_dict.get("updated_at"):
            ticket_dict["updated_at"] = ticket_dict["updated_at"].isoformat()
        if ticket_dict.get("completed_at"):
            ticket_dict["completed_at"] = ticket_dict["completed_at"].isoformat()

        return TicketResponse(
            success=True,
            ticket=ticket_dict,
            message="Ticket updated successfully"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating ticket: {str(e)}")


@router.get("/stats")
async def get_stats():
    """
    Get ticket statistics
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Get counts by status
        cursor.execute("""
            SELECT status, COUNT(*) as count
            FROM command_tower_tickets
            GROUP BY status
        """)
        status_counts = {row["status"]: row["count"] for row in cursor.fetchall()}

        # Get counts by priority
        cursor.execute("""
            SELECT priority, COUNT(*) as count
            FROM command_tower_tickets
            GROUP BY priority
        """)
        priority_counts = {row["priority"]: row["count"] for row in cursor.fetchall()}

        # Get counts by module
        cursor.execute("""
            SELECT source_module, COUNT(*) as count
            FROM command_tower_tickets
            GROUP BY source_module
        """)
        module_counts = {row["source_module"]: row["count"] for row in cursor.fetchall()}

        # Get counts by type
        cursor.execute("""
            SELECT ticket_type, COUNT(*) as count
            FROM command_tower_tickets
            GROUP BY ticket_type
        """)
        type_counts = {row["ticket_type"]: row["count"] for row in cursor.fetchall()}

        cursor.close()
        conn.close()

        return {
            "success": True,
            "stats": {
                "by_status": status_counts,
                "by_priority": priority_counts,
                "by_module": module_counts,
                "by_type": type_counts
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")
