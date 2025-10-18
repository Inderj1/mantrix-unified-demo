"""
Executive Analytics API Routes for MargenAIDashboard
"""
from fastapi import APIRouter, HTTPException, Depends, Query, Path
from typing import Dict, Any, List, Optional
import structlog
from datetime import datetime, timedelta
from decimal import Decimal
from src.db.postgresql_client import PostgreSQLClient

logger = structlog.get_logger()  # Logger
router = APIRouter(prefix="/executive", tags=["executive"])


def get_pg_client() -> PostgreSQLClient:
    """Get PostgreSQL client instance."""
    return PostgreSQLClient()


def convert_decimals(data):
    """Convert all Decimal values to float in a nested structure, handling NaN/None values."""
    import math
    
    if isinstance(data, list):
        return [convert_decimals(item) for item in data]
    elif isinstance(data, dict):
        result = {}
        for key, value in data.items():
            if isinstance(value, Decimal):
                if value is None or str(value).lower() in ('nan', 'null', 'none'):
                    result[key] = None
                else:
                    float_val = float(str(value))
                    result[key] = None if math.isnan(float_val) else float_val
            elif isinstance(value, (dict, list)):
                result[key] = convert_decimals(value)
            elif isinstance(value, float) and math.isnan(value):
                result[key] = None
            else:
                result[key] = value
        return result
    elif isinstance(data, Decimal):
        if data is None or str(data).lower() in ('nan', 'null', 'none'):
            return None
        float_val = float(str(data))
        return None if math.isnan(float_val) else float_val
    elif isinstance(data, float) and math.isnan(data):
        return None
    else:
        return data



@router.get("/summary")
async def get_executive_summary(
    pg: PostgreSQLClient = Depends(get_pg_client)
):
    """Get executive summary with key metrics and health scores."""
    try:
        # Get financial summary
        financial_summary = convert_decimals(pg.get_financial_summary())
        
        # Get segment performance
        segment_performance = convert_decimals(pg.get_segment_performance_summary())
        
        # Get recent trends (last 3 months)
        recent_trends = convert_decimals(pg.get_financial_trends(months=3))
        
        # Calculate health scores
        current_month = recent_trends[-1] if recent_trends else {}
        prev_month = recent_trends[-2] if len(recent_trends) > 1 else {}
        
        # Revenue growth
        revenue_growth = 0
        if prev_month and prev_month.get('revenue'):
            revenue_growth = ((float(current_month.get('revenue', 0)) - float(prev_month['revenue'])) / float(prev_month['revenue'])) * 100
        
        # Margin trend
        margin_trend = current_month.get('margin_pct', 0) - prev_month.get('margin_pct', 0) if prev_month else 0
        
        # Customer health
        total_customers = financial_summary.get('total_customers', 0)
        active_customers = sum(s['customers'] for s in segment_performance if s['segment'] in ['Champions', 'Loyal Customers', 'Potential Loyalists'])
        customer_health = (float(active_customers) / float(total_customers) * 100) if total_customers > 0 else 0
        
        # Get GL account summary (mock for now, replace with actual GL query)
        gl_summary = {
            "revenue_accounts": {"41000": "Product Sales", "42000": "Service Revenue"},
            "expense_accounts": {"51000": "COGS", "60000": "Operating Expenses"},
            "asset_accounts": {"10000": "Cash", "12000": "Accounts Receivable"}
        }
        
        return {
            "kpis": {
                "revenue": financial_summary.get('total_revenue', 0),
                "gross_margin": financial_summary.get('total_margin', 0),
                "margin_percentage": financial_summary.get('overall_margin_pct', 0),
                "total_customers": total_customers,
                "total_orders": financial_summary.get('total_orders', 0),
                "avg_order_value": float(financial_summary.get('total_revenue', 0)) / float(financial_summary.get('total_orders', 1))
            },
            "health_scores": {
                "revenue_health": min(100, max(0, 50 + float(revenue_growth) * 2)),
                "margin_health": min(100, max(0, 50 + float(margin_trend) * 10)),
                "customer_health": customer_health,
                "operational_health": 75  # Mock for now
            },
            "trends": {
                "revenue_growth": revenue_growth,
                "margin_trend": margin_trend,
                "customer_growth": 5.2,  # Mock
                "market_share_change": 2.1  # Mock
            },
            "alerts": [
                {
                    "type": "warning",
                    "title": "Margin Compression in Southwest Region",
                    "description": "Gross margin decreased by 2.3% due to increased freight costs",
                    "gl_accounts": ["51200", "51300"],
                    "impact": "$125,000"
                },
                {
                    "type": "opportunity",
                    "title": "High-Value Customer Segment Growing",
                    "description": "Champions segment increased by 15% QoQ",
                    "gl_accounts": ["41000"],
                    "impact": "$450,000"
                }
            ],
            "gl_summary": gl_summary,
            "segment_distribution": segment_performance[:5]  # Top 5 segments
        }
        
    except Exception as e:
        logger.error(f"Failed to get executive summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/revenue-profitability")
