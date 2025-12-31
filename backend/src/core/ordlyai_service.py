"""
ORDLY.AI Service - Data access layer for Order Intelligence Platform.

Provides methods to fetch orders from loparex database with pipeline stages,
customer insights, margin predictions, and SAP details.

Now reads from purchase_orders.po_headers for extracted PO data.
"""

from typing import List, Dict, Any, Optional
import structlog
from src.db.postgresql_client import PostgreSQLClient
from src.core.similar_order_matcher import get_similar_order_matcher
from src.core.ordlyai_static_data import (
    DEMO_ORDERS, get_order, get_order_financials, get_customer_metrics,
    get_sku_options_for_order, format_margin_waterfall,
    # Multi-line order support
    get_order_line_items, get_line_item, get_sku_options_for_line,
    format_line_item_for_api, format_order_with_lines_for_api,
    derive_order_stage, derive_order_status, LineItem
)

logger = structlog.get_logger()

# Selected POs with complete data and SAP order history
# Shurtape 1-line | Royal 2-line | Royal 3-line | Quanex 4-line | 3M (completed)
TEST_ORDER_IDS = ('3588457', '160769', '160008', '841206', '4500892341')
TEST_MODE = True  # Set to False to show all orders


class OrdlyAIService:
    """Service for ORDLY.AI order management operations."""

    def __init__(self, database: str = "loparex"):
        self.pg_client = PostgreSQLClient(database=database)

    def get_pipeline_orders(self, limit: int = 50) -> Dict[str, Any]:
        """
        Get orders with pipeline stages for SalesOrderPipeline component.
        Reads from purchase_orders.po_headers (extracted PO data).
        """
        query = """
            SELECT DISTINCT ON (po.po_number)
                po.po_number as id,
                po.buyer_company as customer,
                COALESCE(li.description, 'Silicone Release Liner') as material,
                COALESCE(li.quantity, 1) as quantity,
                COALESCE(li.uom, 'EA') as unit,
                po.total_amount as value,
                'USD' as currency,
                po.order_date as created_date,
                po.buyer_name as customer_id,
                COALESCE(li.item_number, 'SKU-0001') as material_id,
                COALESCE(po.ship_to_state, 'US') as plant,
                COALESCE(op.stage, 1) as stage,
                COALESCE(op.stage_label, 'Decisioning') as stage_label,
                COALESCE(op.status, 'processing') as status,
                po.payment_terms,
                po.freight_terms,
                po.incoterms,
                po.ship_to_name,
                po.ship_to_city,
                po.ship_to_state,
                po.requested_delivery_date
            FROM purchase_orders.po_headers po
            LEFT JOIN purchase_orders.po_line_items li ON po.id = li.po_id AND li.line_number = 1
            LEFT JOIN ml_insights.ordlyai_order_pipeline op ON po.po_number = op.vbeln
            WHERE (%s = FALSE OR po.po_number IN %s)
            ORDER BY po.po_number, COALESCE(op.stage, 1) ASC, po.order_date DESC
            LIMIT %s
        """
        rows = self.pg_client.execute_query(query, (TEST_MODE, TEST_ORDER_IDS, limit))

        orders = []
        for row in rows:
            value = float(row["value"]) if row["value"] else 0
            po_number = row["id"].strip() if row["id"] else ""

            # Use static data for consistent margins across all pipeline stages
            static_order = get_order(po_number)
            if static_order:
                financials = static_order["financials"]
                estimated_margin = financials.margin_pct
                # Get line items from static data
                line_items_data = static_order.get("line_items", [])
                line_items = [
                    {
                        "lineNumber": li.line_number,
                        "material": li.material,
                        "materialId": li.material_id,
                        "quantity": li.quantity,
                        "unit": li.unit,
                        "unitPrice": li.unit_price,
                        "extendedPrice": li.extended_price,
                        "lineStage": li.line_stage,
                        "lineStatus": li.line_status,
                        "selectedSku": li.selected_sku,
                        "selectedPlant": li.selected_plant,
                        "marginPct": li.financials.margin_pct if li.financials else None,
                        "marginDollar": li.financials.margin_dollar if li.financials else None,
                    }
                    for li in line_items_data
                ]
                line_count = len(line_items_data) if line_items_data else 1
            else:
                # Fallback for orders not in static data
                estimated_margin = 26.0
                line_items = []
                line_count = 1

            orders.append({
                "id": f"PO-{row['id'].strip()}" if row["id"] else "",
                "customer": row["customer"] or "Unknown Customer",
                "material": row["material"] or "Unknown Material",
                "quantity": self._format_quantity(row["quantity"]),
                "unit": row["unit"].strip() if row["unit"] else "",
                "value": value,
                "margin": round(estimated_margin, 1),
                "stage": row["stage"],
                "stageLabel": row["stage_label"],
                "status": row["status"],
                "createdDate": str(row["created_date"]) if row["created_date"] else None,
                "customerId": row["customer_id"].strip() if row["customer_id"] else "",
                "materialId": row["material_id"].strip() if row["material_id"] else "",
                "plant": row["plant"] or "",
                # Additional PO-specific fields
                "paymentTerms": row["payment_terms"] or "",
                "freightTerms": row["freight_terms"] or "",
                "incoterms": row["incoterms"] or "",
                "shipTo": f"{row['ship_to_name'] or ''}, {row['ship_to_city'] or ''} {row['ship_to_state'] or ''}".strip(", "),
                "deliveryDate": str(row["requested_delivery_date"]) if row["requested_delivery_date"] else None,
                # Multi-line order data
                "lineItems": line_items,
                "lineCount": line_count,
            })

        # Calculate stats
        stats = self._calculate_pipeline_stats(orders)

        return {"orders": orders, "stats": stats}

    def get_pipeline_stats(self) -> Dict[str, Any]:
        """Get summary statistics for the pipeline."""
        query = """
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN op.stage < 4 THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN op.status = 'escalated' THEN 1 ELSE 0 END) as escalated,
                SUM(CASE WHEN op.stage = 4 THEN 1 ELSE 0 END) as completed,
                SUM(v.netwr) as pipeline_value,
                AVG(mg.margin_predicted_pct) as avg_margin
            FROM sap_sd.vbak v
            JOIN ml_insights.ordlyai_order_pipeline op ON v.vbeln = op.vbeln
            JOIN sap_sd.vbap p ON v.vbeln = p.vbeln AND p.posnr = '10'
            LEFT JOIN ml_insights.cm_insights_margin mg
                ON v.kunnr = mg.kunnr AND p.matnr = mg.matnr
        """
        rows = self.pg_client.execute_query(query)
        if rows:
            row = rows[0]
            return {
                "total": row["total"] or 0,
                "inProgress": row["in_progress"] or 0,
                "escalated": row["escalated"] or 0,
                "completed": row["completed"] or 0,
                "pipelineValue": float(row["pipeline_value"]) if row["pipeline_value"] else 0,
                "avgMargin": float(row["avg_margin"]) if row["avg_margin"] else 0,
            }
        return {}

    def get_intent_orders(self, limit: int = 20) -> Dict[str, Any]:
        """
        Get orders for CustomerIntentCockpit component.
        Reads from purchase_orders.po_headers (extracted PO data).
        Returns all extracted fields for document display.
        """
        query = """
            SELECT DISTINCT ON (po.po_number)
                po.po_number as id,
                po.buyer_company as customer,
                po.po_number as po_reference,
                -- Subject will be generated in Python with more context
                li.description as material_desc_raw,
                li.quantity as qty_raw,
                li.uom as uom_raw,
                po.ship_to_city as city_raw,
                po.total_amount as value,
                po.order_date as received,
                COALESCE(op.status, 'new') as status,
                CASE
                    WHEN op.status = 'rush' THEN 'high'
                    WHEN op.status = 'escalated' THEN 'high'
                    ELSE 'normal'
                END as priority,
                po.extraction_confidence * 100 as confidence,
                -- Buyer info
                po.buyer_name,
                po.buyer_email,
                po.buyer_phone,
                po.buyer_address,
                -- Ship-to info
                po.ship_to_name,
                po.ship_to_address,
                po.ship_to_city,
                po.ship_to_state,
                po.ship_to_zip,
                -- Bill-to info
                po.bill_to_name,
                po.bill_to_address,
                po.bill_to_city,
                po.bill_to_state,
                po.bill_to_zip,
                -- Terms and delivery
                po.payment_terms,
                po.freight_terms,
                po.incoterms,
                po.requested_delivery_date,
                po.shipping_instructions,
                po.special_instructions,
                -- Line item details
                li.item_number,
                li.description as material_description,
                li.quantity,
                li.uom,
                li.unit_price,
                li.material_spec,
                li.roll_width,
                li.requested_date as line_requested_date
            FROM purchase_orders.po_headers po
            LEFT JOIN purchase_orders.po_line_items li ON po.id = li.po_id AND li.line_number = 1
            LEFT JOIN ml_insights.ordlyai_order_pipeline op ON po.po_number = op.vbeln
            WHERE (%s = FALSE OR po.po_number IN %s)
            ORDER BY po.po_number, po.order_date DESC
            LIMIT %s
        """
        rows = self.pg_client.execute_query(query, (TEST_MODE, TEST_ORDER_IDS, limit))

        orders = []
        for row in rows:
            tags = []
            if row["status"] == "rush":
                tags.append("Rush")
            tags.append("New Order")

            # Build shipTo and billTo strings
            ship_to = ", ".join(filter(None, [
                row["ship_to_name"],
                row["ship_to_address"],
                row["ship_to_city"],
                row["ship_to_state"],
                row["ship_to_zip"]
            ]))
            bill_to = ", ".join(filter(None, [
                row["bill_to_name"],
                row["bill_to_address"],
                row["bill_to_city"],
                row["bill_to_state"],
                row["bill_to_zip"]
            ]))

            # Format quantity with UOM
            qty = row["quantity"]
            uom = row["uom"] or "EA"
            quantity_str = f"{float(qty):,.0f} {uom}" if qty else ""

            # Generate descriptive subject (7-8 words)
            # Format: "[Material] order - [Qty] [UOM] to [City]"
            qty_raw = row["qty_raw"]
            uom_raw = (row["uom_raw"] or "EA").upper()
            material_raw = row["material_desc_raw"] or ""
            city_raw = row["city_raw"] or ""

            # Shorten material description to key words (2-3 words max)
            material_short = self._shorten_material(material_raw) if material_raw else ""

            # Format quantity - only show if reasonable and not a parsing error
            qty_formatted = ""
            po_num = row["po_reference"].strip() if row["po_reference"] else ""
            if qty_raw:
                try:
                    qty_val = float(qty_raw)
                    # Skip if: out of range, or matches PO number (extraction error)
                    is_valid = 1 <= qty_val <= 100000
                    is_po_number = po_num and str(int(qty_val)) == po_num
                    if is_valid and not is_po_number:
                        qty_formatted = f"{qty_val:,.0f}"
                except (ValueError, TypeError):
                    pass

            # Build subject: "Release liner order - 5,000 MSI to Chicago"
            # or "New PO request to Chicago" if no material info
            if material_short:
                if qty_formatted and city_raw:
                    subject = f"{material_short} order - {qty_formatted} {uom_raw} to {city_raw}"
                elif qty_formatted:
                    subject = f"{material_short} order - {qty_formatted} {uom_raw} requested"
                elif city_raw:
                    subject = f"{material_short} order request to {city_raw}"
                else:
                    subject = f"{material_short} order request"
            else:
                # Fallback when no material info
                if city_raw:
                    subject = f"New PO request - delivery to {city_raw}"
                else:
                    subject = "New purchase order request"

            orders.append({
                "id": f"PO-{row['id'].strip()}" if row["id"] else "",
                "poNumber": row["po_reference"].strip() if row["po_reference"] else "",
                "customer": row["customer"] or "Unknown",
                "subject": subject,
                "tags": tags,
                "slaTimer": "2h 15m",  # Simulated SLA
                "priority": row["priority"],
                "confidence": int(row["confidence"]) if row["confidence"] else 85,
                "received": str(row["received"]) if row["received"] else "",
                "value": float(row["value"]) if row["value"] else 0,
                # Buyer details
                "buyerName": row["buyer_name"] or "",
                "buyerEmail": row["buyer_email"] or "",
                "buyerPhone": row["buyer_phone"] or "",
                "buyerAddress": row["buyer_address"] or "",
                # Ship-to details
                "shipToName": row["ship_to_name"] or "",
                "shipToAddress": row["ship_to_address"] or "",
                "shipToCity": row["ship_to_city"] or "",
                "shipToState": row["ship_to_state"] or "",
                "shipToZip": row["ship_to_zip"] or "",
                "shipTo": ship_to,
                # Bill-to details
                "billToName": row["bill_to_name"] or "",
                "billTo": bill_to,
                # Terms
                "paymentTerms": row["payment_terms"] or "",
                "freightTerms": row["freight_terms"] or "",
                "incoterms": row["incoterms"] or "",
                "deliveryDate": str(row["requested_delivery_date"]) if row["requested_delivery_date"] else "",
                "shippingInstructions": row["shipping_instructions"] or "",
                "specialInstructions": row["special_instructions"] or "",
                # Line item details
                "materialId": row["item_number"] or "",
                "materialDescription": row["material_description"] or "",
                "quantity": quantity_str,
                "quantityRaw": float(row["quantity"]) if row["quantity"] else 0,
                "uom": uom,
                "unitPrice": float(row["unit_price"]) if row["unit_price"] else 0,
                "materialSpec": row["material_spec"] or "",
                "rollWidth": row["roll_width"] or "",
                # Multi-line order support - get from static data
                "lineItems": [],
                "lineCount": 1,
            })

            # Enrich with line items from static data
            po_number = row["id"].strip() if row["id"] else ""
            static_order = get_order(po_number)
            if static_order and "line_items" in static_order:
                line_items_data = [
                    {
                        "lineNumber": li.line_number,
                        "material": li.material,
                        "materialId": li.material_id,
                        "quantity": li.quantity,
                        "unit": li.unit,
                        "unitPrice": getattr(li, 'unit_price', 0),
                        "extendedPrice": getattr(li, 'extended_price', 0),
                        "lineStatus": li.line_status,
                        "selectedSku": li.selected_sku,
                        "lineStage": li.line_stage,
                    }
                    for li in static_order["line_items"]
                ]
                orders[-1]["lineItems"] = line_items_data
                orders[-1]["lineCount"] = len(line_items_data)

        stats = {
            "total": len(orders),
            "rush": sum(1 for o in orders if o["priority"] == "high"),
            "avgConf": sum(o["confidence"] for o in orders) / len(orders) if orders else 0,
        }

        return {"orders": orders, "stats": stats}

    def get_order_pdf_path(self, po_number: str) -> Optional[Dict[str, str]]:
        """
        Get the PDF file path for a purchase order.
        Returns file_name and file_path if available.
        """
        query = """
            SELECT file_name, file_path
            FROM purchase_orders.po_headers
            WHERE po_number = %s
        """
        rows = self.pg_client.execute_query(query, (po_number,))
        if rows and rows[0]["file_path"]:
            return {
                "file_name": rows[0]["file_name"] or f"{po_number}.pdf",
                "file_path": rows[0]["file_path"]
            }
        return None

    def get_sku_optimizer_orders(self, limit: int = 10) -> Dict[str, Any]:  # Show all demo orders
        """
        Get orders for SkuBomOptimizer component.
        Reads from purchase_orders.po_headers (extracted PO data).
        """
        query = """
            SELECT DISTINCT ON (po.po_number)
                po.po_number as id,
                po.buyer_name as customer_id,
                po.buyer_company as customer,
                COALESCE(li.description, 'Silicone Release Liner') as requested_spec,
                COALESCE(li.item_number, 'SKU-0001') as material_id,
                COALESCE(li.quantity, 1) as quantity,
                COALESCE(li.uom, 'EA') as unit,
                po.total_amount as value,
                COALESCE(po.ship_to_state, '2100') as plant,
                COALESCE(op.status, 'processing') as status,
                COALESCE(op.stage, 0) as stage,
                po.requested_delivery_date,
                po.payment_terms,
                po.incoterms
            FROM purchase_orders.po_headers po
            LEFT JOIN purchase_orders.po_line_items li ON po.id = li.po_id AND li.line_number = 1
            LEFT JOIN ml_insights.ordlyai_order_pipeline op ON po.po_number = op.vbeln
            WHERE (%s = FALSE OR po.po_number IN %s)
            ORDER BY po.po_number, po.total_amount DESC NULLS LAST
            LIMIT %s
        """
        rows = self.pg_client.execute_query(query, (TEST_MODE, TEST_ORDER_IDS, limit))

        orders = []
        for row in rows:
            value = float(row["value"]) if row["value"] else 0
            po_number = row["id"].strip() if row["id"] else ""

            # Use static data for consistent margins across all pipeline stages
            static_order = get_order(po_number)
            if static_order:
                financials = static_order["financials"]
                estimated_margin = financials.margin_pct
                margin_dollar = financials.margin_dollar
            else:
                estimated_margin = 26.0
                margin_dollar = value * 0.26

            # Extract line items from static data for multi-line support
            line_items_data = []
            line_count = 1
            if static_order and "line_items" in static_order:
                line_count = len(static_order["line_items"])
                line_items_data = [
                    {
                        "lineNumber": li.line_number,
                        "material": li.material,
                        "materialId": li.material_id,
                        "quantity": li.quantity,
                        "unit": li.unit,
                        "lineStatus": li.line_status,
                        "selectedSku": li.selected_sku,
                        "lineStage": li.line_stage,
                    }
                    for li in static_order["line_items"]
                ]

            orders.append({
                "id": f"PO-{po_number}" if po_number else "",
                "intent_id": f"PO-{po_number}" if po_number else "",  # For backwards compatibility
                "customerId": row["customer_id"].strip() if row["customer_id"] else "",
                "customer": row["customer"] or "Unknown",
                "requestedSpec": row["requested_spec"] or "Standard Silicone Release",
                "materialId": row["material_id"].strip() if row["material_id"] else "",
                "quantity": self._format_quantity(row["quantity"]),
                "unit": row["unit"].strip() if row["unit"] else "",
                "plant": row["plant"] or "2100",
                "recommendedSku": row["material_id"].strip()[-8:] if row["material_id"] else "SKU-0001",
                "margin": round(estimated_margin, 1),
                "marginDollar": round(margin_dollar, 2),
                "deliveryDate": str(row["requested_delivery_date"]) if row["requested_delivery_date"] else "2025-01-15",
                "status": "pending" if row["status"] != "committed" else "completed",
                "stage": row["stage"],
                # Additional PO data
                "paymentTerms": row["payment_terms"] or "",
                "incoterms": row["incoterms"] or "",
                "orderValue": value,
                # Multi-line order support
                "lineItems": line_items_data,
                "lineCount": line_count,
            })

        # Calculate stats
        margins = [o["margin"] for o in orders if o["margin"] is not None]
        stats = {
            "pending": len([o for o in orders if o["status"] == "pending"]),
            "avgMargin": round(sum(margins) / len(margins), 1) if margins else 0,
        }

        return {"orders": orders, "stats": stats}

    def get_approval_orders(self, limit: int = 20) -> Dict[str, Any]:
        """
        Get orders for OrderValueControlTower component.
        Reads from purchase_orders.po_headers (extracted PO data).
        """
        query = """
            SELECT DISTINCT ON (po.po_number)
                po.po_number as id,
                po.buyer_company as customer,
                po.buyer_name as customer_id,
                COALESCE(li.item_number, 'SKU-0001') as sku,
                po.total_amount as order_value,
                COALESCE(op.status, 'processing') as status,
                COALESCE(op.stage, 0) as stage,
                po.payment_terms,
                po.incoterms,
                po.ship_to_name,
                po.ship_to_city,
                po.ship_to_state,
                po.requested_delivery_date
            FROM purchase_orders.po_headers po
            LEFT JOIN purchase_orders.po_line_items li ON po.id = li.po_id AND li.line_number = 1
            LEFT JOIN ml_insights.ordlyai_order_pipeline op ON po.po_number = op.vbeln
            WHERE (%s = FALSE OR po.po_number IN %s)
            ORDER BY po.po_number, po.total_amount DESC NULLS LAST
            LIMIT %s
        """
        rows = self.pg_client.execute_query(query, (TEST_MODE, TEST_ORDER_IDS, limit))

        orders = []
        for row in rows:
            order_value = float(row["order_value"]) if row["order_value"] else 0
            po_number = row["id"].strip() if row["id"] else ""

            # Use static data for consistent values across all pipeline stages
            static_order = get_order(po_number)
            if static_order:
                financials = static_order["financials"]
                customer_metrics = static_order["customer_metrics"]
                estimated_margin = financials.margin_pct
                clv_value = customer_metrics.clv
                segment = customer_metrics.segment
                risk_grade = customer_metrics.credit_grade
                risk_score = customer_metrics.risk_score
                alive_probability = customer_metrics.alive_probability
                expected_purchases = customer_metrics.expected_purchases
                avg_order_value = customer_metrics.avg_order_value
                frequency = customer_metrics.frequency
                recency_days = customer_metrics.recency_days
            else:
                # Fallback for orders not in static data
                estimated_margin = 26.0
                clv_value = order_value * 6
                segment = "MAINTAIN"
                risk_grade = "B"
                risk_score = 45
                alive_probability = 0.75
                expected_purchases = 8
                avg_order_value = order_value
                frequency = 8
                recency_days = 45

            # Format CLV value for display
            if clv_value >= 1000000:
                clv_display = f"${clv_value / 1000000:.1f}M"
            elif clv_value >= 1000:
                clv_display = f"${clv_value / 1000:.0f}K"
            else:
                clv_display = f"${clv_value:,.0f}"

            # Approval status: check actual DB status first, then apply auto-approval logic
            db_status = row["status"] or ""
            if db_status == "committed":
                approval_status = "approved"
            elif db_status == "escalated":
                approval_status = "escalated"
            elif db_status == "hold":
                approval_status = "on-hold"
            elif risk_grade in ("A", "A+") and estimated_margin >= 28.0:
                approval_status = "auto-approved"
            else:
                approval_status = "pending"

            # Use static data customer_id if available (SAP customer number)
            static_customer_id = customer_metrics.customer_id if static_order else ""

            orders.append({
                "id": f"PO-{po_number}" if po_number else "",
                "customer": row["customer"] or "Unknown",
                "customerId": static_customer_id or (row["customer_id"].strip() if row["customer_id"] else ""),
                "sku": row["sku"] if row["sku"] else "SKU-0001",
                "orderValue": f"${order_value:,.0f}",
                "margin": round(estimated_margin, 1),
                "stage": row["stage"],
                "segment": segment,
                "creditStatus": risk_grade,
                "approvalStatus": approval_status,
                # CLV metrics from static data
                "clv": clv_value,
                "clvDisplay": clv_display,
                "aliveProbability": alive_probability,
                "expectedPurchases": expected_purchases,
                "avgOrderValue": avg_order_value,
                "avgOrderDisplay": f"${avg_order_value / 1000:.0f}K" if avg_order_value >= 1000 else f"${avg_order_value:,.0f}",
                "frequency": frequency,
                "recencyDays": recency_days,
                # Credit risk metrics from static data
                "riskScore": risk_score,
                "paymentTerms": row["payment_terms"] or "Net 30",
                "approvalLevel": "auto" if risk_grade in ("A", "A+") else "manual",
                "monitoringFrequency": "quarterly",
                "creditMultiplier": 1.5 if risk_grade == "A+" else 1.2 if risk_grade == "A" else 1.0,
                # Additional PO data
                "incoterms": row["incoterms"] or "",
                "shipTo": f"{row['ship_to_name'] or ''}, {row['ship_to_city'] or ''} {row['ship_to_state'] or ''}".strip(", "),
                "deliveryDate": str(row["requested_delivery_date"]) if row["requested_delivery_date"] else None,
            })

        stats = {
            "pending": len([o for o in orders if o["approvalStatus"] == "pending"]),
            "autoApproved": len([o for o in orders if o["approvalStatus"] in ("auto-approved", "approved")]),
            "escalated": len([o for o in orders if o["approvalStatus"] == "escalated"]),
            "onHold": len([o for o in orders if o["approvalStatus"] == "on-hold"]),
            "avgClv": sum(o["clv"] for o in orders) / len(orders) if orders else 0,
        }

        return {"orders": orders, "stats": stats}

    def get_clv_metrics(self, customer_id: str) -> List[Dict[str, Any]]:
        """Get CLV metrics for a specific customer."""
        query = """
            SELECT
                clv.clv,
                clv.alive_probability,
                clv.expected_purchases,
                clv.avg_order_value,
                clv.frequency,
                clv.recency_days,
                clv.tenure_days
            FROM ml_insights.cm_insights_customer_clv clv
            WHERE clv.kunnr = %s
        """
        rows = self.pg_client.execute_query(query, (customer_id,))
        if rows:
            row = rows[0]
            return [
                {"label": "Customer Lifetime Value", "value": f"${float(row['clv']):,.0f}" if row['clv'] else "$0", "good": True},
                {"label": "Expected Purchases", "value": str(int(row['expected_purchases'])) if row['expected_purchases'] else "0", "good": True},
                {"label": "Alive Probability", "value": f"{float(row['alive_probability'])*100:.0f}%" if row['alive_probability'] else "50%", "good": float(row['alive_probability'] or 0.5) > 0.5},
                {"label": "Avg Order Value", "value": f"${float(row['avg_order_value']):,.0f}" if row['avg_order_value'] else "$0", "good": True},
            ]
        return []

    def get_sap_commit_orders(self, limit: int = 20) -> Dict[str, Any]:
        """
        Get orders in Committing/Complete stages for SapCommitTrace component.
        Returns committed orders with SAP document details.
        """
        query = """
            SELECT
                v.vbeln as id,
                v.vbeln as intent_id,
                k.name1 as customer,
                v.netwr as order_value,
                v.waerk as currency,
                op.status as commit_status,
                op.updated_at as committed_at,
                op.updated_by as user_name,
                v.auart as order_type,
                v.erdat as created_date,
                d.zterm as payment_terms,
                d.inco1,
                d.inco2,
                p.matnr,
                p.kwmeng as quantity,
                p.netwr as line_value,
                p.werks as plant
            FROM sap_sd.vbak v
            JOIN ml_insights.ordlyai_order_pipeline op ON v.vbeln = op.vbeln
            JOIN sap_master.kna1 k ON v.kunnr = k.kunnr
            JOIN sap_sd.vbap p ON v.vbeln = p.vbeln AND p.posnr = '10'
            LEFT JOIN sap_sd.vbkd d ON v.vbeln = d.vbeln AND d.posnr = '0'
            WHERE (%s = FALSE OR v.vbeln IN %s)
            ORDER BY op.updated_at DESC
            LIMIT %s
        """
        rows = self.pg_client.execute_query(query, (TEST_MODE, TEST_ORDER_IDS, limit))

        orders = []
        for row in rows:
            commit_status = "success" if row["commit_status"] in ("committed", "processing") else "pending"
            if row["commit_status"] == "escalated":
                commit_status = "failed"

            orders.append({
                "id": f"PO-{row['intent_id'].strip()}" if row["intent_id"] else "",
                "sapOrderId": f"SO-{row['id'].strip()}" if row["id"] else "",  # SAP Sales Order number
                "customer": row["customer"] or "Unknown",
                "orderValue": f"${float(row['order_value']):,.0f}" if row["order_value"] else "$0",
                "commitStatus": commit_status,
                "committedAt": str(row["committed_at"]) if row["committed_at"] else "",
                "user": row["user_name"] or "ORDLY_SYSTEM",
                "orderType": row["order_type"] or "ZDO",
                "paymentTerms": row["payment_terms"] or "NET30",
                "incoterms": f"{row['inco1'] or 'FOB'} {row['inco2'] or ''}".strip(),
                "plant": row["plant"] or "",
                "material": row["matnr"].strip() if row["matnr"] else "",
            })

        stats = {
            "success": len([o for o in orders if o["commitStatus"] == "success"]),
            "pending": len([o for o in orders if o["commitStatus"] == "pending"]),
            "failed": len([o for o in orders if o["commitStatus"] == "failed"]),
            "total": len(orders),
            "rate": len([o for o in orders if o["commitStatus"] == "success"]) / len(orders) * 100 if orders else 0,
        }

        return {"orders": orders, "stats": stats}

    def get_sap_order_details(self, order_id: str) -> Dict[str, Any]:
        """Get detailed SAP fields for a specific order."""
        # Strip prefix if present
        vbeln = order_id.replace("SO-", "").replace("INT-", "").strip()

        query = """
            SELECT
                v.vbeln, v.auart, v.erdat, v.vkorg, v.vtweg, v.spart,
                v.kunnr, k.name1, k.land1, k.ort01, k.pstlz,
                p.posnr, p.matnr, p.kwmeng, p.vrkme, p.netwr, p.werks,
                d.zterm, d.inco1, d.inco2, d.bstkd
            FROM sap_sd.vbak v
            JOIN sap_master.kna1 k ON v.kunnr = k.kunnr
            JOIN sap_sd.vbap p ON v.vbeln = p.vbeln
            LEFT JOIN sap_sd.vbkd d ON v.vbeln = d.vbeln AND d.posnr = '0'
            WHERE v.vbeln = %s
        """
        rows = self.pg_client.execute_query(query, (vbeln,))

        if not rows:
            return {}

        row = rows[0]
        return {
            "header": [
                {"label": "Sales Document", "code": "VBELN", "value": row["vbeln"].strip()},
                {"label": "Document Type", "code": "AUART", "value": row["auart"] or "ZDO"},
                {"label": "Creation Date", "code": "ERDAT", "value": str(row["erdat"])},
                {"label": "Sales Org", "code": "VKORG", "value": row["vkorg"] or ""},
                {"label": "Dist. Channel", "code": "VTWEG", "value": row["vtweg"] or ""},
                {"label": "Division", "code": "SPART", "value": row["spart"] or ""},
            ],
            "partner": [
                {"label": "Sold-To Party", "code": "KUNNR", "value": row["kunnr"].strip()},
                {"label": "Customer Name", "code": "NAME1", "value": row["name1"] or ""},
                {"label": "Country", "code": "LAND1", "value": row["land1"] or ""},
                {"label": "City", "code": "ORT01", "value": row["ort01"] or ""},
            ],
            "lineItem": [
                {"label": "Item Number", "code": "POSNR", "value": row["posnr"] or "000010"},
                {"label": "Material", "code": "MATNR", "value": row["matnr"].strip() if row["matnr"] else ""},
                {"label": "Quantity", "code": "KWMENG", "value": str(row["kwmeng"]) if row["kwmeng"] else "0"},
                {"label": "Net Value", "code": "NETWR", "value": f"${float(row['netwr']):,.2f}" if row["netwr"] else "$0"},
                {"label": "Plant", "code": "WERKS", "value": row["werks"] or ""},
            ],
        }

    def get_similar_orders(self, order_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Get similar historical orders using ML-powered KNN matching.

        Uses the pre-trained SimilarOrderMatcher model to find similar orders
        based on customer, material, quantity, value, and plant features.
        For PO extracts, fetches PO attributes and uses them to find similar SAP orders.

        Falls back to direct database query when ML model returns cross-customer matches.
        """
        vbeln = order_id.replace("SO-", "").replace("INT-", "").replace("ORD-", "").strip()

        # First, try to get PO data from purchase_orders table
        po_query = """
            SELECT
                po.buyer_company,
                po.total_amount,
                po.ship_to_state,
                po.order_date,
                li.description,
                li.quantity
            FROM purchase_orders.po_headers po
            LEFT JOIN purchase_orders.po_line_items li ON po.id = li.po_id AND li.line_number = 1
            WHERE po.po_number = %s
        """
        po_rows = self.pg_client.execute_query(po_query, (vbeln,))

        matcher = get_similar_order_matcher()
        customer_id = None
        value = 50000

        # If we have PO data, use attributes to find similar SAP orders
        if po_rows and matcher.is_loaded():
            po = po_rows[0]
            logger.info("Using ML matcher with PO attributes", order_id=vbeln, customer=po["buyer_company"])

            # Try to find a matching SAP customer by name
            customer_id = self._find_sap_customer(po["buyer_company"] or "")
            material_id = "RELEASE_LINER"  # Generic material category
            quantity = float(po["quantity"]) if po["quantity"] else 10000
            value = float(po["total_amount"]) if po["total_amount"] else 50000
            plant = po["ship_to_state"] or "2100"
            order_date = str(po["order_date"]) if po["order_date"] else None

            logger.info("ML matcher lookup",
                       buyer_company=po["buyer_company"],
                       customer_id=customer_id,
                       value=value,
                       quantity=quantity)

            results = matcher.find_similar(
                customer_id=customer_id,
                material_id=material_id,
                quantity=quantity,
                value=value,
                plant=plant,
                order_date=order_date,
                n_neighbors=limit,
                same_customer_only=True
            )

            # Check if ML results contain same-customer matches
            if results:
                # Get customer name for comparison
                buyer_company = (po["buyer_company"] or "").upper()
                same_customer_results = [
                    r for r in results
                    if buyer_company[:10] in (r.get("customer", "") or "").upper()
                ]

                if same_customer_results:
                    logger.info("ML matcher returned same-customer orders",
                               count=len(same_customer_results))
                    return same_customer_results[:limit]

                # ML results are all cross-customer - use database fallback
                logger.info("ML results are cross-customer, using database fallback",
                           customer_id=customer_id,
                           buyer_company=po["buyer_company"])

                db_results = self._get_same_customer_orders_from_db(
                    customer_id=customer_id,
                    value=value,
                    limit=limit
                )
                if db_results:
                    return db_results

                # If no same-customer orders exist, return ML results as fallback
                logger.info("No same-customer orders in database, returning ML results")
                return results

        # Try using the ML-powered matcher with order ID (for SAP orders)
        if matcher.is_loaded():
            logger.info("Using ML matcher by order ID", order_id=vbeln)
            results = matcher.find_similar_by_order_id(vbeln, n_neighbors=limit)
            if results:
                return results

        # Fall back to returning sample similar orders from database
        logger.info("Using database fallback for similar orders", order_id=vbeln)

        # If we have a customer_id, prioritize same-customer orders
        if customer_id and customer_id not in ("UNKNOWN", "GENERIC"):
            db_results = self._get_same_customer_orders_from_db(
                customer_id=customer_id,
                value=value,
                limit=limit
            )
            if db_results:
                return db_results

        # Generic fallback query
        query = """
            SELECT DISTINCT ON (v.vbeln)
                v.vbeln,
                v.netwr,
                k.name1 as customer,
                m.maktx as material_desc
            FROM sap_sd.vbak v
            JOIN sap_master.kna1 k ON v.kunnr = k.kunnr
            JOIN sap_sd.vbap p ON v.vbeln = p.vbeln AND p.posnr = '10'
            LEFT JOIN sap_master.makt m ON p.matnr = m.matnr AND m.spras = 'E'
            WHERE v.netwr > 10000
            ORDER BY v.vbeln, v.erdat DESC
            LIMIT %s
        """
        rows = self.pg_client.execute_query(query, (limit,))

        results = []
        rank_scores = [92, 87, 83, 78, 74]
        for i, row in enumerate(rows):
            score = rank_scores[min(i, len(rank_scores) - 1)]
            results.append({
                "so": str(row["vbeln"]).strip(),
                "match": f"{score}%",
                "details": f"{row['customer']} - ${float(row['netwr']):,.0f}" if row["netwr"] else row["customer"],
            })

        return results

    def _find_sap_customer(self, company_name: str) -> str:
        """Find matching SAP customer ID (KUNNR) by company name.

        Prioritizes customers with more historical orders to ensure
        the most relevant customer is matched.
        """
        if not company_name:
            return "UNKNOWN"

        # Find customer with most historical orders matching the name
        query = """
            SELECT k.kunnr, k.name1, COUNT(v.vbeln) as order_count
            FROM sap_master.kna1 k
            LEFT JOIN sap_sd.vbak v ON k.kunnr = v.kunnr
            WHERE UPPER(k.name1) LIKE UPPER(%s)
            GROUP BY k.kunnr, k.name1
            ORDER BY order_count DESC
            LIMIT 1
        """
        rows = self.pg_client.execute_query(query, (f"%{company_name[:20]}%",))
        if rows:
            logger.debug("Found SAP customer",
                        company=company_name,
                        matched=rows[0]["name1"],
                        orders=rows[0]["order_count"])
            return rows[0]["kunnr"].strip()

        # Return generic customer ID
        return "GENERIC"

    def _get_same_customer_orders_from_db(
        self,
        customer_id: str,
        value: float,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Direct database query fallback to find orders from the same customer.

        Used when ML model doesn't return same-customer matches.
        Orders are sorted by value similarity to the target order.
        """
        if not customer_id or customer_id in ("UNKNOWN", "GENERIC"):
            return []

        query = """
            SELECT
                v.vbeln,
                v.netwr,
                k.name1 as customer,
                m.maktx as material_desc,
                ABS(v.netwr - %s) as value_diff
            FROM sap_sd.vbak v
            JOIN sap_master.kna1 k ON v.kunnr = k.kunnr
            JOIN sap_sd.vbap p ON v.vbeln = p.vbeln AND p.posnr = '10'
            LEFT JOIN sap_master.makt m ON p.matnr = m.matnr AND m.spras = 'E'
            WHERE v.kunnr = %s
              AND v.netwr > 0
            ORDER BY ABS(v.netwr - %s) ASC
            LIMIT %s
        """

        try:
            rows = self.pg_client.execute_query(query, (value, customer_id, value, limit))

            if not rows:
                logger.info("No same-customer orders found in database", customer_id=customer_id)
                return []

            results = []
            rank_scores = [95, 90, 85, 80, 75]
            for i, row in enumerate(rows):
                score = rank_scores[min(i, len(rank_scores) - 1)]
                order_value = float(row["netwr"]) if row["netwr"] else 0
                results.append({
                    "so": str(row["vbeln"]).strip(),
                    "match": f"{score}%",
                    "similarity_score": float(score),
                    "details": f"{row['customer']} - ${order_value:,.0f}" if order_value else row["customer"],
                    "customer": row["customer"] or "",
                    "value": order_value,
                    "material": row["material_desc"] or "",
                    "quantity": 0,
                })

            logger.info(
                "Found same-customer orders from database",
                customer_id=customer_id,
                count=len(results)
            )
            return results

        except Exception as e:
            logger.error("Error fetching same-customer orders from DB", error=str(e))
            return []

    def _format_quantity(self, qty: Any, unit: str = "") -> str:
        """Format quantity with unit."""
        if qty is None:
            return "0"
        try:
            num = float(qty)
            if num >= 1000:
                formatted = f"{num:,.0f}"
            else:
                formatted = f"{num:.2f}"
            return f"{formatted} {unit.strip()}" if unit else formatted
        except (ValueError, TypeError):
            return str(qty)

    def _shorten_material(self, material: str) -> str:
        """Shorten material description to 2-3 key words for subject line."""
        if not material:
            return "Release liner"

        # Clean up material string - remove special chars except spaces
        import re
        clean = re.sub(r'[^a-zA-Z0-9\s]', ' ', material)
        clean = ' '.join(clean.split())  # normalize whitespace

        # Common keywords to extract (priority order)
        keywords = ["release", "liner", "silicone", "film", "paper", "coating", "adhesive", "pet", "polyester", "bop"]
        words = clean.lower().split()

        # Extract up to 2 relevant keywords
        found = []
        for w in words:
            if any(k in w for k in keywords) and w not in found:
                found.append(w)
                if len(found) >= 2:
                    break

        if found:
            result = " ".join(found)
        else:
            # Fallback: first 2 meaningful words (skip very short ones and common terms)
            skip_words = {"order", "po", "purchase", "item", "line", "spec", "revision", "the", "and", "for"}
            meaningful = [w for w in words if len(w) > 2 and w not in skip_words][:2]
            result = " ".join(meaningful) if meaningful else ""

        # Capitalize first letter of each word, return empty if just generic
        return result.title() if result else ""

    def _calculate_pipeline_stats(self, orders: List[Dict]) -> Dict[str, Any]:
        """Calculate pipeline statistics from orders."""
        total = len(orders)
        in_progress = sum(1 for o in orders if o["stage"] < 4)
        escalated = sum(1 for o in orders if o["status"] == "escalated")
        completed = sum(1 for o in orders if o["stage"] == 4)
        pipeline_value = sum(o["value"] for o in orders)
        margins = [o["margin"] for o in orders if o["margin"] is not None]
        avg_margin = sum(margins) / len(margins) if margins else 0

        return {
            "total": total,
            "inProgress": in_progress,
            "escalated": escalated,
            "completed": completed,
            "pipelineValue": pipeline_value,
            "avgMargin": round(avg_margin, 2),
        }

    def update_order_status(
        self,
        order_id: str,
        action: str,
        note: Optional[str] = None,
        user: str = "ORDLY_SYSTEM"
    ) -> Dict[str, Any]:
        """
        Update order status based on action.

        Actions:
        - promote: Move to next stage
        - approve: Move to Complete (stage 4) with 'committed' status
        - hold: Set status to 'hold'
        - escalate: Set status to 'escalated'
        - reset: Reset to stage 0 with 'processing' status
        """
        # Clean order ID
        vbeln = order_id.replace("PO-", "").replace("SO-", "").replace("INT-", "").replace("ORD-", "").strip()

        # Get current order state
        query = """SELECT stage, status FROM ml_insights.ordlyai_order_pipeline WHERE vbeln = %s"""
        rows = self.pg_client.execute_query(query, (vbeln,))

        if not rows:
            raise ValueError(f"Order {order_id} not found")

        current_stage = rows[0]["stage"]
        current_status = rows[0]["status"]

        # Stage labels
        stage_labels = {
            0: "Intent",
            1: "Decisioning",
            2: "Arbitration",
            3: "Committing",
            4: "Complete"
        }

        # Determine new stage and status based on action
        if action == "promote":
            new_stage = min(current_stage + 1, 4)
            new_status = "processing" if new_stage < 4 else "committed"
            message = f"Order promoted to {stage_labels.get(new_stage, 'Unknown')}"

        elif action == "approve":
            new_stage = 4
            new_status = "committed"
            message = "Order approved and committed"

        elif action == "hold":
            new_stage = current_stage
            new_status = "hold"
            message = "Order placed on hold"

        elif action == "escalate":
            new_stage = current_stage
            new_status = "escalated"
            message = "Order escalated for review"

        elif action == "reset":
            new_stage = 0  # Reset to Intent stage
            new_status = "processing"
            message = "Order reset to Intent stage"

        elif action == "demote":
            # Move back one stage (min stage 0)
            new_stage = max(0, current_stage - 1)
            new_status = "processing"
            stage_name = stage_labels.get(new_stage, "Unknown")
            message = f"Order moved back to {stage_name}"

        else:
            raise ValueError(f"Unknown action: {action}")

        # Update database
        update_query = """
            UPDATE ml_insights.ordlyai_order_pipeline
            SET stage = %s, stage_label = %s, status = %s, updated_at = NOW(), updated_by = %s
            WHERE vbeln = %s
        """
        self.pg_client.execute_query(
            update_query,
            (new_stage, stage_labels.get(new_stage, "Unknown"), new_status, user, vbeln)
        )

        logger.info(
            "Order status updated",
            order_id=vbeln,
            action=action,
            old_stage=current_stage,
            new_stage=new_stage,
            old_status=current_status,
            new_status=new_status
        )

        return {
            "success": True,
            "order_id": vbeln,
            "action": action,
            "new_stage": new_stage,
            "new_status": new_status,
            "message": message
        }

    async def get_material_comparison(self, intent_id: str) -> Dict[str, Any]:
        """
        Get material comparison data for the Override Selection modal.
        Returns SKU options with detailed comparison metrics.
        """
        # Clean up intent ID (remove prefixes)
        clean_id = intent_id.replace("PO-", "").replace("INT-", "").replace("ORD-", "").strip()

        # Get order data
        order = get_order(clean_id)
        if not order:
            logger.warning("Order not found for comparison", intent_id=intent_id)
            return None

        # Get SKU options for this order
        sku_options = get_sku_options_for_order(clean_id)
        financials = order["financials"]
        order_value = financials.order_value

        # Convert to comparison format
        materials = []
        for opt in sku_options:
            margin_dollar = opt.get_margin_dollar(order_value)
            # Calculate unit cost from order value and margin
            total_cost = order_value - margin_dollar
            unit_cost = total_cost / order.get("quantity", 1) if order.get("quantity") else 0

            materials.append({
                "matnr": opt.sku,
                "description": opt.name,
                "spec_match": "Exact Match" if opt.is_exact_match else "Standard Grade" if opt.is_recommended else "Within Tolerance" if opt.is_fastest else "New SKU Required",
                "spec_match_score": 100 if opt.is_exact_match else 85 if opt.is_recommended else 75 if opt.is_fastest else 50,
                "unit_cost": round(unit_cost, 2),
                "total_cost": round(total_cost, 0),
                "margin_pct": opt.margin_pct,
                "margin_dollar": round(margin_dollar, 0),
                "availability": 30000 if opt.availability == "In Stock" else 15000 if opt.availability == "Partial" else 0,
                "coverage_pct": opt.coverage_pct,
                "lead_time": opt.lead_time_days,
                "delivery_date": "2025-01-10" if opt.lead_time_days <= 5 else "2025-01-15" if opt.lead_time_days <= 10 else "2025-01-25",
                "best_plant": f"{opt.plant} ({opt.plant_name})",
                "customer_orders": 18 if opt.is_recommended else 12 if opt.is_exact_match else 6,
                "last_ordered": "Dec 15, 2024",
                "spec_accepted": True if opt.is_recommended or opt.is_fastest else None if opt.is_exact_match else False,
                "spec_accepted_date": "Sep 2024" if opt.is_recommended else "Jul 2024" if opt.is_fastest else None,
                "is_margin_rec": opt.is_recommended,
                "is_leadtime_rec": opt.is_fastest,
            })

        # Find best margin and fastest options for trade-off analysis
        best_margin = max(materials, key=lambda x: x["margin_pct"])
        fastest = min(materials, key=lambda x: x["lead_time"])
        margin_gain = best_margin["margin_dollar"] - fastest["margin_dollar"]
        leadtime_diff = best_margin["lead_time"] - fastest["lead_time"]

        return {
            "intent_id": intent_id,
            "quantity": order.get("quantity", 25000),
            "requested_date": order.get("requested_delivery", "2025-01-15"),
            "materials": materials,
            "trade_off": {
                "margin_vs_leadtime": {
                    "margin_gain": margin_gain if margin_gain > 0 else 0,
                    "margin_gain_pct": round(best_margin["margin_pct"] - fastest["margin_pct"], 1),
                    "leadtime_cost": leadtime_diff if leadtime_diff > 0 else 0,
                    "meets_deadline": True,
                },
                "recommendation": f"Select {best_margin['matnr']} for margin optimization - customer has accepted this alternate before",
            },
        }

    def reset_all_orders(self, user: str = "ORDLY_SYSTEM") -> Dict[str, Any]:
        """Reset all test orders to initial state for demo purposes."""
        # Reset to stage 1 (Decisioning) with processing status
        update_query = """
            UPDATE ml_insights.ordlyai_order_pipeline
            SET stage = 1, stage_label = 'Decisioning', status = 'processing', updated_at = NOW(), updated_by = %s
            WHERE vbeln IN %s
        """
        self.pg_client.execute_query(update_query, (user, TEST_ORDER_IDS))

        # Set one order as RUSH for demo variety
        rush_query = """
            UPDATE ml_insights.ordlyai_order_pipeline
            SET status = 'rush'
            WHERE vbeln = '84384'
        """
        self.pg_client.execute_query(rush_query)

        logger.info("All test orders reset", user=user, orders=TEST_ORDER_IDS)

        return {
            "success": True,
            "message": f"Reset {len(TEST_ORDER_IDS)} orders to initial state",
            "orders": list(TEST_ORDER_IDS)
        }

    # ========================================================================
    # MULTI-LINE ORDER METHODS
    # ========================================================================

    def get_order_with_lines(self, order_id: str) -> Dict[str, Any]:
        """
        Get order data with all line items.
        Returns structured order with lineItems array.
        """
        # Clean order ID
        clean_id = order_id.replace("PO-", "").replace("SO-", "").replace("INT-", "").strip()

        # Get from static data (includes line_items)
        order_data = format_order_with_lines_for_api(clean_id)
        if order_data:
            return order_data

        # Fallback: try database
        query = """
            SELECT
                po.po_number, po.buyer_company as customer, po.buyer_name as customer_id,
                po.total_amount, po.order_date, po.requested_delivery_date,
                po.ship_to_name, po.ship_to_city, po.ship_to_state,
                po.payment_terms, po.freight_terms, po.incoterms,
                COALESCE(op.stage, 0) as stage,
                COALESCE(op.stage_label, 'Intent') as stage_label,
                COALESCE(op.status, 'processing') as status
            FROM purchase_orders.po_headers po
            LEFT JOIN ml_insights.ordlyai_order_pipeline op ON po.po_number = op.vbeln
            WHERE po.po_number = %s
        """
        rows = self.pg_client.execute_query(query, (clean_id,))
        if not rows:
            return {}

        row = rows[0]

        # Get all line items from database
        line_query = """
            SELECT
                li.line_number, li.description as material, li.item_number as material_id,
                li.quantity, li.uom as unit, li.unit_price,
                (li.quantity * COALESCE(li.unit_price, 0)) as extended_price,
                li.requested_date,
                COALESCE(lp.line_stage, 0) as line_stage,
                COALESCE(lp.line_status, 'pending') as line_status,
                lp.selected_sku, lp.selected_plant, lp.lead_time_days
            FROM purchase_orders.po_line_items li
            LEFT JOIN ml_insights.ordlyai_order_line_pipeline lp
                ON lp.order_id = %s AND lp.line_number = li.line_number
            WHERE li.po_id = (SELECT id FROM purchase_orders.po_headers WHERE po_number = %s)
            ORDER BY li.line_number
        """
        line_rows = self.pg_client.execute_query(line_query, (clean_id, clean_id))

        line_items = []
        for lr in line_rows:
            ext_price = float(lr["extended_price"]) if lr["extended_price"] else 0
            line_items.append({
                "lineNumber": lr["line_number"],
                "material": lr["material"] or "Unknown Material",
                "materialId": lr["material_id"] or "",
                "quantity": self._format_quantity(lr["quantity"]),
                "quantityRaw": float(lr["quantity"]) if lr["quantity"] else 0,
                "unit": lr["unit"] or "EA",
                "unitPrice": float(lr["unit_price"]) if lr["unit_price"] else 0,
                "extendedPrice": ext_price,
                "lineStage": lr["line_stage"],
                "lineStatus": lr["line_status"],
                "selectedSku": lr["selected_sku"],
                "selectedPlant": lr["selected_plant"],
                "leadTimeDays": lr["lead_time_days"],
                "requestedDelivery": str(lr["requested_date"]) if lr["requested_date"] else None,
                "financials": {
                    "lineValue": ext_price,
                    "marginPct": 26.0,  # Default margin
                    "marginDollar": round(ext_price * 0.26, 2),
                }
            })

        total_value = sum(li["extendedPrice"] for li in line_items)
        total_margin = sum(li["financials"]["marginDollar"] for li in line_items)
        avg_margin = (total_margin / total_value * 100) if total_value > 0 else 0

        return {
            "id": f"PO-{row['po_number'].strip()}",
            "poNumber": row["po_number"].strip(),
            "customer": row["customer"] or "Unknown",
            "customerId": row["customer_id"] or "",
            "orderDate": str(row["order_date"]) if row["order_date"] else None,
            "requestedDelivery": str(row["requested_delivery_date"]) if row["requested_delivery_date"] else None,
            "shipTo": f"{row['ship_to_name'] or ''}, {row['ship_to_city'] or ''} {row['ship_to_state'] or ''}".strip(", "),
            "paymentTerms": row["payment_terms"] or "",
            "freightTerms": row["freight_terms"] or "",
            "incoterms": row["incoterms"] or "",
            "stage": row["stage"],
            "stageLabel": row["stage_label"],
            "status": row["status"],
            "lineCount": len(line_items),
            "linesApproved": sum(1 for li in line_items if li["lineStatus"] == "approved"),
            "linesPending": sum(1 for li in line_items if li["lineStatus"] == "pending"),
            "linesHeld": sum(1 for li in line_items if li["lineStatus"] == "held"),
            "lineItems": line_items,
            "financials": {
                "orderValue": total_value,
                "marginPct": round(avg_margin, 1),
                "marginDollar": round(total_margin, 2),
            },
        }

    def get_line_sku_options(self, order_id: str, line_number: int) -> Dict[str, Any]:
        """
        Get SKU options for a specific line item.
        Returns options tailored to the line item's material and financials.
        """
        clean_id = order_id.replace("PO-", "").replace("SO-", "").replace("INT-", "").strip()

        # Get line item from static data
        line_item = get_line_item(clean_id, line_number)
        if not line_item:
            return {"error": f"Line {line_number} not found for order {order_id}"}

        # Get SKU options for this line
        sku_options = get_sku_options_for_line(clean_id, line_number)

        # Format for API
        formatted_options = []
        line_value = line_item.financials.line_value if line_item.financials else line_item.extended_price

        for opt in sku_options:
            margin_dollar = opt.get_margin_dollar(line_value)
            formatted_options.append({
                "id": f"SKU-{opt.sku}",
                "sku": opt.sku,
                "name": opt.name,
                "margin_pct": opt.margin_pct,
                "margin_dollar": margin_dollar,
                "stock_status": "full" if opt.availability == "In Stock" else "partial" if opt.availability == "Partial" else "none",
                "lead_time_days": opt.lead_time_days,
                "plant": opt.plant,
                "plant_name": opt.plant_name,
                "coverage_pct": opt.coverage_pct,
                "is_margin_rec": opt.is_recommended,
                "is_leadtime_rec": opt.is_fastest,
                "is_exact_match": opt.is_exact_match,
                "tags": opt.tags,
                "specs": opt.specs,
            })

        # Build margin waterfall for the line
        financials = line_item.financials
        margin_waterfall = []
        if financials:
            margin_waterfall = [
                {"label": "Line Value", "value": financials.line_value, "formatted": f"${financials.line_value:,.0f}", "isPositive": True, "pct": 100},
                {"label": "Material Cost", "value": -financials.material_cost, "formatted": f"-${financials.material_cost:,.0f}", "isPositive": False, "pct": round(financials.material_cost / financials.line_value * 100, 1) if financials.line_value > 0 else 0},
                {"label": "Conversion Cost", "value": -financials.conversion_cost, "formatted": f"-${financials.conversion_cost:,.0f}", "isPositive": False, "pct": round(financials.conversion_cost / financials.line_value * 100, 1) if financials.line_value > 0 else 0},
                {"label": "Freight Cost", "value": -financials.freight_cost, "formatted": f"-${financials.freight_cost:,.0f}", "isPositive": False, "pct": round(financials.freight_cost / financials.line_value * 100, 1) if financials.line_value > 0 else 0},
                {"label": "Landed Margin", "value": financials.margin_dollar, "formatted": f"${financials.margin_dollar:,.0f}", "isPositive": True, "pct": financials.margin_pct},
            ]

        return {
            "order_id": clean_id,
            "line_number": line_number,
            "order_value": line_value,  # Frontend expects order_value
            "line_value": line_value,
            "material": line_item.material,
            "material_id": line_item.material_id,
            "quantity": f"{line_item.quantity:,.0f} {line_item.unit}",
            "sku_options": formatted_options,
            "comparison_data": margin_waterfall,  # Frontend expects comparison_data
            "margin_recommendation": {
                "best_margin_sku": formatted_options[0]["sku"] if formatted_options else None,
                "best_margin_pct": formatted_options[0]["margin_pct"] if formatted_options else 0,
            }
        }

    def update_line_status(
        self,
        order_id: str,
        line_number: int,
        action: str,
        selected_sku: Optional[str] = None,
        note: Optional[str] = None,
        user: str = "ORDLY_SYSTEM"
    ) -> Dict[str, Any]:
        """
        Update status for a specific line item.

        Actions:
        - select_sku: Select SKU for this line, advance to Arbitration
        - approve: Approve this line
        - hold: Put this line on hold
        - escalate: Escalate this line
        - reject: Reject this line
        """
        clean_id = order_id.replace("PO-", "").replace("SO-", "").replace("INT-", "").strip()

        # Stage and status labels
        stage_labels = {0: "Intent", 1: "Decisioning", 2: "Arbitration", 3: "Committing", 4: "Complete"}

        # Determine new state based on action
        if action == "select_sku":
            if not selected_sku:
                return {"success": False, "error": "selected_sku is required for select_sku action"}
            new_stage = 2  # Move to Arbitration
            new_status = "pending"
            message = f"SKU {selected_sku} selected for line {line_number}"

        elif action == "approve":
            new_stage = 4  # Complete
            new_status = "approved"
            message = f"Line {line_number} approved"

        elif action == "hold":
            new_stage = 2  # Stay at Arbitration
            new_status = "held"
            message = f"Line {line_number} placed on hold"

        elif action == "escalate":
            new_stage = 2  # Stay at Arbitration
            new_status = "escalated"
            message = f"Line {line_number} escalated for review"

        elif action == "reject":
            new_stage = 2  # Stay at Arbitration
            new_status = "rejected"
            message = f"Line {line_number} rejected"

        elif action == "reset":
            new_stage = 1  # Back to Decisioning
            new_status = "pending"
            message = f"Line {line_number} reset"

        else:
            return {"success": False, "error": f"Unknown action: {action}"}

        # Try to update line pipeline table if it exists
        try:
            # Ensure line pipeline record exists
            upsert_query = """
                INSERT INTO ml_insights.ordlyai_order_line_pipeline (order_id, line_number, line_stage, line_status)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (order_id, line_number) DO UPDATE SET
                    line_stage = EXCLUDED.line_stage,
                    line_status = EXCLUDED.line_status,
                    updated_at = NOW(),
                    updated_by = %s
            """
            self.pg_client.execute_query(upsert_query, (clean_id, line_number, new_stage, new_status, user))
            self._recalculate_order_from_lines(clean_id, user)
        except Exception as e:
            # Table might not exist yet - that's OK, approval tracked in frontend state
            logger.warning("Line pipeline table not available", error=str(e))

        logger.info(
            "Line status updated",
            order_id=clean_id,
            line_number=line_number,
            action=action,
            new_stage=new_stage,
            new_status=new_status
        )

        return {
            "success": True,
            "orderId": f"PO-{clean_id}",
            "lineNumber": line_number,
            "action": action,
            "newStage": new_stage,
            "newStatus": new_status,
            "selectedSku": selected_sku,
            "message": message,
        }

    def approve_all_lines(self, order_id: str, user: str = "ORDLY_SYSTEM") -> Dict[str, Any]:
        """
        Approve all pending lines in an order.
        Order can only be committed when all lines are approved.
        """
        clean_id = order_id.replace("PO-", "").replace("SO-", "").replace("INT-", "").strip()

        # Try to update line pipeline table if it exists
        try:
            update_query = """
                UPDATE ml_insights.ordlyai_order_line_pipeline
                SET line_stage = 4, line_status = 'approved', updated_at = NOW(), updated_by = %s
                WHERE order_id = %s AND line_status = 'pending'
            """
            self.pg_client.execute_query(update_query, (user, clean_id))
            self._recalculate_order_from_lines(clean_id, user)
        except Exception as e:
            # Table might not exist yet - that's OK, just log and continue
            logger.warning("Line pipeline table not available, approval tracked in memory", error=str(e))

        logger.info("All lines approved", order_id=clean_id, user=user)

        return {
            "success": True,
            "orderId": f"PO-{clean_id}",
            "message": "All pending lines approved",
        }

    def _recalculate_order_from_lines(self, order_id: str, user: str = "ORDLY_SYSTEM"):
        """
        Recalculate order-level stage and status from line items.
        Called after any line status change.
        """
        # Call the database function if it exists
        try:
            self.pg_client.execute_query(
                "SELECT ml_insights.recalculate_order_line_stats(%s)",
                (order_id,)
            )
        except Exception as e:
            logger.warning("Database function not available, using fallback", error=str(e))

            # Fallback: manual calculation
            stats_query = """
                SELECT
                    COUNT(*) as line_count,
                    COUNT(*) FILTER (WHERE line_status = 'approved') as approved,
                    COUNT(*) FILTER (WHERE line_status = 'pending') as pending,
                    COUNT(*) FILTER (WHERE line_status = 'held') as held,
                    MIN(line_stage) as min_stage
                FROM ml_insights.ordlyai_order_line_pipeline
                WHERE order_id = %s
            """
            rows = self.pg_client.execute_query(stats_query, (order_id,))

            if rows:
                stats = rows[0]
                all_ready = stats["approved"] == stats["line_count"] and stats["line_count"] > 0

                # Determine order status from line statuses
                if stats["approved"] == stats["line_count"]:
                    order_status = "committed"
                elif stats["held"] > 0:
                    order_status = "partial_hold" if stats["approved"] > 0 else "hold"
                else:
                    order_status = "processing"

                update_query = """
                    UPDATE ml_insights.ordlyai_order_pipeline
                    SET line_count = %s, lines_approved = %s, lines_pending = %s,
                        lines_held = %s, all_lines_ready = %s, stage = %s, status = %s,
                        updated_at = NOW(), updated_by = %s
                    WHERE vbeln = %s
                """
                self.pg_client.execute_query(
                    update_query,
                    (
                        stats["line_count"], stats["approved"], stats["pending"],
                        stats["held"], all_ready, stats["min_stage"] or 0, order_status,
                        user, order_id
                    )
                )
