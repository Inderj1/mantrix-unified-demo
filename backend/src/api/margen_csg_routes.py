"""
FastAPI routes for MARGEN.AI CSG Margin Analytics
Handles surgery/distributor transaction data from csg.xlsx
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import structlog
from datetime import datetime, date
from ..db.postgresql_client import PostgreSQLClient

logger = structlog.get_logger()
router = APIRouter(prefix="/api/v1/margen/csg", tags=["margen-csg"])

# Initialize database client - Updated to use mantrix_nexxt (port 5433)
pg_client = PostgreSQLClient(
    host="localhost",
    port=5433,
    user="mantrix",
    password="mantrix123",
    database="mantrix_nexxt"
)


# Response models
class RevenueMetrics(BaseModel):
    total_revenue: float
    total_cogs: float
    total_gm: float
    gm_percent: float
    transaction_count: int
    avg_gm_percent: float


class RevenueTrend(BaseModel):
    period: str
    revenue: float
    gm: float
    gm_percent: float
    transaction_count: int


# ============================================
# REVENUE ANALYTICS ENDPOINTS
# ============================================

@router.get("/revenue/summary")
async def get_revenue_summary():
    """Get overall revenue and margin summary KPIs"""
    try:
        logger.info("Fetching CSG revenue summary")

        query = """
        SELECT
            COUNT(*) as transaction_count,
            SUM(total_sales) as total_revenue,
            SUM(total_std_cost) as total_cogs,
            SUM(total_gm) as total_gm,
            AVG(gm_percent) as avg_gm_percent,
            CASE
                WHEN SUM(total_sales) > 0 THEN
                    (SUM(total_gm) / SUM(total_sales) * 100)
                ELSE 0
            END as gm_percent,
            MIN(surgery_date) as start_date,
            MAX(surgery_date) as end_date
        FROM fact_transactions
        """

        result = pg_client.execute_query(query)
        data = result[0] if result else {}

        return {
            "summary": {
                "total_revenue": float(data.get('total_revenue', 0) or 0),
                "total_cogs": float(data.get('total_cogs', 0) or 0),
                "total_gm": float(data.get('total_gm', 0) or 0),
                "gm_percent": float(data.get('gm_percent', 0) or 0),
                "avg_gm_percent": float(data.get('avg_gm_percent', 0) or 0),
                "transaction_count": int(data.get('transaction_count', 0) or 0),
                "date_range": {
                    "start": str(data.get('start_date', '')),
                    "end": str(data.get('end_date', ''))
                }
            }
        }

    except Exception as e:
        logger.error(f"Error fetching revenue summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/revenue/by-system")
async def get_revenue_by_system(
    limit: int = Query(default=50, le=200, description="Number of systems to return")
):
    """Get revenue breakdown by product system"""
    try:
        logger.info("Fetching revenue by system")

        # Use materialized view for performance
        query = """
        SELECT
            system,
            transaction_count,
            total_revenue,
            total_cogs,
            total_gross_margin as total_gm,
            avg_gm_percent as gm_percent,
            total_units as quantity,
            avg_price as avg_price_each
        FROM mv_revenue_by_system
        ORDER BY total_revenue DESC
        LIMIT %s
        """

        systems = pg_client.execute_query(query, (limit,))

        return {
            "systems": systems,
            "total_count": len(systems)
        }

    except Exception as e:
        logger.error(f"Error fetching revenue by system: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/revenue/by-distributor")
async def get_revenue_by_distributor(
    limit: int = Query(default=50, le=200, description="Number of distributors to return")
):
    """Get revenue breakdown by distributor"""
    try:
        logger.info("Fetching revenue by distributor")

        # Use materialized view
        query = """
        SELECT
            distributor,
            transaction_count,
            total_revenue,
            total_cogs,
            total_gross_margin as total_gm,
            avg_gm_percent as gm_percent,
            total_units as quantity
        FROM mv_revenue_by_distributor
        ORDER BY total_revenue DESC
        LIMIT %s
        """

        distributors = pg_client.execute_query(query, (limit,))

        return {
            "distributors": distributors,
            "total_count": len(distributors)
        }

    except Exception as e:
        logger.error(f"Error fetching revenue by distributor: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/revenue/by-surgeon")
async def get_revenue_by_surgeon(
    limit: int = Query(default=100, le=500, description="Number of surgeons to return")
):
    """Get revenue breakdown by surgeon"""
    try:
        logger.info("Fetching revenue by surgeon")

        # Use materialized view
        query = """
        SELECT
            surgeon,
            procedure_count as transaction_count,
            total_revenue,
            total_gross_margin as total_gm,
            avg_gm_percent as gm_percent,
            total_units as quantity
        FROM mv_top_surgeons
        ORDER BY total_revenue DESC
        LIMIT %s
        """

        surgeons = pg_client.execute_query(query, (limit,))

        return {
            "surgeons": surgeons,
            "total_count": len(surgeons)
        }

    except Exception as e:
        logger.error(f"Error fetching revenue by surgeon: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/revenue/by-region")
async def get_revenue_by_region():
    """Get revenue breakdown by region"""
    try:
        logger.info("Fetching revenue by region")

        query = """
        SELECT
            region,
            COUNT(*) as transaction_count,
            SUM(total_sales) as total_revenue,
            SUM(total_std_cost) as total_cogs,
            SUM(total_gm) as total_gm,
            AVG(gm_percent) as gm_percent,
            SUM(quantity) as quantity
        FROM fact_transactions
        WHERE region IS NOT NULL
        GROUP BY region
        ORDER BY total_revenue DESC
        """

        regions = pg_client.execute_query(query)

        return {
            "regions": regions,
            "total_count": len(regions)
        }

    except Exception as e:
        logger.error(f"Error fetching revenue by region: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/revenue/by-facility")
async def get_revenue_by_facility(
    limit: int = Query(default=100, le=500, description="Number of facilities to return")
):
    """Get revenue breakdown by facility"""
    try:
        logger.info("Fetching revenue by facility")

        query = """
        SELECT
            facility,
            COUNT(*) as transaction_count,
            SUM(total_sales) as total_revenue,
            SUM(total_std_cost) as total_cogs,
            SUM(total_gm) as total_gm,
            AVG(gm_percent) as gm_percent,
            SUM(quantity) as quantity
        FROM fact_transactions
        WHERE facility IS NOT NULL
        GROUP BY facility
        ORDER BY total_revenue DESC
        LIMIT %s
        """

        facilities = pg_client.execute_query(query, (limit,))

        return {
            "facilities": facilities,
            "total_count": len(facilities)
        }

    except Exception as e:
        logger.error(f"Error fetching revenue by facility: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/revenue/trends/monthly")
async def get_monthly_revenue_trends():
    """Get monthly revenue trends"""
    try:
        logger.info("Fetching monthly revenue trends")

        # Use materialized view
        query = """
        SELECT
            month_str as month,
            TO_CHAR(month, 'Mon YYYY') as month_label,
            transaction_count,
            total_revenue,
            total_cogs,
            total_gross_margin as total_gm,
            avg_gm_percent as gm_percent,
            total_units as quantity
        FROM mv_monthly_revenue
        ORDER BY month
        """

        trends = pg_client.execute_query(query)

        return {
            "trends": trends,
            "period_count": len(trends)
        }

    except Exception as e:
        logger.error(f"Error fetching monthly trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# MARGIN ANALYTICS ENDPOINTS
# ============================================

@router.get("/margin/by-system")
async def get_margin_by_system(
    limit: int = Query(default=50, le=200, description="Number of systems to return"),
    sort_by: str = Query(default="gm_percent", description="Sort by: total_gm or gm_percent")
):
    """Get gross margin analysis by product system"""
    try:
        logger.info(f"Fetching margin by system, sort_by={sort_by}")

        sort_column = "avg_gm_percent" if sort_by == "gm_percent" else "total_gross_margin"

        query = f"""
        SELECT
            system,
            transaction_count,
            total_revenue,
            total_cogs,
            total_gross_margin as total_gm,
            avg_gm_percent as gm_percent,
            total_units as quantity
        FROM mv_revenue_by_system
        ORDER BY {sort_column} DESC
        LIMIT %s
        """

        systems = pg_client.execute_query(query, (limit,))

        return {
            "systems": systems,
            "total_count": len(systems)
        }

    except Exception as e:
        logger.error(f"Error fetching margin by system: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/margin/by-distributor")
async def get_margin_by_distributor(
    limit: int = Query(default=50, le=200, description="Number of distributors to return"),
    sort_by: str = Query(default="gm_percent", description="Sort by: total_gm or gm_percent")
):
    """Get gross margin analysis by distributor"""
    try:
        logger.info(f"Fetching margin by distributor, sort_by={sort_by}")

        sort_column = "avg_gm_percent" if sort_by == "gm_percent" else "total_gross_margin"

        query = f"""
        SELECT
            distributor,
            transaction_count,
            total_revenue,
            total_cogs,
            total_gross_margin as total_gm,
            avg_gm_percent as gm_percent,
            total_units as quantity
        FROM mv_revenue_by_distributor
        ORDER BY {sort_column} DESC
        LIMIT %s
        """

        distributors = pg_client.execute_query(query, (limit,))

        return {
            "distributors": distributors,
            "total_count": len(distributors)
        }

    except Exception as e:
        logger.error(f"Error fetching margin by distributor: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/margin/by-surgeon")
async def get_margin_by_surgeon(
    limit: int = Query(default=100, le=500, description="Number of surgeons to return"),
    min_procedures: int = Query(default=5, description="Minimum number of procedures")
):
    """Get gross margin analysis by surgeon"""
    try:
        logger.info(f"Fetching margin by surgeon, min_procedures={min_procedures}")

        query = """
        SELECT
            surgeon,
            procedure_count as transaction_count,
            total_revenue,
            total_gross_margin as total_gm,
            avg_gm_percent as gm_percent,
            total_units as quantity
        FROM mv_top_surgeons
        WHERE procedure_count >= %s
        ORDER BY avg_gm_percent DESC
        LIMIT %s
        """

        surgeons = pg_client.execute_query(query, (min_procedures, limit))

        return {
            "surgeons": surgeons,
            "total_count": len(surgeons)
        }

    except Exception as e:
        logger.error(f"Error fetching margin by surgeon: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/margin/top-performers")
async def get_top_margin_performers():
    """Get top performers across all dimensions"""
    try:
        logger.info("Fetching top margin performers")

        # Top system by GM%
        top_system_query = """
        SELECT system, avg_gm_percent as gm_percent, total_revenue
        FROM mv_revenue_by_system
        WHERE transaction_count >= 10
        ORDER BY avg_gm_percent DESC
        LIMIT 1
        """

        # Top distributor by GM%
        top_dist_query = """
        SELECT distributor, avg_gm_percent as gm_percent, total_revenue
        FROM mv_revenue_by_distributor
        WHERE transaction_count >= 10
        ORDER BY avg_gm_percent DESC
        LIMIT 1
        """

        # Top surgeon by GM%
        top_surgeon_query = """
        SELECT surgeon, avg_gm_percent as gm_percent, total_revenue
        FROM mv_top_surgeons
        WHERE procedure_count >= 10
        ORDER BY avg_gm_percent DESC
        LIMIT 1
        """

        top_system = pg_client.execute_query(top_system_query)
        top_dist = pg_client.execute_query(top_dist_query)
        top_surgeon = pg_client.execute_query(top_surgeon_query)

        return {
            "top_system": top_system[0] if top_system else None,
            "top_distributor": top_dist[0] if top_dist else None,
            "top_surgeon": top_surgeon[0] if top_surgeon else None
        }

    except Exception as e:
        logger.error(f"Error fetching top performers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# COST & COGS ANALYTICS ENDPOINTS
# ============================================

@router.get("/cogs/summary")
async def get_cogs_summary():
    """Get overall COGS summary metrics"""
    try:
        logger.info("Fetching COGS summary")

        query = """
        SELECT
            SUM(total_std_cost) as total_cogs,
            SUM(total_sales) as total_revenue,
            SUM(total_gm) as total_gm,
            COUNT(*) as transaction_count,
            AVG(total_std_cost) as avg_cogs_per_transaction,
            MIN(surgery_date) as start_date,
            MAX(surgery_date) as end_date
        FROM fact_transactions
        """

        result = pg_client.execute_query(query)

        if result:
            summary = result[0]
            summary['cogs_percent'] = (summary['total_cogs'] / summary['total_revenue'] * 100) if summary['total_revenue'] else 0

            return {"summary": summary}

        return {"summary": {}}

    except Exception as e:
        logger.error(f"Error fetching COGS summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cogs/by-system")
async def get_cogs_by_system(
    limit: int = Query(default=None, le=500, description="Limit results"),
    sort_by: str = Query(default="total_cogs", description="Sort by: total_cogs, cogs_percent")
):
    """Get COGS breakdown by product system"""
    try:
        logger.info(f"Fetching COGS by system (limit={limit}, sort={sort_by})")

        sort_column = "total_cogs" if sort_by == "total_cogs" else "cogs_percent"

        query = f"""
        SELECT
            system,
            SUM(total_std_cost) as total_cogs,
            SUM(total_sales) as total_revenue,
            SUM(total_gm) as total_gm,
            COUNT(*) as transaction_count,
            SUM(quantity) as quantity,
            CASE WHEN SUM(total_sales) > 0
                THEN (SUM(total_std_cost) / SUM(total_sales) * 100)
                ELSE 0 END as cogs_percent
        FROM fact_transactions
        WHERE system IS NOT NULL
        GROUP BY system
        ORDER BY {sort_column} DESC
        {f'LIMIT {limit}' if limit else ''}
        """

        systems = pg_client.execute_query(query)

        return {"systems": systems}

    except Exception as e:
        logger.error(f"Error fetching COGS by system: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cogs/by-distributor")
async def get_cogs_by_distributor(
    limit: int = Query(default=None, le=500, description="Limit results"),
    sort_by: str = Query(default="total_cogs", description="Sort by: total_cogs, cogs_percent")
):
    """Get COGS breakdown by distributor"""
    try:
        logger.info(f"Fetching COGS by distributor (limit={limit}, sort={sort_by})")

        sort_column = "total_cogs" if sort_by == "total_cogs" else "cogs_percent"

        query = f"""
        SELECT
            distributor,
            SUM(total_std_cost) as total_cogs,
            SUM(total_sales) as total_revenue,
            SUM(total_gm) as total_gm,
            COUNT(*) as transaction_count,
            SUM(quantity) as quantity,
            CASE WHEN SUM(total_sales) > 0
                THEN (SUM(total_std_cost) / SUM(total_sales) * 100)
                ELSE 0 END as cogs_percent
        FROM fact_transactions
        WHERE distributor IS NOT NULL
        GROUP BY distributor
        ORDER BY {sort_column} DESC
        {f'LIMIT {limit}' if limit else ''}
        """

        distributors = pg_client.execute_query(query)

        return {"distributors": distributors}

    except Exception as e:
        logger.error(f"Error fetching COGS by distributor: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cogs/by-item")
async def get_cogs_by_item(
    limit: int = Query(default=50, le=500, description="Limit results")
):
    """Get COGS breakdown by item code"""
    try:
        logger.info(f"Fetching COGS by item (limit={limit})")

        query = f"""
        SELECT
            item_code,
            item_description,
            system,
            SUM(total_std_cost) as total_cogs,
            SUM(total_sales) as total_revenue,
            SUM(total_gm) as total_gm,
            COUNT(*) as transaction_count,
            SUM(quantity) as quantity,
            AVG(price_each) as avg_price,
            CASE WHEN SUM(total_sales) > 0
                THEN (SUM(total_std_cost) / SUM(total_sales) * 100)
                ELSE 0 END as cogs_percent
        FROM fact_transactions
        WHERE item_code IS NOT NULL
        GROUP BY item_code, item_description, system
        ORDER BY total_cogs DESC
        LIMIT {limit}
        """

        items = pg_client.execute_query(query)

        return {"items": items}

    except Exception as e:
        logger.error(f"Error fetching COGS by item: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cogs/trends/monthly")
async def get_cogs_monthly_trends():
    """Get monthly COGS trends"""
    try:
        logger.info("Fetching monthly COGS trends")

        query = """
        SELECT
            TO_CHAR(DATE_TRUNC('month', surgery_date), 'YYYY-MM') as month,
            TO_CHAR(DATE_TRUNC('month', surgery_date), 'Mon YYYY') as month_label,
            SUM(total_std_cost) as total_cogs,
            SUM(total_sales) as total_revenue,
            SUM(total_gm) as total_gm,
            COUNT(*) as transaction_count,
            CASE WHEN SUM(total_sales) > 0
                THEN (SUM(total_std_cost) / SUM(total_sales) * 100)
                ELSE 0 END as cogs_percent
        FROM fact_transactions
        GROUP BY DATE_TRUNC('month', surgery_date)
        ORDER BY DATE_TRUNC('month', surgery_date)
        """

        trends = pg_client.execute_query(query)

        return {"trends": trends}

    except Exception as e:
        logger.error(f"Error fetching COGS trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# DRILL-DOWN ENDPOINTS
# ============================================

@router.get("/transactions/by-surgeon/{surgeon_name}")
async def get_surgeon_transactions(
    surgeon_name: str,
    limit: int = Query(default=100, le=500, description="Number of transactions to return")
):
    """Get transaction details for a specific surgeon"""
    try:
        logger.info(f"Fetching transactions for surgeon: {surgeon_name}")

        query = """
        SELECT
            transaction_id,
            surgery_date,
            facility,
            region,
            system,
            item_code,
            item_description,
            quantity,
            price_each,
            total_sales,
            total_std_cost,
            total_gm,
            gm_percent
        FROM fact_transactions
        WHERE surgeon = %s
        ORDER BY surgery_date DESC
        LIMIT %s
        """

        transactions = pg_client.execute_query(query, (surgeon_name, limit))

        # Calculate summary
        summary_query = """
        SELECT
            COUNT(*) as procedure_count,
            SUM(total_sales) as total_revenue,
            SUM(total_gm) as total_gm,
            AVG(gm_percent) as avg_gm_percent
        FROM fact_transactions
        WHERE surgeon = %s
        """

        summary = pg_client.execute_query(summary_query, (surgeon_name,))

        return {
            "surgeon": surgeon_name,
            "transactions": transactions,
            "summary": summary[0] if summary else {}
        }

    except Exception as e:
        logger.error(f"Error fetching surgeon transactions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/transactions/by-distributor/{distributor_name}")
async def get_distributor_transactions(
    distributor_name: str,
    limit: int = Query(default=100, le=500, description="Number of transactions to return")
):
    """Get transaction details for a specific distributor"""
    try:
        logger.info(f"Fetching transactions for distributor: {distributor_name}")

        query = """
        SELECT
            transaction_id,
            surgery_date,
            surgeon,
            facility,
            region,
            system,
            item_code,
            item_description,
            quantity,
            price_each,
            total_sales,
            total_std_cost,
            total_gm,
            gm_percent
        FROM fact_transactions
        WHERE distributor = %s
        ORDER BY surgery_date DESC
        LIMIT %s
        """

        transactions = pg_client.execute_query(query, (distributor_name, limit))

        # Calculate summary
        summary_query = """
        SELECT
            COUNT(*) as transaction_count,
            SUM(total_sales) as total_revenue,
            SUM(total_gm) as total_gm,
            AVG(gm_percent) as avg_gm_percent,
            COUNT(DISTINCT surgeon) as surgeon_count,
            COUNT(DISTINCT facility) as facility_count
        FROM fact_transactions
        WHERE distributor = %s
        """

        summary = pg_client.execute_query(summary_query, (distributor_name,))

        return {
            "distributor": distributor_name,
            "transactions": transactions,
            "summary": summary[0] if summary else {}
        }

    except Exception as e:
        logger.error(f"Error fetching distributor transactions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# FILTER OPTIONS ENDPOINTS
# ============================================

@router.get("/filters/systems")
async def get_systems_list():
    """Get list of all product systems"""
    try:
        query = """
        SELECT DISTINCT system
        FROM fact_transactions
        WHERE system IS NOT NULL
        ORDER BY system
        """

        systems = pg_client.execute_query(query)

        return {
            "systems": [s['system'] for s in systems]
        }

    except Exception as e:
        logger.error(f"Error fetching systems list: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/filters/distributors")
async def get_distributors_list():
    """Get list of all distributors"""
    try:
        query = """
        SELECT DISTINCT distributor
        FROM fact_transactions
        WHERE distributor IS NOT NULL
        ORDER BY distributor
        """

        distributors = pg_client.execute_query(query)

        return {
            "distributors": [d['distributor'] for d in distributors]
        }

    except Exception as e:
        logger.error(f"Error fetching distributors list: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/filters/regions")
async def get_regions_list():
    """Get list of all regions"""
    try:
        query = """
        SELECT DISTINCT region
        FROM fact_transactions
        WHERE region IS NOT NULL
        ORDER BY region
        """

        regions = pg_client.execute_query(query)

        return {
            "regions": [r['region'] for r in regions]
        }

    except Exception as e:
        logger.error(f"Error fetching regions list: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pl/summary")
async def get_pl_summary():
    """Get P&L summary - simplified view of revenue, COGS, and GM"""
    try:
        logger.info("Fetching P&L summary")

        query = """
        SELECT
            SUM(total_sales) as total_revenue,
            SUM(total_std_cost) as total_cogs,
            SUM(total_gm) as gross_margin,
            COUNT(*) as transaction_count,
            MIN(surgery_date) as start_date,
            MAX(surgery_date) as end_date
        FROM fact_transactions
        """

        result = pg_client.execute_query(query)

        if result:
            summary = result[0]
            summary['gross_margin_percent'] = (summary['gross_margin'] / summary['total_revenue'] * 100) if summary['total_revenue'] else 0
            summary['cogs_percent'] = (summary['total_cogs'] / summary['total_revenue'] * 100) if summary['total_revenue'] else 0

            return {"summary": summary}

        return {"summary": {}}

    except Exception as e:
        logger.error(f"Error fetching P&L summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pl/by-month")
async def get_pl_by_month():
    """Get monthly P&L statement"""
    try:
        logger.info("Fetching monthly P&L")

        query = """
        SELECT
            TO_CHAR(DATE_TRUNC('month', surgery_date), 'YYYY-MM') as month,
            TO_CHAR(DATE_TRUNC('month', surgery_date), 'Mon YYYY') as month_label,
            SUM(total_sales) as revenue,
            SUM(total_std_cost) as cogs,
            SUM(total_gm) as gross_margin,
            COUNT(*) as transaction_count,
            CASE WHEN SUM(total_sales) > 0
                THEN (SUM(total_gm) / SUM(total_sales) * 100)
                ELSE 0 END as gm_percent
        FROM fact_transactions
        GROUP BY DATE_TRUNC('month', surgery_date)
        ORDER BY DATE_TRUNC('month', surgery_date)
        """

        data = pg_client.execute_query(query)

        return {"data": data}

    except Exception as e:
        logger.error(f"Error fetching monthly P&L: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pl/by-category")
async def get_pl_by_category():
    """Get P&L breakdown by categories (systems, distributors, regions)"""
    try:
        logger.info("Fetching P&L by category")

        # Get top systems
        systems_query = """
        SELECT
            'System' as category,
            system as subcategory,
            SUM(total_sales) as revenue,
            SUM(total_std_cost) as cogs,
            SUM(total_gm) as gross_margin,
            COUNT(*) as transaction_count
        FROM fact_transactions
        WHERE system IS NOT NULL
        GROUP BY system
        ORDER BY SUM(total_sales) DESC
        LIMIT 10
        """

        # Get top distributors
        distributors_query = """
        SELECT
            'Distributor' as category,
            distributor as subcategory,
            SUM(total_sales) as revenue,
            SUM(total_std_cost) as cogs,
            SUM(total_gm) as gross_margin,
            COUNT(*) as transaction_count
        FROM fact_transactions
        WHERE distributor IS NOT NULL
        GROUP BY distributor
        ORDER BY SUM(total_sales) DESC
        LIMIT 10
        """

        # Get regions
        regions_query = """
        SELECT
            'Region' as category,
            region as subcategory,
            SUM(total_sales) as revenue,
            SUM(total_std_cost) as cogs,
            SUM(total_gm) as gross_margin,
            COUNT(*) as transaction_count
        FROM fact_transactions
        WHERE region IS NOT NULL
        GROUP BY region
        ORDER BY SUM(total_sales) DESC
        """

        systems = pg_client.execute_query(systems_query)
        distributors = pg_client.execute_query(distributors_query)
        regions = pg_client.execute_query(regions_query)

        # Combine all results
        all_data = systems + distributors + regions

        return {"data": all_data}

    except Exception as e:
        logger.error(f"Error fetching P&L by category: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check for CSG margin analytics"""
    try:
        # Test database connection
        query = "SELECT COUNT(*) as count FROM fact_transactions"
        result = pg_client.execute_query(query)

        return {
            "status": "healthy",
            "service": "MARGEN.AI CSG Analytics",
            "database_connected": True,
            "transaction_count": result[0]['count'] if result else 0
        }
    except Exception as e:
        logger.error(f"CSG health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unavailable")