async def get_revenue_profitability(
    group_by: str = Query("customer", enum=["customer", "material", "segment"]),
    time_period: str = Query("current_month", enum=["current_month", "current_quarter", "ytd", "last_year"]),
    pg: PostgreSQLClient = Depends(get_pg_client)
):
    """Get revenue and profitability analysis by different dimensions."""
    try:
        # Calculate date range based on time period
        end_date = datetime.now()
        if time_period == "current_month":
            start_date = end_date.replace(day=1)
        elif time_period == "current_quarter":
            quarter_month = ((end_date.month - 1) // 3) * 3 + 1
            start_date = end_date.replace(month=quarter_month, day=1)
        elif time_period == "ytd":
            start_date = end_date.replace(month=1, day=1)
        else:  # last_year
            start_date = end_date - timedelta(days=365)
        
        if group_by == "customer":
            # Get top customers with GL mapping
            raw_data = convert_decimals(pg.execute_query("""
                SELECT 
                    cm.customer,
                    cm.rfm_segment as segment,
                    cm.abc_combined as classification,
                    ROUND(SUM(td.net_sales)::numeric, 2) as revenue,
                    ROUND(SUM(td.gross_margin)::numeric, 2) as gross_margin,
                    ROUND(SUM(td.total_cogs)::numeric, 2) as cogs,
                    ROUND((SUM(td.gross_margin) / NULLIF(SUM(td.net_sales), 0) * 100)::numeric, 2) as margin_pct,
                    COUNT(DISTINCT td.order_number) as order_count,
                    COUNT(DISTINCT td.material_number) as product_diversity
                FROM transaction_data td
                JOIN customer_master cm ON td.customer = cm.customer
                WHERE td.posting_date BETWEEN %s AND %s
                GROUP BY cm.customer, cm.rfm_segment, cm.abc_combined
                ORDER BY revenue DESC
                LIMIT 20
            """, (start_date, end_date)))
            data = raw_data
            
        elif group_by == "material":
            # Get top products with material group mapping
            raw_data = convert_decimals(pg.execute_query("""
                SELECT 
                    td.material_number as product,
                    COUNT(DISTINCT td.customer) as customer_count,
                    ROUND(SUM(td.net_sales)::numeric, 2) as revenue,
                    ROUND(SUM(td.gross_margin)::numeric, 2) as gross_margin,
                    ROUND(SUM(td.total_cogs)::numeric, 2) as cogs,
                    ROUND((SUM(td.gross_margin) / NULLIF(SUM(td.net_sales), 0) * 100)::numeric, 2) as margin_pct,
                    ROUND(SUM(td.inv_quantity_cases)::numeric, 0) as volume,
                    ROUND(AVG(td.net_sales)::numeric, 2) as avg_order_value
                FROM transaction_data td
                WHERE td.posting_date BETWEEN %s AND %s
                GROUP BY td.material_number
                ORDER BY revenue DESC
                LIMIT 20
            """, (start_date, end_date)))
            data = raw_data
            
        else:  # segment
            # Get segment performance
            raw_data = convert_decimals(pg.execute_query("""
                SELECT 
                    cm.rfm_segment as segment,
                    COUNT(DISTINCT td.customer) as customer_count,
                    ROUND(SUM(td.net_sales)::numeric, 2) as revenue,
                    ROUND(SUM(td.gross_margin)::numeric, 2) as gross_margin,
                    ROUND(SUM(td.total_cogs)::numeric, 2) as cogs,
                    ROUND((SUM(td.gross_margin) / NULLIF(SUM(td.net_sales), 0) * 100)::numeric, 2) as margin_pct,
                    COUNT(DISTINCT td.order_number) as order_count,
                    ROUND(AVG(cm.clv_proxy)::numeric, 2) as avg_clv
                FROM transaction_data td
                JOIN customer_master cm ON td.customer = cm.customer
                WHERE td.posting_date BETWEEN %s AND %s
                GROUP BY cm.rfm_segment
                ORDER BY revenue DESC
            """, (start_date, end_date)))
            data = raw_data
        
        # Get GL account breakdown for P&L
        gl_breakdown = {
            "revenue_accounts": [
                {"account": "41000", "name": "Product Sales", "amount": sum(float(d.get('revenue', 0)) for d in data[:5]) if data else 0},
                {"account": "42000", "name": "Service Revenue", "amount": sum(float(d.get('revenue', 0)) for d in data[5:10]) if len(data) > 5 else 0}
            ],
            "cogs_accounts": [
                {"account": "51000", "name": "Direct Materials", "amount": sum(float(d.get('cogs', 0)) * 0.6 for d in data) if data else 0},
                {"account": "51100", "name": "Direct Labor", "amount": sum(float(d.get('cogs', 0)) * 0.25 for d in data) if data else 0},
                {"account": "51200", "name": "Overhead", "amount": sum(float(d.get('cogs', 0)) * 0.15 for d in data) if data else 0}
            ]
        }
        
        # Calculate waterfall data
        total_revenue = sum(float(d.get('revenue', 0)) for d in data) if data else 0
        total_cogs = sum(float(d.get('cogs', 0)) for d in data) if data else 0
        gross_profit = total_revenue - total_cogs
        
        waterfall_data = [
            {"name": "Revenue", "value": total_revenue, "type": "positive"},
            {"name": "COGS", "value": -total_cogs, "type": "negative"},
            {"name": "Gross Profit", "value": gross_profit, "type": "total"}
        ]
        
        return {
            "time_period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat(),
                "label": time_period
            },
            "data": data,
            "summary": {
                "total_revenue": total_revenue,
                "total_gross_margin": gross_profit,
                "overall_margin_pct": (float(gross_profit) / float(total_revenue) * 100) if total_revenue > 0 else 0,
                "total_records": len(data)
            },
            "gl_breakdown": gl_breakdown,
            "waterfall_data": waterfall_data
        }
        
    except Exception as e:
        logger.error(f"Failed to get revenue profitability: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cash-working-capital")
