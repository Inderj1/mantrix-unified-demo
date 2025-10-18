"""
Customer Analytics Service for generating insights from PostgreSQL data
"""
from typing import Dict, List, Any, Optional
import structlog
from datetime import datetime, timedelta, timezone
import json
from src.db.postgresql_client import PostgreSQLClient
from src.core.cache_manager import CacheManager
from src.config import settings

logger = structlog.get_logger()


class CustomerAnalyticsService:
    """Service for customer analytics insights and visualizations"""
    
    def __init__(self):
        self.pg_client = PostgreSQLClient()
        self.cache_manager = CacheManager(
            host=settings.redis_host,
            port=settings.redis_port,
            db=settings.redis_db,
            redis_url=settings.redis_url,
            decode_responses=settings.redis_decode_responses,
            max_connections=settings.redis_max_connections
        )
        self.cache_prefix = "analytics"
        self.cache_ttl = 300  # 5 minutes
        
    def _get_cached_or_fetch(self, cache_key: str, fetch_func, *args, **kwargs):
        """Get from cache or fetch from database"""
        # Use generic get/set methods from cache manager
        full_key = f"analytics:{cache_key}"
        cached_json = self.cache_manager.get(full_key)
        
        if cached_json:
            try:
                return json.loads(cached_json)
            except:
                pass
            
        result = fetch_func(*args, **kwargs)
        
        # Cache the result
        try:
            self.cache_manager.set(
                full_key,
                json.dumps(result, default=str),
                ttl=self.cache_ttl
            )
        except:
            # If caching fails, still return the result
            pass
        
        return result
    
    def get_dashboard_overview(self) -> Dict[str, Any]:
        """Get complete dashboard data"""
        return {
            "segments": self._get_cached_or_fetch(
                "segments_distribution",
                self.pg_client.get_customer_segments_distribution
            ),
            "revenue_trends": self._get_cached_or_fetch(
                "revenue_trends_12m",
                self.pg_client.get_revenue_trends,
                12
            ),
            "segment_performance": self._get_cached_or_fetch(
                "segment_performance",
                self.pg_client.get_segment_performance_summary
            ),
            "top_customers": self._get_cached_or_fetch(
                "top_customers_all",
                self.pg_client.get_top_customers,
                None,
                20
            ),
            "summary_metrics": self._get_cached_or_fetch(
                "summary_metrics",
                self._calculate_summary_metrics
            ),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    def _calculate_summary_metrics(self) -> Dict[str, Any]:
        """Calculate summary KPI metrics"""
        segments = self.pg_client.get_customer_segments_distribution()
        
        total_customers = sum(int(s['customer_count']) if s['customer_count'] is not None else 0 for s in segments)
        total_revenue = sum(float(s['total_revenue']) if s['total_revenue'] is not None else 0.0 for s in segments)
        
        # Get champions metrics
        champions = next((s for s in segments if s['segment'] == 'Champions'), None)
        if champions and total_revenue > 0:
            champions_revenue = float(champions['total_revenue']) if champions['total_revenue'] is not None else 0.0
            champions_revenue_pct = (champions_revenue / total_revenue * 100)
        else:
            champions_revenue_pct = 0
        
        # Get at-risk metrics
        at_risk_segments = ['At Risk', 'Lost', 'Hibernating']
        at_risk_count = sum(int(s['customer_count']) if s['customer_count'] is not None else 0 
                           for s in segments if s['segment'] in at_risk_segments)
        
        # Get growth metrics from time series
        recent_trends = self.pg_client.get_revenue_trends(3)
        if len(recent_trends) >= 2:
            current_month_revenue = sum(float(t['revenue']) if t['revenue'] is not None else 0.0 
                                      for t in recent_trends if t['month'] == recent_trends[0]['month'])
            prev_month_revenue = sum(float(t['revenue']) if t['revenue'] is not None else 0.0 
                                   for t in recent_trends if t['month'] == recent_trends[1]['month'])
            growth_rate = ((current_month_revenue - prev_month_revenue) / prev_month_revenue * 100) if prev_month_revenue > 0 else 0
        else:
            growth_rate = 0
        
        return {
            "total_customers": total_customers,
            "total_revenue": round(total_revenue, 2),
            "avg_revenue_per_customer": round(total_revenue / total_customers, 2) if total_customers > 0 else 0,
            "champions_revenue_percentage": round(champions_revenue_pct, 1),
            "at_risk_customers": at_risk_count,
            "monthly_growth_rate": round(growth_rate, 1)
        }
    
    def get_segment_analytics(self) -> Dict[str, Any]:
        """Get detailed segment analytics"""
        segments = self._get_cached_or_fetch(
            "segments_distribution",
            self.pg_client.get_customer_segments_distribution
        )
        
        # Calculate segment health scores
        for segment in segments:
            # Simple health score based on revenue contribution and customer count
            total_revenue = float(segment['total_revenue']) if segment['total_revenue'] is not None else 0.0
            customer_count = int(segment['customer_count']) if segment['customer_count'] is not None else 0
            
            revenue_score = min(total_revenue / 100000, 100)  # Normalize to 100
            customer_score = min(customer_count / 100, 100)  # Normalize to 100
            segment['health_score'] = round((revenue_score + customer_score) / 2, 1)
            
            # Segment-specific recommendations
            segment['recommendations'] = self._get_segment_recommendations(segment)
        
        return {
            "segments": segments,
            "total_segments": len(segments),
            "healthy_segments": sum(1 for s in segments if s['health_score'] > 70),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    def _get_segment_recommendations(self, segment: Dict[str, Any]) -> List[str]:
        """Generate recommendations for a segment"""
        recommendations = []
        segment_name = segment['segment']
        
        if segment_name == 'Champions':
            recommendations.append("Implement VIP loyalty program to maintain engagement")
            recommendations.append("Create exclusive product launches for this segment")
        elif segment_name == 'At Risk':
            recommendations.append("Launch win-back campaign with personalized offers")
            recommendations.append("Analyze purchase history to identify churn triggers")
        elif segment_name == 'New Customers':
            recommendations.append("Develop onboarding sequence to increase engagement")
            recommendations.append("Offer first-time buyer incentives")
        elif segment_name == 'Potential Loyalists':
            recommendations.append("Increase purchase frequency with targeted promotions")
            recommendations.append("Introduce subscription options")
        
        return recommendations
    
    def get_revenue_analytics(self) -> Dict[str, Any]:
        """Get revenue trend analytics"""
        trends = self._get_cached_or_fetch(
            "revenue_trends_24m",
            self.pg_client.get_revenue_trends,
            24
        )
        
        # Group by month for time series
        monthly_data = {}
        for trend in trends:
            key = f"{trend['year']}-{trend['month']:02d}"
            if key not in monthly_data:
                monthly_data[key] = {
                    "month": key,
                    "total_revenue": 0.0,
                    "segments": {}
                }
            # Convert to float to handle any string values
            revenue = float(trend['revenue']) if trend['revenue'] is not None else 0.0
            monthly_data[key]["total_revenue"] += revenue
            monthly_data[key]["segments"][trend['segment']] = revenue
        
        # Convert to list and sort
        time_series = list(monthly_data.values())
        time_series.sort(key=lambda x: x['month'])
        
        # Calculate trends
        if len(time_series) >= 2:
            latest_revenue = time_series[-1]['total_revenue']
            previous_revenue = time_series[-2]['total_revenue']
            trend_direction = "up" if latest_revenue > previous_revenue else "down"
            trend_percentage = abs((latest_revenue - previous_revenue) / previous_revenue * 100) if previous_revenue > 0 else 0
        else:
            trend_direction = "stable"
            trend_percentage = 0
        
        return {
            "time_series": time_series[-12:],  # Last 12 months
            "current_month_revenue": time_series[-1]['total_revenue'] if time_series else 0,
            "trend_direction": trend_direction,
            "trend_percentage": round(trend_percentage, 1),
            "peak_month": max(time_series, key=lambda x: x['total_revenue'])['month'] if time_series else None,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    def get_retention_analytics(self) -> Dict[str, Any]:
        """Get cohort retention analytics"""
        retention_data = self._get_cached_or_fetch(
            "cohort_retention",
            self.pg_client.get_cohort_retention
        )
        
        # Process retention data
        cohorts = []
        for row in retention_data:
            cohort_date = row['cohort']
            retention_rates = row['data']  # This is JSONB data
            
            # Calculate average retention
            if isinstance(retention_rates, dict):
                rates = [float(v) for v in retention_rates.values() if v is not None]
                avg_retention = sum(rates) / len(rates) if rates else 0
            else:
                avg_retention = 0
            
            cohorts.append({
                "cohort": cohort_date.strftime("%Y-%m") if hasattr(cohort_date, 'strftime') else str(cohort_date),
                "retention_data": retention_rates,
                "avg_retention": round(avg_retention, 1),
                "month_1_retention": retention_rates.get('1', 0) if isinstance(retention_rates, dict) else 0
            })
        
        # Calculate overall metrics
        avg_month_1_retention = sum(c['month_1_retention'] for c in cohorts) / len(cohorts) if cohorts else 0
        
        return {
            "cohorts": cohorts,
            "avg_month_1_retention": round(avg_month_1_retention, 1),
            "retention_trend": self._calculate_retention_trend(cohorts),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    def _calculate_retention_trend(self, cohorts: List[Dict]) -> str:
        """Calculate retention trend direction"""
        if len(cohorts) < 2:
            return "stable"
        
        recent_retention = sum(c['avg_retention'] for c in cohorts[-3:]) / 3
        older_retention = sum(c['avg_retention'] for c in cohorts[-6:-3]) / 3
        
        if recent_retention > older_retention * 1.05:
            return "improving"
        elif recent_retention < older_retention * 0.95:
            return "declining"
        else:
            return "stable"
    
    def get_product_analytics(self) -> Dict[str, Any]:
        """Get product performance analytics"""
        products = self._get_cached_or_fetch(
            "product_performance",
            self.pg_client.get_product_performance
        )
        
        # Group by segment
        segment_products = {}
        for product in products:
            segment = product['segment']
            if segment not in segment_products:
                segment_products[segment] = []
            segment_products[segment].append(product)
        
        # Find cross-sell opportunities
        cross_sell_opportunities = []
        for segment, prods in segment_products.items():
            if len(prods) >= 2:
                # Find products frequently bought together
                top_products = sorted(prods, key=lambda x: float(x['revenue']) if x['revenue'] is not None else 0.0, reverse=True)[:5]
                for i in range(len(top_products) - 1):
                    avg_rev_a = float(top_products[i]['avg_revenue']) if top_products[i]['avg_revenue'] is not None else 0.0
                    avg_rev_b = float(top_products[i + 1]['avg_revenue']) if top_products[i + 1]['avg_revenue'] is not None else 0.0
                    cross_sell_opportunities.append({
                        "product_a": top_products[i]['product'],
                        "product_b": top_products[i + 1]['product'],
                        "segment": segment,
                        "potential_revenue": round((avg_rev_a + avg_rev_b) * 0.3, 2)
                    })
        
        return {
            "top_products": products[:20],
            "products_by_segment": segment_products,
            "cross_sell_opportunities": cross_sell_opportunities[:10],
            "total_products": len(products),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    def get_ai_insights(self) -> Dict[str, Any]:
        """Generate AI-powered insights from the data"""
        # Get all necessary data
        segments = self.pg_client.get_customer_segments_distribution()
        trends = self.pg_client.get_revenue_trends(6)
        churn_risk = self._get_cached_or_fetch(
            "churn_risk_customers",
            self.pg_client.get_churn_risk_customers,
            180
        )
        
        insights = []
        
        # Segment insights
        champions = next((s for s in segments if s['segment'] == 'Champions'), None)
        if champions and float(champions['percentage']) > 30:
            insights.append({
                "type": "success",
                "title": "Strong Champions Base",
                "description": f"Champions represent {champions['percentage']}% of customers and generate ${float(champions['total_revenue']):,.0f} in revenue",
                "action": "Implement VIP program to maintain loyalty",
                "priority": "high"
            })
        
        # Churn risk insights
        if len(churn_risk) > 10:
            total_at_risk_revenue = sum(float(c['lifetime_revenue']) for c in churn_risk[:10])
            insights.append({
                "type": "warning",
                "title": "Churn Risk Alert",
                "description": f"{len(churn_risk)} high-value customers at risk, representing ${total_at_risk_revenue:,.0f} in lifetime revenue",
                "action": "Launch targeted retention campaign",
                "priority": "urgent"
            })
        
        # Growth insights
        if trends:
            recent_months = sorted(trends, key=lambda x: (x['year'], x['month']), reverse=True)[:3]
            growth_segments = {}
            for t in recent_months:
                if t['segment'] not in growth_segments:
                    growth_segments[t['segment']] = []
                growth_segments[t['segment']].append(float(t['revenue']))
            
            for segment, revenues in growth_segments.items():
                if len(revenues) >= 2 and revenues[0] > revenues[1] * 1.2:
                    insights.append({
                        "type": "info",
                        "title": f"{segment} Segment Growing",
                        "description": f"{segment} segment revenue increased by {((revenues[0] / revenues[1] - 1) * 100):.1f}%",
                        "action": "Increase inventory for this segment's preferred products",
                        "priority": "medium"
                    })
        
        return {
            "insights": insights,
            "total_insights": len(insights),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }