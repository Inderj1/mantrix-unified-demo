"""
PostgreSQL database client for customer analytics
"""
import psycopg2
import psycopg2.extras
from typing import List, Dict, Any, Optional
import structlog
from contextlib import contextmanager
import os
from decimal import Decimal

logger = structlog.get_logger()


class PostgreSQLClient:
    """PostgreSQL client for customer analytics database"""
    
    def __init__(
        self,
        host: str = "localhost",
        port: int = 5432,
        user: str = "inder",
        password: str = "",
        database: str = "customer_analytics"
    ):
        self.connection_params = {
            'host': os.environ.get('POSTGRES_HOST', host),
            'port': int(os.environ.get('POSTGRES_PORT', port)),
            'user': os.environ.get('POSTGRES_USER', user),
            'password': os.environ.get('POSTGRES_PASSWORD', password),
            'database': os.environ.get('POSTGRES_DATABASE', database)
        }
        
        # Remove password if empty
        if not self.connection_params['password']:
            del self.connection_params['password']
            
        logger.info(f"PostgreSQL client initialized for database: {database}")
    
    def _convert_decimals(self, data: Any) -> Any:
        """Convert all Decimal values to float in a nested structure."""
        if isinstance(data, list):
            return [self._convert_decimals(item) for item in data]
        elif isinstance(data, dict):
            return {
                key: float(value) if isinstance(value, Decimal) else self._convert_decimals(value) if isinstance(value, (dict, list)) else value
                for key, value in data.items()
            }
        elif isinstance(data, Decimal):
            return float(data)
        else:
            return data
    
    @contextmanager
    def get_connection(self):
        """Get a database connection with automatic cleanup"""
        conn = None
        try:
            conn = psycopg2.connect(**self.connection_params)
            yield conn
        except Exception as e:
            logger.error(f"Database connection error: {e}")
            raise
        finally:
            if conn:
                conn.close()
    
    def execute_query(self, query: str, params: Optional[tuple] = None) -> List[Dict[str, Any]]:
        """Execute a query and return results as list of dictionaries"""
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute(query, params)

                # Commit for INSERT/UPDATE/DELETE operations
                if query.strip().upper().startswith(('INSERT', 'UPDATE', 'DELETE')):
                    conn.commit()

                # Try to fetch results (will work for SELECT and RETURNING clauses)
                try:
                    results = cursor.fetchall()
                    return self._convert_decimals(results)
                except psycopg2.ProgrammingError:
                    # No results to fetch (e.g., UPDATE without RETURNING)
                    return []
    
    def get_schema_info(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get schema information for all tables"""
        query = """
        SELECT 
            table_name,
            column_name,
            data_type,
            is_nullable,
            column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position
        """
        
        results = self.execute_query(query)
        
        # Group by table
        schema_info = {}
        for row in results:
            table = row['table_name']
            if table not in schema_info:
                schema_info[table] = []
            schema_info[table].append({
                'column': row['column_name'],
                'type': row['data_type'],
                'nullable': row['is_nullable'] == 'YES',
                'default': row['column_default']
            })
        
        return schema_info
    
    def get_table_count(self, table_name: str) -> int:
        """Get row count for a table"""
        query = f"SELECT COUNT(*) as count FROM {table_name}"
        result = self.execute_query(query)
        return result[0]['count'] if result else 0
    
    def test_connection(self) -> bool:
        """Test database connection"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    return True
        except Exception as e:
            logger.error(f"Connection test failed: {e}")
            return False
    
    # Customer Analytics Specific Queries
    
    def get_customer_segments_distribution(self) -> List[Dict[str, Any]]:
        """Get customer distribution by RFM segment"""
        query = """
        SELECT 
            cm.rfm_segment as segment,
            COUNT(DISTINCT cm.customer) as customer_count,
            ROUND(AVG(cm.monetary)::numeric, 2) as avg_revenue,
            ROUND(SUM(cm.monetary)::numeric, 2) as total_revenue,
            ROUND(100.0 * COUNT(DISTINCT cm.customer) / 
                (SELECT COUNT(*) FROM customer_master)::numeric, 2) as percentage
        FROM customer_master cm
        GROUP BY cm.rfm_segment
        ORDER BY total_revenue DESC
        """
        return self.execute_query(query)
    
    def get_revenue_trends(self, months: int = 12) -> List[Dict[str, Any]]:
        """Get monthly revenue trends by segment"""
        query = """
        SELECT 
            ts.year,
            ts.month,
            ts.rfm_segment as segment,
            ROUND(ts.net_sales::numeric, 2) as revenue,
            ROUND(ts.gross_margin::numeric, 2) as gross_margin,
            ts.customer as customers
        FROM time_series_performance ts
        WHERE ts.year >= EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '%s months')
        ORDER BY ts.year DESC, ts.month DESC, revenue DESC
        """
        return self.execute_query(query, (months,))
    
    def get_top_customers(self, segment: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Get top customers by revenue"""
        query = """
        SELECT 
            cm.customer,
            cm.rfm_segment as segment,
            cm.abc_revenue || '+' || cm.abc_profit as abc_class,
            ROUND(cm.monetary::numeric, 2) as revenue,
            cm.frequency,
            cm.recency,
            cm.rfm_segment as advanced_segment
        FROM customer_master cm
        WHERE 1=1
        """
        
        params = []
        if segment:
            query += " AND cm.rfm_segment = %s"
            params.append(segment)
        
        query += " ORDER BY cm.monetary DESC LIMIT %s"
        params.append(limit)
        
        return self.execute_query(query, tuple(params))
    
    def get_product_performance(self) -> List[Dict[str, Any]]:
        """Get product performance across segments"""
        query = """
        SELECT 
            pcm.material_number as product,
            pcm.rfm_segment as segment,
            pcm.total_product_customers as customer_count,
            ROUND(pcm.total_product_sales::numeric, 2) as revenue,
            ROUND((pcm.total_product_sales / NULLIF(pcm.total_product_customers, 0))::numeric, 2) as avg_revenue,
            pcm.total_product_customers as orders
        FROM product_customer_matrix pcm
        WHERE pcm.total_product_sales > 0
        ORDER BY pcm.total_product_sales DESC
        """
        return self.execute_query(query)
    
    def get_cohort_retention(self) -> List[Dict[str, Any]]:
        """Get cohort retention data"""
        query = """
        SELECT 
            cohort_month as cohort,
            retention_data as data
        FROM cohort_retention
        ORDER BY cohort_month DESC
        LIMIT 12
        """
        return self.execute_query(query)
    
    def get_segment_performance_summary(self) -> List[Dict[str, Any]]:
        """Get segment performance metrics"""
        query = """
        SELECT 
            sp.segment_name as segment,
            sp.customer_count as customers,
            ROUND(sp.monetary_sum::numeric, 2) as revenue,
            ROUND(sp.monetary_mean::numeric, 2) as avg_revenue,
            ROUND(sp.frequency_mean::numeric, 2) as avg_order_frequency,
            ROUND((sp.customer_count * sp.frequency_mean)::numeric, 2) as orders,
            ROUND(sp.revenue_percentage::numeric, 2) as revenue_share_pct
        FROM segment_performance sp
        WHERE sp.segment_type = 'RFM_Segment'
        ORDER BY sp.monetary_sum DESC
        """
        return self.execute_query(query)
    
    def get_churn_risk_customers(self, recency_threshold: int = 180) -> List[Dict[str, Any]]:
        """Get customers at risk of churn"""
        query = """
        SELECT 
            cm.customer,
            cm.rfm_segment as segment,
            cm.recency as days_since_last_order,
            ROUND(cm.monetary::numeric, 2) as lifetime_revenue,
            cm.frequency as total_orders,
            cm.rfm_segment as advanced_segment
        FROM customer_master cm
        WHERE cm.recency > %s
        AND cm.rfm_segment IN ('Champions', 'Loyal Customers', 'Potential Loyalists')
        ORDER BY cm.monetary DESC
        LIMIT 50
        """
        return self.execute_query(query, (recency_threshold,))
    
    # Customer 360 Queries
    
    def get_customer_detail(self, customer_id: str) -> Dict[str, Any]:
        """Get detailed information for a specific customer"""
        query = """
        SELECT 
            cm.*,
            ROUND(cm.monetary::numeric, 2) as formatted_revenue,
            ROUND(cm.profitability::numeric, 2) as formatted_profit,
            ROUND(cm.margin_percent::numeric, 2) as formatted_margin_pct
        FROM customer_master cm
        WHERE cm.customer = %s
        """
        result = self.execute_query(query, (customer_id,))
        return result[0] if result else None
    
    def get_customer_purchase_history(self, customer_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Get purchase history for a customer"""
        query = """
        SELECT 
            td.order_number,
            td.posting_date,
            td.material_number as product,
            ROUND(td.net_sales::numeric, 2) as revenue,
            ROUND(td.gross_margin::numeric, 2) as margin,
            ROUND(td.inv_quantity_cases::numeric, 2) as quantity,
            td.year_month
        FROM transaction_data td
        WHERE td.customer = %s
        ORDER BY td.posting_date DESC
        LIMIT %s
        """
        return self.execute_query(query, (customer_id, limit))
    
    def get_customer_product_preferences(self, customer_id: str) -> List[Dict[str, Any]]:
        """Get product preferences for a customer"""
        query = """
        SELECT 
            td.material_number as product,
            COUNT(DISTINCT td.order_number) as order_count,
            ROUND(SUM(td.net_sales)::numeric, 2) as total_revenue,
            ROUND(SUM(td.gross_margin)::numeric, 2) as total_margin,
            ROUND(SUM(td.inv_quantity_cases)::numeric, 2) as total_quantity,
            ROUND(AVG(td.net_sales)::numeric, 2) as avg_order_value
        FROM transaction_data td
        WHERE td.customer = %s
        GROUP BY td.material_number
        ORDER BY total_revenue DESC
        LIMIT 20
        """
        return self.execute_query(query, (customer_id,))
    
    def search_customers(self, search_term: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Search customers by ID or characteristics"""
        query = """
        SELECT 
            cm.customer,
            cm.rfm_segment as segment,
            ROUND(cm.monetary::numeric, 2) as revenue,
            cm.frequency,
            cm.recency,
            cm.abc_combined as abc_class
        FROM customer_master cm
        WHERE cm.customer ILIKE %s
        ORDER BY cm.monetary DESC
        LIMIT %s
        """
        return self.execute_query(query, (f'%{search_term}%', limit))
    
    # Product Performance Queries
    
    def get_product_metrics(self) -> List[Dict[str, Any]]:
        """Get overall product performance metrics"""
        query = """
        SELECT 
            td.material_number as product,
            COUNT(DISTINCT td.customer) as customer_count,
            COUNT(DISTINCT td.order_number) as order_count,
            ROUND(SUM(td.net_sales)::numeric, 2) as total_revenue,
            ROUND(SUM(td.gross_margin)::numeric, 2) as total_margin,
            ROUND(SUM(td.inv_quantity_cases)::numeric, 2) as total_quantity,
            ROUND(AVG(td.net_sales)::numeric, 2) as avg_order_value,
            ROUND((SUM(td.gross_margin) / NULLIF(SUM(td.net_sales), 0) * 100)::numeric, 2) as margin_percent
        FROM transaction_data td
        GROUP BY td.material_number
        ORDER BY total_revenue DESC
        """
        return self.execute_query(query)
    
    def get_product_by_segment(self, product_id: str) -> List[Dict[str, Any]]:
        """Get product performance by customer segment"""
        query = """
        SELECT 
            pcm.rfm_segment as segment,
            pcm.total_product_customers as customer_count,
            ROUND(pcm.total_product_sales::numeric, 2) as revenue,
            ROUND(pcm.total_product_margin::numeric, 2) as margin,
            ROUND(pcm.segment_sales_contribution::numeric, 2) as contribution_pct
        FROM product_customer_matrix pcm
        WHERE pcm.material_number = %s
        ORDER BY pcm.total_product_sales DESC
        """
        return self.execute_query(query, (product_id,))
    
    def get_product_trends(self, product_id: str, months: int = 12) -> List[Dict[str, Any]]:
        """Get product sales trends over time"""
        query = """
        SELECT 
            td.year,
            td.month,
            td.year_month,
            COUNT(DISTINCT td.customer) as customers,
            ROUND(SUM(td.net_sales)::numeric, 2) as revenue,
            ROUND(SUM(td.gross_margin)::numeric, 2) as margin,
            ROUND(SUM(td.inv_quantity_cases)::numeric, 2) as quantity
        FROM transaction_data td
        WHERE td.material_number = %s
        AND td.posting_date >= CURRENT_DATE - INTERVAL '%s months'
        GROUP BY td.year, td.month, td.year_month
        ORDER BY td.year DESC, td.month DESC
        """
        return self.execute_query(query, (product_id, months))
    
    # Financial Analytics Queries
    
    def get_financial_summary(self) -> Dict[str, Any]:
        """Get overall financial summary"""
        query = """
        SELECT 
            COUNT(DISTINCT customer) as total_customers,
            COUNT(DISTINCT order_number) as total_orders,
            ROUND(SUM(net_sales)::numeric, 2) as total_revenue,
            ROUND(SUM(gross_margin)::numeric, 2) as total_margin,
            ROUND(SUM(total_cogs)::numeric, 2) as total_cogs,
            ROUND((SUM(gross_margin) / NULLIF(SUM(net_sales), 0) * 100)::numeric, 2) as overall_margin_pct
        FROM transaction_data
        """
        result = self.execute_query(query)
        return result[0] if result else {}
    
    def get_financial_trends(self, months: int = 24) -> List[Dict[str, Any]]:
        """Get financial trends over time"""
        query = """
        SELECT 
            td.year,
            td.month,
            td.year_month,
            COUNT(DISTINCT td.customer) as customers,
            COUNT(DISTINCT td.order_number) as orders,
            ROUND(SUM(td.net_sales)::numeric, 2) as revenue,
            ROUND(SUM(td.gross_margin)::numeric, 2) as margin,
            ROUND(SUM(td.total_cogs)::numeric, 2) as cogs,
            ROUND((SUM(td.gross_margin) / NULLIF(SUM(td.net_sales), 0) * 100)::numeric, 2) as margin_pct
        FROM transaction_data td
        WHERE td.posting_date >= CURRENT_DATE - INTERVAL '%s months'
        GROUP BY td.year, td.month, td.year_month
        ORDER BY td.year, td.month
        """
        return self.execute_query(query, (months,))
    
    def get_profitability_by_segment(self) -> List[Dict[str, Any]]:
        """Get profitability metrics by customer segment"""
        query = """
        SELECT 
            sp.segment_name as segment,
            sp.customer_count,
            ROUND(sp.monetary_sum::numeric, 2) as revenue,
            ROUND(sp.profitability_sum::numeric, 2) as profit,
            ROUND(sp.margin_percent_mean::numeric, 2) as avg_margin_pct,
            ROUND(sp.revenue_percentage::numeric, 2) as revenue_share,
            ROUND(sp.profit_percentage::numeric, 2) as profit_share
        FROM segment_performance sp
        WHERE sp.segment_type = 'RFM_Segment'
        ORDER BY sp.profitability_sum DESC
        """
        return self.execute_query(query)
    
    def search_customers(self, search_term: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Search customers by ID or other attributes"""
        query = """
        SELECT customer, rfm_segment, abc_combined, monetary, frequency, recency
        FROM customer_master
        WHERE LOWER(customer) LIKE LOWER(%s)
        ORDER BY monetary DESC
        LIMIT %s
        """
        params = (f'%{search_term}%', limit)
        return self.execute_query(query, params)
    
    # Data Tables Methods
    
    def get_customer_master_data(
        self, 
        offset: int = 0, 
        limit: int = 1000,
        search: Optional[str] = None,
        segment: Optional[str] = None,
        abc_class: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get customer master analysis data with filters"""
        where_clauses = []
        params = []
        
        if search:
            where_clauses.append("LOWER(customer) LIKE LOWER(%s)")
            params.append(f'%{search}%')
        
        if segment:
            where_clauses.append("rfm_segment = %s")
            params.append(segment)
            
        if abc_class:
            where_clauses.append("abc_combined = %s")
            params.append(abc_class)
        
        where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"
        
        # Get total count
        count_query = f"SELECT COUNT(*) as total FROM customer_master WHERE {where_sql}"
        count_result = self.execute_query(count_query, tuple(params))
        total_count = count_result[0]['total'] if count_result else 0
        
        # Get paginated data
        data_query = f"""
        SELECT *
        FROM customer_master
        WHERE {where_sql}
        ORDER BY monetary DESC
        LIMIT %s OFFSET %s
        """
        params.extend([limit, offset])
        
        data = self.execute_query(data_query, tuple(params))
        
        return {
            "records": data,
            "total": total_count,
            "offset": offset,
            "limit": limit
        }
    
    def get_transaction_data(
        self,
        offset: int = 0,
        limit: int = 1000,
        customer_id: Optional[str] = None,
        product: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get transaction data with filters"""
        where_clauses = []
        params = []
        
        if customer_id:
            where_clauses.append("customer = %s")
            params.append(customer_id)
        
        if product:
            where_clauses.append("product = %s")
            params.append(product)
            
        if start_date:
            where_clauses.append("posting_date >= %s")
            params.append(start_date)
            
        if end_date:
            where_clauses.append("posting_date <= %s")
            params.append(end_date)
        
        where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"
        
        # Get total count
        count_query = f"SELECT COUNT(*) as total FROM transaction_data WHERE {where_sql}"
        count_result = self.execute_query(count_query, tuple(params))
        total_count = count_result[0]['total'] if count_result else 0
        
        # Get paginated data
        data_query = f"""
        SELECT *
        FROM transaction_data
        WHERE {where_sql}
        ORDER BY posting_date DESC, order_number DESC
        LIMIT %s OFFSET %s
        """
        params.extend([limit, offset])
        
        data = self.execute_query(data_query, tuple(params))
        
        return {
            "records": data,
            "total": total_count,
            "offset": offset,
            "limit": limit
        }
    
    def get_segmentation_performance(self) -> Dict[str, Any]:
        """Get segmentation performance summary"""
        query = """
        SELECT *
        FROM segment_performance
        ORDER BY revenue_per_customer DESC
        """
        
        data = self.execute_query(query)
        
        return {
            "records": data,
            "total": len(data)
        }
    
    def get_cohort_retention_data(self) -> Dict[str, Any]:
        """Get cohort retention data"""
        query = """
        SELECT 
            cohort_month as cohort,
            retention_data
        FROM cohort_retention
        ORDER BY cohort_month
        """
        
        data = self.execute_query(query)
        
        # Get cohort sizes from cohort_sizes table
        size_query = """
        SELECT cohort_month, customer_count
        FROM cohort_sizes
        """
        size_data = self.execute_query(size_query)
        size_map = {row['cohort_month'].strftime('%Y-%m-%d'): row['customer_count'] for row in size_data}
        
        # Transform data for better visualization
        cohorts = []
        for row in data:
            cohort_str = row['cohort'].strftime('%Y-%m-%d')
            retention_data = row['retention_data']
            
            # Convert retention data to the expected format
            retention = {}
            for month, rate in retention_data.items():
                retention[f'month_{int(month) - 1}'] = rate
            
            cohorts.append({
                'cohort': cohort_str,
                'size': size_map.get(cohort_str, 0),
                'retention': retention
            })
        
        return {
            "records": cohorts,
            "raw_data": data,
            "total": len(cohorts)
        }
    
    def get_cohort_revenue_data(self) -> Dict[str, Any]:
        """Get cohort average revenue data"""
        query = """
        SELECT 
            cohort_month as cohort,
            revenue_data
        FROM cohort_avg_revenue
        ORDER BY cohort_month
        """
        
        data = self.execute_query(query)
        
        # Transform data for better visualization
        cohorts = []
        for row in data:
            cohort_str = row['cohort'].strftime('%Y-%m-%d')
            revenue_data = row['revenue_data']
            
            # Convert revenue data to the expected format
            revenue_evolution = {}
            for month, revenue in revenue_data.items():
                revenue_evolution[f'month_{int(month) - 1}'] = revenue
            
            cohorts.append({
                'cohort': cohort_str,
                'revenue_evolution': revenue_evolution
            })
        
        return {
            "records": cohorts,
            "raw_data": data,
            "total": len(cohorts)
        }
    
    def get_time_series_performance(self, segment: Optional[str] = None) -> Dict[str, Any]:
        """Get time series performance data"""
        query = """
        SELECT *
        FROM time_series_performance
        """
        params = []
        
        if segment:
            query += " WHERE segment = %s"
            params.append(segment)
            
        query += " ORDER BY year_month, segment"
        
        data = self.execute_query(query, tuple(params) if params else None)
        
        return {
            "records": data,
            "total": len(data)
        }
    
    def get_product_customer_matrix(
        self, 
        top_products: int = 50,
        segment: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get product-customer matrix data"""
        # First get top products
        top_products_query = """
        SELECT material_number as product, SUM(net_sales) as total_revenue
        FROM product_customer_matrix
        GROUP BY material_number
        ORDER BY total_revenue DESC
        LIMIT %s
        """
        top_products_data = self.execute_query(top_products_query, (top_products,))
        top_product_list = [p['product'] for p in top_products_data]
        
        # Get matrix data for top products
        query = """
        SELECT 
            material_number as product,
            rfm_segment as segment,
            net_sales as revenue,
            gross_margin as margin,
            customer as customers,
            inv_quantity_cases as orders,
            CASE WHEN inv_quantity_cases > 0 
                THEN net_sales / inv_quantity_cases 
                ELSE 0 
            END as avg_order_value,
            CASE WHEN net_sales > 0 
                THEN (gross_margin / net_sales) * 100 
                ELSE 0 
            END as margin_percent
        FROM product_customer_matrix
        WHERE material_number = ANY(%s)
        """
        params = [top_product_list]
        
        if segment:
            query += " AND rfm_segment = %s"
            params.append(segment)
            
        query += " ORDER BY material_number, rfm_segment"
        
        data = self.execute_query(query, tuple(params))
        
        # Transform into matrix format
        matrix = {}
        segments = set()
        for row in data:
            product = row['product']
            segment = row['segment']
            segments.add(segment)
            
            if product not in matrix:
                matrix[product] = {}
            
            matrix[product][segment] = {
                'revenue': float(row['revenue']) if row['revenue'] else 0,
                'orders': int(row['orders']) if row['orders'] else 0,
                'customers': int(row['customers']) if row['customers'] else 0,
                'avg_order_value': float(row['avg_order_value']) if row['avg_order_value'] else 0,
                'margin': float(row['margin']) if row['margin'] else 0,
                'margin_percent': float(row['margin_percent']) if row['margin_percent'] else 0
            }
        
        return {
            "matrix": matrix,
            "products": list(matrix.keys()),
            "segments": sorted(list(segments)),
            "total_products": len(matrix),
            "raw_data": data
        }