async def get_cash_working_capital(
    pg: PostgreSQLClient = Depends(get_pg_client)
):
    """Get cash flow and working capital metrics by division/cost center."""
    try:
        # Get cash flow data (using transaction data as proxy)
        monthly_cash_flow = convert_decimals(pg.execute_query("""
            SELECT 
                td.year,
                td.month,
                td.year_month,
                ROUND(SUM(td.net_sales)::numeric, 2) as cash_inflow,
                ROUND(SUM(td.total_cogs)::numeric, 2) as cash_outflow,
                ROUND((SUM(td.net_sales) - SUM(td.total_cogs))::numeric, 2) as net_cash_flow,
                COUNT(DISTINCT td.customer) as active_customers
            FROM transaction_data td
            WHERE td.posting_date >= CURRENT_DATE - INTERVAL '12 months'
            GROUP BY td.year, td.month, td.year_month
            ORDER BY td.year, td.month
        """))
        
        # Calculate working capital metrics (mock data for now)
        working_capital_data = {
            "current_assets": {
                "cash": 2500000,
                "accounts_receivable": 3200000,
                "inventory": 1800000,
                "total": 7500000
            },
            "current_liabilities": {
                "accounts_payable": 2100000,
                "accrued_expenses": 800000,
                "short_term_debt": 500000,
                "total": 3400000
            },
            "working_capital": 4100000,
            "current_ratio": 2.21
        }
        
        # Division/Cost Center breakdown (mock)
        division_metrics = [
            {
                "division": "North America",
                "cost_center": "CC-1000",
                "cash_position": 850000,
                "ar_balance": 1200000,
                "ap_balance": 600000,
                "dso": 45,
                "dpo": 38,
                "cash_conversion_cycle": 52
            },
            {
                "division": "Europe",
                "cost_center": "CC-2000",
                "cash_position": 620000,
                "ar_balance": 800000,
                "ap_balance": 400000,
                "dso": 48,
                "dpo": 35,
                "cash_conversion_cycle": 55
            },
            {
                "division": "Asia Pacific",
                "cost_center": "CC-3000",
                "cash_position": 430000,
                "ar_balance": 600000,
                "ap_balance": 350000,
                "dso": 42,
                "dpo": 40,
                "cash_conversion_cycle": 48
            }
        ]
        
        # GL account mapping for cash positions
        cash_gl_accounts = {
            "operating_cash": [
                {"account": "10100", "name": "Operating Account", "balance": 1500000},
                {"account": "10200", "name": "Payroll Account", "balance": 300000},
                {"account": "10300", "name": "Reserve Account", "balance": 700000}
            ],
            "receivables": [
                {"account": "12000", "name": "Trade Receivables", "balance": 2800000},
                {"account": "12100", "name": "Other Receivables", "balance": 400000}
            ],
            "payables": [
                {"account": "20000", "name": "Trade Payables", "balance": 1800000},
                {"account": "20100", "name": "Accrued Liabilities", "balance": 300000}
            ]
        }
        
        return {
            "cash_flow_trend": monthly_cash_flow,
            "working_capital": working_capital_data,
            "division_metrics": division_metrics,
            "gl_accounts": cash_gl_accounts,
            "key_ratios": {
                "quick_ratio": 1.58,
                "cash_ratio": 0.74,
                "operating_cash_flow_ratio": 1.12,
                "free_cash_flow": 1850000
            },
            "alerts": [
                {
                    "type": "warning",
                    "message": "DSO increased by 3 days in Europe division",
                    "impact": "€150,000 additional working capital required"
                },
                {
                    "type": "positive",
                    "message": "Cash conversion cycle improved by 5 days in APAC",
                    "impact": "$200,000 cash released"
                }
            ]
        }
        
    except Exception as e:
        logger.error(f"Failed to get cash working capital: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/growth-market-position")
