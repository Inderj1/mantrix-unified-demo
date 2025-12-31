"""
LeadTimeEstimator Service - Lead time estimation using stock rules and SAP MARC data.

Uses a combination of:
1. Rule-based lead time defaults (from lead_time_estimator.pkl)
2. Stock availability from MARD table
3. Plant-specific lead times from MARC table
"""

import pickle
import structlog
from typing import Dict, Any, Optional, List
from pathlib import Path
from src.db.postgresql_client import PostgreSQLClient

logger = structlog.get_logger()


class LeadTimeEstimator:
    """
    Lead time estimator using stock-based rules and SAP plant data.

    Default lead times (from model):
    - in_stock: 3 days
    - partial_stock: 7 days
    - production_required: 14 days
    - special_order: 30 days
    """

    _instance = None
    _initialized = False

    def __init__(self, database: str = "loparex"):
        if LeadTimeEstimator._initialized:
            return

        self.default_lead_times = {
            'in_stock': 3,
            'partial_stock': 7,
            'production_required': 14,
            'special_order': 30
        }
        self.pg_client = PostgreSQLClient(database=database)

        self._load_model()
        LeadTimeEstimator._initialized = True

    def _load_model(self):
        """Load the lead time estimator PKL model for default values."""
        model_path = Path(__file__).parent.parent.parent.parent / "models" / "lead_time_estimator.pkl"

        try:
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)

            # Extract default lead times from model
            defaults = model_data.get('default_lead_times', {})
            if defaults:
                self.default_lead_times.update(defaults)

            self._model_loaded = True
            logger.info(
                "LeadTimeEstimator loaded",
                default_lead_times=self.default_lead_times
            )

        except FileNotFoundError:
            logger.warning("Lead time model not found, using defaults")
            self._model_loaded = True  # Still usable with defaults
        except Exception as e:
            logger.error("Failed to load lead time model", error=str(e))
            self._model_loaded = True  # Still usable with defaults

    def estimate(
        self,
        material_id: str,
        plant: str,
        quantity: float,
        customer_location: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Estimate lead time for a material-plant combination.

        Args:
            material_id: SAP material number (MATNR)
            plant: Plant code (WERKS)
            quantity: Required quantity
            customer_location: Customer country/region for transit calculation

        Returns:
            Dict with lead_time_days, breakdown, stock_status, and category
        """
        # Get stock from MARD
        stock_info = self._get_stock(material_id, plant)
        available_stock = stock_info.get('available', 0)

        # Get plant lead time info from MARC
        plant_info = self._get_plant_info(material_id, plant)

        # Determine lead time category
        if available_stock >= quantity:
            category = 'in_stock'
            stock_status = 'full'
        elif available_stock > 0:
            category = 'partial_stock'
            stock_status = 'partial'
        elif plant_info.get('dispo', '') in ('ND', 'PD'):  # MRP types for production
            category = 'production_required'
            stock_status = 'production'
        else:
            category = 'special_order'
            stock_status = 'special'

        # Base lead time from category
        base_lead_time = self.default_lead_times.get(category, 14)

        # Get breakdown from MARC plant data
        breakdown = self._calculate_breakdown(plant_info, category, customer_location)

        # Total lead time considering plant specifics
        total_lead_time = sum(breakdown.values())

        # If MARC has a specific planned delivery time, use it
        marc_lead_time = plant_info.get('plifz', 0)
        if marc_lead_time and marc_lead_time > 0:
            total_lead_time = max(total_lead_time, marc_lead_time)

        return {
            "lead_time_days": total_lead_time,
            "category": category,
            "stock_status": stock_status,
            "available_stock": available_stock,
            "coverage_pct": round((available_stock / max(quantity, 1)) * 100, 1),
            "breakdown": breakdown,
            "plant": plant,
            "plant_name": self._get_plant_name(plant),
            "delivery_date": self._calculate_delivery_date(total_lead_time),
        }

    def estimate_multiple_plants(
        self,
        material_id: str,
        quantity: float,
        customer_location: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Estimate lead time across all plants that have the material.

        Returns plants sorted by lead time (fastest first).
        """
        # Get all plants with this material from MARC
        plants = self._get_material_plants(material_id)

        results = []
        for plant_code in plants:
            estimate = self.estimate(
                material_id=material_id,
                plant=plant_code,
                quantity=quantity,
                customer_location=customer_location
            )
            results.append(estimate)

        # Sort by lead time
        results.sort(key=lambda x: x['lead_time_days'])

        return results

    def _get_stock(self, material_id: str, plant: str) -> Dict[str, Any]:
        """Get stock availability from MARD table."""
        query = """
            SELECT
                labst as unrestricted,
                insme as quality_inspection,
                einme as restricted,
                speme as blocked,
                (COALESCE(labst, 0) - COALESCE(speme, 0)) as available
            FROM sap_master.mard
            WHERE matnr = %s AND werks = %s
        """
        try:
            rows = self.pg_client.execute_query(query, (material_id.strip(), plant.strip()))
            if rows:
                return {
                    'unrestricted': float(rows[0]['unrestricted'] or 0),
                    'quality_inspection': float(rows[0]['quality_inspection'] or 0),
                    'restricted': float(rows[0]['restricted'] or 0),
                    'blocked': float(rows[0]['blocked'] or 0),
                    'available': float(rows[0]['available'] or 0),
                }
        except Exception as e:
            logger.warning("Error fetching stock", material=material_id, plant=plant, error=str(e))

        return {'available': 0, 'unrestricted': 0}

    def _get_plant_info(self, material_id: str, plant: str) -> Dict[str, Any]:
        """Get plant-specific lead time info from MARC table."""
        query = """
            SELECT
                plifz,  -- Planned delivery time (days)
                webaz,  -- GR processing time (days)
                dzeit,  -- In-house production time (days)
                dispo,  -- MRP controller/type
                dismm,  -- MRP type
                fhori,  -- Planning calendar
                eisbe   -- Safety stock
            FROM sap_master.marc
            WHERE matnr = %s AND werks = %s
        """
        try:
            rows = self.pg_client.execute_query(query, (material_id.strip(), plant.strip()))
            if rows:
                return {
                    'plifz': int(rows[0]['plifz'] or 0),
                    'webaz': float(rows[0]['webaz'] or 0),
                    'dzeit': float(rows[0]['dzeit'] or 0),
                    'dispo': rows[0]['dispo'] or '',
                    'dismm': rows[0]['dismm'] or '',
                    'eisbe': float(rows[0]['eisbe'] or 0),
                }
        except Exception as e:
            logger.warning("Error fetching plant info", material=material_id, plant=plant, error=str(e))

        return {}

    def _get_material_plants(self, material_id: str) -> List[str]:
        """Get all plants that carry this material."""
        query = """
            SELECT DISTINCT werks
            FROM sap_master.marc
            WHERE matnr = %s
            ORDER BY werks
        """
        try:
            rows = self.pg_client.execute_query(query, (material_id.strip(),))
            return [row['werks'].strip() for row in rows if row['werks']]
        except Exception as e:
            logger.warning("Error fetching material plants", material=material_id, error=str(e))

        # Default plants if query fails
        return ['2100', '2500', '3000']

    def _calculate_breakdown(
        self,
        plant_info: Dict[str, Any],
        category: str,
        customer_location: Optional[str] = None
    ) -> Dict[str, float]:
        """Calculate lead time breakdown by stage."""
        # Get values from MARC or use defaults
        production_time = plant_info.get('dzeit', 0)
        gr_processing = plant_info.get('webaz', 0)

        # Default breakdown based on category
        if category == 'in_stock':
            production = 0
            quality_check = 0.5
            packaging = 0.5
            transit = 2
        elif category == 'partial_stock':
            production = production_time if production_time > 0 else 3
            quality_check = 0.5
            packaging = 0.5
            transit = 3
        elif category == 'production_required':
            production = production_time if production_time > 0 else 8
            quality_check = 1
            packaging = 1
            transit = 4
        else:  # special_order
            production = production_time if production_time > 0 else 20
            quality_check = 2
            packaging = 1
            transit = 7

        # Add GR processing if available
        if gr_processing > 0:
            quality_check = gr_processing

        # Adjust transit based on customer location
        if customer_location:
            transit = self._estimate_transit(customer_location)

        return {
            'production': round(production, 1),
            'quality_check': round(quality_check, 1),
            'packaging': round(packaging, 1),
            'transit': round(transit, 1),
        }

    def _estimate_transit(self, customer_location: str) -> float:
        """Estimate transit time based on customer location."""
        location = customer_location.upper()

        # US domestic
        if location in ('US', 'USA', 'UNITED STATES'):
            return 2

        # North America
        if location in ('CA', 'CANADA', 'MX', 'MEXICO'):
            return 4

        # Europe
        if location in ('DE', 'FR', 'UK', 'GB', 'IT', 'ES', 'NL', 'BE'):
            return 7

        # Asia Pacific
        if location in ('CN', 'JP', 'KR', 'TW', 'SG', 'AU'):
            return 10

        # Default international
        return 7

    def _get_plant_name(self, plant: str) -> str:
        """Get plant name from code."""
        plant_names = {
            '2100': 'Chicago, IL',
            '2500': 'Columbus, OH',
            '3000': 'Houston, TX',
            '1000': 'Milwaukee, WI',
            '4000': 'Los Angeles, CA',
        }
        return plant_names.get(plant.strip(), f'Plant {plant}')

    def _calculate_delivery_date(self, lead_time_days: int) -> str:
        """Calculate expected delivery date."""
        from datetime import datetime, timedelta
        delivery = datetime.now() + timedelta(days=lead_time_days)
        return delivery.strftime('%Y-%m-%d')


# Singleton instance getter
_estimator_instance = None


def get_lead_time_estimator(database: str = "loparex") -> LeadTimeEstimator:
    """Get the singleton LeadTimeEstimator instance."""
    global _estimator_instance
    if _estimator_instance is None:
        _estimator_instance = LeadTimeEstimator(database=database)
    return _estimator_instance
