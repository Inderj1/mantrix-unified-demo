"""
Event Log Extractor for Process Mining
Converts BigQuery tables to standardized event log format
"""
from typing import List, Dict, Any, Optional
from datetime import datetime
import structlog
from ...db.bigquery import BigQueryClient

logger = structlog.get_logger()


class EventExtractor:
    """Extract event logs from BigQuery tables for process mining"""

    def __init__(self):
        self.bq_client = BigQueryClient()

    def extract_o2c_events(
        self,
        date_from: str,
        date_to: str,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Extract Order-to-Cash events from sales_order_cockpit_export

        Args:
            date_from: Start date (YYYY-MM-DD)
            date_to: End date (YYYY-MM-DD)
            filters: Optional filters (sales_org, customer, region, etc.)

        Returns:
            List of events with structure:
            - case_id: Unique order identifier
            - activity: Activity name
            - timestamp: Activity timestamp
            - resource: Person/system that performed activity
            - attributes: Additional contextual data
        """
        logger.info(f"Extracting O2C events from {date_from} to {date_to}")

        # Build filter clause
        filter_clause = ""
        if filters:
            conditions = []
            if filters.get('sales_org'):
                conditions.append(f"SalesOrganization = '{filters['sales_org']}'")
            if filters.get('customer'):
                conditions.append(f"CustomerName1 LIKE '%{filters['customer']}%'")
            if filters.get('min_value'):
                conditions.append(f"SalesOrderValue >= {filters['min_value']}")

            if conditions:
                filter_clause = " AND " + " AND ".join(conditions)

        # Extract events for different activities in the O2C process
        # Note: All CTEs must have identical structure for UNION ALL
        query = f"""
        SELECT
            SalesDocument_VBELN as case_id,
            'Order Created' as activity,
            TIMESTAMP(CreationDate_ERDAT) as timestamp,
            COALESCE(SalesRepHeaderName_KUNNR, 'System') as resource,
            TO_JSON_STRING(STRUCT(
                CustomerName1 as customer_name,
                SalesOrganization as sales_org,
                DistributionChannel as dist_channel,
                CAST(SalesOrderValue as FLOAT64) as order_value
            )) as attributes
        FROM `arizona-poc.copa_export_copa_data_000000000000.sales_order_cockpit_export`
        WHERE CreationDate_ERDAT BETWEEN DATE '{date_from}' AND DATE '{date_to}'
            {filter_clause}

        UNION ALL

        SELECT
            SalesDocument_VBELN as case_id,
            'Pickup Scheduled' as activity,
            TIMESTAMP(Pickup_Appointment_Date) as timestamp,
            COALESCE(SalesRepHeaderName_KUNNR, 'System') as resource,
            TO_JSON_STRING(STRUCT(
                CustomerName1 as customer_name,
                SalesOrganization as sales_org,
                DistributionChannel as dist_channel,
                CAST(SalesOrderValue as FLOAT64) as order_value
            )) as attributes
        FROM `arizona-poc.copa_export_copa_data_000000000000.sales_order_cockpit_export`
        WHERE CreationDate_ERDAT BETWEEN DATE '{date_from}' AND DATE '{date_to}'
            AND Pickup_Appointment_Date IS NOT NULL
            {filter_clause}

        UNION ALL

        SELECT
            SalesDocument_VBELN as case_id,
            'Goods Picked Up' as activity,
            TIMESTAMP(Pickup_Departure_Date) as timestamp,
            COALESCE(SalesRepHeaderName_KUNNR, 'System') as resource,
            TO_JSON_STRING(STRUCT(
                CustomerName1 as customer_name,
                SalesOrganization as sales_org,
                DistributionChannel as dist_channel,
                CAST(SalesOrderValue as FLOAT64) as order_value
            )) as attributes
        FROM `arizona-poc.copa_export_copa_data_000000000000.sales_order_cockpit_export`
        WHERE CreationDate_ERDAT BETWEEN DATE '{date_from}' AND DATE '{date_to}'
            AND Pickup_Departure_Date IS NOT NULL
            {filter_clause}

        UNION ALL

        SELECT
            SalesDocument_VBELN as case_id,
            'Delivery Scheduled' as activity,
            TIMESTAMP(Delivery_Appointment_Date) as timestamp,
            COALESCE(SalesRepHeaderName_KUNNR, 'System') as resource,
            TO_JSON_STRING(STRUCT(
                CustomerName1 as customer_name,
                SalesOrganization as sales_org,
                DistributionChannel as dist_channel,
                CAST(SalesOrderValue as FLOAT64) as order_value
            )) as attributes
        FROM `arizona-poc.copa_export_copa_data_000000000000.sales_order_cockpit_export`
        WHERE CreationDate_ERDAT BETWEEN DATE '{date_from}' AND DATE '{date_to}'
            AND Delivery_Appointment_Date IS NOT NULL
            {filter_clause}

        UNION ALL

        SELECT
            SalesDocument_VBELN as case_id,
            'Goods Delivered' as activity,
            TIMESTAMP(ActualGoodsMovementDate_WADAT_IST) as timestamp,
            COALESCE(SalesRepHeaderName_KUNNR, 'System') as resource,
            TO_JSON_STRING(STRUCT(
                CustomerName1 as customer_name,
                SalesOrganization as sales_org,
                DistributionChannel as dist_channel,
                CAST(SalesOrderValue as FLOAT64) as order_value
            )) as attributes
        FROM `arizona-poc.copa_export_copa_data_000000000000.sales_order_cockpit_export`
        WHERE CreationDate_ERDAT BETWEEN DATE '{date_from}' AND DATE '{date_to}'
            AND ActualGoodsMovementDate_WADAT_IST IS NOT NULL
            {filter_clause}

        UNION ALL

        SELECT
            SalesDocument_VBELN as case_id,
            'Invoice Generated' as activity,
            TIMESTAMP(BillingDate_FKDAT) as timestamp,
            COALESCE(SalesRepHeaderName_KUNNR, 'System') as resource,
            TO_JSON_STRING(STRUCT(
                CustomerName1 as customer_name,
                SalesOrganization as sales_org,
                DistributionChannel as dist_channel,
                CAST(SalesOrderValue as FLOAT64) as order_value
            )) as attributes
        FROM `arizona-poc.copa_export_copa_data_000000000000.sales_order_cockpit_export`
        WHERE CreationDate_ERDAT BETWEEN DATE '{date_from}' AND DATE '{date_to}'
            AND BillingDate_FKDAT IS NOT NULL
            {filter_clause}

        ORDER BY case_id, timestamp
        """

        try:
            import json
            results = self.bq_client.execute_query(query)

            # Convert to proper event log format
            events = []
            for row in results:
                # Parse JSON string attributes
                try:
                    attributes = json.loads(row['attributes']) if row.get('attributes') else {}
                except:
                    attributes = {}

                event = {
                    'case_id': row['case_id'],
                    'activity': row['activity'],
                    'timestamp': row['timestamp'].isoformat() if isinstance(row['timestamp'], datetime) else row['timestamp'],
                    'resource': row['resource'] or 'System',
                    'attributes': attributes
                }
                events.append(event)

            logger.info(f"Extracted {len(events)} events for {len(set(e['case_id'] for e in events))} cases")
            return events

        except Exception as e:
            logger.error(f"Error extracting O2C events: {e}")
            raise

    def extract_p2p_events(
        self,
        date_from: str,
        date_to: str,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Extract Procure-to-Pay events (partial implementation)
        Currently limited data available in sales_order_cockpit_export
        """
        logger.info("P2P process mining not fully supported with current data")
        return []

    def extract_q2c_events(
        self,
        date_from: str,
        date_to: str,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Extract Quote-to-Cash events
        Uses O2C events as foundation (can be extended with quote data if available)
        """
        logger.info("Q2C uses O2C data - extend with quote/proposal data when available")
        return self.extract_o2c_events(date_from, date_to, filters)

    def get_available_processes(self) -> List[Dict[str, Any]]:
        """
        Return list of processes that can be mined from available data
        """
        return [
            {
                'id': 'order-to-cash',
                'name': 'Order-to-Cash (O2C)',
                'description': 'End-to-end order fulfillment process',
                'activities': [
                    'Order Created',
                    'Pickup Scheduled',
                    'Goods Picked Up',
                    'Delivery Scheduled',
                    'Goods Delivered',
                    'Invoice Generated'
                ],
                'data_source': 'sales_order_cockpit_export',
                'supported': True
            },
            {
                'id': 'quote-to-cash',
                'name': 'Quote-to-Cash (Q2C)',
                'description': 'Sales process from quote to revenue',
                'activities': ['Order Created', 'Goods Delivered', 'Invoice Generated'],
                'data_source': 'sales_order_cockpit_export',
                'supported': True,
                'note': 'Limited to order fulfillment portion (quote data not available)'
            },
            {
                'id': 'procure-to-pay',
                'name': 'Procure-to-Pay (P2P)',
                'description': 'Complete procurement lifecycle',
                'activities': [],
                'data_source': None,
                'supported': False,
                'note': 'Procurement data not available in current dataset'
            }
        ]