async def get_growth_market_position(
    pg: PostgreSQLClient = Depends(get_pg_client)
):
    """Get growth metrics and market position analysis."""
    try:
        # Get customer acquisition and retention metrics
        cohort_data = convert_decimals(pg.get_cohort_retention())
        
        # Calculate growth metrics
        growth_metrics = convert_decimals(pg.execute_query("""
            WITH monthly_metrics AS (
                SELECT 
                    td.year,
                    td.month,
                    COUNT(DISTINCT td.customer) as customers,
                    ROUND(SUM(td.net_sales)::numeric, 2) as revenue,
                    COUNT(DISTINCT td.order_number) as orders
                FROM transaction_data td
                WHERE td.posting_date >= CURRENT_DATE - INTERVAL '24 months'
                GROUP BY td.year, td.month
                ORDER BY td.year, td.month
            ),
            growth_calc AS (
                SELECT 
                    *,
                    LAG(customers) OVER (ORDER BY year, month) as prev_customers,
                    LAG(revenue) OVER (ORDER BY year, month) as prev_revenue
                FROM monthly_metrics
            )
            SELECT 
                year,
                month,
                customers,
                revenue,
                orders,
                ROUND(((customers - prev_customers)::numeric / NULLIF(prev_customers, 0) * 100), 2) as customer_growth_pct,
                ROUND(((revenue - prev_revenue)::numeric / NULLIF(prev_revenue, 0) * 100), 2) as revenue_growth_pct
            FROM growth_calc
            WHERE prev_customers IS NOT NULL
            ORDER BY year DESC, month DESC
            LIMIT 12
        """))
        
        # Product performance by brand (using material groups as proxy)
        product_performance = convert_decimals(pg.execute_query("""
            SELECT 
                td.material_number as product_brand,
                COUNT(DISTINCT td.customer) as customer_reach,
                ROUND(SUM(td.net_sales)::numeric, 2) as revenue,
                ROUND(SUM(td.gross_margin)::numeric, 2) as gross_margin,
                ROUND((SUM(td.gross_margin) / NULLIF(SUM(td.net_sales), 0) * 100)::numeric, 2) as margin_pct,
                COUNT(DISTINCT td.order_number) as order_count,
                ROUND(SUM(td.inv_quantity_cases)::numeric, 0) as volume
            FROM transaction_data td
            WHERE td.posting_date >= CURRENT_DATE - INTERVAL '12 months'
            GROUP BY td.material_number
            ORDER BY revenue DESC
            LIMIT 10
        """))
        
        # Calculate CAC and LTV (simplified)
        total_customers = pg.get_table_count("customer_master")
        new_customers_last_year = int(total_customers * 0.3)  # Assume 30% are new
        marketing_spend = 1200000  # Mock
        cac = marketing_spend / new_customers_last_year if new_customers_last_year > 0 else 0
        
        # Get average CLV
        clv_data = convert_decimals(pg.execute_query("""
            SELECT 
                AVG(clv_proxy) as avg_clv,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY clv_proxy) as median_clv,
                PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY clv_proxy) as p75_clv
            FROM customer_master
            WHERE clv_proxy > 0
        """))
        
        avg_ltv = float(clv_data[0]['avg_clv']) if clv_data and clv_data[0]['avg_clv'] else 50000
        ltv_cac_ratio = float(avg_ltv) / float(cac) if cac > 0 else 0
        
        # Sales organization performance (mock)
        sales_org_data = [
            {
                "sales_org": "SO-1000",
                "region": "North America",
                "revenue": 8500000,
                "growth_pct": 12.5,
                "market_share": 28.5,
                "win_rate": 45.2,
                "pipeline_value": 3200000
            },
            {
                "sales_org": "SO-2000",
                "region": "Europe",
                "revenue": 6200000,
                "growth_pct": 8.3,
                "market_share": 22.1,
                "win_rate": 42.8,
                "pipeline_value": 2400000
            },
            {
                "sales_org": "SO-3000",
                "region": "Asia Pacific",
                "revenue": 4300000,
                "growth_pct": 18.7,
                "market_share": 15.3,
                "win_rate": 48.6,
                "pipeline_value": 2800000
            }
        ]
        
        return {
            "growth_metrics": growth_metrics,
            "acquisition_metrics": {
                "new_customers": new_customers_last_year,
                "cac": cac,
                "avg_ltv": avg_ltv,
                "ltv_cac_ratio": ltv_cac_ratio,
                "payback_period_months": int(float(cac) / (float(avg_ltv) / 36)) if avg_ltv > 0 else 0
            },
            "product_performance": product_performance,
            "sales_organization": sales_org_data,
            "market_position": {
                "overall_market_share": 23.5,
                "market_share_trend": 2.1,
                "competitive_wins": 145,
                "competitive_losses": 89,
                "win_rate": 62.0
            },
            "pipeline_metrics": {
                "total_pipeline": 8400000,
                "qualified_pipeline": 5200000,
                "weighted_pipeline": 3800000,
                "conversion_rate": 28.5,
                "avg_deal_size": 45000
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get growth market position: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/action-accountability")
async def get_action_accountability(
    pg: PostgreSQLClient = Depends(get_pg_client)
):
    """Get actionable insights with GL account impact and ownership."""
    try:
        # Identify value creation opportunities
        opportunities = []
        
        # 1. Margin improvement opportunities
        margin_opps = convert_decimals(pg.execute_query("""
            SELECT 
                cm.rfm_segment,
                COUNT(DISTINCT cm.customer) as customer_count,
                ROUND(AVG(cm.margin_percent)::numeric, 2) as avg_margin,
                ROUND(SUM(cm.monetary)::numeric, 2) as total_revenue
            FROM customer_master cm
            WHERE cm.margin_percent < 20
            AND cm.monetary > 10000
            GROUP BY cm.rfm_segment
            ORDER BY total_revenue DESC
            LIMIT 5
        """))
        
        for opp in margin_opps:
            opportunities.append({
                "id": f"margin-{opp['rfm_segment']}",
                "type": "margin_improvement",
                "title": f"Improve margins for {opp['rfm_segment']} segment",
                "current_value": opp['avg_margin'],
                "target_value": 25.0,
                "impact": float(str(opp['total_revenue'])) * 0.05,  # 5% improvement
                "gl_accounts": ["51000", "51100", "51200"],  # COGS accounts
                "owner": "VP Operations",
                "timeline": "Q2 2024",
                "actions": [
                    "Negotiate better supplier terms",
                    "Optimize product mix",
                    "Reduce operational waste"
                ]
            })
        
        # 2. Revenue growth opportunities
        growth_opps = convert_decimals(pg.execute_query("""
            SELECT 
                cm.customer,
                cm.rfm_segment,
                cm.monetary as current_revenue,
                cm.frequency,
                cm.recency
            FROM customer_master cm
            WHERE cm.rfm_segment IN ('Potential Loyalists', 'At Risk', 'Cant Lose Them')
            AND cm.monetary > 50000
            ORDER BY cm.monetary DESC
            LIMIT 10
        """))
        
        for opp in growth_opps[:3]:
            opportunities.append({
                "id": f"revenue-{opp['customer']}",
                "type": "revenue_growth",
                "title": f"Reactivate {opp['rfm_segment']} customer",
                "current_value": float(str(opp['current_revenue'])),
                "target_value": float(str(opp['current_revenue'])) * 1.2,
                "impact": float(str(opp['current_revenue'])) * 0.2,
                "gl_accounts": ["41000", "41100"],  # Revenue accounts
                "owner": "Sales Director",
                "timeline": "Q1 2024",
                "actions": [
                    "Personal outreach from account manager",
                    "Tailored promotion offer",
                    "Product recommendation based on history"
                ]
            })
        
        # 3. Cost reduction opportunities
        opportunities.append({
            "id": "cost-freight",
            "type": "cost_reduction",
            "title": "Optimize freight and logistics costs",
            "current_value": 850000,
            "target_value": 750000,
            "impact": 100000,
            "gl_accounts": ["61200", "61300"],  # Freight expense accounts
            "owner": "Supply Chain Manager",
            "timeline": "Q2 2024",
            "actions": [
                "Consolidate shipments",
                "Renegotiate carrier contracts",
                "Implement route optimization"
            ]
        })
        
        # Calculate scenario impacts
        scenarios = [
            {
                "name": "Conservative",
                "assumptions": {
                    "margin_improvement": 2,
                    "revenue_growth": 5,
                    "cost_reduction": 3
                },
                "impact": {
                    "revenue": 950000,
                    "margin": 380000,
                    "ebitda": 420000
                }
            },
            {
                "name": "Base Case",
                "assumptions": {
                    "margin_improvement": 3.5,
                    "revenue_growth": 8,
                    "cost_reduction": 5
                },
                "impact": {
                    "revenue": 1520000,
                    "margin": 608000,
                    "ebitda": 672000
                }
            },
            {
                "name": "Optimistic",
                "assumptions": {
                    "margin_improvement": 5,
                    "revenue_growth": 12,
                    "cost_reduction": 8
                },
                "impact": {
                    "revenue": 2280000,
                    "margin": 912000,
                    "ebitda": 1008000
                }
            }
        ]
        
        # GL impact summary
        gl_impact_summary = {
            "revenue_accounts": [
                {"account": "41000", "name": "Product Sales", "impact": 1520000},
                {"account": "42000", "name": "Service Revenue", "impact": 180000}
            ],
            "expense_accounts": [
                {"account": "51000", "name": "COGS", "impact": -380000},
                {"account": "61200", "name": "Freight", "impact": -100000},
                {"account": "62000", "name": "Operating Expenses", "impact": -150000}
            ],
            "net_impact": 1070000
        }
        
        return {
            "opportunities": opportunities,
            "scenarios": scenarios,
            "gl_impact_summary": gl_impact_summary,
            "accountability_matrix": [
                {
                    "owner": "VP Operations",
                    "opportunities_count": 5,
                    "total_impact": 580000,
                    "key_gl_accounts": ["51000", "51100", "51200", "61200"]
                },
                {
                    "owner": "Sales Director",
                    "opportunities_count": 8,
                    "total_impact": 920000,
                    "key_gl_accounts": ["41000", "41100", "42000"]
                },
                {
                    "owner": "CFO",
                    "opportunities_count": 3,
                    "total_impact": 250000,
                    "key_gl_accounts": ["62000", "63000", "70000"]
                }
            ],
            "next_steps": [
                {
                    "action": "Review and prioritize opportunities in leadership meeting",
                    "due_date": "2024-01-15",
                    "owner": "CEO"
                },
                {
                    "action": "Develop detailed implementation plans for top 5 opportunities",
                    "due_date": "2024-01-31",
                    "owner": "VP Operations"
                },
                {
                    "action": "Set up monthly tracking dashboard for GL impact",
                    "due_date": "2024-01-20",
                    "owner": "CFO"
                }
            ]
        }
        
    except Exception as e:
        logger.error(f"Failed to get action accountability: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/gl-hierarchy/{level}")
async def get_gl_hierarchy_data(
    level: str = Path(..., description="GL hierarchy level", pattern="^(L1|L2|L3)$"),
    account_group: Optional[str] = Query(None, description="Account group filter"),
    pg: PostgreSQLClient = Depends(get_pg_client)
):
    """Get GL account hierarchy data for different levels."""
    try:
        if level == "L1":
            # High-level financial metrics
            data = {
                "gross_margin": {
                    "formula": "Revenue - COGS",
                    "accounts": {
                        "revenue": ["41000", "42000"],
                        "cogs": ["51000", "51100", "51200"]
                    },
                    "current_value": 3200000,
                    "prior_value": 2950000,
                    "variance": 250000,
                    "variance_pct": 8.5
                },
                "ebitda": {
                    "formula": "Gross Margin - Operating Expenses + D&A",
                    "accounts": {
                        "opex": ["60000", "61000", "62000"],
                        "depreciation": ["71000", "71100"]
                    },
                    "current_value": 1850000,
                    "prior_value": 1720000,
                    "variance": 130000,
                    "variance_pct": 7.6
                },
                "net_income": {
                    "formula": "EBITDA - Interest - Taxes - D&A",
                    "accounts": {
                        "interest": ["80000"],
                        "taxes": ["90000"]
                    },
                    "current_value": 1250000,
                    "prior_value": 1180000,
                    "variance": 70000,
                    "variance_pct": 5.9
                }
            }
            
        elif level == "L2":
            # Sub-bucket breakdowns
            if account_group == "cogs":
                data = {
                    "components": [
                        {
                            "name": "Direct Materials",
                            "accounts": ["51000", "51010", "51020"],
                            "amount": 1800000,
                            "percentage": 60
                        },
                        {
                            "name": "Direct Labor",
                            "accounts": ["51100", "51110"],
                            "amount": 750000,
                            "percentage": 25
                        },
                        {
                            "name": "Manufacturing Overhead",
                            "accounts": ["51200", "51210", "51220"],
                            "amount": 450000,
                            "percentage": 15
                        }
                    ],
                    "total": 3000000
                }
            else:
                data = {
                    "components": [
                        {
                            "name": "Sales & Marketing",
                            "accounts": ["60000", "60100"],
                            "amount": 680000,
                            "percentage": 40
                        },
                        {
                            "name": "General & Admin",
                            "accounts": ["61000", "61100"],
                            "amount": 510000,
                            "percentage": 30
                        },
                        {
                            "name": "Operations",
                            "accounts": ["62000", "62100"],
                            "amount": 510000,
                            "percentage": 30
                        }
                    ],
                    "total": 1700000
                }
                
        else:  # L3
            # Direct GL account queries
            if account_group:
                data = convert_decimals(pg.execute_query("""
                    SELECT 
                        '51200' as gl_account,
                        'Freight Expenses' as description,
                        td.year_month,
                        ROUND(SUM(td.total_cogs * 0.05)::numeric, 2) as amount
                    FROM transaction_data td
                    WHERE td.posting_date >= CURRENT_DATE - INTERVAL '12 months'
                    GROUP BY td.year_month
                    ORDER BY td.year_month
                """))
            else:
                data = []
        
        return {
            "level": level,
            "account_group": account_group,
            "data": data
        }
        
    except Exception as e:
        logger.error(f"Failed to get GL hierarchy data: {e}")

