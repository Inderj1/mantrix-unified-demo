"""
Executive Insights Service for generating comprehensive business insights
"""
from typing import Dict, Any, List, Optional
import structlog
from datetime import datetime, timedelta, date
import json
from decimal import Decimal

# Custom JSON encoder to handle Decimal types
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        elif hasattr(obj, 'isoformat'):
            return obj.isoformat()
        return super().default(obj)
from src.core.llm_client import LLMClient
from src.db.postgresql_client import PostgreSQLClient
from src.core.customer_analytics_service import CustomerAnalyticsService

logger = structlog.get_logger()


class ExecutiveInsightsService:
    """Service for generating executive-level insights and recommendations"""
    
    def __init__(self):
        self.llm_client = LLMClient()
        self.pg_client = PostgreSQLClient()
        self.analytics_service = CustomerAnalyticsService()
    
    def _serialize_data(self, obj):
        """Convert Decimal and other non-serializable types to JSON-serializable format"""
        if isinstance(obj, Decimal):
            return float(obj)
        elif isinstance(obj, (datetime, date)):
            return obj.isoformat()
        elif isinstance(obj, dict):
            return {k: self._serialize_data(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._serialize_data(item) for item in obj]
        elif hasattr(obj, '__dict__'):
            # Handle custom objects
            return self._serialize_data(obj.__dict__)
        elif isinstance(obj, str):
            # Try to convert string decimals to float
            try:
                if '.' in obj and obj.replace('.', '').replace('-', '').isdigit():
                    return float(obj)
            except:
                pass
            return obj
        return obj
        
    def aggregate_all_data(self) -> Dict[str, Any]:
        """Aggregate data from all analytics sources"""
        try:
            # Get data from all sources
            dashboard_data = self.analytics_service.get_dashboard_overview()
            segment_data = self.analytics_service.get_segment_analytics()
            revenue_data = self.analytics_service.get_revenue_analytics()
            retention_data = self.analytics_service.get_retention_analytics()
            product_data = self.analytics_service.get_product_analytics()
            
            # Get additional detailed data
            financial_summary = self.pg_client.get_financial_summary()
            profitability_data = self.pg_client.get_profitability_by_segment()
            churn_risk = self.pg_client.get_churn_risk_customers(recency_threshold=180)
            top_customers = self.pg_client.get_top_customers(limit=20)
            
            # Calculate key business metrics
            total_revenue = financial_summary.get('total_revenue', 0)
            total_margin = financial_summary.get('total_margin', 0)
            margin_percentage = financial_summary.get('overall_margin_pct', 0)
            
            # Customer metrics
            total_customers = financial_summary.get('total_customers', 0)
            at_risk_revenue = sum(c['lifetime_revenue'] for c in churn_risk)
            
            # Summarize data for LLM
            aggregated_data = {
                "overview": {
                    "total_revenue": total_revenue,
                    "total_margin": total_margin,
                    "margin_percentage": margin_percentage,
                    "total_customers": total_customers,
                    "total_orders": financial_summary.get('total_orders', 0),
                    "at_risk_revenue": at_risk_revenue,
                    "at_risk_customers": len(churn_risk)
                },
                "segments": {
                    "distribution": segment_data.get('segments', []),
                    "health_scores": segment_data.get('segment_health', {})
                },
                "revenue_trends": {
                    "monthly_trend": revenue_data.get('monthly_trend', 'stable'),
                    "yoy_growth": revenue_data.get('yoy_growth', 0),
                    "seasonal_patterns": revenue_data.get('seasonal_patterns', {})
                },
                "retention": {
                    "average_retention": retention_data.get('average_retention', {}),
                    "cohort_trends": retention_data.get('cohort_trends', {})
                },
                "products": {
                    "top_performers": product_data.get('top_products', [])[:10],
                    "cross_sell_opportunities": product_data.get('cross_sell_opportunities', [])[:5]
                },
                "financial": {
                    "profitability_by_segment": profitability_data[:5] if profitability_data else []
                }
            }
            
            # Serialize to handle Decimal and date types
            return self._serialize_data(aggregated_data)
            
        except Exception as e:
            logger.error(f"Failed to aggregate data: {e}")
            raise
    
    def generate_performance_insights(self, context: Optional[str] = None) -> Dict[str, Any]:
        """Generate comprehensive performance insights for executives"""
        try:
            # Aggregate all data
            logger.info("Starting to aggregate data for performance insights")
            data = self.aggregate_all_data()
            logger.info("Data aggregation complete")
            
            # Create prompt for performance insights
            prompt = f"""You are a senior business analyst preparing an executive briefing for the CEO and CFO.
            Analyze the following comprehensive business data and provide strategic performance insights.
            
            Business Overview:
            {json.dumps(data['overview'], indent=2, cls=DecimalEncoder)}
            
            Customer Segments:
            {json.dumps(data['segments'], indent=2, cls=DecimalEncoder)}
            
            Revenue Trends:
            {json.dumps(data['revenue_trends'], indent=2, cls=DecimalEncoder)}
            
            Retention Metrics:
            {json.dumps(data['retention'], indent=2, cls=DecimalEncoder)}
            
            Product Performance:
            {json.dumps(data['products'], indent=2, cls=DecimalEncoder)}
            
            Financial Summary:
            {json.dumps(data['financial'], indent=2, cls=DecimalEncoder)}
            
            {f"Additional Context: {context}" if context else ""}
            
            Please provide a comprehensive performance analysis in the following JSON format:
            {{
                "executive_summary": {{
                    "headline": "One-line summary of business health",
                    "key_message": "2-3 sentence overview",
                    "business_health_score": "1-10 scale with justification"
                }},
                "performance_highlights": [
                    {{
                        "metric": "Revenue Growth",
                        "value": "specific number",
                        "trend": "up/down/stable",
                        "insight": "what this means for the business",
                        "action_required": true/false
                    }}
                ],
                "segment_insights": [
                    {{
                        "segment": "segment name",
                        "performance": "strong/moderate/weak",
                        "opportunity": "specific opportunity",
                        "risk": "specific risk if any"
                    }}
                ],
                "financial_insights": {{
                    "profitability_trend": "improving/stable/declining",
                    "margin_analysis": "detailed margin insights",
                    "cost_optimization_opportunities": ["opportunity 1", "opportunity 2"]
                }},
                "competitive_positioning": {{
                    "strengths": ["strength 1", "strength 2"],
                    "vulnerabilities": ["vulnerability 1", "vulnerability 2"],
                    "market_opportunities": ["opportunity 1", "opportunity 2"]
                }},
                "strategic_priorities": [
                    {{
                        "priority": "specific strategic priority",
                        "rationale": "why this matters now",
                        "expected_impact": "quantified impact",
                        "timeline": "immediate/short-term/long-term"
                    }}
                ]
            }}"""
            
            # Get insights from Claude
            response = self.llm_client.client.messages.create(
                model=self.llm_client.model,
                max_tokens=2500,
                temperature=0.3,
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )
            
            # Parse response
            try:
                insights = json.loads(response.content[0].text)
            except:
                insights = {
                    "executive_summary": {
                        "headline": "Performance Analysis in Progress",
                        "key_message": response.content[0].text[:200],
                        "business_health_score": "N/A"
                    },
                    "performance_highlights": [],
                    "segment_insights": [],
                    "financial_insights": {},
                    "competitive_positioning": {},
                    "strategic_priorities": []
                }
            
            return self._serialize_data({
                "insights": insights,
                "data_summary": data['overview'],
                "generated_at": datetime.now().isoformat(),
                "context": context
            })
            
        except Exception as e:
            logger.error(f"Failed to generate performance insights: {e}")
            raise
    
    def generate_recommendations(self, focus_area: Optional[str] = None) -> Dict[str, Any]:
        """Generate actionable recommendations for business improvement"""
        try:
            # Aggregate all data
            data = self.aggregate_all_data()
            
            # Create prompt for recommendations
            prompt = f"""You are a management consultant providing strategic recommendations to the executive team.
            Based on the following business data, provide actionable recommendations.
            
            Business Metrics:
            {json.dumps(data, indent=2, cls=DecimalEncoder)}
            
            {f"Focus Area: {focus_area}" if focus_area else ""}
            
            Provide recommendations in the following JSON format:
            {{
                "strategic_recommendations": [
                    {{
                        "title": "Clear recommendation title",
                        "category": "Revenue Growth/Cost Optimization/Customer Retention/Operational Excellence",
                        "priority": "Critical/High/Medium/Low",
                        "description": "Detailed description of the recommendation",
                        "expected_impact": {{
                            "metric": "specific metric affected",
                            "improvement": "expected improvement percentage or value",
                            "timeframe": "when impact will be realized"
                        }},
                        "implementation_steps": [
                            "Step 1: Specific action",
                            "Step 2: Specific action"
                        ],
                        "resources_required": ["resource 1", "resource 2"],
                        "risks": ["potential risk 1", "potential risk 2"],
                        "success_metrics": ["KPI 1", "KPI 2"]
                    }}
                ],
                "quick_wins": [
                    {{
                        "action": "Specific quick win action",
                        "impact": "Expected immediate impact",
                        "effort": "Low/Medium/High",
                        "timeline": "Days/Weeks"
                    }}
                ],
                "risk_mitigation": [
                    {{
                        "risk": "Identified business risk",
                        "severity": "Critical/High/Medium/Low",
                        "mitigation_strategy": "Specific mitigation approach",
                        "owner": "Suggested owner/department"
                    }}
                ],
                "investment_priorities": [
                    {{
                        "area": "Investment area",
                        "rationale": "Why invest here",
                        "expected_roi": "Expected return",
                        "investment_range": "Estimated investment needed"
                    }}
                ],
                "next_30_days": {{
                    "immediate_actions": ["Action 1", "Action 2", "Action 3"],
                    "key_decisions": ["Decision 1", "Decision 2"],
                    "metrics_to_watch": ["Metric 1", "Metric 2"]
                }}
            }}"""
            
            # Get recommendations from Claude
            response = self.llm_client.client.messages.create(
                model=self.llm_client.model,
                max_tokens=3000,
                temperature=0.4,
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )
            
            # Parse response
            try:
                recommendations = json.loads(response.content[0].text)
            except:
                recommendations = {
                    "strategic_recommendations": [],
                    "quick_wins": [],
                    "risk_mitigation": [],
                    "investment_priorities": [],
                    "next_30_days": {
                        "immediate_actions": [],
                        "key_decisions": [],
                        "metrics_to_watch": []
                    }
                }
            
            return self._serialize_data({
                "recommendations": recommendations,
                "data_context": {
                    "total_customers": data['overview']['total_customers'],
                    "at_risk_revenue": data['overview']['at_risk_revenue'],
                    "margin_percentage": data['overview']['margin_percentage']
                },
                "generated_at": datetime.now().isoformat(),
                "focus_area": focus_area
            })
            
        except Exception as e:
            logger.error(f"Failed to generate recommendations: {e}")
            raise
    
    def handle_follow_up_question(self, question: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Handle follow-up questions on insights or recommendations"""
        try:
            # Create prompt for follow-up
            prompt = f"""You are a senior business analyst answering a follow-up question from an executive.
            
            Previous Context:
            {json.dumps(context, indent=2, cls=DecimalEncoder)}
            
            Follow-up Question: {question}
            
            Provide a detailed, data-driven answer that:
            1. Directly addresses the question
            2. References specific data points
            3. Provides actionable insights
            4. Suggests next steps if applicable
            
            Format your response as JSON:
            {{
                "answer": "Detailed answer to the question",
                "supporting_data": [
                    {{"metric": "relevant metric", "value": "specific value", "context": "why this matters"}}
                ],
                "recommendations": ["If applicable, specific recommendations"],
                "additional_questions": ["Suggested follow-up questions the executive might want to explore"]
            }}"""
            
            # Get response from Claude
            response = self.llm_client.client.messages.create(
                model=self.llm_client.model,
                max_tokens=1500,
                temperature=0.3,
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )
            
            # Parse response
            try:
                answer = json.loads(response.content[0].text)
            except:
                answer = {
                    "answer": response.content[0].text,
                    "supporting_data": [],
                    "recommendations": [],
                    "additional_questions": []
                }
            
            return self._serialize_data({
                "question": question,
                "response": answer,
                "timestamp": datetime.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Failed to handle follow-up question: {e}")
            raise