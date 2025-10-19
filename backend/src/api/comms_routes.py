"""API routes for COMMS.AI - Email & Communication Intelligence Platform."""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from datetime import date, datetime
import structlog
from src.core.database import execute_query

logger = structlog.get_logger()
router = APIRouter(prefix="/api/v1/comms", tags=["comms"])


# Response Models
class VendorCommunication(BaseModel):
    id: int
    vendor_name: str
    subject: str
    email_body: Optional[str] = None
    email_date: date
    status: str
    priority: str
    sentiment: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class CustomerInquiry(BaseModel):
    id: int
    customer_name: str
    subject: str
    email_body: Optional[str] = None
    email_date: date
    status: str
    response_time: Optional[str] = None
    sentiment: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class OrderValidation(BaseModel):
    id: int
    order_number: str
    customer_name: str
    status: str
    amount: float
    order_date: date
    match_status: str
    created_at: datetime
    updated_at: datetime


class Escalation(BaseModel):
    id: int
    escalation_type: str
    subject: str
    party_name: str
    escalation_date: date
    severity: str
    status: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class StatsResponse(BaseModel):
    total_emails: int
    vendor_emails: int
    customer_inquiries: int
    order_confirmations: int
    escalations: int


# Routes
@router.get("/stats", response_model=StatsResponse)
async def get_stats():
    """Get overall statistics for COMMS.AI dashboard."""
    try:
        # Get counts from each table
        vendor_count_query = "SELECT COUNT(*) as count FROM comms_ai.vendor_communications"
        customer_count_query = "SELECT COUNT(*) as count FROM comms_ai.customer_inquiries"
        order_count_query = "SELECT COUNT(*) as count FROM comms_ai.order_validations"
        escalation_count_query = "SELECT COUNT(*) as count FROM comms_ai.escalations"

        vendor_result = execute_query(vendor_count_query)
        customer_result = execute_query(customer_count_query)
        order_result = execute_query(order_count_query)
        escalation_result = execute_query(escalation_count_query)

        vendor_count = vendor_result[0]['count'] if vendor_result else 0
        customer_count = customer_result[0]['count'] if customer_result else 0
        order_count = order_result[0]['count'] if order_result else 0
        escalation_count = escalation_result[0]['count'] if escalation_result else 0

        return StatsResponse(
            total_emails=vendor_count + customer_count,
            vendor_emails=vendor_count,
            customer_inquiries=customer_count,
            order_confirmations=order_count,
            escalations=escalation_count
        )
    except Exception as e:
        logger.error("Failed to fetch stats", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")


@router.get("/vendor-communications", response_model=List[VendorCommunication])
async def get_vendor_communications(
    limit: int = Query(default=100, le=1000),
    offset: int = Query(default=0, ge=0),
    status: Optional[str] = None,
    priority: Optional[str] = None,
):
    """Get vendor communications with optional filtering."""
    try:
        query = "SELECT * FROM comms_ai.vendor_communications WHERE 1=1"
        params = []

        if status:
            query += f" AND status = ${len(params) + 1}"
            params.append(status)

        if priority:
            query += f" AND priority = ${len(params) + 1}"
            params.append(priority)

        query += f" ORDER BY email_date DESC LIMIT ${len(params) + 1} OFFSET ${len(params) + 2}"
        params.extend([limit, offset])

        # Convert to psycopg2 format (%s instead of $1)
        query = query.replace('$', '%s').replace('%s', '%s')
        for i in range(len(params), 0, -1):
            query = query.replace(f'%s{i}', '%s', 1)

        results = execute_query(query, tuple(params) if params else None)
        return results
    except Exception as e:
        logger.error("Failed to fetch vendor communications", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch vendor communications: {str(e)}")


@router.get("/customer-inquiries", response_model=List[CustomerInquiry])
async def get_customer_inquiries(
    limit: int = Query(default=100, le=1000),
    offset: int = Query(default=0, ge=0),
    status: Optional[str] = None,
):
    """Get customer inquiries with optional filtering."""
    try:
        query = "SELECT * FROM comms_ai.customer_inquiries WHERE 1=1"
        params = []

        if status:
            query += " AND status = %s"
            params.append(status)

        query += " ORDER BY email_date DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])

        results = execute_query(query, tuple(params))
        return results
    except Exception as e:
        logger.error("Failed to fetch customer inquiries", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch customer inquiries: {str(e)}")


@router.get("/order-validations", response_model=List[OrderValidation])
async def get_order_validations(
    limit: int = Query(default=100, le=1000),
    offset: int = Query(default=0, ge=0),
    match_status: Optional[str] = None,
):
    """Get order validations with optional filtering."""
    try:
        query = "SELECT * FROM comms_ai.order_validations WHERE 1=1"
        params = []

        if match_status:
            query += " AND match_status = %s"
            params.append(match_status)

        query += " ORDER BY order_date DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])

        results = execute_query(query, tuple(params))
        return results
    except Exception as e:
        logger.error("Failed to fetch order validations", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch order validations: {str(e)}")


@router.get("/escalations", response_model=List[Escalation])
async def get_escalations(
    limit: int = Query(default=100, le=1000),
    offset: int = Query(default=0, ge=0),
    severity: Optional[str] = None,
    status: Optional[str] = None,
):
    """Get escalations with optional filtering."""
    try:
        query = "SELECT * FROM comms_ai.escalations WHERE 1=1"
        params = []

        if severity:
            query += " AND severity = %s"
            params.append(severity)

        if status:
            query += " AND status = %s"
            params.append(status)

        query += " ORDER BY escalation_date DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])

        results = execute_query(query, tuple(params))
        return results
    except Exception as e:
        logger.error("Failed to fetch escalations", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch escalations: {str(e)}")


@router.get("/health")
async def comms_health():
    """Health check for COMMS.AI service."""
    try:
        # Test database connection
        execute_query("SELECT 1")
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        logger.error("COMMS.AI health check failed", error=str(e))
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }
