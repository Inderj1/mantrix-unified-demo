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
        from ...db.postgresql_client import PostgreSQLClient
        self.pg_client = PostgreSQLClient(database="mantrix_nexxt")

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

    def extract_consignment_kit_events(
        self,
        date_from: str,
        date_to: str,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Extract Consignment Kit Management events from PostgreSQL

        Args:
            date_from: Start date (YYYY-MM-DD)
            date_to: End date (YYYY-MM-DD)
            filters: Optional filters (hospital, distributor, kit_type, etc.)

        Returns:
            List of events with structure:
            - case_id: Kit ID
            - activity: Activity name
            - timestamp: Activity timestamp
            - resource: Owner (Hospital/Distributor/FedEx)
            - attributes: Additional contextual data
        """
        logger.info(f"Extracting Consignment Kit events from {date_from} to {date_to}")

        try:
            # Build filter clause
            filter_clause = ""
            params = [date_from, date_to]

            if filters:
                conditions = []
                if filters.get('hospital'):
                    conditions.append(f"hospital_name LIKE %s")
                    params.append(f"%{filters['hospital']}%")
                if filters.get('distributor'):
                    conditions.append(f"distributor_name LIKE %s")
                    params.append(f"%{filters['distributor']}%")
                if filters.get('kit_type'):
                    conditions.append(f"kit_type = %s")
                    params.append(filters['kit_type'])

                if conditions:
                    filter_clause = " AND " + " AND ".join(conditions)

            # Extract events from consignment_kit_process_steps table
            query = f"""
            SELECT
                s.kit_id as case_id,
                s.step_name as activity,
                COALESCE(s.completed_at, s.started_at, s.created_at) as timestamp,
                s.owner as resource,
                json_build_object(
                    'hospital', k.hospital_name,
                    'distributor', k.distributor_name,
                    'kit_type', k.kit_type,
                    'step_number', s.step_number,
                    'duration_hours', s.duration_hours,
                    'status', s.status
                )::text as attributes
            FROM consignment_kit_process_steps s
            JOIN consignment_kit_tracking k ON s.kit_id = k.kit_id
            WHERE COALESCE(s.completed_at, s.started_at, s.created_at) >= %s
            AND COALESCE(s.completed_at, s.started_at, s.created_at) <= %s
            {filter_clause}
            ORDER BY s.kit_id, s.step_number, timestamp
            """

            results = self.pg_client.execute_query(query, tuple(params))

            events = []
            for row in results:
                # Parse JSON string attributes
                import json
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
            logger.error(f"Error extracting Consignment Kit events: {e}")
            raise

    def extract_loaner_process_events(
        self,
        date_from: str,
        date_to: str,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Extract Loaner Process events from PostgreSQL

        Args:
            date_from: Start date (YYYY-MM-DD)
            date_to: End date (YYYY-MM-DD)
            filters: Optional filters (hospital, distributor, equipment_type, etc.)

        Returns:
            List of events with structure:
            - case_id: Loaner ID
            - activity: Activity name
            - timestamp: Activity timestamp
            - resource: Owner (Hospital/Distributor/FedEx/Both)
            - attributes: Additional contextual data
        """
        logger.info(f"Extracting Loaner Process events from {date_from} to {date_to}")

        try:
            # Build filter clause
            filter_clause = ""
            params = [date_from, date_to]

            if filters:
                conditions = []
                if filters.get('hospital'):
                    conditions.append(f"hospital_name LIKE %s")
                    params.append(f"%{filters['hospital']}%")
                if filters.get('distributor'):
                    conditions.append(f"distributor_name LIKE %s")
                    params.append(f"%{filters['distributor']}%")
                if filters.get('equipment_type'):
                    conditions.append(f"equipment_type = %s")
                    params.append(filters['equipment_type'])

                if conditions:
                    filter_clause = " AND " + " AND ".join(conditions)

            # Extract events from loaner_process_steps table
            query = f"""
            SELECT
                s.loaner_id as case_id,
                s.step_name as activity,
                COALESCE(s.completed_at, s.started_at, s.created_at) as timestamp,
                s.owner as resource,
                json_build_object(
                    'hospital', l.hospital_name,
                    'distributor', l.distributor_name,
                    'equipment_type', l.equipment_type,
                    'step_number', s.step_number,
                    'duration_hours', s.duration_hours,
                    'status', s.status
                )::text as attributes
            FROM loaner_process_steps s
            JOIN loaner_process_tracking l ON s.loaner_id = l.loaner_id
            WHERE COALESCE(s.completed_at, s.started_at, s.created_at) >= %s
            AND COALESCE(s.completed_at, s.started_at, s.created_at) <= %s
            {filter_clause}
            ORDER BY s.loaner_id, s.step_number, timestamp
            """

            results = self.pg_client.execute_query(query, tuple(params))

            events = []
            for row in results:
                # Parse JSON string attributes
                import json
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
            logger.error(f"Error extracting Loaner Process events: {e}")
            raise

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
                'id': 'consignment-kit',
                'name': 'Consignment Kit Management',
                'description': 'Hospital-distributor consignment kit lifecycle tracking',
                'activities': [
                    'Kit Request',
                    'Transfer Order',
                    'Pick & Ship DC',
                    'Kit in Transit',
                    'Receipt',
                    'Surgery',
                    'Usage Record',
                    'Ship Replacements',
                    'Replace Transit',
                    'Restock Kit',
                    'Kit Available'
                ],
                'data_source': 'consignment_kit_tracking',
                'supported': True
            },
            {
                'id': 'loaner-process',
                'name': 'Loaner Process',
                'description': 'Hospital-distributor loaner equipment lifecycle tracking',
                'activities': [
                    'Kit Request',
                    'Transfer Order',
                    'Pick & Ship DC',
                    'Kit in Transit',
                    'Receipt',
                    'Surgery',
                    'Usage Report',
                    'Return Arrange',
                    'Return Transit',
                    'DC Receipt & QC',
                    'Invoice Process'
                ],
                'data_source': 'loaner_process_tracking',
                'supported': True
            },
            {
                'id': 'quote-to-cash',
                'name': 'Quote-to-Cash (Q2C)',
                'description': 'Sales process from quote to revenue',
                'activities': ['Order Created', 'Goods Delivered', 'Invoice Generated'],
                'data_source': 'sales_order_cockpit_export',
                'supported': True
            },
            {
                'id': 'procure-to-pay',
                'name': 'Procure-to-Pay (P2P)',
                'description': 'Complete procurement lifecycle',
                'activities': [
                    'Purchase Requisition',
                    'PO Created',
                    'PO Approved',
                    'Goods Receipt',
                    'Invoice Receipt',
                    'Payment'
                ],
                'data_source': 'procurement_data',
                'supported': True
            }
        ]
