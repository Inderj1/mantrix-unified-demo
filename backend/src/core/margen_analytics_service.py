"""
MargenAI Analytics Service - Margin-focused business intelligence
"""
from typing import List, Dict, Any, Optional
import structlog
from ..db.postgresql_client import PostgreSQLClient

logger = structlog.get_logger()


class MargenAnalyticsService(PostgreSQLClient):
    """Extended PostgreSQL client focused on margin analysis and profitability insights"""

    def __init__(self):
        # Use mantrix_nexxt database on port 5433
        super().__init__(
            host="localhost",
            port=5433,
            user="mantrix",
            password="mantrix123",
            database="mantrix_nexxt"
        )
        logger.info("MargenAI Analytics Service initialized (mantrix_nexxt on port 5433)")
    
    def get_product_margin_overview(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """Get product-level margin analysis for main table"""
        query = """
        WITH product_metrics AS (
            SELECT 
                td.material_number as product_id,
                -- Basic sales metrics
                COUNT(DISTINCT td.order_id) as total_orders,
                COUNT(DISTINCT td.customer) as unique_customers,
                COALESCE(ROUND(SUM(td.net_sales)::numeric, 2), 0) as total_revenue,
                COALESCE(ROUND(SUM(td.gross_margin)::numeric, 2), 0) as total_margin,
                COALESCE(ROUND(SUM(td.inv_quantity_cases)::numeric, 2), 0) as total_quantity,
                
                -- Margin calculations with proper null handling
                COALESCE(ROUND(
                    CASE 
                        WHEN SUM(td.net_sales) > 0 
                        THEN (SUM(td.gross_margin) / SUM(td.net_sales) * 100)
                        ELSE 0 
                    END::numeric, 2
                ), 0) as margin_percentage,
                
                -- Performance indicators
                COALESCE(ROUND(AVG(td.net_sales)::numeric, 2), 0) as avg_order_value,
                COALESCE(ROUND(AVG(td.gross_margin)::numeric, 2), 0) as avg_margin_per_order,
                
                -- Time-based metrics
                MAX(td.posting_date) as last_sale_date,
                MIN(td.posting_date) as first_sale_date,
                
                -- Customer segment analysis (count distinct customers, not transactions)
                COUNT(DISTINCT CASE WHEN cm.rfm_segment IN ('Champions', 'Loyal Customers') THEN td.customer END) as premium_customers,
                COUNT(DISTINCT CASE WHEN cm.rfm_segment IN ('At Risk', 'Cannot Lose Them', 'About to Sleep') THEN td.customer END) as at_risk_customers
                
            FROM transaction_data td
            LEFT JOIN customer_master cm ON td.customer = cm.customer
            WHERE td.net_sales IS NOT NULL 
            AND td.gross_margin IS NOT NULL
            AND NOT (td.net_sales = 'NaN' OR td.gross_margin = 'NaN')
            AND td.net_sales::text !~ '^[[:space:]]*$'
            AND td.gross_margin::text !~ '^[[:space:]]*$'
            GROUP BY td.material_number
        )
        SELECT 
            pm.*,
            -- Profitability status
            CASE 
                WHEN pm.margin_percentage >= 25 THEN 'High Profit'
                WHEN pm.margin_percentage >= 15 THEN 'Good Profit'
                WHEN pm.margin_percentage >= 5 THEN 'Low Profit'
                WHEN pm.margin_percentage > 0 THEN 'Minimal Profit'
                ELSE 'Loss Making'
            END as profitability_status,
            
            -- Performance indicators
            CASE 
                WHEN pm.total_revenue >= 100000 THEN 'High Volume'
                WHEN pm.total_revenue >= 50000 THEN 'Medium Volume'
                WHEN pm.total_revenue >= 10000 THEN 'Low Volume'
                ELSE 'Very Low Volume'
            END as volume_status,
            
            -- Customer quality with proper null handling
            COALESCE(ROUND((pm.premium_customers::numeric / NULLIF(pm.unique_customers, 0) * 100), 2), 0) as premium_customer_pct
            
        FROM product_metrics pm
        WHERE pm.total_revenue IS NOT NULL 
        AND pm.total_margin IS NOT NULL
        AND pm.margin_percentage IS NOT NULL
        ORDER BY pm.total_revenue DESC
        LIMIT %s OFFSET %s
        """
        result = self.execute_query(query, (limit, offset))
        
        # Post-process to ensure no NaN values make it to JSON
        cleaned_result = []
        for row in result:
            cleaned_row = {}
            for key, value in row.items():
                if isinstance(value, float) and (value != value):  # Check for NaN
                    cleaned_row[key] = 0.0
                elif value is None:
                    cleaned_row[key] = 0 if key in ['total_orders', 'unique_customers', 'premium_customers', 'at_risk_customers'] else 0.0
                else:
                    cleaned_row[key] = value
            cleaned_result.append(cleaned_row)
        
        return cleaned_result
    
    def get_product_customer_segment_breakdown(self, product_id: str) -> List[Dict[str, Any]]:
        """Get customer segment breakdown for a specific product (drill-down level 2)"""
        query = """
        SELECT 
            cm.rfm_segment as segment_name,
            COUNT(DISTINCT td.customer) as customer_count,
            COUNT(DISTINCT td.order_id) as total_orders,
            COALESCE(ROUND(SUM(td.net_sales)::numeric, 2), 0) as segment_revenue,
            COALESCE(ROUND(SUM(td.gross_margin)::numeric, 2), 0) as segment_margin,
            COALESCE(ROUND(AVG(td.net_sales)::numeric, 2), 0) as avg_order_value,
            COALESCE(ROUND(
                CASE 
                    WHEN SUM(td.net_sales) > 0 
                    THEN (SUM(td.gross_margin) / SUM(td.net_sales) * 100)
                    ELSE 0 
                END::numeric, 2
            ), 0) as margin_percentage,
            COALESCE(ROUND(SUM(td.inv_quantity_cases)::numeric, 2), 0) as total_quantity,
            MAX(td.posting_date) as last_purchase_date,
            
            -- Segment performance metrics
            COALESCE(ROUND(AVG(cm.recency)::numeric, 1), 0) as avg_days_since_last_purchase,
            COALESCE(ROUND(AVG(cm.frequency)::numeric, 1), 0) as avg_purchase_frequency,
            COALESCE(ROUND(AVG(cm.monetary)::numeric, 2), 0) as avg_customer_lifetime_value
            
        FROM transaction_data td
        JOIN customer_master cm ON td.customer = cm.customer
        WHERE td.material_number = %s
        AND td.net_sales IS NOT NULL 
        AND td.gross_margin IS NOT NULL
        GROUP BY cm.rfm_segment
        ORDER BY segment_revenue DESC
        """
        result = self.execute_query(query, (product_id,))
        
        # Clean NaN values
        cleaned_result = []
        for row in result:
            cleaned_row = {}
            for key, value in row.items():
                if isinstance(value, float) and (value != value):  # Check for NaN
                    cleaned_row[key] = 0.0
                elif value is None:
                    cleaned_row[key] = 0 if key in ['customer_count', 'total_orders'] else 0.0
                else:
                    cleaned_row[key] = value
            cleaned_result.append(cleaned_row)
        
        return cleaned_result
    
    def get_customer_product_transactions(self, product_id: str, segment: str = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Get individual transaction details (drill-down level 3)"""
        base_query = """
        SELECT 
            td.order_id,
            td.customer,
            td.posting_date,
            cm.rfm_segment as customer_segment,
            COALESCE(ROUND(td.net_sales::numeric, 2), 0) as revenue,
            COALESCE(ROUND(td.gross_margin::numeric, 2), 0) as margin,
            COALESCE(ROUND(
                CASE 
                    WHEN td.net_sales > 0 
                    THEN (td.gross_margin / td.net_sales * 100)
                    ELSE 0 
                END::numeric, 2
            ), 0) as margin_percentage,
            COALESCE(ROUND(td.inv_quantity_cases::numeric, 2), 0) as quantity,
            td.year_month,
            
            -- Customer context
            COALESCE(ROUND(cm.monetary::numeric, 2), 0) as customer_lifetime_value,
            COALESCE(cm.frequency, 0) as customer_total_orders,
            COALESCE(cm.recency, 0) as days_since_last_order
            
        FROM transaction_data td
        JOIN customer_master cm ON td.customer = cm.customer
        WHERE td.material_number = %s
        AND td.net_sales IS NOT NULL 
        AND td.gross_margin IS NOT NULL
        """
        
        params = [product_id]
        
        if segment:
            base_query += " AND cm.rfm_segment = %s"
            params.append(segment)
            
        base_query += """
        ORDER BY td.posting_date DESC, td.net_sales DESC
        LIMIT %s
        """
        params.append(limit)
        
        result = self.execute_query(base_query, tuple(params))
        
        # Clean NaN values
        cleaned_result = []
        for row in result:
            cleaned_row = {}
            for key, value in row.items():
                if isinstance(value, float) and (value != value):  # Check for NaN
                    cleaned_row[key] = 0.0
                elif value is None:
                    cleaned_row[key] = 0 if key in ['customer_total_orders', 'days_since_last_order'] else 0.0
                else:
                    cleaned_row[key] = value
            cleaned_result.append(cleaned_row)
        
        return cleaned_result
    
    def get_margin_performance_summary(self) -> Dict[str, Any]:
        """Get overall margin performance KPIs"""
        query = """
        WITH overall_metrics AS (
            SELECT 
                COUNT(DISTINCT td.material_number) as total_products,
                COUNT(DISTINCT td.customer) as total_customers,
                COUNT(DISTINCT td.order_id) as total_orders,
                COALESCE(ROUND(SUM(td.net_sales)::numeric, 2), 0) as total_revenue,
                COALESCE(ROUND(SUM(td.gross_margin)::numeric, 2), 0) as total_margin,
                
                -- Overall margin percentage
                COALESCE(ROUND(
                    CASE 
                        WHEN SUM(td.net_sales) > 0 
                        THEN (SUM(td.gross_margin) / SUM(td.net_sales) * 100)
                        ELSE 0 
                    END::numeric, 2
                ), 0) as overall_margin_pct,
                
                -- Profitability breakdown
                COUNT(CASE 
                    WHEN (td.gross_margin / NULLIF(td.net_sales, 0) * 100) >= 25 
                    THEN 1 
                END) as high_profit_transactions,
                COUNT(CASE 
                    WHEN (td.gross_margin / NULLIF(td.net_sales, 0) * 100) < 0 
                    THEN 1 
                END) as loss_making_transactions,
                
                -- Time period
                MIN(td.posting_date) as data_start_date,
                MAX(td.posting_date) as data_end_date
                
            FROM transaction_data td
            WHERE td.net_sales IS NOT NULL 
            AND td.gross_margin IS NOT NULL
            AND NOT (td.net_sales = 'NaN' OR td.gross_margin = 'NaN')
        )
        SELECT 
            om.*,
            COALESCE(ROUND((om.high_profit_transactions::numeric / NULLIF(om.total_orders, 0) * 100), 2), 0) as high_profit_pct,
            COALESCE(ROUND((om.loss_making_transactions::numeric / NULLIF(om.total_orders, 0) * 100), 2), 0) as loss_making_pct
        FROM overall_metrics om
        """
        result = self.execute_query(query)
        summary = result[0] if result else {}
        
        # Clean NaN values from summary
        cleaned_summary = {}
        for key, value in summary.items():
            if isinstance(value, float) and (value != value):  # Check for NaN
                cleaned_summary[key] = 0.0
            elif value is None:
                cleaned_summary[key] = 0 if key in ['total_products', 'total_customers', 'total_orders', 'high_profit_transactions', 'loss_making_transactions'] else 0.0
            else:
                cleaned_summary[key] = value
        
        return cleaned_summary
    
    def search_products_by_margin(
        self, 
        search_term: str = None, 
        min_margin_pct: float = None,
        max_margin_pct: float = None,
        profitability_status: str = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Search and filter products by margin criteria"""
        base_query = """
        WITH product_metrics AS (
            SELECT 
                td.material_number as product_id,
                COUNT(DISTINCT td.order_id) as total_orders,
                COUNT(DISTINCT td.customer) as unique_customers,
                ROUND(SUM(td.net_sales)::numeric, 2) as total_revenue,
                ROUND(SUM(td.gross_margin)::numeric, 2) as total_margin,
                ROUND(
                    CASE 
                        WHEN SUM(td.net_sales) > 0 
                        THEN (SUM(td.gross_margin) / SUM(td.net_sales) * 100)
                        ELSE 0 
                    END::numeric, 2
                ) as margin_percentage,
                MAX(td.posting_date) as last_sale_date
            FROM transaction_data td
            WHERE td.net_sales IS NOT NULL 
            AND td.gross_margin IS NOT NULL
        """
        
        params = []
        conditions = []
        
        if search_term:
            base_query += " AND td.material_number ILIKE %s"
            params.append(f"%{search_term}%")
            
        base_query += " GROUP BY td.material_number"
        
        # Add HAVING conditions for margin filtering
        having_conditions = []
        
        if min_margin_pct is not None:
            having_conditions.append("(SUM(td.gross_margin) / NULLIF(SUM(td.net_sales), 0) * 100) >= %s")
            params.append(min_margin_pct)
            
        if max_margin_pct is not None:
            having_conditions.append("(SUM(td.gross_margin) / NULLIF(SUM(td.net_sales), 0) * 100) <= %s")
            params.append(max_margin_pct)
            
        if having_conditions:
            base_query += " HAVING " + " AND ".join(having_conditions)
        
        # Complete the query with profitability status filtering
        final_query = f"""
        {base_query}
        )
        SELECT 
            pm.*,
            CASE 
                WHEN pm.margin_percentage >= 25 THEN 'High Profit'
                WHEN pm.margin_percentage >= 15 THEN 'Good Profit'
                WHEN pm.margin_percentage >= 5 THEN 'Low Profit'
                WHEN pm.margin_percentage > 0 THEN 'Minimal Profit'
                ELSE 'Loss Making'
            END as profitability_status
        FROM product_metrics pm
        """
        
        if profitability_status:
            status_conditions = {
                'High Profit': "pm.margin_percentage >= 25",
                'Good Profit': "pm.margin_percentage >= 15 AND pm.margin_percentage < 25",
                'Low Profit': "pm.margin_percentage >= 5 AND pm.margin_percentage < 15",
                'Minimal Profit': "pm.margin_percentage > 0 AND pm.margin_percentage < 5",
                'Loss Making': "pm.margin_percentage <= 0"
            }
            if profitability_status in status_conditions:
                final_query += f" WHERE {status_conditions[profitability_status]}"
        
        final_query += " ORDER BY pm.total_revenue DESC LIMIT %s"
        params.append(limit)
        
        result = self.execute_query(final_query, tuple(params))
        
        # Clean NaN values
        cleaned_result = []
        for row in result:
            cleaned_row = {}
            for key, value in row.items():
                if isinstance(value, float) and (value != value):  # Check for NaN
                    cleaned_row[key] = 0.0
                elif value is None:
                    cleaned_row[key] = 0 if key in ['total_orders', 'unique_customers'] else 0.0
                else:
                    cleaned_row[key] = value
            cleaned_result.append(cleaned_row)
        
        return cleaned_result
    
    def get_product_count(self) -> int:
        """Get total number of products for pagination"""
        query = """
        SELECT COUNT(DISTINCT material_number) as product_count
        FROM transaction_data 
        WHERE net_sales IS NOT NULL 
        AND gross_margin IS NOT NULL
        """
        result = self.execute_query(query)
        return result[0]['product_count'] if result else 0
    
    def get_segment_analytics_overview(self) -> List[Dict[str, Any]]:
        """Get customer segment analytics for segment analytics tab"""
        query = """
        WITH segment_metrics AS (
            SELECT
                cm.rfm_segment as segment_name,
                COUNT(DISTINCT cm.customer) as total_customers,
                COUNT(DISTINCT td.material_number) as unique_products_purchased,

                -- Financial metrics
                COALESCE(ROUND(SUM(td.net_sales)::numeric, 2), 0) as total_revenue,
                COALESCE(ROUND(SUM(td.gross_margin)::numeric, 2), 0) as total_margin,
                COALESCE(ROUND(AVG(td.net_sales)::numeric, 2), 0) as avg_order_value,
                COALESCE(ROUND(
                    CASE
                        WHEN SUM(td.net_sales) > 0
                        THEN (SUM(td.gross_margin) / SUM(td.net_sales) * 100)
                        ELSE 0
                    END::numeric, 2
                ), 0) as avg_margin_percentage,

                -- Customer behavior metrics
                COALESCE(ROUND(AVG(cm.frequency)::numeric, 1), 0) as avg_purchase_frequency,
                COALESCE(ROUND(AVG(cm.monetary)::numeric, 2), 0) as avg_customer_lifetime_value,
                COALESCE(ROUND(AVG(cm.recency)::numeric, 1), 0) as avg_days_since_last_purchase,

                -- Time-based metrics
                MIN(td.posting_date) as first_purchase_date,
                MAX(td.posting_date) as last_purchase_date,

                -- Product diversity
                COALESCE(ROUND(AVG(td.inv_quantity_cases)::numeric, 2), 0) as avg_quantity_per_order,

                -- Count orders
                COUNT(DISTINCT td.order_id) as total_orders

            FROM customer_master cm
            LEFT JOIN transaction_data td ON cm.customer = td.customer
            WHERE cm.rfm_segment IS NOT NULL
            AND td.net_sales IS NOT NULL
            AND td.gross_margin IS NOT NULL
            GROUP BY cm.rfm_segment
        )
        SELECT
            sm.*,
            -- Performance categorization
            CASE
                WHEN sm.avg_margin_percentage >= 30 THEN 'High Margin'
                WHEN sm.avg_margin_percentage >= 15 THEN 'Medium Margin'
                WHEN sm.avg_margin_percentage >= 5 THEN 'Low Margin'
                WHEN sm.avg_margin_percentage > 0 THEN 'Minimal Margin'
                ELSE 'Loss Making'
            END as margin_category,

            -- Customer value categorization
            CASE
                WHEN sm.avg_customer_lifetime_value >= 10000 THEN 'High Value'
                WHEN sm.avg_customer_lifetime_value >= 5000 THEN 'Medium Value'
                WHEN sm.avg_customer_lifetime_value >= 1000 THEN 'Low Value'
                ELSE 'Very Low Value'
            END as value_category,

            -- Revenue per customer
            COALESCE(ROUND((sm.total_revenue / NULLIF(sm.total_customers, 0)), 2), 0) as revenue_per_customer,

            -- Orders per customer
            COALESCE(ROUND((sm.total_orders::numeric / NULLIF(sm.total_customers, 0)), 2), 0) as orders_per_customer

        FROM segment_metrics sm
        ORDER BY sm.total_revenue DESC
        """
        result = self.execute_query(query)
        
        # Clean NaN values
        cleaned_result = []
        for row in result:
            cleaned_row = {}
            for key, value in row.items():
                if isinstance(value, float) and (value != value):  # Check for NaN
                    cleaned_row[key] = 0.0
                elif value is None:
                    cleaned_row[key] = 0 if key in ['total_customers', 'total_orders', 'unique_products_purchased'] else 0.0
                else:
                    cleaned_row[key] = value
            cleaned_result.append(cleaned_row)
        
        return cleaned_result
    
    def get_trends_analysis(self, months_back: int = 12) -> Dict[str, Any]:
        """Get trends and insights data for trends tab"""
        query = f"""
        WITH monthly_trends AS (
            SELECT
                td.year_month as year_month,
                td.year_month as period_date,
                COUNT(DISTINCT td.order_id) as orders,
                COUNT(DISTINCT td.customer) as customers,
                COUNT(DISTINCT td.material_number) as products,
                COALESCE(ROUND(SUM(td.net_sales)::numeric, 2), 0) as revenue,
                COALESCE(ROUND(SUM(td.gross_margin)::numeric, 2), 0) as margin,
                COALESCE(ROUND(
                    CASE
                        WHEN SUM(td.net_sales) > 0
                        THEN (SUM(td.gross_margin) / SUM(td.net_sales) * 100)
                        ELSE 0
                    END::numeric, 2
                ), 0) as margin_percentage,
                COALESCE(ROUND(AVG(td.net_sales)::numeric, 2), 0) as avg_order_value
            FROM transaction_data td
            WHERE td.net_sales IS NOT NULL
            AND td.gross_margin IS NOT NULL
            AND td.year_month IS NOT NULL
            AND TO_DATE(td.year_month || '-01', 'YYYY-MM-DD') >= CURRENT_DATE - INTERVAL '{months_back} months'
            GROUP BY td.year_month
            ORDER BY td.year_month DESC
        ),
        segment_trends AS (
            SELECT
                td.year_month,
                cm.rfm_segment,
                COALESCE(ROUND(SUM(td.net_sales)::numeric, 2), 0) as segment_revenue,
                COALESCE(ROUND(SUM(td.gross_margin)::numeric, 2), 0) as segment_margin,
                COUNT(DISTINCT td.customer) as segment_customers
            FROM transaction_data td
            JOIN customer_master cm ON td.customer = cm.customer
            WHERE td.net_sales IS NOT NULL
            AND td.gross_margin IS NOT NULL
            AND td.year_month IS NOT NULL
            AND cm.rfm_segment IS NOT NULL
            AND TO_DATE(td.year_month || '-01', 'YYYY-MM-DD') >= CURRENT_DATE - INTERVAL '{months_back} months'
            GROUP BY td.year_month, cm.rfm_segment
        ),
        product_trends AS (
            SELECT
                td.year_month,
                td.material_number,
                COALESCE(ROUND(SUM(td.net_sales)::numeric, 2), 0) as product_revenue,
                COALESCE(ROUND(SUM(td.gross_margin)::numeric, 2), 0) as product_margin,
                COALESCE(ROUND(
                    CASE
                        WHEN SUM(td.net_sales) > 0
                        THEN (SUM(td.gross_margin) / SUM(td.net_sales) * 100)
                        ELSE 0
                    END::numeric, 2
                ), 0) as product_margin_pct
            FROM transaction_data td
            WHERE td.net_sales IS NOT NULL
            AND td.gross_margin IS NOT NULL
            AND td.year_month IS NOT NULL
            AND TO_DATE(td.year_month || '-01', 'YYYY-MM-DD') >= CURRENT_DATE - INTERVAL '{months_back} months'
            GROUP BY td.year_month, td.material_number
        )
        SELECT 
            json_build_object(
                'monthly_trends', COALESCE(
                    (SELECT json_agg(
                        json_build_object(
                            'period', year_month,
                            'period_date', period_date,
                            'orders', orders,
                            'customers', customers,
                            'products', products,
                            'revenue', revenue,
                            'margin', margin,
                            'margin_percentage', margin_percentage,
                            'avg_order_value', avg_order_value
                        ) ORDER BY year_month
                    ) FROM monthly_trends), 
                    '[]'::json
                ),
                'segment_trends', COALESCE(
                    (SELECT json_agg(
                        json_build_object(
                            'period', year_month,
                            'segment', rfm_segment,
                            'revenue', segment_revenue,
                            'margin', segment_margin,
                            'customers', segment_customers
                        ) ORDER BY year_month, segment_revenue DESC
                    ) FROM segment_trends), 
                    '[]'::json
                ),
                'top_products_by_period', COALESCE(
                    (SELECT json_agg(
                        json_build_object(
                            'period', year_month,
                            'product_id', material_number,
                            'revenue', product_revenue,
                            'margin', product_margin,
                            'margin_percentage', product_margin_pct
                        ) ORDER BY year_month, product_revenue DESC
                    ) FROM (
                        SELECT DISTINCT ON (year_month) 
                            year_month, material_number, product_revenue, product_margin, product_margin_pct
                        FROM product_trends 
                        ORDER BY year_month, product_revenue DESC
                    ) top_products), 
                    '[]'::json
                )
            ) as trends_data
        """
        result = self.execute_query(query)
        
        if result and len(result) > 0 and result[0].get('trends_data'):
            trends_data = result[0]['trends_data']
            
            # Clean NaN values in nested JSON structure
            def clean_nested_data(data):
                if isinstance(data, dict):
                    return {k: clean_nested_data(v) for k, v in data.items()}
                elif isinstance(data, list):
                    return [clean_nested_data(item) for item in data]
                elif isinstance(data, float) and (data != data):  # NaN check
                    return 0.0
                elif data is None:
                    return []  # Return empty list for None in arrays
                else:
                    return data
            
            cleaned_data = clean_nested_data(trends_data)
            
            # Ensure required keys exist with proper types
            if not isinstance(cleaned_data.get('monthly_trends'), list):
                cleaned_data['monthly_trends'] = []
            if not isinstance(cleaned_data.get('segment_trends'), list):
                cleaned_data['segment_trends'] = []
            if not isinstance(cleaned_data.get('top_products_by_period'), list):
                cleaned_data['top_products_by_period'] = []
            
            return cleaned_data
        
        return {
            'monthly_trends': [],
            'segment_trends': [],
            'top_products_by_period': []
        }
    
    def get_segment_comparison_matrix(self) -> List[Dict[str, Any]]:
        """Get segment comparison data for advanced analytics"""
        query = """
        WITH segment_comparison AS (
            SELECT 
                cm.rfm_segment,
                -- Volume metrics
                COUNT(DISTINCT cm.customer) as customer_count,
                COUNT(DISTINCT td.order_id) as order_count,
                COUNT(DISTINCT td.material_number) as product_diversity,
                
                -- Financial performance
                COALESCE(ROUND(SUM(td.net_sales)::numeric, 2), 0) as total_revenue,
                COALESCE(ROUND(SUM(td.gross_margin)::numeric, 2), 0) as total_margin,
                COALESCE(ROUND(AVG(td.net_sales)::numeric, 2), 0) as avg_order_value,
                COALESCE(ROUND(AVG(cm.monetary)::numeric, 2), 0) as avg_ltv,
                
                -- Behavioral metrics
                COALESCE(ROUND(AVG(cm.frequency)::numeric, 1), 0) as avg_frequency,
                COALESCE(ROUND(AVG(cm.recency)::numeric, 1), 0) as avg_recency,
                
                -- Margin analysis
                COALESCE(ROUND(
                    CASE 
                        WHEN SUM(td.net_sales) > 0 
                        THEN (SUM(td.gross_margin) / SUM(td.net_sales) * 100)
                        ELSE 0 
                    END::numeric, 2
                ), 0) as margin_percentage,
                
                -- Growth indicators (compare last 3 months vs previous 3 months)
                COALESCE(ROUND(SUM(CASE 
                    WHEN TO_DATE(td.year_month || '-01', 'YYYY-MM-DD') >= CURRENT_DATE - INTERVAL '3 months'
                    THEN td.net_sales ELSE 0 END)::numeric, 2), 0) as recent_revenue,
                COALESCE(ROUND(SUM(CASE 
                    WHEN TO_DATE(td.year_month || '-01', 'YYYY-MM-DD') BETWEEN CURRENT_DATE - INTERVAL '6 months' AND CURRENT_DATE - INTERVAL '3 months'
                    THEN td.net_sales ELSE 0 END)::numeric, 2), 0) as previous_revenue
                    
            FROM customer_master cm
            LEFT JOIN transaction_data td ON cm.customer = td.customer
            WHERE cm.rfm_segment IS NOT NULL
            AND td.net_sales IS NOT NULL 
            AND td.gross_margin IS NOT NULL
            GROUP BY cm.rfm_segment
        )
        SELECT 
            sc.*,
            -- Performance scoring (0-100 scale)
            LEAST(100, GREATEST(0, ROUND((sc.margin_percentage * 2 + sc.avg_ltv / 100 + sc.avg_frequency * 10) / 3, 1))) as performance_score,
            
            -- Growth rate calculation
            CASE 
                WHEN sc.previous_revenue > 0 
                THEN ROUND(((sc.recent_revenue - sc.previous_revenue) / sc.previous_revenue * 100), 2)
                ELSE 0 
            END as growth_rate_pct,
            
            -- Segment health status
            CASE 
                WHEN sc.avg_recency <= 30 AND sc.avg_frequency >= 10 THEN 'Healthy'
                WHEN sc.avg_recency <= 90 AND sc.avg_frequency >= 5 THEN 'Stable'
                WHEN sc.avg_recency <= 180 THEN 'At Risk'
                ELSE 'Declining'
            END as segment_health
            
        FROM segment_comparison sc
        ORDER BY sc.total_revenue DESC
        """
        result = self.execute_query(query)
        
        # Clean NaN values
        cleaned_result = []
        for row in result:
            cleaned_row = {}
            for key, value in row.items():
                if isinstance(value, float) and (value != value):  # Check for NaN
                    cleaned_row[key] = 0.0
                elif value is None:
                    cleaned_row[key] = 0 if key in ['customer_count', 'order_count', 'product_diversity'] else 0.0
                else:
                    cleaned_row[key] = value
            cleaned_result.append(cleaned_row)
        
        return cleaned_result

    def test_connection(self) -> bool:
        """Test database connection"""
        try:
            result = self.execute_query("SELECT 1 as test")
            return len(result) > 0
        except Exception as e:
            logger.error(f"MargenAI database connection test failed: {e}")
            return False