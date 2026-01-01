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


@router.post("/seed-demo-data")
async def seed_demo_data():
    """
    Seed the command tower with sample demo data for all AI modules
    """
    import random
    from datetime import timedelta

    sample_tickets = [
        # STOX.AI - Inventory Actions
        {"source_module": "STOX.AI", "ticket_type": "REORDER_TRIGGERED", "title": "Reorder Triggered: SKU-4521", "description": "Safety stock threshold reached for DC Atlanta. Auto-generated reorder for 500 units.", "priority": "High", "status": "Completed"},
        {"source_module": "STOX.AI", "ticket_type": "SAFETY_STOCK_ADJUSTED", "title": "Safety Stock Adjusted: Chicago DC", "description": "Increased safety stock by 15% for seasonal demand pattern detected.", "priority": "Medium", "status": "Completed"},
        {"source_module": "STOX.AI", "ticket_type": "REALLOCATION_EXECUTED", "title": "Reallocation: Dallas → Houston", "description": "Transferred 500 units to prevent stockout in Houston region.", "priority": "High", "status": "Completed"},
        {"source_module": "STOX.AI", "ticket_type": "SHORTAGE_ALERT", "title": "Shortage Alert: West Region", "description": "Projected stockout in 5 days for high-velocity SKU-1156.", "priority": "Critical", "status": "Open"},
        {"source_module": "STOX.AI", "ticket_type": "WORKING_CAPITAL_OPT", "title": "Working Capital Optimized", "description": "Released $125K through inventory optimization across 3 DCs.", "priority": "Medium", "status": "Completed"},
        {"source_module": "STOX.AI", "ticket_type": "MRP_PARAMETER_CHANGE", "title": "MRP Lead Time Updated", "description": "Adjusted supplier lead time from 14 to 21 days for RM-445.", "priority": "Low", "status": "Completed"},
        {"source_module": "STOX.AI", "ticket_type": "STORE_REPLENISHMENT", "title": "Store Replenishment: Store #1842", "description": "Auto-generated replenishment order for 12 SKUs based on sell-through.", "priority": "Medium", "status": "In Progress"},

        # MARGEN.AI - Financial Actions
        {"source_module": "MARGEN.AI", "ticket_type": "MARGIN_ALERT", "title": "Margin Alert: Premium Segment", "description": "Gross margin dropped 3.2% vs last month for premium customer segment.", "priority": "High", "status": "Open"},
        {"source_module": "MARGEN.AI", "ticket_type": "CLV_UPDATED", "title": "CLV Recalculated: Enterprise Accounts", "description": "Updated CLV for 45 enterprise customers based on Q4 transactions.", "priority": "Medium", "status": "Completed"},
        {"source_module": "MARGEN.AI", "ticket_type": "SEGMENT_CHANGE", "title": "Segment Migration: 12 Accounts", "description": "Moved 12 accounts from Growth to At Risk based on RFM analysis.", "priority": "High", "status": "Completed"},
        {"source_module": "MARGEN.AI", "ticket_type": "CHURN_RISK", "title": "Churn Risk: Acme Corp", "description": "High churn probability (78%) detected for Acme Corp. Last order 45 days ago.", "priority": "Critical", "status": "In Progress"},
        {"source_module": "MARGEN.AI", "ticket_type": "REVENUE_FORECAST", "title": "Q2 Revenue Forecast Updated", "description": "Revised forecast: $2.4M (+8% YoY) based on current pipeline.", "priority": "Medium", "status": "Completed"},

        # ORDLY.AI - Order Actions
        {"source_module": "ORDLY.AI", "ticket_type": "ORDER_COMMITTED", "title": "SAP Commit: PO-2025-4521", "description": "Order committed to SAP with 98% match confidence. 45 line items processed.", "priority": "Medium", "status": "Completed"},
        {"source_module": "ORDLY.AI", "ticket_type": "DEMAND_SIGNAL", "title": "EDI 850 Processed: Walmart", "description": "Processed 45 line items from EDI 850 demand signal.", "priority": "High", "status": "Completed"},
        {"source_module": "ORDLY.AI", "ticket_type": "NETWORK_OPTIMIZED", "title": "Network Optimization Complete", "description": "Optimized fulfillment across 8 DCs. Estimated savings: $23K.", "priority": "Medium", "status": "Completed"},
        {"source_module": "ORDLY.AI", "ticket_type": "ARBITRATION", "title": "Arbitration: Multi-DC Conflict", "description": "Resolved allocation conflict for SKU-7789 across 3 DCs.", "priority": "High", "status": "In Progress"},
        {"source_module": "ORDLY.AI", "ticket_type": "PROMISE_UPDATE", "title": "Promise Date Updated: Order #8842", "description": "Revised delivery from Jan 15 to Jan 12 based on inventory availability.", "priority": "Low", "status": "Completed"},

        # AXIS.AI - Forecast Actions
        {"source_module": "AXIS.AI", "ticket_type": "FORECAST_UPDATED", "title": "Demand Forecast: Q1 2025", "description": "ML model updated forecast with 94% accuracy. Demand up 12% vs prior.", "priority": "Medium", "status": "Completed"},
        {"source_module": "AXIS.AI", "ticket_type": "SCENARIO_CREATED", "title": "Scenario: 10% Demand Surge", "description": "Created what-if scenario for supply planning with 10% demand increase.", "priority": "Low", "status": "Completed"},
        {"source_module": "AXIS.AI", "ticket_type": "BUDGET_ALERT", "title": "Budget Variance Alert", "description": "COGS exceeding budget by 4.2% in West region.", "priority": "High", "status": "Open"},

        # Enterprise Pulse - Agent Actions
        {"source_module": "Enterprise Pulse", "ticket_type": "PULSE_AGENT_EXEC", "title": "Agent: Customer Follow-up", "description": "Automated follow-up email sent to 23 customers with pending quotes.", "priority": "Medium", "status": "Completed"},
        {"source_module": "Enterprise Pulse", "ticket_type": "PULSE_ALERT", "title": "Alert: Quote Expiring", "description": "5 quotes expiring in next 48 hours. Total value: $145K.", "priority": "High", "status": "Open"},
        {"source_module": "Enterprise Pulse", "ticket_type": "PULSE_CONFIG", "title": "Config: New Alert Rule", "description": "Created new alert rule for margin below threshold notifications.", "priority": "Low", "status": "Completed"},
    ]

    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Clear existing demo data (optional - comment out if you want to append)
        cursor.execute("DELETE FROM command_tower_tickets WHERE ticket_id > 0")

        created_count = 0
        for ticket_data in sample_tickets:
            # Randomize created_at within last 72 hours
            hours_ago = random.randint(1, 72)
            created_at = datetime.now() - timedelta(hours=hours_ago)

            # Set completed_at for completed tickets
            completed_at = None
            if ticket_data["status"] == "Completed":
                completed_at = created_at + timedelta(hours=random.randint(1, 24))

            cursor.execute(
                """
                INSERT INTO command_tower_tickets
                (ticket_type, status, priority, source_module, source_tile, title, description, user_name, metadata, created_at, completed_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s)
                """,
                (
                    ticket_data["ticket_type"],
                    ticket_data["status"],
                    ticket_data.get("priority", "Medium"),
                    ticket_data["source_module"],
                    ticket_data.get("source_tile", "Command Center"),
                    ticket_data["title"],
                    ticket_data["description"],
                    random.choice(["System", "AI Agent", "John Mitchell", "Sarah Chen", "David Kim"]),
                    json.dumps({"demo": True, "seeded_at": datetime.now().isoformat()}),
                    created_at,
                    completed_at
                )
            )
            created_count += 1

        conn.commit()
        cursor.close()
        conn.close()

        return {
            "success": True,
            "message": f"Seeded {created_count} demo tickets successfully",
            "count": created_count
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error seeding demo data: {str(e)}")


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
