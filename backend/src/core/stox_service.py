"""
STOX.AI Service Layer
Provides inventory optimization analytics and recommendations
"""
from typing import List, Dict, Any, Optional
import structlog
from ..db.postgresql_client import PostgreSQLClient

logger = structlog.get_logger()


class StoxService:
    """Service for STOX.AI inventory optimization analytics"""

    def __init__(self):
        self.db = PostgreSQLClient(database="customer_analytics")
        logger.info("StoxService initialized")

    # ========== SHORTAGE DETECTOR METHODS ==========

    def get_shortage_alerts(
        self,
        severity: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Get shortage alerts using performance_metrics table
        """
        query = """
        WITH deduped_pm AS (
            SELECT DISTINCT ON (material_id, plant)
                material_id, plant, stoxai_safety_stock_qty, stoxai_rop_qty,
                stoxai_lot_size, stoxai_total_working_capital
            FROM stox_performance_metrics
        ),
        deduped_m AS (
            SELECT DISTINCT ON (material_id, plant)
                material_id, plant, vendor, abc_class, avg_daily_demand,
                avg_lead_time, vendor_otif_pct
            FROM stox_material_master
        ),
        deduped_wc AS (
            SELECT DISTINCT ON (material_id, plant)
                material_id, plant, unit_cost
            FROM stox_working_capital
        )
        SELECT
            pm.material_id,
            pm.plant,
            m.vendor,
            m.abc_class,
            m.avg_daily_demand,
            pm.stoxai_safety_stock_qty,
            pm.stoxai_rop_qty,
            pm.stoxai_lot_size,
            pm.stoxai_total_working_capital as current_stock_value,
            wc.unit_cost,
            -- Simulate current stock
            pm.stoxai_safety_stock_qty * 1.2 as current_stock,
            m.avg_lead_time,
            m.vendor_otif_pct,
            CASE
                WHEN pm.stoxai_safety_stock_qty * 1.2 < pm.stoxai_safety_stock_qty THEN 'Critical'
                WHEN pm.stoxai_safety_stock_qty * 1.2 < pm.stoxai_rop_qty THEN 'High'
                WHEN pm.stoxai_safety_stock_qty * 1.2 < pm.stoxai_rop_qty + pm.stoxai_lot_size THEN 'Medium'
                ELSE 'Low'
            END as severity,
            ROUND(m.avg_daily_demand * m.avg_lead_time, 2) as lead_time_demand,
            ROUND((pm.stoxai_safety_stock_qty * 1.2 - pm.stoxai_rop_qty) / NULLIF(m.avg_daily_demand, 0), 1) as days_until_stockout
        FROM deduped_pm pm
        JOIN deduped_m m ON pm.material_id = m.material_id AND pm.plant = m.plant
        JOIN deduped_wc wc ON pm.material_id = wc.material_id AND pm.plant = wc.plant
        WHERE m.avg_daily_demand > 0
        """

        params = []
        if severity:
            query = query.replace("WHERE m.avg_daily_demand > 0",
                                 f"WHERE m.avg_daily_demand > 0 AND CASE WHEN pm.stoxai_safety_stock_qty * 1.2 < pm.stoxai_safety_stock_qty THEN 'Critical' WHEN pm.stoxai_safety_stock_qty * 1.2 < pm.stoxai_rop_qty THEN 'High' WHEN pm.stoxai_safety_stock_qty * 1.2 < pm.stoxai_rop_qty + pm.stoxai_lot_size THEN 'Medium' ELSE 'Low' END = %s")
            params.append(severity)

        query += " ORDER BY days_until_stockout LIMIT %s OFFSET %s"
        params.extend([limit, offset])

        alerts = self.db.execute_query(query, tuple(params))

        return {
            "alerts": alerts,
            "total": len(alerts),
            "offset": offset,
            "limit": limit
        }

    def get_stockout_predictions(
        self,
        months: int = 3,
        material_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get 3-month stockout predictions"""
        query = """
        SELECT DISTINCT ON (material_id, plant, month)
            material_id,
            plant,
            month,
            s4_safety_stock,
            ibp_safety_stock,
            stoxai_safety_stock,
            stoxai_reason
        FROM stox_future_projection
        WHERE 1=1
        """

        params = []
        if material_id:
            query += " AND material_id = %s"
            params.append(material_id)

        query += " ORDER BY material_id, plant, month LIMIT 100"

        predictions = self.db.execute_query(query, tuple(params))
        return {"predictions": predictions}

    def get_material_risk_summary(self) -> Dict[str, Any]:
        """Get material-level risk summary"""
        query = """
        WITH deduped_pm AS (
            SELECT DISTINCT ON (material_id, plant)
                material_id, plant, stoxai_total_working_capital,
                stoxai_total_annual_cost, stoxai_working_capital_savings,
                stoxai_annual_cost_savings
            FROM stox_performance_metrics
        ),
        deduped_m AS (
            SELECT DISTINCT ON (material_id, plant)
                material_id, plant, abc_class
            FROM stox_material_master
        )
        SELECT
            pm.material_id,
            pm.plant,
            m.abc_class as risk_level,
            pm.stoxai_total_working_capital as working_capital,
            pm.stoxai_total_annual_cost as annual_cost,
            pm.stoxai_working_capital_savings + pm.stoxai_annual_cost_savings as potential_savings
        FROM deduped_pm pm
        JOIN deduped_m m ON pm.material_id = m.material_id AND pm.plant = m.plant
        ORDER BY potential_savings DESC
        LIMIT 100
        """

        materials = self.db.execute_query(query)
        return {"materials": materials}

    # ========== INVENTORY HEATMAP METHODS ==========

    def get_inventory_distribution(self) -> Dict[str, Any]:
        """Get inventory distribution by plant"""
        query = """
        SELECT
            plant,
            COUNT(*) as total_materials,
            SUM(stoxai_total_working_capital) as total_working_capital,
            AVG(stoxai_total_working_capital) as avg_working_capital,
            SUM(stoxai_working_capital_savings) as total_savings,
            AVG(stoxai_working_capital_savings / NULLIF(s4_total_working_capital, 0) * 100) as savings_percentage
        FROM stox_performance_metrics
        GROUP BY plant
        ORDER BY total_working_capital DESC
        """

        locations = self.db.execute_query(query)
        return {"locations": locations}

    def get_location_metrics(self, plant: Optional[str] = None) -> Dict[str, Any]:
        """Get detailed metrics for locations"""
        query = """
        SELECT
            plant,
            COUNT(*) as total_materials,
            SUM(stoxai_total_working_capital) as total_working_capital,
            AVG(stoxai_total_working_capital) as avg_working_capital,
            SUM(stoxai_working_capital_savings) as total_savings,
            AVG(stoxai_working_capital_savings / NULLIF(s4_total_working_capital, 0) * 100) as savings_percentage
        FROM stox_performance_metrics
        WHERE 1=1
        """

        params = []
        if plant:
            query += " AND plant = %s"
            params.append(plant)

        query += " GROUP BY plant ORDER BY total_working_capital DESC"

        metrics = self.db.execute_query(query, tuple(params))
        return {"metrics": metrics}

    def get_plant_performance(self) -> Dict[str, Any]:
        """Get S4 vs IBP vs StoxAI comparison by plant"""
        query = """
        SELECT
            plant,
            SUM(s4_total_working_capital) as s4_working_capital,
            SUM(ibp_total_working_capital) as ibp_working_capital,
            SUM(stoxai_total_working_capital) as stoxai_working_capital,
            SUM(s4_total_annual_cost) as s4_annual_cost,
            SUM(ibp_total_annual_cost) as ibp_annual_cost,
            SUM(stoxai_total_annual_cost) as stoxai_annual_cost,
            SUM(stoxai_working_capital_savings) as working_capital_savings,
            SUM(stoxai_annual_cost_savings) as annual_cost_savings
        FROM stox_performance_metrics
        GROUP BY plant
        ORDER BY s4_working_capital DESC
        """

        plants = self.db.execute_query(query)
        return {"plants": plants}

    # ========== REALLOCATION OPTIMIZER METHODS ==========

    def get_reallocation_opportunities(self) -> Dict[str, Any]:
        """Get reallocation opportunities"""
        query = """
        SELECT
            material_id,
            plant,
            stoxai_safety_stock_qty,
            s4_safety_stock_qty,
            stoxai_safety_stock_qty - s4_safety_stock_qty as excess_deficit,
            stoxai_working_capital_savings as potential_savings
        FROM stox_performance_metrics
        WHERE ABS(stoxai_safety_stock_qty - s4_safety_stock_qty) > 100
        ORDER BY ABS(stoxai_safety_stock_qty - s4_safety_stock_qty) DESC
        LIMIT 100
        """

        opportunities = self.db.execute_query(query)
        return {"opportunities": opportunities}

    def get_transfer_recommendations(self, material_id: Optional[str] = None) -> Dict[str, Any]:
        """Get transfer recommendations"""
        query = """
        SELECT
            material_id,
            plant,
            stoxai_lot_size,
            s4_lot_size,
            stoxai_working_capital_savings as transfer_savings
        FROM stox_performance_metrics
        WHERE stoxai_working_capital_savings > 0
        """

        params = []
        if material_id:
            query += " AND material_id = %s"
            params.append(material_id)

        query += " ORDER BY stoxai_working_capital_savings DESC LIMIT 100"

        recommendations = self.db.execute_query(query, tuple(params))
        return {"recommendations": recommendations}

    def get_lot_size_optimization(self) -> Dict[str, Any]:
        """Get lot size optimization recommendations"""
        query = """
        SELECT
            ls.material_id,
            ls.plant,
            ls.s4_lot_size,
            ls.stoxai_lot_size,
            ls.s4_orders_per_year,
            ls.stoxai_orders_per_year,
            ls.s4_orders_per_year - ls.stoxai_orders_per_year as order_reduction,
            pm.stoxai_annual_cost_savings as annual_savings
        FROM stox_lot_size ls
        JOIN stox_performance_metrics pm ON ls.material_id = pm.material_id AND ls.plant = pm.plant
        WHERE ABS(ls.s4_lot_size - ls.stoxai_lot_size) > 10
        ORDER BY pm.stoxai_annual_cost_savings DESC
        LIMIT 100
        """

        optimizations = self.db.execute_query(query)
        return {"optimizations": optimizations}

    # ========== INBOUND RISK MONITOR METHODS ==========

    def get_vendor_risk_metrics(self) -> Dict[str, Any]:
        """Get vendor risk metrics"""
        query = """
        SELECT
            vendor,
            COUNT(*) as material_count,
            AVG(vendor_otif_pct) as avg_otif_pct,
            AVG(vendor_theta) as avg_theta,
            AVG(avg_lead_time) as avg_lead_time,
            STDDEV(avg_lead_time) as lead_time_variance
        FROM stox_material_master
        GROUP BY vendor
        ORDER BY avg_otif_pct ASC
        LIMIT 50
        """

        vendors = self.db.execute_query(query)
        return {"vendors": vendors}

    def get_supplier_performance(self, vendor: Optional[str] = None) -> Dict[str, Any]:
        """Get supplier performance by SKU"""
        query = """
        WITH deduped_m AS (
            SELECT DISTINCT ON (material_id, plant)
                material_id, plant, vendor, vendor_otif_pct,
                vendor_theta, avg_lead_time, lt_stddev
            FROM stox_material_master
        ),
        deduped_pm AS (
            SELECT DISTINCT ON (material_id, plant)
                material_id, plant, stoxai_total_working_capital
            FROM stox_performance_metrics
        )
        SELECT
            m.material_id,
            m.plant,
            m.vendor,
            m.vendor_otif_pct,
            m.vendor_theta,
            m.avg_lead_time,
            m.lt_stddev,
            pm.stoxai_total_working_capital
        FROM deduped_m m
        JOIN deduped_pm pm ON m.material_id = pm.material_id AND m.plant = pm.plant
        WHERE 1=1
        """

        params = []
        if vendor:
            query += " AND m.vendor = %s"
            params.append(vendor)

        query += " ORDER BY m.vendor_otif_pct ASC LIMIT 100"

        performance = self.db.execute_query(query, tuple(params))
        return {"performance": performance}

    def get_inbound_alerts(self, risk_threshold: float = 0.95) -> Dict[str, Any]:
        """Get inbound risk alerts"""
        query = """
        SELECT DISTINCT ON (material_id, plant)
            material_id,
            plant,
            vendor,
            vendor_otif_pct,
            vendor_theta,
            avg_lead_time,
            CASE
                WHEN vendor_otif_pct < 0.80 THEN 'Critical'
                WHEN vendor_otif_pct < 0.90 THEN 'High'
                ELSE 'Medium'
            END as risk_level
        FROM stox_material_master
        WHERE vendor_otif_pct < %s
        ORDER BY material_id, plant, vendor_otif_pct ASC
        LIMIT 100
        """

        alerts = self.db.execute_query(query, (risk_threshold,))
        return {"alerts": alerts}

    # ========== AGING STOCK INTELLIGENCE METHODS ==========

    def get_aging_inventory(self) -> Dict[str, Any]:
        """Get aging inventory analysis"""
        query = """
        SELECT
            ac.material_id,
            ac.plant,
            ac.annual_demand,
            wc.stoxai_total_working_capital as working_capital,
            CASE
                WHEN ac.annual_demand = 0 THEN 999
                ELSE ROUND(wc.stoxai_safety_stock_qty / NULLIF(ac.annual_demand / 365.0, 0))
            END as days_on_hand,
            CASE
                WHEN ac.annual_demand = 0 THEN 'Very Slow'
                WHEN wc.stoxai_safety_stock_qty / NULLIF(ac.annual_demand / 365.0, 0) > 120 THEN 'Very Slow'
                WHEN wc.stoxai_safety_stock_qty / NULLIF(ac.annual_demand / 365.0, 0) > 90 THEN 'Slow'
                WHEN wc.stoxai_safety_stock_qty / NULLIF(ac.annual_demand / 365.0, 0) > 60 THEN 'Moderate'
                ELSE 'Normal'
            END as aging_status
        FROM stox_annual_cost ac
        JOIN stox_working_capital wc ON ac.material_id = wc.material_id AND ac.plant = wc.plant
        ORDER BY days_on_hand DESC
        LIMIT 100
        """

        inventory = self.db.execute_query(query)
        return {"inventory": inventory}

    def get_obsolescence_risk(self) -> Dict[str, Any]:
        """Get obsolescence risk"""
        query = """
        SELECT
            ac.material_id,
            ac.plant,
            ac.s4_obsolescence_cost,
            wc.stoxai_total_working_capital,
            ac.s4_obsolescence_cost / NULLIF(wc.stoxai_total_working_capital, 0) * 100 as risk_percentage
        FROM stox_annual_cost ac
        JOIN stox_working_capital wc ON ac.material_id = wc.material_id AND ac.plant = wc.plant
        WHERE ac.s4_obsolescence_cost > 0
        ORDER BY ac.s4_obsolescence_cost DESC
        LIMIT 100
        """

        risk = self.db.execute_query(query)
        return {"risk_items": risk}

    def get_clearance_recommendations(self) -> Dict[str, Any]:
        """Get clearance recommendations"""
        query = """
        SELECT
            ac.material_id,
            ac.plant,
            ac.annual_demand,
            wc.stoxai_total_working_capital as stock_value,
            ac.s4_obsolescence_cost as estimated_loss,
            ROUND(ac.s4_obsolescence_cost / NULLIF(wc.stoxai_total_working_capital, 0) * 100, 2) as suggested_markdown_pct
        FROM stox_annual_cost ac
        JOIN stox_working_capital wc ON ac.material_id = wc.material_id AND ac.plant = wc.plant
        WHERE ac.annual_demand < (SELECT AVG(annual_demand) * 0.2 FROM stox_annual_cost)
        ORDER BY ac.s4_obsolescence_cost DESC
        LIMIT 100
        """

        recommendations = self.db.execute_query(query)
        return {"recommendations": recommendations}

    # ========== DASHBOARD METHODS ==========

    def get_enterprise_summary(self) -> Dict[str, Any]:
        """Get enterprise summary metrics"""
        query = """
        SELECT * FROM stox_enterprise_summary
        ORDER BY id DESC LIMIT 1
        """

        summary = self.db.execute_query(query)
        return summary[0] if summary else {}
