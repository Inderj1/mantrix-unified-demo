"""
STOX.AI Service Layer
Provides inventory optimization analytics and recommendations
"""
from typing import List, Dict, Any, Optional
import structlog
from ..db.postgresql_client import PostgreSQLClient
from ..db.bigquery import BigQueryClient

logger = structlog.get_logger()


class StoxService:
    """Service for STOX.AI inventory optimization analytics"""

    def __init__(self):
        self.db = PostgreSQLClient(database="mantrix_nexxt")
        self.bq = BigQueryClient()
        self.bq_dataset = "copa_export_copa_data_000000000000"
        logger.info("StoxService initialized with PostgreSQL and BigQuery")

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

    # ========== CONSIGNMENT KIT PROCESS METHODS ==========

    def get_consignment_kit_process(self) -> Dict[str, Any]:
        """Get consignment kit process data and statistics"""

        # Get statistics
        stats_query = """
        SELECT
            COUNT(DISTINCT CASE WHEN status IN ('Kit Request', 'Transfer Order', 'Pick & Ship DC',
                'Kit in Transit', 'Receipt', 'Surgery', 'Usage Record', 'Ship Replacements',
                'Replace Transit', 'Restock Kit') THEN kit_id END) as total_kits,
            COUNT(DISTINCT CASE WHEN status IN ('Kit Request', 'Transfer Order', 'Receipt',
                'Surgery', 'Usage Record', 'Ship Replacements', 'Restock Kit') THEN kit_id END) as active_kits,
            COUNT(DISTINCT CASE WHEN status IN ('Pick & Ship DC', 'Kit in Transit', 'Replace Transit')
                THEN kit_id END) as in_transit,
            COUNT(DISTINCT CASE WHEN status = 'Kit Available'
                AND DATE(updated_at) = CURRENT_DATE THEN kit_id END) as completed_today
        FROM consignment_kit_tracking
        """

        # Get process data grouped by step
        process_query = """
        SELECT
            step_number,
            step_name,
            owner,
            AVG(duration_hours) as avg_duration_hours,
            COUNT(*) as total_processed,
            COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_count,
            COUNT(CASE WHEN status = 'In Progress' THEN 1 END) as in_progress_count,
            COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_count
        FROM consignment_kit_process_steps
        GROUP BY step_number, step_name, owner
        ORDER BY step_number
        """

        try:
            stats_result = self.db.execute_query(stats_query)
            process_result = self.db.execute_query(process_query)

            stats = stats_result[0] if stats_result else {
                "total_kits": 0,
                "active_kits": 0,
                "in_transit": 0,
                "completed_today": 0
            }

            return {
                "success": True,
                "stats": stats,
                "processes": process_result
            }
        except Exception as e:
            logger.error(f"Error fetching consignment kit process data: {e}")
            # Return mock data if tables don't exist yet
            return {
                "success": True,
                "stats": {
                    "total_kits": 156,
                    "active_kits": 89,
                    "in_transit": 34,
                    "completed_today": 12
                },
                "processes": []
            }

    # ========== BIGQUERY WORKING CAPITAL METHODS ==========

    def get_working_capital_baseline(
        self,
        plant: Optional[str] = None,
        category: Optional[str] = None,
        abc_class: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Get working capital baseline data from BigQuery stox_demo_inventory_wc_baseline"""
        try:
            query = f"""
            SELECT
                record_id,
                sku_id,
                sku_name,
                plant_id,
                plant_name,
                category,
                on_hand_qty,
                cycle_stock_qty,
                safety_stock_qty,
                pipeline_stock_qty,
                excess_stock_qty,
                unit_cost,
                total_wc_value,
                cycle_stock_value,
                safety_stock_value,
                pipeline_stock_value,
                excess_stock_value,
                daily_demand,
                lead_time_days,
                service_level,
                wcp,
                dio,
                inventory_turns,
                gross_margin_pct,
                wc_savings_opportunity,
                carrying_cost_savings,
                health_status,
                abc_class,
                xyz_class,
                snapshot_date
            FROM `arizona-poc.{self.bq_dataset}.stox_demo_inventory_wc_baseline`
            WHERE 1=1
            """

            if plant:
                query += f" AND plant_id = '{plant}'"
            if category:
                query += f" AND category = '{category}'"
            if abc_class:
                query += f" AND abc_class = '{abc_class}'"

            query += f" ORDER BY total_wc_value DESC LIMIT {limit} OFFSET {offset}"

            rows = self.bq.execute_query(query)

            # Get summary stats
            summary_query = f"""
            SELECT
                COUNT(*) as total_skus,
                SUM(total_wc_value) as total_working_capital,
                SUM(wc_savings_opportunity) as total_savings_opportunity,
                AVG(dio) as avg_dio,
                AVG(inventory_turns) as avg_turns
            FROM `arizona-poc.{self.bq_dataset}.stox_demo_inventory_wc_baseline`
            """
            summary = self.bq.execute_query(summary_query)

            return {
                "data": rows,
                "summary": summary[0] if summary else {},
                "data_source": "demo",
                "table": "stox_demo_inventory_wc_baseline"
            }
        except Exception as e:
            logger.error(f"Failed to get working capital baseline: {e}")
            raise

    def get_inventory_health(
        self,
        plant: Optional[str] = None,
        risk_level: Optional[str] = None,
        limit: int = 100
    ) -> Dict[str, Any]:
        """Get inventory health data from BigQuery stox_demo_inventory_health"""
        try:
            query = f"""
            SELECT
                material_id,
                material_name,
                plant_id,
                category,
                stock_qty,
                stock_value,
                age_days,
                days_on_hand,
                coverage_months,
                health_score,
                excess_qty,
                excess_value,
                risk_level,
                writeoff_risk_pct,
                abc_class,
                xyz_class,
                recommended_action,
                snapshot_date
            FROM `arizona-poc.{self.bq_dataset}.stox_demo_inventory_health`
            WHERE 1=1
            """

            if plant:
                query += f" AND plant_id = '{plant}'"
            if risk_level:
                query += f" AND risk_level = '{risk_level}'"

            query += f" ORDER BY health_score ASC LIMIT {limit}"

            rows = self.bq.execute_query(query)

            # Get distribution by health score
            dist_query = f"""
            SELECT
                CASE
                    WHEN health_score >= 80 THEN 'Healthy'
                    WHEN health_score >= 60 THEN 'At Risk'
                    WHEN health_score >= 40 THEN 'Critical'
                    ELSE 'Severe'
                END as health_category,
                COUNT(*) as count,
                SUM(stock_value) as value
            FROM `arizona-poc.{self.bq_dataset}.stox_demo_inventory_health`
            GROUP BY 1
            ORDER BY health_score DESC
            """
            distribution = self.bq.execute_query(dist_query)

            return {
                "data": rows,
                "distribution": distribution,
                "data_source": "demo",
                "table": "stox_demo_inventory_health"
            }
        except Exception as e:
            logger.error(f"Failed to get inventory health: {e}")
            raise

    def get_mrp_parameters(
        self,
        plant: Optional[str] = None,
        abc_class: Optional[str] = None,
        limit: int = 100
    ) -> Dict[str, Any]:
        """Get MRP parameters from BigQuery stox_demo_mrp_parameters"""
        try:
            query = f"""
            SELECT
                material_id,
                plant_id,
                mrp_type,
                abc_class,
                current_safety_stock,
                current_reorder_point,
                current_lot_size,
                optimal_safety_stock,
                optimal_reorder_point,
                optimal_lot_size,
                lead_time_days,
                demand_variability,
                supply_variability,
                service_level_target,
                stockout_risk_pct,
                savings_potential,
                ordering_cost,
                holding_cost_pct,
                eoq,
                snapshot_date
            FROM `arizona-poc.{self.bq_dataset}.stox_demo_mrp_parameters`
            WHERE 1=1
            """

            if plant:
                query += f" AND plant_id = '{plant}'"
            if abc_class:
                query += f" AND abc_class = '{abc_class}'"

            query += f" ORDER BY savings_potential DESC LIMIT {limit}"

            rows = self.bq.execute_query(query)

            # Get total savings potential
            summary_query = f"""
            SELECT
                SUM(savings_potential) as total_savings,
                AVG(stockout_risk_pct) as avg_stockout_risk,
                COUNT(*) as total_materials
            FROM `arizona-poc.{self.bq_dataset}.stox_demo_mrp_parameters`
            """
            summary = self.bq.execute_query(summary_query)

            return {
                "data": rows,
                "summary": summary[0] if summary else {},
                "data_source": "demo",
                "table": "stox_demo_mrp_parameters"
            }
        except Exception as e:
            logger.error(f"Failed to get MRP parameters: {e}")
            raise

    def get_supplier_lead_times(
        self,
        vendor: Optional[str] = None,
        risk_level: Optional[str] = None,
        limit: int = 100
    ) -> Dict[str, Any]:
        """Get supplier lead times from BigQuery stox_demo_supplier_lead_times"""
        try:
            query = f"""
            SELECT
                material_id,
                plant_id,
                vendor_id,
                vendor_name,
                planned_lead_time,
                actual_lead_time_avg,
                lead_time_stddev,
                lead_time_p50,
                lead_time_p90,
                on_time_delivery_pct,
                reliability_score,
                risk_level,
                orders_analyzed,
                early_count,
                on_time_count,
                late_count,
                safety_stock_adjustment,
                predicted_lead_time,
                trend,
                snapshot_date
            FROM `arizona-poc.{self.bq_dataset}.stox_demo_supplier_lead_times`
            WHERE 1=1
            """

            if vendor:
                query += f" AND vendor_name = '{vendor}'"
            if risk_level:
                query += f" AND risk_level = '{risk_level}'"

            query += f" ORDER BY reliability_score ASC LIMIT {limit}"

            rows = self.bq.execute_query(query)

            return {
                "data": rows,
                "data_source": "demo",
                "table": "stox_demo_supplier_lead_times"
            }
        except Exception as e:
            logger.error(f"Failed to get supplier lead times: {e}")
            raise

    def get_recommendations(
        self,
        category: Optional[str] = None,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        limit: int = 50
    ) -> Dict[str, Any]:
        """Get recommendations from BigQuery stox_demo_recommendations"""
        try:
            query = f"""
            SELECT
                recommendation_id,
                title,
                category,
                priority,
                change_type,
                material_id,
                plant_id,
                current_value,
                recommended_value,
                confidence_score,
                impact_score,
                delta_wc,
                carrying_cost_savings,
                cash_release_months,
                service_risk_pct,
                status,
                created_date,
                approved_date,
                implemented_date,
                approved_by
            FROM `arizona-poc.{self.bq_dataset}.stox_demo_recommendations`
            WHERE 1=1
            """

            if category:
                query += f" AND category = '{category}'"
            if status:
                query += f" AND status = '{status}'"
            if priority:
                query += f" AND priority = '{priority}'"

            query += f" ORDER BY impact_score DESC LIMIT {limit}"

            rows = self.bq.execute_query(query)

            # Get summary by status
            summary_query = f"""
            SELECT
                status,
                COUNT(*) as count,
                SUM(delta_wc) as total_delta_wc
            FROM `arizona-poc.{self.bq_dataset}.stox_demo_recommendations`
            GROUP BY status
            """
            summary = self.bq.execute_query(summary_query)

            return {
                "data": rows,
                "summary": summary,
                "data_source": "demo",
                "table": "stox_demo_recommendations"
            }
        except Exception as e:
            logger.error(f"Failed to get recommendations: {e}")
            raise

    def get_demand_patterns(
        self,
        plant: Optional[str] = None,
        pattern: Optional[str] = None,
        limit: int = 100
    ) -> Dict[str, Any]:
        """Get demand patterns from BigQuery stox_demo_demand_patterns"""
        try:
            query = f"""
            SELECT
                material_id,
                material_name,
                plant_id,
                avg_daily_demand,
                peak_demand,
                min_demand,
                demand_stddev,
                coefficient_of_variation,
                adi,
                pattern,
                abc_class,
                xyz_class,
                trend_direction,
                seasonality_index,
                anomaly_count,
                risk_score,
                supply_risk,
                demand_risk,
                snapshot_date
            FROM `arizona-poc.{self.bq_dataset}.stox_demo_demand_patterns`
            WHERE 1=1
            """

            if plant:
                query += f" AND plant_id = '{plant}'"
            if pattern:
                query += f" AND pattern = '{pattern}'"

            query += f" ORDER BY risk_score DESC LIMIT {limit}"

            rows = self.bq.execute_query(query)

            return {
                "data": rows,
                "data_source": "demo",
                "table": "stox_demo_demand_patterns"
            }
        except Exception as e:
            logger.error(f"Failed to get demand patterns: {e}")
            raise

    def get_cash_release(self, limit: int = 20) -> Dict[str, Any]:
        """Get cash release initiatives from BigQuery stox_demo_cash_release"""
        try:
            query = f"""
            SELECT
                initiative_id,
                name,
                category,
                total_release,
                risk_adjusted,
                confidence_pct,
                start_month,
                duration_months,
                status,
                risk_level,
                owner,
                monthly_release_json,
                snapshot_date
            FROM `arizona-poc.{self.bq_dataset}.stox_demo_cash_release`
            ORDER BY total_release DESC
            LIMIT {limit}
            """

            rows = self.bq.execute_query(query)

            # Get totals
            summary_query = f"""
            SELECT
                SUM(total_release) as total_release,
                SUM(risk_adjusted) as total_risk_adjusted,
                COUNT(*) as initiative_count
            FROM `arizona-poc.{self.bq_dataset}.stox_demo_cash_release`
            """
            summary = self.bq.execute_query(summary_query)

            return {
                "data": rows,
                "summary": summary[0] if summary else {},
                "data_source": "demo",
                "table": "stox_demo_cash_release"
            }
        except Exception as e:
            logger.error(f"Failed to get cash release: {e}")
            raise

    def get_forecasts(
        self,
        plant: Optional[str] = None,
        pattern: Optional[str] = None,
        limit: int = 100
    ) -> Dict[str, Any]:
        """Get forecasts from BigQuery stox_demo_forecasts"""
        try:
            query = f"""
            SELECT
                material_id,
                material_name,
                plant_id,
                pattern,
                selected_model,
                forecast_1m,
                forecast_3m,
                forecast_6m,
                p10,
                p90,
                mape,
                mae,
                rmse,
                bias,
                accuracy_rating,
                confidence_level,
                snapshot_date
            FROM `arizona-poc.{self.bq_dataset}.stox_demo_forecasts`
            WHERE 1=1
            """

            if plant:
                query += f" AND plant_id = '{plant}'"
            if pattern:
                query += f" AND pattern = '{pattern}'"

            query += f" ORDER BY confidence_level DESC LIMIT {limit}"

            rows = self.bq.execute_query(query)

            return {
                "data": rows,
                "data_source": "demo",
                "table": "stox_demo_forecasts"
            }
        except Exception as e:
            logger.error(f"Failed to get forecasts: {e}")
            raise

    def get_exceptions(
        self,
        tile: Optional[str] = None,
        priority: Optional[int] = None,
        limit: int = 20
    ) -> Dict[str, Any]:
        """Get exceptions from BigQuery stox_demo_exceptions"""
        try:
            query = f"""
            SELECT
                exception_id,
                type,
                title,
                description,
                impact,
                action,
                tile,
                priority,
                created_date
            FROM `arizona-poc.{self.bq_dataset}.stox_demo_exceptions`
            WHERE 1=1
            """

            if tile:
                query += f" AND tile = '{tile}'"
            if priority:
                query += f" AND priority <= {priority}"

            query += f" ORDER BY priority, created_date DESC LIMIT {limit}"

            rows = self.bq.execute_query(query)

            return {
                "data": rows,
                "data_source": "demo",
                "table": "stox_demo_exceptions"
            }
        except Exception as e:
            logger.error(f"Failed to get exceptions: {e}")
            raise

    # ========== BIGQUERY REAL DATA (VIEWS) METHODS ==========

    def get_performance_kpis(self) -> Dict[str, Any]:
        """Get performance KPIs from BigQuery view (real data)"""
        try:
            query = f"""
            SELECT
                month,
                fill_rate,
                otif_pct,
                cycle_time,
                order_count
            FROM `arizona-poc.{self.bq_dataset}.stox_vw_performance_kpis`
            ORDER BY month DESC
            LIMIT 12
            """

            rows = self.bq.execute_query(query)

            return {
                "data": rows,
                "data_source": "real",
                "table": "stox_vw_performance_kpis"
            }
        except Exception as e:
            logger.error(f"Failed to get performance KPIs: {e}")
            raise

    def get_margin_analysis(
        self,
        plant: Optional[str] = None,
        limit: int = 100
    ) -> Dict[str, Any]:
        """Get margin analysis from BigQuery view (real data)"""
        try:
            query = f"""
            SELECT
                Plant,
                Material_Number,
                total_sales,
                total_margin,
                avg_margin_pct
            FROM `arizona-poc.{self.bq_dataset}.stox_vw_margin_analysis`
            WHERE 1=1
            """

            if plant:
                query += f" AND Plant = '{plant}'"

            query += f" ORDER BY total_margin DESC LIMIT {limit}"

            rows = self.bq.execute_query(query)

            return {
                "data": rows,
                "data_source": "real",
                "table": "stox_vw_margin_analysis"
            }
        except Exception as e:
            logger.error(f"Failed to get margin analysis: {e}")
            raise

    def get_cfo_rollup(self) -> Dict[str, Any]:
        """Get CFO rollup dashboard data (real data from transaction_data)"""
        try:
            query = f"""
            SELECT
                DATE_TRUNC(Posting_Date, MONTH) as month,
                SUM(CAST(Net_Sales AS FLOAT64)) as net_sales,
                SUM(CAST(Gross_Margin AS FLOAT64)) as gross_margin,
                SUM(CAST(Quantity AS FLOAT64)) as quantity,
                COUNT(DISTINCT Material_Number) as unique_materials,
                COUNT(DISTINCT Plant) as plants
            FROM `arizona-poc.{self.bq_dataset}.transaction_data`
            WHERE Posting_Date IS NOT NULL
            GROUP BY 1
            ORDER BY month DESC
            LIMIT 12
            """

            rows = self.bq.execute_query(query)

            return {
                "data": rows,
                "data_source": "real",
                "table": "transaction_data"
            }
        except Exception as e:
            logger.error(f"Failed to get CFO rollup: {e}")
            raise

    def get_sell_through_analytics(self) -> Dict[str, Any]:
        """Get sell-through analytics (real data from time_series_performance)"""
        try:
            query = f"""
            SELECT *
            FROM `arizona-poc.{self.bq_dataset}.time_series_performance`
            ORDER BY period DESC
            LIMIT 100
            """

            rows = self.bq.execute_query(query)

            return {
                "data": rows,
                "data_source": "real",
                "table": "time_series_performance"
            }
        except Exception as e:
            logger.error(f"Failed to get sell-through analytics: {e}")
            raise
